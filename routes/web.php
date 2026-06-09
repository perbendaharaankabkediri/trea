<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SkpdController;
use App\Http\Controllers\BendaharaController;
use App\Http\Controllers\BudController;
use App\Http\Controllers\RekonKasController;
use App\Http\Controllers\KasdaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

/*
|--------------------------------------------------------------------------
| Authenticated & Verified Dashboard Route
|--------------------------------------------------------------------------
*/
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

/*
|--------------------------------------------------------------------------
| Main Authenticated Protected Routes Group
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    
    // ================= PROFILE ROUTES =================
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ================= MASTER DATA: SKPD =================
    Route::prefix('skpd')->name('skpd.')->group(function () {
        Route::get('/', [SkpdController::class, 'index'])->name('index');
        Route::get('/create', [SkpdController::class, 'create'])->name('create');
        Route::post('/', [SkpdController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [SkpdController::class, 'edit'])->name('edit');
        Route::put('/{id}', [SkpdController::class, 'update'])->name('update');
        Route::delete('/{id}', [SkpdController::class, 'destroy'])->name('destroy');
    });

    // ================= MASTER DATA: BENDAHARA =================
    Route::prefix('bendahara')->name('bendahara.')->group(function () {
        Route::get('/', [BendaharaController::class, 'index'])->name('index');
        Route::get('/create', [BendaharaController::class, 'create'])->name('create');
        Route::post('/', [BendaharaController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [BendaharaController::class, 'edit'])->name('edit');
        Route::put('/{id}', [BendaharaController::class, 'update'])->name('update');
        Route::delete('/{id}', [BendaharaController::class, 'destroy'])->name('destroy');
    });

    // ================= MASTER DATA: BUD =================
    Route::prefix('bud')->name('bud.')->group(function () {
        Route::get('/', [BudController::class, 'index'])->name('index');
        Route::get('/create', [BudController::class, 'create'])->name('create');
        Route::post('/', [BudController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [BudController::class, 'edit'])->name('edit');
        Route::put('/{id}', [BudController::class, 'update'])->name('update');
        Route::delete('/{id}', [BudController::class, 'destroy'])->name('destroy');
    });

    // ================= ICSA: REKONSILIASI KAS =================
    Route::prefix('icsa/rekonsiliasi')->name('icsa.rekonsiliasi.')->group(function () {
        Route::get('/', [RekonKasController::class, 'index'])->name('index');
        Route::get('/create', [RekonKasController::class, 'create'])->name('create');
        Route::post('/', [RekonKasController::class, 'store'])->name('store');
        
        // Regex handler untuk nomor rekon bergaris miring (/)
        Route::get('/{no_rekon}/edit', [RekonKasController::class, 'edit'])->name('edit')->where('no_rekon', '.*');
        Route::put('/{no_rekon}', [RekonKasController::class, 'update'])->name('update')->where('no_rekon', '.*');
        Route::delete('/{no_rekon}', [RekonKasController::class, 'destroy'])->name('destroy')->where('no_rekon', '.*');
        
        // Dokumen Cetak & Excel
        Route::get('/{no_rekon}/cetak', [RekonKasController::class, 'cetak'])->name('cetak')->where('no_rekon', '.*');
        Route::get('/{no_rekon}/excel', [RekonKasController::class, 'excel'])->name('excel')->where('no_rekon', '.*');
    });

    // ================= ICSA: REKAP DATA & MONITORING =================
    Route::prefix('icsa/rekapdata')->name('icsa.')->group(function () {
        Route::get('/', [RekonKasController::class, 'rekapdata'])->name('rekapdata');
        Route::get('/export', [RekonKasController::class, 'exportExcel'])->name('rekapdata.export');
    });

    Route::get('icsa/rekapmonitoring', [RekonKasController::class, 'rekapmonitoring'])->name('icsa.rekapmonitoring');

    // ================= KASDA: IMPORT DATA =================
    Route::prefix('kasda/import')->name('kasda.import.')->group(function () {
        Route::get('/', [KasdaController::class, 'importIndex'])->name('index');
        Route::post('/saldo', [KasdaController::class, 'saveSaldoAwal'])->name('saldo');

        // BKU Pemda
        Route::get('/bku', [KasdaController::class, 'bkuForm'])->name('bku.form');
        Route::post('/bku/preview', [KasdaController::class, 'bkuPreview'])->name('bku.preview');
        Route::post('/bku/store', [KasdaController::class, 'bkuStore'])->name('bku.store');

        // Mutasi Rekening
        Route::get('/mutasi', [KasdaController::class, 'mutasiForm'])->name('mutasi.form');
        Route::post('/mutasi/preview', [KasdaController::class, 'mutasiPreview'])->name('mutasi.preview');
        Route::post('/mutasi/store', [KasdaController::class, 'mutasiStore'])->name('mutasi.store');
    });

    // ================= KASDA: MONITORING HARIAN =================
    Route::prefix('kasda/monitoring/harian')->name('kasda.monitoring.harian')->group(function () {
        Route::get('/', [KasdaController::class, 'monitoringHarian']);
        Route::post('/proses', [KasdaController::class, 'prosesMonitoringHarian'])->name('.proses');
        Route::post('/manual', [KasdaController::class, 'manualMatch'])->name('.manual');
        Route::post('/unmatch', [KasdaController::class, 'unmatchGroup'])->name('.unmatch');
        Route::post('/delete', [KasdaController::class, 'deleteRekonsiliasi'])->name('.delete');
    });

    // ================= KASDA: MONITORING BULANAN =================
    Route::get('/kasda/monitoring/bulanan', [KasdaController::class, 'monitoringBulanan'])->name('kasda.monitoring.bulanan');

    Route::prefix('kasda')->name('kasda.')->group(function () {
    
        // 1. Halaman Index (Daftar Rekon)
        Route::get('/rekonsiliasi', [KasdaController::class, 'rekonIndex'])->name('rekon.index');
        
        // 2. Halaman Form Tambah Rekon
        Route::get('/rekonsiliasi/create', [KasdaController::class, 'rekonCreate'])->name('rekon.create');
        
        // 3. Proses Simpan Data Rekon Baru
        Route::post('/rekonsiliasi', [KasdaController::class, 'rekonStore'])->name('rekon.store');
        
        // 4. Halaman Detail Berita Acara Rekon
        Route::get('/rekonsiliasi/{id}', [KasdaController::class, 'rekonShow'])->name('rekon.show');
        
        // 5. Cetak PDF Berita Acara (Membuka Tab Baru)
        Route::get('/rekonsiliasi/{id}/print', [KasdaController::class, 'rekonPrint'])->name('rekon.print');
        
        // 6. Proses Hapus Data Rekon
        Route::delete('/rekonsiliasi/{id}', [KasdaController::class, 'rekonDestroy'])->name('rekon.destroy');
        
        // 7. API Endpoint untuk mengambil saldo buku/bank akumulatif otomatis via AJAX/Fetch
        Route::get('/rekonsiliasi/api/data-periode', [KasdaController::class, 'rekonGetDataPeriode'])->name('rekon.getDataPeriode');
    });
    
});

require __DIR__.'/auth.php';