import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { AlertTriangle, Globe, Loader2, Trash2 } from "lucide-react";
import type { FC } from "react";
import { useMutation, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessageFromBody, isApiErrorBody, queryClient } from "@workspace/flowtrove/lib/network";
import { useTranslation } from "react-i18next";
import useDomainsListStore from "../../store";
import { deleteDomain } from "./api";

interface DeleteDomainDialogProps {
    queryKey: QueryKey;
}

const DeleteDomainDialog: FC<DeleteDomainDialogProps> = ({ queryKey }) => {
    const { t } = useTranslation();
    const { selectedDomain, isDeleteDomainDialogOpen, resetDomainDialogContext } = useDomainsListStore();

    const closeDialog = () => {
        resetDomainDialogContext();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) closeDialog();
    };

    const deleteMutation = useMutation({
        mutationFn: deleteDomain,
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to delete domain")), { richColors: true });
                return;
            }
            toast.success(t("Domain deleted successfully"), { richColors: true });
            void queryClient.invalidateQueries({ queryKey });
            closeDialog();
        },
        onError: (error: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(error?.response?.data?.message ?? error?.message ?? t("Failed to delete domain"), {
                richColors: true,
            });
        },
    });

    const displayHost = selectedDomain?.domain?.trim() || "";

    return (
        <AlertDialog open={isDeleteDomainDialogOpen} onOpenChange={handleOpenChange}>
            <AlertDialogContent
                size="default"
                className="w-full max-w-[520px] gap-0 overflow-hidden p-0 sm:max-w-[520px]"
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <AlertDialogHeader className="flex w-full min-w-0 flex-col items-stretch gap-4 p-5 text-left sm:p-6">
                    <div className="flex min-w-0 flex-col items-center gap-3 text-center">
                        <div
                            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/15 dark:bg-destructive/15 dark:ring-destructive/25"
                            aria-hidden
                        >
                            <Trash2 className="size-5 text-destructive" />
                        </div>
                        <div className="min-w-0 space-y-1.5">
                            <AlertDialogTitle className="text-lg font-semibold leading-snug tracking-tight">
                                {t("Delete domain?")}
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {t("This will permanently remove the domain and related routing. This action cannot be undone.")}
                                </p>
                            </AlertDialogDescription>
                        </div>
                    </div>

                    {selectedDomain ? (
                        <div className="w-full min-w-0 rounded-lg border border-border/80 bg-muted/25 px-3 py-2.5">
                            <div className="flex min-w-0 items-start gap-2 text-sm text-foreground">
                                <Globe className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                                <span className="min-w-0 break-all font-mono text-[13px] leading-snug">{displayHost}</span>
                            </div>
                            <p className="mt-1.5 pl-[1.375rem] text-xs capitalize text-muted-foreground">
                                {selectedDomain.type}
                            </p>
                        </div>
                    ) : null}

                    <div
                        className={cn(
                            "flex w-full min-w-0 items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed",
                            "border-amber-200/90 bg-amber-50/90 text-amber-950",
                            "dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100",
                        )}
                    >
                        <AlertTriangle className="mt-px size-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                        <span>{t("Traffic and certificates that depend on this host may stop working.")}</span>
                    </div>
                </AlertDialogHeader>

                <AlertDialogFooter className="mx-0 mb-0 flex flex-row justify-end gap-2 rounded-b-xl border-t border-border/60 bg-muted/30 px-5 py-3 sm:px-6">
                    <AlertDialogCancel size="sm" className="min-w-0 px-3" disabled={deleteMutation.isPending}>
                        {t("Cancel")}
                    </AlertDialogCancel>
                    <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className={cn(
                            "min-w-0 gap-1.5 px-3",
                            "bg-destructive text-destructive-foreground shadow-sm",
                            "hover:bg-destructive/90 dark:hover:bg-destructive/90",
                            "focus-visible:border-destructive focus-visible:ring-destructive/25 dark:focus-visible:ring-destructive/40",
                        )}
                        disabled={deleteMutation.isPending || !selectedDomain?.id}
                        onClick={() => {
                            if (!selectedDomain?.id) return;
                            deleteMutation.mutate({ id: selectedDomain.id });
                        }}
                    >
                        {deleteMutation.isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
                        {deleteMutation.isPending ? t("Deleting…") : t("Delete")}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteDomainDialog;
