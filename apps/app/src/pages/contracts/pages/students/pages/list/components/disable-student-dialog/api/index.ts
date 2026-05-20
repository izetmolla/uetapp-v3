import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import { STUDENTS_LIST_BASE, type StudentMutationResponse } from "../../../api";

export function disableStudents(ids: number[]) {
    return ApiService.fetchData<StudentMutationResponse>({
        url: withAPI(`${STUDENTS_LIST_BASE}/disable`),
        method: "post",
        data: { ids },
    });
}
