<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('store_id')->constrained('stores')->cascadeOnDelete();
            $table->foreignUuid('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->bigInteger('price');
            $table->bigInteger('cost_price')->default(0);
            $table->integer('stock')->default(0);
            $table->text('image')->nullable();
            $table->string('emoji', 8)->default('📦');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['store_id', 'deleted_at']);
        });

        // Pengaman tambahan di level DB: stok tidak boleh minus, harga tidak boleh negatif.
        DB::statement('ALTER TABLE products ADD CONSTRAINT products_stock_non_negative CHECK (stock >= 0)');
        DB::statement('ALTER TABLE products ADD CONSTRAINT products_price_positive CHECK (price > 0)');
        DB::statement('ALTER TABLE products ADD CONSTRAINT products_cost_price_non_negative CHECK (cost_price >= 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
