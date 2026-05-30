"use client";

import { Fragment, useMemo } from "react";
import {
  asObjectRecord,
  deepInterpolateLayoutItems,
  mergeInterpolationConfig,
  withUniqueIdsSuffix,
} from "../../lib/expression-template";
import { LayoutBuilderContext, useLayoutBuilderContext } from "../../LayoutBuilderContext";
import type { LayoutBuilderItem } from "../../types/items";
import type { LayoutRendererProps } from "../../types";
import type { ItemListItem } from "./types";

function buildEvaluatorContext(
  base: Record<string, unknown>,
  row: Record<string, unknown>,
  itemName: string,
  index: number,
): Record<string, unknown> {
  return {
    ...base,
    ...row,
    [itemName]: row,
    index,
    row,
  };
}

function resolveRows(
  source: string | undefined,
  list: unknown[] | undefined,
  layoutData: Record<string, unknown> | undefined,
): unknown[] {
  const data = layoutData ?? {};
  if (source) {
    const fromData = data[source];
    if (Array.isArray(fromData) && fromData.length > 0) {
      return fromData;
    }
  }
  if (Array.isArray(list) && list.length > 0) {
    return list;
  }
  if (source) {
    const fromData = data[source];
    if (Array.isArray(fromData)) return fromData;
  }
  return [];
}

export function ItemListRenderer({
  item,
  renderItems,
  path,
  data: layoutDataProp,
}: LayoutRendererProps<ItemListItem>) {
  const ctx = useLayoutBuilderContext();
  const baseData = useMemo(
    () => (layoutDataProp ?? ctx.data ?? {}) as Record<string, unknown>,
    [layoutDataProp, ctx.data],
  );

  const itemName = item.itemName ?? "item";
  const interpolation = mergeInterpolationConfig(ctx.interpolation, item.interpolation);
  const rows = useMemo(
    () => resolveRows(item.source, item.list, baseData),
    [item.source, item.list, baseData],
  );
  const template = (item.children ?? []) as LayoutBuilderItem[];

  if (!Array.isArray(rows)) {
    return null;
  }

  return (
    <div className={item.className} style={item.style} role="list">
      {rows.map((row, index) => {
        const rowObj = asObjectRecord(row);
        const evalCtx = buildEvaluatorContext(baseData, rowObj, itemName, index);
        const interpolatedRaw = deepInterpolateLayoutItems(template, evalCtx, interpolation);
        const rowKey =
          (typeof rowObj.id === "string" || typeof rowObj.id === "number"
            ? String(rowObj.id)
            : null) ?? String(index);
        const interpolated = withUniqueIdsSuffix(interpolatedRaw, `-r${rowKey}`);

        return (
          <Fragment key={rowKey}>
            <LayoutBuilderContext.Provider
              value={{
                ...ctx,
                data: evalCtx,
                interpolation,
              }}
            >
              {interpolated.length ? renderItems(interpolated, path) : null}
            </LayoutBuilderContext.Provider>
          </Fragment>
        );
      })}
    </div>
  );
}

export default ItemListRenderer;
export type { ItemListItem };
