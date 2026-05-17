import { customAlphabet } from "nanoid";
import { v4 as V4 } from "uuid";

const prefixes: Record<string, unknown> = {};

interface GenerateIdOptions {
  length?: number;
  separator?: string;
}

export function generateId(
  prefixOrOptions?: keyof typeof prefixes | GenerateIdOptions,
  inputOptions: GenerateIdOptions = {},
  isUUID = false,
) {
    if (isUUID) {
        return V4()
    }
  const finalOptions =
    typeof prefixOrOptions === "object" ? prefixOrOptions : inputOptions;

  const prefix =
    typeof prefixOrOptions === "object" ? undefined : prefixOrOptions;

  const { length = 12, separator = "_" } = finalOptions;
  const id = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    length,
  )();

  return prefix ? `${prefixes[prefix]}${separator}${id}` : id;
}