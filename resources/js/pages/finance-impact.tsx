import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    BadgeDollarSign,
    BarChart3,
    Bell,
    BookOpenCheck,
    BriefcaseBusiness,
    ChartNoAxesCombined,
    CircleHelp,
    Database,
    FileDown,
    FileText,
    Landmark,
    LayoutDashboard,
    Leaf,
    LogOut,
    Menu,
    Plus,
    ReceiptText,
    Search,
    Settings,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

import PowerBiReport from '@/components/power-bi-report';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import WorkspaceSidebar from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

interface QuotaRecord {
    id: string | number;
    farmer_name: string;
    commodity_name: string;
    cycle_name: string;
    fiscal_period: string | null;
    zone_name: string | null;
    allocated_qty: string | number;
    disbursed_qty: string | number;
}

interface TradeContract {
    id: string | number;
    contract_ref: string;
    contract_type: string;
    status: string;
    volume_mt: string | number | null;
    price_per_mt: string | number | null;
    counterparty: string | null;
    commodity_name: string;
    contract_value: number;
}

interface FinanceAuditEvent {
    id: string | number;
    action: string;
    target_type: string | null;
    target_id: string | null;
    payload: string | null;
    created_at: string;
    user_name: string | null;
}

interface FinanceImpactProps {
    metrics: {
        contractValue: number;
        activeContracts: number;
        allocatedMt: number;
        disbursedMt: number;
        remainingMt: number;
    };
    quotaLedger: QuotaRecord[];
    tradeContracts: TradeContract[];
    financeAuditEvents: FinanceAuditEvent[];
}

interface DisbursementForm {
    quantity: string;
    [key: string]: string;
}

type ContractFilter = 'All contracts' | 'Active' | 'Draft';

const financeMetrics = [
    { label: 'Recorded trade value', key: 'contractValue', icon: Landmark, tone: 'bg-[#eff8ff] text-[#175cd3]' },
    { label: 'Active trade contracts', key: 'activeContracts', icon: BriefcaseBusiness, tone: 'bg-[#f4f3ff] text-[#6938ef]' },
    { label: 'Quota allocated (MT)', key: 'allocatedMt', icon: WalletCards, tone: 'bg-[#ecfdf3] text-[#067647]' },
    { label: 'Quota disbursed (MT)', key: 'disbursedMt', icon: ReceiptText, tone: 'bg-[#fffaeb] text-[#b54708]' },
] as const;

const formatNumber = (amount: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount);

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
    const escapeCsvValue = (value: string | number) => {
        const text = String(value);
        const safeText = /^[\t\r =+\-@]/.test(text) ? `'${text}` : text;

        return `"${safeText.replaceAll('"', '""')}"`;
    };
    const contents = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\r\n');
    const downloadUrl = URL.createObjectURL(new Blob([contents], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');

    anchor.href = downloadUrl;
    anchor.download = filename;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

function Panel({
    title,
    icon: Icon,
    children,
    className = '',
}: {
    title: string;
    icon: typeof Landmark;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={`rounded-lg border border-[#eaecf0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}>
            <div className="flex items-center gap-2 p-5 text-sm font-semibold text-[#101828]">
                <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                    <Icon className="size-4" />
                </span>
                {title}
            </div>
            {children}
        </section>
    );
}

function EmptyState({ title, description, className = '' }: { title: string; description: string; className?: string }) {
    return (
        <div
            className={`flex flex-col items-center justify-center rounded-md border border-dashed border-[#d0d5dd] bg-[#fbfcfe] px-5 text-center ${className}`}
        >
            <div className="size-2 rounded-full bg-[#b2ddff]" />
            <p className="mt-3 text-sm font-medium text-[#475467]">{title}</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-[#98a2b3]">{description}</p>
        </div>
    );
}

function Navigation({ onNavigate }: { onNavigate: () => void }) {
    const { auth } = usePage<SharedData>().props;
    const role = String(auth.user.role);
    const homeRoute = role === 'finance' || role === 'finance_staff' ? 'finance-dashboard' : 'dashboard';
    const canManageSystem = ['executive', 'admin', 'operations_director'].includes(role);

    return (
        <aside className="fixed inset-y-16 left-0 z-30 w-64 border-r border-[#eaecf0] bg-white p-3 shadow-lg lg:hidden">
            <p className="px-3 pt-3 pb-2 text-[10px] font-semibold tracking-[0.12em] text-[#98a2b3] uppercase">Workspace</p>
            <nav className="grid gap-1" aria-label="Primary navigation">
                <Link
                    href={route(homeRoute)}
                    onClick={onNavigate}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <LayoutDashboard className="size-4" />
                    My dashboard
                </Link>
                <Link
                    href={route('finance-impact')}
                    onClick={onNavigate}
                    className="flex h-10 items-center gap-3 rounded-md bg-[#eff4ff] px-3 text-sm font-medium text-[#175cd3]"
                >
                    <WalletCards className="size-4" />
                    Finance & impact
                </Link>
            </nav>
            <div className="mt-7 border-t border-[#eaecf0] pt-5">
                {canManageSystem && (
                    <Link
                        href={route('system-settings')}
                        onClick={onNavigate}
                        className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                    >
                        <Settings className="size-4" />
                        System settings
                    </Link>
                )}
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    onClick={onNavigate}
                    className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <LogOut className="size-4" />
                    Sign out
                </Link>
            </div>
        </aside>
    );
}

export default function FinanceImpact({ metrics, quotaLedger, tradeContracts, financeAuditEvents }: FinanceImpactProps) {
    const { auth } = usePage<SharedData>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [zoneFilter, setZoneFilter] = useState('All zones');
    const [cycleFilter, setCycleFilter] = useState('All cycles');
    const [contractFilter, setContractFilter] = useState<ContractFilter>('All contracts');
    const [isDisbursementDialogOpen, setIsDisbursementDialogOpen] = useState(false);
    const [selectedQuotaId, setSelectedQuotaId] = useState<string | number | null>(null);
    const [notice, setNotice] = useState('');
    const disbursementForm = useForm<DisbursementForm>({ quantity: '' });
    const filteredQuotas = useMemo(
        () =>
            quotaLedger.filter((quota) => {
                const matchesSearch = `${quota.farmer_name} ${quota.commodity_name} ${quota.cycle_name} ${quota.zone_name ?? ''}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

                return (
                    matchesSearch &&
                    (zoneFilter === 'All zones' || quota.zone_name === zoneFilter) &&
                    (cycleFilter === 'All cycles' || quota.cycle_name === cycleFilter)
                );
            }),
        [cycleFilter, quotaLedger, searchTerm, zoneFilter],
    );
    const filteredContracts = useMemo(
        () =>
            tradeContracts.filter((contract) => {
                const matchesSearch = `${contract.contract_ref} ${contract.counterparty ?? ''} ${contract.commodity_name}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
                const matchesStatus = contractFilter === 'All contracts' || contract.status.toLowerCase() === contractFilter.toLowerCase();

                return matchesSearch && matchesStatus;
            }),
        [contractFilter, searchTerm, tradeContracts],
    );
    const selectedQuota = quotaLedger.find((quota) => quota.id === selectedQuotaId);
    const remainingQuota = selectedQuota ? Number(selectedQuota.allocated_qty) - Number(selectedQuota.disbursed_qty) : 0;
    const disbursementRate = metrics.allocatedMt > 0 ? Math.min(100, (metrics.disbursedMt / metrics.allocatedMt) * 100) : 0;

    const exportQuotaStatements = (filename: string) => {
        downloadCsv(
            filename,
            ['Farmer', 'Commodity', 'Subsidy cycle', 'Zone', 'Allocated (MT)', 'Disbursed (MT)', 'Remaining (MT)'],
            quotaLedger.map((quota) => [
                quota.farmer_name,
                quota.commodity_name,
                quota.fiscal_period || quota.cycle_name,
                quota.zone_name || '',
                quota.allocated_qty,
                quota.disbursed_qty,
                Number(quota.allocated_qty) - Number(quota.disbursed_qty),
            ]),
        );
    };

    const exportAuditTrail = () => {
        downloadCsv(
            'finance-audit-trail.csv',
            ['Action', 'Target type', 'Target ID', 'User', 'Payload', 'Timestamp'],
            financeAuditEvents.map((event) => [
                event.action,
                event.target_type ?? '',
                event.target_id ?? '',
                event.user_name ?? '',
                event.payload ?? '',
                event.created_at,
            ]),
        );
    };

    const openDisbursementDialog = (quotaId?: string | number) => {
        const quota = quotaId
            ? quotaLedger.find((item) => item.id === quotaId)
            : quotaLedger.find((item) => Number(item.allocated_qty) > Number(item.disbursed_qty));

        if (!quota) {
            setNotice('There are no quota records with an undistributed allocation.');
            return;
        }

        setSelectedQuotaId(quota.id);
        disbursementForm.reset();
        disbursementForm.clearErrors();
        setIsDisbursementDialogOpen(true);
    };

    const recordDisbursement = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedQuota) {
            return;
        }

        disbursementForm.post(route('finance-disbursements.store', { quotaId: selectedQuota.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDisbursementDialogOpen(false);
                setNotice('Disbursement quantity recorded in the ERP quota ledger.');
                disbursementForm.reset();
            },
        });
    };

    return (
        <>
            <Head title="Finance & impact" />
            <div className="min-h-screen bg-[#f6f8fb] text-[#101828]">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#eaecf0] bg-white px-4 sm:px-6">
                    <button
                        type="button"
                        aria-label="Open navigation"
                        aria-expanded={isMobileNavigationOpen}
                        onClick={() => setIsMobileNavigationOpen((isOpen) => !isOpen)}
                        className="flex size-9 items-center justify-center rounded-md border border-[#d0d5dd] text-[#475467] lg:hidden"
                    >
                        <Menu className="size-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-md bg-[#0b6b4f] text-white">
                            <Leaf className="size-4" />
                        </span>
                        <span className="font-semibold">{systemName}</span>
                    </div>
                    <label className="relative mx-auto hidden max-w-md flex-1 md:block">
                        <span className="sr-only">Search finance workspace</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            placeholder="Search quotas, contracts, farmers, or counterparties"
                        />
                    </label>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Notifications"
                            onClick={() =>
                                setNotice(
                                    `${financeAuditEvents.length} finance audit event(s) are recorded. ${tradeContracts.filter((contract) => contract.status.toLowerCase() === 'draft').length} trade contract(s) are currently drafts.`,
                                )
                            }
                            className="relative flex size-9 items-center justify-center rounded-md text-[#475467] hover:bg-[#f2f4f7]"
                        >
                            <Bell className="size-4" />
                            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[#d92d20]" />
                        </button>
                        <button
                            type="button"
                            aria-label="Help"
                            onClick={() =>
                                setNotice(
                                    'Figures come from ERP trade contracts and fertilizer quota records. Trade value has no currency assigned in the source data.',
                                )
                            }
                            className="hidden size-9 items-center justify-center rounded-md text-[#475467] hover:bg-[#f2f4f7] sm:flex"
                        >
                            <CircleHelp className="size-4" />
                        </button>
                        <div className="flex size-8 items-center justify-center rounded-full bg-[#d1fadf] text-xs font-semibold text-[#067647]">
                            {auth.user.name.slice(0, 2).toUpperCase()}
                        </div>
                    </div>
                </header>
                {isMobileNavigationOpen && (
                    <>
                        <button
                            type="button"
                            aria-label="Close navigation"
                            onClick={() => setIsMobileNavigationOpen(false)}
                            className="fixed inset-x-0 top-16 bottom-0 z-20 bg-[#101828]/20 lg:hidden"
                        />
                        <Navigation onNavigate={() => setIsMobileNavigationOpen(false)} />
                    </>
                )}
                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />
                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        <div className="mb-4">
                            <PowerBiReport title="Finance analytics" />
                        </div>
                        <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <div className="mb-2 flex gap-2 text-xs font-medium text-[#667085]">
                                    <span>Enterprise</span>
                                    <span>/</span>
                                    <span className="text-[#175cd3]">Finance & impact</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Finance, treasury & economic impact</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                                    Review contracted trade value and fertilizer quota allocations recorded in the ERP.
                                </p>
                                <p className="mt-2 inline-flex rounded-full bg-[#eff8ff] px-2.5 py-1 text-xs font-medium text-[#175cd3]">
                                    Live ERP data · trade value currency is not specified in the source
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={exportAuditTrail}
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <FileDown className="size-4" />
                                    Export audit trail
                                </button>
                                <button
                                    type="button"
                                    onClick={() => exportQuotaStatements('finance-quota-statement.csv')}
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <FileText className="size-4" />
                                    Statements
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openDisbursementDialog()}
                                    className="flex h-9 items-center gap-2 rounded-md bg-[#175cd3] px-3 text-sm font-semibold text-white hover:bg-[#1849a9]"
                                >
                                    <Plus className="size-4" />
                                    Record disbursement
                                </button>
                            </div>
                        </div>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Financial metrics">
                            {financeMetrics.map(({ label, key, icon: Icon, tone }) => (
                                <article
                                    key={label}
                                    className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-medium text-[#475467]">{label}</p>
                                        <span className={`flex size-9 items-center justify-center rounded-md ${tone}`}>
                                            <Icon className="size-4" />
                                        </span>
                                    </div>
                                    <p className="mt-5 text-2xl font-semibold tracking-tight text-[#101828]">
                                        {key === 'contractValue'
                                            ? formatNumber(metrics[key])
                                            : key === 'activeContracts'
                                              ? metrics[key]
                                              : `${formatNumber(metrics[key])} MT`}
                                    </p>
                                    <p className="mt-4 text-xs text-[#667085]">
                                        {key === 'contractValue'
                                            ? 'Recorded value; source does not specify currency'
                                            : 'Calculated from stored ERP records'}
                                    </p>
                                </article>
                            ))}
                        </section>
                        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <div className="space-y-4">
                                <Panel title="Trade portfolio and quota position" icon={ChartNoAxesCombined}>
                                    <div className="flex flex-wrap gap-2 px-5 pb-4">
                                        {(['All contracts', 'Active', 'Draft'] as ContractFilter[]).map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                aria-pressed={contractFilter === option}
                                                onClick={() => setContractFilter(option)}
                                                className={`h-8 rounded-md px-3 text-xs font-medium ${contractFilter === option ? 'bg-[#101828] text-white' : 'bg-[#f2f4f7] text-[#475467]'}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.reload({
                                                    only: ['metrics', 'quotaLedger', 'tradeContracts', 'financeAuditEvents'],
                                                    onSuccess: () => setNotice('Finance figures refreshed from ERP records.'),
                                                })
                                            }
                                            className="ml-auto flex h-8 items-center gap-2 rounded-md border border-[#d0d5dd] px-3 text-xs font-medium text-[#475467] hover:bg-[#f9fafb]"
                                        >
                                            <Database className="size-3.5" />
                                            Refresh data
                                        </button>
                                    </div>
                                    <div className="grid gap-3 px-5 sm:grid-cols-3">
                                        <div className="rounded-md bg-[#f5f8ff] p-4">
                                            <p className="text-xs text-[#667085]">Recorded contract value</p>
                                            <p className="mt-3 text-lg font-semibold text-[#101828]">{formatNumber(metrics.contractValue)}</p>
                                        </div>
                                        <div className="rounded-md bg-[#f5f8ff] p-4">
                                            <p className="text-xs text-[#667085]">Active contracts</p>
                                            <p className="mt-3 text-lg font-semibold text-[#101828]">{metrics.activeContracts}</p>
                                        </div>
                                        <div className="rounded-md bg-[#f5f8ff] p-4">
                                            <p className="text-xs text-[#667085]">Remaining quota</p>
                                            <p className="mt-3 text-lg font-semibold text-[#101828]">{formatNumber(metrics.remainingMt)} MT</p>
                                        </div>
                                    </div>
                                    <div className="px-5 pt-5 pb-5">
                                        <h3 className="mb-2 text-sm font-medium text-[#344054]">Recent trade contracts</h3>
                                        {filteredContracts.length > 0 ? (
                                            <div className="overflow-x-auto rounded-md border border-[#eaecf0]">
                                                <table className="w-full min-w-[620px] text-left text-xs">
                                                    <thead className="bg-[#f9fafb] text-[10px] font-semibold tracking-[0.08em] text-[#667085] uppercase">
                                                        <tr>
                                                            <th className="px-4 py-3">Contract</th>
                                                            <th className="px-4 py-3">Counterparty / commodity</th>
                                                            <th className="px-4 py-3">Status</th>
                                                            <th className="px-4 py-3">Volume (MT)</th>
                                                            <th className="px-4 py-3">Value (currency unspecified)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredContracts.map((contract) => (
                                                            <tr key={contract.id} className="border-t border-[#eaecf0] text-[#475467]">
                                                                <td className="px-4 py-3 font-medium text-[#101828]">{contract.contract_ref}</td>
                                                                <td className="px-4 py-3">
                                                                    {contract.counterparty || 'Not specified'}
                                                                    <span className="block text-[#98a2b3]">{contract.commodity_name}</span>
                                                                </td>
                                                                <td className="px-4 py-3 capitalize">{contract.status}</td>
                                                                <td className="px-4 py-3">{formatNumber(Number(contract.volume_mt ?? 0))}</td>
                                                                <td className="px-4 py-3">
                                                                    {contract.volume_mt === null || contract.price_per_mt === null
                                                                        ? 'Not calculable'
                                                                        : formatNumber(contract.contract_value)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <EmptyState
                                                title="No matching trade contracts"
                                                description="Try a different search or contract status."
                                                className="h-28"
                                            />
                                        )}
                                    </div>
                                    <div className="mx-5 mb-5 flex gap-3 rounded-md bg-[#f5f8ff] p-4">
                                        <ShieldCheck className="size-4 shrink-0 text-[#175cd3]" />
                                        <div>
                                            <p className="text-sm font-medium text-[#344054]">Source and calculation</p>
                                            <p className="mt-1 text-xs leading-5 text-[#667085]">
                                                Trade value is volume × price per MT from recorded contracts; the ERP data does not specify a
                                                currency.
                                            </p>
                                        </div>
                                    </div>
                                </Panel>
                                <Panel title="Farmer quota disbursement ledger" icon={BookOpenCheck} className="overflow-hidden">
                                    <div className="flex flex-col gap-3 border-t border-[#eaecf0] p-5 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs text-[#667085]">
                                            Latest {quotaLedger.length} quota records from ERP. Totals above include every quota record.
                                        </p>
                                        <div className="flex gap-2">
                                            <label className="sr-only" htmlFor="zone-filter">
                                                Filter by zone
                                            </label>
                                            <select
                                                id="zone-filter"
                                                value={zoneFilter}
                                                onChange={(event) => setZoneFilter(event.target.value)}
                                                className="h-8 rounded-md border border-[#eaecf0] bg-white px-2 text-xs text-[#475467]"
                                            >
                                                {[
                                                    'All zones',
                                                    ...new Set(
                                                        quotaLedger.map(({ zone_name }) => zone_name).filter((zone): zone is string => Boolean(zone)),
                                                    ),
                                                ].map((zone) => (
                                                    <option key={zone}>{zone}</option>
                                                ))}
                                            </select>
                                            <label className="sr-only" htmlFor="cycle-filter">
                                                Filter by subsidy cycle
                                            </label>
                                            <select
                                                id="cycle-filter"
                                                value={cycleFilter}
                                                onChange={(event) => setCycleFilter(event.target.value)}
                                                className="h-8 rounded-md border border-[#eaecf0] bg-white px-2 text-xs text-[#475467]"
                                            >
                                                {['All cycles', ...new Set(quotaLedger.map(({ cycle_name }) => cycle_name))].map((cycle) => (
                                                    <option key={cycle}>{cycle}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[720px] text-left">
                                            <thead className="bg-[#f9fafb] text-[10px] font-semibold tracking-[0.08em] text-[#667085] uppercase">
                                                <tr>
                                                    <th className="px-5 py-3">Farmer</th>
                                                    <th className="px-5 py-3">Commodity / cycle</th>
                                                    <th className="px-5 py-3">Allocated (MT)</th>
                                                    <th className="px-5 py-3">Disbursed (MT)</th>
                                                    <th className="px-5 py-3">Remaining (MT)</th>
                                                    <th className="px-5 py-3">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredQuotas.length > 0 ? (
                                                    filteredQuotas.map((quota) => (
                                                        <tr key={quota.id} className="border-t border-[#eaecf0] text-sm text-[#475467]">
                                                            <td className="px-5 py-4 font-medium text-[#101828]">
                                                                {quota.farmer_name}
                                                                <span className="block text-xs text-[#98a2b3]">
                                                                    {quota.zone_name || 'Zone not assigned'}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                {quota.commodity_name}
                                                                <span className="block text-xs text-[#98a2b3]">
                                                                    {quota.fiscal_period || quota.cycle_name}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4">{formatNumber(Number(quota.allocated_qty))}</td>
                                                            <td className="px-5 py-4">{formatNumber(Number(quota.disbursed_qty))}</td>
                                                            <td className="px-5 py-4">
                                                                {formatNumber(Number(quota.allocated_qty) - Number(quota.disbursed_qty))}
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <button
                                                                    type="button"
                                                                    disabled={Number(quota.allocated_qty) <= Number(quota.disbursed_qty)}
                                                                    onClick={() => openDisbursementDialog(quota.id)}
                                                                    className="rounded-md border border-[#d0d5dd] px-2.5 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    Record
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="px-5 py-12">
                                                            <EmptyState
                                                                title="No matching records"
                                                                description="Try changing your search or filters."
                                                                className="h-28"
                                                            />
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Panel>
                            </div>
                            <aside className="grid content-start gap-4">
                                <Panel title="Quota fulfillment" icon={BarChart3}>
                                    <div className="px-5 pb-5">
                                        <p className="text-sm text-[#667085]">Recorded disbursement against total quota allocations</p>
                                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f2f4f7]">
                                            <div className="h-full rounded-full bg-[#175cd3]" style={{ width: `${disbursementRate}%` }} />
                                        </div>
                                        <div className="mt-3 flex justify-between gap-2 text-xs text-[#667085]">
                                            <span>{formatNumber(metrics.disbursedMt)} MT disbursed</span>
                                            <span>{disbursementRate.toFixed(1)}%</span>
                                        </div>
                                        <p className="mt-2 text-xs text-[#98a2b3]">{formatNumber(metrics.remainingMt)} MT remain allocated</p>
                                    </div>
                                </Panel>
                                <Panel title="Trade contract status" icon={BriefcaseBusiness}>
                                    <div className="px-5 pb-5">
                                        <div className="grid gap-3">
                                            {[
                                                'active',
                                                'draft',
                                                ...new Set(
                                                    tradeContracts
                                                        .map(({ status }) => status.toLowerCase())
                                                        .filter((status) => !['active', 'draft'].includes(status)),
                                                ),
                                            ].map((status) => {
                                                const count = tradeContracts.filter((contract) => contract.status.toLowerCase() === status).length;

                                                return (
                                                    <div
                                                        key={status}
                                                        className="flex items-center justify-between rounded-md bg-[#f9fafb] px-3 py-2.5 text-sm"
                                                    >
                                                        <span className="text-[#475467] capitalize">{status}</span>
                                                        <span className="font-semibold text-[#101828]">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </Panel>
                                <section className="rounded-lg bg-[#101828] p-5 text-white shadow-[0_1px_2px_rgba(16,24,40,0.2)]">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <BadgeDollarSign className="size-4 text-[#84adff]" />
                                        Finance audit trail
                                    </div>
                                    <p className="mt-4 text-sm font-medium">{financeAuditEvents.length} recent finance events</p>
                                    <p className="mt-2 text-xs leading-5 text-[#cbd5e1]">
                                        Recorded finance changes are stored in ERP audit events. Export the current audit record list.
                                    </p>
                                    <ul className="mt-4 grid gap-2">
                                        {financeAuditEvents.slice(0, 5).map((event) => (
                                            <li
                                                key={event.id}
                                                className="flex items-start justify-between gap-3 border-t border-white/10 pt-2 text-xs"
                                            >
                                                <span className="min-w-0 break-words text-[#e2e8f0]">{event.action}</span>
                                                <time className="shrink-0 text-[#98a2b3]">{event.created_at}</time>
                                            </li>
                                        ))}
                                        {financeAuditEvents.length === 0 && (
                                            <li className="border-t border-white/10 pt-2 text-xs text-[#98a2b3]">
                                                No finance audit events have been recorded.
                                            </li>
                                        )}
                                    </ul>
                                    <button
                                        type="button"
                                        onClick={exportAuditTrail}
                                        className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#175cd3] px-3 text-xs font-semibold text-white"
                                    >
                                        <FileDown className="size-3.5" />
                                        Download audit CSV
                                    </button>
                                </section>
                            </aside>
                        </div>
                    </main>
                </div>
            </div>
            <Dialog open={isDisbursementDialogOpen} onOpenChange={setIsDisbursementDialogOpen}>
                <DialogContent className="border-[#eaecf0] bg-white text-[#101828]">
                    <DialogHeader>
                        <DialogTitle>Record quota disbursement</DialogTitle>
                        <DialogDescription>
                            Record a quantity against this farmer's ERP quota. This updates the quota ledger and finance audit trail; it does not
                            initiate a payment.
                        </DialogDescription>
                    </DialogHeader>
                    <form className="grid gap-4" onSubmit={recordDisbursement}>
                        {selectedQuota && (
                            <div className="rounded-md bg-[#f9fafb] p-3 text-sm text-[#475467]">
                                <p className="font-medium text-[#101828]">
                                    {selectedQuota.farmer_name} · {selectedQuota.commodity_name}
                                </p>
                                <p className="mt-1 text-xs">Remaining allocation: {formatNumber(remainingQuota)} MT</p>
                            </div>
                        )}
                        <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                            Quantity (MT)
                            <input
                                required
                                min="0.01"
                                max={remainingQuota}
                                step="0.01"
                                type="number"
                                value={disbursementForm.data.quantity}
                                onChange={(event) => disbursementForm.setData('quantity', event.target.value)}
                                aria-invalid={Boolean(disbursementForm.errors.quantity)}
                                className="h-10 rounded-md border border-[#d0d5dd] px-3 font-normal outline-none focus:border-[#175cd3]"
                            />
                            {disbursementForm.errors.quantity && <span className="text-xs text-[#b42318]">{disbursementForm.errors.quantity}</span>}
                        </label>
                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setIsDisbursementDialogOpen(false)}
                                className="h-10 rounded-md border border-[#d0d5dd] px-4 text-sm font-medium text-[#475467]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={disbursementForm.processing || remainingQuota <= 0}
                                className="h-10 rounded-md bg-[#175cd3] px-4 text-sm font-semibold text-white hover:bg-[#1849a9] disabled:opacity-50"
                            >
                                {disbursementForm.processing ? 'Saving…' : 'Record disbursement'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {notice && (
                <div role="status" className="fixed right-4 bottom-4 z-40 max-w-sm rounded-lg bg-[#101828] px-4 py-3 text-sm text-white shadow-lg">
                    {notice}
                    <button type="button" onClick={() => setNotice('')} className="ml-3 text-[#b2ddff] underline">
                        Dismiss
                    </button>
                </div>
            )}
        </>
    );
}
