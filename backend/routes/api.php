<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

Route::options('/{any}', function () {
    return response()->json([], 200);
})->where('any', '.*');

// Основные маршруты
Route::middleware('auth:api')->group(function () {
    Route::apiResource('contacts', ContactController::class);
});