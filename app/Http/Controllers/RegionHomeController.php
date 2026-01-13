<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class RegionHomeController extends Controller
{
    public function index(){
        return Inertia::render("AMO Region/Home/page");
    }
}
