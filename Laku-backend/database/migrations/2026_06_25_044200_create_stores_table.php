<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name')->default('');
            $table->string('address')->default('');
            $table->string('phone')->default('');
            $table->string('receipt_note')->default('Terima kasih telah berbelanja');
            $table->bigInteger('initial_cash')->default(1000000);
            $table->unsignedInteger('low_stock_threshold')->default(5);
            $table->boolean('notif_low_stock')->default(true);
            $table->boolean('notif_target')->default(true);
            $table->string('currency', 8)->default('IDR');
            $table->boolean('dark_mode')->default(false);
            $table->bigInteger('daily_target')->default(300000);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
