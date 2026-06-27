<?php

namespace App\Providers;

use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Cegah brute force / credential stuffing pada login & register.
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip().'|'.$request->input('email'));
        });

        // App ini API-only, tidak ada route 'login' web — tanpa ini, request tanpa
        // header Accept: application/json akan 500 (Authenticate mencoba redirect
        // ke route 'login' yang tak ada) bukan 401 JSON yang bersih.
        Authenticate::redirectUsing(fn () => null);
    }
}
