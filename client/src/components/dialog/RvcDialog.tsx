//
// Custom dialog UI, for raising reminder and handling error.
// 

import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";

interface RvcDialogProps {
    title: string;
    onConfirm: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children?: React.ReactNode;
};

const RvcDialog = ({ title, onConfirm, open, onOpenChange, children }: RvcDialogProps) => {
    return(
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogTitle >
                    <div className="rvct-theme-700 text-2xl">{title}</div>
                </DialogTitle>
                <div className="py-4 rvct-theme-500">{children}</div>
                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                    <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded rvct-theme-500">Cancel</button>
                    </DialogClose>
                    <button
                        className="px-4 py-2 bg-rvc-primary-green hover:bg-rvc-secondary-green text-rvc-primary-white rvct-theme-500 rounded"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RvcDialog;