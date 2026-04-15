<?php

declare(strict_types=1);

use App\Http\Controllers\AchievementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PurchaseController;
use Illuminate\Support\Facades\Route;

// Authentication routes (rate-limited to 10 attempts per minute)
Route::middleware('throttle:10,1')->group(function (): void {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login',    [AuthController::class, 'login']);
});

// Protected routes (require valid Sanctum token)
Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    Route::middleware('throttle:60,1')->group(function (): void {
        Route::get('/users/{user}/achievements',  [AchievementController::class, 'show']);
        Route::post('/users/{user}/purchases',    [PurchaseController::class, 'store']);
    });
});
