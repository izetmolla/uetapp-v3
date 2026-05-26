import { lazy, Suspense, useState } from "react";
import { ArrowRight, FolderIcon, Layers } from "lucide-react";
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
import {
  getStudyLevels,
  type GetStudyLevelsResponse,
  type StudyLevel,
  type StudyLevelGroup,
} from "./api";
import Icon from "@workspace/ui/components/icon";
import useStudyLevelGroupStore from "./store";
import GroupRowAction from "./components/group-row-action";

const EditStudyLevelGroupDialog = lazy(() => import("./components/edit-academic-group"));

function StudyLevelLinkChip({
  level,
  levelId,
  groupId,
}: {
  level: StudyLevel;
  levelId: number;
  groupId: number;
}) {
  const chipClass =
    "inline-flex max-w-full items-center gap-2 rounded-lg border border-border/80 bg-card px-2 py-1 text-sm shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5";
  const accentStyle = { borderLeftWidth: 3, borderLeftColor: level.accent };
  return (
    <Link
      to={`${groupId}?level_id=${levelId}`}
      className={`group/chip ${chipClass}`}
      style={accentStyle}
    >
      <span
        className="grid size-6 shrink-0 place-items-center rounded-md"
        style={{ backgroundColor: `${level.accent}22`, color: level.accent }}
      >
        <Icon name={level.icon} className="size-3.5" />
      </span>
      <span className="truncate font-medium text-foreground group-hover/chip:text-primary">
        {level.name}
      </span>
      <ArrowRight className="size-3 shrink-0 text-muted-foreground/70 group-hover/chip:text-primary" />
    </Link>
  );
}

const StudyLevelsPage = () => {
  const { setStudyLevelGroup, setIsEditStudyLevelGroupDialogOpen } = useStudyLevelGroupStore();
  const { year = "", faculty_slug = "" } = useParams();
  const [list, setList] = useState(true);
  const queryKey = ["studyLevels", year, faculty_slug];

  const { data, isLoading, error } = useQuery({
    queryFn: () => getStudyLevels({ year, faculty_slug }),
    queryKey: queryKey,
    ...withInitialData<GetStudyLevelsResponse>(),
  });

  const studyLevels = data?.study_levels ?? [];
  const studyLevelGroups = data?.study_level_groups ?? [];

  const basePath = "/contracts/scandocuments";
  const yearLabel = year.replace("-", " – ");

  const errorMessage = withError(error, data);

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
        title="Study level groups"
        subtitle={data?.faculty?.name ?? ""}
        right={
          <div className="flex items-center gap-3">
            <ViewToggle list={list} onChange={setList} id="study-levels-view" />
            <Button
              disabled={errorMessage != null}
              type="button"
              onClick={() => {
                setStudyLevelGroup(null);
                setIsEditStudyLevelGroupDialogOpen(true);
              }}
            >
              <FolderIcon className="mr-2 size-4" aria-hidden />
              New group
            </Button>
          </div>
        }
      />

      <ContentLoader
        isLoading={isLoading}
        error={errorMessage}
        forMeta
        customLoader={
          list ? (
            <TableSkeleton />
          ) : (
            <GridSkeleton count={Math.max(studyLevelGroups.length, 3)} />
          )
        }
      >
        {list ? (
          <GroupsListView groups={studyLevelGroups} />
        ) : (
          <GroupsGridView groups={studyLevelGroups} />
        )}
        <Suspense fallback={null}>
          <EditStudyLevelGroupDialog study_levels={studyLevels} queryKey={queryKey} />
        </Suspense>
      </ContentLoader>
    </PageShell>
  );
};

function GroupsEmptyState() {
  return (
    <div className="glass-card rounded-2xl border border-dashed px-6 py-16 text-center">
      <Layers className="mx-auto mb-3 size-10 text-muted-foreground/60" aria-hidden />
      <p className="font-medium">No study level groups yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a group to bundle study levels and open shared scan folders.
      </p>
    </div>
  );
}

function GroupsGridView({ groups }: { groups: StudyLevelGroup[] }) {
  if (groups.length === 0) {
    return <GroupsEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <article
          key={group.id}
          className="glass-card flex flex-col rounded-2xl border border-border/70 p-4 transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex items-start justify-between gap-2 border-b border-border/60 pb-3">
            <div className="min-w-0">
              <Link to={`${group.id}`} className="block min-w-0 rounded-md transition-colors hover:text-primary">
                <p className="text-sm font-medium text-foreground">{group.name}</p>
                <p className="text-[11px] text-muted-foreground">#{group.id}</p>
              </Link>
            </div>
            <GroupRowAction group={group} />
          </div>
          {group.study_levels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {group.study_levels.map((level) => (
                <StudyLevelLinkChip
                  levelId={level.id ?? 0}
                  key={`${group.id}-${level.id ?? 0}`}
                  level={level}
                  groupId={group.id}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No study levels linked</p>
          )}
          <div className="mt-3 pt-2">
            <Badge variant="secondary" className="text-[11px]">
              {group.study_levels.length} study level{group.study_levels.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </article>
      ))}
    </div>
  );
}

function GroupsListView({ groups }: { groups: StudyLevelGroup[] }) {
  if (groups.length === 0) {
    return <GroupsEmptyState />;
  }

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">#</TableHead>
            <TableHead className="w-44">Group</TableHead>
            <TableHead>Study levels</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group, index) => (
            <TableRow
              key={group.id}
              className="border-b border-border/70 align-middle last:border-b-0 hover:bg-secondary/20"
            >
              <TableCell className="py-2.5 text-muted-foreground">{index + 1}</TableCell>
              <TableCell className="py-2.5">
                <Link to={`${group.id}`} className="block min-w-0 rounded-md transition-colors hover:text-primary">
                  <p className="text-sm font-medium text-foreground">{group.name}</p>
                  <p className="text-[11px] text-muted-foreground">#{group.id}</p>
                </Link>
              </TableCell>
              <TableCell className="py-2.5">
                {group.study_levels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {group.study_levels.map((level) => (
                      <StudyLevelLinkChip
                        levelId={level.id ?? 0}
                        key={`${group.id}-${level.id ?? 0}`}
                        level={level}
                        groupId={group.id}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No study levels linked</span>
                )}
              </TableCell>
              <TableCell className="py-2.5 text-right">
                <GroupRowAction group={group} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default StudyLevelsPage;
