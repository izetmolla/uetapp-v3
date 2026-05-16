import ApiService, { withAPI, withWs } from "@workspace/flowtrove/lib/network";
import { z } from "zod";
import {
  ENTITY_NAME_REGEX,
  TABLE_NAME_REGEX,
  stripTrailingTableUnderscores,
} from "../lib/utils";

export interface AddEntityResponse {
  success?: boolean;
  error?: boolean;
  message?: string;
  code?: string;
  details?: unknown;
}

export function addEntity(data: Record<string, unknown>) {
  return ApiService.fetchDataBody<AddEntityResponse>({
    url: withAPI("/entities/create-entity"),
    method: "post",
    data: withWs(data),
  });
}

const entityNameSchema = z
  .string()
  .min(1, { message: "Entity name is required" })
  .regex(
    ENTITY_NAME_REGEX,
    {
      message:
        "Use PascalCase: each word starts with an uppercase letter; only letters and digits (e.g. GameStyle)",
    },
  );

const tableNameSchema = z
  .string()
  .min(1, { message: "Table name is required" })
  .superRefine((val, ctx) => {
    const n = stripTrailingTableUnderscores(val);
    if (!n) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Table name is required",
      });
      return;
    }
    if (!TABLE_NAME_REGEX.test(n)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Use snake_case: lowercase; separate words with _ (e.g. game_style). Single-word names have no underscore.",
      });
    }
  });

/**
 * Validates each field on its own. The form keeps `name` and `table_name` in sync while typing;
 * we do not add a cross-field refine on `table_name` (it produced a noisy FormMessage during input).
 * On submit, the dialog sends `table_name` derived from `name` so the API always gets a consistent pair.
 */
export const AddEntitySchema = z.object({
  name: entityNameSchema,
  table_name: tableNameSchema,
});

export type AddEntitySchemaType = z.infer<typeof AddEntitySchema>;
