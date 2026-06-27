<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Concerns\ScopesToStore;
use App\Http\Controllers\Controller;
use App\Http\Requests\Products\AdjustStockRequest;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\TransactionResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    use ScopesToStore;

    public function index(Request $request)
    {
        $products = $this->storeFor($request)->products()->orderByDesc('created_at')->get();

        return response()->json(['data' => ProductResource::collection($products)]);
    }

    public function store(StoreProductRequest $request)
    {
        $store = $this->storeFor($request);
        $data = $request->validated();

        $product = $store->products()->create([
            'name' => $data['name'],
            'price' => $data['price'],
            'cost_price' => $data['costPrice'] ?? 0,
            'stock' => $data['stock'],
            'category_id' => $this->resolveCategoryId($store->id, $data['category'] ?? null),
            'image' => $data['image'] ?? null,
        ]);

        return response()->json(['data' => new ProductResource($product)], 201);
    }

    public function update(UpdateProductRequest $request, string $product)
    {
        $store = $this->storeFor($request);
        $product = $store->products()->findOrFail($product);
        $data = $request->validated();

        $product->fill([
            'name' => $data['name'] ?? $product->name,
            'price' => $data['price'] ?? $product->price,
            'cost_price' => $data['costPrice'] ?? $product->cost_price,
            'stock' => $data['stock'] ?? $product->stock,
            'image' => $data['image'] ?? $product->image,
        ]);

        if (array_key_exists('category', $data)) {
            $product->category_id = $this->resolveCategoryId($store->id, $data['category']);
        }

        $product->save();

        return response()->json(['data' => new ProductResource($product)]);
    }

    public function destroy(Request $request, string $product)
    {
        $store = $this->storeFor($request);
        $product = $store->products()->findOrFail($product);
        $product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus']);
    }

    /**
     * Tambah/kurangi stok di luar checkout (mis. restock dari supplier atau
     * koreksi inventaris). Dikunci per-baris agar aman dari race condition.
     */
    public function adjustStock(AdjustStockRequest $request, string $product)
    {
        $store = $this->storeFor($request);
        $data = $request->validated();

        [$product, $transaction] = DB::transaction(function () use ($store, $product, $data) {
            $product = $store->products()->lockForUpdate()->findOrFail($product);

            if ($data['type'] === 'OUT' && $product->stock < $data['qty']) {
                throw new ApiException('Stok tidak cukup', 'INSUFFICIENT_STOCK', 400);
            }

            $product->stock = $data['type'] === 'IN'
                ? $product->stock + $data['qty']
                : $product->stock - $data['qty'];
            $product->save();

            // IN = pembelian restock, dicatat sebagai pengeluaran sebesar harga modal.
            // OUT manual (bukan dari checkout) = koreksi stok, tidak memengaruhi omzet.
            $totalPrice = $data['type'] === 'IN' ? -($product->cost_price * $data['qty']) : 0;

            $transaction = $store->transactions()->create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'type' => $data['type'],
                'qty' => $data['qty'],
                'total_price' => $totalPrice,
                'note' => $data['note'] ?? null,
                'created_by' => request()->user()->id,
            ]);

            return [$product, $transaction];
        });

        return response()->json([
            'data' => [
                'product' => new ProductResource($product),
                'transaction' => new TransactionResource($transaction),
            ],
        ]);
    }

    private function resolveCategoryId(string $storeId, ?string $categoryName): ?string
    {
        if (! $categoryName) {
            return null;
        }

        return Category::firstOrCreate(
            ['store_id' => $storeId, 'name' => $categoryName],
        )->id;
    }
}
