import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, type FC } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getApiErrorMessageFromBody, isApiErrorBody } from "@workspace/flowtrove/lib/network";
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
import type { Role } from "../../api";
import { createRole, updateRole } from "./api";
import { QUICK_EDIT_ROLE_FORM_ID } from "./form-ids";
import { roleSchema, STATUS_VALUES, type RoleFormValues } from "./schemas";

interface RoleFormProps {
    roleId: number;
    role: Role;
    isCreateMode?: boolean;
    onSaved: (role: Role) => void;
    onPendingChange: (pending: boolean) => void;
}

function toFormValues(role: Role): RoleFormValues {
    const status = role.status === "inactive" ? "inactive" : "active";
    return {
        name: role.name ?? "",
        description: role.description ?? "",
        status: STATUS_VALUES.includes(status as RoleFormValues["status"])
            ? (status as RoleFormValues["status"])
            : "active",
    };
}

const RoleForm: FC<RoleFormProps> = ({
    roleId,
    role,
    isCreateMode = false,
    onSaved,
    onPendingChange,
}) => {
    const { t } = useTranslation("admin");

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: toFormValues(role),
    });

    useEffect(() => {
        form.reset(toFormValues(role));
    }, [form, role]);

    const mutation = useMutation({
        mutationFn: (data: RoleFormValues) =>
            isCreateMode
                ? createRole({
                      name: data.name.toLowerCase(),
                      description: data.description,
                      status: data.status,
                  })
                : updateRole(roleId, {
                      name: data.name.toLowerCase(),
                      description: data.description,
                      status: data.status,
                  }),
        onMutate: () => onPendingChange(true),
        onSettled: () => onPendingChange(false),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(
                    getApiErrorMessageFromBody(
                        res,
                        isCreateMode ? t("Failed to create role") : t("Failed to update role"),
                    ),
                    { richColors: true },
                );
                return;
            }
            toast.success(
                isCreateMode ? t("Role created successfully") : t("Role saved successfully"),
                { richColors: true },
            );
            if (res.role) onSaved(res.role);
        },
        onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(
                err?.response?.data?.message ??
                    err?.message ??
                    (isCreateMode ? t("Failed to create role") : t("Failed to update role")),
                { richColors: true },
            );
        },
    });

    return (
        <Form {...form}>
            <form
                id={QUICK_EDIT_ROLE_FORM_ID}
                className="flex flex-col gap-4"
                onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("Name")}</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="admin"
                                    autoComplete="off"
                                    disabled={!isCreateMode}
                                />
                            </FormControl>
                            <FormDescription>
                                {isCreateMode
                                    ? t("Unique identifier used in user role assignments.")
                                    : t("Role name cannot be changed after creation.")}
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
                                    rows={3}
                                    placeholder={t("Optional description for this role")}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {!isCreateMode ? (
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("Status")}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("Select status")} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">{t("Active")}</SelectItem>
                                        <SelectItem value="inactive">{t("Disabled")}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : null}
            </form>
        </Form>
    );
};

export default RoleForm;
