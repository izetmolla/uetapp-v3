import { useMemo, useState } from "react";
import { EntityCard } from "./components/EntityCard";
import { Button } from "@workspace/ui/components/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { Plus, LayoutGrid, List, Database } from "lucide-react";
import { useStore } from "./store";
import { Link, useSearchParams } from "react-router";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { useTranslation } from "react-i18next";
import { withInitialData, withError } from "@workspace/flowtrove/lib/network";
import { useQuery, type QueryKey } from "@tanstack/react-query";
import { type GetEntitiesResponse, getEntities } from "./api";
import SearchBox from "./components/search-box";
import AddNewEntityDialog from "./components/add-new-entity-dialog";
import DeleteEntityDialog from "./components/delete-entity-dialog";



const EntitiesPage = () => {
  const { t } = useTranslation();
  const {
    viewMode,
    setViewMode,
    isAddEntrypointDialogOpen,
    setIsAddEntrypointDialogOpen,
    isDeleteEntityModalOpen,
    setIsDeleteEntityModalOpen,
    setSelectedEntity,
  } = useStore();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const page = useMemo(() => searchParams.get("page") ? Number(searchParams.get("page")) : 1, [searchParams]);
  const limit = useMemo(() => searchParams.get("limit") ? Number(searchParams.get("limit")) : 10, [searchParams]);
  const queryKey: QueryKey = ["entities-list", page, limit, keyword];
  const { isLoading, data, error } = useQuery({
    queryKey,
    queryFn: () => getEntities({ page, limit, keyword }),
    ...withInitialData<GetEntitiesResponse>(),
  });








  const entities = useMemo(() => data?.entities.data || [], [data]);


  const rightComponent = useMemo(() => {
    return (
      <div className="flex items-center gap-2">
        <SearchBox keyword={keyword} onChange={setKeyword} />
        <Button onClick={() => setIsAddEntrypointDialogOpen(true)}><Plus className="mr-1 h-4 w-4" />New Entity</Button>
        <div className="flex overflow-hidden rounded-md border border-border">
          <Tooltip><TooltipTrigger asChild>
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-none" onClick={() => setViewMode("grid")}><LayoutGrid className="h-4 w-4" /></Button>
          </TooltipTrigger><TooltipContent>Grid view</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-none" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
          </TooltipTrigger><TooltipContent>List view</TooltipContent></Tooltip>
        </div>
      </div>
    );
  }, [keyword, viewMode, setViewMode]);

  return (
    <ContentLoader
      title={t("Data Entities")}
      description={t("Define your data models, attributes, and relationships")}
      breadcrumb={[{ label: t("Data Entities") }]}
      showHeaderSeparator
      isLoading={isLoading}
      error={withError(error, data)}
      rightComponent={rightComponent}
    >
      <TooltipProvider delayDuration={200}>
        <div className="mt-8">
          {entities.length === 0 ? (
            <EmptyState onCreate={() => setIsAddEntrypointDialogOpen(true)} />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {entities.map((e) => <EntityCard key={e.id} entity={e} />)}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {entities.map((e, i) => (
                <Link key={e.id} to={`/workspace/entities/${e.id}`}
                  className={`flex items-center gap-4 px-5 py-4 transition hover:bg-secondary/40 ${i > 0 ? "border-t border-border" : ""}`}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md font-mono text-sm font-bold text-white" style={{ backgroundColor: e.color }}>{e.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-medium">{e.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{e.description || "No description"}</div>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">{e.attributes.length} attrs</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </TooltipProvider>
      <AddNewEntityDialog
        isOpen={isAddEntrypointDialogOpen}
        onClose={() => setIsAddEntrypointDialogOpen(false)}
        queryKey={queryKey}
      />
      <DeleteEntityDialog
        isOpen={isDeleteEntityModalOpen}
        onClose={() => {
          setIsDeleteEntityModalOpen(false);
          setSelectedEntity(null);
        }}
      />
    </ContentLoader>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-20 text-center">
      <div className="relative mb-4">
        <Database className="h-16 w-16 text-muted-foreground" />
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" />
        </div>
      </div>
      <h2 className="text-xl font-semibold">No entities yet</h2>
      <p className="mt-1 text-sm text-muted-foreground">Start by creating your first data entity</p>
      <Button className="mt-6" onClick={onCreate}><Plus className="mr-1 h-4 w-4" />Create Entity</Button>
    </div>
  );
}




export default EntitiesPage;