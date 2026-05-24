import { useState } from "react";
import { ArrowRight } from "lucide-react";
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
    const [list, setList] = useState(true);

    const { data, isLoading, error } = useQuery({
        queryFn: () => getFaculties({ year }),
        queryKey: ["faculties", year],
        ...withInitialData<GetFacultiesResponse>(),
    });

    const faculties = data?.faculties ?? [];
    const yearLabel = year.replace("-", " – ");

    return (
        <PageShell>
            <ContentLoader
                isLoading={isLoading}
                error={withError(error, data)}
                forMeta
                customLoader={list ? <TableSkeleton /> : <GridSkeleton />}
                header={
                    <>
                        <Crumbs
                            items={[
                                { label: "Documents", to: "/contracts/scandocuments" },
                                { label: yearLabel },
                            ]}
                        />
                        <PageHeader
                            title={`${t("Faculties")} — [${yearLabel}]`}
                            subtitle={t("Select a faculty to browse its study levels")}
                            right={<ViewToggle list={list} onChange={setList} id="faculties-view" />}
                        />
                    </>
                }
            >
                {list ? (
                    <ListView year={year} faculties={faculties} />
                ) : (
                    <GridView faculties={faculties} />
                )}
            </ContentLoader>
        </PageShell>
    );
};

export default FacultiesPage;

function GridView({ faculties }: { faculties: Faculty[] }) {
    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {faculties.map((f) => (
                <Link
                    key={f.slug}
                    to={f.slug}
                    className="glass-card glow-hover relative overflow-hidden rounded-2xl border-l-4 p-6"
                    style={{ borderLeftColor: f.accent }}
                >
                    <div
                        className="mb-4 grid h-12 w-12 place-items-center rounded-xl"
                        style={{ backgroundColor: `${f?.accent}22`, color: f?.accent }}
                    >
                        <Icon name={f.icon} className="h-6 w-6" />
                    </div>
                    <h3 className="font-display mb-1 text-lg leading-snug font-semibold">
                        <Link to={f.slug}>
                            {f?.name}
                        </Link>
                    </h3>
                    <p className="mb-4 text-xs text-muted-foreground">{f?.short}</p>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{f?.students} students</Badge>
                        <Badge variant="outline">{f?.folders} folders</Badge>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function ListView({ year, faculties }: { year: string; faculties: Faculty[] }) {
    return (
        <div className="glass-card overflow-hidden rounded-2xl">
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
                    {faculties.map((f, i) => (
                        <TableRow key={f.slug} className={i % 2 ? "bg-secondary/20" : ""}>
                            <TableCell>
                                <div
                                    className="grid h-9 w-9 place-items-center rounded-lg"
                                    style={{ backgroundColor: `${f.accent}22`, color: f.accent }}
                                >
                                    <Icon name={f.icon} className="h-4 w-4" />
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">
                                <Link to={`/contracts/scandocuments/${year}/${f.slug}`}>
                                    {f.name}
                                </Link>
                            </TableCell>
                            <TableCell>{f.students}</TableCell>
                            <TableCell>{f.folders}</TableCell>
                            <TableCell>{f.completion}%</TableCell>
                            <TableCell className="text-right">
                                <Button asChild size="sm" variant="ghost">
                                    <Link to={`/contracts/scandocuments/${year}/${f.slug}`}>
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
