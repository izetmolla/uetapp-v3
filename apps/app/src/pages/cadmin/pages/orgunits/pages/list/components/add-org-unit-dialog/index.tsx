import { useCallback, useEffect, useMemo, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2 } from "lucide-react";
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
    createOrgUnit,
    orgUnitFormSchema,
    orgUnitUpdateSchema,
    updateOrgUnit,
    type OrgUnitFormSchema,
    type OrgUnitUpdateSchema,
} from "./api";
import { cn } from "@workspace/ui/lib/utils";
import { useMutation, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessageFromBody, isApiErrorBody, queryClient } from "@workspace/flowtrove/lib/network";
import { useTranslation } from "react-i18next";
import { useOrgUnitsListStore } from "../../store";
import type { OrgUnit } from "../../api";

interface AddOrgUnitDialogProps {
    queryKey: QueryKey;
    orgUnit?: OrgUnit | null;
    onClose?: () => void;
}

function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function toFormValues(orgUnit?: OrgUnit | null): OrgUnitFormSchema {
    return {
        id: orgUnit?.id ?? "",
        name: orgUnit?.name ?? "",
        slug: orgUnit?.slug ?? "",
        description: orgUnit?.description ?? "",
        unit: orgUnit?.unit ?? "",
    };
}

const AddOrgUnitDialog: FC<AddOrgUnitDialogProps> = ({ orgUnit, queryKey, onClose }) => {
    const { t } = useTranslation("admin");
    const { isAddOrgUnitDialogOpen, setIsAddOrgUnitDialogOpen } = useOrgUnitsListStore();
    const isEditMode = Boolean(orgUnit?.id);

    const defaultValues = useMemo(() => toFormValues(orgUnit), [orgUnit]);

    const form = useForm<OrgUnitFormSchema>({
        resolver: zodResolver(orgUnitFormSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues,
    });

    useEffect(() => {
        if (isAddOrgUnitDialogOpen) {
            form.reset(toFormValues(orgUnit));
        }
    }, [form, isAddOrgUnitDialogOpen, orgUnit]);

    const nameValue = form.watch("name");
    const slugTouched = form.formState.dirtyFields.slug;

    useEffect(() => {
        if (isEditMode || slugTouched) return;
        const nextSlug = slugify(nameValue ?? "");
        if (nextSlug && form.getValues("slug") !== nextSlug) {
            form.setValue("slug", nextSlug, { shouldValidate: true });
        }
    }, [form, isEditMode, nameValue, slugTouched]);

    const onCloseModal = useCallback(() => {
        form.reset(toFormValues(orgUnit));
        setIsAddOrgUnitDialogOpen(false);
        onClose?.();
    }, [form, onClose, orgUnit, setIsAddOrgUnitDialogOpen]);

    const mutation = useMutation({
        mutationFn: (data: OrgUnitFormSchema | OrgUnitUpdateSchema) =>
            isEditMode ? updateOrgUnit(data as OrgUnitUpdateSchema) : createOrgUnit(data as OrgUnitFormSchema),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(
                    getApiErrorMessageFromBody(
                        res,
                        isEditMode ? t("Failed to update org unit") : t("Failed to add org unit"),
                    ),
                    { richColors: true },
                );
                return;
            }
            toast.success(
                isEditMode ? t("Org unit updated successfully") : t("Org unit added successfully"),
                { richColors: true },
            );
            void queryClient.invalidateQueries({ queryKey });
            onCloseModal();
        },
        onError: (error: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(
                error?.response?.data?.message ??
                error?.message ??
                (isEditMode ? t("Failed to update org unit") : t("Failed to add org unit")),
                { richColors: true },
            );
        },
    });

    const onSubmit = (data: OrgUnitFormSchema) => {
        if (isEditMode) {
            const parsed = orgUnitUpdateSchema.safeParse({
                id: data.id,
                name: data.name,
                slug: data.slug,
                description: data.description,
            });
            if (!parsed.success) {
                const firstError = parsed.error.errors[0]?.message;
                toast.error(firstError ?? t("Failed to update org unit"), { richColors: true });
                return;
            }
            mutation.mutate(parsed.data);
            return;
        }
        mutation.mutate(data);
    };

    return (
        <Dialog
            open={isAddOrgUnitDialogOpen}
            onOpenChange={(open) => {
                if (!open) onCloseModal();
            }}
        >
            <DialogContent
                overlayClassName="bg-black/80"
                className="w-full max-w-lg gap-0 overflow-hidden rounded-xl border-border/70 p-0 shadow-2xl sm:max-w-lg"
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="bg-gradient-to-b from-primary/10 to-background px-6 pt-6 pb-4">
                            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                                <Building2 className="size-5" />
                            </div>
                            <DialogHeader className="shrink-0 text-center">
                                <DialogTitle className="text-xl">
                                    {isEditMode ? t("Edit Org Unit") : t("Add Org Unit")}
                                </DialogTitle>
                                <DialogDescription>
                                    {isEditMode
                                        ? t("Update organizational unit details")
                                        : t("Create a new organizational unit for your institution")}
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="space-y-4 px-6 py-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {t("Basic information")}
                            </p>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("Name")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    placeholder={t("e.g. Faculties")}
                                                    autoComplete="off"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Unit code")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder={t("e.g. faculties")}
                                                autoComplete="off"
                                                disabled={isEditMode}
                                                className={cn(isEditMode && "cursor-not-allowed opacity-60")}
                                            />
                                        </FormControl>
                                        {isEditMode ? (
                                            <FormDescription>
                                                {t("Unit code cannot be changed after creation.")}
                                            </FormDescription>
                                        ) : null}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("URL slug")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder={t("e.g. faculties")}
                                                autoComplete="off"
                                                className="font-mono text-sm"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t("Used in URLs and internal references. Auto-generated from the name.")}
                                        </FormDescription>
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
                                                value={field.value ?? ""}
                                                placeholder={t("Brief description of this organizational unit…")}
                                                rows={3}
                                                className="resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4 sm:justify-end">
                            <Button type="button" variant="outline" onClick={onCloseModal} disabled={mutation.isPending}>
                                {t("Cancel")}
                            </Button>
                            <Button type="submit" disabled={mutation.isPending} className="gap-2">
                                {mutation.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                                {mutation.isPending
                                    ? isEditMode
                                        ? t("Saving…")
                                        : t("Adding…")
                                    : isEditMode
                                        ? t("Save changes")
                                        : t("Add Org Unit")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddOrgUnitDialog;
