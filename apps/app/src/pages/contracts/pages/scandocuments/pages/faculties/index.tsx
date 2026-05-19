import { useState } from "react";
import {  ArrowRight } from "lucide-react";
import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@workspace/ui/components/table";
import { Crumbs } from "../../components/crumbs";
import { PageHeader, PageShell } from "../../components/page-shell";
import { GridSkeleton, TableSkeleton } from "../../components/skeleton-page";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { useQuery } from "@tanstack/react-query";
import { getFaculties, type GetFacultiesResponse } from "./api";
import { withError, withInitialData } from "@workspace/flowtrove/lib/network";
import type { Faculty } from "./api";
import Icon from "@workspace/ui/components/icon";





const FacultiesPage = () => {
    const { t } = useTranslation("contracts");
    const { year = "" } = useParams();
    const [list, setList] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryFn: () => getFaculties({ year }),
        queryKey: ["faculties", year],
        ...withInitialData<GetFacultiesResponse>(),
    });

    return (
        <PageShell>
            <ContentLoader
                isLoading={isLoading}
                error={withError(error, data)}
                forMeta
                customLoader={list ? <TableSkeleton /> : <GridSkeleton />}
                header={
                    <>
                        <Crumbs items={[{ label: "Documents", to: "/documents" }, { label: year.replace("-", " – ") }]} />
                        <PageHeader
                            title={`${t("Faculties")} — [${year.replace("-", " – ")}]`}
                            subtitle={t("Select a faculty to browse its study levels")}
                            right={
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="view" className="text-xs text-muted-foreground">
                                        {list ? t("List") : t("Grid")} {t("View")}
                                    </Label>
                                    <Switch id="view" checked={list} onCheckedChange={setList} />
                                </div>
                            }
                        />
                    </>
                }
            >
                {list ? <ListView year={year} faculties={data?.faculties || []} /> : <GridView year={year} faculties={data?.faculties || []} />}
            </ContentLoader>
        </PageShell>
    );
}


export default FacultiesPage
function GridView({ year, faculties }: { year: string, faculties: Faculty[] }) {
    console.log(year);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {faculties.map((f) => {
                return (
                    <Link
                        key={f.slug}
                        to={`${f.slug}`}
                        className="glass-card glow-hover rounded-2xl p-6 relative overflow-hidden border-l-4"
                        style={{ borderLeftColor: f.accent }}
                    >
                        <div
                            className="w-12 h-12 grid place-items-center rounded-xl mb-4"
                            style={{ backgroundColor: `${f.accent}22`, color: f.accent }}
                        >
                            <Icon name={f.icon} className="w-6 h-6" />
                        </div>
                        <h3 className="font-display text-lg font-semibold leading-snug mb-1">{f.name}</h3>
                        <p className="text-xs text-muted-foreground mb-4">{f.short}</p>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{f.students} students</Badge>
                            <Badge variant="outline">{f.folders} folders</Badge>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

function ListView({ year, faculties }: { year: string, faculties: Faculty[] }) {
    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Folders</TableHead>
                        <TableHead>Completion</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {faculties?.map((f, i) => {
                        return (
                            <TableRow key={f.slug} className={i % 2 ? "bg-secondary/20" : ""}>
                                <TableCell>
                                    <div
                                        className="w-9 h-9 grid place-items-center rounded-lg"
                                        style={{ backgroundColor: `${f.accent}22`, color: f.accent }}
                                    >
                                        <Icon name={f.icon} className="w-4 h-4" />
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{f.name}</TableCell>
                                <TableCell>{f.students}</TableCell>
                                <TableCell>{f.folders}</TableCell>
                                <TableCell>{f.completion}%</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild size="sm" variant="ghost">
                                        <Link to={`/documents/${year}/${f.slug}`}>
                                            View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}