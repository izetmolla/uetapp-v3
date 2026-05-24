import { useMemo, useState } from "react";
import { Users, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Crumbs } from "../../components/crumbs";
import { PageHeader, PageShell } from "../../components/page-shell";
import { GridSkeleton, TableSkeleton } from "../../components/skeleton-page";
import { ViewToggle } from "../../components/view-toggle";
import { Link, useParams } from "react-router";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { useQuery } from "@tanstack/react-query";
import { withError, withInitialData } from "@workspace/flowtrove/lib/network";
import { getStudyLevels, type GetStudyLevelsResponse, type StudyLevel } from "./api";
import Icon from "@workspace/ui/components/icon";

const StudyLevelsPage = () => {
  const { year = "", faculty_slug = "" } = useParams();
  const [list, setList] = useState(true);

  const { data, isLoading, error } = useQuery({
    queryFn: () => getStudyLevels({ year, faculty_slug }),
    queryKey: ["studyLevels", year, faculty_slug],
    ...withInitialData<GetStudyLevelsResponse>(),
  });

  const grouped = useMemo(() => {
    const g: { group: string; items: StudyLevel[] }[] = [];
    data?.study_levels.forEach((l) => {
      const existing = g.find((entry) => entry.group === l.group);
      if (existing) {
        existing.items.push(l);
      } else {
        g.push({ group: l.group, items: [l] });
      }
    });
    return g;
  }, [data?.study_levels]);

  const studyLevels = data?.study_levels ?? [];
  const basePath = "/contracts/scandocuments";
  const yearLabel = year.replace("-", " – ");

  return (
    <PageShell>
      <Crumbs
        items={[
          { label: "Documents", to: basePath },
          { label: yearLabel, to: `${basePath}/${year}` },
          { label: data?.faculty?.name ?? "", to: `${basePath}/${year}/${faculty_slug}` },
        ]}
      />
      <PageHeader
        title="Study Levels"
        subtitle={data?.faculty?.name ?? ""}
        right={<ViewToggle list={list} onChange={setList} id="study-levels-view" />}
      />

      <ContentLoader
        isLoading={isLoading}
        error={withError(error, data)}
        forMeta
        customLoader={list ? <TableSkeleton /> : <GridSkeleton count={5} />}
      >
        {list ? (
          <ListView studyLevels={studyLevels} />
        ) : (
          <GridView grouped={grouped} />
        )}
      </ContentLoader>
    </PageShell>
  );
};

function GridView({ grouped }: { grouped: { group: string; items: StudyLevel[] }[] }) {
  return (
    <div className="space-y-10">
      {grouped.map((section) => (
        <section key={section.group}>
          <div className="mb-4 flex items-center gap-4">
            <h2 className="font-display text-sm uppercase tracking-[0.18em] text-muted-foreground">
              {section.group}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((l) => (
              <Link
                key={l.slug}
                to={l.slug}
                className="glass-card glow-hover rounded-2xl p-6 text-center"
                style={{
                  background: `radial-gradient(100% 60% at 50% 0%, ${l.accent}1a, transparent 70%), var(--card)`,
                }}
              >
                <div
                  className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full ring-1"
                  style={{
                    backgroundColor: `${l.accent}22`,
                    color: l.accent,
                    borderColor: `${l.accent}55`,
                  }}
                >
                  <Icon name={l.icon} className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-semibold">{l.name}</h3>
                <p className="mt-1 mb-3 text-xs text-muted-foreground">{l.description}</p>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" /> {l.duration}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" /> {l.students}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ListView({ studyLevels }: { studyLevels: StudyLevel[] }) {
  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Study Level</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Students</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studyLevels.map((l, i) => (
            <TableRow key={l.slug} className={i % 2 ? "bg-secondary/20" : ""}>
              <TableCell>
                <div
                  className="grid h-9 w-9 place-items-center rounded-lg"
                  style={{ backgroundColor: `${l.accent}22`, color: l.accent }}
                >
                  <Icon name={l.icon} className="h-4 w-4" />
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  <Link to={l.slug}>
                    {l.name}
                  </Link>
                </div>
                <div className="text-xs text-muted-foreground">{l.description}</div>
              </TableCell>
              <TableCell>{l.group}</TableCell>
              <TableCell>{l.duration}</TableCell>
              <TableCell>{l.students}</TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="ghost">
                  <Link to={l.slug}>
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

export default StudyLevelsPage;
