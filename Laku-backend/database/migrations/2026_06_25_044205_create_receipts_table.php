<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('store_id')->constrained('stores')->cascadeOnDelete();
            $table->string('store_name');
            $table->bigInteger('total');
            $table->bigInteger('discount')->nullable();
            $table->enum('payment_method', ['cash', 'transfer', 'qris'])->nullable();
            $table->bigInteger('cash_paid')->nullable();
            $table->bigInteger('change')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['store_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
