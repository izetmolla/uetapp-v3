import { Card, CardContent } from "@workspace/ui/components/card";
import Icon from "@workspace/ui/components/icon";

import { cn } from "@workspace/ui/lib/utils";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

interface AppCardProps {
    icon: string;
    title: string;
    description?: string;
    iconColor?: string;
    className?: string;
    url: string;
    is_external: boolean;
}

const AppCard = ({ icon: icon, title, description, iconColor = "hsl(var(--primary))", className, url }: AppCardProps) => {
    const { t } = useTranslation();
    return (
        <Link to={url}>
            <Card className={cn(
                "group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border-border bg-card p-0",
                className
            )}>
                <CardContent className="p-3 flex items-center gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconColor }}>
                            <Icon name={icon} className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {t(title)}
                        </h3>
                        {description && (
                            <p className="text-xs text-muted-foreground truncate">
                                {t(description)}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default AppCard;