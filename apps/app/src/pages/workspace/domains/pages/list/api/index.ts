import { withWs, type WithPagination } from "@workspace/flowtrove/lib/network";
import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";

export type Filter = "all" | "active" | "inactive" | "aliases";
export type DomainType = "domain" | "subdomain" | "alias";
export type DomainStatus = "active" | "inactive";
export interface DnsRecord {
  id: string;
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT";
  name: string;
  value: string;
  ttl: number;
}

export interface RedirectRule {
  id: string;
  source: string;
  destination: string;
  code: 301 | 302;
  enabled: boolean;
}

export interface Origin {
  id: string;
  host: string;
  weight: number;
  healthy: boolean;
}

export type Domain = {
  id: string;
  domain: string;
  type: DomainType;
  status: DomainStatus;
  parent_id?: string;
  registrar?: string;
  expires_at?: string;
  project?: string;
  primary?: boolean;
  ssl: {
    autoRenew: boolean;
    expires_at: string;
    force_https: boolean;
    hsts: boolean;
  };
  dns: DnsRecord[];
  redirects: RedirectRule[];
  origins: Origin[];
}



export interface GetDomainsResponse {
  domains: WithPagination<Domain>
}

export function getDomains(params: Record<string, unknown>): Promise<GetDomainsResponse> {
  return ApiService.fetchDataBody<GetDomainsResponse>({
    url: withAPI('/domains/list'),
    method: "get",
    params: withWs(params),
  });
}

//mock data

