import ApiService, { BaseService, withAPI, type ResponseWithError } from "@workspace/flowtrove/lib/network";

export interface DownloadFolderParams {
    id: number;
    year: string;
    faculty_slug: string;
    level_slug: string;
}


export async function downloadFolder(params: DownloadFolderParams) {
    const { id, year, faculty_slug, level_slug } = params;
    const response = await BaseService.get(
        withAPI(`/contracts/scandocuments/folders/${id}/download`),
        {
            params: { year, faculty_slug, level_slug },
            responseType: "blob",
        },
    );

    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `folder-${id}-export.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}



export interface FolderMutationResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
}


export function deleteFolder(id: number) {
    return ApiService.fetchDataBody<FolderMutationResponse>({
        url: withAPI(`/contracts/scandocuments/folders/${id}`),
        method: "delete",
    });
}

