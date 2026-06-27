<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'qty' => ['required', 'integer', 'min:1'],
            'type' => ['required', 'in:IN,OUT'],
            'note' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }
}
