import { MoreHorizontal, Play } from "lucide-react";
import { methodColor, statusColor, timeAgo, backendItemSurfaceClass } from "../../../lib/backend-format";
import { CallstackPills } from "./callstack-pills";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

import { toast } from "sonner";
import { Link, useParams } from "react-router";
import { useBackendStore } from "../../../store/backendStore";
import { cn } from "@workspace/ui/lib/utils";
import type { Workflow } from "@/components/workflow/types";

export function WorkflowGridItem({ workflow, index }: { workflow: Workflow; index: number }) {
    const { ws } = useParams();
    const duplicate = useBackendStore((s) => s.duplicateBackend);
    const remove = useBackendStore((s) => s.deleteBackend);

    return (
        <Link
            to={`/workspace/${ws}/workflows/${workflow.id}`}
            state={{ id: workflow.id }}
            className="group relative flex h-full min-h-0 animate-fade-in flex-col"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div
                className={`relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 dark:border-border ${backendItemSurfaceClass(index)}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${statusColor(workflow.status)}`} />
                        <span className={`text-mono text-[10px] uppercase tracking-wider rounded-md border px-2 py-0.5 ${methodColor(workflow.method)}`}>
                            {workflow.method ?? "CRON"}
                        </span>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="opacity-0 group-hover:opacity-100 rounded-md p-1 hover:bg-accent transition-opacity"
                            >
                                <MoreHorizontal className="size-4 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.preventDefault()}>
                            <DropdownMenuItem onClick={(e) => { e.preventDefault(); duplicate(workflow.id); toast.success("Duplicated"); }}>
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => { e.preventDefault(); remove(workflow.id); toast("Workflow deleted"); }}
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Title */}
                <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">
                    {workflow.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {workflow.description}
                </p>
                <p className="mt-1 text-mono text-[11px] text-muted-foreground/70 truncate">
                    {workflow.path}
                </p>

                <div className="my-4 h-px shrink-0 bg-border" />

                {/* Callstack */}
                <div className="min-h-0 flex-1">
                    <p className="text-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                        Callstack
                    </p>
                    <CallstackPills kinds={workflow?.callstack?.map((c) => c.kind) ?? []} />
                </div>

                {/* Footer */}
                <div className="mt-auto flex shrink-0 items-center justify-between pt-4 text-[11px] text-muted-foreground">
                        <span>Edited {timeAgo(workflow.updatedAt)}</span>
                    <span className="flex items-center gap-1 text-mono">
                        <Play className="size-3" />
                        {workflow?.run_count?.toLocaleString() ?? 0} runs
                    </span>
                </div>

                {/* Hover overlay button */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Button size="sm" className="pointer-events-auto shadow-sm">
                        Open Editor →
                    </Button>
                </div>
            </div>
        </Link>
    );
}

export function WorkflowListItem({ workflow, index }: { workflow: Workflow; index: number }) {
    const { ws } = useParams();
    const duplicate = useBackendStore((s) => s.duplicateBackend);
    const remove = useBackendStore((s) => s.deleteBackend);

    return (
        <Link
            to={`/workspace/${ws}/workflows/${workflow.id}`}
            className={cn(
                "group grid grid-cols-[24px_1.4fr_80px_2fr_120px_100px_40px] items-center gap-4 rounded-lg border border-border px-4 py-3 transition-colors",
                "hover:border-primary/40 dark:border-border dark:hover:border-primary/35",
                backendItemSurfaceClass(index),
                "animate-fade-in",
            )}
            style={{ animationDelay: `${index * 30}ms` }}
        >
            <span className={`size-2 rounded-full ${statusColor(workflow.status)}`} />
            <div className="min-w-0">
                <div className="text-sm font-medium truncate">{workflow.name}</div>
                <div className="text-mono text-[11px] text-muted-foreground truncate">{workflow.path}456</div>
            </div>
            <span className={`text-mono text-[10px] uppercase tracking-wider rounded-md border px-2 py-0.5 w-fit ${methodColor(workflow.method)}`}>
                {workflow.method ?? "CRON"}
            </span>
            <CallstackPills kinds={workflow?.callstack?.map((c) => c.kind) ?? []} max={3} />
            <span className="text-xs text-muted-foreground">{timeAgo(workflow.updatedAt)}</span>
            <span className="text-mono text-xs text-muted-foreground">{workflow?.run_count?.toLocaleString() ?? 0}</span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-md p-1 hover:bg-accent"
                    >
                        <MoreHorizontal className="size-4 text-muted-foreground" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.preventDefault()}>
                    <DropdownMenuItem onClick={(e) => { e.preventDefault(); duplicate(workflow.id); toast.success("Duplicated"); }}>
                        Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => { e.preventDefault(); remove(workflow.id); toast("Workflow deleted"); }}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Link>
    );
}
