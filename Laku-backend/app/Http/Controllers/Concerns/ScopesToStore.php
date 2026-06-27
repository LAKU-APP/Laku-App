<?php

namespace App\Http\Controllers\Concerns;

use App\Exceptions\ApiException;
use App\Models\Store;
use Illuminate\Http\Request;

trait ScopesToStore
{
    /**
     * Store milik user yang sedang login. Semua query resource (products,
     * transactions, dst.) wajib di-scope lewat ini agar data antar store
     * tidak pernah bocor (lihat docs/PRD-Backend-Laravel.md §7).
     */
    protected function storeFor(Request $request): Store
    {
        $store = $request->user()->currentStore();

        if (! $store) {
            throw new ApiException('Store tidak ditemukan untuk akun ini', 'STORE_NOT_FOUND', 404);
        }

        return $store;
    }
}
