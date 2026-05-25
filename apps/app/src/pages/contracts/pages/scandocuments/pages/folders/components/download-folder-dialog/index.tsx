import { useCallback, type FC } from "react";
import { Download, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router";
import { toast } from "sonner";
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
import { downloadFolder } from "../../api";

const DownloadFolderDialog: FC = () => {
    const { year = "", faculty_slug = "", level = "" } = useParams();
    const {
        folder,
        setFolder,
        isDownloadDialogOpen,
        setIsDownloadDialogOpen,
    } = useFoldersStore();

    const onClose = useCallback(() => {
        setFolder(null);
        setIsDownloadDialogOpen(false);
    }, [setFolder, setIsDownloadDialogOpen]);

    const mutation = useMutation({
        mutationFn: () =>
            downloadFolder({
                id: folder!.id,
                year,
                faculty_slug,
                level_slug: level,
            }),
        onSuccess: () => {
            toast.success("Folder export downloaded", { richColors: true });
            onClose();
        },
        onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to download folder", {
                richColors: true,
            });
        },
    });

    const folderName = folder?.name ?? "this folder";

    return (
        <AlertDialog open={isDownloadDialogOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
                <div className="bg-gradient-to-b from-primary/10 to-background px-6 pt-6 pb-4">
                    <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                        <Download className="size-5" aria-hidden />
                    </div>
                    <AlertDialogHeader className="text-center">
                        <AlertDialogTitle>Download</AlertDialogTitle>
                        <AlertDialogDescription>
                            Export a CSV of all students and scan status for{" "}
                            <span className="font-medium text-foreground">{folderName}</span>.
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
                        Download
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DownloadFolderDialog;
