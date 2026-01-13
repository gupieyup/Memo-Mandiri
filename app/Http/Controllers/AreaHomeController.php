<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AreaHomeController extends Controller
{
    public function index(){
        return Inertia::render("AMO Area/Home/page");
    }
}
