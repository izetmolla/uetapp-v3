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
import { deleteUsers } from "./api";
import { getUserLabel } from "../../lib/user-label";

const DeleteUserDialog: FC = () => {
    const { t } = useTranslation("admin");
    const { selectedUser, isDeleteDialogOpen, closeDialogs } = useUsersListStore();
    const listQueryKey = [USER_FETCH_PERSISTANT, "users"] as const;

    const mutation = useMutation({
        mutationFn: (ids: string[]) => deleteUsers(ids),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to delete user")), {
                    richColors: true,
                });
                return;
            }
            toast.success(t("User deleted successfully"), { richColors: true });
            void queryClient.invalidateQueries({ queryKey: listQueryKey });
            void queryClient.invalidateQueries({ queryKey: [USER_FETCH_PERSISTANT, "stats"] });
            closeDialogs();
        },
        onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(err?.response?.data?.message ?? err?.message ?? t("Failed to delete user"), {
                richColors: true,
            });
        },
    });

    const name = getUserLabel(selectedUser);

    return (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && closeDialogs()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("Delete user?")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t(
                            'Mark "{{name}}" as deleted? The account will be deactivated and hidden from normal lists.',
                            { name },
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={mutation.isPending}>{t("Cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
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
                        {t("Delete")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteUserDialog;
