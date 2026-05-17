"use client";

import { cn } from "@workspace/ui/lib/utils";

import { Card, CardContent } from "@workspace/ui/components/card";

type StatsCardData = {
    name: string;
    value: string;
    change?: string;
    changeType?: "positive" | "negative";
    href: string;
}

const data: StatsCardData[] = [
    {
        name: "New Users",
        value: "100",
        // change: "+6.1%",
        // changeType: "positive",
        href: "#"
    },
    {
        name: "Active Users",
        value: "100",
        // change: "+6.1%",
        // changeType: "positive",
        href: "#"
    },
    {
        name: "Inactive Users",
        value: "100",
        // change: "+19.2%",
        // changeType: "positive",
        href: "#"
    },
    {
        name: "Total Users",
        value: "100",
        // change: "0.00",
        // changeType: "negative",
        href: "#"
    }
];


export interface StatsCardProps {

}

const StatsCard = () => {

    return (
        <div className="flex w-full items-center justify-center mb-4">
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-4">
                {data.map((item) => (
                    <Card key={item.name} className="py-0">
                        <CardContent className="space-y-4 p-6">
                            <div className="flex items-start justify-between space-x-2">
                                <span className="text-muted-foreground truncate text-sm">{item.name}</span>
                                {item?.change && <span
                                    className={cn(
                                        "text-sm font-medium",
                                        item.changeType === "positive"
                                            ? "text-emerald-700 dark:text-emerald-500"
                                            : "text-red-700 dark:text-red-500"
                                    )}>
                                    {item.change}
                                </span>}
                            </div>
                            <dd className="text-foreground mt-1 text-3xl font-semibold">{item.value}</dd>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}


export default StatsCard;