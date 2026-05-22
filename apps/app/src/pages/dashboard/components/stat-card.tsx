// import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
// import { cn } from "@/lib/utils";
// import { TrendingDown, TrendingUp } from "lucide-react";

interface Analytics {
    messages: number;
    notifications: number;
    tasks: number;
    appointments: number;
}

interface StatCardsProps {
    analytics?: Analytics;
}

export default function StatCards({ analytics }: StatCardsProps) {
    const { t } = useTranslation();
    const data = [
        {
            name: t("Messages"),
            stat: analytics?.messages?.toString() || "0",
            url: "/messages"
        },
        {
            name: t("Notifications"),
            stat: analytics?.notifications?.toString() || "0",
            url: "/notifications"
        },
        {
            name: t("Tasks"),
            stat: analytics?.tasks?.toString() || "0",
            url: "/tasks"
        },
        {
            name: t("Appointments"),
            stat: analytics?.appointments?.toString() || "0",
            url: "/appointments"
        }
    ];

    return (
        <div className="flex w-full items-center justify-center">
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {data.map((item) => (
                    <Link to={item.url} key={item.name}>
                        <Card className="w-full p-6 py-4">
                            <CardContent className="p-0">
                                <div className="flex items-center justify-between">
                                    <dt className="text-muted-foreground text-sm font-medium">{t(item.name)}</dt>
                                </div>
                                <dd className="text-foreground mt-2 text-3xl font-semibold">{item.stat}</dd>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}