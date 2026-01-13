<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function login()
    {
        if (Auth::check()) {
            return redirect('/');
        } else {
            return inertia('Login');
        }
    }

    public function actionLogin(Request $request)
    {
        // Validasi input
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $credentials = [
            'email' => $request->input('email'),
            'password' => $request->input('password'),
        ];

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // Flash message sukses
            Session::flash('success', 'Login berhasil! Selamat datang.');

            // Redirect sesuai role
            if (Auth::user()->role === 'AMO Area') {
                return redirect()->route('amo-area.home');
            } elseif (Auth::user()->role === 'AMO Region') {
                return redirect()->route('amo-region.home');
            } if (Auth::user()->role === 'MO') {
                return redirect()->route('mo.review');
            } else {
                return redirect()->route('cch.review');
            }
        }

        // Jika login gagal, return dengan error
        return back()
            ->withErrors([
                'email' => 'Email atau password yang Anda masukkan salah.',
            ])
            ->withInput($request->only('email'))
            ->with('error', 'Login gagal. Silakan periksa kembali email dan password Anda.');
    }

    public function actionLogout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login')->with('info', 'Anda telah berhasil logout.');
    }
}
