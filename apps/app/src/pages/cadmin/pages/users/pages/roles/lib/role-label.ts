import type { Role } from "../api";

export function getRoleLabel(role: Role | null | undefined): string {
    if (!role) return "";
    return role.name?.trim() || `Role #${role.id}`;
}
