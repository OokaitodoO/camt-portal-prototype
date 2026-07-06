<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Support\Facades\Log;

class TrustProxies extends Middleware
{
    /**
     * The trusted proxies for this application.
     *
     * @var array<int, string>|string|null
     */
    protected $proxies = '*'; // Trust all proxies - adjust for production

    /**
     * The headers that should be used to detect proxies.
     *
     * @var int
     */
    protected $headers = Request::HEADER_X_FORWARDED_FOR |
                         Request::HEADER_X_FORWARDED_HOST |
                         Request::HEADER_X_FORWARDED_PORT |
                         Request::HEADER_X_FORWARDED_PROTO |
                         Request::HEADER_X_FORWARDED_AWS_ELB;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Debug logging (only in non-production)
        if (!app()->environment('production')) {
            $this->logProxyHeaders($request);
        }

        // Call parent's handle method to process proxy headers
        return parent::handle($request, $next);
    }

    /**
     * Log proxy headers for debugging
     */
    private function logProxyHeaders(Request $request): void
    {
        $proxyHeaders = [
            'X-Forwarded-For' => $request->header('X-Forwarded-For'),
            'X-Forwarded-Host' => $request->header('X-Forwarded-Host'),
            'X-Forwarded-Port' => $request->header('X-Forwarded-Port'),
            'X-Forwarded-Proto' => $request->header('X-Forwarded-Proto'),
            'X-Forwarded-Scheme' => $request->header('X-Forwarded-Scheme'),
            'CF-Visitor' => $request->header('CF-Visitor'),
            'Real-IP' => $request->ip(),
            'Secure' => $request->isSecure() ? 'Yes' : 'No',
        ];

        $activeHeaders = array_filter($proxyHeaders);
        
        if (!empty($activeHeaders)) {
            Log::debug('Proxy Headers Detected', $activeHeaders);
        }
    }
}
