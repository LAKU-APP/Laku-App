<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'storeName' => $this->name,
            'storeAddress' => $this->address ?? '',
            'storePhone' => $this->phone ?? '',
            'receiptNote' => $this->receipt_note ?? '',
            'initialCash' => $this->initial_cash,
            'lowStockThreshold' => $this->low_stock_threshold,
            'notifLowStock' => $this->notif_low_stock,
            'notifTarget' => $this->notif_target,
            'currency' => $this->currency,
            'darkMode' => $this->dark_mode,
            'dailyTarget' => $this->daily_target,
        ];
    }
}
