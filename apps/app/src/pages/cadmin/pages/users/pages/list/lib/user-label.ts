import type { User } from "../api";

export function getUserLabel(user?: User | null): string {
    if (!user) return "";
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
    return name || user.email || user.id;
}
