<?php

namespace App\Support;

use App\Models\Store;
use Illuminate\Support\Facades\DB;

/**
 * Satu-satunya tempat rumus uang dihitung di backend — harus identik dengan
 * frontend (lib/finance.ts / utils/currency.ts), lihat docs/API.md §7.
 */
class Finance
{
    public static function revenue(Store $store, ?string $from = null, ?string $to = null): int
    {
        return (int) self::scoped($store, $from, $to)
            ->where('type', 'OUT')
            ->sum('total_price');
    }

    public static function expense(Store $store, ?string $from = null, ?string $to = null): int
    {
        return (int) self::scoped($store, $from, $to)
            ->where('type', 'IN')
            ->sum(DB::raw('ABS(total_price)'));
    }

    /** Laba kotor = harga jual − harga modal (cost_price saat ini) × qty, untuk tiap penjualan OUT. */
    public static function profit(Store $store, ?string $from = null, ?string $to = null): int
    {
        $query = $store->transactions()
            ->leftJoin('products', 'products.id', '=', 'transactions.product_id')
            ->where('transactions.type', 'OUT');

        if ($from) {
            $query->whereDate('transactions.created_at', '>=', $from);
        }

        if ($to) {
            $query->whereDate('transactions.created_at', '<=', $to);
        }

        return (int) $query->sum(DB::raw('transactions.total_price - COALESCE(products.cost_price, 0) * transactions.qty'));
    }

    public static function cashOnHand(Store $store): int
    {
        return $store->initial_cash + self::revenue($store) - self::expense($store);
    }

    public static function lowStockCount(Store $store): int
    {
        return $store->products()
            ->where('stock', '>', 0)
            ->where('stock', '<=', $store->low_stock_threshold)
            ->count();
    }

    private static function scoped(Store $store, ?string $from, ?string $to)
    {
        $query = $store->transactions();

        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        return $query;
    }
}
