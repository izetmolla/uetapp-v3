import type { FC } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteRecordAlertProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isPending?: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

const DeleteRecordAlert: FC<DeleteRecordAlertProps> = ({
    open,
    onOpenChange,
    onConfirm,
    isPending = false,
    title,
    description,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
}) => (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
                <AlertDialogAction
                    variant="destructive"
                    disabled={isPending}
                    onClick={(e) => {
                        e.preventDefault();
                        onConfirm();
                    }}
                    className="gap-2"
                >
                    {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                    {confirmLabel}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

export default DeleteRecordAlert;
