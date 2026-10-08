import { useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';

type SystemUser = { id: number; name: string; email: string; role: string | null; is_active: boolean | null };
type SystemRole = { id: number; code: string; name: string; description: string | null };
type UserForm = { name: string; email: string; role: string; password: string };

export default function SystemUserManager({ users, roles }: { users: SystemUser[]; roles: SystemRole[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const form = useForm<UserForm>({ name: '', email: '', role: '', password: '' });

    function resetForm() {
        form.reset();
        form.clearErrors();
        setEditingId(null);
    }

    function editUser(user: SystemUser) {
        form.setData({ name: user.name, email: user.email, role: user.role ?? '', password: '' });
        form.clearErrors();
        setEditingId(user.id);
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const options = { onSuccess: resetForm };

        if (editingId === null) {
            form.post(route('system-users.store'), options);
        } else {
            form.put(route('system-users.update', { user: editingId }), options);
        }
    }

    return (
        <section id="system-user-manager" className="border-t border-[#eaecf0]">
            <form onSubmit={submit} className="grid gap-3 bg-[#fbfcfe] p-5 sm:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-1.5 text-xs font-medium text-[#475467]">
                    Full name
                    <input
                        required
                        value={form.data.name}
                        onChange={(event) => form.setData('name', event.target.value)}
                        className="h-9 rounded-md border border-[#d0d5dd] bg-white px-2 text-sm"
                    />
                    {form.errors.name && <span className="font-normal text-red-600">{form.errors.name}</span>}
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-[#475467]">
                    Email
                    <input
                        type="email"
                        required
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                        className="h-9 rounded-md border border-[#d0d5dd] bg-white px-2 text-sm"
                    />
                    {form.errors.email && <span className="font-normal text-red-600">{form.errors.email}</span>}
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-[#475467]">
                    Role
                    <select
                        required
                        value={form.data.role}
                        onChange={(event) => form.setData('role', event.target.value)}
                        className="h-9 rounded-md border border-[#d0d5dd] bg-white px-2 text-sm"
                    >
                        <option value="">Select role</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.code}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                    {form.errors.role && <span className="font-normal text-red-600">{form.errors.role}</span>}
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-[#475467]">
                    {editingId === null ? 'Temporary password' : 'New password (optional)'}
                    <input
                        type="password"
                        autoComplete="new-password"
                        required={editingId === null}
                        minLength={8}
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                        className="h-9 rounded-md border border-[#d0d5dd] bg-white px-2 text-sm"
                    />
                    {form.errors.password && <span className="font-normal text-red-600">{form.errors.password}</span>}
                </label>
                <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-4">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="h-9 rounded-md bg-[#175cd3] px-4 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {form.processing ? 'Saving…' : editingId === null ? 'Provision account' : 'Save account'}
                    </button>
                    {editingId !== null && (
                        <button type="button" onClick={resetForm} className="h-9 rounded-md border border-[#d0d5dd] px-4 text-sm text-[#475467]">
                            Cancel
                        </button>
                    )}
                </div>
            </form>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="bg-[#f9fafb] text-xs text-[#667085] uppercase">
                        <tr>
                            <th className="px-5 py-3">User</th>
                            <th className="px-5 py-3">Role</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaecf0]">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-6 text-center text-sm text-[#667085]">
                                    No user accounts match this search.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="text-xs text-[#475467]">
                                    <td className="px-5 py-3">
                                        <p className="font-medium text-[#101828]">{user.name}</p>
                                        <p className="mt-1">{user.email}</p>
                                    </td>
                                    <td className="px-5 py-3">{roles.find((role) => role.code === user.role)?.name ?? user.role ?? 'No role'}</td>
                                    <td className="px-5 py-3">
                                        {user.is_active === null ? 'No employee profile' : user.is_active ? 'Active' : 'Inactive'}
                                    </td>
                                    <td className="px-5 py-3">
                                        <button type="button" onClick={() => editUser(user)} className="font-medium text-[#175cd3]">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
