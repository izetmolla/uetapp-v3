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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { generateAvatarFallback } from "@workspace/ui/lib/utils";
import { updateUserGeneral, type User } from "./api";
import FormSection from "./form-section";
import { QUICK_EDIT_FORM_IDS } from "./form-ids";
import { generalSchema, STATUS_VALUES, type GeneralFormValues } from "./schemas";

interface GeneralTabProps {
    userId: string;
    user: User;
    onSaved: (user: User) => void;
    onPendingChange: (pending: boolean) => void;
}

function toFormValues(user: User): GeneralFormValues {
    const status = user.status as GeneralFormValues["status"] | undefined;
    return {
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        email: user.email ?? "",
        username: user.username ?? "",
        ldap_username: user.ldap_username ?? "",
        image: user.image ?? "",
        status: status && STATUS_VALUES.includes(status) ? status : "active",
    };
}

function formatStatusLabel(value: string) {
    return value.replace(/_/g, " ");
}

const GeneralTab: FC<GeneralTabProps> = ({ userId, user, onSaved, onPendingChange }) => {
    const { t } = useTranslation("admin");

    const form = useForm<GeneralFormValues>({
        resolver: zodResolver(generalSchema),
        defaultValues: toFormValues(user),
    });

    const imageUrl = form.watch("image");
    const firstName = form.watch("first_name");
    const lastName = form.watch("last_name");
    const previewName = [firstName, lastName].filter(Boolean).join(" ") || user.email;

    useEffect(() => {
        form.reset(toFormValues(user));
    }, [form, user]);

    const mutation = useMutation({
        mutationFn: (data: GeneralFormValues) => updateUserGeneral(userId, data),
        onMutate: () => onPendingChange(true),
        onSettled: () => onPendingChange(false),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to update user")), {
                    richColors: true,
                });
                return;
            }
            toast.success(t("General information saved"), { richColors: true });
            if (res.user) onSaved(res.user);
        },
        onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(err?.response?.data?.message ?? err?.message ?? t("Failed to update user"), {
                richColors: true,
            });
        },
    });

    return (
        <Form {...form}>
            <form
                id={QUICK_EDIT_FORM_IDS.general}
                className="space-y-6"
                onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            >
                <FormSection
                    title={t("Personal information")}
                    description={t("Name and contact details shown across the platform.")}
                    showSeparator={false}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("First name")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} autoComplete="given-name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("Last name")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} autoComplete="family-name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("Email")}</FormLabel>
                                <FormControl>
                                    <Input type="email" autoComplete="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </FormSection>

                <FormSection
                    title={t("Account identifiers")}
                    description={t("Login and directory usernames for authentication.")}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("Username")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} autoComplete="username" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ldap_username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("LDAP username")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} autoComplete="off" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </FormSection>

                <FormSection
                    title={t("Profile & status")}
                    description={t("Avatar image and account lifecycle state.")}
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <Avatar className="size-20 shrink-0 border shadow-sm">
                            <AvatarImage src={imageUrl || undefined} alt={previewName} />
                            <AvatarFallback className="text-lg">
                                {generateAvatarFallback(previewName)}
                            </AvatarFallback>
                        </Avatar>
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem className="min-w-0 flex-1">
                                    <FormLabel>{t("Avatar URL")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="https://..." />
                                    </FormControl>
                                    <FormDescription>
                                        {t("Paste a public image URL for the user avatar.")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem className="max-w-xs">
                                <FormLabel>{t("Status")}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {STATUS_VALUES.map((value) => (
                                            <SelectItem key={value} value={value} className="capitalize">
                                                {formatStatusLabel(value)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </FormSection>
            </form>
        </Form>
    );
};

export default GeneralTab;
