<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ScopesToStore;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateSettingsRequest;
use App\Http\Resources\StoreSettingResource;
use Illuminate\Http\Request;

class StoreSettingController extends Controller
{
    use ScopesToStore;

    private const FIELD_MAP = [
        'storeName' => 'name',
        'storeAddress' => 'address',
        'storePhone' => 'phone',
        'receiptNote' => 'receipt_note',
        'initialCash' => 'initial_cash',
        'lowStockThreshold' => 'low_stock_threshold',
        'notifLowStock' => 'notif_low_stock',
        'notifTarget' => 'notif_target',
        'currency' => 'currency',
        'darkMode' => 'dark_mode',
        'dailyTarget' => 'daily_target',
    ];

    public function show(Request $request)
    {
        return response()->json(['data' => new StoreSettingResource($this->storeFor($request))]);
    }

    public function update(UpdateSettingsRequest $request)
    {
        $store = $this->storeFor($request);
        $store->update($this->mapToColumns($request->validated()));

        return response()->json(['data' => new StoreSettingResource($store)]);
    }

    public function updateTarget(Request $request)
    {
        $request->validate(['dailyTarget' => ['required', 'integer', 'min:0']]);

        $store = $this->storeFor($request);
        $store->update(['daily_target' => $request->input('dailyTarget')]);

        return response()->json(['data' => new StoreSettingResource($store)]);
    }

    private function mapToColumns(array $validated): array
    {
        $columns = [];

        foreach ($validated as $key => $value) {
            $columns[self::FIELD_MAP[$key]] = $value;
        }

        return $columns;
    }
}
