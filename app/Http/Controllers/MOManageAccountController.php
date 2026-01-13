<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class MOManageAccountController extends Controller
{
    public function index(){
        return Inertia::render("MO/Manage Account/page");
    }
}
