import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { useCallback, useMemo, useState, type FC } from "react";
import Search from "./components/search";
import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import StatusTabs from "./components/status-tabs";
import { getDomains, type Domain, type Filter, type GetDomainsResponse } from "./api";
import DomainRow from "./components/domain-row";
import { useTranslation } from "react-i18next";
import CustomPagination from "@workspace/ui/components/custom-pagination";
import { useSearchParams } from "react-router";
import { useQuery, type QueryKey } from "@tanstack/react-query";
import { withError, withInitialData } from "@workspace/flowtrove/lib/network";
import AddDomainModal from "./components/add-domain-dialog";
import DeleteDomainDialog from "./components/delete-domain-dialog";
import AddSubdomainDialog from "./components/add-subdomain-dialog";
import AddAliasDomainDialog from "./components/add-aliasdomain-dialog";
import MakeDomainPrimaryDialog from "./components/make-domain-primary-dialog";

interface DomainsListPageProps { }

type DomainGroup = {
    root: Domain;
    children: Domain[];
};

const FILTER_VALUES: readonly Filter[] = ["all", "active", "inactive", "aliases"];

const isFilter = (value: string): value is Filter => {
    return FILTER_VALUES.includes(value as Filter);
};



const DomainsListPage: FC<DomainsListPageProps> = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<Filter>("all");
    const page = useMemo(() => searchParams.get("page") ? Number(searchParams.get("page")) : 1, [searchParams]);
    const limit = useMemo(() => searchParams.get("limit") ? Number(searchParams.get("limit")) : 10, [searchParams]);
    const queryKey: QueryKey = ["domains-list", page, limit, query, filter];
    const { isLoading, data, error } = useQuery({
        queryKey,
        queryFn: () => getDomains({ page, limit , query}),
        ...withInitialData<GetDomainsResponse>(),
        enabled: true,
    });

    const domains = useMemo(() => data?.domains?.data ?? [], [data]);



    const handleToggleStatus = useCallback((id: string) => {
        console.log("toggle status", id);
    }, []);

    const handleFilterChange = useCallback((nextValue: string) => {
        if (isFilter(nextValue)) {
            setFilter(nextValue);
        }
    }, []);

    const filteredDomains = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return domains.filter((d) => {
            if (normalizedQuery && !d.domain.toLowerCase().includes(normalizedQuery)) return false;
            if (filter === "active") return d.status === "active";
            if (filter === "inactive") return d.status === "inactive";
            if (filter === "aliases") return d.type === "alias";
            return true;
        });
    }, [domains, query, filter]);

    const groupedDomains = useMemo<DomainGroup[]>(() => {
        const childrenByParentId = new Map<string, Domain[]>();

        for (const domain of filteredDomains) {
            if (!domain.parent_id) continue;
            const existingChildren = childrenByParentId.get(domain.parent_id);
            if (existingChildren) {
                existingChildren.push(domain);
            } else {
                childrenByParentId.set(domain.parent_id, [domain]);
            }
        }

        const trueRoots = filteredDomains.filter((domain) => domain.type === "domain");
        const orphanRoots = filteredDomains.filter((domain) => domain.type !== "domain" && !domain.parent_id);

        return [
            ...trueRoots.map((root) => ({
                root,
                children: childrenByParentId.get(root.id) ?? [],
            })),
            ...orphanRoots.map((root) => ({ root, children: [] })),
        ];
    }, [filteredDomains]);

    const rightComponent = useMemo(() => (
        <div className="ml-auto flex items-center gap-2">
            <Search query={query} setQuery={setQuery} />
            <Button onClick={() => setIsOpen(true)} className="h-9">
                <Plus className="h-4 w-4 mr-1.5" /> Add Domain
            </Button>
        </div>
    ), [query, setIsOpen]);

    return (
        <ContentLoader
            title={t("Domains Management")}
            breadcrumb={[{ label: t("Domains"), to: "/domains" }]}
            showHeaderSeparator
            isLoading={isLoading}
            error={withError(error, data)}
            rightComponent={rightComponent}
        >
            <div className="mx-auto w-full pb-10">
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b bg-muted/30 px-3 py-2.5">
                        <StatusTabs value={filter} onChange={handleFilterChange} />
                    </div>
                    {groupedDomains.length === 0 && (
                        <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                            {t("No domains found.")}
                        </div>
                    )}
                    {groupedDomains.map(({ root, children }, groupIndex) => {
                        const prevGroup = groupIndex > 0 ? groupedDomains[groupIndex - 1] : undefined;
                        const rootShowTopBorder =
                            groupIndex > 0 && (prevGroup?.children?.length ?? 0) > 0;
                        return (
                            <div key={root.id}>
                                <DomainRow
                                    domain={root}
                                    showTopBorder={rootShowTopBorder}
                                    onToggle={handleToggleStatus}
                                />
                                {children.map((c, i) => (
                                    <DomainRow
                                        key={c.id}
                                        domain={c}
                                        isChild
                                        isLastChild={i === children.length - 1}
                                        onToggle={handleToggleStatus}
                                    />
                                ))}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4">
                    <CustomPagination currentPage={page} totalPages={data?.domains?.pagination?.total_pages} />
                </div>
            </div>
            <AddDomainModal isOpen={isOpen} onClose={() => setIsOpen(false)} queryKey={queryKey} />
            <DeleteDomainDialog queryKey={queryKey} />
            <AddSubdomainDialog queryKey={queryKey} />
            <AddAliasDomainDialog queryKey={queryKey} />
            <MakeDomainPrimaryDialog queryKey={queryKey} />
        </ContentLoader>
    );
};

export default DomainsListPage;