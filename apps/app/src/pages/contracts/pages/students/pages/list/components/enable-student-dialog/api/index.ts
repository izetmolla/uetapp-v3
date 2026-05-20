import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import { STUDENTS_LIST_BASE, type StudentMutationResponse } from "../../../api";

export function enableStudents(ids: number[]) {
    return ApiService.fetchData<StudentMutationResponse>({
        url: withAPI(`${STUDENTS_LIST_BASE}/enable`),
        method: "post",
        data: { ids },
    });
}
