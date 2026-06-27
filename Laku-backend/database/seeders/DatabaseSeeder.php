<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Akun "Masuk Demo" di tombol login frontend (lihat
     * src/services/auth/authService.ts DEMO_ACCOUNTS) — harus ada di backend
     * nyata supaya tombol itu tetap berfungsi setelah integrasi.
     */
    public function run(): void
    {
        if (User::where('email', 'admin@laku.id')->exists()) {
            return;
        }

        DB::transaction(function () {
            $user = User::create([
                'name' => 'Admin LAKU',
                'email' => 'admin@laku.id',
                'password' => 'admin123',
                'onboarding_completed' => true,
            ]);

            $store = Store::create([
                'owner_id' => $user->id,
                'name' => 'Admin LAKU',
            ]);

            $store->users()->attach($user->id, ['role' => 'owner']);

            foreach (['Makanan', 'Minuman', 'Sembako', 'Bumbu', 'Lainnya'] as $name) {
                Category::create(['store_id' => $store->id, 'name' => $name]);
            }
        });
    }
}
