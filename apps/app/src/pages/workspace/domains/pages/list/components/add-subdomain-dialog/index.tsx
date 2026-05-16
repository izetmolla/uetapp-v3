import { useCallback, useMemo, type FC } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GitBranch, Loader2 } from "lucide-react";
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
import { addSubdomain, addSubdomainSchema, type AddSubdomainSchema } from "./api";
import { useMutation, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessageFromBody, isApiErrorBody, queryClient } from "@workspace/flowtrove/lib/network";
import { useTranslation } from "react-i18next";
import useDomainsListStore from "../../store";

interface AddSubdomainDialogProps {
    queryKey: QueryKey;
}

function normalizeLabel(value: string): string {
    return value.trim().toLowerCase();
}

const AddSubdomainDialog: FC<AddSubdomainDialogProps> = ({ queryKey }) => {
    const { t } = useTranslation();
    const { selectedDomain, isSubdomainDialogOpen, resetDomainDialogContext } = useDomainsListStore();

    const form = useForm<AddSubdomainSchema>({
        resolver: zodResolver(addSubdomainSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: { label: "" },
    });

    const rawLabel = useWatch({ control: form.control, name: "label", defaultValue: "" });
    const parentHost = selectedDomain?.domain ?? "";

    const fullPreview = useMemo(() => {
        const label = normalizeLabel(rawLabel ?? "");
        if (!label || !parentHost) return "";
        return `${label}.${parentHost}`;
    }, [rawLabel, parentHost]);

    const onCloseModal = useCallback(() => {
        form.reset({ label: "" });
        resetDomainDialogContext();
    }, [form, resetDomainDialogContext]);

    const mutation = useMutation({
        mutationFn: addSubdomain,
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to add subdomain")), { richColors: true });
                return;
            }
            toast.success(t("Subdomain added successfully"), { richColors: true });
            void queryClient.invalidateQueries({ queryKey });
            onCloseModal();
        },
        onError: (error: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(error?.response?.data?.message ?? error?.message ?? t("Failed to add subdomain"), {
                richColors: true,
            });
        },
    });

    const onSubmit = (data: AddSubdomainSchema) => {
        const parsed = addSubdomainSchema.safeParse({ label: normalizeLabel(data.label) });
        if (!parsed.success) {
            form.setError("label", { type: "manual", message: parsed.error.errors[0]?.message ?? t("Invalid label") });
            return;
        }
        if (!selectedDomain?.id) {
            toast.error(t("No parent domain selected"), { richColors: true });
            return;
        }
        const label = parsed.data.label;
        const domain = `${label}.${parentHost}`;
        mutation.mutate({ parent_id: selectedDomain.id, domain, label });
    };

    return (
        <Dialog
            open={isSubdomainDialogOpen}
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
                                <GitBranch className="size-5" />
                            </div>
                            <DialogHeader className="shrink-0 text-center">
                                <DialogTitle className="text-xl">{t("Add subdomain")}</DialogTitle>
                                <DialogDescription>
                                    {parentHost
                                        ? t("Create a hostname under {{host}}.", { host: parentHost })
                                        : t("Create a hostname under your domain.")}
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="space-y-3 px-6 py-4">
                            <FormField
                                control={form.control}
                                name="label"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Subdomain label")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    form.clearErrors("label");
                                                    field.onChange(normalizeLabel(e.target.value));
                                                }}
                                                placeholder="api"
                                                autoComplete="off"
                                            />
                                        </FormControl>
                                        {fullPreview ? (
                                            <p className="font-mono text-[11px] text-muted-foreground" role="status">
                                                {fullPreview}
                                            </p>
                                        ) : null}
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
                                {mutation.isPending ? t("Adding…") : t("Add subdomain")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddSubdomainDialog;
