import { Head, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardList,
    FilePlus2,
    Search,
    Sprout,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import WorkspaceHeader from '@/components/workspace-header';
import { type SharedData } from '@/types';

type Allocation = {
    id: number;
    farmer_id: number;
    cycle_id: number;
    commodity_id: number;
    farmer_name: string;
    national_id: string;
    commodity_name: string;
    cycle_name: string;
    allocated_qty: number;
    disbursed_qty: number;
};

type Farmer = {
    id: number;
    full_name: string;
    national_id: string;
};

type Commodity = {
    id: number;
    name: string;
};

type Cycle = {
    id: number;
    name: string;
    status: string;
};

type SubsidyAllocationsProps = SharedData & {
    allocations: Allocation[];
    farmers: Farmer[];
    commodities: Commodity[];
    cycles: Cycle[];
    flash?: {
        success?: string;
        error?: string;
    };
};

type AllocationFormData = {
    farmer_id: string;
    commodity_id: string;
    cycle_id: string;
    allocated_qty: string;
};

export default function SubsidyAllocations() {
    const {
        flash,
        allocations,
        farmers,
        commodities,
        cycles,
    } = usePage<SubsidyAllocationsProps>().props;

    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingAllocation, setEditingAllocation] =
        useState<Allocation | null>(null);
    const [deleteAllocation, setDeleteAllocation] =
        useState<Allocation | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
        errors: formErrors,
    } = useForm<AllocationFormData>({
        farmer_id: '',
        commodity_id: '',
        cycle_id: '',
        allocated_qty: '',
    });

    const filteredAllocations = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return allocations;
        }

        return allocations.filter((allocation) =>
            [
                allocation.farmer_name,
                allocation.national_id,
                allocation.commodity_name,
                allocation.cycle_name,
            ]
                .join(' ')
                .toLowerCase()
                .includes(term),
        );
    }, [allocations, search]);

    const totalAllocated = allocations.reduce(
        (total, allocation) =>
            total + Number(allocation.allocated_qty || 0),
        0,
    );

    const totalDisbursed = allocations.reduce(
        (total, allocation) =>
            total + Number(allocation.disbursed_qty || 0),
        0,
    );

    const remainingQuota = totalAllocated - totalDisbursed;

    const openCreateForm = () => {
        reset();
        setEditingAllocation(null);
        setShowForm(true);
    };

    const openEditForm = (allocation: Allocation) => {
        setEditingAllocation(allocation);

        setData({
            farmer_id: String(allocation.farmer_id),
            commodity_id: String(allocation.commodity_id),
            cycle_id: String(allocation.cycle_id),
            allocated_qty: String(allocation.allocated_qty),
        });

        setShowForm(true);
    };

    const closeForm = () => {
        if (processing) {
            return;
        }

        reset();
        setEditingAllocation(null);
        setShowForm(false);
    };

    const confirmDelete = () => {
        if (!deleteAllocation || processing) {
            return;
        }

        destroy(
            route(
                'subsidy-allocations.destroy',
                deleteAllocation.id,
            ),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteAllocation(null);
                },
            },
        );
    };

const submitAllocation = (event: React.FormEvent) => {
    event.preventDefault();

    console.log('SUBMIT CLICKED');
    console.log('Editing allocation:', editingAllocation);
    console.log('Form data:', data);

    if (editingAllocation) {
        put(
            route('subsidy-allocations.update', editingAllocation.id),
            {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('UPDATE SUCCESS');

                    reset();
                    setEditingAllocation(null);
                    setShowForm(false);
                },
                onError: (errors) => {
                    console.log('UPDATE ERRORS:', errors);
                },
                onFinish: () => {
                    console.log('UPDATE FINISHED');
                },
            },
        );

        return;
    }

    post(route('subsidy-allocations.store'), {
        preserveScroll: true,
        onSuccess: () => {
            reset();
            setShowForm(false);
        },
        onError: (errors) => {
            console.log('CREATE ERRORS:', errors);
        },
    });
};

    return (
        <>
            <Head title="Subsidy Allocations" />

            <div className="min-h-screen bg-[#f8fafc] text-[#1f2937]">
                <WorkspaceHeader />
                <div className="flex min-h-screen">
                    <WorkspaceSidebar />

                    <main className="min-w-0 flex-1">
                        <div className="mx-auto max-w-[1600px] px-6 py-6 lg:px-8">

                            {/* Header */}
                            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-2 text-sm text-[#667085]">
                                        <Sprout className="size-4 text-[#c9184a]" />
                                        <span>Subsidy</span>
                                        <span>/</span>
                                        <span>Allocations</span>
                                    </div>

                                    <h1 className="text-2xl font-bold text-[#101828]">
                                        Subsidy Allocations
                                    </h1>

                                    <p className="mt-1 text-sm text-[#667085]">
                                        Manage fertilizer allocations assigned
                                        to verified farmers.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#c9184a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a9143e]"
                                >
                                    <FilePlus2 className="size-4" />
                                    Create Allocation
                                </button>
                            </div>

                            {/* Flash Message */}
                            {flash?.success && (
                                <div className="mb-5 flex items-center gap-3 rounded-lg border border-[#abefc6] bg-[#ecfdf3] px-4 py-3 text-sm text-[#067647]">
                                    <CheckCircle2 className="size-4 shrink-0" />
                                    <span>{flash.success}</span>
                                </div>
                            )}

                            {/* KPI Cards */}
                            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl border border-[#eaecf0] bg-white p-5 shadow-sm">
                                    <p className="text-sm font-medium text-[#667085]">
                                        Total Allocations
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-[#101828]">
                                        {allocations.length}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-[#eaecf0] bg-white p-5 shadow-sm">
                                    <p className="text-sm font-medium text-[#667085]">
                                        Total Allocated
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-[#101828]">
                                        {totalAllocated.toLocaleString()} kg
                                    </p>
                                </div>

                                <div className="rounded-xl border border-[#eaecf0] bg-white p-5 shadow-sm">
                                    <p className="text-sm font-medium text-[#667085]">
                                        Total Disbursed
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-[#067647]">
                                        {totalDisbursed.toLocaleString()} kg
                                    </p>
                                </div>

                                <div className="rounded-xl border border-[#eaecf0] bg-white p-5 shadow-sm">
                                    <p className="text-sm font-medium text-[#667085]">
                                        Remaining Quota
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-[#c9184a]">
                                        {remainingQuota.toLocaleString()} kg
                                    </p>
                                </div>
                            </div>

                            {/* Allocation Table */}
                            <div className="overflow-hidden rounded-xl border border-[#eaecf0] bg-white shadow-sm">
                                <div className="border-b border-[#eaecf0] p-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <h2 className="font-semibold text-[#101828]">
                                                Allocation Records
                                            </h2>

                                            <p className="mt-1 text-sm text-[#667085]">
                                                View and monitor farmer subsidy
                                                allocations.
                                            </p>
                                        </div>

                                        <div className="relative w-full lg:w-80">
                                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#98a2b3]" />

                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(event) =>
                                                    setSearch(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Search farmer, ID, commodity..."
                                                className="w-full rounded-lg border border-[#d0d5dd] bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#c9184a] focus:ring-2 focus:ring-[#c9184a]/10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1000px] text-left">
                                        <thead className="bg-[#f9fafb]">
                                            <tr className="border-b border-[#eaecf0]">
                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#667085]">
                                                    Farmer
                                                </th>

                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#667085]">
                                                    Commodity
                                                </th>

                                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#667085]">
                                                    Subsidy Cycle
                                                </th>

                                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                                                    Allocated
                                                </th>

                                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                                                    Disbursed
                                                </th>

                                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                                                    Remaining
                                                </th>

                                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredAllocations.length > 0 ? (
                                                filteredAllocations.map(
                                                    (allocation) => {
                                                        const remaining =
                                                            Number(
                                                                allocation.allocated_qty ||
                                                                    0,
                                                            ) -
                                                            Number(
                                                                allocation.disbursed_qty ||
                                                                    0,
                                                            );

                                                        return (
                                                            <tr
                                                                key={
                                                                    allocation.id
                                                                }
                                                                className="border-b border-[#f2f4f7] last:border-0 hover:bg-[#fcfcfd]"
                                                            >
                                                                <td className="px-5 py-4">
                                                                    <p className="font-medium text-[#101828]">
                                                                        {
                                                                            allocation.farmer_name
                                                                        }
                                                                    </p>

                                                                    <p className="mt-0.5 text-xs text-[#667085]">
                                                                        {
                                                                            allocation.national_id
                                                                        }
                                                                    </p>
                                                                </td>

                                                                <td className="px-5 py-4 text-sm text-[#344054]">
                                                                    {
                                                                        allocation.commodity_name
                                                                    }
                                                                </td>

                                                                <td className="px-5 py-4 text-sm text-[#344054]">
                                                                    {
                                                                        allocation.cycle_name
                                                                    }
                                                                </td>

                                                                <td className="px-5 py-4 text-right text-sm font-medium text-[#101828]">
                                                                    {Number(
                                                                        allocation.allocated_qty,
                                                                    ).toLocaleString()}{' '}
                                                                    kg
                                                                </td>

                                                                <td className="px-5 py-4 text-right text-sm font-medium text-[#067647]">
                                                                    {Number(
                                                                        allocation.disbursed_qty,
                                                                    ).toLocaleString()}{' '}
                                                                    kg
                                                                </td>

                                                                <td className="px-5 py-4 text-right">
                                                                    <span className="rounded-full bg-[#fff1f3] px-2.5 py-1 text-xs font-semibold text-[#c9184a]">
                                                                        {remaining.toLocaleString()}{' '}
                                                                        kg
                                                                    </span>
                                                                </td>

                                                                {/* ACTIONS */}
                                                                <td className="px-5 py-4">
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openEditForm(
                                                                                    allocation,
                                                                                )
                                                                            }
                                                                            className="rounded-lg border border-[#d0d5dd] px-3 py-1.5 text-xs font-semibold text-[#344054] transition hover:bg-[#f9fafb]"
                                                                        >
                                                                            Edit
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setDeleteAllocation(
                                                                                    allocation,
                                                                                )
                                                                            }
                                                                            className="rounded-lg border border-[#fecdca] px-3 py-1.5 text-xs font-semibold text-[#b42318] transition hover:bg-[#fef3f2]"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    },
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={7}
                                                        className="px-5 py-12 text-center"
                                                    >
                                                        <ClipboardList className="mx-auto size-8 text-[#98a2b3]" />

                                                        <p className="mt-3 text-sm font-medium text-[#344054]">
                                                            No allocation
                                                            records found
                                                        </p>

                                                        <p className="mt-1 text-sm text-[#667085]">
                                                            Create your first
                                                            subsidy allocation.
                                                        </p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* CREATE / EDIT MODAL */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#eaecf0] px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-[#101828]">
                                    {editingAllocation
                                        ? 'Edit Subsidy Allocation'
                                        : 'Create Subsidy Allocation'}
                                </h2>

                                <p className="mt-1 text-sm text-[#667085]">
                                    Assign a subsidy quota to a verified
                                    farmer.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={processing}
                                className="rounded-lg p-2 text-[#667085] hover:bg-[#f2f4f7]"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={submitAllocation}
                            className="space-y-5 p-6"
                        >
                            {/* Farmer */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                                    Farmer
                                </label>

                                <select
                                    value={data.farmer_id}
                                    onChange={(event) =>
                                        setData(
                                            'farmer_id',
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-[#d0d5dd] px-3 py-2.5 text-sm outline-none focus:border-[#c9184a] focus:ring-2 focus:ring-[#c9184a]/10"
                                >
                                    <option value="">
                                        Select verified farmer
                                    </option>

                                    {farmers.map((farmer) => (
                                        <option
                                            key={farmer.id}
                                            value={farmer.id}
                                        >
                                            {farmer.full_name} —{' '}
                                            {farmer.national_id}
                                        </option>
                                    ))}
                                </select>

                                {formErrors.farmer_id && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {formErrors.farmer_id}
                                    </p>
                                )}
                            </div>

                            {/* Commodity */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                                    Commodity
                                </label>

                                <select
                                    value={data.commodity_id}
                                    onChange={(event) =>
                                        setData(
                                            'commodity_id',
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-[#d0d5dd] px-3 py-2.5 text-sm outline-none focus:border-[#c9184a] focus:ring-2 focus:ring-[#c9184a]/10"
                                >
                                    <option value="">
                                        Select commodity
                                    </option>

                                    {commodities.map((commodity) => (
                                        <option
                                            key={commodity.id}
                                            value={commodity.id}
                                        >
                                            {commodity.name}
                                        </option>
                                    ))}
                                </select>

                                {formErrors.commodity_id && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {formErrors.commodity_id}
                                    </p>
                                )}
                            </div>

                            {/* Subsidy Cycle */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                                    Subsidy Cycle
                                </label>

                                <select
                                    value={data.cycle_id}
                                    onChange={(event) =>
                                        setData(
                                            'cycle_id',
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-[#d0d5dd] px-3 py-2.5 text-sm outline-none focus:border-[#c9184a] focus:ring-2 focus:ring-[#c9184a]/10"
                                >
                                    <option value="">
                                        Select active cycle
                                    </option>

                                    {cycles
                                        .filter(
                                            (cycle) =>
                                                cycle.status === 'active',
                                        )
                                        .map((cycle) => (
                                            <option
                                                key={cycle.id}
                                                value={cycle.id}
                                            >
                                                {cycle.name}
                                            </option>
                                        ))}
                                </select>

                                {formErrors.cycle_id && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {formErrors.cycle_id}
                                    </p>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                                    Allocated Quantity (kg)
                                </label>

                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={data.allocated_qty}
                                    onChange={(event) =>
                                        setData(
                                            'allocated_qty',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Example: 100"
                                    className="w-full rounded-lg border border-[#d0d5dd] px-3 py-2.5 text-sm outline-none focus:border-[#c9184a] focus:ring-2 focus:ring-[#c9184a]/10"
                                />

                                {formErrors.allocated_qty && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {formErrors.allocated_qty}
                                    </p>
                                )}
                            </div>

                            {/* Modal Buttons */}
                            <div className="flex justify-end gap-3 border-t border-[#eaecf0] pt-5">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={processing}
                                    className="rounded-lg border border-[#d0d5dd] px-4 py-2.5 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-[#c9184a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#a9143e] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing
                                        ? editingAllocation
                                            ? 'Saving...'
                                            : 'Creating...'
                                        : editingAllocation
                                            ? 'Save Changes'
                                            : 'Create Allocation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteAllocation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-[#101828]">
                            Delete Allocation
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#667085]">
                            Are you sure you want to delete the allocation for{' '}
                            <span className="font-semibold text-[#344054]">
                                {deleteAllocation.farmer_name}
                            </span>
                            ?
                        </p>

                        <p className="mt-2 text-xs text-[#98a2b3]">
                            This action cannot be undone. Allocations with
                            existing disbursements cannot be deleted.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteAllocation(null)
                                }
                                disabled={processing}
                                className="rounded-lg border border-[#d0d5dd] px-4 py-2.5 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb]"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={processing}
                                className="rounded-lg bg-[#b42318] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#912018] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing
                                    ? 'Deleting...'
                                    : 'Delete Allocation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
