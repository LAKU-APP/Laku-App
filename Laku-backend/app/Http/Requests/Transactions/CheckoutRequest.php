<?php

namespace App\Http\Requests\Transactions;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'string'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'paymentMethod' => ['sometimes', 'nullable', 'in:cash,transfer,qris'],
            'discount' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'cashPaid' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'note' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }
}
