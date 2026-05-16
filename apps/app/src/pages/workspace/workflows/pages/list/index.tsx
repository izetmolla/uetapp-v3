import { useMemo, useState } from "react";
import { Database } from "lucide-react";
import { CreateWorkflowModal } from "./components/create-workflow-dialog";
import { useSearchParams } from "react-router";
import EmptyState from "./components/empty-state";
import { useQuery, type QueryKey } from "@tanstack/react-query";
import { getWorkflows, type WorkflowListResponse } from "./api";
import { withError, withInitialData } from "@workspace/flowtrove/lib/network";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import Header from "./components/header";
import { useWorkflowListStore } from "./store";
import CustomPagination from "@workspace/ui/components/custom-pagination";
import { WorkflowGridItem, WorkflowListItem } from "./components/workflow-single-item";



function WorkflowListPage() {
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState("");
    const [filter] = useState("all");
    const {
        mode,
        isCreateWorkflowDialogOpen,
        setIsCreateWorkflowDialogOpen
    } = useWorkflowListStore();

    const page = useMemo(() => searchParams.get("page") ? Number(searchParams.get("page")) : 1, [searchParams]);
    const limit = useMemo(() => searchParams.get("limit") ? Number(searchParams.get("limit")) : 10, [searchParams]);
    const queryKey: QueryKey = ["workflows-list", page, limit, query, filter];
    const { isLoading, data, error } = useQuery({
        queryKey,
        queryFn: () => getWorkflows({ page, limit, query }),
        ...withInitialData<WorkflowListResponse>(),
        enabled: true,
    });

    const workflows = useMemo(() => data?.workflows?.data ?? [], [data]);


    return (
        <ContentLoader
            title="Manage Workflows"
            isLoading={isLoading}
            error={withError(error, data)}
            forMeta
        >
            <div className="flex min-h-full w-full flex-col bg-background">
                <Header search={query} onSearch={setQuery} />
                <main className="relative mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
                    <div className="mb-6 flex flex-col gap-1 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 text-primary">
                                <Database className="size-4" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Workflows</h1>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    {data?.workflows?.pagination?.total.toString()} {data?.workflows?.pagination?.total === 1 ? "workflow" : "workflows"}
                                    <span className="text-border mx-1.5">·</span>
                                    <span className="font-mono text-xs">
                                        {workflows.reduce((a, b) => a + (b.run_count ?? 0), 0).toLocaleString()} runs
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {workflows.length === 0 ? (
                        <EmptyState onCreate={() => setIsCreateWorkflowDialogOpen(true)} hasQuery={query.length > 0} />
                    ) : mode === "grid" ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {workflows.map((w, i) => <WorkflowGridItem key={w.id} workflow={w} index={i} />)}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border bg-muted/20 p-2 dark:bg-muted/10">
                            <div className="mb-2 grid grid-cols-[24px_1.4fr_80px_2fr_120px_100px_40px] items-center gap-4 rounded-md border border-border bg-muted/50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground dark:bg-muted/30">
                                <span className="sr-only">Status</span>
                                <span>Name</span>
                                <span>Method</span>
                                <span>Callstack</span>
                                <span>Last edited</span>
                                <span>Runs</span>
                                <span className="sr-only">Actions</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {workflows.map((w, i) => <WorkflowListItem key={w.id} workflow={w} index={i} />)}
                            </div>
                        </div>
                    )}
                    <div className="mt-4">
                        <CustomPagination currentPage={page} totalPages={data?.workflows?.pagination?.total_pages ?? 0} />
                    </div>
                </main>

                <CreateWorkflowModal
                    isOpen={isCreateWorkflowDialogOpen}
                    onClose={() => setIsCreateWorkflowDialogOpen(false)}
                />
            </div>
        </ContentLoader>
    );
}

export default WorkflowListPage;
