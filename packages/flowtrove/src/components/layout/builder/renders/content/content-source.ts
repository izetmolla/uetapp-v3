import type { AxiosInstance } from "axios";

/** Object form of `content.source` (see README). */
export type ContentSourceDescriptor = {
  /** Key on layout `data` for the plain object scope (same as string `source`). */
  source?: string;
  /** Relative API path or absolute URL; when set, scope is loaded via TanStack Query + HTTP. */
  api?: string;
  /** HTTP verb (default GET). */
  method?: string;
  /** GET: sent as query `params`; other methods: JSON request body (`data`). */
  body?: Record<string, unknown>;
};

export type ContentSource = string | ContentSourceDescriptor;

export function getContentDataKey(source: ContentSource | undefined): string | undefined {
  if (source == null) return undefined;
  if (typeof source === "string") {
    const t = source.trim();
    return t || undefined;
  }
  if (typeof source === "object" && !Array.isArray(source)) {
    const s = source.source;
    if (typeof s === "string" && s.trim()) return s.trim();
  }
  return undefined;
}

export function getContentFetchSpec(
  source: ContentSource | undefined,
): { api: string; method: string; body?: Record<string, unknown> } | undefined {
  if (source == null || typeof source === "string") return undefined;
  const api = source.api;
  if (typeof api !== "string" || !api.trim()) return undefined;
  const raw = typeof source.method === "string" && source.method.trim() ? source.method.trim() : "GET";
  const method = raw.toUpperCase();
  return { api: api.trim(), method, body: source.body };
}

function asPlainObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function resolveContentObjectFromDataKey(
  dataKey: string | undefined,
  staticValue: Record<string, unknown> | undefined,
  layoutData: Record<string, unknown> | undefined,
): Record<string, unknown> | null {
  const data = layoutData ?? {};
  if (dataKey) {
    const obj = asPlainObject(data[dataKey]);
    if (obj) return obj;
  }
  if (staticValue && typeof staticValue === "object" && !Array.isArray(staticValue)) {
    return staticValue;
  }
  return null;
}

/** Uses `LayoutBuilder`'s `axios` from context (same instance as other layout fetches). */
export async function fetchContentSourcePayload(
  axiosClient: AxiosInstance,
  spec: { api: string; method: string; body?: Record<string, unknown> },
): Promise<unknown> {
  const method = spec.method.toUpperCase();
  const body = spec.body ?? {};
  const res = await axiosClient.request({
    url: spec.api,
    method,
    ...(method === "GET" ? { params: body } : { data: body }),
  });
  return res.data;
}
