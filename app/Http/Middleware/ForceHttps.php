<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Don't force HTTPS in local development unless explicitly enabled
        if (app()->environment('local') && !env('FORCE_HTTPS', false)) {
            return $next($request);
        }

        // Force HTTPS in production or when FORCE_HTTPS is true
        if (app()->environment('production') || env('FORCE_HTTPS', false)) {
            // Check if the request is not secure (not HTTPS)
            if (!$request->isSecure() && !$this->isFromTrustedProxy($request)) {
                // Redirect to HTTPS version of the same URL
                return redirect()->secure($request->getRequestUri(), 301);
            }
        }

        return $next($request);
    }

    /**
     * Check if the request is coming from a trusted proxy with HTTPS headers
     */
    private function isFromTrustedProxy(Request $request): bool
    {
        // Check common proxy headers that indicate HTTPS
        $httpsHeaders = [
            'HTTP_X_FORWARDED_PROTO' => 'https',
            'HTTP_X_FORWARDED_SSL' => 'on',
            'HTTP_X_FORWARDED_PORT' => '443',
            'HTTP_CF_VISITOR' => '{"scheme":"https"}', // Cloudflare
            'HTTP_X_FORWARDED_SCHEME' => 'https', // Some load balancers
        ];

        foreach ($httpsHeaders as $header => $value) {
            $headerValue = $request->server($header);
            if ($headerValue && (
                $headerValue === $value || 
                str_contains(strtolower($headerValue), strtolower($value))
            )) {
                return true;
            }
        }

        return false;
    }
}
