import { useQuery } from "@tanstack/react-query";
import { Loader2, Shield } from "lucide-react";
import { useCallback, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { queryClient } from "@workspace/flowtrove/lib/network";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import { ROLES_FETCH_PERSISTANT } from "../../api";
import useRolesListStore, { EMPTY_ROLE } from "../../store";
import { getRoleCreateTemplate, getRoleDetail, type Role } from "./api";
import { QUICK_EDIT_ROLE_FORM_ID } from "./form-ids";
import RoleForm from "./role-form";
import { getRoleLabel } from "../../lib/role-label";

const QuickEditRole: FC = () => {
    const { t } = useTranslation("admin");
    const { selectedRole, isCreateMode, isQuickEditDialogOpen, closeDialogs } = useRolesListStore();
    const [isSaving, setIsSaving] = useState(false);

    const roleId = selectedRole?.id ?? 0;
    const isCreate = isCreateMode || !roleId;

    const listQueryKey = [ROLES_FETCH_PERSISTANT, "roles"] as const;

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: [ROLES_FETCH_PERSISTANT, "role-detail", isCreate ? "new" : roleId],
        queryFn: () => (isCreate ? getRoleCreateTemplate() : getRoleDetail(roleId)),
        enabled: isQuickEditDialogOpen && (isCreate || roleId > 0),
    });

    const role = data?.role ?? (isCreate ? EMPTY_ROLE : undefined);

    const handleClose = useCallback(() => {
        setIsSaving(false);
        closeDialogs();
    }, [closeDialogs]);

    const handleSaved = useCallback(
        (updated: Role) => {
            void queryClient.invalidateQueries({ queryKey: listQueryKey });
            void queryClient.invalidateQueries({ queryKey: [ROLES_FETCH_PERSISTANT, "stats"] });
            if (!isCreate && roleId) {
                void queryClient.setQueryData(
                    [ROLES_FETCH_PERSISTANT, "role-detail", roleId],
                    (prev: typeof data | undefined) =>
                        prev ? { ...prev, role: { ...prev.role, ...updated } } : prev,
                );
            }
            handleClose();
        },
        [listQueryKey, roleId, data, isCreate, handleClose],
    );

    const dialogTitle = isCreate ? t("Add role") : t("Edit role");
    const label = getRoleLabel(role);

    const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        if (status === "active") return "default";
        if (status === "inactive") return "secondary";
        if (status === "deleted") return "destructive";
        return "outline";
    };

    return (
        <Dialog open={isQuickEditDialogOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="flex max-h-[min(88vh,560px)] w-full max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
                <div className="shrink-0 border-b px-6 py-4">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{dialogTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-4">
                        {isLoading ? (
                            <Skeleton className="size-10 shrink-0 rounded-lg" />
                        ) : (
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Shield className="size-5" aria-hidden />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-muted-foreground mb-0.5 text-xs">{dialogTitle}</p>
                            <p className="truncate text-base font-semibold leading-tight">
                                {isLoading ? t("Loading role...") : label || t("Role details")}
                            </p>
                        </div>
                        {role?.status && !isLoading && !isCreate ? (
                            <Badge variant={statusVariant(role.status)} className="shrink-0 capitalize">
                                {role.status === "inactive" ? t("disabled") : role.status}
                            </Badge>
                        ) : null}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-3 px-6 py-6">
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : isError || !role ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                        <p className="text-muted-foreground text-sm">{t("Could not load role details.")}</p>
                        <Button variant="outline" size="sm" onClick={() => void refetch()}>
                            {t("Retry")}
                        </Button>
                    </div>
                ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                        <RoleForm
                            roleId={roleId}
                            role={role}
                            isCreateMode={isCreate}
                            onSaved={handleSaved}
                            onPendingChange={setIsSaving}
                        />
                    </div>
                )}

                {!isLoading && !isError && role ? (
                    <DialogFooter className="shrink-0 gap-2 border-t bg-muted/20 px-6 py-4 sm:justify-end">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
                            {t("Cancel")}
                        </Button>
                        <Button
                            type="submit"
                            form={QUICK_EDIT_ROLE_FORM_ID}
                            disabled={isSaving}
                            className="gap-2"
                        >
                            {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                            {isCreate ? t("Create role") : t("Save changes")}
                        </Button>
                    </DialogFooter>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};

export default QuickEditRole;
