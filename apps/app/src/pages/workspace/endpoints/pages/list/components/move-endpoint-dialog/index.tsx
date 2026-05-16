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
import { ArrowDown, ArrowUp, Loader2, Route } from "lucide-react";
import type { FC } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getApiErrorMessageFromBody,
    getRequestErrorMessage,
    isApiErrorBody,
    queryClient,
} from "@workspace/flowtrove/lib/network";
import { useTranslation } from "react-i18next";
import useEndpointsListStore from "../../store";
import { ENDPOINTS_LIST_QUERY_PREFIX } from "../../api";
import { swapEndpoint } from "./api";

interface MoveEndpointDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const MoveEndpointDialog: FC<MoveEndpointDialogProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { selectedEndpoint, direction } = useEndpointsListStore();

    const closeDialog = () => {
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) closeDialog();
    };

    const isGroup = selectedEndpoint?.option === "group";
    const ArrowIcon = direction === "down" ? ArrowDown : ArrowUp;

    const swapMutation = useMutation({
        mutationFn: swapEndpoint,
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to move item")), {
                    richColors: true,
                });
                return;
            }
            toast.success(t("Order updated."), { richColors: true });
            void queryClient.invalidateQueries({ queryKey: ENDPOINTS_LIST_QUERY_PREFIX });
            closeDialog();
        },
        onError: (error: unknown) => {
            toast.error(getRequestErrorMessage(error, t("Failed to move item")), {
                richColors: true,
            });
        },
    });

    const title =
        direction === "up"
            ? isGroup
                ? t("Move this group up?")
                : t("Move this endpoint up?")
            : isGroup
              ? t("Move this group down?")
              : t("Move this endpoint down?");

    const description = isGroup
        ? direction === "up"
            ? t(
                  "This will move the group higher in the list. Nested endpoints stay with the group.",
              )
            : t(
                  "This will move the group lower in the list. Nested endpoints stay with the group.",
              )
        : direction === "up"
          ? t("This will move the endpoint higher in the list beside its siblings.")
          : t("This will move the endpoint lower in the list beside its siblings.");

    const directionDetail =
        direction === "up"
            ? isGroup
                ? t(
                      "Going up swaps order with the group or endpoint directly above this one at the same level.",
                  )
                : t(
                      "Going up swaps order with the endpoint directly above this one among its siblings.",
                  )
            : isGroup
              ? t(
                    "Going down swaps order with the group or endpoint directly below this one at the same level.",
                )
              : t(
                    "Going down swaps order with the endpoint directly below this one among its siblings.",
                );

    const displayLabel =
        selectedEndpoint?.name?.trim() ||
        (selectedEndpoint ? `#${selectedEndpoint.id}` : t("this item"));

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogContent
                size="default"
                className="w-full max-w-[420px] gap-0 overflow-hidden p-0 sm:max-w-[420px]"
                onEscapeKeyDown={(e: KeyboardEvent) => e.preventDefault()}
            >
                <AlertDialogHeader className="flex w-full min-w-0 flex-col items-stretch gap-4 p-5 sm:p-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div
                            className={cn(
                                "mx-auto flex size-11 shrink-0 items-center justify-center rounded-full border ring-1",
                                "border-amber-500/25 bg-amber-500/10 text-amber-700 ring-amber-500/20",
                                "dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-500/30",
                            )}
                            aria-hidden
                        >
                            <ArrowIcon className="size-5" />
                        </div>
                        <div className="w-full space-y-1.5">
                            <AlertDialogTitle className="text-base font-semibold leading-snug tracking-tight">
                                {title}
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            </AlertDialogDescription>
                        </div>
                    </div>

                    {selectedEndpoint ? (
                        <div className="w-full min-w-0 rounded-lg border border-border/80 bg-muted/25 px-3 py-2.5 text-center">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {isGroup ? t("Group") : t("Endpoint")} · {displayLabel}
                            </p>
                            <div className="mt-2 flex w-full min-w-0 items-start justify-start gap-2 text-left text-sm text-foreground">
                                <Route className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                                <span className="min-w-0 break-all font-mono text-[13px] leading-snug">
                                    {selectedEndpoint.path || "/"}
                                </span>
                            </div>
                            <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                                {selectedEndpoint.method} · {selectedEndpoint.type} · {selectedEndpoint.category}
                            </p>
                            {direction ? (
                                <div className="mt-3 border-t border-border/60 pt-3">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                        {direction === "up"
                                            ? t("Moving up — what happens")
                                            : t("Moving down — what happens")}
                                    </p>
                                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                        {directionDetail}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </AlertDialogHeader>

                <AlertDialogFooter className="mx-0 mb-0 flex flex-row justify-end gap-2 rounded-b-xl border-t border-border/60 bg-muted/30 px-5 py-3 sm:px-6">
                    <AlertDialogCancel size="sm" className="min-w-0 px-3">
                        {t("Cancel")}
                    </AlertDialogCancel>
                    <Button
                        type="button"
                        size="sm"
                        className={cn(
                            "min-w-0 gap-1.5 px-3 shadow-sm",
                            "bg-primary text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/90",
                        )}
                        disabled={swapMutation.isPending || !selectedEndpoint?.id || !direction}
                        onClick={() => {
                            if (!selectedEndpoint?.id || !direction) return;
                            swapMutation.mutate({ id: selectedEndpoint.id, direction });
                        }}
                    >
                        {swapMutation.isPending ? (
                            <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        ) : null}
                        {swapMutation.isPending ? t("Moving…") : t("Confirm move")}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default MoveEndpointDialog;
