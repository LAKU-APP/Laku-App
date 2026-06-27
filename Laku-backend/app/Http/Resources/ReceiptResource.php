<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'storeName' => $this->store_name,
            'createdAt' => $this->created_at?->toJSON(),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'productId' => $item->product_id,
                'productName' => $item->product_name,
                'price' => $item->price,
                'qty' => $item->qty,
            ])),
            'total' => $this->total,
            'discount' => $this->discount,
            'paymentMethod' => $this->payment_method,
            'cashPaid' => $this->cash_paid,
            'change' => $this->change,
        ];
    }
}
