import { withWs, type WithPagination } from "@workspace/flowtrove/lib/network";
import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";


/** Root segment for endpoints list queries — use this with `invalidateQueries` to refresh every list variant. */
export const ENDPOINTS_LIST_QUERY_PREFIX = ["endpoints-list"] as const;

export type Domain = {
  id: string;
  domain: string;
  primary: boolean;
}

export type EndpointGroup = {
  id: string;
  name: string;
  path: string;
  category: "web" | "api";
  visibility: "public" | "private";
}
export type Endpoint = {
  id: string;
  name: string;
  path: string;
  group_id?: string;
  group?: EndpointGroup
  status: "active" | "inactive";
  domain?: Domain;
  children: Endpoint[];
  category: "web" | "api";
  visibility: "public" | "private";
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS" | "CONNECT" | "TRACE";
  type: "web" | "api";
  option?: string;
}



export interface GetEndpointsResponse {
  endpoints: WithPagination<Endpoint>;
  domains: Domain[];
}

export function getEndpoints(params: Record<string, unknown>): Promise<GetEndpointsResponse> {
  return ApiService.fetchDataBody<GetEndpointsResponse>({
    url: withAPI('/endpoints/list'),
    method: "get",
    params: withWs(params),
  });
}

//mock data

