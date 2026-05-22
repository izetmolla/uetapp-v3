import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";




export interface DashboardType {
    ok: boolean;
    analytics: {
        messages: number;
        notifications: number;
        tasks: number;
        appointments: number;
    };
    apps: Array<{
        url: string;
        title: string;
        description: string;
        icon: string;
        color: string;
        is_external: boolean;
    }>;
    activities: Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        user: {
            name: string;
            avatar?: string;
        };
        timestamp: string;
        icon: string;
        iconColor: string;
        bgColor: string;
    }>;
}

export async function getDashboardData() {
    return ApiService.fetchData<DashboardType>({
        url: withAPI('/dashboard'),
        method: 'get',
        params: {}
    })
}