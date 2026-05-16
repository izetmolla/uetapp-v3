import { useCallback, useEffect, type FC } from "react";
import { useForm, type Control } from "react-hook-form";
import { Plus, } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { ReactSelect } from "@workspace/ui/components/reactselect";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
    addEndpointPath,
    type AddEndpointPathSchema,
    addEndpointPathSchema,
} from "./api";
import { useMutation } from "@tanstack/react-query";
import {
    isApiErrorBody,
    getApiErrorMessageFromBody,
    getRequestErrorMessage,
    queryClient,
} from "@workspace/flowtrove/lib/network";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Domain } from "../../api";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@workspace/ui/components/input-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { toast } from "sonner";
import useEndpointsListStore from "../../store";
import { ENDPOINTS_LIST_QUERY_PREFIX } from "../../api";

export type Group = {
    id: string;
    path: string;
    name?: string;
    category: "web" | "api";
    visibility: "public" | "private";
}

interface AddEndpointPathDialogProps {
    isOpen: boolean;
    onClose: () => void;
    domain: Domain | null;
}

function MethodSelectInputGroupAddon({
    control,
    onClearMethodError,
    t,
}: {
    control: Control<AddEndpointPathSchema>;
    onClearMethodError: () => void;
    t: (key: string) => string;
}) {
    return (
        <InputGroupAddon
            align="inline-start"
            className="min-w-0 w-fit shrink-0 gap-0 border-e border-input bg-transparent py-0 ps-0 pe-0 justify-start"
        >
            <FormField
                control={control}
                name="method"
                render={({ field: methodField }) => (
                    <FormItem className="flex w-fit min-w-0 max-w-full items-center gap-0 space-y-0">
                        <FormLabel className="sr-only">{t("Method")}</FormLabel>
                        <Select
                            value={methodField.value}
                            onValueChange={(value) => {
                                onClearMethodError();
                                methodField.onChange(value);
                            }}
                        >
                            <FormControl>
                                <SelectTrigger
                                    ref={methodField.ref}
                                    onBlur={methodField.onBlur}
                                    aria-label={t("HTTP method")}
                                    className="h-8 min-h-0 w-fit min-w-0 shrink-0 gap-0.5 rounded-none border-0 bg-transparent px-1.5 py-0 text-xs font-medium shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[size=default]:h-8 dark:bg-transparent [&_svg:not([class*='size-'])]:size-3.5"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="ALL">{t("ALL")}</SelectItem>
                                <SelectItem value="GET">{t("GET")}</SelectItem>
                                <SelectItem value="POST">{t("POST")}</SelectItem>
                                <SelectItem value="PUT">{t("PUT")}</SelectItem>
                                <SelectItem value="DELETE">{t("DELETE")}</SelectItem>
                                <SelectItem value="PATCH">{t("PATCH")}</SelectItem>
                                <SelectItem value="HEAD">{t("HEAD")}</SelectItem>
                                <SelectItem value="OPTIONS">{t("OPTIONS")}</SelectItem>
                                <SelectItem value="CONNECT">{t("CONNECT")}</SelectItem>
                                <SelectItem value="TRACE">{t("TRACE")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}
            />
        </InputGroupAddon>
    );
}


const AddEndpointPathDialog: FC<AddEndpointPathDialogProps> = ({
    isOpen,
    domain,
    onClose,
}) => {
    const { t } = useTranslation();
    const { selectedEndpoint } = useEndpointsListStore();
    const form = useForm<AddEndpointPathSchema>({
        resolver: zodResolver(addEndpointPathSchema),
        defaultValues: {
            domain_id: domain?.id ?? "",
            name: "",
            path: "",
            group_id: selectedEndpoint?.id ?? "",
            category: selectedEndpoint?.category ?? "web",
            visibility: selectedEndpoint?.visibility ?? "public",
            path_prefix: selectedEndpoint?.path ?? "",
            method: "GET",
        },
    });
    const { errors: formErrors } = form.formState;


    useEffect(() => {
        if (!isOpen) return;
        form.reset({
            domain_id: domain?.id ?? "",
            name: "",
            path: "",
            group_id: selectedEndpoint?.id ?? "",
            category: selectedEndpoint?.category ?? "web",
            visibility: selectedEndpoint?.visibility ?? "public",
            path_prefix: selectedEndpoint?.path ?? "",
            method: "GET",
        });
    }, [
        isOpen,
        domain?.id,
        form,
        selectedEndpoint?.id,
        selectedEndpoint?.path,
        selectedEndpoint?.category,
        selectedEndpoint?.visibility,
    ]);


    const mutation = useMutation({
        mutationFn: addEndpointPath,
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to add domain")), {
                    richColors: true,
                });
                return;
            }
            closeDialog();
            toast.success(t("Domain added successfully"), {
                richColors: true,
            });
            void queryClient.invalidateQueries({ queryKey: ENDPOINTS_LIST_QUERY_PREFIX });
        },
        onError: (error: unknown) => {
            toast.error(getRequestErrorMessage(error, t("Failed to add endpoint group")), {
                richColors: true,
                duration: 6000,
            });
        },
    });





    const closeDialog = useCallback(() => {
        form.reset({
            domain_id: domain?.id ?? "",
            name: "",
            path: "",
            group_id: "",
            category: "web",
            visibility: "public",
            path_prefix: "",
            method: "GET",
        });
        onClose();
    }, [domain?.id, form, onClose]);


    const onSubmit = (data: AddEndpointPathSchema) => {
        mutation.mutate({
            ...data,
        });
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) closeDialog();
            }}
        >
            <DialogContent
                overlayClassName="bg-black/80"
                className="w-full max-w-xl gap-0 overflow-hidden rounded-xl border-border/70 p-0 shadow-2xl sm:max-w-2xl md:max-w-3xl"
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="border-b border-dashed border-border/60 bg-gradient-to-b from-primary/10 to-background px-6 pt-6 pb-4">
                            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                                <Plus className="size-5" />
                            </div>
                            <DialogHeader className="shrink-0 text-center">
                                <DialogTitle className="text-xl">{t("Add New Endpoint")}</DialogTitle>
                                <DialogDescription>
                                    {t("Add your endpoint for this domain.")}
                                    <span className="block text-sm text-muted-foreground">
                                        <Link to={domain?.domain ? `https://${domain.domain}` : "#"} target="_blank" className="text-primary hover:underline">{domain?.domain ?? "-"}</Link>
                                    </span>
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                <FormField
                                    control={form.control}
                                    name="path"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel>{t("Path")}</FormLabel>
                                            <FormControl>
                                                {selectedEndpoint?.id && selectedEndpoint.id !== "" ? (
                                                    <InputGroup>
                                                        <MethodSelectInputGroupAddon
                                                            control={form.control}
                                                            onClearMethodError={() => form.clearErrors("method")}
                                                            t={t}
                                                        />
                                                        <InputGroupAddon
                                                            align="inline-start"
                                                            className="min-w-0 shrink-0 gap-0 border-0 bg-transparent py-0 ps-1.5 pe-0.5 justify-start"
                                                        >
                                                            <InputGroupText className="font-semibold">
                                                                {selectedEndpoint?.path}
                                                            </InputGroupText>
                                                        </InputGroupAddon>
                                                        <InputGroupInput
                                                            {...field}
                                                            className="border-l-0 ps-1 shadow-none ring-0 focus-visible:ring-0"
                                                            value={field.value ?? ""}
                                                            onChange={(event) => {
                                                                form.clearErrors("path");
                                                                field.onChange(event.target.value);
                                                            }}
                                                            placeholder={t("e.g. /api/v1")}
                                                        />
                                                    </InputGroup>
                                                ) : (
                                                    <InputGroup>
                                                        <MethodSelectInputGroupAddon
                                                            control={form.control}
                                                            onClearMethodError={() => form.clearErrors("method")}
                                                            t={t}
                                                        />
                                                        <InputGroupInput
                                                            {...field}
                                                            value={field.value ?? ""}
                                                            onChange={(event) => {
                                                                form.clearErrors("path");
                                                                field.onChange(event.target.value);
                                                            }}
                                                            placeholder={t("e.g. /api/v1")}
                                                        />
                                                    </InputGroup>
                                                )}
                                            </FormControl>
                                            <FormMessage />
                                            {formErrors.method?.message != null && (
                                                <p className="text-sm font-medium text-destructive">
                                                    {String(formErrors.method.message)}
                                                </p>
                                            )}
                                        </FormItem>
                                    )}
                                />
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
                                                    onChange={(event) => {
                                                        form.clearErrors("name");
                                                        field.onChange(event.target.value);
                                                    }}
                                                    placeholder={t("Enter name")}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />



                                <div className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2 sm:gap-4">
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("Category")}</FormLabel>
                                                <ReactSelect<{ label: string; value: "web" | "api" }>
                                                    options={[
                                                        { label: t("Web"), value: "web" },
                                                        { label: t("API"), value: "api" },
                                                    ]}
                                                    placeholder={t("Select category")}
                                                    invalid={!!form.formState.errors.category}
                                                    isClearable={false}
                                                    isSearchable={false}
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                                    name={field.name}
                                                    inputId={`${field.name}-input`}
                                                    onBlur={field.onBlur}
                                                    value={field.value}
                                                    onValueChange={(value) => {
                                                        form.clearErrors("category");
                                                        field.onChange(value ?? "web");
                                                    }}
                                                />


                                                {/* <Select
                                                    value={field.value ?? "web"}
                                                    onValueChange={(value) => {
                                                        form.clearErrors("category");
                                                        field.onChange(value);
                                                    }}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger
                                                            ref={field.ref}
                                                            className="h-9 w-full"
                                                            onBlur={field.onBlur}
                                                        >
                                                            <SelectValue placeholder={t("Select category")} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="web">{t("Web")}</SelectItem>
                                                        <SelectItem value="api">{t("API")}</SelectItem>
                                                    </SelectContent>
                                                </Select> */}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="visibility"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("Visibility")}</FormLabel>
                                                <ReactSelect<{ label: string; value: "public" | "private" }>
                                                    options={[
                                                        { label: t("Public"), value: "public" },
                                                        { label: t("Private"), value: "private" },
                                                    ]}
                                                    placeholder={t("Select category")}
                                                    invalid={!!form.formState.errors.category}
                                                    isClearable={false}
                                                    isSearchable={false}
                                                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                                    name={field.name}
                                                    inputId={`${field.name}-input`}
                                                    onBlur={field.onBlur}
                                                    value={field.value}
                                                    onValueChange={(value) => {
                                                        form.clearErrors("visibility");
                                                        field.onChange(value ?? "public");
                                                    }}
                                                />
                                                {/* <Select
                                                    value={field.value ?? "public"}
                                                    onValueChange={(value) => {
                                                        form.clearErrors("visibility");
                                                        field.onChange(value);
                                                    }}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger
                                                            ref={field.ref}
                                                            className="w-full"
                                                            onBlur={field.onBlur}
                                                        >
                                                            <SelectValue placeholder={t("Select visibility")} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="public">{t("Public")}</SelectItem>
                                                        <SelectItem value="private">{t("Private")}</SelectItem>
                                                    </SelectContent>
                                                </Select> */}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                            </div>
                        </div>

                        <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4 sm:justify-end">
                            <Button type="button" variant="outline" onClick={closeDialog} disabled={mutation.isPending} className="cursor-pointer">
                                {t("Cancel")}
                            </Button>
                            <Button type="submit" disabled={mutation.isPending} className="cursor-pointer">
                                {mutation.isPending ? t("Adding...") : t("Add Endpoint")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddEndpointPathDialog;
