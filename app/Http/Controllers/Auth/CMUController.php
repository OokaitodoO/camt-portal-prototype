<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Member;
use Illuminate\Support\Facades\Auth;

class CMUController extends Controller
{
    public function redirect()
    {
        $query = http_build_query([
            'client_id' => env('CMU_CLIENT_ID'),
            'redirect_uri' => env('CMU_REDIRECT_URI'),
            'response_type' => 'code',
            'scope' => 'api://cmu/Mis.Account.Read.Me.Basicinfo offline_access'
        ]);

        return redirect('https://login.microsoftonline.com/cf81f1df-de59-4c29-91da-a2dfd04aa751/oauth2/v2.0/authorize?' . $query);
    }

    public function callback(Request $request)
    {
        try {
            // Get access token
            $response = Http::asForm()->post('https://login.microsoftonline.com/cf81f1df-de59-4c29-91da-a2dfd04aa751/oauth2/v2.0/token', [
                'grant_type' => 'authorization_code',
                'client_id' => env('CMU_CLIENT_ID'),
                'client_secret' => env('CMU_CLIENT_SECRET'),
                'redirect_uri' => env('CMU_REDIRECT_URI'),
                'code' => $request->code,
            ]);

            $accessToken = $response->json()['access_token'];

            // Get user info
            $userInfo = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://api.cmu.ac.th/mis/cmuaccount/prod/v3/me/basicinfo');

            $userData = $userInfo->json();

            // Find existing member by CMU account
            $member = Member::where('cmu_account', $userData['cmuitaccount'])->first();

            if (!$member) {
                return redirect('/login')->with('error', 'No matching member found for this CMU account. Please contact administrator.');
            }

            // Update the member with CMU data
            $member->update([
                'organization_code' => $userData['organization_code'],
                'status' => $userData['itaccounttype_id'],
            ]);

            // Log the member in
            Auth::login($member);

            return redirect('/dashboard');
            
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'CMU Authentication failed: ' . $e->getMessage());
        }
    }
} 