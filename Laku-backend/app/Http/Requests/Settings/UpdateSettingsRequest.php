<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'storeName' => ['sometimes', 'string', 'max:255'],
            'storeAddress' => ['sometimes', 'nullable', 'string', 'max:255'],
            'storePhone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'receiptNote' => ['sometimes', 'nullable', 'string', 'max:255'],
            'initialCash' => ['sometimes', 'integer', 'min:0'],
            'lowStockThreshold' => ['sometimes', 'integer', 'min:0'],
            'notifLowStock' => ['sometimes', 'boolean'],
            'notifTarget' => ['sometimes', 'boolean'],
            'currency' => ['sometimes', 'string', 'max:8'],
            'darkMode' => ['sometimes', 'boolean'],
            'dailyTarget' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
