/** Static pill for group rows — matches HTTP method chip sizing; violet to separate from verb badges. */
export const GROUP_BADGE_VISUAL =
    "border-violet-500/40 bg-violet-500/[0.14] text-violet-950 hover:bg-violet-500/18 dark:text-violet-200 dark:border-violet-400/35 dark:bg-violet-500/[0.18] dark:hover:bg-violet-500/22";

/**
 * Indent per depth: aligns child column with expand-chevron center (pl-5 + half of size-7).
 */
export const TREE_DEPTH_INDENT = "ml-[34px]";

/** Shared row chrome so chevron-x matches {@link TREE_DEPTH_INDENT} at every depth. */
export const ENDPOINT_ROW_SHELL = "group flex min-h-9 items-center gap-2 pl-5 pr-4 py-2 transition-colors duration-150 hover:bg-muted/50";

/** Horizontal offset of vertical guides from the row’s left edge (matches indent step). */
export const TREE_GUIDE_COLUMN_LEFT = "left-[34px]";
