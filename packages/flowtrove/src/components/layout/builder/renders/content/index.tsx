"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchContentSourcePayload,
  getContentDataKey,
  getContentFetchSpec,
  resolveContentObjectFromDataKey,
} from "./content-source";
import {
  deepInterpolateLayoutItems,
  mergeInterpolationConfig,
} from "../../lib/expression-template";
import { LayoutBuilderContext, useLayoutBuilderContext } from "../../LayoutBuilderContext";
import type { LayoutBuilderItem } from "../../types/items";
import type { LayoutRendererProps } from "../../types";
import type { ContentItem } from "./types";

function buildContentContext(
  base: Record<string, unknown>,
  obj: Record<string, unknown>,
  objectName: string,
): Record<string, unknown> {
  return {
    ...base,
    ...obj,
    [objectName]: obj,
  };
}

export function ContentRenderer({
  item,
  renderItems,
  path,
  data: layoutDataProp,
}: LayoutRendererProps<ContentItem>) {
  const ctx = useLayoutBuilderContext();
  const baseData = useMemo(
    () => (layoutDataProp ?? ctx.data ?? {}) as Record<string, unknown>,
    [layoutDataProp, ctx.data],
  );

  const objectName = item.objectName ?? "content";
  const dataKey = useMemo(() => getContentDataKey(item.source), [item.source]);
  const fetchSpec = useMemo(() => getContentFetchSpec(item.source), [item.source]);

  const staticResolved = useMemo(
    () => resolveContentObjectFromDataKey(dataKey, item.value, baseData),
    [dataKey, item.value, baseData],
  );

  const axiosClient = ctx.axios;

  const queryInitialData = useMemo(() => {
    if (!fetchSpec?.api || !axiosClient) return undefined;
    if (staticResolved == null) return undefined;
    if (Object.keys(staticResolved).length === 0) return undefined;
    return staticResolved;
  }, [fetchSpec?.api, axiosClient, staticResolved]);

  const { data: fetchedPayload, isSuccess, isError } = useQuery({
    queryKey: [
      "layout-content",
      item.id,
      fetchSpec?.api,
      fetchSpec?.method,
      JSON.stringify(fetchSpec?.body ?? {}),
    ],
    queryFn: () => fetchContentSourcePayload(axiosClient!, fetchSpec!),
    enabled: Boolean(fetchSpec?.api && axiosClient),
    staleTime: 60_000,
    ...(queryInitialData !== undefined
      ? {
          initialData: queryInitialData,
          initialDataUpdatedAt: 0,
        }
      : {}),
  });

  const obj = useMemo(() => {
    const baseObj = staticResolved ?? {};
    if (!fetchSpec?.api) return baseObj;
    if (isError) return baseObj;
    if (
      isSuccess &&
      fetchedPayload &&
      typeof fetchedPayload === "object" &&
      !Array.isArray(fetchedPayload)
    ) {
      return { ...baseObj, ...(fetchedPayload as Record<string, unknown>) };
    }
    return baseObj;
  }, [staticResolved, fetchedPayload, fetchSpec?.api, isSuccess, isError]);

  const template = (item.children ?? []) as LayoutBuilderItem[];
  const evalCtx = buildContentContext(baseData, obj, objectName);
  const interpolation = mergeInterpolationConfig(ctx.interpolation, item.interpolation);
  const interpolated = deepInterpolateLayoutItems(template, evalCtx, interpolation);

  if (!interpolated.length) {
    return null;
  }

  return (
    <div className={item.className} style={item.style}>
      <LayoutBuilderContext.Provider
        value={{
          ...ctx,
          data: evalCtx,
          interpolation,
        }}
      >
        {renderItems(interpolated, path)}
      </LayoutBuilderContext.Provider>
    </div>
  );
}

export default ContentRenderer;
export type { ContentItem };
