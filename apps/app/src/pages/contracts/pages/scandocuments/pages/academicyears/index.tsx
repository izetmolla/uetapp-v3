import { useState } from "react";
import {
  GraduationCap,
  Folder,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { PageHeader, PageShell } from "../../components/page-shell";
import { GridSkeleton, TableSkeleton } from "../../components/skeleton-page";
import { ViewToggle } from "../../components/view-toggle";
import { Link } from "react-router";
import { type AcademicYear, type GetAcademicYearsResponse, getAcademicYears } from "./api";
import { useQuery } from "@tanstack/react-query";
import { withError, withInitialData } from "@workspace/flowtrove/lib/network";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { useTranslation } from "react-i18next";

const AcademicYearsPage = () => {
  const { t } = useTranslation("contracts");
  const [list, setList] = useState(false);
  const [filter] = useState("");

  const { data, isLoading, error } = useQuery({
    queryFn: () => getAcademicYears({ filter }),
    queryKey: ["academic-years", filter],
    ...withInitialData<GetAcademicYearsResponse>(),
  });

  const years = data?.academic_years ?? [];

  return (
    <PageShell>
      <ContentLoader
        isLoading={isLoading}
        error={withError(error, data)}
        title={t("Academic Years")}
        breadcrumb={[{ label: "Contracts", to: "/contracts" }]}
        forMeta
        customLoader={list ? <TableSkeleton /> : <GridSkeleton />}
        header={
          <PageHeader
            title={t("Scanned Documents")}
            subtitle={t("Browse documents by academic year")}
            right={<ViewToggle list={list} onChange={setList} id="academic-years-view" />}
          />
        }
      >
        {list ? <ListView years={years} t={t} /> : <GridView years={years} t={t} />}
      </ContentLoader>
    </PageShell>
  );
};

function GridView({
  years,
  t,
}: {
  years: AcademicYear[];
  t: (key: string) => string;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {years.map((y) => (
        <Link
          key={y.id}
          to={y.year}
          className="glass-card glow-hover group relative overflow-hidden rounded-2xl p-6"
          style={{
            background: `radial-gradient(120% 80% at 50% -20%, ${y.accent}22, transparent 60%), var(--card)`,
          }}
        >
          <div className="mb-5 flex flex-col items-center text-center">
            <div
              className="mb-3 grid h-14 w-14 place-items-center rounded-2xl ring-1"
              style={{
                backgroundColor: `${y.accent}22`,
                color: y.accent,
                borderColor: `${y.accent}55`,
              }}
            >
              <GraduationCap className="h-7 w-7" />
            </div>
            <h3 className="font-display text-2xl font-semibold">{y.year}</h3>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3">
            <Stat icon={<Folder className="h-3.5 w-3.5" />} label={t("Folders")} value={y.folders} />
            <Stat icon={<Users className="h-3.5 w-3.5" />} label={t("Students")} value={y.students.toLocaleString()} />
            <Stat icon={<Building2 className="h-3.5 w-3.5" />} label={t("Faculties")} value={y.faculties} />
            <div className="rounded-lg bg-secondary/40 p-2.5">
              <div className="mb-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" /> {t("Completion")}
              </div>
              <Progress value={y.completion} className="h-1.5" />
              <div className="mt-1 text-xs font-medium">{y.completion}%</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <YearStatusBadge status={y.status} />
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
        </Link>
      ))}
    </div>
  );
}

function ListView({
  years,
  t,
}: {
  years: AcademicYear[];
  t: (key: string) => string;
}) {
  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>{t("Academic Years")}</TableHead>
            <TableHead>{t("Folders")}</TableHead>
            <TableHead>{t("Students")}</TableHead>
            <TableHead>{t("Faculties")}</TableHead>
            <TableHead>{t("Completion")}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {years.map((y, i) => (
            <TableRow key={y.id} className={i % 2 ? "bg-secondary/20" : ""}>
              <TableCell>
                <div
                  className="grid h-9 w-9 place-items-center rounded-lg"
                  style={{ backgroundColor: `${y.accent}22`, color: y.accent }}
                >
                  <GraduationCap className="h-4 w-4" />
                </div>
              </TableCell>
              <TableCell className="font-medium">{y.year}</TableCell>
              <TableCell>{y.folders}</TableCell>
              <TableCell>{y.students.toLocaleString()}</TableCell>
              <TableCell>{y.faculties}</TableCell>
              <TableCell>{y.completion}%</TableCell>
              <TableCell>
                <YearStatusBadge status={y.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="ghost">
                  <Link to={y.year}>
                    View <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-secondary/40 p-2.5">
      <div className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

function YearStatusBadge({ status }: { status: AcademicYear["status"] }) {
  return (
    <Badge
      variant="outline"
      className={
        status === "Active"
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-border text-muted-foreground"
      }
    >
      {status}
    </Badge>
  );
}

export default AcademicYearsPage;
