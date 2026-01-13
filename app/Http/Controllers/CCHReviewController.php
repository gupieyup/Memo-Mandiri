<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CCHReviewController extends Controller
{
    public function index(){
        return Inertia::render("CCH/Review/page");
    }
}
