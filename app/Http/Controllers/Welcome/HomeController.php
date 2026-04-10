<?php

namespace App\Http\Controllers\Welcome;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $data = [];

        return Inertia::render('main/home', $data);
    }
}
