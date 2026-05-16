/** PascalCase entity name → snake_case table name (e.g. GameStyle → game_style) */
export function entityNameToSnake(value: string): string {
  if (!value) return "";
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

/** Removes trailing `_` when no next word segment follows (final / blur / submit). */
export function stripTrailingTableUnderscores(value: string): string {
  return value.replace(/_+$/g, "");
}

/** snake_case table name → PascalCase entity name (e.g. game_style → GameStyle). Ignores empty trailing segments. */
export function snakeToEntityName(value: string): string {
  const normalized = stripTrailingTableUnderscores(value);
  if (!normalized) return "";
  return normalized
    .split("_")
    .filter((part) => part.length > 0)
    .map((part) => {
      const lower = part.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

/**
 * PascalCase: starts with uppercase; further words start with uppercase; only letters and digits (e.g. GameStyle, Customer).
 */
export const ENTITY_NAME_REGEX = /^[A-Z](?:[a-z0-9]*(?:[A-Z][a-z0-9]*)*)?$/;

/** snake_case: lowercase; separate words with underscores (e.g. game_style; single word: customer) */
export const TABLE_NAME_REGEX = /^[a-z][a-z0-9]*(?:_[a-z][a-z0-9]*)*$/;

function titleCaseSegment(seg: string): string {
  const alphanumericOnly = seg.replace(/[^A-Za-z0-9]/g, "");
  if (!alphanumericOnly) return "";
  const first = alphanumericOnly.charAt(0);
  const rest = alphanumericOnly.slice(1);
  const fixedFirst = /^[a-z]$/.test(first) ? first.toUpperCase() : first;
  return fixedFirst + rest;
}

/** Allows PascalCase typing; underscores in input become word boundaries → concatenated PascalCase. */
export function sanitizeEntityNameInput(raw: string): string {
  const normalized = raw
    .replace(/[^A-Za-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!normalized) return "";
  return normalized
    .split("_")
    .filter(Boolean)
    .map(titleCaseSegment)
    .join("");
}

/**
 * Lowercase snake_case input. Collapses repeated `_`, strips leading `_`.
 * With `preserveTrailingUnderscore`, keeps a single trailing `_` so the user can type the next word (`game_` → `style`).
 */
export function sanitizeTableNameInput(
  raw: string,
  options?: { preserveTrailingUnderscore?: boolean },
): string {
  let s = raw
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+/g, "");
  if (!options?.preserveTrailingUnderscore) {
    s = stripTrailingTableUnderscores(s);
  } else if (s.endsWith("_")) {
    s = stripTrailingTableUnderscores(s) + "_";
  }
  return s;
}
