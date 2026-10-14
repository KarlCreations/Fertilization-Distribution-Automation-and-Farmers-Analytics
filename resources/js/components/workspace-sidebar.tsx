import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardCheck,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    CalendarClock,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Settings,
    Sprout,
    Truck,
    UserCog,
    UserRound,
    UsersRound,
    WalletCards,
    X,
} from 'lucide-react';
import { useState } from 'react';

import WorkspaceFlash from '@/components/workspace-flash';
import { type SharedData } from '@/types';

export const workspaceLinks = [
    { label: 'Overview', icon: LayoutDashboard, routeName: 'dashboard', roles: ['executive', 'admin', 'operations_director'] },
    {
        label: 'Overview',
        icon: LayoutDashboard,
        routeName: 'dashboard',
        roles: ['executive', 'admin', 'operations_director'],
    },
    { label: 'My inventory dashboard', icon: Package, routeName: 'inventory-dashboard', roles: ['inventory', 'inventory_staff'] },
    {
        label: 'Sales dashboard',
        icon: Truck,
        routeName: 'sales-dashboard',
        roles: ['executive', 'admin', 'operations_director', 'sales', 'sales_staff'],
    },
    { label: 'My finance dashboard', icon: WalletCards, routeName: 'finance-dashboard', roles: ['finance', 'finance_staff'] },
    { label: 'My HR dashboard', icon: UsersRound, routeName: 'hr-dashboard', roles: ['hr', 'hr_employee'] },
    {
        label: 'HR & workforce',
        icon: UsersRound,
        routeName: 'hr-workforce',
        roles: ['executive', 'admin', 'operations_director', 'hr', 'hr_employee'],
    },
    { label: 'Attendance & Leave', icon: CalendarClock, routeName: 'hr-attendance-leave', roles: ['hr', 'hr_employee'] },
    { label: 'My profile', icon: UserRound, routeName: 'hr-profile', roles: ['hr', 'hr_employee'] },
    { label: 'Settings', icon: Settings, routeName: 'hr-settings', roles: ['hr', 'hr_employee'] },
    {
        label: 'Farmer registry',
        icon: Sprout,
        routeName: 'subsidy-dashboard',
        roles: ['subsidy', 'subsidy_staff'],
    },
    {
        label: 'Farmer Management',
        icon: UsersRound,
        routeName: 'farmer-registry',
        roles: ['subsidy', 'subsidy_staff'],
    },
 
    {
    label: 'Subsidy Allocations',
    icon: ClipboardList,
    routeName: 'subsidy-allocations',
    roles: ['subsidy', 'subsidy_staff'],
    },

    
    //disbursement
    {
        label: 'Disbursement Records',
        icon: ClipboardList,
        routeName: 'disbursement-records',
        roles: ['subsidy', 'subsidy_staff'],
    },

    //field operations
    {
        label: 'Field Activities',
        icon: ClipboardCheck,
        routeName: 'field-activities.index',
        roles: ['subsidy', 'subsidy_staff'],
    },


    // OPERATIONS
    {
        label: 'Operations Dashboard',
        icon: Truck,
        routeName: 'operations-dashboard',
        roles: ['field_operations', 'field_operations_staff'],
    },

    // INVENTORY
    {
        label: 'My Inventory Dashboard',
        icon: Package,
        routeName: 'inventory-dashboard',
        roles: ['inventory', 'inventory_staff'],
    },
    {
        label: 'Inventory & Condition',
        icon: Package,
        routeName: 'inventory-warehouses',
        roles: [
            'executive',
            'admin',
            'operations_director',
            'inventory',
            'inventory_staff',
        ],
    },

    // SALES
    {
        label: 'My Sales Dashboard',
        icon: Truck,
        routeName: 'sales-dashboard',
        roles: ['sales', 'sales_staff'],
    },
    {
        label: 'Trade Hub',
        icon: Truck,
        routeName: 'sales-commodities',
        roles: [
            'executive',
            'admin',
            'operations_director',
            'sales',
            'sales_staff',
        ],
    },

    // FINANCE
    {
        label: 'My Finance Dashboard',
        icon: WalletCards,
        routeName: 'finance-dashboard',
        roles: ['finance', 'finance_staff'],
    },
    {
        label: 'Financials',
        icon: WalletCards,
        routeName: 'finance-impact',
        roles: [
            'executive',
            'admin',
            'operations_director',
            'finance',
            'finance_staff',
        ],
    },

    // HR
    {
        label: 'My HR Dashboard',
        icon: UsersRound,
        routeName: 'hr-dashboard',
        roles: ['hr', 'hr_employee'],
    },
    {
        label: 'HR & Workforce',
        icon: UsersRound,
        routeName: 'hr-workforce',
        roles: [
            'executive',
            'admin',
            'operations_director',
            'hr',
            'hr_employee',
        ],
    },

    // ADMIN
    {
        label: 'System Administration',
        icon: UserCog,
        routeName: 'system-admin',
        roles: ['executive', 'admin', 'operations_director'],
    },
    {
        label: 'System Settings',
        icon: Settings,
        routeName: 'system-settings',
        roles: ['executive', 'admin', 'operations_director'],
    },

    // PERSONAL SETTINGS
    {
        label: 'My Settings',
        icon: Settings,
        routeName: 'employee-settings',
        roles: [
            'inventory',
            'inventory_staff',
            'sales',
            'sales_staff',
            'finance',
            'finance_staff',
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
        <>
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
            <WorkspaceFlash />
        </>
    );
}

export function WorkspaceMobileNavigation() {
    const { auth } = usePage<SharedData>().props;
    const [isOpen, setIsOpen] = useState(false);
    const visibleLinks = workspaceLinks.filter(({ roles }) => roles.includes(String(auth.user.role)));

    return (
        <>
            <button
                type="button"
                aria-label="Open navigation"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((open) => !open)}
                className="flex size-9 items-center justify-center rounded-md border border-[#d0d5dd] text-[#475467] lg:hidden"
            >
                <Menu className="size-4" />
            </button>
            {isOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Dismiss navigation"
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-x-0 top-16 bottom-0 z-40 bg-black/30 lg:hidden"
                    />
                    <aside className="fixed top-16 bottom-0 left-0 z-50 w-72 overflow-y-auto border-r border-[#eaecf0] bg-white p-3 shadow-xl lg:hidden">
                        <div className="mb-3 flex items-center justify-between border-b border-[#eaecf0] px-3 pb-3">
                            <span className="text-xs font-semibold tracking-wide text-[#98a2b3] uppercase">Workspace navigation</span>
                            <button
                                type="button"
                                aria-label="Close navigation"
                                onClick={() => setIsOpen(false)}
                                className="flex size-8 items-center justify-center rounded-md text-[#475467] hover:bg-[#f2f4f7]"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <nav className="grid gap-1" aria-label="Mobile primary navigation">
                            {visibleLinks.map(({ label, icon: Icon, routeName }) => (
                                <Link
                                    key={routeName}
                                    href={route(routeName)}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium ${
                                        route().current(routeName) ? 'bg-[#eff4ff] text-[#175cd3]' : 'text-[#475467] hover:bg-[#f9fafb]'
                                    }`}
                                >
                                    <Icon className="size-4" />
                                    {label}
                                </Link>
                            ))}
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                onClick={() => setIsOpen(false)}
                                className="mt-3 flex h-11 items-center gap-3 rounded-md border-t border-[#eaecf0] px-3 pt-3 text-left text-sm font-medium text-[#475467]"
                            >
                                <LogOut className="size-4" />
                                Sign out
                            </Link>
                        </nav>
                    </aside>
                </>
            )}
        </>
    );
}

