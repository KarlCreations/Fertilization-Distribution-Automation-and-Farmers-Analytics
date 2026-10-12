import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Bell,
    CheckCircle2,
    CircleHelp,
    Edit3,
    Leaf,
    Menu,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    UserPlus,
    UsersRound,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

type Farmer = {
    id: number;
    national_id: string;
    full_name: string;
    phone: string | null;
    zone_id: number | null;
    zone_name: string | null;
    status: string;
    biometric_verified: boolean;
    created_at: string;
};

type Zone = {
    id: number;
    name: string;
};

type RegistryMetrics = {
    registeredFarmers: number;
    pendingVerification: number;
    verifiedFarmers: number;
};

type FarmerRegistryProps = SharedData & {
    registryMetrics: RegistryMetrics;
    farmers: Farmer[];
    zones: Zone[];
    flash?: {
        success?: string;
        error?: string;
    };
};

type FarmerFormData = {
    national_id: string;
    full_name: string;
    phone: string;
    zone_id: string;
};

const inputClass =
    'form-input h-11 w-full rounded-lg border border-[#d5e3d9] bg-white px-3 text-sm text-[#203b2b] outline-none transition placeholder:text-[#98a99d] focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10';

export default function FarmerRegistry({
    registryMetrics,
    farmers,
    zones,
}: FarmerRegistryProps) {
    const { auth, flash, errors } = usePage<FarmerRegistryProps>().props;

    const systemName =
        import.meta.env.VITE_APP_NAME || 'Fertilization Distribution ERP';

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
    const [deleteFarmer, setDeleteFarmer] = useState<Farmer | null>(null);

    const {
        data,
        setData,
        post,
        put,
        patch,
        delete: destroy,
        processing,
        reset,
        errors: formErrors,
    } = useForm<FarmerFormData>({
        national_id: '',
        full_name: '',
        phone: '',
        zone_id: '',
    });

    const filteredFarmers = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return farmers.filter((farmer) => {
            const matchesSearch =
                searchValue === '' ||
                farmer.full_name.toLowerCase().includes(searchValue) ||
                farmer.national_id.toLowerCase().includes(searchValue) ||
                (farmer.phone ?? '').toLowerCase().includes(searchValue) ||
                (farmer.zone_name ?? '').toLowerCase().includes(searchValue);

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'pending' &&
                    farmer.status === 'pending_verification') ||
                (statusFilter === 'verified' && farmer.biometric_verified);

            return matchesSearch && matchesStatus;
        });
    }, [farmers, search, statusFilter]);

    const openAddForm = () => {
        setEditingFarmer(null);
        reset();
        setShowForm(true);
    };

    const openEditForm = (farmer: Farmer) => {
        setEditingFarmer(farmer);

        setData({
            national_id: farmer.national_id,
            full_name: farmer.full_name,
            phone: farmer.phone ?? '',
            zone_id: farmer.zone_id ? String(farmer.zone_id) : '',
        });

        setShowForm(true);
    };

    const closeForm = () => {
        if (processing) {
            return;
        }

        setShowForm(false);
        setEditingFarmer(null);
        reset();
    };

    const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editingFarmer) {
            put(route('farmer-registry.update', editingFarmer.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowForm(false);
                    setEditingFarmer(null);
                    reset();
                },
            });

            return;
        }

        post(route('farmer-registry.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowForm(false);
                reset();
            },
        });
    };

    const verifyFarmer = (farmer: Farmer) => {
        if (processing) {
            return;
        }

        patch(route('farmer-registry.verify', farmer.id), {
            preserveScroll: true,
        });
    };

    const confirmDelete = () => {
        if (!deleteFarmer || processing) {
            return;
        }

        destroy(route('farmer-registry.destroy', deleteFarmer.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteFarmer(null);
            },
        });
    };

    return (
        <>
            <Head title="Farmer Management" />

            <div className="min-h-screen bg-[#f4f8f5] text-[#172b21]">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e0ebe3] bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6">
                    <button
                        type="button"
                        aria-label="Open navigation"
                        className="flex size-9 items-center justify-center rounded-lg border border-[#d5e3d9] text-[#42624d] transition hover:bg-[#f0f7f2] lg:hidden"
                    >
                        <Menu className="size-4" />
                    </button>

                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#176b45] text-white shadow-sm">
                            <Leaf className="size-5" />
                        </span>

                        <div className="min-w-0">
                            <span className="block truncate text-sm font-bold tracking-tight text-[#173d2b] sm:text-base">
                                {systemName}
                            </span>
                            <span className="hidden text-[11px] text-[#829488] sm:block">
                                Fertilizer Distribution Management
                            </span>
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Notifications"
                            className="relative flex size-9 items-center justify-center rounded-lg text-[#42624d] transition hover:bg-[#f0f7f2]"
                        >
                            <Bell className="size-[18px]" />
                            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[#dc5148]" />
                        </button>

                        <button
                            type="button"
                            aria-label="Help"
                            className="hidden size-9 items-center justify-center rounded-lg text-[#42624d] transition hover:bg-[#f0f7f2] sm:flex"
                        >
                            <CircleHelp className="size-[18px]" />
                        </button>

                        <div className="ml-1 flex size-9 items-center justify-center rounded-full border-2 border-white bg-[#d9f1df] text-xs font-bold text-[#176b45] shadow-sm ring-1 ring-[#c4e4ce]">
                            {auth.user.name.slice(0, 2).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />

                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        {/* Page heading */}
                        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="mb-3 flex items-center gap-2 text-xs font-medium">
                                    <span className="rounded-md bg-[#e7f3e9] px-2 py-1 text-[#42624d]">
                                        Subsidy
                                    </span>
                                    <span className="text-[#a2b1a6]">/</span>
                                    <span className="text-[#176b45]">
                                        Farmer Management
                                    </span>
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight text-[#173d2b] sm:text-3xl">
                                    Farmer Management
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718176]">
                                    Register, verify, update, and manage farmer
                                    records for subsidy distribution.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={openAddForm}
                                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#176b45] px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#125638] hover:shadow-md"
                            >
                                <Plus className="size-4" />
                                Add Farmer
                            </button>
                        </div>

                        {/* Success message */}
                        {flash?.success && (
                            <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#b8e2c5] bg-[#edf9f0] px-4 py-3.5 text-sm text-[#176b45] shadow-sm">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white">
                                    <CheckCircle2 className="size-4" />
                                </span>
                                <span className="font-medium">
                                    {flash.success}
                                </span>
                            </div>
                        )}

                        {/* General error */}
                        {errors?.farmer && (
                            <div className="mb-5 rounded-xl border border-[#fecdca] bg-[#fef3f2] px-4 py-3.5 text-sm text-[#b42318]">
                                {errors.farmer}
                            </div>
                        )}

                        {/* Metrics */}
                        <section
                            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                            aria-label="Farmer metrics"
                        >
                            <MetricCard
                                label="Registered Farmers"
                                description="Total farmer records"
                                value={registryMetrics.registeredFarmers}
                                icon={UsersRound}
                                tone="green"
                            />

                            <MetricCard
                                label="Pending Verification"
                                description="Awaiting verification"
                                value={registryMetrics.pendingVerification}
                                icon={ShieldCheck}
                                tone="amber"
                            />

                            <MetricCard
                                label="Verified Farmers"
                                description="Verified farmer records"
                                value={registryMetrics.verifiedFarmers}
                                icon={CheckCircle2}
                                tone="green"
                            />
                        </section>

                        {/* Search and filters */}
                        <section className="mt-6 rounded-xl border border-[#e0ebe3] bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[#eaf7ef] text-[#176b45]">
                                    <Search className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-[#234832]">
                                        Find Farmers
                                    </h2>
                                    <p className="text-xs text-[#829488]">
                                        Search and filter registered records
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <label className="relative min-w-0 flex-1">
                                    <span className="sr-only">
                                        Search farmers
                                    </span>

                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a99d]" />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        className="h-11 w-full rounded-lg border border-[#d5e3d9] bg-[#fcfefc] pr-3 pl-9 text-sm outline-none transition placeholder:text-[#98a99d] focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                                        placeholder="Search name, national ID, phone, or zone..."
                                    />
                                </label>

                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(event.target.value)
                                    }
                                    className="h-11 rounded-lg border border-[#d5e3d9] bg-white px-3 text-sm text-[#344b3b] outline-none transition focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                                >
                                    <option value="all">All farmers</option>
                                    <option value="pending">
                                        Pending verification
                                    </option>
                                    <option value="verified">Verified</option>
                                </select>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf2ee] pt-3">
                                <p className="text-xs text-[#829488]">
                                    Showing{' '}
                                    <span className="font-semibold text-[#42624d]">
                                        {filteredFarmers.length}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-semibold text-[#42624d]">
                                        {farmers.length}
                                    </span>{' '}
                                    farmers
                                </p>

                                {(search || statusFilter !== 'all') && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            setStatusFilter('all');
                                        }}
                                        className="text-xs font-semibold text-[#176b45] transition hover:text-[#125638]"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        </section>

                        {/* Farmer table */}
                        <section className="mt-5 overflow-hidden rounded-xl border border-[#e0ebe3] bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-[#e0ebe3] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#176b45]">
                                        <UsersRound className="size-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-bold text-[#234832]">
                                            Farmer Records
                                        </h2>
                                        <p className="mt-1 text-xs text-[#829488]">
                                            Manage registered farmers and their
                                            verification status.
                                        </p>
                                    </div>
                                </div>

                                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#dcebe0] bg-[#f5faf6] px-3 py-1.5 text-xs font-semibold text-[#42624d]">
                                    <span className="size-1.5 rounded-full bg-[#29965d]" />
                                    {filteredFarmers.length} records
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-left">
                                    <thead className="bg-[#f0f7f2] text-[10px] font-bold tracking-[0.08em] text-[#42624d] uppercase">
                                        <tr>
                                            <th className="px-5 py-4">
                                                Farmer
                                            </th>
                                            <th className="px-5 py-4">
                                                National ID
                                            </th>
                                            <th className="px-5 py-4">
                                                Phone
                                            </th>
                                            <th className="px-5 py-4">
                                                Zone
                                            </th>
                                            <th className="px-5 py-4">
                                                Status
                                            </th>
                                            <th className="px-5 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-[#edf2ee]">
                                        {filteredFarmers.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-5 py-16 text-center"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#f0f7f2]">
                                                            <UsersRound className="size-7 text-[#86a18e]" />
                                                        </div>

                                                        <p className="mt-4 text-sm font-semibold text-[#344b3b]">
                                                            No farmers found
                                                        </p>

                                                        <p className="mt-1 max-w-xs text-xs leading-5 text-[#829488]">
                                                            No records match
                                                            your search. Try
                                                            another name or
                                                            change your filter.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredFarmers.map((farmer) => (
                                                <tr
                                                    key={farmer.id}
                                                    className="text-sm text-[#475b4c] transition-colors hover:bg-[#f7fbf8]"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e7f3e9] text-xs font-bold text-[#176b45]">
                                                                {farmer.full_name
                                                                    .split(' ')
                                                                    .filter(
                                                                        Boolean,
                                                                    )
                                                                    .slice(0, 2)
                                                                    .map(
                                                                        (part) =>
                                                                            part[0],
                                                                    )
                                                                    .join('')
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold text-[#234832]">
                                                                    {
                                                                        farmer.full_name
                                                                    }
                                                                </p>
                                                                <p className="mt-1 text-xs text-[#98a99d]">
                                                                    Farmer #
                                                                    {
                                                                        farmer.id
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 font-medium text-[#475b4c]">
                                                        {farmer.national_id}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {farmer.phone || (
                                                            <span className="text-[#a3b0a7]">
                                                                Not provided
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {farmer.zone_name || (
                                                            <span className="inline-flex items-center rounded-md bg-[#f5f7f5] px-2 py-1 text-xs text-[#98a99d]">
                                                                No zone
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {farmer.biometric_verified ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b8e2c5] bg-[#edf9f0] px-2.5 py-1.5 text-xs font-semibold text-[#176b45]">
                                                                <CheckCircle2 className="size-3.5" />
                                                                Verified
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f1dfae] bg-[#fff8e7] px-2.5 py-1.5 text-xs font-semibold text-[#a15c07]">
                                                                <ShieldCheck className="size-3.5" />
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditForm(
                                                                        farmer,
                                                                    )
                                                                }
                                                                className="flex h-9 items-center gap-1.5 rounded-lg border border-[#d5e3d9] bg-white px-3 text-xs font-semibold text-[#42624d] transition hover:border-[#a8cdb2] hover:bg-[#f0f7f2] hover:text-[#176b45]"
                                                            >
                                                                <Edit3 className="size-3.5" />
                                                                Edit
                                                            </button>

                                                            {!farmer.biometric_verified && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        verifyFarmer(
                                                                            farmer,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    className="flex h-9 items-center gap-1.5 rounded-lg border border-[#b8e2c5] bg-[#edf9f0] px-3 text-xs font-semibold text-[#176b45] transition hover:bg-[#d9f1df] disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    <ShieldCheck className="size-3.5" />
                                                                    Verify
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteFarmer(
                                                                        farmer,
                                                                    )
                                                                }
                                                                className="flex h-9 items-center gap-1.5 rounded-lg border border-[#fecdca] bg-[#fff6f5] px-3 text-xs font-semibold text-[#b42318] transition hover:bg-[#fee4e2]"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <p className="mt-5 text-center text-xs text-[#98a99d]">
                            Farmer Management · Fertilization Distribution ERP
                        </p>
                    </main>
                </div>

                {/* Add/Edit modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#102c1d]/50 p-4 backdrop-blur-sm">
                        <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[#e0ebe3] bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-[#e0ebe3] bg-[#f8fbf8] px-5 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#e3f3e7] text-[#176b45]">
                                        {editingFarmer ? (
                                            <Edit3 className="size-5" />
                                        ) : (
                                            <UserPlus className="size-5" />
                                        )}
                                    </div>

                                    <div>
                                        <h2 className="text-base font-bold text-[#173d2b]">
                                            {editingFarmer
                                                ? 'Edit Farmer'
                                                : 'Register Farmer'}
                                        </h2>

                                        <p className="mt-1 text-xs text-[#829488]">
                                            {editingFarmer
                                                ? 'Update the farmer information below.'
                                                : 'Enter the farmer information to create a new record.'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={processing}
                                    aria-label="Close form"
                                    className="flex size-9 items-center justify-center rounded-lg text-[#718176] transition hover:bg-[#eaf2ec] hover:text-[#176b45] disabled:opacity-50"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            <form
                                onSubmit={submitForm}
                                className="space-y-4 p-5 sm:p-6"
                            >
                                <FormField
                                    label="Full Name"
                                    required
                                    error={formErrors.full_name}
                                >
                                    <input
                                        type="text"
                                        value={data.full_name}
                                        onChange={(event) =>
                                            setData(
                                                'full_name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter farmer's full name"
                                        className={inputClass}
                                        required
                                    />
                                </FormField>

                                <FormField
                                    label="National ID"
                                    required
                                    error={formErrors.national_id}
                                >
                                    <input
                                        type="text"
                                        value={data.national_id}
                                        onChange={(event) =>
                                            setData(
                                                'national_id',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter national ID"
                                        className={inputClass}
                                        required
                                    />
                                </FormField>

                                <FormField
                                    label="Phone Number"
                                    error={formErrors.phone}
                                >
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(event) =>
                                            setData(
                                                'phone',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="09XXXXXXXXX"
                                        className={inputClass}
                                    />
                                </FormField>

                                <FormField
                                    label="Service Zone"
                                    error={formErrors.zone_id}
                                >
                                    <select
                                        value={data.zone_id}
                                        onChange={(event) =>
                                            setData(
                                                'zone_id',
                                                event.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select a zone
                                        </option>

                                        {zones.map((zone) => (
                                            <option
                                                key={zone.id}
                                                value={zone.id}
                                            >
                                                {zone.name}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>

                                <div className="flex flex-col-reverse gap-2 border-t border-[#e6eee8] pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={closeForm}
                                        disabled={processing}
                                        className="h-10 rounded-lg border border-[#d5e3d9] bg-white px-5 text-sm font-semibold text-[#42624d] transition hover:bg-[#f5faf6] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#176b45] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125638] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <UserPlus className="size-4" />

                                        {processing
                                            ? 'Saving...'
                                            : editingFarmer
                                              ? 'Save Changes'
                                              : 'Register Farmer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete confirmation modal */}
                {deleteFarmer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102c1d]/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e0ebe3] bg-white shadow-2xl">
                            <div className="p-6">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#fff0ee] text-[#c43226]">
                                    <Trash2 className="size-5" />
                                </div>

                                <h2 className="mt-5 text-lg font-bold text-[#173d2b]">
                                    Delete farmer?
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-[#718176]">
                                    You are about to delete{' '}
                                    <strong className="font-semibold text-[#344b3b]">
                                        {deleteFarmer.full_name}
                                    </strong>
                                    . This action cannot be undone.
                                </p>

                                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDeleteFarmer(null)
                                        }
                                        className="h-10 rounded-lg border border-[#d5e3d9] px-5 text-sm font-semibold text-[#42624d] transition hover:bg-[#f5faf6]"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={confirmDelete}
                                        disabled={processing}
                                        className="h-10 rounded-lg bg-[#c43226] px-5 text-sm font-semibold text-white transition hover:bg-[#a9271d] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing
                                            ? 'Deleting...'
                                            : 'Delete Farmer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function MetricCard({
    label,
    description,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    description: string;
    value: number;
    icon: typeof UsersRound;
    tone: 'green' | 'amber';
}) {
    const styles = {
        green: {
            icon: 'bg-[#eaf7ef] text-[#176b45]',
            accent: 'bg-[#29965d]',
        },
        amber: {
            icon: 'bg-[#fff6df] text-[#a15c07]',
            accent: 'bg-[#d99a28]',
        },
    };

    return (
        <article className="group relative overflow-hidden rounded-xl border border-[#e0ebe3] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8d8c1] hover:shadow-md">
            <div
                className={`absolute top-0 left-0 h-full w-1 ${styles[tone].accent} opacity-80`}
            />

            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-[#42624d]">
                        {label}
                    </p>
                    <p className="mt-1 text-xs text-[#98a99d]">
                        {description}
                    </p>
                </div>

                <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${styles[tone].icon}`}
                >
                    <Icon className="size-5" />
                </span>
            </div>

            <div className="mt-6 flex items-end justify-between">
                <p className="text-3xl font-bold tracking-tight text-[#173d2b]">
                    {value.toLocaleString()}
                </p>
                <span className="mb-1 text-xs font-medium text-[#829488]">
                    Total
                </span>
            </div>
        </article>
    );
}

function FormField({
    label,
    required = false,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-[#344b3b]">
                {label}
                {required && (
                    <span className="ml-1 text-[#c43226]">*</span>
                )}
            </label>

            {children}

            {error && (
                <p className="mt-1.5 text-xs font-medium text-[#b42318]">
                    {error}
                </p>
            )}
        </div>
    );
}
