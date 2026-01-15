<?php

use App\Http\Controllers\AreaHomeController;
use App\Http\Controllers\AreaUploadController;
use App\Http\Controllers\CCHReviewController;
use App\Http\Controllers\CCHUploadSignController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\MOManageAccountController;
use App\Http\Controllers\MOReviewController;
use App\Http\Controllers\MOUploadSignController;
use App\Http\Controllers\RegionHomeController;
use App\Http\Controllers\RegionReviewController;
use App\Http\Controllers\RegionUploadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Guest routes (not authenticated)
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'login'])->name('login');
    Route::post('/actionLogin', [LoginController::class, 'actionLogin'])->name('actionLogin');
});

// Redirect root to appropriate dashboard based on role
Route::get('/', function () {
    if (auth()->check()) {
        $user = auth()->user();
        if ($user->role === 'AMO Area') {
            return redirect()->route('amo-area.home');
        } elseif ($user->role === 'AMO Region') {
            return redirect()->route('amo-region.home');
        } elseif ($user->role === 'MO') {
            return redirect()->route('mo.home');
        } elseif ($user->role === 'CCH') {
            return redirect()->route('cch.home');
        } 
    }
    return redirect()->route('login');
})->name('home');

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'actionLogout'])->name('logout');

    // AMO Area routes
    Route::middleware('role:AMO Area')->prefix('amo-area')->name('amo-area.')->group(function () {
        // Home
        Route::get('/home', [AreaHomeController::class, 'index'])->name('home');
        
        // Document Actions
            Route::post('/update-document/{id}', [AreaHomeController::class, 'update'])->name('update-document');
            Route::get('/download-document/{id}', [AreaHomeController::class, 'download'])->name('download-document');
            Route::get('/preview-document/{id}', [AreaHomeController::class, 'preview'])->name('preview-document');

            Route::get('/upload-document', [AreaUploadController::class, 'index'])->name('upload-document');
            Route::post('/upload-document', [AreaUploadController::class, 'store'])->name('upload-document.store');
    });

    // AMO Region routes
    Route::middleware('role:AMO Region')->prefix('amo-region')->name('amo-region.')->group(function () {
        // Home
        Route::get('/home', [RegionHomeController::class, 'index'])->name('home');
        
        // Document Actions
        Route::post('/update-document/{id}', [RegionHomeController::class, 'update'])->name('update-document');
        Route::get('/download-document/{id}', [RegionHomeController::class, 'download'])->name('download-document');
        Route::get('/preview-document/{id}', [RegionHomeController::class, 'preview'])->name('preview-document');
        
        // Upload Document
        Route::get('/upload-document', [RegionUploadController::class, 'index'])->name('upload-document');
        Route::post('/upload-document', [RegionUploadController::class, 'store'])->name('upload-document.store');
        
        // Review
        Route::get('/review', [RegionReviewController::class, 'index'])->name('review');
    });

    // MO routes
    Route::middleware('role:MO')->prefix('mo')->name('mo.')->group(function () {
        // Review
        Route::get('/review', [MOReviewController::class, 'index'])->name('review');
        
        // Upload Signa`ture
        Route::get('/upload-signature', [MOUploadSignController::class, 'index'])->name('upload-signature');
        
        // Manage Account
        Route::get('/manage-account', [MOManageAccountController::class, 'index'])->name('manage-account');
    });

    // CCH routes
    Route::middleware('role:CCH')->prefix('cch')->name('cch.')->group(function () {
        // Review
        Route::get('/review', [CCHReviewController::class, 'index'])->name('review');
        
        // Upload Signature
        Route::get('/upload-signature', [CCHUploadSignController::class, 'index'])->name('upload-signature');
        Route::get('/preview-document/{id}', [CCHUploadSignController::class, 'preview'])->name('preview-document');
        Route::post('/upload-signature', [CCHUploadSignController::class, 'store'])->name('upload-signature.store');
    });
});