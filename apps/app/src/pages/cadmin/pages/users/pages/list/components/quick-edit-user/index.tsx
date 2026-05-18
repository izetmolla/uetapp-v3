import { useQuery } from "@tanstack/react-query";
import { Loader2, Mail } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { generateAvatarFallback } from "@workspace/ui/lib/utils";
import { USER_FETCH_PERSISTANT } from "../../api";
import useUsersListStore from "../../store";
import { getUserDetail, type User } from "./api";
import { QUICK_EDIT_FORM_IDS } from "./form-ids";
import GeneralTab from "./general-tab";
import PasswordTab from "./password-tab";
import RolesTab from "./roles-tab";

const QuickEditUser: FC = () => {
    const { t } = useTranslation("admin");
    const { selectedUser, isQuickEditDialogOpen, closeDialogs } = useUsersListStore();
    const [activeTab, setActiveTab] = useState("general");
    const [isSaving, setIsSaving] = useState(false);
    const resolvedUserId = selectedUser?.id ?? null;

    const listQueryKey = [USER_FETCH_PERSISTANT, "users"] as const;

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: [USER_FETCH_PERSISTANT, "user-detail", resolvedUserId],
        queryFn: () => getUserDetail(resolvedUserId!),
        enabled: isQuickEditDialogOpen && !!resolvedUserId,
    });

    const user = data?.user;
    const availableRoles = data?.available_roles ?? [];

    const handleClose = useCallback(() => {
        setActiveTab("general");
        setIsSaving(false);
        closeDialogs();
    }, [closeDialogs]);

    const handleSaved = useCallback(
        (updated: User) => {
            void queryClient.invalidateQueries({ queryKey: listQueryKey });
            void queryClient.invalidateQueries({ queryKey: [USER_FETCH_PERSISTANT, "stats"] });
            void queryClient.setQueryData(
                [USER_FETCH_PERSISTANT, "user-detail", resolvedUserId],
                (prev: typeof data | undefined) =>
                    prev ? { ...prev, user: { ...prev.user, ...updated } } : prev,
            );
        },
        [listQueryKey, resolvedUserId, data],
    );

    const displayName = user
        ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
        : "";

    const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        if (status === "active") return "default";
        if (status === "disabled" || status === "deleted") return "destructive";
        if (status === "pending" || status === "new") return "secondary";
        return "outline";
    };

    const activeFormId =
        activeTab === "password"
            ? QUICK_EDIT_FORM_IDS.password
            : activeTab === "roles"
              ? QUICK_EDIT_FORM_IDS.roles
              : QUICK_EDIT_FORM_IDS.general;

    const saveLabel =
        activeTab === "password"
            ? t("Save security")
            : activeTab === "roles"
              ? t("Save roles")
              : t("Save changes");

    return (
        <Dialog open={isQuickEditDialogOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="flex h-[min(88vh,720px)] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
                <div className="shrink-0 border-b px-6 py-4">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{t("Edit user")}</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-4">
                        {isLoading ? (
                            <Skeleton className="size-12 shrink-0 rounded-full" />
                        ) : (
                            <Avatar className="size-12 shrink-0 ring-2 ring-background ring-offset-1 ring-offset-border/40">
                                <AvatarImage src={user?.image} alt={displayName} />
                                <AvatarFallback className="text-sm font-medium">
                                    {generateAvatarFallback(displayName || "?")}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-muted-foreground mb-0.5 text-xs">{t("Edit user")}</p>
                            <p className="truncate text-base font-semibold leading-tight text-foreground">
                                {isLoading ? t("Loading user...") : displayName || t("User details")}
                            </p>
                            {user?.email ? (
                                <p className="text-muted-foreground mt-1 flex items-center gap-1.5 truncate text-sm">
                                    <Mail className="size-3.5 shrink-0" aria-hidden />
                                    <span className="truncate">{user.email}</span>
                                </p>
                            ) : null}
                            {user?.username ? (
                                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                                    @{user.username}
                                </p>
                            ) : null}
                        </div>
                        {user?.status && !isLoading ? (
                            <Badge
                                variant={statusVariant(user.status)}
                                className="shrink-0 capitalize"
                            >
                                {user.status.replace(/_/g, " ")}
                            </Badge>
                        ) : null}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-1 flex-col gap-3 px-6 py-6">
                        <Skeleton className="h-9 w-64" />
                        <Skeleton className="h-[280px] w-full" />
                    </div>
                ) : isError || !user || !resolvedUserId ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                        <p className="text-muted-foreground text-sm">{t("Could not load user details.")}</p>
                        <Button variant="outline" size="sm" onClick={() => void refetch()}>
                            {t("Retry")}
                        </Button>
                    </div>
                ) : (
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="flex min-h-0 flex-1 flex-col overflow-hidden"
                        >
                            <TabsList className="mx-6 mt-4 h-9 w-auto shrink-0 justify-start rounded-lg bg-muted/60 p-1">
                                <TabsTrigger value="general" className="px-4 text-xs sm:text-sm">
                                    {t("General")}
                                </TabsTrigger>
                                <TabsTrigger value="password" className="px-4 text-xs sm:text-sm">
                                    {t("Password & Security")}
                                </TabsTrigger>
                                <TabsTrigger value="roles" className="px-4 text-xs sm:text-sm">
                                    {t("Roles")}
                                </TabsTrigger>
                            </TabsList>
                            <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden px-6">
                                <TabsContent
                                    value="general"
                                    className="col-start-1 row-start-1 mt-0 flex h-full min-h-0 flex-col overflow-y-auto py-5 data-[state=inactive]:hidden"
                                >
                                    <GeneralTab
                                        userId={resolvedUserId}
                                        user={user}
                                        onSaved={handleSaved}
                                        onPendingChange={setIsSaving}
                                    />
                                </TabsContent>
                                <TabsContent
                                    value="password"
                                    className="col-start-1 row-start-1 mt-0 flex h-full min-h-0 flex-col overflow-y-auto py-5 data-[state=inactive]:hidden"
                                >
                                    <PasswordTab
                                        userId={resolvedUserId}
                                        user={user}
                                        onSaved={handleSaved}
                                        onPendingChange={setIsSaving}
                                    />
                                </TabsContent>
                                <TabsContent
                                    value="roles"
                                    className="col-start-1 row-start-1 mt-0 flex h-full min-h-0 flex-col overflow-hidden data-[state=inactive]:hidden"
                                >
                                    <RolesTab
                                        userId={resolvedUserId}
                                        user={user}
                                        availableRoles={availableRoles}
                                        onSaved={handleSaved}
                                        onPendingChange={setIsSaving}
                                    />
                                </TabsContent>
                            </div>
                        </Tabs>
                        <DialogFooter className="shrink-0 gap-2 border-t bg-muted/20 px-6 py-4 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSaving}
                            >
                                {t("Cancel")}
                            </Button>
                            <Button type="submit" form={activeFormId} disabled={isSaving} className="gap-2">
                                {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                                {saveLabel}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default QuickEditUser;
