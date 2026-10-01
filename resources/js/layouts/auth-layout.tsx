import { Leaf } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode; title?: string; description?: string }) {
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';

    return (
        <main className="grid min-h-screen bg-[#f8fafc] lg:grid-cols-[1.05fr_0.95fr]">
            <section className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-16">
                <div className="w-full max-w-md">{children}</div>
            </section>
            <aside className="relative hidden overflow-hidden bg-[#0a4f3d] p-14 text-white lg:flex lg:flex-col lg:justify-between">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)',
                        backgroundSize: '52px 52px',
                    }}
                />
                <div className="relative flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                        <Leaf className="size-5" aria-hidden="true" />
                    </div>
                    <span className="text-lg font-semibold">{systemName}</span>
                </div>
                <div className="relative max-w-lg">
                    <p className="text-sm font-semibold tracking-[0.16em] text-[#b7ead3] uppercase">Connected operations</p>
                    <h2 className="mt-4 text-4xl leading-tight font-semibold">A clearer view of your agricultural enterprise.</h2>
                    <p className="mt-5 max-w-md text-base leading-7 text-[#d5f2e4]">
                        Bring field, inventory, and finance operations into one ready workspace.
                    </p>
                </div>
                <div className="relative flex items-center gap-3 text-sm text-[#d5f2e4]">
                    <span className="size-2 rounded-full bg-[#72e0ad]" />
                    Secure access for your team
                </div>
            </aside>
        </main>
    );
}
