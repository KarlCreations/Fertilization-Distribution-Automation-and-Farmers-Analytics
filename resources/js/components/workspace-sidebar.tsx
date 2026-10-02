import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut, Package, Settings, Sprout, Truck, UserCog, UsersRound, WalletCards } from 'lucide-react';

import { type SharedData } from '@/types';

const workspaceLinks = [
    { label: 'Overview', icon: LayoutDashboard, routeName: 'dashboard', roles: ['executive', 'admin', 'operations_director'] },
    {
        label: 'Farmer management',
        icon: Sprout,
        routeName: 'farmer-management-dashboard',
        roles: ['subsidy', 'subsidy_staff', 'field_operations', 'field_operations_staff'],
    },
    { label: 'My inventory dashboard', icon: Package, routeName: 'inventory-dashboard', roles: ['inventory', 'inventory_staff'] },
    { label: 'My sales dashboard', icon: Truck, routeName: 'sales-dashboard', roles: ['sales', 'sales_staff'] },
    { label: 'My finance dashboard', icon: WalletCards, routeName: 'finance-dashboard', roles: ['finance', 'finance_staff'] },
    { label: 'My HR dashboard', icon: UsersRound, routeName: 'hr-dashboard', roles: ['hr', 'hr_employee'] },
    {
        label: 'Farmer registry',
        icon: Sprout,
        routeName: 'farmer-registry',
        roles: ['executive', 'admin', 'operations_director', 'subsidy', 'subsidy_staff', 'field_operations', 'field_operations_staff'],
    },
    {
        label: 'Inventory & condition',
        icon: Package,
        routeName: 'inventory-warehouses',
        roles: [
            'executive',
            'admin',
            'operations_director',
            'inventory',
            'inventory_staff',
            'subsidy',
            'subsidy_staff',
            'field_operations',
            'field_operations_staff',
            'sales',
            'sales_staff',
        ],
    },
    { label: 'Trade hub', icon: Truck, routeName: 'sales-commodities', roles: ['executive', 'admin', 'operations_director', 'sales', 'sales_staff'] },
    {
        label: 'Financials',
        icon: WalletCards,
        routeName: 'finance-impact',
        roles: ['executive', 'admin', 'operations_director', 'finance', 'finance_staff'],
    },
    {
        label: 'HR & workforce',
        icon: UsersRound,
        routeName: 'hr-workforce',
        roles: ['executive', 'admin', 'operations_director', 'hr', 'hr_employee'],
    },
    { label: 'System administration', icon: UserCog, routeName: 'system-admin', roles: ['executive', 'admin', 'operations_director'] },
    { label: 'System settings', icon: Settings, routeName: 'system-settings', roles: ['executive', 'admin', 'operations_director'] },
    {
        label: 'My settings',
        icon: Settings,
        routeName: 'employee-settings',
        roles: [
            'inventory',
            'inventory_staff',
            'sales',
            'sales_staff',
            'finance',
            'finance_staff',
            'hr',
            'hr_employee',
            'subsidy',
            'subsidy_staff',
            'field_operations',
            'field_operations_staff',
        ],
    },
];

export default function WorkspaceSidebar() {
    const { auth } = usePage<SharedData>().props;
    const visibleLinks = workspaceLinks.filter(({ roles }) => roles.includes(String(auth.user.role)));

    return (
        <aside className="hidden min-h-[calc(100vh-4rem)] border-r border-[#eaecf0] bg-white p-3 lg:block">
            <p className="px-3 pt-3 pb-2 text-[10px] font-semibold tracking-[0.12em] text-[#98a2b3] uppercase">Workspace</p>
            <nav className="grid gap-1" aria-label="Primary navigation">
                {visibleLinks.map(({ label, icon: Icon, routeName }) => {
                    const active = route().current(routeName);

                    return (
                        <Link
                            key={routeName}
                            href={route(routeName)}
                            className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium ${
                                active ? 'bg-[#eff4ff] text-[#175cd3]' : 'text-[#475467] hover:bg-[#f9fafb]'
                            }`}
                        >
                            <Icon className="size-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-7 border-t border-[#eaecf0] pt-5">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <LogOut className="size-4" />
                    Sign out
                </Link>
            </div>
        </aside>
    );
}
