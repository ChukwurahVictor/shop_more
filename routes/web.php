<?php

use Illuminate\Support\Facades\Route;

// Catch all routes and serve the React SPA — client-side router handles the rest
Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '.*');
