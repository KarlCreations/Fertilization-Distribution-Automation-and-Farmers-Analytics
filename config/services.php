<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'power_bi' => [
        'enabled' => (bool) env('POWER_BI_ENABLED', false),
        'tenant_id' => env('POWER_BI_TENANT_ID'),
        'client_id' => env('POWER_BI_CLIENT_ID'),
        'client_secret' => env('POWER_BI_CLIENT_SECRET'),
        'workspace_id' => env('POWER_BI_WORKSPACE_ID'),
        'report_id' => env('POWER_BI_REPORT_ID'),
        'dataset_id' => env('POWER_BI_DATASET_ID'),
    ],

];
