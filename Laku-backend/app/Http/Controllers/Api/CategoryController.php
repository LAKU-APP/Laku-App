<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ScopesToStore;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ScopesToStore;

    public function index(Request $request)
    {
        $names = $this->storeFor($request)->categories()->orderBy('name')->pluck('name');

        return response()->json(['data' => $names]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => ['required', 'string', 'max:255']]);
        $store = $this->storeFor($request);

        $store->categories()->firstOrCreate(['name' => $request->input('name')]);

        $names = $store->categories()->orderBy('name')->pluck('name');

        return response()->json(['data' => $names], 201);
    }

    public function destroy(Request $request, string $name)
    {
        $this->storeFor($request)->categories()->where('name', $name)->delete();

        return response()->json(['message' => 'Kategori dihapus']);
    }
}
