import ApiService, { withAPI, withWs, type ResponseWithError } from "@workspace/flowtrove/lib/network";

export interface DeleteEntityDialogDataTypes extends ResponseWithError {
  success: boolean;
}

export function deleteEntity(data: Record<string, unknown>) {
  return ApiService.fetchDataBody<DeleteEntityDialogDataTypes>({
    url: withAPI("/entities/delete"),
    method: "DELETE",
    data: withWs(data),
  });
}
