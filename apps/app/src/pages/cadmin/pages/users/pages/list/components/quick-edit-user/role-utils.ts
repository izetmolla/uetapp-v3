export type RoleGrant = {
    name: string;
    read: boolean;
    write: boolean;
    enabled: boolean;
};

export function parseRoleGrant(grant: string): Omit<RoleGrant, "enabled"> {
    const trimmed = grant.trim();
    const colon = trimmed.indexOf(":");
    const name = colon === -1 ? trimmed : trimmed.slice(0, colon);
    const perms = colon === -1 ? "rw" : trimmed.slice(colon + 1).toLowerCase();
    return {
        name,
        read: perms.includes("r"),
        write: perms.includes("w"),
    };
}

export function formatRoleGrant(name: string, read: boolean, write: boolean): string {
    let perms = "";
    if (read) perms += "r";
    if (write) perms += "w";
    return perms ? `${name}:${perms}` : name;
}

export function buildRoleGrantsFromUserRoles(
    userRoles: string[],
    availableRoles: string[],
): RoleGrant[] {
    const byName = new Map<string, RoleGrant>();
    for (const grant of userRoles) {
        const parsed = parseRoleGrant(grant);
        if (!parsed.name) continue;
        byName.set(parsed.name, { ...parsed, enabled: true });
    }
    for (const name of availableRoles) {
        if (!byName.has(name)) {
            byName.set(name, { name, read: true, write: true, enabled: false });
        }
    }
    return availableRoles.map((name) => byName.get(name)!);
}

export function grantsToPayload(grants: RoleGrant[]): string[] {
    return grants
        .filter((g) => g.enabled)
        .map((g) => formatRoleGrant(g.name, g.read, g.write));
}
