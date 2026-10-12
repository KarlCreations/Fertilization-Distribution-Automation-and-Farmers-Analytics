import { useForm } from '@inertiajs/react';
import { Scale } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

type StockOption = {
    id: number;
    commodity_name: string;
    lot_no: string;
    depot_name: string;
    on_hand_qty: number;
};

export default function WeighbridgeSlipDialog({
    open,
    stocks,
    onOpenChange,
}: {
    open: boolean;
    stocks: StockOption[];
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm({
        slip_number: '',
        direction: 'inbound',
        stock_level_id: '',
        truck_plate: '',
        gross_weight: '',
        tare_weight: '',
        notes: '',
    });
    const gross = Number(form.data.gross_weight);
    const tare = Number(form.data.tare_weight);
    const netWeight = gross > tare ? gross - tare : 0;

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(route('weighbridge-slips.store'), {
            onSuccess: () => {
                form.reset();
                form.clearErrors();
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    form.reset();
                    form.clearErrors();
                }
                onOpenChange(isOpen);
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto border-[#d0d5dd] bg-white text-[#101828] shadow-2xl sm:max-w-lg">
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#ecfdf3] text-[#067647]">
                    <Scale className="size-5" />
                </div>
                <DialogTitle className="text-[#101828]">Record a weighbridge slip</DialogTitle>
                <DialogDescription className="text-[#475467]">
                    Net weight is calculated as gross minus tare. Inbound slips add stock; outbound slips deduct stock. The slip and stock change save
                    together.
                </DialogDescription>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                            Slip number
                            <input
                                required
                                maxLength={100}
                                value={form.data.slip_number}
                                onChange={(event) => form.setData('slip_number', event.target.value)}
                                className="h-10 rounded-md border border-[#d0d5dd] px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            />
                            {form.errors.slip_number && <span className="text-xs font-normal text-red-600">{form.errors.slip_number}</span>}
                        </label>
                        <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                            Movement
                            <select
                                required
                                value={form.data.direction}
                                onChange={(event) => form.setData('direction', event.target.value)}
                                className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            >
                                <option value="inbound">Inbound · add stock</option>
                                <option value="outbound">Outbound · deduct stock</option>
                            </select>
                            {form.errors.direction && <span className="text-xs font-normal text-red-600">{form.errors.direction}</span>}
                        </label>
                    </div>
                    <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                        Stock record / depot
                        <select
                            required
                            value={form.data.stock_level_id}
                            onChange={(event) => form.setData('stock_level_id', event.target.value)}
                            className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                        >
                            <option value="">Select commodity, lot and depot</option>
                            {stocks.map((stock) => (
                                <option key={stock.id} value={stock.id}>
                                    {stock.commodity_name} · {stock.lot_no} · {stock.depot_name} ({Number(stock.on_hand_qty).toLocaleString()} MT)
                                </option>
                            ))}
                        </select>
                        {form.errors.stock_level_id && <span className="text-xs font-normal text-red-600">{form.errors.stock_level_id}</span>}
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                        Truck plate
                        <input
                            required
                            maxLength={50}
                            value={form.data.truck_plate}
                            onChange={(event) => form.setData('truck_plate', event.target.value)}
                            className="h-10 rounded-md border border-[#d0d5dd] px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                        />
                        {form.errors.truck_plate && <span className="text-xs font-normal text-red-600">{form.errors.truck_plate}</span>}
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                            Gross weight (MT)
                            <input
                                required
                                min="0.01"
                                step="0.01"
                                type="number"
                                value={form.data.gross_weight}
                                onChange={(event) => form.setData('gross_weight', event.target.value)}
                                className="h-10 rounded-md border border-[#d0d5dd] px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            />
                            {form.errors.gross_weight && <span className="text-xs font-normal text-red-600">{form.errors.gross_weight}</span>}
                        </label>
                        <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                            Tare weight (MT)
                            <input
                                required
                                min="0"
                                step="0.01"
                                type="number"
                                value={form.data.tare_weight}
                                onChange={(event) => form.setData('tare_weight', event.target.value)}
                                className="h-10 rounded-md border border-[#d0d5dd] px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            />
                            {form.errors.tare_weight && <span className="text-xs font-normal text-red-600">{form.errors.tare_weight}</span>}
                        </label>
                    </div>
                    <div className="rounded-md border border-[#d1fadf] bg-[#f6fef9] px-4 py-3">
                        <p className="text-xs font-medium text-[#067647]">Calculated net weight</p>
                        <p className="mt-1 text-lg font-semibold text-[#05603a]">
                            {netWeight.toLocaleString(undefined, { maximumFractionDigits: 2 })} MT
                        </p>
                    </div>
                    <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                        Notes <span className="font-normal text-[#667085]">(optional)</span>
                        <textarea
                            maxLength={1000}
                            rows={2}
                            value={form.data.notes}
                            onChange={(event) => form.setData('notes', event.target.value)}
                            className="rounded-md border border-[#d0d5dd] px-3 py-2 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                        />
                        {form.errors.notes && <span className="text-xs font-normal text-red-600">{form.errors.notes}</span>}
                    </label>
                    <div className="flex justify-end gap-2 border-t border-[#eaecf0] pt-4">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="h-9 rounded-md border border-[#d0d5dd] px-3 text-sm font-medium text-[#344054]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing || stocks.length === 0 || netWeight <= 0}
                            className="h-9 rounded-md bg-[#175cd3] px-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {form.processing ? 'Saving…' : 'Record slip & update stock'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
