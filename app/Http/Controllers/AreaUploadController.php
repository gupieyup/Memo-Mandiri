<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AreaUploadController extends Controller
{
    public function index(){
        return Inertia::render("AMO Area/Upload/page");
    }
}
