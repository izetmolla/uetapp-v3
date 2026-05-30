import { useCallback, useEffect, useMemo, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Loader2 } from "lucide-react";
import { z } from "zod";
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
import { Textarea } from "@workspace/ui/components/textarea";
import { ReactSelect } from "@workspace/ui/components/reactselect";
import { useMutation, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessageFromBody, isApiErrorBody, queryClient } from "@workspace/flowtrove/lib/network";
import { useTranslation } from "react-i18next";
import { useResourcesListStore } from "../../store";
import type { Resource, ResourceDriverOption } from "../../api";
import { createResource, updateResource } from "../../api";

const formSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    driver: z.string().min(1, "Driver is required"),
});

type FormValues = z.infer<typeof formSchema>;

type DriverSelectOption = { value: string; label: string };

interface ResourceFormDialogProps {
    queryKey: QueryKey;
    record?: Resource | null;
    onClose?: () => void;
    drivers?: ResourceDriverOption[];
}

function normalizeDriverOptions(drivers: ResourceDriverOption[] | undefined) {
    return (drivers ?? [])
        .map((opt) => ({
            value: opt.value ?? opt.id ?? "",
            label: opt.label,
        }))
        .filter((opt) => opt.value);
}

function toFormValues(record?: Resource | null): FormValues {
    return {
        id: record?.id ?? "",
        name: record?.name ?? "",
        description: record?.description ?? "",
        driver: record?.driver ?? "",
    };
}

const ResourceFormDialog: FC<ResourceFormDialogProps> = ({ record, queryKey, onClose, drivers }) => {
    const { t } = useTranslation("admin");
    const { isFormDialogOpen, setIsFormDialogOpen } = useResourcesListStore();
    const isEditMode = Boolean(record?.id);
    const driverOptions = useMemo(() => normalizeDriverOptions(drivers), [drivers]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: useMemo(() => toFormValues(record), [record]),
    });

    useEffect(() => {
        if (isFormDialogOpen) form.reset(toFormValues(record));
    }, [form, isFormDialogOpen, record]);

    const onCloseModal = useCallback(() => {
        form.reset(toFormValues(record));
        setIsFormDialogOpen(false);
        onClose?.();
    }, [form, onClose, record, setIsFormDialogOpen]);

    const mutation = useMutation({
        mutationFn: (data: FormValues) => {
            const payload = {
                name: data.name,
                description: data.description ?? "",
                driver: data.driver,
            };
            return isEditMode && data.id
                ? updateResource(data.id, payload)
                : createResource(payload);
        },
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(
                    getApiErrorMessageFromBody(
                        res,
                        isEditMode ? t("Failed to update resource") : t("Failed to add resource"),
                    ),
                    { richColors: true },
                );
                return;
            }
            toast.success(
                isEditMode ? t("Resource updated successfully") : t("Resource added successfully"),
                { richColors: true },
            );
            void queryClient.invalidateQueries({ queryKey });
            onCloseModal();
        },
        onError: (error: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(error?.response?.data?.message ?? error?.message ?? t("Request failed"), {
                richColors: true,
            });
        },
    });

    return (
        <Dialog open={isFormDialogOpen} onOpenChange={(open) => !open && onCloseModal()}>
            <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-xl p-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
                        <div className="bg-gradient-to-b from-primary/10 to-background px-6 pt-6 pb-4">
                            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                                <Box className="size-5" />
                            </div>
                            <DialogHeader className="text-center">
                                <DialogTitle>{isEditMode ? t("Edit Resource") : t("Add Resource")}</DialogTitle>
                                <DialogDescription>
                                    {isEditMode
                                        ? t("Update resource details")
                                        : t("Add a new resource for your institution")}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <div className="space-y-4 px-6 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Name")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={t("Resource name")} autoComplete="off" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="driver"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Driver")}</FormLabel>
                                        <FormControl>
                                            <ReactSelect<DriverSelectOption>
                                                className="w-full"
                                                options={driverOptions}
                                                placeholder={t("Select a driver")}
                                                value={field.value || null}
                                                onValueChange={(value) => field.onChange(value ?? "")}
                                                onBlur={field.onBlur}
                                                isDisabled={driverOptions.length === 0}
                                                invalid={!!form.formState.errors.driver}
                                                isClearable
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Description")}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder={t("Optional description")}
                                                rows={3}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
                            <Button type="button" variant="outline" onClick={onCloseModal} disabled={mutation.isPending}>
                                {t("Cancel")}
                            </Button>
                            <Button type="submit" disabled={mutation.isPending} className="gap-2">
                                {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                                {isEditMode ? t("Save changes") : t("Add Resource")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default ResourceFormDialog;
