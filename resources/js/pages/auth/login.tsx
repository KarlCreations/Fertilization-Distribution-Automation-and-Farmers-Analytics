import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Eye, Leaf, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout>
            <Head title="Sign in" />

            <div className="mb-8">
                <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-[#0b6b4f] text-white shadow-sm">
                    <Leaf className="size-5" aria-hidden="true" />
                </div>
                <p className="text-xs font-semibold tracking-[0.16em] text-[#0b6b4f] uppercase">Operations portal</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#101828]">Welcome back</h1>
                <p className="mt-2 text-sm leading-6 text-[#667085]">Sign in to access your operations workspace.</p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-sm font-medium text-[#344054]">
                            Email address
                        </Label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" aria-hidden="true" />
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@organization.com"
                                className="h-11 rounded-md border-[#d0d5dd] bg-white pl-10 text-[#101828] shadow-xs focus-visible:border-[#175cd3] focus-visible:ring-[#175cd3]/20"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center gap-4">
                            <Label htmlFor="password" className="text-sm font-medium text-[#344054]">
                                Password
                            </Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm font-medium text-[#175cd3]" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <LockKeyhole
                                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]"
                                aria-hidden="true"
                            />
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Enter your password"
                                className="h-11 rounded-md border-[#d0d5dd] bg-white pl-10 text-[#101828] shadow-xs focus-visible:border-[#175cd3] focus-visible:ring-[#175cd3]/20"
                            />
                            <Eye className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#98a2b3]" aria-hidden="true" />
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            tabIndex={3}
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                            className="border-[#98a2b3] data-[state=checked]:border-[#0b6b4f] data-[state=checked]:bg-[#0b6b4f]"
                        />
                        <Label htmlFor="remember" className="text-sm text-[#475467]">
                            Keep me signed in
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 h-11 w-full rounded-md bg-[#101828] text-sm font-semibold text-white hover:bg-[#344054]"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Sign in
                        {!processing && <ArrowRight className="size-4" aria-hidden="true" />}
                    </Button>
                </div>
            </form>

            {status && <div className="mt-5 text-center text-sm font-medium text-[#0b6b4f]">{status}</div>}
        </AuthLayout>
    );
}
