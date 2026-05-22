import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronDown } from "lucide-react";
import {
    Globe,
    BookOpen,
    Upload,
    Edit,
    Eye,
    UserCircle,
    type LucideIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export interface Activity {
    id: string;
    type: string;
    title: string;
    description: string;
    user: {
        name: string;
        avatar?: string;
    };
    timestamp: string;
    icon: string;
    iconColor: string;
    bgColor: string;
}

interface ActivitiesProps {
    activities: Activity[];
}

// Icon mapping from string to Lucide icon component
const iconMap: Record<string, LucideIcon> = {
    upload: Upload,
    eye: Eye,
    userCircle: UserCircle,
    bookOpen: BookOpen,
    edit: Edit,
    globe: Globe,
};

function ActivityItem({ activity }: { activity: Activity }) {
    const { t } = useTranslation();
    const Icon = iconMap[activity.icon] || Globe;

    return (
        <div className="flex items-start gap-3 px-4 py-2.5 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors group">
            <div className="flex-shrink-0 mt-0.5">
                <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", activity.bgColor)}>
                    <Icon className={cn("w-4 h-4", activity.iconColor)} />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {t(activity.title)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {t(activity.description)}
                        </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 font-medium">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 mt-1.5">
                    <Avatar className="w-4 h-4 border border-border">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary border-0">
                            {activity.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    {activity.user.name && (
                        <span className="text-xs text-muted-foreground font-medium">
                            {activity.user.name}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Activities({ activities }: ActivitiesProps) {
    const { t } = useTranslation();
    return (
        <Card className="pb-0">
            <CardHeader>
                <CardTitle className="text-base font-semibold">{t("Recent Activities")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 ">
                <div>
                    {activities.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                    ))}
                    {activities.length === 0 && (
                        <div className="flex items-center justify-center py-2.5 border-b border-border/40 h-40">
                            <p className="text-sm text-muted-foreground">{t("No activities found")}</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-center py-2.5 border-t border-border">
                    <Link to="/activities">
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-8">
                            {t("View more")}
                            <ChevronDown className="ml-2 h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}



