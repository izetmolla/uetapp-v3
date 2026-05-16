import type { Endpoint } from "../../api";

export function isGroupEndpointOption(option: string | undefined): boolean {
    return typeof option === "string" && option.toLowerCase() === "group";
}

/** Path segment shown in the row when the endpoint is nested under a group path prefix. */
export function getEndpointRelativePath(endpoint: Endpoint): string {
    const groupPath = endpoint.group?.path ?? "";
    if (endpoint.group_id && groupPath && endpoint.path.startsWith(groupPath)) {
        return endpoint.path.replace(groupPath, "");
    }
    return endpoint.path;
}
