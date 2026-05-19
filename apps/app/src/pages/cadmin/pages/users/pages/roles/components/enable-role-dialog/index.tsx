import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    getApiErrorMessageFromBody,
    isApiErrorBody,
    queryClient,
} from "@workspace/flowtrove/lib/network";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { ROLES_FETCH_PERSISTANT } from "../../api";
import useRolesListStore from "../../store";
import { getRoleLabel } from "../../lib/role-label";
import { enableRoles } from "./api";

const EnableRoleDialog: FC = () => {
    const { t } = useTranslation("admin");
    const { selectedRole, isEnableDialogOpen, closeDialogs } = useRolesListStore();
    const listQueryKey = [ROLES_FETCH_PERSISTANT, "roles"] as const;

    const mutation = useMutation({
        mutationFn: (ids: number[]) => enableRoles(ids),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to enable role")), {
                    richColors: true,
                });
                return;
            }
            toast.success(t("Role enabled successfully"), { richColors: true });
            void queryClient.invalidateQueries({ queryKey: listQueryKey });
            void queryClient.invalidateQueries({ queryKey: [ROLES_FETCH_PERSISTANT, "stats"] });
            closeDialogs();
        },
        onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(err?.response?.data?.message ?? err?.message ?? t("Failed to enable role"), {
                richColors: true,
            });
        },
    });

    const name = getRoleLabel(selectedRole);

    return (
        <AlertDialog open={isEnableDialogOpen} onOpenChange={(open) => !open && closeDialogs()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("Enable role?")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('Enable "{{name}}"? It will be available for user assignments again.', { name })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={mutation.isPending}>{t("Cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={mutation.isPending || !selectedRole?.id}
                        onClick={(e) => {
                            e.preventDefault();
                            if (selectedRole?.id) mutation.mutate([selectedRole.id]);
                        }}
                        className="gap-2"
                    >
                        {mutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : null}
                        {t("Enable")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default EnableRoleDialog;
