import { useCallback, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link2, Loader2 } from "lucide-react";
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
import { addAliasDomain, addAliasDomainSchema, type AddAliasDomainSchema } from "./api";
import { useMutation, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessageFromBody, isApiErrorBody, queryClient } from "@workspace/flowtrove/lib/network";
import { useTranslation } from "react-i18next";
import useDomainsListStore from "../../store";

interface AddAliasDomainDialogProps {
    queryKey: QueryKey;
}

function normalizeDomain(value: string): string {
    return value.trim().toLowerCase();
}

const AddAliasDomainDialog: FC<AddAliasDomainDialogProps> = ({ queryKey }) => {
    const { t } = useTranslation();
    const { selectedDomain, isAliasDomainDialogOpen, resetDomainDialogContext } = useDomainsListStore();

    const parentHost = selectedDomain?.domain ?? "";

    const form = useForm<AddAliasDomainSchema>({
        resolver: zodResolver(addAliasDomainSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: { domain: "" },
    });

    const onCloseModal = useCallback(() => {
        form.reset({ domain: "" });
        resetDomainDialogContext();
    }, [form, resetDomainDialogContext]);

    const mutation = useMutation({
        mutationFn: addAliasDomain,
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to add alias domain")), { richColors: true });
                return;
            }
            toast.success(t("Alias domain added successfully"), { richColors: true });
            void queryClient.invalidateQueries({ queryKey });
            onCloseModal();
        },
        onError: (error: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(error?.response?.data?.message ?? error?.message ?? t("Failed to add alias domain"), {
                richColors: true,
            });
        },
    });

    const onSubmit = (data: AddAliasDomainSchema) => {
        const domain = normalizeDomain(data.domain);
        const parsed = addAliasDomainSchema.safeParse({ domain });
        if (!parsed.success) {
            form.setError("domain", { type: "manual", message: parsed.error.errors[0]?.message ?? t("Invalid domain") });
            return;
        }
        if (!selectedDomain?.id) {
            toast.error(t("No parent domain selected"), { richColors: true });
            return;
        }
        mutation.mutate({ parent_id: selectedDomain.id, domain: parsed.data.domain });
    };

    return (
        <Dialog
            open={isAliasDomainDialogOpen}
            onOpenChange={(open) => {
                if (!open) onCloseModal();
            }}
        >
            <DialogContent
                overlayClassName="bg-black/80"
                className="w-full max-w-md gap-0 overflow-hidden rounded-xl border-border/70 p-0 shadow-2xl sm:max-w-md"
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="bg-gradient-to-b from-primary/10 to-background px-6 pt-6 pb-4">
                            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                                <Link2 className="size-5" />
                            </div>
                            <DialogHeader className="shrink-0 text-center">
                                <DialogTitle className="text-xl">{t("Add alias domain")}</DialogTitle>
                                <DialogDescription>
                                    {t("Point an additional hostname to the same workspace as {{host}}.", {
                                        host: parentHost || "…",
                                    })}
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="space-y-3 px-6 py-4">
                            <FormField
                                control={form.control}
                                name="domain"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Alias hostname")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    form.clearErrors("domain");
                                                    field.onChange(normalizeDomain(e.target.value));
                                                }}
                                                placeholder="www.example.com"
                                                autoComplete="off"
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
                                {mutation.isPending ? t("Adding…") : t("Add alias")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddAliasDomainDialog;
