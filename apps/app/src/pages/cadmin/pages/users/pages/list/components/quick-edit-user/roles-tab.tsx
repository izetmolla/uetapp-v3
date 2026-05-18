import { useMutation } from "@tanstack/react-query";
import { Eye, Pencil, Shield } from "lucide-react";
import { useEffect, useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getApiErrorMessageFromBody, isApiErrorBody } from "@workspace/flowtrove/lib/network";
import { Badge } from "@workspace/ui/components/badge";
import { Switch } from "@workspace/ui/components/switch";
import { Toggle } from "@workspace/ui/components/toggle";
import { cn } from "@workspace/ui/lib/utils";
import { type User } from "../../api";
import { updateUserRoles } from "./api";
import { QUICK_EDIT_FORM_IDS } from "./form-ids";
import {
    buildRoleGrantsFromUserRoles,
    formatRoleGrant,
    grantsToPayload,
    type RoleGrant,
} from "./role-utils";

interface RolesTabProps {
    userId: string;
    user: User;
    availableRoles: string[];
    onSaved: (user: User) => void;
    onPendingChange: (pending: boolean) => void;
}

const RolesTab: FC<RolesTabProps> = ({ userId, user, availableRoles, onSaved, onPendingChange }) => {
    const { t } = useTranslation("admin");
    const [grants, setGrants] = useState<RoleGrant[]>(() =>
        buildRoleGrantsFromUserRoles(user.roles ?? [], availableRoles),
    );

    useEffect(() => {
        setGrants(buildRoleGrantsFromUserRoles(user.roles ?? [], availableRoles));
    }, [user.roles, availableRoles]);

    const effectiveGrants = useMemo(() => grantsToPayload(grants), [grants]);
    const enabledCount = grants.filter((g) => g.enabled).length;

    const updateGrant = (name: string, patch: Partial<RoleGrant>) => {
        setGrants((prev) =>
            prev.map((g) => {
                if (g.name !== name) return g;
                const next = { ...g, ...patch };
                if (patch.enabled === true && !next.read && !next.write) {
                    return { ...next, read: true, write: true };
                }
                if (patch.enabled === false) {
                    return { ...next, read: false, write: false };
                }
                return next;
            }),
        );
    };

    const mutation = useMutation({
        mutationFn: () => updateUserRoles(userId, grantsToPayload(grants)),
        onMutate: () => onPendingChange(true),
        onSettled: () => onPendingChange(false),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to update roles")), {
                    richColors: true,
                });
                return;
            }
            toast.success(t("Roles saved"), { richColors: true });
            if (res.user) onSaved(res.user);
        },
        onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(err?.response?.data?.message ?? err?.message ?? t("Failed to update roles"), {
                richColors: true,
            });
        },
    });

    return (
        <form
            id={QUICK_EDIT_FORM_IDS.roles}
            className="flex h-full min-h-0 flex-col gap-3 overflow-hidden"
            onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
            }}
        >
            <div className="shrink-0 rounded-md border bg-muted/30 px-3 py-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-medium">{t("Effective permissions")}</span>
                    <span className="text-muted-foreground text-[11px]">
                        · {t("{{count}}/{{total}} active", { count: enabledCount, total: grants.length })}
                    </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                    {effectiveGrants.length > 0 ? (
                        effectiveGrants.map((grant) => (
                            <Badge
                                key={grant}
                                variant="secondary"
                                className="h-5 px-1.5 font-mono text-[10px] leading-none"
                            >
                                {grant}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground text-[11px]">{t("No roles assigned")}</span>
                    )}
                </div>
            </div>

            <p className="text-muted-foreground shrink-0 text-xs leading-relaxed">
                {t(
                    "Enable a role and choose read or write access. Saved grants use the format role:perms (e.g. admin:rw).",
                )}
            </p>

            <div className="mb-2 h-0 min-h-0 flex-1 overflow-y-auto rounded-md border border-border bg-muted/20 overscroll-contain">
                <div className="space-y-2 p-2 pb-5">
                    {grants.map((grant) => (
                        <div
                            key={grant.name}
                            className={cn(
                                "rounded-lg border p-4 transition-colors",
                                grant.enabled
                                    ? "border-primary/25 bg-primary/[0.03] shadow-sm"
                                    : "bg-card",
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        className={cn(
                                            "flex size-9 shrink-0 items-center justify-center rounded-md",
                                            grant.enabled
                                                ? "bg-primary/10 text-primary"
                                                : "bg-muted text-muted-foreground",
                                        )}
                                    >
                                        <Shield className="size-4" aria-hidden />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-medium capitalize">{grant.name}</p>
                                        <p className="text-muted-foreground truncate font-mono text-xs">
                                            {grant.enabled
                                                ? formatRoleGrant(grant.name, grant.read, grant.write)
                                                : t("Not assigned")}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={grant.enabled}
                                    onCheckedChange={(checked) =>
                                        updateGrant(grant.name, { enabled: Boolean(checked) })
                                    }
                                    aria-label={t("Enable {{role}}", { role: grant.name })}
                                />
                            </div>

                            {grant.enabled ? (
                                <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                                    <Toggle
                                        size="sm"
                                        variant="outline"
                                        pressed={grant.read}
                                        disabled={!grant.enabled}
                                        onPressedChange={(pressed) =>
                                            updateGrant(grant.name, { read: pressed })
                                        }
                                        className="gap-1.5 data-[state=on]:border-primary/40 data-[state=on]:bg-primary/10"
                                        aria-label={t("Read {{role}}", { role: grant.name })}
                                    >
                                        <Eye className="size-3.5" aria-hidden />
                                        {t("Read")}
                                    </Toggle>
                                    <Toggle
                                        size="sm"
                                        variant="outline"
                                        pressed={grant.write}
                                        disabled={!grant.enabled}
                                        onPressedChange={(pressed) =>
                                            updateGrant(grant.name, { write: pressed })
                                        }
                                        className="gap-1.5 data-[state=on]:border-primary/40 data-[state=on]:bg-primary/10"
                                        aria-label={t("Write {{role}}", { role: grant.name })}
                                    >
                                        <Pencil className="size-3.5" aria-hidden />
                                        {t("Write")}
                                    </Toggle>
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </form>
    );
};

export default RolesTab;
