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
import { withError, withInitialData } from "@workspace/flowtrove/lib/network";
import { getStudents, type GetStudentsResponse } from "./api";
import { useQuery } from "@tanstack/react-query";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { useStudentListStore } from "./store";
import ImportUsersDialog from "./components/import-users-dialog";

const PER_PAGE = 10;

type Student = GetStudentsResponse["students"][number];

const StudentsPage = () => {
    const { year = "", faculty_slug = "", level = "", folder_id } = useParams();
    const setIsImportUsersDialogOpen = useStudentListStore((s) => s.setIsImportUsersDialogOpen);

    const [list, setList] = useState(true);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryFn: () => getStudents({ year, faculty_slug, level_slug: level, folder_id }),
        queryKey: ["students", year, faculty_slug, level, folder_id],
        ...withInitialData<GetStudentsResponse>(),
    });

    const filteredStudents = useMemo(() => {
        const students = data?.students ?? [];
        const term = q.trim().toLowerCase();
        if (!term) return students;
        return students.filter(
            (s) =>
                s.name.toLowerCase().includes(term) ||
                String(s.id).toLowerCase().includes(term),
        );
    }, [data?.students, q]);

    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PER_PAGE;
    const pageStudents = filteredStudents.slice(start, start + PER_PAGE);

    const basePath = "/contracts/scandocuments";
    const programLabel = data?.study_level.name ?? "";

    return (
        <PageShell>
            <Crumbs
                items={[
                    { label: "Scan Documents", to: basePath },
                    { label: year.replace("-", " – "), to: `${basePath}/${year}` },
                    { label: data?.faculty?.name ?? "", to: `${basePath}/${year}/${faculty_slug}` },
                    { label: data?.study_level?.name ?? "", to: `${basePath}/${year}/${faculty_slug}/${level}` },
                    { label: data?.folder?.name ?? "", to: `${basePath}/${year}/${faculty_slug}/${level}/${folder_id}` },
                ]}
            />
            <PageHeader
                title={`${data?.folder.name ?? ""} — Student Documents`}
                subtitle={`${data?.study_level.name} · ${data?.faculty.short}`}
                right={
                    <div className="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:justify-end sm:gap-1.5">
                        <ViewToggle list={list} onChange={setList} id="students-view" />
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
                                aria-label="Search students"
                            />
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <Button
                                type="button"
                                size="sm"
                                className="gap-1"
                                onClick={() => setIsImportUsersDialogOpen(true)}
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
                {pageStudents.length === 0 ? (
                    <div className="glass-card rounded-2xl py-10 text-center text-muted-foreground">
                        No students match your search.
                    </div>
                ) : list ? (
                    <StudentsListView students={pageStudents} programLabel={programLabel} />
                ) : (
                    <StudentsGridView students={pageStudents} programLabel={programLabel} />
                )}

                <PaginationBar
                    page={safePage}
                    setPage={setPage}
                    totalPages={totalPages}
                    total={filteredStudents.length}
                    start={start}
                    perPage={PER_PAGE}
                    label="students"
                />
            </ContentLoader>
            <ImportUsersDialog />
        </PageShell>
    );
};

function StudentsGridView({
    students,
    programLabel,
}: {
    students: Student[];
    programLabel: string;
}) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {students.map((s) => (
                <Link
                    key={s.id}
                    to={`${s.id}`}
                    className="glass-card glow-hover rounded-2xl p-5"
                    style={{
                        background: `radial-gradient(100% 60% at 50% 0%, ${s.color}22, transparent 70%), var(--card)`,
                    }}
                >
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div
                            className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                            style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}99)` }}
                        >
                            {s.initials}
                        </div>
                        <StudentStatus status={s.status} />
                    </div>
                    <h3 className="font-display mb-0.5 truncate text-base font-semibold">{s.name}</h3>
                    <p className="mb-3 font-mono text-xs text-muted-foreground">#{s.id}</p>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{programLabel}</Badge>
                        <Badge variant="outline">{s.docs} docs</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Scanned {s.scannedDate}</p>
                </Link>
            ))}
        </div>
    );
}

function StudentsListView({
    students,
    programLabel,
}: {
    students: Student[];
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
                    {students.map((s) => (
                        <TableRow key={s.id} className="transition-colors hover:bg-secondary/30">
                            <TableCell>
                                <div
                                    className="grid h-9 w-9 place-items-center rounded-full text-xs font-semibold text-white"
                                    style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}99)` }}
                                >
                                    {s.initials}
                                </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{s.id}</TableCell>
                            <TableCell className="font-medium">{s.name}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{programLabel}</Badge>
                            </TableCell>
                            <TableCell>{s.docs}</TableCell>
                            <TableCell>
                                <StudentStatus status={s.status} />
                            </TableCell>
                            <TableCell className="text-muted-foreground">{s.scannedDate}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button asChild size="sm" variant="ghost">
                                        <Link to={`${s.id}`}>
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

function StudentStatus({ status }: { status: "Verified" | "Pending Review" | "Missing Docs" }) {
    const map = {
        Verified: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
        "Pending Review": "border-amber-500/40 text-amber-400 bg-amber-500/10",
        "Missing Docs": "border-red-500/40 text-red-400 bg-red-500/10",
    } as const;
    return <Badge variant="outline" className={map[status]}>{status}</Badge>;
}

export default StudentsPage;
