import { useForm } from '@inertiajs/react';
import { ArrowRightLeft, ClipboardCheck } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';

type StockOption = {
    id: number;
    depot_id: number;
    commodity_name: string;
    lot_no: string;
    depot_name: string;
    on_hand_qty: number;
};

type DepotOption = { id: number; name: string };
type Workflow = 'transfer' | 'reconcile';

export default function StockMovementDialog({
    workflow,
    stocks,
    depots,
    onOpenChange,
}: {
    workflow: Workflow | null;
    stocks: StockOption[];
    depots: DepotOption[];
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm({
        source_stock_level_id: '',
        destination_depot_id: '',
        quantity: '',
        stock_level_id: '',
        counted_qty: '',
        reason: '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                form.reset();
                form.clearErrors();
                onOpenChange(false);
            },
        };

        if (workflow === 'transfer') {
            form.transform((data) => ({
                source_stock_level_id: data.source_stock_level_id,
                destination_depot_id: data.destination_depot_id,
                quantity: data.quantity,
            }));
            form.post(route('stock-transfers.store'), options);
            return;
        }

        form.transform((data) => ({
            stock_level_id: data.stock_level_id,
            counted_qty: data.counted_qty,
            reason: data.reason,
        }));
        form.post(route('stock-reconciliations.store'), options);
    }

    const isTransfer = workflow === 'transfer';
    const selectedStockId = isTransfer ? form.data.source_stock_level_id : form.data.stock_level_id;

    return (
        <Dialog
            open={workflow !== null}
            onOpenChange={(open) => {
                if (!open) {
                    form.reset();
                    form.clearErrors();
                }
                onOpenChange(open);
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto border-[#d0d5dd] bg-white text-[#101828] shadow-2xl sm:max-w-lg">
                <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-[#eff4ff] text-[#175cd3]">
                    {isTransfer ? <ArrowRightLeft className="size-5" /> : <ClipboardCheck className="size-5" />}
                </div>
                <DialogTitle className="text-[#101828]">
                    {isTransfer ? 'Transfer stock between depots' : 'Reconcile physical stock count'}
                </DialogTitle>
                <DialogDescription className="text-[#475467]">
                    {isTransfer
                        ? 'Move a batch quantity between depots. The source and destination balances update together and are recorded in the audit log.'
                        : 'Record the physically counted quantity. The stock balance, stock status, and audit history update together.'}
                </DialogDescription>
                <form onSubmit={submit} className="grid gap-4">
                    <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                        {isTransfer ? 'Source stock' : 'Stock to count'}
                        <select
                            required
                            value={selectedStockId}
                            onChange={(event) => form.setData(isTransfer ? 'source_stock_level_id' : 'stock_level_id', event.target.value)}
                            className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                        >
                            <option value="">Select stock and depot</option>
                            {stocks.map((stock) => (
                                <option key={stock.id} value={stock.id}>
                                    {stock.commodity_name} · {stock.lot_no} · {stock.depot_name} ({Number(stock.on_hand_qty).toLocaleString()} MT)
                                </option>
                            ))}
                        </select>
                        {form.errors.source_stock_level_id && (
                            <span className="text-xs font-normal text-red-600">{form.errors.source_stock_level_id}</span>
                        )}
                        {form.errors.stock_level_id && <span className="text-xs font-normal text-red-600">{form.errors.stock_level_id}</span>}
                    </label>

                    {isTransfer ? (
                        <>
                            <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                                Destination depot
                                <select
                                    required
                                    value={form.data.destination_depot_id}
                                    onChange={(event) => form.setData('destination_depot_id', event.target.value)}
                                    className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                                >
                                    <option value="">Select destination</option>
                                    {depots
                                        .filter((depot) => depot.id !== stocks.find((stock) => String(stock.id) === selectedStockId)?.depot_id)
                                        .map((depot) => (
                                            <option key={depot.id} value={depot.id}>
                                                {depot.name}
                                            </option>
                                        ))}
                                </select>
                                {form.errors.destination_depot_id && (
                                    <span className="text-xs font-normal text-red-600">{form.errors.destination_depot_id}</span>
                                )}
                            </label>
                            <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                                Quantity to transfer (MT)
                                <input
                                    required
                                    min="0.01"
                                    step="0.01"
                                    type="number"
                                    value={form.data.quantity}
                                    onChange={(event) => form.setData('quantity', event.target.value)}
                                    className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                                />
                                {form.errors.quantity && <span className="text-xs font-normal text-red-600">{form.errors.quantity}</span>}
                            </label>
                        </>
                    ) : (
                        <>
                            <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                                Counted quantity (MT)
                                <input
                                    required
                                    min="0"
                                    step="0.01"
                                    type="number"
                                    value={form.data.counted_qty}
                                    onChange={(event) => form.setData('counted_qty', event.target.value)}
                                    className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                                />
                                {form.errors.counted_qty && <span className="text-xs font-normal text-red-600">{form.errors.counted_qty}</span>}
                            </label>
                            <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                                Reconciliation note
                                <textarea
                                    rows={3}
                                    maxLength={500}
                                    value={form.data.reason}
                                    onChange={(event) => form.setData('reason', event.target.value)}
                                    className="resize-y rounded-md border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#101828] outline-none placeholder:text-[#667085] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                                    placeholder="Optional note about the physical count"
                                />
                                {form.errors.reason && <span className="text-xs font-normal text-red-600">{form.errors.reason}</span>}
                            </label>
                        </>
                    )}

                    {stocks.length === 0 && (
                        <p className="rounded-md border border-[#fedf89] bg-[#fffaeb] p-3 text-xs font-medium text-[#7a2e0e]">
                            Add a stock record before starting this workflow.
                        </p>
                    )}
                    {isTransfer && depots.length < 2 && (
                        <p className="rounded-md border border-[#fedf89] bg-[#fffaeb] p-3 text-xs font-medium text-[#7a2e0e]">
                            At least two depots are required for a transfer.
                        </p>
                    )}
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="h-10 rounded-md border border-[#d0d5dd] bg-white px-4 text-sm font-medium text-[#344054] hover:bg-[#f9fafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#175cd3]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing || stocks.length === 0 || (isTransfer && depots.length < 2)}
                            className="h-10 rounded-md bg-[#175cd3] px-4 text-sm font-semibold text-white hover:bg-[#1849a9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#175cd3] disabled:cursor-not-allowed disabled:bg-[#98a2b3] disabled:text-white"
                        >
                            {form.processing ? 'Saving…' : isTransfer ? 'Complete transfer' : 'Save reconciliation'}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
