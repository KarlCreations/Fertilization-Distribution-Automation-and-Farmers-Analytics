import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardCheck,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    Package,
    Settings,
    Sprout,
    Truck,
    UserCog,
    UsersRound,
    WalletCards,
} from 'lucide-react';
import { type SharedData } from '@/types';

const workspaceLinks = [
    {
        label: 'Overview',
        icon: LayoutDashboard,
        routeName: 'dashboard',
        roles: ['executive', 'admin', 'operations_director'],
    },

    // SUBSIDY
    {
        label: 'Subsidy Dashboard',
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
        <aside className="hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-[#dce8df] bg-white p-3 lg:block">
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

