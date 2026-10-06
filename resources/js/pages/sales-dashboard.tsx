import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BarChart3,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleHelp,
    Download,
    FileText,
    Filter,
    Info,
    LoaderCircle,
    Menu,
    PackageCheck,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    SlidersHorizontal,
    Trash2,
    TrendingUp,
    WalletCards,
    X,
} from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import WorkspaceSidebar from '@/components/workspace-sidebar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type SharedData } from '@/types';

type PaymentStatus = 'paid' | 'partial' | 'unpaid';

interface Sale {
    id: number;
    sale_date: string;
    farmer_id: number;
    commodity_id: number;
    depot_id: number;
    zone_id: number;
    distributor: string;
    quantity: number | string;
    unit_price: number | string;
    total: number | string;
    amount_paid: number | string;
    outstanding_amount: number | string;
    payment_status: PaymentStatus;
    farmer_name: string;
    farmer_reference: string;
    commodity_name: string;
    commodity_grade: string | null;
    commodity_unit: string;
    depot_name: string;
    zone_name: string;
    can_edit: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedSales {
    data: Sale[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
}

interface SelectOption {
    id: number;
    name?: string;
    full_name?: string;
    national_id?: string;
    grade?: string | null;
    unit?: string;
    code?: string;
    zone_id?: number;
    zone_no?: number;
}

interface StockAvailability {
    commodity_id: number;
    depot_id: number;
    available_quantity: number | string;
}

interface ChartPoint {
    label: string;
    value: number | string;
}

interface DashboardProps {
    sales: PaginatedSales;
    filters: Filters;
    metrics: {
        totalSales: number;
        totalVolume: number;
        transactions: number;
        outstandingPayments: number;
    };
    charts: {
        salesOverTime: ChartPoint[];
        byFertilizer: ChartPoint[];
        topFarmers: ChartPoint[];
        byArea: ChartPoint[];
    };
    options: {
        farmers: SelectOption[];
        commodities: SelectOption[];
        depots: SelectOption[];
        zones: SelectOption[];
        stockAvailability: StockAvailability[];
    };
    permissions: { canManageAll: boolean };
    lastUpdated: string;
}

interface Filters {
    [key: string]: string | number | null;
    search: string;
    start_date: string | null;
    end_date: string | null;
    commodity_id: number | null;
    farmer_id: number | null;
    payment_status: PaymentStatus | null;
    zone_id: number | null;
    sort: 'sale_date' | 'farmer' | 'fertilizer' | 'quantity' | 'total' | 'payment_status' | 'area';
    direction: 'asc' | 'desc';
    per_page: number;
}

interface FlashData {
    success?: string;
    undoSaleId?: number;
}

interface SaleForm {
    [key: string]: string | boolean;
    sale_date: string;
    farmer_id: string;
    commodity_id: string;
    depot_id: string;
    zone_id: string;
    distributor: string;
    quantity: string;
    unit_price: string;
    amount_paid: string;
    payment_status: PaymentStatus;
    confirm_duplicate: boolean;
}

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat('en-PH', { day: 'numeric', month: 'short', year: 'numeric' });
const salesControlClass = 'border-slate-300 !bg-white !text-slate-950 placeholder:!text-slate-500 [color-scheme:light] focus-visible:ring-slate-900';
const salesSelectClass = `h-10 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${salesControlClass}`;
const salesOutlineButtonClass = '!bg-white !text-slate-950 hover:!bg-slate-100 hover:!text-slate-950';

const emptySaleForm = (): SaleForm => ({
    sale_date: new Date().toISOString().slice(0, 10),
    farmer_id: '',
    commodity_id: '',
    depot_id: '',
    zone_id: '',
    distributor: 'Provincial Fertilizer Depot',
    quantity: '',
    unit_price: '',
    amount_paid: '',
    payment_status: 'unpaid',
    confirm_duplicate: false,
});

function formatCurrency(value: number | string): string {
    return peso.format(Number(value));
}

function formatDate(value: string): string {
    return dateFormatter.format(new Date(`${value}T00:00:00`));
}

function formatNumber(value: number | string): string {
    return new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 }).format(Number(value));
}

function statusClasses(status: PaymentStatus): string {
    return {
        paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        partial: 'bg-amber-50 text-amber-800 ring-amber-600/20',
        unpaid: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    }[status];
}

function paymentLabel(status: PaymentStatus): string {
    return { paid: 'Paid', partial: 'Partly paid', unpaid: 'Unpaid' }[status];
}

function MetricCard({ label, value, help, icon: Icon, tone }: { label: string; value: string; help: string; icon: typeof WalletCards; tone: string }) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-slate-600">{label}</p>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button type="button" aria-label={`About ${label}`} className="rounded text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
                                <Info className="size-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-60 text-xs">{help}</TooltipContent>
                    </Tooltip>
                </div>
                <span className={`flex size-10 items-center justify-center rounded-lg ${tone}`}><Icon className="size-5" /></span>
            </div>
            <p className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        </article>
    );
}

function ChartCard({ title, description, data, currency = true }: { title: string; description: string; data: ChartPoint[]; currency?: boolean }) {
    const maximum = Math.max(...data.map((point) => Number(point.value)), 1);

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                </div>
                <BarChart3 className="size-5 text-blue-700" aria-hidden="true" />
            </div>
            {data.length === 0 ? (
                <div className="mt-5 flex h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 text-center">
                    <BarChart3 className="size-6 text-slate-400" />
                    <p className="mt-2 text-sm font-medium text-slate-700">No sales to chart yet</p>
                    <p className="mt-1 text-xs text-slate-500">Record a sale or broaden the filters to see this view.</p>
                </div>
            ) : (
                <div className="mt-5 space-y-3" role="img" aria-label={`${title}: ${data.map((point) => `${point.label} ${currency ? formatCurrency(point.value) : formatNumber(point.value)}`).join(', ')}`}>
                    {data.map((point) => (
                        <div key={point.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                            <div className="min-w-0">
                                <div className="mb-1 flex justify-between gap-2 text-xs">
                                    <span className="truncate font-medium text-slate-700">{point.label}</span>
                                    <span className="shrink-0 text-slate-500">{currency ? formatCurrency(point.value) : formatNumber(point.value)}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max((Number(point.value) / maximum) * 100, 3)}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function SalesFormDialog({ open, onOpenChange, sale, options }: { open: boolean; onOpenChange: (open: boolean) => void; sale: Sale | null; options: DashboardProps['options'] }) {
    const form = useForm<SaleForm>(emptySaleForm());
    const editing = sale !== null;
    const total = Number(form.data.quantity || 0) * Number(form.data.unit_price || 0);
    const currentSaleQuantity = editing && Number(sale.commodity_id) === Number(form.data.commodity_id) && Number(sale.depot_id) === Number(form.data.depot_id) ? Number(sale.quantity) : 0;
    const availableStock = options.stockAvailability.find(
        (stock) => Number(stock.commodity_id) === Number(form.data.commodity_id) && Number(stock.depot_id) === Number(form.data.depot_id),
    );
    const availableQuantity = Number(availableStock?.available_quantity ?? 0) + currentSaleQuantity;
    const isPaymentValid = form.data.payment_status === 'paid'
        ? Number(form.data.amount_paid || 0) === total
        : form.data.payment_status === 'unpaid'
            ? Number(form.data.amount_paid || 0) === 0
            : Number(form.data.amount_paid || 0) > 0 && Number(form.data.amount_paid || 0) < total;
    const isFormValid = Boolean(
        form.data.sale_date
        && form.data.farmer_id
        && form.data.commodity_id
        && form.data.depot_id
        && form.data.zone_id
        && form.data.distributor.trim()
        && Number(form.data.quantity) > 0
        && Number(form.data.unit_price) >= 0
        && Number(form.data.quantity) <= availableQuantity
        && isPaymentValid,
    );

    useEffect(() => {
        if (open) {
            form.clearErrors();
            form.setData(sale
                ? {
                    sale_date: sale.sale_date,
                    farmer_id: String(sale.farmer_id),
                    commodity_id: String(sale.commodity_id),
                    depot_id: String(sale.depot_id),
                    zone_id: String(sale.zone_id),
                    distributor: sale.distributor,
                    quantity: String(sale.quantity),
                    unit_price: String(sale.unit_price),
                    amount_paid: String(sale.amount_paid),
                    payment_status: sale.payment_status,
                    confirm_duplicate: false,
                }
                : emptySaleForm());
        }
    }, [open, sale, form]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const requestOptions = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (sale) {
            form.put(route('sales.update', sale.id), requestOptions);

            return;
        }

        form.post(route('sales.store'), requestOptions);
    };

    const setPaymentStatus = (status: PaymentStatus) => {
        form.setData((data) => ({
            ...data,
            payment_status: status,
            amount_paid: status === 'paid' ? total.toFixed(2) : status === 'unpaid' ? '0' : data.amount_paid,
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editing ? `Edit sale #${sale.id}` : 'Record fertilizer sale'}</DialogTitle>
                    <DialogDescription>
                        Inventory is checked before saving. Required fields are marked with an asterisk.
                    </DialogDescription>
                </DialogHeader>
                <form className="grid gap-5" onSubmit={submit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="sale_date">Sale date *</Label>
                            <Input id="sale_date" type="date" className={salesControlClass} max={new Date().toISOString().slice(0, 10)} value={form.data.sale_date} onChange={(event) => form.setData('sale_date', event.target.value)} />
                            <InputError message={form.errors.sale_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="distributor">Distributor *</Label>
                            <Input id="distributor" className={salesControlClass} value={form.data.distributor} onChange={(event) => form.setData('distributor', event.target.value)} placeholder="e.g. Provincial Fertilizer Depot" />
                            <InputError message={form.errors.distributor} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="farmer_id">Farmer *</Label>
                            <select id="farmer_id" value={form.data.farmer_id} onChange={(event) => form.setData('farmer_id', event.target.value)} className={salesSelectClass} required>
                                <option value="">Choose a farmer</option>
                                {options.farmers.map((farmer) => <option key={farmer.id} value={farmer.id}>{farmer.full_name} — {farmer.national_id}</option>)}
                            </select>
                            <InputError message={form.errors.farmer_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="commodity_id">Fertilizer type *</Label>
                            <select id="commodity_id" value={form.data.commodity_id} onChange={(event) => form.setData('commodity_id', event.target.value)} className={salesSelectClass} required>
                                <option value="">Choose a fertilizer</option>
                                {options.commodities.map((commodity) => <option key={commodity.id} value={commodity.id}>{commodity.name}{commodity.grade ? ` (${commodity.grade})` : ''} — {commodity.unit}</option>)}
                            </select>
                            <InputError message={form.errors.commodity_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="depot_id">Stock source / depot *</Label>
                            <select id="depot_id" value={form.data.depot_id} onChange={(event) => form.setData('depot_id', event.target.value)} className={salesSelectClass} required>
                                <option value="">Choose a depot</option>
                                {options.depots.map((depot) => <option key={depot.id} value={depot.id}>{depot.name} ({depot.code})</option>)}
                            </select>
                            <InputError message={form.errors.depot_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="zone_id">Sales area *</Label>
                            <select id="zone_id" value={form.data.zone_id} onChange={(event) => form.setData('zone_id', event.target.value)} className={salesSelectClass} required>
                                <option value="">Choose an area</option>
                                {options.zones.map((zone) => <option key={zone.id} value={zone.id}>Zone {zone.zone_no}: {zone.name}</option>)}
                            </select>
                            <InputError message={form.errors.zone_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity *</Label>
                            <Input id="quantity" className={salesControlClass} inputMode="decimal" type="number" min="0.01" step="0.01" value={form.data.quantity} onChange={(event) => form.setData('quantity', event.target.value)} />
                            {form.data.commodity_id && form.data.depot_id && <p className={Number(form.data.quantity || 0) > availableQuantity ? 'text-xs text-rose-600' : 'text-xs text-slate-500'}>{formatNumber(availableQuantity)} available from this depot</p>}
                            <InputError message={form.errors.quantity} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="unit_price">Unit price (₱) *</Label>
                            <Input id="unit_price" className={salesControlClass} inputMode="decimal" type="number" min="0" step="0.01" value={form.data.unit_price} onChange={(event) => form.setData('unit_price', event.target.value)} />
                            <InputError message={form.errors.unit_price} />
                        </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-medium text-slate-700">Sale total</span>
                            <span className="text-lg font-semibold text-slate-950">{formatCurrency(total)}</span>
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="payment_status">Payment status *</Label>
                                <select id="payment_status" value={form.data.payment_status} onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)} className={salesSelectClass}>
                                    <option value="paid">Paid in full</option>
                                    <option value="partial">Partly paid</option>
                                    <option value="unpaid">Unpaid</option>
                                </select>
                                <InputError message={form.errors.payment_status} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amount_paid">Amount received (₱) *</Label>
                                <Input id="amount_paid" className={salesControlClass} inputMode="decimal" type="number" min="0" step="0.01" value={form.data.amount_paid} disabled={form.data.payment_status === 'unpaid'} onChange={(event) => form.setData('amount_paid', event.target.value)} />
                                <InputError message={form.errors.amount_paid} />
                            </div>
                        </div>
                    </div>
                    {form.errors.confirm_duplicate && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm font-medium text-amber-900">Possible duplicate sale</p>
                            <p className="mt-1 text-sm text-amber-800">{form.errors.confirm_duplicate}</p>
                            <label className="mt-3 flex items-start gap-2 text-sm text-amber-900">
                                <Checkbox checked={form.data.confirm_duplicate} onCheckedChange={(checked) => form.setData('confirm_duplicate', checked === true)} />
                                I confirmed this is a separate customer transaction.
                            </label>
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={!isFormValid || form.processing}>
                            {form.processing && <LoaderCircle className="animate-spin" />}
                            {editing ? 'Save changes' : 'Record sale'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function SalesDashboard({ sales, filters, metrics, charts, options, permissions, lastUpdated }: DashboardProps) {
    const { auth, flash } = usePage<SharedData & { flash: FlashData }>().props;
    const [formOpen, setFormOpen] = useState(false);
    const [editingSale, setEditingSale] = useState<Sale | null>(null);
    const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
    const [helpOpen, setHelpOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [draftFilters, setDraftFilters] = useState<Filters>(filters);
    const [selectedSales, setSelectedSales] = useState<number[]>([]);
    const [onboardingVisible, setOnboardingVisible] = useState(() => typeof window !== 'undefined' && localStorage.getItem('sales-onboarding-dismissed') !== 'true');
    const [presets, setPresets] = useState<{ name: string; filters: Filters }[]>(() => {
        if (typeof window === 'undefined') return [];
        try { return JSON.parse(localStorage.getItem('sales-filter-presets') ?? '[]') as { name: string; filters: Filters }[]; } catch { return []; }
    });
    const searchInput = useRef<HTMLInputElement>(null);
    const activeFilterCount = [filters.search, filters.start_date, filters.end_date, filters.commodity_id, filters.farmer_id, filters.payment_status, filters.zone_id].filter(Boolean).length;

    useEffect(() => setDraftFilters(filters), [filters]);

    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (target?.matches('input, select, textarea, button, [contenteditable="true"]')) return;

            if (event.key.toLowerCase() === 'n') {
                event.preventDefault();
                setEditingSale(null);
                setFormOpen(true);
            }

            if (event.key === '/') {
                event.preventDefault();
                searchInput.current?.focus();
            }

            if (event.key === '?') {
                event.preventDefault();
                setHelpOpen(true);
            }
        };
        window.addEventListener('keydown', handleShortcut);

        return () => window.removeEventListener('keydown', handleShortcut);
    }, []);

    const applyFilters = (nextFilters: Filters = draftFilters) => {
        setIsLoading(true);
        router.get(route('sales-dashboard'), nextFilters, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const clearFilters = () => {
        const cleared = { ...filters, search: '', start_date: null, end_date: null, commodity_id: null, farmer_id: null, payment_status: null, zone_id: null, sort: 'sale_date' as const, direction: 'desc' as const };
        setDraftFilters(cleared);
        applyFilters(cleared);
    };

    const changeSort = (sort: Filters['sort']) => {
        const nextFilters = { ...filters, sort, direction: filters.sort === sort && filters.direction === 'desc' ? 'asc' as const : 'desc' as const };
        setDraftFilters(nextFilters);
        applyFilters(nextFilters);
    };

    const toggleSelected = (saleId: number) => setSelectedSales((current) => current.includes(saleId) ? current.filter((id) => id !== saleId) : [...current, saleId]);
    const togglePage = () => setSelectedSales((current) => current.length === sales.data.length ? [] : sales.data.map((sale) => sale.id));

    const exportSelected = () => {
        const selected = sales.data.filter((sale) => selectedSales.includes(sale.id));
        const rows = [
            ['Sale #', 'Date', 'Farmer', 'Fertilizer', 'Quantity', 'Total', 'Payment status', 'Area'],
            ...selected.map((sale) => [sale.id, sale.sale_date, sale.farmer_name, sale.commodity_name, sale.quantity, sale.total, paymentLabel(sale.payment_status), sale.zone_name]),
        ];
        const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        link.download = 'selected-sales.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const savePreset = () => {
        const nextPresets = [...presets.filter((preset) => preset.name !== 'Current sales filters'), { name: 'Current sales filters', filters }];
        setPresets(nextPresets);
        localStorage.setItem('sales-filter-presets', JSON.stringify(nextPresets));
    };

    const dismissOnboarding = () => {
        setOnboardingVisible(false);
        localStorage.setItem('sales-onboarding-dismissed', 'true');
    };

    return (
        <TooltipProvider>
            <Head title="Sales dashboard" />
            <div className="min-h-screen bg-slate-50 text-slate-950">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation"><Menu /></Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-80">
                            <SheetHeader>
                                <SheetTitle>Sales workspace</SheetTitle>
                                <SheetDescription>Navigate to the workspaces available to your role.</SheetDescription>
                            </SheetHeader>
                            <nav className="mt-6 grid gap-2" aria-label="Sales navigation">
                                <Link href={route('sales-dashboard')} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">Sales dashboard</Link>
                                <Link href={route('inventory-warehouses')} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Inventory & condition</Link>
                                <Link href={route('employee-settings')} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">My settings</Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-950">Fertilizer sales</p>
                        <p className="hidden text-xs text-slate-500 sm:block">Sales operations</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setHelpOpen(true)} aria-label="Open Sales dashboard help"><CircleHelp /></Button>
                        <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800" aria-label={`Signed in as ${auth.user.name}`}>{auth.user.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                </header>
                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />
                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        <div className="no-print mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500"><span>Operations</span><ChevronRight className="size-3" /><span className="text-blue-700">Sales dashboard</span></nav>
                                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Fertilizer sales dashboard</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Record fertilizer sales, check stock before dispatch, and follow payments by farmer and area.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" className={salesOutlineButtonClass} onClick={() => window.print()}><FileText /> Save as PDF</Button>
                                <Button asChild variant="outline" size="sm" className={salesOutlineButtonClass}><a href={`${route('sales-dashboard.export.csv')}?${new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== null).map(([key, value]) => [key, String(value)])).toString()}`}><Download /> Export CSV</a></Button>
                                <Button size="sm" onClick={() => { setEditingSale(null); setFormOpen(true); }}><Plus /> Record sale <span className="hidden text-xs opacity-70 sm:inline">(N)</span></Button>
                            </div>
                        </div>

                        {flash.success && (
                            <Alert className="no-print mb-5 border-emerald-200 bg-emerald-50 text-emerald-950" role="status">
                                <CheckCircle2 className="text-emerald-700" />
                                <AlertTitle>Saved</AlertTitle>
                                <AlertDescription className="flex flex-wrap items-center gap-3">
                                    <span>{flash.success}</span>
                                    {flash.undoSaleId && <Button variant="outline" size="sm" className={salesOutlineButtonClass} onClick={() => router.post(route('sales.restore', flash.undoSaleId), {}, { preserveScroll: true })}><RotateCcw /> Undo delete</Button>}
                                </AlertDescription>
                            </Alert>
                        )}

                        {onboardingVisible && (
                            <Alert className="no-print mb-5 border-blue-200 bg-blue-50 text-blue-950">
                                <Info className="text-blue-700" />
                                <AlertTitle>Start with a sale</AlertTitle>
                                <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                                    <span>Choose the farmer, fertilizer, and source depot. The system checks stock before it records the transaction.</span>
                                    <Button variant="outline" size="sm" className={salesOutlineButtonClass} onClick={dismissOnboarding}><X /> Got it</Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        <p className="mb-4 text-xs text-slate-500">Last updated {new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(lastUpdated))}</p>

                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Sales summary">
                            <MetricCard label="Total sales" value={formatCurrency(metrics.totalSales)} help="Value of all sales matching the current filters." icon={WalletCards} tone="bg-blue-50 text-blue-700" />
                            <MetricCard label="Total volume" value={`${formatNumber(metrics.totalVolume)} units`} help="Total fertilizer quantity sold in the current view. Product units appear in each transaction." icon={PackageCheck} tone="bg-emerald-50 text-emerald-700" />
                            <MetricCard label="Transactions" value={formatNumber(metrics.transactions)} help="Number of sale records matching the current filters." icon={TrendingUp} tone="bg-violet-50 text-violet-700" />
                            <MetricCard label="Outstanding payments" value={formatCurrency(metrics.outstandingPayments)} help="The unpaid portion of sales, including unpaid and partially paid transactions." icon={AlertCircle} tone="bg-rose-50 text-rose-700" />
                        </section>

                        <section className="no-print mt-6 grid gap-4 xl:grid-cols-2">
                            <ChartCard title="Sales over time" description="Daily sales value for the selected period." data={charts.salesOverTime} />
                            <ChartCard title="Sales by fertilizer type" description="Highest-value fertilizer products." data={charts.byFertilizer} />
                            <ChartCard title="Top farmers" description="Farmers with the highest recorded sales value." data={charts.topFarmers} />
                            <ChartCard title="Sales by area" description="Sales value grouped by sales area." data={charts.byArea} />
                        </section>

                        <section className="no-print mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Sales filters">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-950">Find sales</h2>
                                    <p className="mt-1 text-xs text-slate-500">Search by farmer, farmer ID, fertilizer, distributor, or area. Press / to focus search.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button variant="outline" size="sm" className={salesOutlineButtonClass} onClick={savePreset}><SlidersHorizontal /> Save current filters</Button>
                                    {presets.length > 0 && <select aria-label="Saved filter presets" className={`h-9 px-2 text-xs ${salesSelectClass}`} defaultValue="" onChange={(event) => { const preset = presets.find((item) => item.name === event.target.value); if (preset) { setDraftFilters(preset.filters); applyFilters(preset.filters); } }}><option value="">Saved filters</option>{presets.map((preset) => <option key={preset.name} value={preset.name}>{preset.name}</option>)}</select>}
                                    {activeFilterCount > 0 && <Button variant="ghost" size="sm" onClick={clearFilters}><X /> Clear all</Button>}
                                </div>
                            </div>
                            <form className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => { event.preventDefault(); applyFilters(); }}>
                                <label className="relative xl:col-span-2">
                                    <span className="sr-only">Search sales</span>
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                    <Input ref={searchInput} value={draftFilters.search} onChange={(event) => setDraftFilters({ ...draftFilters, search: event.target.value })} className={`${salesControlClass} pl-9`} placeholder="Search farmer, fertilizer, distributor, or area" />
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input aria-label="Start date" className={salesControlClass} type="date" value={draftFilters.start_date ?? ''} onChange={(event) => setDraftFilters({ ...draftFilters, start_date: event.target.value || null })} />
                                    <Input aria-label="End date" className={salesControlClass} type="date" value={draftFilters.end_date ?? ''} onChange={(event) => setDraftFilters({ ...draftFilters, end_date: event.target.value || null })} />
                                </div>
                                <Button type="submit" className="!bg-slate-950 !text-white hover:!bg-slate-800" disabled={isLoading}>{isLoading ? <LoaderCircle className="animate-spin" /> : <Filter />} Apply filters</Button>
                                <select aria-label="Filter by fertilizer" value={draftFilters.commodity_id ?? ''} onChange={(event) => setDraftFilters({ ...draftFilters, commodity_id: event.target.value ? Number(event.target.value) : null })} className={salesSelectClass}><option value="">All fertilizer types</option>{options.commodities.map((commodity) => <option key={commodity.id} value={commodity.id}>{commodity.name}</option>)}</select>
                                <select aria-label="Filter by farmer" value={draftFilters.farmer_id ?? ''} onChange={(event) => setDraftFilters({ ...draftFilters, farmer_id: event.target.value ? Number(event.target.value) : null })} className={salesSelectClass}><option value="">All farmers</option>{options.farmers.map((farmer) => <option key={farmer.id} value={farmer.id}>{farmer.full_name}</option>)}</select>
                                <select aria-label="Filter by payment status" value={draftFilters.payment_status ?? ''} onChange={(event) => setDraftFilters({ ...draftFilters, payment_status: (event.target.value || null) as PaymentStatus | null })} className={salesSelectClass}><option value="">All payment statuses</option><option value="paid">Paid</option><option value="partial">Partly paid</option><option value="unpaid">Unpaid</option></select>
                                <select aria-label="Filter by sales area" value={draftFilters.zone_id ?? ''} onChange={(event) => setDraftFilters({ ...draftFilters, zone_id: event.target.value ? Number(event.target.value) : null })} className={salesSelectClass}><option value="">All areas</option>{options.zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select>
                            </form>
                            {activeFilterCount > 0 && <div className="mt-4 flex flex-wrap gap-2" aria-label="Active filters"><span className="text-xs font-medium text-slate-500">Active:</span>{filters.search && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-800">Search: {filters.search}</span>}{filters.start_date && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-800">From: {formatDate(filters.start_date)}</span>}{filters.end_date && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-800">To: {formatDate(filters.end_date)}</span>}{filters.commodity_id && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-800">Fertilizer: {options.commodities.find((item) => item.id === filters.commodity_id)?.name}</span>}{filters.farmer_id && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-800">Farmer: {options.farmers.find((item) => item.id === filters.farmer_id)?.full_name}</span>}{filters.payment_status && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-800">{paymentLabel(filters.payment_status)}</span>}{filters.zone_id && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-800">Area: {options.zones.find((item) => item.id === filters.zone_id)?.name}</span>}<span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} applied</span></div>}
                        </section>

                        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="no-print flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-950">Sales records</h2>
                                    <p className="mt-1 text-xs text-slate-500">{sales.total} transaction{sales.total === 1 ? '' : 's'} found. Staff can change only their own records.</p>
                                </div>
                                {selectedSales.length > 0 && <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1.5"><span className="px-2 text-xs font-medium text-slate-700">{selectedSales.length} selected</span><Button variant="outline" size="sm" onClick={exportSelected}><Download /> Export selected</Button><Button variant="ghost" size="sm" onClick={() => setSelectedSales([])}>Clear</Button></div>}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1120px] text-left text-sm">
                                    <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                        <tr>
                                            <th className="w-12 px-4 py-3"><Checkbox checked={sales.data.length > 0 && selectedSales.length === sales.data.length} onCheckedChange={togglePage} aria-label="Select all visible sales" /></th>
                                            <th className="px-4 py-3"><SortButton label="Date" field="sale_date" filters={filters} onSort={changeSort} /></th>
                                            <th className="px-4 py-3"><SortButton label="Farmer" field="farmer" filters={filters} onSort={changeSort} /></th>
                                            <th className="px-4 py-3"><SortButton label="Fertilizer" field="fertilizer" filters={filters} onSort={changeSort} /></th>
                                            <th className="px-4 py-3 text-right"><SortButton label="Quantity" field="quantity" filters={filters} onSort={changeSort} /></th>
                                            <th className="px-4 py-3 text-right"><SortButton label="Total" field="total" filters={filters} onSort={changeSort} /></th>
                                            <th className="px-4 py-3"><SortButton label="Payment" field="payment_status" filters={filters} onSort={changeSort} /></th>
                                            <th className="px-4 py-3"><SortButton label="Area" field="area" filters={filters} onSort={changeSort} /></th>
                                            <th className="no-print px-4 py-3"><span className="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {isLoading ? <TableSkeleton /> : sales.data.length === 0 ? <EmptySalesState onCreate={() => { setEditingSale(null); setFormOpen(true); }} /> : sales.data.map((sale) => (
                                            <SaleRow key={sale.id} sale={sale} selected={selectedSales.includes(sale.id)} onToggle={() => toggleSelected(sale.id)} onEdit={() => { setEditingSale(sale); setFormOpen(true); }} onDelete={() => setSaleToDelete(sale)} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="no-print flex flex-col gap-3 border-t border-slate-200 px-4 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <span>{sales.from ?? 0}–{sales.to ?? 0} of {sales.total}</span>
                                <div className="flex items-center gap-2"><label className="text-xs" htmlFor="per-page">Rows</label><select id="per-page" value={filters.per_page} onChange={(event) => applyFilters({ ...filters, per_page: Number(event.target.value) })} className="h-8 rounded border border-slate-300 bg-white px-2 text-xs"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select><Pagination links={sales.links} /></div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
            <SalesFormDialog open={formOpen} onOpenChange={setFormOpen} sale={editingSale} options={options} />
            <DeleteDialog sale={saleToDelete} onOpenChange={(open) => !open && setSaleToDelete(null)} />
            <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} isAdmin={permissions.canManageAll} />
        </TooltipProvider>
    );
}

function SortButton({ label, field, filters, onSort }: { label: string; field: Filters['sort']; filters: Filters; onSort: (field: Filters['sort']) => void }) {
    const selected = filters.sort === field;
    return <button type="button" onClick={() => onSort(field)} className="inline-flex items-center gap-1 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">{label}{selected && (filters.direction === 'asc' ? <ChevronLeft className="size-3 -rotate-90" /> : <ChevronDown className="size-3" />)}</button>;
}

function SaleRow({ sale, selected, onToggle, onEdit, onDelete }: { sale: Sale; selected: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
    return (
        <>
            <tr className="align-top hover:bg-slate-50">
                <td className="px-4 py-4"><Checkbox checked={selected} onCheckedChange={onToggle} aria-label={`Select sale ${sale.id}`} /></td>
                <td className="px-4 py-4 whitespace-nowrap text-slate-700">{formatDate(sale.sale_date)}<p className="mt-1 text-xs text-slate-400">#{sale.id}</p></td>
                <td className="px-4 py-4"><p className="font-medium text-slate-950">{sale.farmer_name}</p><p className="mt-1 text-xs text-slate-500">{sale.farmer_reference}</p></td>
                <td className="px-4 py-4"><p className="font-medium text-slate-800">{sale.commodity_name}</p><p className="mt-1 text-xs text-slate-500">{sale.commodity_grade ?? 'Standard grade'} · {sale.depot_name}</p></td>
                <td className="px-4 py-4 text-right text-slate-700">{formatNumber(sale.quantity)}<p className="mt-1 text-xs text-slate-500">{sale.commodity_unit}</p></td>
                <td className="px-4 py-4 text-right"><p className="font-medium text-slate-950">{formatCurrency(sale.total)}</p><p className="mt-1 text-xs text-slate-500">{formatCurrency(sale.unit_price)} / unit</p></td>
                <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses(sale.payment_status)}`}>{paymentLabel(sale.payment_status)}</span>{Number(sale.outstanding_amount) > 0 && <p className="mt-1 text-xs text-rose-700">{formatCurrency(sale.outstanding_amount)} due</p>}</td>
                <td className="px-4 py-4"><p className="text-slate-700">{sale.zone_name}</p><p className="mt-1 text-xs text-slate-500">{sale.distributor}</p></td>
                <td className="no-print px-4 py-4"><div className="flex justify-end gap-1">{sale.can_edit ? <><Button variant="ghost" size="icon" onClick={onEdit} aria-label={`Edit sale ${sale.id}`}><Pencil /></Button><Button variant="ghost" size="icon" className="text-rose-700 hover:bg-rose-50 hover:text-rose-800" onClick={onDelete} aria-label={`Delete sale ${sale.id}`}><Trash2 /></Button></> : <span className="text-xs text-slate-500">View only</span>}</div></td>
            </tr>
            <tr className="bg-slate-50/60"><td colSpan={9} className="px-4 pb-3"><details><summary className="cursor-pointer text-xs font-medium text-blue-700 hover:text-blue-900">Show payment and stock details</summary><div className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-3"><span>Amount received: <strong className="text-slate-900">{formatCurrency(sale.amount_paid)}</strong></span><span>Outstanding: <strong className="text-slate-900">{formatCurrency(sale.outstanding_amount)}</strong></span><span>Stock source: <strong className="text-slate-900">{sale.depot_name}</strong></span></div></details></td></tr>
        </>
    );
}

function TableSkeleton() { return <>{Array.from({ length: 5 }).map((_, index) => <tr key={index}><td colSpan={9} className="px-4 py-4"><Skeleton className="h-8 w-full" /></td></tr>)}</>; }

function EmptySalesState({ onCreate }: { onCreate: () => void }) { return <tr><td colSpan={9} className="px-4 py-16"><div className="mx-auto flex max-w-md flex-col items-center text-center"><PackageCheck className="size-9 text-slate-400" /><h3 className="mt-3 font-semibold text-slate-950">No sales match this view</h3><p className="mt-2 text-sm leading-6 text-slate-600">Try clearing filters, or record the first sale. Inventory is checked automatically before dispatch.</p><Button className="mt-4" size="sm" onClick={onCreate}><Plus /> Record first sale</Button></div></td></tr>; }

function Pagination({ links }: { links: PaginationLink[] }) { return <div className="flex items-center gap-1">{links.map((link, index) => <Link key={`${link.label}-${index}`} href={link.url ?? '#'} preserveScroll className={`flex size-8 items-center justify-center rounded text-xs ${link.active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'} ${link.url === null ? 'pointer-events-none opacity-40' : ''}`} aria-label={link.label.replace('&laquo;', 'Previous').replace('&raquo;', 'Next')}>{link.label.replace('&laquo;', '‹').replace('&raquo;', '›')}</Link>)}</div>; }

function DeleteDialog({ sale, onOpenChange }: { sale: Sale | null; onOpenChange: (open: boolean) => void }) { return <Dialog open={sale !== null} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Delete this sale?</DialogTitle><DialogDescription>This returns {sale ? `${formatNumber(sale.quantity)} ${sale.commodity_unit}` : ''} to the original depot. You can undo the deletion immediately if the stock is still available.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="destructive" onClick={() => sale && router.delete(route('sales.destroy', sale.id), { preserveScroll: true, onSuccess: () => onOpenChange(false) })}><Trash2 /> Delete sale</Button></DialogFooter></DialogContent></Dialog>; }

function HelpDialog({ open, onOpenChange, isAdmin }: { open: boolean; onOpenChange: (open: boolean) => void; isAdmin: boolean }) { return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Using the Sales dashboard</DialogTitle><DialogDescription>Shortcuts and safeguards for day-to-day sales work.</DialogDescription></DialogHeader><div className="grid gap-4 text-sm text-slate-700"><div><p className="font-medium text-slate-950">Record a sale</p><p className="mt-1">Press N or select Record sale. Choose a farmer, fertilizer, depot, and area; available stock is shown before you save.</p></div><div><p className="font-medium text-slate-950">Find and export</p><p className="mt-1">Press / to search. Apply filters to update summaries and charts, then export the filtered result as CSV or use Save as PDF.</p></div><div><p className="font-medium text-slate-950">Correct a mistake</p><p className="mt-1">Edit a sale to reconcile stock. Deleting a sale returns stock and shows an Undo button.</p></div><div><p className="font-medium text-slate-950">Your access</p><p className="mt-1">{isAdmin ? 'You can manage all sales records.' : 'You can create records and change only the sales you entered.'}</p></div></div><DialogFooter><Button onClick={() => onOpenChange(false)}>Close help</Button></DialogFooter></DialogContent></Dialog>; }
