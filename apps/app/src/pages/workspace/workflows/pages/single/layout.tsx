import { Outlet } from "react-router";

/**
 * Viewport-clamped shell for backends routes only (list + editor).
 * Does not alter the global workspace layout used by other sections.
 */
export default function SingleBackendsLayout() {
    return (
        <div
            className="flex w-full max-w-full flex-col overflow-hidden rounded-md"
            style={{
                height:
                    "calc(100svh - var(--header-height) - 2 * var(--content-padding) - var(--spacing))",
                maxHeight:
                    "calc(100svh - var(--header-height) - 2 * var(--content-padding) - var(--spacing))",
            }}
        >
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain bg-background">
                <Outlet />
            </div>
        </div>
    );
}
