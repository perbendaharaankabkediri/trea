<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // 1. Validasi input tahun secara ringkas
        $request->validate([
            'tahun' => 'required|integer',
        ]);

        // 2. Biarkan Laravel memproses login email & password bawaannya
        $request->authenticate();

        // 3. Regenerasi session untuk keamanan
        $request->session()->regenerate();

        // 4. SIMPAN TAHUN KE DALAM SESSION UTAMA LARAVEL 🚀
        session(['tahun' => $request->tahun]);

        // 5. Alihkan ke halaman dashboard bawaan
        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
