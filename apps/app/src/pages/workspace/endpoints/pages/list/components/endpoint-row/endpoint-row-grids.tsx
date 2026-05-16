import { cn } from "@workspace/ui/lib/utils";
import type { FC } from "react";
import { Link } from "react-router";
import type { Endpoint } from "../../api";
import EndpointRowOptions from "../endpoint-row-options";
import { GROUP_BADGE_VISUAL } from "./constants";
import { getHttpMethodBadgeClass } from "./http-method-badge-class";

const BADGE_COLUMN_STUBS = (
    <div className="relative mt-0.5 flex min-h-[12px] w-full min-w-[2.25rem] flex-1 flex-col items-center overflow-visible">
        <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 bottom-[6px] w-0 -translate-x-1/2 border-l-2 border-dashed border-muted"
        />
        <span
            aria-hidden
            className="pointer-events-none absolute bottom-[6px] left-1/2 h-px w-[calc(50%+0.5rem+1px)] border-t-2 border-dashed border-muted"
        />
    </div>
);

interface EndpointMainColumnProps {
    endpoint: Endpoint;
    displayPath: string;
}

export const GroupEndpointMainColumn: FC<EndpointMainColumnProps> = ({ endpoint, displayPath }) => (
    <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1">
        <div className="row-span-2 flex min-w-0 flex-col items-center">
            <span
                className={cn(
                    "relative z-[1] inline-flex h-[18px] min-w-fit shrink-0 cursor-default select-none items-center justify-center rounded-xs border px-2 py-px font-mono text-[9px] font-semibold uppercase leading-none tabular-nums tracking-wide",
                    GROUP_BADGE_VISUAL,
                )}
            >
                GROUP
            </span>
            {BADGE_COLUMN_STUBS}
        </div>
        <div className="col-start-2 row-start-1 inline-flex min-w-0 max-w-full justify-start self-start">
            <Link
                to={`${endpoint.id}`}
                state={{ endpoint }}
                className="min-w-0 max-w-full truncate font-mono text-[15px] font-medium leading-snug text-foreground hover:underline"
            >
                {displayPath}
            </Link>
        </div>
        <div className="col-start-2 row-start-2 inline-flex min-w-0 max-w-full justify-start">
            <EndpointRowOptions endpoint={endpoint} />
        </div>
    </div>
);

interface HttpMethodEndpointMainColumnProps extends EndpointMainColumnProps {
    onOpenUrl: () => void;
}

export const HttpMethodEndpointMainColumn: FC<HttpMethodEndpointMainColumnProps> = ({
    endpoint,
    displayPath,
    onOpenUrl,
}) => (
    <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1">
        <div className="row-span-2 flex min-w-0 flex-col items-center">
            <button
                type="button"
                onClick={onOpenUrl}
                aria-label={`Open endpoint URL (${endpoint.method})`}
                className={cn(
                    "relative z-[1] inline-flex h-[18px] min-w-fit shrink-0 cursor-pointer items-center justify-center rounded-xs border px-2 py-px font-mono text-[9px] font-semibold uppercase leading-none tabular-nums tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 dark:focus-visible:ring-ring/40",
                    getHttpMethodBadgeClass(endpoint.method),
                )}
            >
                {endpoint.method}
            </button>
            {BADGE_COLUMN_STUBS}
        </div>
        <div className="col-start-2 row-start-1 inline-flex min-w-0 max-w-full justify-start self-start">
            <Link
                to={`${endpoint.id}`}
                state={{ endpoint }}
                className="min-w-0 max-w-full truncate font-mono text-[15px] font-medium leading-snug text-foreground hover:underline"
            >
                {displayPath}
            </Link>
        </div>
        <div className="col-start-2 row-start-2 inline-flex min-w-0 max-w-full justify-start">
            <EndpointRowOptions endpoint={endpoint} />
        </div>
    </div>
);
