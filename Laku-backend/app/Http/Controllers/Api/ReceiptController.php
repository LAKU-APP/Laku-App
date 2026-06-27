<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ScopesToStore;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReceiptResource;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    use ScopesToStore;

    public function index(Request $request)
    {
        $receipts = $this->storeFor($request)->receipts()
            ->with('items')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => ReceiptResource::collection($receipts)]);
    }
}
