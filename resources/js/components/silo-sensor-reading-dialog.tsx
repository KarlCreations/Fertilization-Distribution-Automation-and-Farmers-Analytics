import { useForm } from '@inertiajs/react';
import { Radio } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

type StockOption = {
    id: number;
    commodity_name: string;
    lot_no: string;
    depot_name: string;
    on_hand_qty: number;
};

export default function SiloSensorReadingDialog({
    open,
    stocks,
    onOpenChange,
}: {
    open: boolean;
    stocks: StockOption[];
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm({
        stock_level_id: '',
        sensor_code: '',
        level_percent: '',
        temperature_c: '',
        moisture_percent: '',
        status: 'normal',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(route('silo-sensor-readings.store'), {
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
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#eff8ff] text-[#175cd3]">
                    <Radio className="size-5" />
                </div>
                <DialogTitle className="text-[#101828]">Record a silo sensor reading</DialogTitle>
                <DialogDescription className="text-[#475467]">
                    Enter a manual observation for a stock record. Readings are saved to SQLite and the activity feed; they do not change stock
                    quantity.
                </DialogDescription>
                <form onSubmit={submit} className="grid gap-4">
                    <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                        Linked stock record
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
                        Sensor identifier
                        <input
                            required
                            maxLength={100}
                            value={form.data.sensor_code}
                            onChange={(event) => form.setData('sensor_code', event.target.value)}
                            placeholder="e.g. SILO-01-TEMP"
                            className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                        />
                        {form.errors.sensor_code && <span className="text-xs font-normal text-red-600">{form.errors.sensor_code}</span>}
                    </label>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                            Silo fill (%)
                            <input
                                required
                                min="0"
                                max="100"
                                step="0.01"
                                type="number"
                                value={form.data.level_percent}
                                onChange={(event) => form.setData('level_percent', event.target.value)}
                                className="h-10 min-w-0 rounded-md border border-[#d0d5dd] px-2 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            />
                            {form.errors.level_percent && <span className="text-xs font-normal text-red-600">{form.errors.level_percent}</span>}
                        </label>
                        <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                            Temperature (°C)
                            <input
                                required
                                min="-50"
                                max="100"
                                step="0.01"
                                type="number"
                                value={form.data.temperature_c}
                                onChange={(event) => form.setData('temperature_c', event.target.value)}
                                className="h-10 min-w-0 rounded-md border border-[#d0d5dd] px-2 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            />
                            {form.errors.temperature_c && <span className="text-xs font-normal text-red-600">{form.errors.temperature_c}</span>}
                        </label>
                        <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                            Moisture (%)
                            <input
                                required
                                min="0"
                                max="100"
                                step="0.01"
                                type="number"
                                value={form.data.moisture_percent}
                                onChange={(event) => form.setData('moisture_percent', event.target.value)}
                                className="h-10 min-w-0 rounded-md border border-[#d0d5dd] px-2 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            />
                            {form.errors.moisture_percent && <span className="text-xs font-normal text-red-600">{form.errors.moisture_percent}</span>}
                        </label>
                    </div>
                    <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                        Reading status
                        <select
                            required
                            value={form.data.status}
                            onChange={(event) => form.setData('status', event.target.value)}
                            className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                        >
                            <option value="normal">Normal</option>
                            <option value="warning">Warning</option>
                            <option value="critical">Critical</option>
                        </select>
                        {form.errors.status && <span className="text-xs font-normal text-red-600">{form.errors.status}</span>}
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
                            disabled={form.processing || stocks.length === 0}
                            className="h-9 rounded-md bg-[#175cd3] px-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {form.processing ? 'Saving…' : 'Save reading'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
