<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'productId' => $this->product_id,
            'productName' => $this->product_name,
            'type' => $this->type,
            'qty' => $this->qty,
            'totalPrice' => $this->total_price,
            'paymentMethod' => $this->payment_method,
            'discount' => $this->discount,
            'note' => $this->note,
            'createdAt' => $this->created_at?->toJSON(),
        ];
    }
}
