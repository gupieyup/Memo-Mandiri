<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class RegionReviewController extends Controller
{
    public function index(){
        return Inertia::render("AMO Region/Review/page");
    }
}
