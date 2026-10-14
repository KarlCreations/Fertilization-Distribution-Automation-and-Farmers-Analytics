<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class PowerBiService
{
    /**
     * @return array{embedUrl: string, accessToken: string, reportId: string}
     */
    public function embedConfiguration(): array
    {
        $config = config('services.power_bi');

        if (! $config['enabled'] || collect($config)->only(['tenant_id', 'client_id', 'client_secret', 'workspace_id', 'report_id'])->contains(fn ($value): bool => blank($value))) {
            throw new RuntimeException('Power BI integration is not configured.');
        }

        $oauth = Http::asForm()->post("https://login.microsoftonline.com/{$config['tenant_id']}/oauth2/v2.0/token", [
            'client_id' => $config['client_id'],
            'client_secret' => $config['client_secret'],
            'grant_type' => 'client_credentials',
            'scope' => 'https://analysis.windows.net/powerbi/api/.default',
        ])->throw()->json();

        $headers = ['Authorization' => "Bearer {$oauth['access_token']}"];
        $report = Http::withHeaders($headers)
            ->get("https://api.powerbi.com/v1.0/myorg/groups/{$config['workspace_id']}/reports/{$config['report_id']}")
            ->throw()
            ->json();

        $embedToken = Http::withHeaders($headers)
            ->post("https://api.powerbi.com/v1.0/myorg/groups/{$config['workspace_id']}/reports/{$config['report_id']}/GenerateToken", [
                'accessLevel' => 'View',
            ])
            ->throw()
            ->json();

        return [
            'embedUrl' => $report['embedUrl'],
            'accessToken' => $embedToken['token'],
            'reportId' => $report['id'],
        ];
    }
}
