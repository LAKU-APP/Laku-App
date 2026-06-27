<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Laravel's ConvertEmptyStringsToNull middleware turns incoming "" into
     * null before it reaches the controller — these columns must accept null
     * to match validation rules that already declare them nullable.
     */
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->string('address')->nullable()->default(null)->change();
            $table->string('phone')->nullable()->default(null)->change();
            $table->string('receipt_note')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->string('address')->default('')->change();
            $table->string('phone')->default('')->change();
            $table->string('receipt_note')->default('Terima kasih telah berbelanja')->change();
        });
    }
};
