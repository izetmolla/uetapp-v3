import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, type FC } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import PasswordInput from "@workspace/flowtrove/components/password";
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
import { Switch } from "@workspace/ui/components/switch";
import { updateUserPassword, type User } from "./api";
import FormSection from "./form-section";
import { QUICK_EDIT_FORM_IDS } from "./form-ids";
import { passwordSchema, type PasswordFormValues } from "./schemas";

interface PasswordTabProps {
    userId: string;
    user: User;
    onSaved: (user: User) => void;
    onPendingChange: (pending: boolean) => void;
}

const PasswordTab: FC<PasswordTabProps> = ({ userId, user, onSaved, onPendingChange }) => {
    const { t } = useTranslation("admin");

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: "",
            password_confirm: "",
            is_confirmed: user.is_confirmed ?? false,
        },
    });

    useEffect(() => {
        form.reset({
            password: "",
            password_confirm: "",
            is_confirmed: user.is_confirmed ?? false,
        });
    }, [form, user.is_confirmed]);

    const mutation = useMutation({
        mutationFn: (data: PasswordFormValues) => {
            const password = data.password?.trim();
            const payload: {
                password?: string;
                password_confirm?: string;
                is_confirmed: boolean;
            } = { is_confirmed: data.is_confirmed };

            if (password) {
                payload.password = password;
                payload.password_confirm = data.password_confirm?.trim();
            }

            return updateUserPassword(userId, payload);
        },
        onMutate: () => onPendingChange(true),
        onSettled: () => onPendingChange(false),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to update security settings")), {
                    richColors: true,
                });
                return;
            }
            toast.success(t("Password and security saved"), { richColors: true });
            form.reset({ password: "", password_confirm: "", is_confirmed: res.user?.is_confirmed ?? false });
            if (res.user) onSaved(res.user);
        },
        onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(
                err?.response?.data?.message ?? err?.message ?? t("Failed to update security settings"),
                { richColors: true },
            );
        },
    });

    return (
        <Form {...form}>
            <form
                id={QUICK_EDIT_FORM_IDS.password}
                className="space-y-6"
                onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            >
                <FormSection
                    title={t("Account verification")}
                    description={t("Control whether the user has completed email or identity verification.")}
                    showSeparator={false}
                >
                    <FormField
                        control={form.control}
                        name="is_confirmed"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-muted/20 p-4">
                                <div className="space-y-0.5 pe-4">
                                    <FormLabel>{t("Account confirmed")}</FormLabel>
                                    <FormDescription>
                                        {t("Mark whether the user has verified their account.")}
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </FormSection>

                <FormSection
                    title={t("Password")}
                    description={t("Set a new password. Leave both fields empty to keep the current password.")}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("New password")}</FormLabel>
                                    <FormControl>
                                        <PasswordInput autoComplete="new-password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password_confirm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("Confirm password")}</FormLabel>
                                    <FormControl>
                                        <PasswordInput autoComplete="new-password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </FormSection>
            </form>
        </Form>
    );
};

export default PasswordTab;
