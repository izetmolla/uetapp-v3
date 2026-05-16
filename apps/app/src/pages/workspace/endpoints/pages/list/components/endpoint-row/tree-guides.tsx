import { cn } from "@workspace/ui/lib/utils";
import type { FC } from "react";
import { TREE_GUIDE_COLUMN_LEFT } from "./constants";

/** Vertical spine for a non-last sibling: runs through the row and its subtree. */
export const SiblingTreeSpine: FC = () => (
    <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 top-0 w-3 border-l-2 border-solid border-muted"
    />
);

/** L-shaped cap for the last sibling at this depth (half-height vertical + bottom run). */
export const LastSiblingTreeElbow: FC = () => (
    <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-1/2 w-3 rounded-bl-md border-b-2 border-l-2 border-solid border-muted"
    />
);

interface ChevronToFirstChildConnectorProps {
    show: boolean;
}

/** Drops from the expanded chevron toward the first nested row (aligned with depth indent). */
export const ChevronToFirstChildConnector: FC<ChevronToFirstChildConnectorProps> = ({ show }) => {
    if (!show) return null;
    return (
        <span
            aria-hidden
            className={cn(
                "pointer-events-none absolute bottom-0 w-0 border-l-2 border-solid border-muted",
                TREE_GUIDE_COLUMN_LEFT,
                "top-[calc(50%+10px)]",
            )}
        />
    );
};
