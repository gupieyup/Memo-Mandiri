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
        $data = [
            'email' => $request->input('email'),
            'password' => $request->input('password'),
        ];

        if (Auth::attempt($data)) {
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
        Session::flash('error', 'Email atau Password Salah');
        return back()->withErrors(['email' => 'Email atau Password Salah'])->withInput();
    }

    public function actionLogout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login')->with('info', 'Anda telah berhasil logout.');
    }
}