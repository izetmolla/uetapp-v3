import { useMemo, useState } from "react";
import { Download, Search, Plus, Cog, ArrowRight } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@workspace/ui/components/table";
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink,
    PaginationNext, PaginationPrevious,
} from "@workspace/ui/components/pagination";
import { Crumbs } from "../../components/crumbs";
import { PageHeader, PageShell } from "../../components/page-shell";
import { GridSkeleton, TableSkeleton } from "../../components/skeleton-page";
import { ViewToggle } from "../../components/view-toggle";
import { Link, useParams } from "react-router";
import { queryClient, withError, withInitialData } from "@workspace/flowtrove/lib/network";
import { getDocuments, type GetDocumentsResponse, type Document } from "./api";
import { useQuery } from "@tanstack/react-query";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { useDocumentListStore } from "./store";
import SyncStudentsDialog from "@/pages/contracts/components/syncstudents";

const PER_PAGE = 100;


const DocumentsPage = () => {
    const { year = "", faculty_slug = "", group_id = "", folder_id = "" } = useParams();
    const setIsImportDocumentsDialogOpen = useDocumentListStore((s) => s.setIsImportDocumentsDialogOpen);
    const isImportDocumentsDialogOpen = useDocumentListStore((s) => s.isImportDocumentsDialogOpen);
    const [list, setList] = useState(true);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);

    const queryKey = ["documents", folder_id];
    const { data, isLoading, error } = useQuery({
        queryFn: () => getDocuments({ folder_id }),
        queryKey: queryKey,
        ...withInitialData<GetDocumentsResponse>(),
    });

    const filteredDocuments = useMemo(() => {
        const documents = data?.documents ?? [];
        const term = q.trim().toLowerCase();
        if (!term) return documents;
        return documents.filter(
            (d) =>
                d.name.toLowerCase().includes(term) ||
                String(d.id).toLowerCase().includes(term),
        );
    }, [data?.documents, q]);

    const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PER_PAGE;
    const pageDocuments = filteredDocuments.slice(start, start + PER_PAGE);

    const basePath = "/contracts/scandocuments";
    const programLabel = data?.study_level?.name ?? "";


    const stydyLevels = data?.study_level_group?.study_levels?.map((s) => s?.study_level?.name).join(", ");



    return (
        <PageShell>
            <Crumbs
                items={[
                    { label: "Scan Documents", to: basePath },
                    { label: year.replace("-", " – "), to: `${basePath}/${year}` },
                    { label: data?.faculty?.name ?? "", to: `${basePath}/${year}/${faculty_slug}` },
                    { label: data?.study_level_group?.name ?? "", to: `${basePath}/${year}/${faculty_slug}/${group_id}` },
                    { label: data?.folder?.name ?? "", to: `${basePath}/${year}/${faculty_slug}/${group_id}/${folder_id}` },
                ]}
            />
            <PageHeader
                title={`${data?.folder?.name ?? ""} — Student Documents`}
                subtitle={stydyLevels}
                right={
                    <div className="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:justify-end sm:gap-1.5">
                        <ViewToggle list={list} onChange={setList} id="documents-view" />
                        <div className="relative w-full sm:w-44 md:w-48">
                            <Search
                                className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                                aria-hidden
                            />
                            <Input
                                type="search"
                                placeholder="Search…"
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value);
                                    setPage(1);
                                }}
                                className="h-8 w-full pl-8 text-sm"
                                aria-label="Search documents"
                            />
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <Button
                                type="button"
                                size="sm"
                                className="gap-1"
                                onClick={() => setIsImportDocumentsDialogOpen(true)}
                            >
                                <Plus className="size-4" aria-hidden />
                                Add
                            </Button>
                            <Button type="button" size="icon" variant="default" className="size-8">
                                <Cog className="size-4" aria-hidden />
                            </Button>
                        </div>
                    </div>
                }
            />

            <ContentLoader
                isLoading={isLoading}
                error={withError(error, data)}
                forMeta
                customLoader={list ? <TableSkeleton /> : <GridSkeleton />}
            >
                {pageDocuments.length === 0 ? (
                    <div className="glass-card rounded-2xl py-10 text-center text-muted-foreground">
                        No documents match your search.
                    </div>
                ) : list ? (
                    <DocumentsListView documents={pageDocuments} programLabel={programLabel} />
                ) : (
                    <DocumentsGridView documents={pageDocuments} programLabel={programLabel} />
                )}

                <PaginationBar
                    page={safePage}
                    setPage={setPage}
                    totalPages={totalPages}
                    total={filteredDocuments.length}
                    start={start}
                    perPage={PER_PAGE}
                    label="documents"
                />
            </ContentLoader>
            <SyncStudentsDialog
                onSuccess={() => {
                    void queryClient.invalidateQueries({ queryKey });
                    setIsImportDocumentsDialogOpen(false)
                }}
                withParams={{
                    folder_id: Number(folder_id),
                    CUSTOM_URL: "/contracts/scandocuments/documents/add-students",
                }}
                isOpen={isImportDocumentsDialogOpen}
                onClose={() => setIsImportDocumentsDialogOpen(false)}
            />
        </PageShell>
    );
};

function DocumentsGridView({
    documents,
    programLabel,
}: {
    documents: Document[];
    programLabel: string;
}) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {documents.map((d) => (
                <Link
                    key={d.id}
                    to={`${d.id}`}
                    className="glass-card glow-hover rounded-2xl p-5"
                    style={{
                        background: `radial-gradient(100% 60% at 50% 0%, ${d.color}22, transparent 70%), var(--card)`,
                    }}
                >
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div
                            className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                            style={{ background: `linear-gradient(135deg, ${d.color}, ${d.color}99)` }}
                        >
                            {d.initials}
                        </div>
                        <DocumentStatus status={d.status} />
                    </div>
                    <h3 className="font-display mb-0.5 truncate text-base font-semibold">{d.name}</h3>
                    <p className="mb-3 font-mono text-xs text-muted-foreground">#{d.id}</p>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{programLabel}</Badge>
                        <Badge variant="outline">{d.docs} docs</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Scanned {d.scannedDate}</p>
                </Link>
            ))}
        </div>
    );
}

function DocumentsListView({
    documents,
    programLabel,
}: {
    documents: Document[];
    programLabel: string;
}) {
    return (
        <div className="glass-card overflow-hidden rounded-2xl">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Docs</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Scanned</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.map((d) => (
                        <TableRow key={d.id} className="transition-colors hover:bg-secondary/30">
                            <TableCell>
                                <div
                                    className="grid h-9 w-9 place-items-center rounded-full text-xs font-semibold text-white"
                                    style={{ background: `linear-gradient(135deg, ${d.color}, ${d.color}99)` }}
                                >
                                    {d.initials}
                                </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{d.id}</TableCell>
                            <TableCell className="font-medium">{d.name}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{programLabel}</Badge>
                            </TableCell>
                            <TableCell>{d.docs}</TableCell>
                            <TableCell>
                                <DocumentStatus status={d.status} />
                            </TableCell>
                            <TableCell className="text-muted-foreground">{d.scannedDate}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button asChild size="sm" variant="ghost">
                                        <Link to={`${d.id}`}>
                                            View <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                    <Button size="icon" variant="ghost">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function PaginationBar({
    page,
    setPage,
    totalPages,
    total,
    start,
    perPage,
    label,
}: {
    page: number;
    setPage: (fn: (p: number) => number) => void;
    totalPages: number;
    total: number;
    start: number;
    perPage: number;
    label: string;
}) {
    if (total === 0) return null;

    return (
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>
                Showing {start + 1}–{Math.min(start + perPage, total)} of {total} {label}
            </span>
            {totalPages > 1 ? (
                <Pagination className="mx-0 w-auto">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setPage((p) => Math.max(1, p - 1));
                                }}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    href="#"
                                    isActive={page === i + 1}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPage(() => i + 1);
                                    }}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setPage((p) => Math.min(totalPages, p + 1));
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            ) : null}
        </div>
    );
}

function DocumentStatus({ status }: { status: "Verified" | "Pending Review" | "Missing Docs" }) {
    const map = {
        Verified: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
        "Pending Review": "border-amber-500/40 text-amber-400 bg-amber-500/10",
        "Missing Docs": "border-red-500/40 text-red-400 bg-red-500/10",
    } as const;
    return <Badge variant="outline" className={map[status]}>{status}</Badge>;
}

export default DocumentsPage;
