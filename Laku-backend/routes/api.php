<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InsightController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReceiptController;
use App\Http\Controllers\Api\StoreSettingController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

// 1. Auth — lihat docs/API.md §0 untuk alur register -> login -> onboarding.
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:login');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::patch('/auth/onboarding', [AuthController::class, 'completeOnboarding']);
    Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);

    // 2. Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::patch('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    Route::patch('/products/{product}/stock', [ProductController::class, 'adjustStock']);

    // 3. Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::delete('/categories/{name}', [CategoryController::class, 'destroy']);

    // 4. Transactions
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);

    // 5. Receipts
    Route::get('/receipts', [ReceiptController::class, 'index']);

    // 6. Store Settings & Target
    Route::get('/settings', [StoreSettingController::class, 'show']);
    Route::patch('/settings', [StoreSettingController::class, 'update']);
    Route::patch('/settings/target', [StoreSettingController::class, 'updateTarget']);

    // 7. Dashboard & Insights
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/insights/sales', [InsightController::class, 'sales']);
    Route::get('/insights/predictions', [InsightController::class, 'predictions']);
});
