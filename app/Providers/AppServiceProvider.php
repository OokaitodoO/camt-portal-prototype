<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Http\Request;

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
        // Force HTTPS in production or when FORCE_HTTPS is true
        if (app()->environment('production') || env('FORCE_HTTPS', false)) {
            URL::forceScheme('https');
            
            // Also force the root URL to be HTTPS for complete URL generation
            $appUrl = env('APP_URL');
            if ($appUrl && str_starts_with($appUrl, 'https://')) {
                URL::forceRootUrl($appUrl);
            }
        }
        
        // Additional HTTPS forcing for Docker/proxy environments
        $this->configureProxyHeaders();
    }
    
    /**
     * Configure proper proxy header detection for HTTPS
     */
    private function configureProxyHeaders(): void
    {
        // Set trusted proxy headers for HTTPS detection
        $request = request();
        
        if ($request) {
            // Check if we're behind a proxy with HTTPS
            $httpsHeaders = [
                'HTTP_X_FORWARDED_PROTO' => 'https',
                'HTTP_X_FORWARDED_SSL' => 'on',
                'HTTP_X_FORWARDED_PORT' => '443',
                'HTTP_CF_VISITOR' => '"scheme":"https"',
                'HTTP_X_FORWARDED_SCHEME' => 'https'
            ];
            
            foreach ($httpsHeaders as $header => $value) {
                if ($request->server($header) === $value || 
                    str_contains($request->server($header, ''), $value)) {
                    URL::forceScheme('https');
                    break;
                }
            }
        }
    }
}
