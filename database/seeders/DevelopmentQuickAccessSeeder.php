<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class DevelopmentQuickAccessSeeder extends Seeder
{
    /**
     * Demo credentials for the "Development quick access" buttons on the login page.
     *
     * Only shared in the local environment so real deployments never ship them.
     *
     * @return list<array{label: string, email: string, password: string}>
     */
    public static function quickAccess(): array
    {
        return [
            ['label' => 'Executive', 'email' => 'test@example.com', 'password' => 'password'],
            ['label' => 'Inventory Staff', 'email' => 'inventory.staff@example.com', 'password' => 'Inventory@12345'],
            ['label' => 'Sales Staff', 'email' => 'sales.staff@example.com', 'password' => 'Sales@12345'],
            ['label' => 'Finance Staff', 'email' => 'finance.staff@example.com', 'password' => 'Finance@12345'],
            ['label' => 'HR Employee', 'email' => 'hr.employee@example.com', 'password' => 'Hr@12345'],
            ['label' => 'Subsidy Staff', 'email' => 'subsidy.staff@example.com', 'password' => 'Subsidy@12345'],
            ['label' => 'Field Operations', 'email' => 'field.operations@example.com', 'password' => 'FieldOps@12345'],
        ];
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('Development quick-access accounts can only be seeded in local or testing environments.');
        }

        /** @var list<array{name: string, email: string, password: string, role: string}> $accounts */
        $accounts = [
            ['name' => 'Executive Demo', 'email' => 'test@example.com', 'password' => 'password', 'role' => 'executive'],
            ['name' => 'Inventory Staff Demo', 'email' => 'inventory.staff@example.com', 'password' => 'Inventory@12345', 'role' => 'inventory'],
            ['name' => 'Sales Staff Demo', 'email' => 'sales.staff@example.com', 'password' => 'Sales@12345', 'role' => 'sales'],
            ['name' => 'Finance Staff Demo', 'email' => 'finance.staff@example.com', 'password' => 'Finance@12345', 'role' => 'finance'],
            ['name' => 'HR Employee Demo', 'email' => 'hr.employee@example.com', 'password' => 'Hr@12345', 'role' => 'hr'],
            ['name' => 'Subsidy Staff Demo', 'email' => 'subsidy.staff@example.com', 'password' => 'Subsidy@12345', 'role' => 'subsidy'],
            ['name' => 'Field Operations Demo', 'email' => 'field.operations@example.com', 'password' => 'FieldOps@12345', 'role' => 'field_operations'],
        ];

        foreach ($accounts as $account) {
            User::updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => $account['password'],
                    'role' => $account['role'],
                    'email_verified_at' => now(),
                ],
            );
        }
    }
}
