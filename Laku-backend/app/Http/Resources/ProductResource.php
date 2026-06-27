<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'price' => $this->price,
            'costPrice' => $this->cost_price,
            'stock' => $this->stock,
            'category' => $this->category?->name,
            'image' => $this->image,
            'emoji' => $this->emoji,
            'createdAt' => $this->created_at?->toJSON(),
        ];
    }
}
