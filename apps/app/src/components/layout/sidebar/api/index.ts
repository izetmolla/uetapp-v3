import ApiService, { withAPI, withService } from "@workspace/flowtrove/lib/network";
import type { NavigationItem } from "../navigations";


export type ServiceItem = {
    id: string;
    name: string;
    title: string;
    icon?: string;
    description?: string;
    roles?: string[];
};

export interface GeneralDataTypes {
    services: ServiceItem[];
    service: ServiceItem;
    current_user_id: string;
    navigations: NavigationItem[];
}
export function getGeneralData() {
    return ApiService.fetchDataBody<GeneralDataTypes>({
        url: withAPI('/general'),
        method: 'get',
        params: withService(),
    });
}