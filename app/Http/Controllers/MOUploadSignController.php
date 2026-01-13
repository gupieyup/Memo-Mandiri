<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class MOUploadSignController extends Controller
{
    public function index(){
        return Inertia::render("MO/Upload Sign/page");
    }
}
