import { Button } from "@workspace/ui/components/button"
import { ArrowRight } from "lucide-react"
import { type FC } from "react";
import AppCard from "./appcard";
import { useTranslation } from "react-i18next";


interface AppsProps {
    apps: Array<{
        icon: string;
        title: string;
        description?: string;
        color: string;
        url: string;
        is_external: boolean;
    }>;
}
const Apps: FC<AppsProps> = ({ apps }) => {
    const { t } = useTranslation();

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">{t("Apps")}</h2>
                <Button variant="link" className="text-primary">
                    {t("All apps")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                {apps.map((app) => (
                    <AppCard
                        key={app.title}
                        icon={app.icon}
                        title={app.title}
                        description={app.description}
                        iconColor={app.color}
                        url={app.url}
                        is_external={app.is_external}
                    />
                ))}
            </div>
        </div>
    )
}

export default Apps