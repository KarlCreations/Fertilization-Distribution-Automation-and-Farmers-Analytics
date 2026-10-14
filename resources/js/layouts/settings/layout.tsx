import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        url: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        url: '/settings/password',
        icon: null,
    },
    {
        title: 'Appearance',
        url: '/settings/appearance',
        icon: null,
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname;
    const { auth } = usePage<SharedData>().props;
    const dashboardByRole: Record<string, string> = {
        executive: '/dashboard',
        admin: '/dashboard',
        operations_director: '/dashboard',
        subsidy: '/farmer-management-dashboard',
        subsidy_staff: '/farmer-management-dashboard',
        field_operations: '/farmer-management-dashboard',
        field_operations_staff: '/farmer-management-dashboard',
        inventory: '/inventory-dashboard',
        inventory_staff: '/inventory-dashboard',
        sales: '/sales-dashboard',
        sales_staff: '/sales-dashboard',
        finance: '/finance-dashboard',
        finance_staff: '/finance-dashboard',
        hr: '/hr-dashboard',
        hr_employee: '/hr-dashboard',
    };
    const role = auth.user.role;
    const dashboardUrl = typeof role === 'string' ? (dashboardByRole[role] ?? '/dashboard') : '/dashboard';

    return (
        <div className="px-4 py-6">
            <Button variant="outline" size="sm" asChild className="mb-6">
                <Link href={dashboardUrl}>
                    <ArrowLeft aria-hidden="true" />
                    Back to dashboard
                </Link>
            </Button>

            <Heading title="Settings" description="Manage your profile and account settings" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={item.url}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === item.url,
                                })}
                            >
                                <Link href={item.url} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
