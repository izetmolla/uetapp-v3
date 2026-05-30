import { createParser } from "nuqs/server";
import { z } from "zod";

import { dataTableConfig } from "../config/data-table";

import type {
  AdvancedFilterEntry,
  ExtendedColumnSort,
} from "../types/data-table";

const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

function resolveValidColumnKeys(
  columnIds?: string[] | Set<string>,
): Set<string> | null {
  if (!columnIds) return null;
  const set = columnIds instanceof Set ? columnIds : new Set(columnIds);
  return set.size > 0 ? set : null;
}

export const getSortingStateParser = <TData>(
  columnIds?: string[] | Set<string>,
) => {
  const validKeys = resolveValidColumnKeys(columnIds);

  return createParser({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value);
        const result = z.array(sortingItemSchema).safeParse(parsed);

        if (!result.success) return null;

        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null;
        }

        return result.data as ExtendedColumnSort<TData>[];
      } catch {
        return null;
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (item, index) =>
          item.id === b[index]?.id && item.desc === b[index]?.desc,
      ),
  });
};

const joinOperatorSchema = z.enum(dataTableConfig.joinOperators);

const filterConditionSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]).optional(),
  variant: z.enum(dataTableConfig.filterVariants),
  operator: z.enum(dataTableConfig.operators),
  filterId: z.string(),
  joinOperator: joinOperatorSchema.optional(),
});

const filterGroupSchema = z.object({
  type: z.literal("group"),
  groupId: z.string(),
  joinOperator: joinOperatorSchema.optional(),
  filters: z.array(filterConditionSchema).min(1),
});

const filterEntrySchema = z.union([filterGroupSchema, filterConditionSchema]);

export type FilterItemSchema = z.infer<typeof filterConditionSchema>;
export type FilterGroupSchema = z.infer<typeof filterGroupSchema>;
export type FilterEntrySchema = z.infer<typeof filterEntrySchema>;

export const getFiltersStateParser = <TData>(
  _columnIds?: string[] | Set<string>,
) => {
  return createParser({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value);
        const result = z.array(filterEntrySchema).safeParse(parsed);

        if (!result.success) return null;

        return result.data as AdvancedFilterEntry<TData>[];
      } catch {
        return null;
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  });
};
