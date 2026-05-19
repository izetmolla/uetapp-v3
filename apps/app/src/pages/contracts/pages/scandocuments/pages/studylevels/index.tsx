import { BookOpen, FlaskConical, Briefcase, Microscope, Award, Users, Clock } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { findFaculty, studyLevels } from "../../data/mockData";
import { Crumbs } from "../../components/crumbs";
import { PageHeader, PageShell } from "../../components/page-shell";
import { GridSkeleton, MaybeSkeleton, useSimulatedLoad } from "../../components/skeleton-page";
import { Link, useParams } from "react-router";


const iconMap = {
  book: BookOpen,
  flask: FlaskConical,
  briefcase: Briefcase,
  microscope: Microscope,
  award: Award,
};


const StudyLevelsPage = () => {
  const { year = "", facultySlug = "" } = useParams();
  console.log("year", year);
  console.log("facultySlug", facultySlug);
  const faculty = findFaculty(facultySlug);
  const loading = useSimulatedLoad();

  if (!faculty) return <div>Faculty not found</div>;

  const grouped = {
    Undergraduate: studyLevels.filter((l) => l.group === "Undergraduate"),
    Postgraduate: studyLevels.filter((l) => l.group === "Postgraduate"),
    Vocational: studyLevels.filter((l) => l.group === "Vocational"),
  };

  return (
    <PageShell>
      <Crumbs
        items={[
          { label: "Documents", to: "/documents" },
          { label: year.replace("-", " – "), to: `${year}` },
          { label: faculty.short },
        ]}
      />
      <PageHeader title="Study Levels" subtitle={faculty.name} />

      <MaybeSkeleton loading={loading} skeleton={<GridSkeleton count={5} />}>
        <div className="space-y-10">
          <Section title="Undergraduate Programs" items={grouped.Undergraduate} year={year} facultySlug={facultySlug} />
          <Section title="Postgraduate Programs" items={grouped.Postgraduate} year={year} facultySlug={facultySlug} />
          <Section title="Vocational Programs" items={grouped.Vocational} year={year} facultySlug={facultySlug} />
        </div>
      </MaybeSkeleton>
    </PageShell>
  );
}

function Section({
  title,
  items,
  year,
  facultySlug,
}: {
  title: string;
  items: typeof studyLevels;
  year: string;
  facultySlug: string;
}) {
  console.log("year", year);
  console.log("facultySlug", facultySlug);
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
          const Icon = iconMap[l.iconKey];
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
                <Icon className="w-7 h-7" />
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