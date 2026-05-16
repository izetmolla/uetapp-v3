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
import { Globe, Info, Loader2, Star } from "lucide-react";
import type { FC } from "react";
import { useMutation, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessageFromBody, isApiErrorBody, queryClient } from "@workspace/flowtrove/lib/network";
import { useTranslation } from "react-i18next";
import useDomainsListStore from "../../store";
import { makeDomainPrimary } from "./api";

interface MakeDomainPrimaryDialogProps {
    queryKey: QueryKey;
}

const MakeDomainPrimaryDialog: FC<MakeDomainPrimaryDialogProps> = ({ queryKey }) => {
    const { t } = useTranslation();
    const {
        selectedDomain,
        isMakePrimaryDomainDialogOpen,
        setIsMakePrimaryDomainDialogOpen,
        setSelectedDomain,
    } = useDomainsListStore();

    const closeDialog = () => {
        setIsMakePrimaryDomainDialogOpen(false);
        setSelectedDomain(null);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) closeDialog();
    };

    const mutation = useMutation({
        mutationFn: makeDomainPrimary,
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to set primary domain")), { richColors: true });
                return;
            }
            toast.success(t("Primary domain updated"), { richColors: true });
            void queryClient.invalidateQueries({ queryKey });
            closeDialog();
        },
        onError: (error: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(error?.response?.data?.message ?? error?.message ?? t("Failed to set primary domain"), {
                richColors: true,
            });
        },
    });

    const displayHost = selectedDomain?.domain?.trim() || "";

    return (
        <AlertDialog open={isMakePrimaryDomainDialogOpen} onOpenChange={handleOpenChange}>
            <AlertDialogContent
                size="default"
                className="w-full max-w-[520px] gap-0 overflow-hidden p-0 sm:max-w-[520px]"
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <AlertDialogHeader className="flex w-full min-w-0 flex-col items-stretch gap-4 p-5 text-left sm:p-6">
                    <div className="flex min-w-0 flex-col items-center gap-3 text-center">
                        <div
                            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 dark:bg-primary/15 dark:ring-primary/25"
                            aria-hidden
                        >
                            <Star className="size-5 fill-primary/25 text-primary" />
                        </div>
                        <div className="min-w-0 space-y-1.5">
                            <AlertDialogTitle className="text-lg font-semibold leading-snug tracking-tight">
                                {t("Set as primary domain?")}
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {t(
                                        "This host will be used as the default for your workspace where a single canonical domain is required.",
                                    )}
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
                            "border-sky-200/90 bg-sky-50/90 text-sky-950",
                            "dark:border-sky-900/45 dark:bg-sky-950/30 dark:text-sky-100",
                        )}
                    >
                        <Info className="mt-px size-3.5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
                        <span>
                            {t(
                                "Any other domain currently marked as primary will be replaced. You can change this again later from domain settings.",
                            )}
                        </span>
                    </div>
                </AlertDialogHeader>

                <AlertDialogFooter className="mx-0 mb-0 flex flex-row justify-end gap-2 rounded-b-xl border-t border-border/60 bg-muted/30 px-5 py-3 sm:px-6">
                    <AlertDialogCancel size="sm" className="min-w-0 px-3" disabled={mutation.isPending}>
                        {t("Cancel")}
                    </AlertDialogCancel>
                    <Button
                        type="button"
                        size="sm"
                        className="min-w-0 gap-1.5 px-3"
                        disabled={mutation.isPending || !selectedDomain?.id}
                        onClick={() => {
                            if (!selectedDomain?.id) return;
                            mutation.mutate({ id: selectedDomain.id });
                        }}
                    >
                        {mutation.isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
                        {mutation.isPending ? t("Saving…") : t("Set as primary")}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default MakeDomainPrimaryDialog;
