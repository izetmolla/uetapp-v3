import { useCallback, useEffect, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParams } from "react-router";
import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
    getApiErrorMessageFromBody,
    isApiErrorBody,
    queryClient,
} from "@workspace/flowtrove/lib/network";
import useFoldersStore from "../../store";
import { createFolder, createFolderSchema, type CreateFolderSchema } from "./api";

const FORM_ID = "create-folder-form";

const defaultValues: CreateFolderSchema = {
    name: "",
};

const CreateNewFolderDialog: FC = () => {
    const { year = "", faculty_slug = "", level = "" } = useParams();
    const { isCreateFolderDialogOpen, setIsCreateFolderDialogOpen } = useFoldersStore();

    const listQueryKey = ["folders", year, faculty_slug, level] as const;

    const form = useForm<CreateFolderSchema>({
        resolver: zodResolver(createFolderSchema),
        defaultValues,
    });

    useEffect(() => {
        if (isCreateFolderDialogOpen) {
            form.reset(defaultValues);
        }
    }, [form, isCreateFolderDialogOpen]);

    const onClose = useCallback(() => {
        form.reset(defaultValues);
        setIsCreateFolderDialogOpen(false);
    }, [form, setIsCreateFolderDialogOpen]);

    const mutation = useMutation({
        mutationFn: (data: CreateFolderSchema) =>
            createFolder({
                year,
                faculty_slug,
                level_slug: level,
                name: data.name,
            }),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, "Failed to create folder"), {
                    richColors: true,
                });
                return;
            }
            toast.success(res.message ?? "Folder created successfully", { richColors: true });
            void queryClient.invalidateQueries({ queryKey: listQueryKey });
            onClose();
        },
        onError: (error: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(error?.response?.data?.message ?? error?.message ?? "Failed to create folder", {
                richColors: true,
            });
        },
    });

    return (
        <Dialog open={isCreateFolderDialogOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md gap-0 overflow-hidden rounded-xl p-0">
                <Form {...form}>
                    <form
                        id={FORM_ID}
                        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                    >
                        <div className="bg-gradient-to-b from-primary/10 to-background px-6 pt-6 pb-4">
                            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                                <FolderPlus className="size-5" aria-hidden />
                            </div>
                            <DialogHeader className="text-center">
                                <DialogTitle>Create folder</DialogTitle>
                                <DialogDescription>
                                    Add a new scan folder for this study level.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <div className="px-6 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Folder name"
                                                autoComplete="off"
                                                autoFocus
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="gap-2 border-t bg-muted/20 px-6 py-4 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={mutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                className="gap-2"
                            >
                                {mutation.isPending ? (
                                    <Loader2 className="size-4 animate-spin" aria-hidden />
                                ) : null}
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateNewFolderDialog;
