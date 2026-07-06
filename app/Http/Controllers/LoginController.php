<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function index()
    {
        return view('login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            
            // Redirect to dashboard which will handle role-based redirects
            return redirect()->intended(route('dashboard'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    public function logout(Request $request)
    {
        // Local logout
        Auth::logout();
        
        // Clear session
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // CMU OAuth logout URL
        $cmuLogoutUrl = 'https://login.microsoftonline.com/cf81f1df-de59-4c29-91da-a2dfd04aa751/oauth2/v2.0/logout';
        
        // Force HTTPS for post-logout redirect - MULTIPLE OPTIONS:
        
        // Option A: Use secure_url helper
        $postLogoutRedirect = secure_url('/');
        
        // Option B: Force HTTPS with config
        // $postLogoutRedirect = config('app.url');
        
        // Option C: Manually construct HTTPS URL
        // $postLogoutRedirect = 'https://' . $request->getHost();
        
        $logoutUrl = $cmuLogoutUrl . '?post_logout_redirect_uri=' . urlencode($postLogoutRedirect);

        // Redirect to CMU logout
        return redirect($logoutUrl);
    }
}
