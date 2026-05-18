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
import { enableUsers } from "./api";
import { getUserLabel } from "../../lib/user-label";

const EnableUserDialog: FC = () => {
    const { t } = useTranslation("admin");
    const { selectedUser, isEnableDialogOpen, closeDialogs } = useUsersListStore();
    const listQueryKey = [USER_FETCH_PERSISTANT, "users"] as const;

    const mutation = useMutation({
        mutationFn: (ids: string[]) => enableUsers(ids),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to enable user")), {
                    richColors: true,
                });
                return;
            }
            toast.success(t("User enabled successfully"), { richColors: true });
            void queryClient.invalidateQueries({ queryKey: listQueryKey });
            void queryClient.invalidateQueries({ queryKey: [USER_FETCH_PERSISTANT, "stats"] });
            closeDialogs();
        },
        onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(err?.response?.data?.message ?? err?.message ?? t("Failed to enable user"), {
                richColors: true,
            });
        },
    });

    const name = getUserLabel(selectedUser);

    return (
        <AlertDialog open={isEnableDialogOpen} onOpenChange={(open) => !open && closeDialogs()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("Enable user?")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('Enable "{{name}}"? The user status will be set to active.', { name })}
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
                        {t("Enable")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default EnableUserDialog;
