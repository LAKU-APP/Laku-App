<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Concerns\ScopesToStore;
use App\Http\Controllers\Controller;
use App\Http\Requests\Transactions\CheckoutRequest;
use App\Http\Resources\ReceiptResource;
use App\Http\Resources\TransactionResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    use ScopesToStore;

    public function index(Request $request)
    {
        $store = $this->storeFor($request);

        $query = $store->transactions()->orderByDesc('created_at');

        if ($from = $request->query('from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $total = $query->count();

        $limit = (int) $request->query('limit', 20);
        $offset = (int) $request->query('offset', 0);
        $transactions = $query->skip($offset)->take($limit)->get();

        return response()->json([
            'data' => TransactionResource::collection($transactions),
            'total' => $total,
        ]);
    }

    /**
     * Checkout dari kasir/POS. Satu request bisa berisi banyak item; semuanya
     * jadi satu Receipt + satu Transaction (type OUT) per item, dalam satu DB
     * transaction dengan row lock supaya aman dari checkout bersamaan.
     */
    public function store(CheckoutRequest $request)
    {
        $store = $this->storeFor($request);
        $data = $request->validated();

        $result = DB::transaction(function () use ($store, $data) {
            $productIds = array_column($data['items'], 'productId');

            $products = $store->products()
                ->whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $lines = [];

            foreach ($data['items'] as $item) {
                /** @var Product|null $product */
                $product = $products->get($item['productId']);

                if (! $product) {
                    throw new ApiException('Produk tidak ditemukan', 'NOT_FOUND', 404);
                }

                if ($product->stock < $item['qty']) {
                    throw new ApiException("Stok {$product->name} tidak cukup", 'INSUFFICIENT_STOCK', 400);
                }

                $lineSubtotal = $product->price * $item['qty'];
                $subtotal += $lineSubtotal;

                $lines[] = [
                    'product' => $product,
                    'qty' => $item['qty'],
                    'subtotal' => $lineSubtotal,
                ];
            }

            $discount = min($data['discount'] ?? 0, $subtotal);
            $total = $subtotal - $discount;

            $transactions = [];
            $receiptItems = [];
            $allocated = 0;
            $lastIndex = count($lines) - 1;

            foreach ($lines as $index => $line) {
                /** @var Product $product */
                $product = $line['product'];

                // Sebar diskon proporsional per item agar Σ totalPrice transaksi
                // tetap sama dengan total struk (revenue tidak boleh meleset).
                if ($index === $lastIndex) {
                    $lineDiscount = $discount - $allocated;
                } else {
                    $lineDiscount = $subtotal > 0
                        ? intdiv($discount * $line['subtotal'], $subtotal)
                        : 0;
                    $allocated += $lineDiscount;
                }

                $lineTotal = $line['subtotal'] - $lineDiscount;

                $product->decrement('stock', $line['qty']);

                $transactions[] = $store->transactions()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'type' => 'OUT',
                    'qty' => $line['qty'],
                    'total_price' => $lineTotal,
                    'payment_method' => $data['paymentMethod'] ?? null,
                    'discount' => $lineDiscount > 0 ? $lineDiscount : null,
                    'note' => $data['note'] ?? null,
                    'created_by' => request()->user()->id,
                ]);

                $receiptItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $product->price,
                    'qty' => $line['qty'],
                ];
            }

            $cashPaid = $data['cashPaid'] ?? null;

            $receipt = $store->receipts()->create([
                'store_name' => $store->name,
                'total' => $total,
                'discount' => $discount > 0 ? $discount : null,
                'payment_method' => $data['paymentMethod'] ?? null,
                'cash_paid' => $cashPaid,
                'change' => $cashPaid !== null ? $cashPaid - $total : null,
            ]);

            $receipt->items()->createMany($receiptItems);

            return [$transactions, $receipt->load('items')];
        });

        [$transactions, $receipt] = $result;

        return response()->json([
            'data' => [
                'transactions' => TransactionResource::collection($transactions),
                'receipt' => new ReceiptResource($receipt),
            ],
        ], 201);
    }
}
