import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import ContentLoader, { type BreadcrumbItem } from "@workspace/flowtrove/components/content-loader";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";

const breadcrumb: BreadcrumbItem[] = [
    { label: "Admin", to: "/admin" },
    { label: "Resources", to: "/admin/resources" },
];

const SingleResourcePage = () => {
    const { t } = useTranslation("admin");
    const { id } = useParams<{ id: string }>();

    return (
        <ContentLoader
            breadcrumb={[...breadcrumb, { label: id ?? t("Resource") }]}
            title={t("Resource")}
            showHeaderSeparator
            rightComponent={
                <Button variant="outline" asChild>
                    <Link to="/admin/resources">
                        <ArrowLeft className="size-4" />
                        {t("Back to list")}
                    </Link>
                </Button>
            }
        >
            <p className="text-muted-foreground text-sm">
                {t("Resource detail view for ID {{id}} — coming soon.", { id: id ?? "" })}
            </p>
        </ContentLoader>
    );
};

export default SingleResourcePage;
