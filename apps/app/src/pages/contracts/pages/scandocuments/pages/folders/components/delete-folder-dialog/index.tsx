import { useCallback, type FC } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { type QueryKey, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getApiErrorMessageFromBody,
    isApiErrorBody,
    queryClient,
} from "@workspace/flowtrove/lib/network";
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
import useFoldersStore from "../../store";
import { deleteFolder } from "./api";

const DeleteFolderDialog: FC<{ queryKey: QueryKey }> = ({ queryKey }) => {
    const {
        folder,
        setFolder,
        isDeleteFolderDialogOpen,
        setIsDeleteFolderDialogOpen,
    } = useFoldersStore();

    const onClose = useCallback(() => {
        setFolder(null);
        setIsDeleteFolderDialogOpen(false);
    }, [setFolder, setIsDeleteFolderDialogOpen]);

    const mutation = useMutation({
        mutationFn: () => deleteFolder(folder!.id),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, "Failed to delete folder"), {
                    richColors: true,
                });
                return;
            }
            toast.success(res.message ?? "Folder deleted successfully", { richColors: true });
            void queryClient.invalidateQueries({ queryKey });
            onClose();
        },
        onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to delete folder", {
                richColors: true,
            });
        },
    });

    const folderName = folder?.name ?? "this folder";
    const studentCount = folder?.students ?? 0;
    const studentDocumentsLabel =
        studentCount === 1 ? "student document" : "student documents";

    return (
        <AlertDialog open={isDeleteFolderDialogOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
                <div className="space-y-4 bg-gradient-to-b from-destructive/10 to-background px-6 pt-6 pb-5">
                    <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
                        <Trash2 className="size-5" aria-hidden />
                    </div>
                    <AlertDialogHeader className="w-full place-items-center space-y-3 text-center sm:place-items-center sm:text-center">
                        <AlertDialogTitle className="w-full text-center text-lg font-bold">
                            Delete folder
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <p>
                                    You are about to delete{" "}
                                    <span className="font-medium text-foreground">{folderName}</span>.
                                </p>
                                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-start">
                                    <p className="text-foreground">
                                        <span className="font-semibold tabular-nums">
                                            {studentCount.toLocaleString()}
                                        </span>{" "}
                                        {studentDocumentsLabel} in this folder will be permanently
                                        removed, including all scan files and completion status.
                                    </p>
                                </div>
                                <p>This action cannot be undone.</p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </div>
                <AlertDialogFooter className="mx-0 mb-0 gap-3 border-t bg-muted/20 px-6 py-5 sm:justify-end">
                    <AlertDialogCancel
                        disabled={mutation.isPending}
                        className="mt-0 sm:min-w-24"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={mutation.isPending || !folder?.id}
                        className="mt-0 gap-2 sm:min-w-24"
                        onClick={(e) => {
                            e.preventDefault();
                            if (folder?.id) mutation.mutate();
                        }}
                    >
                        {mutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : null}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteFolderDialog;
