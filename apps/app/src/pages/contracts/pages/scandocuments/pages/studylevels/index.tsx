import { Users, Clock } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Crumbs } from "../../components/crumbs";
import { PageHeader, PageShell } from "../../components/page-shell";
import { GridSkeleton } from "../../components/skeleton-page";
import { Link, useParams } from "react-router";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { useQuery } from "@tanstack/react-query";
import { withError, withInitialData } from "@workspace/flowtrove/lib/network";
import { getStudyLevels, type GetStudyLevelsResponse, type StudyLevel } from "./api";
import { useMemo } from "react";
import Icon from "@workspace/ui/components/icon";




const StudyLevelsPage = () => {
  const { year = "", faculty_slug = "" } = useParams();

  // if (!faculty) return <div>Faculty not found</div>;
  const queryKey = ["studyLevels", year, faculty_slug];
  // const grouped = {
  //   Undergraduate: studyLevels.filter((l) => l.group === "Undergraduate"),
  //   Postgraduate: studyLevels.filter((l) => l.group === "Postgraduate"),
  //   Vocational: studyLevels.filter((l) => l.group === "Vocational"),
  // };


  const { data, isLoading, error } = useQuery({
    queryFn: () => getStudyLevels({ year, faculty_slug }),
    queryKey: queryKey,
    ...withInitialData<GetStudyLevelsResponse>(),
  });


  const grouped = useMemo(() => {
    const g: { group: string; items: StudyLevel[] }[] = [];
    data?.study_levels.forEach((l) => {
      const group = g.find((g) => g.group === l.group);
      if (group) {
        group.items.push(l);
      } else {
        g.push({ group: l.group, items: [l] });
      }
    });
    return g as { group: string; items: StudyLevel[] }[];
  }, [data?.study_levels]) as { group: string; items: StudyLevel[] }[];
 
  

  const basePath = "/contracts/scandocuments";
  return (
    <PageShell>
      <Crumbs
        items={[
          { label: "Documents", to: basePath },
          { label: year.replace("-", " – "), to: `${basePath}/${year}` },
          { label: data?.faculty?.name ?? "", to: `${basePath}/${year}/${faculty_slug}` },
        ]}
      />
      <PageHeader title="Study Levels" subtitle={data?.faculty?.name ?? ""} />

      <ContentLoader
        isLoading={isLoading}
        error={withError(error, data)}
        forMeta
        customLoader={<GridSkeleton count={5} />}
      >

        <div className="space-y-10">
          {grouped?.map((l) => (
            <Section key={l.group} title={l.group} items={l.items} year={year} faculty_slug={faculty_slug} />
          ))}
        </div>
      </ContentLoader>
    </PageShell>
  );
}

function Section({
  title,
  items,
  year,
  faculty_slug,
}: {
  title: string;
  items: StudyLevel[];
  year: string;
  faculty_slug: string;
}) {
  console.log("year", year);
  console.log("faculty_slug", faculty_slug);
  return (
    <section>
      <div className="flex items-center gap-4 mb-4">
        <h2 className="font-display text-sm uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((l) => {
          return (
            <Link
              key={l.slug}
              to={`${l.slug}`}
              className="glass-card glow-hover rounded-2xl p-6 text-center"
              style={{
                background: `radial-gradient(100% 60% at 50% 0%, ${l.accent}1a, transparent 70%), var(--card)`,
              }}
            >
              <div
                className="w-16 h-16 mx-auto grid place-items-center rounded-full mb-4 ring-1"
                style={{
                  backgroundColor: `${l.accent}22`,
                  color: l.accent,
                  borderColor: `${l.accent}55`,
                }}
              >
                <Icon name={l.icon} className="w-7 h-7"/>
              </div>
              <h3 className="font-display text-lg font-semibold">{l.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">{l.description}</p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" /> {l.duration}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Users className="w-3 h-3" /> {l.students}
                </Badge>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default StudyLevelsPage;