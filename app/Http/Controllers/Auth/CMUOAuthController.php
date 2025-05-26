<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use App\Models\Member;

class CMUOAuthController extends Controller
{
    public function redirect()
    {
        $query = http_build_query([
            'client_id' => config('services.cmu.client_id'),
            'redirect_uri' => config('services.cmu.redirect'),
            'response_type' => 'code',
            'scope' => 'cmuitaccount.basicinfo',
        ]);

        return redirect(config('services.cmu.authorize_url') . '?' . $query);
    }

    public function callback(Request $request)
    {
        if ($request->has('error')) {
            return redirect()->route('login')->with('error', 'Authentication failed: ' . $request->error);
        }

        $response = Http::asForm()->post(config('services.cmu.token_url'), [
            'grant_type' => 'authorization_code',
            'client_id' => config('services.cmu.client_id'),
            'client_secret' => config('services.cmu.client_secret'),
            'redirect_uri' => config('services.cmu.redirect'),
            'code' => $request->code,
        ]);

        if (!$response->successful()) {
            return redirect()->route('login')->with('error', 'Failed to get access token');
        }

        $accessToken = $response->json()['access_token'];

        $userResponse = Http::withToken($accessToken)
            ->get(config('services.cmu.userinfo_url'));

        if (!$userResponse->successful()) {
            return redirect()->route('login')->with('error', 'Failed to get user information');
        }

        $userData = $userResponse->json();

        // Find or create user
        $user = Member::updateOrCreate(
            ['email' => $userData['cmuitaccount'] . '@cmu.ac.th'],
            [
                'name' => $userData['firstname_EN'] . ' ' . $userData['lastname_EN'],
                'cmu_account' => $userData['cmuitaccount'],
                'organization' => $userData['organization_name_EN'] ?? null,
            ]
        );

        Auth::login($user);

        return redirect()->route('department');
    }
} 