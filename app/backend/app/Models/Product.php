<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class);
    }
    protected $guarded = ['id'];
}
