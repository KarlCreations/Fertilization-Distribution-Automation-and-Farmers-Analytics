import { CircleHelp } from 'lucide-react';
import { useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export default function WorkspaceHelpButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                aria-label="Help"
                onClick={() => setIsOpen(true)}
                className="hidden size-9 items-center justify-center rounded-md text-[#475467] hover:bg-[#f2f4f7] sm:flex"
            >
                <CircleHelp className="size-4" />
            </button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogTitle>Workspace help</DialogTitle>
                    <DialogDescription>
                        Dashboard metrics and charts read from shared SQLite records. Use the workspace navigation to open a module; saved changes
                        update its dashboard and related summaries.
                    </DialogDescription>
                    <div className="rounded-md bg-[#f9fafb] p-4 text-sm leading-6 text-[#475467]">
                        For inventory, use Stock receipt to add a batch, Transfer depots to move stock, and Reconcile to save a physical count.
                        Changes are recorded in the activity feed.
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
