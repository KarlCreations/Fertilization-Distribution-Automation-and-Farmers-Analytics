import { type ChangeEvent, type FormEventHandler, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Bell, CircleHelp, KeyRound, Leaf, LoaderCircle, Menu, Search, ShieldCheck, Upload, UserRound, X } from 'lucide-react';

import InputError from '@/components/input-error';
import WorkspaceSidebar from '@/components/workspace-sidebar';
import WorkspaceHeader from '@/components/workspace-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SharedData } from '@/types';

type ProfileData = {
    user: {
        id: number;
        name: string;
        email: string;
        role: string | null;
        avatar: string | null;
        created_at: string;
    };
    employee: {
        id: number;
        employee_code: string;
        department: string | null;
        position: string | null;
        is_active: boolean;
        zone_name: string | null;
        depot_name: string | null;
        depot_code: string | null;
    } | null;
};

function initials(name: string) {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

type NotificationPreferences = {
    leave_alerts: boolean;
    attendance_alerts: boolean;
    shift_alerts: boolean;
    employee_updates: boolean;
};

export default function HrSettings({
    profile,
    notificationPreferences,
}: {
    profile: ProfileData;
    notificationPreferences?: NotificationPreferences;
}) {
    const { auth, flash } = usePage<SharedData & { flash?: { success?: string; error?: string } }>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const employee = profile.employee;
    const avatar = profile.user.avatar ?? (auth.user.avatar as string | null) ?? null;

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [photoProcessing, setPhotoProcessing] = useState(false);

    const { data, setData, patch, processing, errors } = useForm({
        name: profile.user.name,
        email: profile.user.email,
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        put: putPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPassword,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const {
        data: notifData,
        setData: setNotifData,
        post: postNotif,
        processing: notifProcessing,
    } = useForm({
        leave_alerts: Boolean(notificationPreferences?.leave_alerts ?? true),
        attendance_alerts: Boolean(notificationPreferences?.attendance_alerts ?? true),
        shift_alerts: Boolean(notificationPreferences?.shift_alerts ?? true),
        employee_updates: Boolean(notificationPreferences?.employee_updates ?? true),
    });

    const submitProfile: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('hr-profile.update'));
    };

    const submitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        putPassword(route('hr-profile.password'), {
            onSuccess: () => resetPassword(),
        });
    };

    const submitNotificationPreferences: FormEventHandler = (e) => {
        e.preventDefault();
        postNotif(route('hr.settings.notifications'), {
            preserveScroll: true,
        });
    };

    const uploadPhoto = () => {
        if (!photoFile) {
            setPhotoError('Choose a JPG or PNG image first.');
            return;
        }

        const formData = new FormData();
        formData.append('profile_photo', photoFile);

        setPhotoProcessing(true);
        setPhotoError(null);

        router.post(route('hr-profile.photo'), formData, {
            preserveScroll: true,
            onFinish: () => {
                setPhotoProcessing(false);
                setPhotoFile(null);
                if (photoPreviewUrl) {
                    URL.revokeObjectURL(photoPreviewUrl);
                }
                setPhotoPreviewUrl(null);
                const input = document.getElementById('profile_photo_input') as HTMLInputElement | null;
                if (input) input.value = '';
            },
            onError: (formErrors) => setPhotoError(formErrors.profile_photo ?? 'Profile photo upload failed.'),
        });
    };

    const handlePhotoSelection = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] ?? null;

        if (photoPreviewUrl) {
            URL.revokeObjectURL(photoPreviewUrl);
        }

        setPhotoFile(selectedFile);
        setPhotoPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : null);
        setPhotoError(null);
    };

    const removePhoto = () => {
        router.delete(route('hr-profile.photo.destroy'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="My HR settings" />
            <div className="hr-interface min-h-screen bg-[#f6f8fb] text-[#101828]">
                <WorkspaceHeader />

                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />
                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        {flash?.success && (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-[#abefc6] bg-[#ecfdf3] p-4 text-sm font-medium text-[#067647]">
                                <ShieldCheck className="size-5 shrink-0" />
                                <span>{flash.success}</span>
                            </div>
                        )}
                        {flash?.error && (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-[#fecdca] bg-[#fff1f2] p-4 text-sm font-medium text-[#b42318]">
                                <X className="size-5 shrink-0" />
                                <span>{flash.error}</span>
                            </div>
                        )}

                        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="mb-2 flex gap-2 text-xs font-medium text-[#667085]">
                                    <span>Operations</span>
                                    <span>/</span>
                                    <span className="text-[#175cd3]">My HR settings</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">My HR settings</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                                    Manage your personal account details, contact information, and sign-in security.
                                </p>
                            </div>
                            <Link
                                href={route('hr-profile')}
                                className="flex h-9 w-fit items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb]"
                            >
                                <UserRound className="size-4" />
                                View profile
                            </Link>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
                            <aside className="rounded-lg border border-[#eaecf0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                <div className="flex flex-col items-center text-center">
                                    {photoPreviewUrl ? (
                                        <img src={photoPreviewUrl} alt="Selected photo preview" className="size-24 rounded-full object-cover ring-4 ring-[#eff4ff]" />
                                    ) : avatar ? (
                                        <img src={avatar} alt={profile.user.name} className="size-24 rounded-full object-cover ring-4 ring-[#eff4ff]" />
                                    ) : (
                                        <div className="flex size-24 items-center justify-center rounded-full bg-[#eff4ff] text-2xl font-semibold text-[#175cd3]">
                                            {initials(profile.user.name)}
                                        </div>
                                    )}
                                    <h2 className="mt-4 text-xl font-semibold text-[#101828]">{profile.user.name}</h2>
                                    <p className="mt-1 text-sm text-[#667085]">{profile.user.email}</p>
                                    <div className="mt-4 inline-flex items-center rounded-full bg-[#ecfdf3] px-2.5 py-1 text-xs font-medium text-[#067647]">
                                        {employee ? (employee.is_active ? 'Active employee' : 'Inactive employee') : 'No employee record'}
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <input
                                        id="profile_photo_input"
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        className="hidden"
                                        onChange={handlePhotoSelection}
                                    />
                                    <Button type="button" variant="outline" className="w-full justify-center" onClick={() => document.getElementById('profile_photo_input')?.click()}>
                                        <Upload className="mr-2 size-4" />
                                        {avatar ? 'Change photo' : 'Upload photo'}
                                    </Button>
                                    {photoFile && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="w-full justify-center"
                                            onClick={uploadPhoto}
                                            disabled={photoProcessing}
                                        >
                                            {photoProcessing ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
                                            Save selected photo
                                        </Button>
                                    )}
                                    {avatar && (
                                        <Button type="button" variant="destructive" className="w-full justify-center" onClick={removePhoto}>
                                            <X className="mr-2 size-4" />
                                            Remove photo
                                        </Button>
                                    )}
                                    {photoError && <p className="text-sm text-[#b42318]">{photoError}</p>}
                                </div>

                                <div className="mt-6 rounded-lg border border-[#eaecf0] bg-[#f9fafb] p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#667085]">Employment</p>
                                    <dl className="mt-3 space-y-3 text-sm">
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-[#667085]">Employee code</dt>
                                            <dd className="font-medium text-[#101828]">{employee?.employee_code ?? 'Not assigned'}</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-[#667085]">Department</dt>
                                            <dd className="font-medium text-[#101828]">{employee?.department ?? 'Not assigned'}</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-[#667085]">Position</dt>
                                            <dd className="font-medium text-[#101828]">{employee?.position ?? 'Not assigned'}</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-[#667085]">Zone</dt>
                                            <dd className="font-medium text-[#101828]">{employee?.zone_name ?? 'No zone assigned'}</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-[#667085]">Depot</dt>
                                            <dd className="font-medium text-[#101828]">{employee?.depot_name ? `${employee.depot_name}${employee.depot_code ? ` (${employee.depot_code})` : ''}` : 'No depot assigned'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </aside>

                            <div className="space-y-6">
                                <section className="rounded-lg border border-[#eaecf0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                            <UserRound className="size-4" />
                                        </span>
                                        <div>
                                            <h2 className="text-lg font-semibold text-[#101828]">Profile details</h2>
                                            <p className="text-sm text-[#667085]">Update the public name and contact information shown in your HR profile.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={submitProfile} className="space-y-5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Full name</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                autoComplete="name"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                                autoComplete="username"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="flex items-center justify-end">
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Saving...' : 'Save profile'}
                                            </Button>
                                        </div>
                                    </form>
                                </section>

                                <section className="rounded-lg border border-[#eaecf0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#f2f4f7] text-[#344054]">
                                            <KeyRound className="size-4" />
                                        </span>
                                        <div>
                                            <h2 className="text-lg font-semibold text-[#101828]">Password & security</h2>
                                            <p className="text-sm text-[#667085]">Update your password to keep your account secure.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={submitPassword} className="space-y-5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="current_password">Current password</Label>
                                            <Input
                                                id="current_password"
                                                type="password"
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                autoComplete="current-password"
                                                required
                                            />
                                            <InputError message={passwordErrors.current_password} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password">New password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData('password', e.target.value)}
                                                autoComplete="new-password"
                                                required
                                            />
                                            <InputError message={passwordErrors.password} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation">Confirm new password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={passwordData.password_confirmation}
                                                onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                autoComplete="new-password"
                                                required
                                            />
                                            <InputError message={passwordErrors.password_confirmation} />
                                        </div>

                                        <div className="flex items-center justify-end">
                                            <Button type="submit" variant="secondary" disabled={passwordProcessing}>
                                                {passwordProcessing ? 'Updating...' : 'Update password'}
                                            </Button>
                                        </div>
                                    </form>
                                </section>

                                <section className="rounded-lg border border-[#eaecf0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                            <Bell className="size-4" />
                                        </span>
                                        <div>
                                            <h2 className="text-lg font-semibold text-[#101828]">Notification preferences</h2>
                                            <p className="text-sm text-[#667085]">Turn HR operational notifications and system alerts on or off.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={submitNotificationPreferences} className="space-y-4">
                                        <div className="flex items-center justify-between rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-4">
                                            <div>
                                                <p className="text-sm font-medium text-[#101828]">Leave request alerts</p>
                                                <p className="text-xs text-[#667085]">Get notified when employees submit or update leave applications.</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifData.leave_alerts}
                                                onChange={(e) => setNotifData('leave_alerts', e.target.checked)}
                                                className="size-5 rounded text-[#175cd3] focus:ring-[#175cd3]"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-4">
                                            <div>
                                                <p className="text-sm font-medium text-[#101828]">Attendance alerts</p>
                                                <p className="text-xs text-[#667085]">Get notified for late check-ins, unexcused absences, or overtime.</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifData.attendance_alerts}
                                                onChange={(e) => setNotifData('attendance_alerts', e.target.checked)}
                                                className="size-5 rounded text-[#175cd3] focus:ring-[#175cd3]"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-4">
                                            <div>
                                                <p className="text-sm font-medium text-[#101828]">Shift schedule alerts</p>
                                                <p className="text-xs text-[#667085]">Get notified when shifts are assigned, changed, or swapped.</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifData.shift_alerts}
                                                onChange={(e) => setNotifData('shift_alerts', e.target.checked)}
                                                className="size-5 rounded text-[#175cd3] focus:ring-[#175cd3]"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-4">
                                            <div>
                                                <p className="text-sm font-medium text-[#101828]">Employee roster updates</p>
                                                <p className="text-xs text-[#667085]">Get notified when new employees are added or statuses are updated.</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifData.employee_updates}
                                                onChange={(e) => setNotifData('employee_updates', e.target.checked)}
                                                className="size-5 rounded text-[#175cd3] focus:ring-[#175cd3]"
                                            />
                                        </div>

                                        <div className="flex items-center justify-end pt-2">
                                            <Button type="submit" disabled={notifProcessing}>
                                                {notifProcessing ? 'Saving...' : 'Save notification preferences'}
                                            </Button>
                                        </div>
                                    </form>
                                </section>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
