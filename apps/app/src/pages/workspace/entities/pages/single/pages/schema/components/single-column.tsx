import type { Column, DataType } from "@/pages/workspace/entities/types";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import Field from "./field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import ConstraintToggle from "./constraint-toggle";
import { DATA_TYPES } from "../api";
import { useDatabaseStore } from "../../store";



interface SingleColumnProps {
    isNew?: boolean;
    column: Column;
    onRemoveNewColumn?: () => void;
}

const SingleColumn: React.FC<SingleColumnProps> = ({
    isNew,
    column,
    onRemoveNewColumn,
}) => {
    const { selectedSchema, updateColumn, toggleSchemaSelection } = useDatabaseStore();
    const [open, setOpen] = useState(isNew ? true : false);
    const [tab, setTab] = useState<"name" | "type" | "constraints" | "default" | "generated">("name",);
    const checked = !!selectedSchema.columns[column.id];
    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <div
                className={cn(
                    "group flex min-h-11 items-stretch transition-colors",
                    checked && "bg-primary/5",
                )}
            >
                {isNew ? (
                    <div className="flex w-10 shrink-0 items-center justify-center border-r opacity-0 group-hover:opacity-100">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                                e.preventDefault();
                                setOpen(false);
                                onRemoveNewColumn?.();
                            }}
                            aria-label="Collapse column row"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div
                        className={cn(
                            "flex w-10 shrink-0 items-center justify-center border-r border-border/60 transition-opacity",
                            checked ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                        )}
                    >
                        <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleSchemaSelection("columns", column.id)}
                            aria-label="Select column"
                        />
                    </div>
                )}

                <CollapsibleTrigger className="flex flex-1 items-center gap-2 px-3 py-3 text-left font-mono text-sm">
                    <ChevronDown
                        className={cn(
                            "h-3.5 w-3.5 text-muted-foreground transition",
                            !open && "-rotate-90",
                        )}
                    />
                    <span className="text-foreground">{column.name}</span>
                    <span className="text-rose-400">{column.dataType}</span>
                    {column.primaryKey && <span className="text-rose-400">PRIMARY KEY</span>}
                    {column.notNull && !column.primaryKey && (
                        <span className="text-rose-400">NOT NULL</span>
                    )}
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
                <div className="flex border-t border-border bg-background/40">
                    <div className="w-[200px] border-r border-border py-2">
                        {(["name", "type", "constraints", "default", "generated"] as const).map(
                            (t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={cn(
                                        "w-full text-left px-4 py-2 text-sm capitalize transition",
                                        tab === t
                                            ? "bg-muted text-foreground"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    {t === "name"
                                        ? "Column name"
                                        : t === "type"
                                            ? "Data type"
                                            : t}
                                </button>
                            ),
                        )}
                    </div>
                    <div className="flex-1 p-4 space-y-3">
                        {tab === "name" && (
                            <Field label="Column name">
                                <Input
                                    value={column.name}
                                    onChange={(e) => updateColumn(column.id, { name: e.target.value })}
                                    className="font-mono w-[280px]"
                                />
                            </Field>
                        )}
                        {tab === "type" && (
                            <Field label="Data type">
                                <Select
                                    value={column.dataType}
                                    onValueChange={(v) =>
                                        updateColumn(column.id, { dataType: v as DataType })
                                    }
                                >
                                    <SelectTrigger className="font-mono w-[280px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DATA_TYPES.map((t) => (
                                            <SelectItem key={t} value={t} className="font-mono">
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                        {tab === "constraints" && (
                            <div className="space-y-2.5">
                                <ConstraintToggle
                                    label="Primary key"
                                    checked={!!column.primaryKey}
                                    onChange={(v) => updateColumn(column.id, { primaryKey: v })}
                                />
                                <ConstraintToggle
                                    label="Not null"
                                    checked={!!column.notNull}
                                    onChange={(v) => updateColumn(column.id, { notNull: v })}
                                />
                                <ConstraintToggle
                                    label="Unique"
                                    checked={!!column.unique}
                                    onChange={(v) => updateColumn(column.id, { unique: v })}
                                />
                            </div>
                        )}
                        {tab === "default" && (
                            <Field label="Default value">
                                <Input
                                    value={column.defaultValue ?? ""}
                                    onChange={(e) =>
                                        updateColumn(column.id, { defaultValue: e.target.value })
                                    }
                                    placeholder="e.g. now() or 'hello'"
                                    className="font-mono w-[280px]"
                                />
                            </Field>
                        )}
                        {tab === "generated" && (
                            <ConstraintToggle
                                label="Generated column"
                                checked={!!column.generated}
                                onChange={(v) => updateColumn(column.id, { generated: v })}
                            />
                        )}
                    </div>
                </div>
            </CollapsibleContent>

        </Collapsible>
    )
};

export default SingleColumn;
