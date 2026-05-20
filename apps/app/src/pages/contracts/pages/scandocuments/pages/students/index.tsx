
import { useMemo, useState } from "react";
import { Eye, Download, Search, Plus, Cog } from "lucide-react";
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
import { TableSkeleton } from "../../components/skeleton-page";
import { Link, useParams } from "react-router";
import { withError, withInitialData } from "@workspace/flowtrove/lib/network";
import { getStudents, type GetStudentsResponse } from "./api";
import { useQuery } from "@tanstack/react-query";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import AddStudentDialog from "./components/add-student-dialog";
import { useStudentListStore } from "./store";

const PER_PAGE = 10;

const StudentsPage = () => {
    const { year = "", faculty_slug = "", level = "", folder_id } = useParams();
    const setIsAddStudentDialogOpen = useStudentListStore((s) => s.setIsAddStudentDialogOpen);



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
                                onClick={() => setIsAddStudentDialogOpen(true)}
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
                customLoader={<TableSkeleton />}
            >
                <div className="glass-card rounded-2xl overflow-hidden">
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
                            {pageStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                        No students match your search.
                                    </TableCell>
                                </TableRow>
                            ) : pageStudents.map((s) => (
                                <TableRow key={s.id} className="hover:bg-secondary/30 transition-colors">
                                    <TableCell>
                                        <div
                                            className="w-9 h-9 rounded-full grid place-items-center text-xs font-semibold text-white"
                                            style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}99)` }}
                                        >
                                            {s.initials}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{s.id}</TableCell>
                                    <TableCell className="font-medium">{s.name}</TableCell>
                                    <TableCell><Badge variant="secondary">{data?.study_level.name ?? ""}</Badge></TableCell>
                                    <TableCell>{s.docs}</TableCell>
                                    <TableCell><StudentStatus status={s.status} /></TableCell>
                                    <TableCell className="text-muted-foreground">{s.scannedDate}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link to={`${s.id}`}><Button size="icon" variant="ghost"><Eye className="w-4 h-4" /></Button></Link>
                                            <Button size="icon" variant="ghost"><Download className="w-4 h-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                    <span>
                        Showing {filteredStudents.length === 0 ? 0 : start + 1}–{Math.min(start + PER_PAGE, filteredStudents.length)} of {filteredStudents.length} students
                    </span>
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink href="#" isActive={safePage === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </ContentLoader>
            <AddStudentDialog />
        </PageShell>
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