import { Head, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardList,
    History,
    PackageCheck,
    Search,
    Sprout,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

type DisbursementAllocation = {
    id: number;
    farmer_id: number;
    cycle_id: number;
    commodity_id: number;
    farmer_name: string;
    national_id: string;
    commodity_name: string;
    commodity_unit: string;
    cycle_name: string;
    allocated_qty: number;
    disbursed_qty: number;
};

type HistoryRecord = {
    id: number;
    quantity: number;
    created_at: string;
    recorded_by: string | null;
};

type DisbursementRecordsProps = SharedData & {
    allocations: DisbursementAllocation[];
    flash?: {
        success?: string;
    };
};

export default function DisbursementRecords() {
    const { allocations, flash } =
        usePage<DisbursementRecordsProps>().props;

    const [search, setSearch] = useState('');

    const [selectedAllocation, setSelectedAllocation] =
        useState<DisbursementAllocation | null>(null);

    const [historyAllocation, setHistoryAllocation] =
        useState<DisbursementAllocation | null>(null);

    const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(
        [],
    );

    const [historyLoading, setHistoryLoading] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        quantity: '',
    });

    const filteredAllocations = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return allocations;
        }

        return allocations.filter((allocation) =>
            [
                allocation.farmer_name,
                allocation.national_id,
                allocation.commodity_name,
                allocation.cycle_name,
            ].some((value) =>
                value.toLowerCase().includes(keyword),
            ),
        );
    }, [allocations, search]);

    const totalAllocations = allocations.length;

    const totalAllocated = allocations.reduce(
        (total, allocation) =>
            total + Number(allocation.allocated_qty),
        0,
    );

    const totalDisbursed = allocations.reduce(
        (total, allocation) =>
            total + Number(allocation.disbursed_qty ?? 0),
        0,
    );

    const totalRemaining = totalAllocated - totalDisbursed;

    const openRecordModal = (
        allocation: DisbursementAllocation,
    ) => {
        setSelectedAllocation(allocation);
        setData('quantity', '');
    };

    const closeRecordModal = () => {
        setSelectedAllocation(null);
        reset();
    };

    const openHistoryModal = async (
        allocation: DisbursementAllocation,
    ) => {
        setHistoryAllocation(allocation);
        setHistoryRecords([]);
        setHistoryLoading(true);

        try {
            const response = await fetch(
                route(
                    'disbursement-records.history',
                    allocation.id,
                ),
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error(
                    'Failed to load disbursement history.',
                );
            }

            const result = await response.json();

            setHistoryRecords(result.records ?? []);
        } catch (error) {
            console.error(
                'Failed to load disbursement history:',
                error,
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    const closeHistoryModal = () => {
        setHistoryAllocation(null);
        setHistoryRecords([]);
        setHistoryLoading(false);
    };

    const submitDisbursement = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!selectedAllocation) {
            return;
        }

        post(
            route(
                'disbursement-records.record',
                selectedAllocation.id,
            ),
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeRecordModal();
                },
            },
        );
    };

    return (
        <>
            <Head title="Disbursement Records" />

            <div className="min-h-screen bg-[#f8f9fb] text-[#101828]">
                <div className="flex min-h-screen">
                    <WorkspaceSidebar />

                    <main className="min-w-0 flex-1">
                        {/* Header */}
                        <header className="border-b border-[#eaecf0] bg-white">
                            <div className="flex h-20 items-center justify-between px-8">
                                <div>
                                    <p className="text-sm text-[#667085]">
                                        Subsidy Management
                                    </p>

                                    <h1 className="text-xl font-semibold text-[#1f1f3a]">
                                        Disbursement Records
                                    </h1>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fde7ed] text-[#c9184a]">
                                    <Sprout size={19} />
                                </div>
                            </div>
                        </header>

                        <div className="px-8 py-7">
                            {/* Breadcrumb */}
                            <div className="mb-3 flex items-center gap-2 text-sm text-[#667085]">
                                <span>Subsidy</span>
                                <span>/</span>
                                <span className="font-medium text-[#344054]">
                                    Disbursement Records
                                </span>
                            </div>

                            {/* Page Heading */}
                            <div className="mb-7">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fde7ed] text-[#c9184a]">
                                        <ClipboardList size={23} />
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-semibold text-[#1f1f3a]">
                                            Disbursement Records
                                        </h2>

                                        <p className="mt-1 max-w-2xl text-sm leading-6 text-[#667085]">
                                            Record and monitor fertilizer
                                            released to verified farmers.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Success Message */}
                            {flash?.success && (
                                <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#abefc6] bg-[#ecfdf3] px-4 py-3.5">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#12b76a]" />

                                    <div>
                                        <p className="text-sm font-semibold text-[#067647]">
                                            Disbursement recorded
                                        </p>

                                        <p className="mt-0.5 text-sm text-[#027a48]">
                                            {flash.success}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* KPI Cards */}
                            <div className="mb-6 grid gap-4 md:grid-cols-3">
                                {/* Total Allocations */}
                                <div className="rounded-2xl border border-[#eaecf0] bg-white p-5 shadow-sm transition hover:shadow-md">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-[#667085]">
                                                Total Allocations
                                            </p>

                                            <p className="mt-2 text-2xl font-bold text-[#1f1f3a]">
                                                {totalAllocations.toLocaleString()}
                                            </p>

                                            <p className="mt-1 text-xs text-[#98a2b3]">
                                                Active allocation records
                                            </p>
                                        </div>

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f4f7] text-[#475467]">
                                            <ClipboardList size={19} />
                                        </div>
                                    </div>
                                </div>

                                {/* Total Disbursed */}
                                <div className="rounded-2xl border border-[#eaecf0] bg-white p-5 shadow-sm transition hover:shadow-md">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-[#667085]">
                                                Total Disbursed
                                            </p>

                                            <p className="mt-2 text-2xl font-bold text-[#c9184a]">
                                                {totalDisbursed.toLocaleString()}{' '}
                                                MT
                                            </p>

                                            <p className="mt-1 text-xs text-[#98a2b3]">
                                                Fertilizer released
                                            </p>
                                        </div>

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fde7ed] text-[#c9184a]">
                                            <PackageCheck size={19} />
                                        </div>
                                    </div>
                                </div>

                                {/* Remaining */}
                                <div className="rounded-2xl border border-[#eaecf0] bg-white p-5 shadow-sm transition hover:shadow-md">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-[#667085]">
                                                Remaining Allocations
                                            </p>

                                            <p className="mt-2 text-2xl font-bold text-[#12b76a]">
                                                {totalRemaining.toLocaleString()}{' '}
                                                MT
                                            </p>

                                            <p className="mt-1 text-xs text-[#98a2b3]">
                                                Available for release
                                            </p>
                                        </div>

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecfdf3] text-[#12b76a]">
                                            <Sprout size={19} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search + Result Count */}
                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex w-full items-center rounded-xl border border-[#d0d5dd] bg-white px-4 py-3 shadow-sm transition focus-within:border-[#c9184a] focus-within:ring-2 focus-within:ring-[#c9184a]/10 sm:max-w-md">
                                    <Search
                                        size={18}
                                        className="mr-3 shrink-0 text-[#98a2b3]"
                                    />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Search farmer, ID, commodity, or cycle..."
                                        className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#98a2b3]"
                                    />
                                </div>

                                <p className="text-sm text-[#667085]">
                                    Showing{' '}
                                    <span className="font-semibold text-[#344054]">
                                        {filteredAllocations.length}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-semibold text-[#344054]">
                                        {allocations.length}
                                    </span>{' '}
                                    records
                                </p>
                            </div>

                            {/* Table */}
                            <div className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white shadow-sm">
                                <div className="border-b border-[#eaecf0] px-5 py-4">
                                    <div>
                                        <h3 className="font-semibold text-[#1f1f3a]">
                                            Allocation & Disbursement List
                                        </h3>

                                        <p className="mt-1 text-xs text-[#667085]">
                                            Select an allocation to record a
                                            fertilizer release.
                                        </p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1150px]">
                                        <thead className="border-b border-[#eaecf0] bg-[#f9fafb]">
                                            <tr>
                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                                                    Farmer
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                                                    Commodity
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
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
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-[#eaecf0]">
                                            {filteredAllocations.map(
                                                (allocation) => {
                                                    const allocated =
                                                        Number(
                                                            allocation.allocated_qty,
                                                        );

                                                    const disbursed =
                                                        Number(
                                                            allocation.disbursed_qty ??
                                                                0,
                                                        );

                                                    const remaining =
                                                        allocated - disbursed;

                                                    const hasRemaining =
                                                        remaining > 0;

                                                    return (
                                                        <tr
                                                            key={
                                                                allocation.id
                                                            }
                                                            className="transition hover:bg-[#fcfcfd]"
                                                        >
                                                            {/* Farmer */}
                                                            <td className="px-5 py-4">
                                                                <p className="font-medium text-[#1f1f3a]">
                                                                    {
                                                                        allocation.farmer_name
                                                                    }
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-[#667085]">
                                                                    ID:{' '}
                                                                    {
                                                                        allocation.national_id
                                                                    }
                                                                </p>
                                                            </td>

                                                            {/* Commodity */}
                                                            <td className="px-5 py-4">
                                                                <p className="font-medium text-[#344054]">
                                                                    {
                                                                        allocation.commodity_name
                                                                    }
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-[#667085]">
                                                                    Unit:{' '}
                                                                    {
                                                                        allocation.commodity_unit
                                                                    }
                                                                </p>
                                                            </td>

                                                            {/* Cycle */}
                                                            <td className="px-5 py-4 text-sm text-[#344054]">
                                                                {
                                                                    allocation.cycle_name
                                                                }
                                                            </td>

                                                            {/* Allocated */}
                                                            <td className="px-5 py-4 text-right text-sm font-medium text-[#344054]">
                                                                {allocated.toLocaleString()}{' '}
                                                                {
                                                                    allocation.commodity_unit
                                                                }
                                                            </td>

                                                            {/* Disbursed */}
                                                            <td className="px-5 py-4 text-right text-sm font-semibold text-[#c9184a]">
                                                                {disbursed.toLocaleString()}{' '}
                                                                {
                                                                    allocation.commodity_unit
                                                                }
                                                            </td>

                                                            {/* Remaining */}
                                                            <td className="px-5 py-4 text-right">
                                                                <span
                                                                    className={
                                                                        hasRemaining
                                                                            ? 'font-semibold text-[#12b76a]'
                                                                            : 'font-semibold text-[#98a2b3]'
                                                                    }
                                                                >
                                                                    {remaining.toLocaleString()}{' '}
                                                                    {
                                                                        allocation.commodity_unit
                                                                    }
                                                                </span>
                                                            </td>

                                                            {/* Action */}
                                                            <td className="px-5 py-4">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openRecordModal(
                                                                                allocation,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !hasRemaining
                                                                        }
                                                                        className="inline-flex items-center gap-2 rounded-lg bg-[#c9184a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a9153d] disabled:cursor-not-allowed disabled:bg-[#d0d5dd]"
                                                                    >
                                                                        <PackageCheck
                                                                            size={
                                                                                16
                                                                            }
                                                                        />

                                                                        {hasRemaining
                                                                            ? 'Record'
                                                                            : 'Fully Disbursed'}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openHistoryModal(
                                                                                allocation,
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-2 rounded-lg border border-[#d0d5dd] bg-white px-4 py-2 text-sm font-semibold text-[#344054] shadow-sm transition hover:bg-[#f9fafb]"
                                                                    >
                                                                        <History
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                        History
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}

                                            {filteredAllocations.length ===
                                                0 && (
                                                <tr>
                                                    <td
                                                        colSpan={7}
                                                        className="px-5 py-16 text-center"
                                                    >
                                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f4f7] text-[#98a2b3]">
                                                            <Search
                                                                size={21}
                                                            />
                                                        </div>

                                                        <p className="mt-3 text-sm font-semibold text-[#344054]">
                                                            No records found
                                                        </p>

                                                        <p className="mt-1 text-sm text-[#667085]">
                                                            Try changing your
                                                            search keywords.
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

            {/* Record Disbursement Modal */}
            {selectedAllocation && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 px-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeRecordModal();
                        }
                    }}
                >
                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-[#eaecf0] px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fde7ed] text-[#c9184a]">
                                    <PackageCheck size={21} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-[#1f1f3a]">
                                        Record Disbursement
                                    </h2>

                                    <p className="mt-0.5 text-sm text-[#667085]">
                                        Record fertilizer released to this
                                        farmer.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeRecordModal}
                                className="rounded-lg p-2 text-[#98a2b3] transition hover:bg-[#f2f4f7] hover:text-[#344054]"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {/* Farmer Information */}
                        <div className="border-b border-[#eaecf0] bg-[#f9fafb] px-6 py-4">
                            <p className="text-sm font-semibold text-[#1f1f3a]">
                                {selectedAllocation.farmer_name}
                            </p>

                            <p className="mt-1 text-xs text-[#667085]">
                                {selectedAllocation.commodity_name} ·{' '}
                                {selectedAllocation.cycle_name}
                            </p>
                        </div>

                        {/* Allocation Summary */}
                        <div className="grid grid-cols-3 gap-3 px-6 py-5">
                            <div className="rounded-xl border border-[#eaecf0] bg-white p-3">
                                <p className="text-xs text-[#667085]">
                                    Allocated
                                </p>

                                <p className="mt-1 text-sm font-bold text-[#1f1f3a]">
                                    {Number(
                                        selectedAllocation.allocated_qty,
                                    ).toLocaleString()}{' '}
                                    {selectedAllocation.commodity_unit}
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#fde7ed] bg-[#fff8fa] p-3">
                                <p className="text-xs text-[#667085]">
                                    Disbursed
                                </p>

                                <p className="mt-1 text-sm font-bold text-[#c9184a]">
                                    {Number(
                                        selectedAllocation.disbursed_qty ?? 0,
                                    ).toLocaleString()}{' '}
                                    {selectedAllocation.commodity_unit}
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#abefc6] bg-[#f6fef9] p-3">
                                <p className="text-xs text-[#667085]">
                                    Remaining
                                </p>

                                <p className="mt-1 text-sm font-bold text-[#12b76a]">
                                    {(
                                        Number(
                                            selectedAllocation.allocated_qty,
                                        ) -
                                        Number(
                                            selectedAllocation.disbursed_qty ??
                                                0,
                                        )
                                    ).toLocaleString()}{' '}
                                    {selectedAllocation.commodity_unit}
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={submitDisbursement}
                            className="px-6 pb-6"
                        >
                            <div>
                                <label
                                    htmlFor="quantity"
                                    className="mb-2 block text-sm font-semibold text-[#344054]"
                                >
                                    Quantity to Disburse
                                </label>

                                <div className="relative">
                                    <input
                                        id="quantity"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={
                                            Number(
                                                selectedAllocation.allocated_qty,
                                            ) -
                                            Number(
                                                selectedAllocation.disbursed_qty ??
                                                    0,
                                            )
                                        }
                                        value={data.quantity}
                                        onChange={(event) =>
                                            setData(
                                                'quantity',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter quantity"
                                        autoFocus
                                        className="w-full rounded-xl border border-[#d0d5dd] bg-white px-4 py-3 pr-14 text-sm outline-none transition focus:border-[#c9184a] focus:ring-4 focus:ring-[#c9184a]/10"
                                    />

                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#98a2b3]">
                                        {
                                            selectedAllocation.commodity_unit
                                        }
                                    </span>
                                </div>

                                {errors.quantity && (
                                    <p className="mt-2 text-sm font-medium text-[#d92d20]">
                                        {errors.quantity}
                                    </p>
                                )}

                                <p className="mt-2 text-xs text-[#667085]">
                                    Maximum available:{' '}
                                    <span className="font-semibold text-[#344054]">
                                        {(
                                            Number(
                                                selectedAllocation.allocated_qty,
                                            ) -
                                            Number(
                                                selectedAllocation.disbursed_qty ??
                                                    0,
                                            )
                                        ).toLocaleString()}{' '}
                                        {
                                            selectedAllocation.commodity_unit
                                        }
                                    </span>
                                </p>
                            </div>

                            {/* Modal Actions */}
                            <div className="mt-6 flex justify-end gap-3 border-t border-[#eaecf0] pt-5">
                                <button
                                    type="button"
                                    onClick={closeRecordModal}
                                    className="rounded-xl border border-[#d0d5dd] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition hover:bg-[#f9fafb]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !data.quantity ||
                                        Number(data.quantity) <= 0
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#c9184a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a9153d] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <CheckCircle2 size={16} />

                                    {processing
                                        ? 'Recording...'
                                        : 'Record Disbursement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {historyAllocation && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 px-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeHistoryModal();
                        }
                    }}
                >
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-[#eaecf0] px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fde7ed] text-[#c9184a]">
                                    <History size={21} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-[#1f1f3a]">
                                        Disbursement History
                                    </h2>

                                    <p className="mt-0.5 text-sm text-[#667085]">
                                        {historyAllocation.farmer_name}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeHistoryModal}
                                className="rounded-lg p-2 text-[#98a2b3] transition hover:bg-[#f2f4f7] hover:text-[#344054]"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {/* Allocation Information */}
                        <div className="border-b border-[#eaecf0] bg-[#f9fafb] px-6 py-4">
                            <p className="text-sm font-semibold text-[#1f1f3a]">
                                {historyAllocation.commodity_name}
                            </p>

                            <p className="mt-1 text-xs text-[#667085]">
                                {historyAllocation.cycle_name}
                            </p>
                        </div>

                        <div className="p-6">
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-xl border border-[#eaecf0] bg-[#f9fafb] p-4">
                                    <p className="text-xs font-medium text-[#667085]">
                                        Allocated
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-[#1f1f3a]">
                                        {Number(
                                            historyAllocation.allocated_qty,
                                        ).toFixed(2)}{' '}
                                        {historyAllocation.commodity_unit}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-[#fde7ed] bg-[#fff8fa] p-4">
                                    <p className="text-xs font-medium text-[#c9184a]">
                                        Disbursed
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-[#c9184a]">
                                        {Number(
                                            historyAllocation.disbursed_qty ?? 0,
                                        ).toFixed(2)}{' '}
                                        {historyAllocation.commodity_unit}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-[#abefc6] bg-[#f6fef9] p-4">
                                    <p className="text-xs font-medium text-[#12b76a]">
                                        Remaining
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-[#12b76a]">
                                        {(
                                            Number(
                                                historyAllocation.allocated_qty,
                                            ) -
                                            Number(
                                                historyAllocation.disbursed_qty ??
                                                    0,
                                            )
                                        ).toFixed(2)}{' '}
                                        {historyAllocation.commodity_unit}
                                    </p>
                                </div>
                            </div>

                            {/* Transactions */}
                            <div className="mt-6">
                                <div className="mb-3">
                                    <p className="text-sm font-bold text-[#1f1f3a]">
                                        Release Transactions
                                    </p>

                                    <p className="mt-1 text-xs text-[#667085]">
                                        Individual fertilizer releases recorded
                                        for this allocation.
                                    </p>
                                </div>

                                {historyLoading ? (
                                    <div className="rounded-xl border border-[#eaecf0] px-4 py-10 text-center">
                                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#fde7ed] border-t-[#c9184a]" />

                                        <p className="mt-3 text-sm text-[#667085]">
                                            Loading history...
                                        </p>
                                    </div>
                                ) : historyRecords.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-[#d0d5dd] px-4 py-10 text-center">
                                        <History
                                            size={30}
                                            className="mx-auto text-[#98a2b3]"
                                        />

                                        <p className="mt-2 text-sm font-semibold text-[#344054]">
                                            No disbursement history yet
                                        </p>

                                        <p className="mt-1 text-xs text-[#667085]">
                                            Records will appear here after a
                                            disbursement is made.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-xl border border-[#eaecf0]">
                                        <table className="w-full">
                                            <thead className="bg-[#f9fafb]">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#667085]">
                                                        Date
                                                    </th>

                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#667085]">
                                                        Quantity
                                                    </th>

                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#667085]">
                                                        Recorded By
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-[#eaecf0]">
                                                {historyRecords.map(
                                                    (record) => (
                                                        <tr
                                                            key={
                                                                record.id
                                                            }
                                                            className="transition hover:bg-[#fcfcfd]"
                                                        >
                                                            <td className="px-4 py-3 text-sm text-[#344054]">
                                                                {new Date(
                                                                    record.created_at,
                                                                ).toLocaleDateString(
                                                                    'en-US',
                                                                    {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                    },
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-3 text-right text-sm font-semibold text-[#1f1f3a]">
                                                                {Number(
                                                                    record.quantity,
                                                                ).toFixed(2)}{' '}
                                                                {
                                                                    historyAllocation.commodity_unit
                                                                }
                                                            </td>

                                                            <td className="px-4 py-3 text-sm text-[#667085]">
                                                                {record.recorded_by ??
                                                                    'Unknown'}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end border-t border-[#eaecf0] bg-[#f9fafb] px-6 py-4">
                            <button
                                type="button"
                                onClick={closeHistoryModal}
                                className="rounded-xl border border-[#d0d5dd] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition hover:bg-[#f2f4f7]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}