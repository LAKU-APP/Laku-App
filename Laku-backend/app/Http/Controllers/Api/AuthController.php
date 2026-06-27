<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\Category;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /** Kategori awal toko baru — samakan dengan defaultCategories di frontend (AppContext.tsx). */
    private const DEFAULT_CATEGORIES = ['Makanan', 'Minuman', 'Sembako', 'Bumbu', 'Lainnya'];

    /**
     * Daftar akun baru. Tidak auto-login (lihat docs/API.md §0) — frontend
     * sengaja mengabaikan token dari response ini dan mengarahkan ke Login.
     */
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        if (User::where('email', $data['email'])->exists()) {
            throw new ApiException('Email sudah terdaftar', 'EMAIL_TAKEN', 409);
        }

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
            ]);

            $store = Store::create([
                'owner_id' => $user->id,
                'name' => $data['name'],
            ]);

            $store->users()->attach($user->id, ['role' => 'owner']);

            foreach (self::DEFAULT_CATEGORIES as $name) {
                Category::create(['store_id' => $store->id, 'name' => $name]);
            }

            return $user;
        });

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw new ApiException('Email atau password salah', 'INVALID_CREDENTIALS', 401);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil logout']);
    }

    /**
     * Tandai onboarding selesai. Dipanggil sekali saat user menekan "Mulai".
     */
    public function completeOnboarding(Request $request)
    {
        $user = $request->user();
        $user->update(['onboarding_completed' => true]);

        return response()->json(['user' => new UserResource($user)]);
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        if (isset($data['email']) && User::where('email', $data['email'])->whereKeyNot($user->id)->exists()) {
            throw new ApiException('Email sudah dipakai akun lain', 'EMAIL_TAKEN', 409);
        }

        if (! empty($data['phone']) && User::where('phone', $data['phone'])->whereKeyNot($user->id)->exists()) {
            throw new ApiException('Nomor HP sudah dipakai akun lain', 'PHONE_TAKEN', 409);
        }

        $user->update($data);

        return response()->json(['user' => new UserResource($user)]);
    }
}
