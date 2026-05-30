import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import ContentLoader, { type BreadcrumbItem } from "@workspace/flowtrove/components/content-loader";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getResourceDetail } from "./api";
import { BaseService, withError } from "@workspace/flowtrove/lib/network";
import { LayoutBuilder, type LayoutBuilderItem } from "@workspace/flowtrove/components/layout/builder";


const breadcrumb: BreadcrumbItem[] = [
    { label: "Admin", to: "/admin" },
    { label: "Resources", to: "/admin/resources" },
];

const SingleResourcePage = () => {
    const { t } = useTranslation("admin");
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, error } = useQuery({
        queryKey: ["resource", id],
        queryFn: () => getResourceDetail(id ?? ""),
    });

    const layoutItems = useMemo((): LayoutBuilderItem[] => {
        const fromApi = data?.resource?.config_form;
        if (Array.isArray(fromApi) && fromApi.length > 0) {
            return fromApi as LayoutBuilderItem[];
        }
        return [];
    }, [data?.resource?.config_form]);

    const layoutData = useMemo(
        () => ({
            config: {
                id: id ?? "",
                ...((data?.resource?.config ?? {}) as Record<string, unknown>),
            },
        }),
        [data?.resource?.config, id],
    );

    return (
        <ContentLoader
            isLoading={isLoading}
            error={withError(error, data)}
            breadcrumb={[...breadcrumb, { label: id ?? t("Resource") }]}
            title={t("Resource")}
            showHeaderSeparator
            rightComponent={
                <Button variant="outline" asChild>
                    <Link to="/cadmin/resources">
                        <ArrowLeft className="size-4" />
                        {t("Back to list")}
                    </Link>
                </Button>
            }
        >
            <LayoutBuilder items={layoutItems} data={layoutData} axios={BaseService} />
        </ContentLoader>
    );
};

export default SingleResourcePage;
