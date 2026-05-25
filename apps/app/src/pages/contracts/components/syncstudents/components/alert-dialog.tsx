import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
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
import { cn } from "@workspace/ui/lib/utils";

export type ConfirmAlertDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    isPending?: boolean;
    confirmVariant?: "default" | "destructive";
};

/** Confirmation alert for row / bulk actions inside the import dialog. */
export function ConfirmAlertDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    isPending = false,
    confirmVariant = "default",
}: ConfirmAlertDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="z-[110] sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        variant={confirmVariant}
                        disabled={isPending}
                        className={cn(confirmVariant === "destructive" && "gap-2")}
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm?.();
                        }}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="size-4 animate-spin" aria-hidden /> {confirmLabel}
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
