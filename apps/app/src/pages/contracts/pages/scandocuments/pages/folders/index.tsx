import { useMemo, useState } from "react";
import { Folder as FolderIcon, Eye, FolderOpen, Users, ScanLine, Clock } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@workspace/ui/components/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@workspace/ui/components/pagination";
import { formatDate } from "@workspace/flowtrove/components/data-table/lib/format";
import { Crumbs } from "../../components/crumbs";
import { PageHeader, PageShell } from "../../components/page-shell";
import { TableSkeleton } from "../../components/skeleton-page";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { withError, withInitialData } from "@workspace/flowtrove/lib/network";
import { getFolders, type GetFoldersResponse } from "./api";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import CreateNewFolderDialog from "./components/create-new-folder-dialog";
import useFoldersStore from "./store";

const PER_PAGE = 10;

const FoldersPage = () => {
  const { year = "", faculty_slug = "", level = "" } = useParams();
  const setIsCreateFolderDialogOpen = useFoldersStore((s) => s.setIsCreateFolderDialogOpen);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryFn: () => getFolders({ year, faculty_slug, level_slug: level }),
    queryKey: ["folders", year, faculty_slug, level],
    ...withInitialData<GetFoldersResponse>(),
  });

  const folders = data?.folders ?? [];
  const stats = data?.stats;

  const totalPages = Math.max(1, Math.ceil(folders.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const pageFolders = useMemo(
    () => folders.slice(start, start + PER_PAGE),
    [folders, start],
  );

  const basePath = "/contracts/scandocuments";

  const lastUpdatedLabel = useMemo(() => {
    const raw = stats?.last_updated;
    if (!raw) return "—";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return formatDate(date, "MMM dd, yyyy");
  }, [stats?.last_updated]);

  return (
    <PageShell>
      <Crumbs
        items={[
          { label: "Documents", to: basePath },
          { label: year.replace("-", " – "), to: `${basePath}/${year}` },
          { label: data?.faculty?.name ?? "", to: `${basePath}/${year}/${faculty_slug}` },
          { label: data?.study_level?.name ?? "", to: `${basePath}/${year}/${faculty_slug}/${level}` },
        ]}
      />
      <PageHeader
        title={`Folders — ${data?.study_level?.name ?? ""}`}
        subtitle={data?.faculty?.name ?? ""}
        right={
          <Button type="button" onClick={() => setIsCreateFolderDialogOpen(true)}>
            <FolderIcon className="mr-2 size-4" aria-hidden />
            New folder
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatBox
          icon={<FolderOpen className="w-4 h-4" />}
          label="Total Folders"
          value={isLoading ? "—" : (stats?.total_folders ?? 0)}
        />
        <StatBox
          icon={<Users className="w-4 h-4" />}
          label="Total Students"
          value={isLoading ? "—" : (stats?.total_students ?? 0).toLocaleString()}
        />
        <StatBox
          icon={<ScanLine className="w-4 h-4" />}
          label="Scanned %"
          value={isLoading ? "—" : `${stats?.scanned_percent ?? 0}%`}
        />
        <StatBox
          icon={<Clock className="w-4 h-4" />}
          label="Last Updated"
          value={isLoading ? "—" : lastUpdatedLabel}
        />
      </div>

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
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead>Folder Name</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Scanned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageFolders.map((f, i) => (
                <TableRow key={f.id} className="hover:bg-secondary/30 transition-colors">
                  <TableCell className="text-muted-foreground">{start + i + 1}</TableCell>
                  <TableCell>
                    <FolderIcon className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link to={`${f.id}`}>{f.name}</Link>
                  </TableCell>
                  <TableCell>{f.students}</TableCell>
                  <TableCell>
                    {f.scanned} / {f.students}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={f.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatFolderDate(f.last_modified)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="icon" variant="ghost">
                      <Link to={`${f.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>
            Showing {folders.length === 0 ? 0 : start + 1}–
            {Math.min(start + PER_PAGE, folders.length)} of {folders.length} folders
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
                        setPage(i + 1);
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
      </ContentLoader>
      <CreateNewFolderDialog />
    </PageShell>
  );
};

export default FoldersPage;

function formatFolderDate(raw: string | undefined): string {
  if (!raw) return "—";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return formatDate(date, "MMM dd, yyyy");
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        {icon} {label}
      </div>
      <div className="text-xl font-semibold font-display">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: "Complete" | "In Progress" | "Pending" }) {
  const map = {
    Complete: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    "In Progress": "border-amber-500/40 text-amber-400 bg-amber-500/10",
    Pending: "border-border text-muted-foreground bg-secondary/40",
  } as const;
  return (
    <Badge variant="outline" className={map[status]}>
      {status}
    </Badge>
  );
}
