<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ScopesToStore;
use App\Http\Controllers\Controller;
use App\Support\Finance;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    use ScopesToStore;

    public function stats(Request $request)
    {
        $store = $this->storeFor($request);
        $date = $request->query('date', Carbon::now()->toDateString());

        $todayRevenue = Finance::revenue($store, $date, $date);
        $todayExpense = Finance::expense($store, $date, $date);
        $todayProfit = Finance::profit($store, $date, $date);
        $todayTransactionCount = $store->transactions()->whereDate('created_at', $date)->count();

        $dailyTarget = $store->daily_target;
        $targetProgress = $dailyTarget > 0 ? round($todayProfit / $dailyTarget * 100, 1) : 0;

        return response()->json([
            'data' => [
                'todayRevenue' => $todayRevenue,
                'todayExpense' => $todayExpense,
                'todayProfit' => $todayProfit,
                'todayTransactionCount' => $todayTransactionCount,
                'cashOnHand' => Finance::cashOnHand($store),
                'dailyTarget' => $dailyTarget,
                'targetProgress' => $targetProgress,
                'lowStockCount' => Finance::lowStockCount($store),
            ],
        ]);
    }
}
