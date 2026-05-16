import ApiService, { withAPI, withWs } from "@workspace/flowtrove/lib/network";
import type { NavigationItem } from "../navigations";


export interface GeneralDataTypes {
    wss: any[];
    ws: any;
    current_user_id: string;
    navigations: NavigationItem[];
}
export function getGeneralData() {
    return ApiService.fetchDataBody<GeneralDataTypes>({
        url: withAPI('/wsdata'),
        method: 'get',
        params: withWs(),
    });
}