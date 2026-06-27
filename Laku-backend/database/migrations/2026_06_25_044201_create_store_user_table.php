<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pivot disiapkan untuk multi-user/cashier per store (Roadmap #25).
        // Phase 1 hanya berisi satu baris "owner" per store, dibuat otomatis saat register.
        Schema::create('store_user', function (Blueprint $table) {
            $table->foreignUuid('store_id')->constrained('stores')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['owner', 'cashier'])->default('owner');
            $table->timestamps();

            $table->primary(['store_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_user');
    }
};
