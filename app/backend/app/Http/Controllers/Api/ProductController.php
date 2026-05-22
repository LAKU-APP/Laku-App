<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            return response()->json(Product::latest()->get());
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil data produk',
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|min:3|max:100|unique:products,name',
                'price' => 'required|integer|min:1',
                'stock' => 'required|integer|min:0',
                'emoji' => 'required|string',
                'image' => 'nullable|string',
            ], [
                'name.required' => 'Nama produk harus diisi',
                'name.min' => 'Nama produk minimal 3 karakter',
                'name.max' => 'Nama produk maksimal 100 karakter',
                'name.unique' => 'Nama produk sudah ada',
                'price.required' => 'Harga harus diisi',
                'price.min' => 'Harga harus lebih dari 0',
                'stock.required' => 'Stok harus diisi',
                'stock.min' => 'Stok tidak boleh negatif',
                'emoji.required' => 'Emoji harus dipilih',
            ]);

            $product = Product::create($validated);

            return response()->json([
                'message' => 'Produk berhasil dibuat',
                'data' => $product
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membuat produk: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $product = Product::find($id);
            if (!$product) {
                return response()->json([
                    'message' => 'Produk tidak ditemukan',
                ], 404);
            }
            return response()->json($product);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil data produk',
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|min:3|max:100|unique:products,name,' . $product->id,
                'price' => 'sometimes|integer|min:1',
                'stock' => 'sometimes|integer|min:0',
                'emoji' => 'sometimes|string',
                'image' => 'nullable|string',
            ], [
                'name.min' => 'Nama produk minimal 3 karakter',
                'name.max' => 'Nama produk maksimal 100 karakter',
                'name.unique' => 'Nama produk sudah ada',
                'price.min' => 'Harga harus lebih dari 0',
                'stock.min' => 'Stok tidak boleh negatif',
            ]);

            $product->update($validated);

            return response()->json([
                'message' => 'Produk berhasil diperbarui',
                'data' => $product
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal memperbarui produk',
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        try {
            $product->delete();

            return response()->json([
                'message' => 'Produk berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus produk',
            ], 500);
        }
    }
}
