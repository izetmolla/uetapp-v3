import { useCallback, useEffect, useMemo, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2 } from "lucide-react";
import { useQuery, useMutation, type QueryKey } from "@tanstack/react-query";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { toast } from "sonner";
import { getApiErrorMessageFromBody, isApiErrorBody, queryClient } from "@workspace/flowtrove/lib/network";
import { useTranslation } from "react-i18next";
import { slugify, STATUS_OPTIONS } from "../lib/slug";
import { departmentFormSchema, type DepartmentFormValues } from "../lib/slug-entity-schema";
import { getFacultiesList } from "../pages/faculties/api";
import {
    createDepartment,
    updateDepartment,
    type Department,
} from "../pages/departments/api";

interface DepartmentFormDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    record?: Department | null;
    queryKey: QueryKey;
    onClose?: () => void;
}

function toFormValues(record?: Department | null): DepartmentFormValues {
    return {
        id: record?.id ?? "",
        name: record?.name ?? "",
        slug: record?.slug ?? "",
        description: record?.description ?? "",
        image: record?.image ?? "",
        status: (record?.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
        faculty_id: record?.faculty_id ? String(record.faculty_id) : "",
    };
}

const DepartmentFormDialog: FC<DepartmentFormDialogProps> = ({ open, setOpen, record, queryKey, onClose }) => {
    const { t } = useTranslation("admin");
    const isEditMode = Boolean(record?.id);

    const { data: facultiesData } = useQuery({
        queryKey: ["facultiesOptions"],
        queryFn: () => getFacultiesList({ page: 1, perPage: 500 }).then((res) => res.data),
        enabled: open,
    });

    const facultyOptions = facultiesData?.data ?? [];

    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentFormSchema),
        mode: "onChange",
        defaultValues: useMemo(() => toFormValues(record), [record]),
    });

    useEffect(() => {
        if (open) form.reset(toFormValues(record));
    }, [form, open, record]);

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
        form.reset(toFormValues(record));
        setOpen(false);
        onClose?.();
    }, [form, onClose, record, setOpen]);

    const mutation = useMutation({
        mutationFn: async (data: DepartmentFormValues) => {
            const { id, faculty_id, ...rest } = data;
            const payload = { ...rest, faculty_id: Number(faculty_id) };
            if (isEditMode && id) return updateDepartment(id, payload);
            return createDepartment(payload);
        },
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Request failed")), { richColors: true });
                return;
            }
            toast.success(
                isEditMode ? t("Department updated successfully") : t("Department added successfully"),
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
        <Dialog open={open} onOpenChange={(next) => !next && onCloseModal()}>
            <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-xl p-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
                        <div className="bg-gradient-to-b from-primary/10 to-background px-6 pt-6 pb-4">
                            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                                <Building2 className="size-5" />
                            </div>
                            <DialogHeader className="text-center">
                                <DialogTitle>
                                    {isEditMode ? t("Edit Department") : t("Add Department")}
                                </DialogTitle>
                                <DialogDescription>
                                    {isEditMode
                                        ? t("Update department details")
                                        : t("Create a new department under a faculty")}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-4">
                            <FormField
                                control={form.control}
                                name="faculty_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Faculty")}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("Select faculty")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {facultyOptions.map((f) => (
                                                    <SelectItem key={f.id} value={String(f.id)}>
                                                        {f.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid gap-3 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("Name")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} autoComplete="off" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("Status")}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("URL slug")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="font-mono text-sm" autoComplete="off" />
                                        </FormControl>
                                        <FormDescription>
                                            {t("Auto-generated from the name when left unchanged.")}
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
                                            <Textarea {...field} value={field.value ?? ""} rows={3} className="resize-none" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Image URL")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? ""} placeholder="https://" />
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
                                {isEditMode ? t("Save changes") : t("Add Department")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default DepartmentFormDialog;
