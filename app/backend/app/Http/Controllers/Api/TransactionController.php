<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TransactionController extends Controller
{
    /**
     * Get all transactions for the authenticated user
     */
    public function index(Request $request)
    {
        try {
            $transactions = Transaction::where('user_id', $request->user()->id)
                ->with('details.product')
                ->latest()
                ->get();

            return response()->json($transactions);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil data transaksi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new transaction with items
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'type' => 'required|in:IN,OUT',
                'items' => 'required|array|min:1',
                'items.*.productId' => 'required|exists:products,id',
                'items.*.qty' => 'required|integer|min:1',
                'items.*.price' => 'required|integer|min:0',
                'note' => 'nullable|string|max:500',
            ], [
                'type.required' => 'Jenis transaksi harus diisi',
                'type.in' => 'Jenis transaksi harus IN atau OUT',
                'items.required' => 'Minimal 1 item transaksi',
                'items.min' => 'Minimal 1 item transaksi',
                'items.*.productId.required' => 'Produk harus dipilih',
                'items.*.productId.exists' => 'Produk tidak ditemukan',
                'items.*.qty.required' => 'Jumlah harus diisi',
                'items.*.qty.min' => 'Jumlah minimal 1',
                'items.*.price.required' => 'Harga harus diisi',
                'items.*.price.min' => 'Harga tidak valid',
            ]);

            // Validate stock for OUT transactions
            if ($validated['type'] === 'OUT') {
                foreach ($validated['items'] as $item) {
                    $product = Product::find($item['productId']);
                    if (!$product || $product->stock < $item['qty']) {
                        return response()->json([
                            'message' => "Stok {$product->name} tidak mencukupi",
                        ], 422);
                    }
                }
            }

            // Create transaction
            $transaction = Transaction::create([
                'user_id' => $request->user()->id,
                'type' => $validated['type'],
                'grand_total' => 0,
                'note' => $validated['note'] ?? null,
            ]);

            $grandTotal = 0;

            // Create transaction details
            foreach ($validated['items'] as $item) {
                $subtotal = $item['qty'] * $item['price'];
                $grandTotal += $subtotal;

                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['productId'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'subtotal' => $subtotal,
                ]);

                // Update product stock
                $product = Product::find($item['productId']);
                if ($product) {
                    if ($validated['type'] === 'OUT') {
                        $product->stock -= $item['qty'];
                    } else {
                        $product->stock += $item['qty'];
                    }
                    $product->save();
                }
            }

            // Update transaction grand total
            $transaction->update(['grand_total' => $grandTotal]);

            return response()->json([
                'message' => 'Transaksi berhasil dibuat',
                'transaction' => $transaction->load('details.product')
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific transaction
     */
    public function show(Transaction $transaction, Request $request)
    {
        try {
            // Check if user owns this transaction
            if ($transaction->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            return response()->json($transaction->load('details.product'));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil data transaksi',
            ], 500);
        }
    }

    /**
     * Delete a transaction (only if it's recent)
     */
    public function destroy(Transaction $transaction, Request $request)
    {
        try {
            // Check if user owns this transaction
            if ($transaction->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Only allow deletion of transactions created within the last hour
            if ($transaction->created_at->diffInHours(now()) > 1) {
                return response()->json(['message' => 'Hanya bisa menghapus transaksi dalam 1 jam terakhir'], 400);
            }

            $transaction->details()->delete();
            $transaction->delete();

            return response()->json(['message' => 'Transaksi berhasil dihapus']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus transaksi',
            ], 500);
        }
    }
}
