import { useCallback, useEffect, useMemo, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Loader2 } from "lucide-react";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useMutation, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessageFromBody, isApiErrorBody, queryClient } from "@workspace/flowtrove/lib/network";
import { useTranslation } from "react-i18next";
import { useAcademicYearsListStore } from "../../store";
import type { AcademicYear } from "../../api";
import { createAcademicYear, updateAcademicYear } from "./api";

const formSchema = z.object({
    id: z.string().optional(),
    year: z.string().min(1, "Year is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AcademicYearFormDialogProps {
    queryKey: QueryKey;
    record?: AcademicYear | null;
    onClose?: () => void;
}

function toFormValues(record?: AcademicYear | null): FormValues {
    return { id: record?.id ?? "", year: record?.year ?? "" };
}

const AcademicYearFormDialog: FC<AcademicYearFormDialogProps> = ({ record, queryKey, onClose }) => {
    const { t } = useTranslation("admin");
    const { isFormDialogOpen, setIsFormDialogOpen } = useAcademicYearsListStore();
    const isEditMode = Boolean(record?.id);

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
            const { id, year } = data;
            return isEditMode && id ? updateAcademicYear(id, { year }) : createAcademicYear({ year });
        },
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(
                    getApiErrorMessageFromBody(
                        res,
                        isEditMode ? t("Failed to update academic year") : t("Failed to add academic year"),
                    ),
                    { richColors: true },
                );
                return;
            }
            toast.success(
                isEditMode ? t("Academic year updated successfully") : t("Academic year added successfully"),
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
            <DialogContent className="max-w-md gap-0 overflow-hidden rounded-xl p-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
                        <div className="bg-gradient-to-b from-primary/10 to-background px-6 pt-6 pb-4">
                            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                                <Calendar className="size-5" />
                            </div>
                            <DialogHeader className="text-center">
                                <DialogTitle>
                                    {isEditMode ? t("Edit Academic Year") : t("Add Academic Year")}
                                </DialogTitle>
                                <DialogDescription>
                                    {isEditMode
                                        ? t("Update the academic year label")
                                        : t("Add a new academic year for your institution")}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <div className="space-y-4 px-6 py-4">
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Year")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder={t("e.g. 2025-2026")}
                                                autoComplete="off"
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
                                {isEditMode ? t("Save changes") : t("Add Academic Year")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AcademicYearFormDialog;
