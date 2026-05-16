import { Button } from "@workspace/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import {
    Activity,
    BarChart3,
    ClipboardList,
    ExternalLink,
    Gauge,
    Link2,
    Settings,
} from "lucide-react";
import type { FC, ReactElement } from "react";
import { Link } from "react-router";
import type { Endpoint } from "../api";
import { cn } from "@workspace/ui/lib/utils";

/** Wait ~3s on hover before opening icons help (avoid noisy tips while scanning the list). */
const TOOLTIP_OPEN_DELAY_MS = 3000;

/** Sub-row under path — compact but legible. */
const iconWrap =
    "!size-[15px] min-h-[15px] min-w-[15px] shrink-0 rounded-[3px] p-0 text-muted-foreground hover:bg-muted/70 hover:text-foreground [&_svg]:pointer-events-none [&_svg]:!size-[11px]";

function IconActionTooltip({
    label,
    description,
    children,
}: {
    label: string;
    description: string;
    children: ReactElement;
}) {
    return (
        <Tooltip delayDuration={TOOLTIP_OPEN_DELAY_MS}>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6} className="max-w-[14rem] flex flex-col gap-0.5 px-2.5 py-2 text-left">
                <span className="font-medium">{label}</span>
                <span className="text-[11px] leading-snug text-background/85">{description}</span>
            </TooltipContent>
        </Tooltip>
    );
}

interface EndpointRowOptionsProps {
    endpoint: Endpoint;
}

const EndpointRowOptions: FC<EndpointRowOptionsProps> = ({ endpoint }) => {
    const host = endpoint.domain?.domain;
    const absoluteUrl = host != null && host !== "" ? `https://${host}/${endpoint.path.replace(/^\//, "")}` : null;

    return (
        <div
            className="flex w-fit max-w-full flex-wrap items-center gap-x-1 gap-y-0.5 opacity-[0.82] transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
            role="group"
            aria-label="Quick actions"
        >
            <IconActionTooltip
                label="Traffic & analytics"
                description="Latency, throughput, errors, and request volume for this route."
            >
                <Button variant="ghost" size="icon-xs" className={cn(iconWrap)} asChild>
                    <Link to={`${endpoint.id}`} state={{ endpoint, focus: "analytics" }} aria-label="Open traffic analytics">
                        <BarChart3 strokeWidth={2.25} aria-hidden />
                    </Link>
                </Button>
            </IconActionTooltip>
            <IconActionTooltip label="Performance metrics" description="Quotas, health checks, and per-method KPIs over time.">
                <Button variant="ghost" size="icon-xs" className={cn(iconWrap)} asChild>
                    <Link to={`${endpoint.id}`} state={{ endpoint, focus: "metrics" }} aria-label="Open metrics">
                        <Gauge strokeWidth={2.25} aria-hidden />
                    </Link>
                </Button>
            </IconActionTooltip>
            <IconActionTooltip
                label="Recent activity"
                description="Inspect the latest inbound requests and related audit events."
            >
                <Button variant="ghost" size="icon-xs" className={cn(iconWrap)} asChild>
                    <Link to={`${endpoint.id}`} state={{ endpoint, focus: "activity" }} aria-label="Open activity">
                        <Activity strokeWidth={2.25} aria-hidden />
                    </Link>
                </Button>
            </IconActionTooltip>
            <IconActionTooltip label="Endpoint settings" description="Route, behaviors, timeouts, and environment overrides.">
                <Button variant="ghost" size="icon-xs" className={cn(iconWrap)} asChild>
                    <Link to={`${endpoint.id}`} state={{ endpoint }} aria-label="Open endpoint settings">
                        <Settings strokeWidth={2.25} aria-hidden />
                    </Link>
                </Button>
            </IconActionTooltip>
            <IconActionTooltip
                label="Schemas & bindings"
                description="Define validation rules and link payload schemas to outbound integrations."
            >
                <Button variant="ghost" size="icon-xs" className={cn(iconWrap)} asChild>
                    <Link to={`${endpoint.id}`} state={{ endpoint, focus: "schemas" }} aria-label="Open schemas">
                        <ClipboardList strokeWidth={2.25} aria-hidden />
                    </Link>
                </Button>
            </IconActionTooltip>
            {absoluteUrl != null ? (
                <IconActionTooltip
                    label="Open public URL"
                    description={`Loads ${absoluteUrl} in a new tab so you can quickly smoke-test.`}
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className={cn(iconWrap)}
                        aria-label="Open public URL in new tab"
                        onClick={() => window.open(absoluteUrl, "_blank", "noopener,noreferrer")}
                    >
                        <ExternalLink strokeWidth={2.25} aria-hidden />
                    </Button>
                </IconActionTooltip>
            ) : (
                <IconActionTooltip
                    label="Public URL unavailable"
                    description="Attach a reachable domain before you can preview this path in the browser."
                >
                    <span className="inline-flex">
                        <Button variant="ghost" size="icon-xs" className={cn(iconWrap, "pointer-events-none opacity-35")} disabled aria-label="Public URL unavailable">
                            <ExternalLink strokeWidth={2.25} aria-hidden />
                        </Button>
                    </span>
                </IconActionTooltip>
            )}
            <IconActionTooltip
                label="Links & integrations"
                description="Deep links, webhooks, and partner tokens are managed from this panel."
            >
                <Button variant="ghost" size="icon-xs" className={cn(iconWrap)} asChild>
                    <Link to={`${endpoint.id}`} state={{ endpoint, focus: "links" }} aria-label="Open links and integrations">
                        <Link2 strokeWidth={2.25} aria-hidden />
                    </Link>
                </Button>
            </IconActionTooltip>
        </div>
    );
};

export default EndpointRowOptions;
