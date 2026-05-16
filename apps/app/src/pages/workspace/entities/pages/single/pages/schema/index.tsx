// import { useQuery } from "@tanstack/react-query";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { useTranslation } from "react-i18next";
// import { useParams } from "react-router";
// import { getEntitySchema } from "./api";
// import { withError } from "@workspace/flowtrove/lib/network";


import { Lock, Unlock, Trash2 } from "lucide-react";
import {
    useDatabaseStore,
    totalSchemaSelected,
} from "../store";
import { Input } from "@workspace/ui/components/input";
import { Switch } from "@workspace/ui/components/switch";
import { Button } from "@workspace/ui/components/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { useParams } from "react-router";
import { EntityDetailSectionNav } from "../../components/entity-detail-section-nav";
import SingleColumn from "./components/single-column";
import Section from "./components/section";
import Field from "./components/field";
import CodeRow from "./components/code-row";
import Empty from "./components/empty";
import { getEntitySchema, type GetEntitySchemaResponse } from "./api";
import { withError, withInitialData } from "@workspace/flowtrove/lib/network";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";



const EntitiesSinglePageSchema = () => {
    const { t } = useTranslation();
    const { ws, entity_id } = useParams();
    const { isLoading, data, error } = useQuery({
        queryKey: ["entity", ws, entity_id, "schema"],
        queryFn: () => getEntitySchema({ ws, entity_id }),
        ...withInitialData<GetEntitySchemaResponse>(),
    });

    const {
        schema,
        rls,
        // columns,
        constraints,
        indexes,
        policies,
        setSchema,
        toggleRLS,
        addColumn,
        addConstraint,
        addIndex,
        addPolicy,
        deleteSelectedSchema,
        clearSchemaSelection,
    } = useDatabaseStore();
    const selectedTotal = useDatabaseStore(totalSchemaSelected);


    const columns = useMemo(() => data?.attributes || [], [data]);
    const entity = useMemo(() => data?.entity || null, [data]);

    return (
        <ContentLoader
            isLoading={isLoading}
            title={t("Entity schema")}
            description={
                entity_id
                    ? t("Define columns, constraints, and policies for this entity.")
                    : undefined
            }
            breadcrumb={[{ label: t("Entities"), to: `/workspace/${ws}/entities` }]}
            error={withError(error, data)}
            // rightComponent={rightComponent}
            showHeaderSeparator
        >
            <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                <div className="flex flex-col gap-2 border-b border-border bg-muted/30 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <EntityDetailSectionNav />
                    <p className="text-xs text-muted-foreground sm:text-right">
                        {t("Structure and access rules for this entity's backing table.")}
                    </p>
                </div>
                <div className="relative space-y-6 p-6">
                    {/* Top bar */}
                    <div className="flex flex-wrap items-end gap-3">
                        <Field label="Table name">
                            <Input
                            disabled
                                value={entity?.table_name || ""}
                                // onChange={(e) => setTableName(e.target.value)}
                                className="h-10 font-mono w-[220px]"
                            />
                        </Field>
                        <Field label="Schema">
                            <Select value={schema} onValueChange={setSchema}>
                                <SelectTrigger className="h-10 w-[140px] font-mono">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">public</SelectItem>
                                    <SelectItem value="auth">auth</SelectItem>
                                    <SelectItem value="storage">storage</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <div className="flex items-center gap-3 h-10 px-4 rounded-md border border-border">
                            {rls ? (
                                <Lock className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <Unlock className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">Row Level Security</span>
                            <Switch checked={rls} onCheckedChange={toggleRLS} />
                        </div>

                        {selectedTotal >= 1 && (
                            <div className="ml-auto flex items-center gap-2 h-10">
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {selectedTotal} selected
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSchemaSelection}
                                    className="h-9"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={deleteSelectedSchema}
                                    className="h-9 gap-1.5"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete {selectedTotal}
                                </Button>
                            </div>
                        )}
                    </div>
                    <Section title="Columns" action={{ label: "Add column", onClick: addColumn }}>
                        <div className="rounded-md border border-border bg-muted/30 divide-y divide-border">
                            {columns.map((col) => (
                                <SingleColumn key={col.id} column={col} />
                            ))}
                        </div>
                    </Section>

                    <Section
                        title="Constraints"
                        action={{ label: "Add constraint", onClick: addConstraint }}
                    >
                        <div className="rounded-md border border-border bg-muted/30 divide-y divide-border">
                            {constraints.map((c) => (
                                <CodeRow
                                    key={c.id}
                                    kind="constraints"
                                    id={c.id}
                                    text={
                                        <>
                                            <span className="text-rose-400">CONSTRAINT</span>{" "}
                                            <span className="text-foreground">{c.name}</span>{" "}
                                            <span className="text-muted-foreground">{c.definition}</span>
                                        </>
                                    }
                                />
                            ))}
                            {constraints.length === 0 && <Empty>No constraints.</Empty>}
                        </div>
                    </Section>

                    <Section title="Indexes" action={{ label: "Add index", onClick: addIndex }}>
                        <div className="rounded-md border border-border bg-muted/30 divide-y divide-border">
                            {indexes.map((idx) => (
                                <CodeRow
                                    key={idx.id}
                                    kind="indexes"
                                    id={idx.id}
                                    text={
                                        <>
                                            <span className="text-rose-400">
                                                {idx.unique ? "UNIQUE INDEX" : "INDEX"}
                                            </span>{" "}
                                            <span className="text-foreground">{idx.name}</span>{" "}
                                            <span className="text-muted-foreground">…</span>{" "}
                                            <span className="text-rose-400">USING</span> BTREE (
                                            {idx.columns.join(", ")})
                                        </>
                                    }
                                />
                            ))}
                            {indexes.length === 0 && <Empty>No indexes.</Empty>}
                        </div>
                    </Section>

                    <Section title="Policies" action={{ label: "Add policy", onClick: addPolicy }}>
                        <div className="rounded-md border border-border bg-muted/30 divide-y divide-border">
                            {policies.map((p) => (
                                <CodeRow
                                    key={p.id}
                                    kind="policies"
                                    id={p.id}
                                    text={
                                        <>
                                            <span className="text-rose-400">POLICY</span>{" "}
                                            <span className="text-foreground">{p.name}</span>{" "}
                                            <span className="text-muted-foreground">FOR</span>{" "}
                                            <span className="text-rose-400">{p.command}</span>{" "}
                                            <span className="text-muted-foreground">USING ({p.using})</span>
                                        </>
                                    }
                                />
                            ))}
                            {policies.length === 0 && <Empty>No policies. Enable RLS and add one.</Empty>}
                        </div>
                    </Section>
                </div>
            </div>
        </ContentLoader>
    );
}



export default EntitiesSinglePageSchema;