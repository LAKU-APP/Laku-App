<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ScopesToStore;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class InsightController extends Controller
{
    use ScopesToStore;

    private const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    public function sales(Request $request)
    {
        $store = $this->storeFor($request);
        $period = (int) $request->query('period', 7);
        $period = in_array($period, [7, 30], true) ? $period : 7;

        $start = Carbon::now()->subDays($period - 1)->startOfDay();

        $rows = $store->transactions()
            ->selectRaw("DATE(created_at) as day,
                SUM(CASE WHEN type = 'OUT' THEN total_price ELSE 0 END) as revenue,
                SUM(CASE WHEN type = 'IN' THEN ABS(total_price) ELSE 0 END) as expense")
            ->where('created_at', '>=', $start)
            ->groupBy('day')
            ->get()
            ->keyBy(fn ($row) => Carbon::parse($row->day)->toDateString());

        $data = collect(range($period - 1, 0))->map(function ($offset) use ($rows) {
            $date = Carbon::now()->subDays($offset);
            $dateStr = $date->toDateString();
            $row = $rows->get($dateStr);

            return [
                'date' => $dateStr,
                'day' => self::DAY_NAMES[$date->dayOfWeek],
                'revenue' => (int) ($row->revenue ?? 0),
                'expense' => (int) ($row->expense ?? 0),
            ];
        })->values();

        return response()->json(['data' => $data]);
    }

    /**
     * Prakiraan restock + omzet minggu depan. Heuristik berbasis kecepatan
     * jual 7 hari terakhir (lihat docs/ROADMAP.md #9) — bukan rumus uang yang
     * wajib presisi seperti dashboard, jadi cukup estimasi yang masuk akal.
     */
    public function predictions(Request $request)
    {
        $store = $this->storeFor($request);
        $weekAgo = Carbon::now()->subDays(7)->startOfDay();
        $twoWeeksAgo = Carbon::now()->subDays(14)->startOfDay();

        $soldByProduct = $store->transactions()
            ->where('type', 'OUT')
            ->where('created_at', '>=', $weekAgo)
            ->selectRaw('product_id, SUM(qty) as qty')
            ->groupBy('product_id')
            ->pluck('qty', 'product_id');

        $restock = $store->products()
            ->orderBy('stock')
            ->get()
            ->map(function ($product) use ($soldByProduct, $store) {
                $sold = (int) ($soldByProduct[$product->id] ?? 0);
                $dailyVelocity = $sold / 7;
                $daysLeft = $dailyVelocity > 0 ? $product->stock / $dailyVelocity : null;

                $needsRestock = $product->stock === 0
                    || $product->stock <= $store->low_stock_threshold
                    || ($daysLeft !== null && $daysLeft <= 3);

                if (! $needsRestock) {
                    return null;
                }

                $urgency = $product->stock === 0 ? 'high' : (($daysLeft !== null && $daysLeft <= 3) ? 'medium' : 'low');
                $recommended = $dailyVelocity > 0
                    ? (int) ceil($dailyVelocity * 14)
                    : max($store->low_stock_threshold * 2, 10);

                return [
                    'productId' => $product->id,
                    'product' => $product->name,
                    'stock' => $product->stock,
                    'recommended' => $recommended,
                    'urgency' => $urgency,
                ];
            })
            ->filter()
            ->values();

        $recentRevenue = (int) $store->transactions()
            ->where('type', 'OUT')->where('created_at', '>=', $weekAgo)->sum('total_price');
        $priorRevenue = (int) $store->transactions()
            ->where('type', 'OUT')
            ->whereBetween('created_at', [$twoWeeksAgo, $weekAgo])
            ->sum('total_price');

        $changePct = $priorRevenue > 0
            ? max(-30, min(30, round(($recentRevenue - $priorRevenue) / $priorRevenue * 100)))
            : 0;

        $hasData = $recentRevenue > 0 || $priorRevenue > 0;
        $forecastAmount = (int) round(($recentRevenue / 7) * 7 * (1 + $changePct / 100));

        $activeDays = $store->transactions()
            ->where('type', 'OUT')
            ->where('created_at', '>=', $weekAgo)
            ->selectRaw('COUNT(DISTINCT DATE(created_at)) as days')
            ->value('days');

        $confidence = $hasData ? min(95, max(30, (int) round($activeDays / 7 * 100))) : 0;

        return response()->json([
            'data' => [
                'restock' => $restock,
                'forecast' => [
                    'amount' => $forecastAmount,
                    'changePct' => (int) $changePct,
                    'confidence' => $confidence,
                    'hasData' => $hasData,
                ],
            ],
        ]);
    }
}
