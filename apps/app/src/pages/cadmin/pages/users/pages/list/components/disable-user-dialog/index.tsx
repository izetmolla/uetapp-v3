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
import { USER_FETCH_PERSISTANT } from "../../api";
import useUsersListStore from "../../store";
import { disableUsers } from "./api";
import { getUserLabel } from "../../lib/user-label";

const DisableUserDialog: FC = () => {
    const { t } = useTranslation("admin");
    const { selectedUser, isDisableDialogOpen, closeDialogs } = useUsersListStore();
    const listQueryKey = [USER_FETCH_PERSISTANT, "users"] as const;

    const mutation = useMutation({
        mutationFn: (ids: string[]) => disableUsers(ids),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to disable user")), {
                    richColors: true,
                });
                return;
            }
            toast.success(t("User disabled successfully"), { richColors: true });
            void queryClient.invalidateQueries({ queryKey: listQueryKey });
            void queryClient.invalidateQueries({ queryKey: [USER_FETCH_PERSISTANT, "stats"] });
            closeDialogs();
        },
        onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(err?.response?.data?.message ?? err?.message ?? t("Failed to disable user"), {
                richColors: true,
            });
        },
    });

    const name = getUserLabel(selectedUser);

    return (
        <AlertDialog open={isDisableDialogOpen} onOpenChange={(open) => !open && closeDialogs()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("Disable user?")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('Disable "{{name}}"? The user status will be set to disabled.', { name })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={mutation.isPending}>{t("Cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={mutation.isPending || !selectedUser?.id}
                        onClick={(e) => {
                            e.preventDefault();
                            if (selectedUser?.id) mutation.mutate([selectedUser.id]);
                        }}
                        className="gap-2"
                    >
                        {mutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : null}
                        {t("Disable")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DisableUserDialog;
