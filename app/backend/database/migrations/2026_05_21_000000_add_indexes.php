<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Index for transactions table
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('type');
            $table->index('created_at');
        });

        // Index for transaction_details table
        Schema::table('transaction_details', function (Blueprint $table) {
            $table->index('transaction_id');
            $table->index('product_id');
        });

        // Index for products table
        Schema::table('products', function (Blueprint $table) {
            $table->index('stock');
            $table->index('created_at');
        });

        // Index for users table
        Schema::table('users', function (Blueprint $table) {
            $table->index('email');
        });

        // Composite index for common queries
        Schema::table('transaction_details', function (Blueprint $table) {
            $table->index(['transaction_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['type']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('transaction_details', function (Blueprint $table) {
            $table->dropIndex(['transaction_id']);
            $table->dropIndex(['product_id']);
            $table->dropIndex(['transaction_id', 'product_id']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['stock']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['email']);
        });
    }
};
