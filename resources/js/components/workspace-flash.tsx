import { usePage } from '@inertiajs/react';

import { type SharedData } from '@/types';

export default function WorkspaceFlash() {
    const { flash } = usePage<SharedData>().props;

    if (!flash?.success && !flash?.error) {
        return null;
    }

    const message = flash.success ?? flash.error;
    const isSuccess = Boolean(flash.success);

    return (
        <div
            role={isSuccess ? 'status' : 'alert'}
            className={`fixed top-20 right-4 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${
                isSuccess ? 'border-[#a6f4c5] bg-[#ecfdf3] text-[#067647]' : 'border-[#fecdca] bg-[#fef3f2] text-[#b42318]'
            }`}
        >
            {message}
        </div>
    );
}
