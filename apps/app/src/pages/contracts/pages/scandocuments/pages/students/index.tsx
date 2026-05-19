
import { useMemo, useState } from "react";
import { Eye, Download, Search } from "lucide-react";
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
import { findFaculty, findLevel, generateStudents } from "../../data/mockData";
import { Crumbs } from "../../components/crumbs";
import { PageHeader, PageShell } from "../../components/page-shell";
import { MaybeSkeleton, TableSkeleton, useSimulatedLoad } from "../../components/skeleton-page";
import { Link, useParams } from "react-router";

const PER_PAGE = 10;

const StudentsPage = () => {
    const { year = "", facultySlug = "", level = "", folderId = "" } = useParams();
    const faculty = findFaculty(facultySlug);
    const lvl = findLevel(level);
    if (!faculty || !lvl) return <div>Faculty or level not found</div>;

    const loading = useSimulatedLoad();
    const folderName = `Folder ${folderId.split("-")[1] ?? "01"}`;
    const folderSeed = parseInt(folderId.split("-")[1] ?? "1", 10);
    const students = useMemo(
        () => generateStudents(30, year, level, folderSeed * 13),
        [year, level, folderSeed]
    );

    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);

    const filtered = students.filter(
        (s) =>
            s.name.toLowerCase().includes(q.toLowerCase()) ||
            s.id.toLowerCase().includes(q.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PER_PAGE;
    const rows = filtered.slice(start, start + PER_PAGE);

    return (
        <PageShell>
            <Crumbs
                items={[
                    { label: "Documents", to: "/documents" },
                    { label: year.replace("-", " – "), to: "/documents/$year" },
                    { label: faculty.short, to: "/documents/$year/$facultySlug" },
                    { label: lvl.name, to: "/documents/$year/$facultySlug/$level" },
                    { label: folderName },
                ]}
            />
            <PageHeader
                title={`${folderName} — Student Documents`}
                subtitle={`${lvl.name} · ${faculty.short}`}
                right={
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or ID…"
                            value={q}
                            onChange={(e) => { setQ(e.target.value); setPage(1); }}
                            className="pl-9 w-64"
                        />
                    </div>
                }
            />

            <MaybeSkeleton loading={loading} skeleton={<TableSkeleton />}>
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
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                        No students match your search.
                                    </TableCell>
                                </TableRow>
                            ) : rows.map((s) => (
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
                                    <TableCell><Badge variant="secondary">{lvl.name}</Badge></TableCell>
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
                        Showing {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + PER_PAGE, filtered.length)} of {filtered.length} students
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
            </MaybeSkeleton>
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