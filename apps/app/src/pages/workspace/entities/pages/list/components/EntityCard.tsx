import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu";
import { MoreHorizontal, ArrowRight, Copy, Trash2, Pencil } from "lucide-react";
import type { Entity, Relation } from "../types";
import { toast } from "sonner";
import { Link, useParams } from "react-router";
import { useStore } from "../store";

function RelationCounts({ entityId, relations }: { entityId: string; relations: Relation[] }) {
  const mine = relations?.filter((r) => r.fromEntityId === entityId || r.toEntityId === entityId);
  const counts = { "1:1": 0, "1:N": 0, "N:M": 0 } as Record<string, number>;
  mine?.forEach((r) => counts[r.type]++);
  const items: { label: string; arrow: string; count: number }[] = [
    { label: "1:1", arrow: "→", count: counts["1:1"] },
    { label: "1:N", arrow: "⇉", count: counts["1:N"] },
    { label: "N:M", arrow: "⇄", count: counts["N:M"] },
  ];
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {items.filter((i) => i.count > 0).map((i) => (
        <span key={i.label} className="flex items-center gap-1 font-mono">
          <span>{i.arrow}</span>
          <span>{i.label}</span>
          <span className="text-foreground">{i.count}</span>
        </span>
      ))}
      {items.every((i) => i.count === 0) && <span className="text-xs italic">No relations</span>}
    </div>
  );
}

export function EntityCard({
  entity,
  relations = [],
  duplicateEntity = () => {},
}: {
  entity: Entity;
  relations?: Relation[];
  duplicateEntity?: (id: string) => void;
}) {
  const { ws } = useParams();
  const { setSelectedEntity, setIsDeleteEntityModalOpen } = useStore();
  const visible = entity.attributes.slice(0, 4);
  const more = entity.attributes.length - visible.length;

  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg font-mono text-base font-bold text-white"
            style={{ backgroundColor: entity.color }}>
            {entity.name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <Link to={`/workspace/${ws}/entities/${entity.id}`}>
              <h3 className="truncate font-mono text-base font-semibold">{entity.name}</h3>
            </Link>
            <p className="truncate text-xs text-muted-foreground">{entity.attributes.length} attributes</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="#"> <Pencil className="mr-2 h-4 w-4" />Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { duplicateEntity(entity.id); toast.success("Entity duplicated"); }}>
              <Copy className="mr-2 h-4 w-4" />Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setSelectedEntity(entity);
                setIsDeleteEntityModalOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">
        {entity.description || "No description"}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {visible.map((a) => (
          <Badge key={a.id} variant="secondary" className="font-mono text-[11px] font-normal">
            {a.name}: <span className="ml-1 text-muted-foreground">{a.type}</span>
          </Badge>
        ))}
        {more > 0 && <Badge variant="outline" className="text-[11px]">+{more} more</Badge>}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <RelationCounts entityId={entity.id} relations={relations} />
        <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
          <Link to="#">Open <ArrowRight className="ml-1 h-3 w-3" /></Link>
        </Button>
      </div>
    </div>
  );
}
