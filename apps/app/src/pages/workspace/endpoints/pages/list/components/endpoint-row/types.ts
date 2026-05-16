import type { Endpoint } from "../../api";

export interface EndpointRowProps {
    endpoint: Endpoint;
    /** Nested level from the list root — each tier adds horizontal step so descendants form a pyramid. */
    depth?: number;
    isChild?: boolean;
    isFirstChild?: boolean;
    isLastChild?: boolean;
    /** True when this row follows a subtree whose last row has no bottom border (separator moves here). */
    showTopBorder?: boolean;
}
