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
import { AlertTriangle, Database, Loader2, Trash2 } from "lucide-react";
import type { FC } from "react";
import { deleteEntity } from "./api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiErrorMessageFromBody,
  isApiErrorBody,
  queryClient,
} from "@workspace/flowtrove/lib/network";
import { useStore } from "../../store";
import { ENTITIES_LIST_QUERY_PREFIX } from "../../api";

interface DeleteEntityDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteEntityDialog: FC<DeleteEntityDialogProps> = ({ isOpen, onClose }) => {
  const { selectedEntity } = useStore();
  const closeDialog = () => {
    onClose();
  };

  /** Close only via Cancel (onOpenChange) or successful delete (closeDialog). Escape is blocked; Radix blocks outside dismiss. */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
  };

  const deleteMutation = useMutation({
    mutationFn: deleteEntity,
    onSuccess: (res) => {
      if (isApiErrorBody(res)) {
        toast.error(getApiErrorMessageFromBody(res, "Failed to delete entity"), {
          richColors: true,
        });
        return;
      }
      toast.success("Entity deleted successfully");
      void queryClient.invalidateQueries({ queryKey: ENTITIES_LIST_QUERY_PREFIX });
      closeDialog();
    },
    onError: () => {
      toast.error("Failed to delete entity");
    },
  });

  const displayName =
    selectedEntity?.name?.trim() ||
    (selectedEntity ? `Entity #${selectedEntity.id}` : "this entity");

  const slugLine = selectedEntity?.settings?.slug
    ? `/${selectedEntity.settings.slug}`
    : null;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        size="default"
        className="w-full max-w-[420px] gap-0 overflow-hidden p-0 sm:max-w-[420px]"
        onEscapeKeyDown={(e: KeyboardEvent) => e.preventDefault()}
      >
        <AlertDialogHeader className="flex w-full min-w-0 flex-col items-stretch gap-4 p-5 text-left sm:p-6">
          <div className="flex min-w-0 gap-3.5">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/15 dark:bg-destructive/15 dark:ring-destructive/25"
              aria-hidden
            >
              <Trash2 className="size-4 text-destructive" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <AlertDialogTitle className="text-base font-semibold leading-snug tracking-tight">
                Delete {displayName}?
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This will permanently remove the entity and its schema definition. This action cannot be
                  undone.
                </p>
              </AlertDialogDescription>
            </div>
          </div>

          {selectedEntity ? (
            <div className="w-full min-w-0 rounded-lg border border-border/80 bg-muted/25 px-3 py-2.5">
              <div className="flex min-w-0 items-start gap-2 text-sm text-foreground">
                <Database className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 break-all font-mono text-[13px] leading-snug">
                  {selectedEntity.name}
                </span>
              </div>
              <p className="mt-1.5 pl-[1.375rem] font-mono text-xs text-muted-foreground">
                {selectedEntity.attributes.length} attributes
                {slugLine ? ` · API slug ${slugLine}` : ""}
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
            <span>Relations and any data stored for this entity may be removed or left inconsistent.</span>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mx-0 mb-0 flex flex-row justify-end gap-2 rounded-b-xl border-t border-border/60 bg-muted/30 px-5 py-3 sm:px-6">
          <AlertDialogCancel size="sm" className="min-w-0 px-3">
            Cancel
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
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (!selectedEntity?.id) return;
              deleteMutation.mutate({ id: selectedEntity.id });
            }}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : null}
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteEntityDialog;
