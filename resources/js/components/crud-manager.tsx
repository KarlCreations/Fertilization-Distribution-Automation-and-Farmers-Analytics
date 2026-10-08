import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Option = { label: string; value: string | number };
type Field = {
    name: string;
    label: string;
    type?: 'text' | 'number' | 'select' | 'checkbox';
    required?: boolean;
    readOnlyOnEdit?: boolean;
    options?: Option[];
    displayName?: string;
};
type RecordData = Record<string, string | number | boolean | null> & { id: number };

function formDefaults(fields: Field[]): Record<string, string | number | boolean | null> {
    return Object.fromEntries(fields.map(({ name, type }) => [name, type === 'checkbox' ? false : '']));
}

export default function CrudManager({
    id,
    title,
    fields,
    records,
    createUrl,
    updateUrl,
    deleteUrl,
    totalRecordCount,
    emptyMessage = 'No records yet.',
    canManage = true,
    canCreate = true,
    canDelete = true,
}: {
    id?: string;
    title: string;
    fields: Field[];
    records: RecordData[];
    createUrl: string;
    updateUrl: (id: number) => string;
    deleteUrl: (id: number) => string;
    totalRecordCount?: number;
    emptyMessage?: string;
    canManage?: boolean;
    canCreate?: boolean;
    canDelete?: boolean;
}) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const form = useForm<Record<string, string | number | boolean | null>>(formDefaults(fields));
    const visibleFields = fields.filter((field) => field.type !== 'checkbox');

    function resetForm() {
        form.reset();
        form.clearErrors();
        setEditingId(null);
    }

    function startEditing(record: RecordData) {
        const values = formDefaults(fields);

        for (const field of fields) {
            values[field.name] = record[field.name] ?? values[field.name];
        }

        form.setData(values);
        form.clearErrors();
        setEditingId(record.id);
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const options = { onSuccess: resetForm };

        if (editingId === null) {
            form.post(createUrl, options);
        } else {
            form.put(updateUrl(editingId), options);
        }
    }

    function deleteRecord(record: RecordData) {
        if (!window.confirm(`Delete this ${title.toLowerCase()} record? This action cannot be undone.`)) {
            return;
        }

        form.delete(deleteUrl(record.id));
    }

    return (
        <section
            id={id}
            className="mt-6 scroll-mt-20 overflow-hidden rounded-lg border border-[#eaecf0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
        >
            <div className="border-b border-[#eaecf0] p-5">
                <h2 className="text-sm font-semibold text-[#101828]">{title}</h2>
                <p className="mt-1 text-xs text-[#667085]">
                    {totalRecordCount !== undefined && totalRecordCount !== records.length
                        ? `Showing ${records.length} of ${totalRecordCount} record(s) saved in SQLite.`
                        : `${records.length} record(s) saved in SQLite.`}
                </p>
            </div>
            {canManage && (canCreate || editingId !== null) && (
                <form onSubmit={submit} className="grid gap-4 border-b border-[#eaecf0] bg-[#fbfcfe] p-5 sm:grid-cols-2 xl:grid-cols-4">
                    {fields.map((field) => (
                        <label
                            key={field.name}
                            className={`grid gap-1.5 text-xs font-medium text-[#475467] ${field.type === 'checkbox' ? 'flex items-center gap-2 self-end pb-2' : ''}`}
                        >
                            {field.type === 'checkbox' ? (
                                <>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(form.data[field.name])}
                                        onChange={(event) => form.setData(field.name, event.target.checked)}
                                        className="size-4 rounded border-[#d0d5dd]"
                                    />
                                    {field.label}
                                </>
                            ) : (
                                <>
                                    {field.label}
                                    {field.type === 'select' ? (
                                        <select
                                            required={field.required}
                                            value={String(form.data[field.name] ?? '')}
                                            onChange={(event) => form.setData(field.name, event.target.value)}
                                            disabled={editingId !== null && field.readOnlyOnEdit}
                                            className="h-9 rounded-md border border-[#d0d5dd] bg-white px-2 text-sm"
                                        >
                                            <option value="">Select {field.label.toLowerCase()}</option>
                                            {(field.options ?? []).map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type ?? 'text'}
                                            required={field.required}
                                            min={field.type === 'number' ? 0 : undefined}
                                            step={field.type === 'number' ? 'any' : undefined}
                                            value={String(form.data[field.name] ?? '')}
                                            onChange={(event) => form.setData(field.name, event.target.value)}
                                            readOnly={editingId !== null && field.readOnlyOnEdit}
                                            className="h-9 rounded-md border border-[#d0d5dd] bg-white px-2 text-sm"
                                        />
                                    )}
                                </>
                            )}
                            {form.errors[field.name] && <span className="font-normal text-red-600">{form.errors[field.name]}</span>}
                        </label>
                    ))}
                    <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-4">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="h-9 rounded-md bg-[#175cd3] px-4 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {form.processing ? 'Saving…' : editingId === null ? `Add ${title.toLowerCase()}` : 'Save changes'}
                        </button>
                        {editingId !== null && (
                            <button type="button" onClick={resetForm} className="h-9 rounded-md border border-[#d0d5dd] px-4 text-sm text-[#475467]">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-[#f9fafb] text-xs text-[#667085] uppercase">
                        <tr>
                            {visibleFields.map((field) => (
                                <th key={field.name} className="px-5 py-3">
                                    {field.label}
                                </th>
                            ))}
                            {canManage && <th className="px-5 py-3">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaecf0]">
                        {records.length === 0 ? (
                            <tr>
                                <td colSpan={visibleFields.length + (canManage ? 1 : 0)} className="px-5 py-10 text-center text-sm text-[#667085]">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            records.map((record) => (
                                <tr key={record.id} className="text-[#475467]">
                                    {visibleFields.map((field) => (
                                        <td key={field.name} className="px-5 py-3">
                                            {String(record[field.displayName ?? field.name] ?? record[field.name] ?? '—')}
                                        </td>
                                    ))}
                                    {canManage && (
                                        <td className="px-5 py-3">
                                            <div className="flex gap-3">
                                                {canManage && (
                                                    <button type="button" onClick={() => startEditing(record)} className="font-medium text-[#175cd3]">
                                                        Edit
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        disabled={form.processing}
                                                        onClick={() => deleteRecord(record)}
                                                        className="font-medium text-red-600 disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
