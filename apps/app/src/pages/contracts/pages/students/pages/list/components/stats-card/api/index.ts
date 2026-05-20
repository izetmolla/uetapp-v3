import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import { STUDENTS_LIST_BASE, type StudentsStatsResponse } from "../../../api";

export async function getStudentsStats() {
    return ApiService.fetchData<StudentsStatsResponse>({
        url: withAPI(`${STUDENTS_LIST_BASE}/stats`),
        method: "get",
    });
}
