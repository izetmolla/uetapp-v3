import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { useTranslation } from "react-i18next";
import { getEndpoints, type GetEndpointsResponse, ENDPOINTS_LIST_QUERY_PREFIX } from "./api";
import { withError, withInitialData } from "@workspace/flowtrove/lib/network";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import RightHeaderElement from "./components/right-header-element";
import { useCallback, useEffect, useMemo } from "react";
import EndpointRow from "./components/endpoint-row";
import DomainSelect from "./components/domain-select";
import AddEndpointGroupDialog from "./components/add-endpoint-group-dialog";
import useEndpointsListStore from "./store";
import DeleteEndpointDialog from "./components/delete-endpoint-dialog";
import AddEndpointPathDialog from "./components/add-endpoint-path-dialog";
import MoveEndpointDialog from "./components/move-endpoint-dialog";

const EndpointsListPage = () => {
    const { t } = useTranslation();
    const {
        setSelectedEndpoint,
        domain,
        setDomain,
        addEndpointGroupDialogOpen,
        setAddEndpointGroupDialogOpen,
        isDeleteEndpointModalOpen,
        setIsDeleteEndpointModalOpen,
        addEndpointPathDialogOpen,
        setAddEndpointPathDialogOpen,
        moveEndpointDialogOpen,
        setMoveEndpointDialogOpen,
        setDirection,
    } = useEndpointsListStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isLoading, data, error } = useQuery({
        queryKey: [...ENDPOINTS_LIST_QUERY_PREFIX, domain?.id],
        queryFn: () => getEndpoints({ keyword: searchParams.get("keyword"), domain_id: domain?.id }),
        ...withInitialData<GetEndpointsResponse>(),
        enabled: true,
    });

    const endpoints = useMemo(() => data?.endpoints?.data ?? [], [data]);
    const domains = useMemo(() => data?.domains?.map((domain) => ({
        id: domain?.id,
        domain: domain?.domain,
        primary: domain?.primary,
    })) ?? [], [data]);


    useEffect(() => {
        if (!domains.length) return;
        if (searchParams.get("domain_id") && domains.find((d) => d.id === searchParams.get("domain_id"))) {
            setDomain(domains.find((d) => d.id === searchParams.get("domain_id")) ?? null);
        } else {
            setDomain(domains.find((d) => d.primary) ?? domains[0] ?? null);
        }
    }, [domains, searchParams, setSearchParams]);




    const handleDomainChange = useCallback((domainId: string) => {
        setDomain(domains.find((d) => d.id === domainId) ?? null);
        setSearchParams({ domain_id: domainId });
    }, [domains]);


    const rightComponent = useMemo(() => (
        <RightHeaderElement
            keyword={searchParams.get("keyword") ?? ""}
            setKeyword={(keyword) => searchParams.set("keyword", keyword)}
            onAddEndpointPath={() => {
                setSelectedEndpoint(null);
                setAddEndpointPathDialogOpen(true);
            }}
            onAddEndpointGroup={() => {
                setSelectedEndpoint(null);
                setAddEndpointGroupDialogOpen(true);
            }}
        />
    ), [searchParams, setSearchParams, setAddEndpointGroupDialogOpen, setSelectedEndpoint]);
    return (
        <ContentLoader
            title={t("Endpoints List")}
            breadcrumb={[{ label: t("Endpoints"), to: "/endpoints" }]}
            showHeaderSeparator
            isLoading={isLoading}
            error={withError(error, data)}
            rightComponent={rightComponent}
        >
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="flex items-center gap-3 border-b bg-muted/30 px-3 py-2.5">
                    <div className="min-w-0 shrink-0 text-sm text-muted-foreground">

                    </div>
                    <div className="ml-auto w-full min-w-0 max-w-xs sm:max-w-sm max-w-[300px]">
                        <DomainSelect domains={domains} onDomainChange={handleDomainChange} activeDomain={domain} />
                    </div>
                </div>
                {endpoints.length === 0 && (
                    <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                        {t("No domains found.")}
                    </div>
                )}
                {endpoints.map((endpoint, i) => {
                    const prev = i > 0 ? endpoints[i - 1] : undefined;
                    const showTopBorder = i > 0 && (prev?.children?.length ?? 0) > 0;
                    return (
                        <EndpointRow
                            key={endpoint.id}
                            endpoint={endpoint}
                            showTopBorder={showTopBorder}
                            isFirstChild={i === 0}
                            isLastChild={i === endpoints.length - 1}
                        />
                    );
                })}
            </div>
            <AddEndpointGroupDialog
                isOpen={addEndpointGroupDialogOpen}
                onClose={() => {
                    setAddEndpointGroupDialogOpen(false);
                    setSelectedEndpoint(null);
                }}
                domain={domain}
            />
            <AddEndpointPathDialog
                isOpen={addEndpointPathDialogOpen}
                onClose={() => {
                    setAddEndpointPathDialogOpen(false);
                    setSelectedEndpoint(null);
                }}
                domain={domain}
            />
            <DeleteEndpointDialog
                isOpen={isDeleteEndpointModalOpen}
                onClose={() => {
                    setIsDeleteEndpointModalOpen(false);
                    setSelectedEndpoint(null);
                }}
            />
            <MoveEndpointDialog
                isOpen={moveEndpointDialogOpen}
                onClose={() => {
                    setMoveEndpointDialogOpen(false);
                    setDirection(null);
                    setSelectedEndpoint(null);
                }}
            />
        </ContentLoader>
    )
}

export default EndpointsListPage;