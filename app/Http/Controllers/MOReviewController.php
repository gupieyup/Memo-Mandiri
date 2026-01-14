<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MOReviewController extends Controller
{
    public function index(){
        $user = Auth::user();
        
        return Inertia::render("MO/Review/page", [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'role' => $user->role,
                    'area' => $user->area ? [
                        'id' => $user->area->id,
                        'name' => $user->area->name,
                    ] : null,
                ]
            ]
        ]);
    }
}
