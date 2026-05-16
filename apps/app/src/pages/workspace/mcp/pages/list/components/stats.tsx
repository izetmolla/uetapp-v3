import CountAnimation from "@workspace/flowtrove/components/count-animation";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import type { FC } from "react";

interface StatsProps {
    statistics: {
        total_tokens: number;
        total_calls: number;
        total_failed_calls: number;
        total_success_calls: number;
    }
}
const Stats: FC<StatsProps> = ({ statistics }) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader>
                    <CardTitle>Developer Plan</CardTitle>
                    <CardAction>
                        <Button variant="outline" size="sm" className="-mt-3">
                            Upgrade Plan
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Progress value={statistics.total_tokens / statistics.total_calls * 100} />
                    <div className="text-muted-foreground text-sm">You used 0 of unlimited of your API</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardDescription>Successful Calls</CardDescription>
                    <CardAction>
                        <Badge className="border border-green-400 bg-green-50 text-green-800 [a&]:hover:bg-green-500/90 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/40 dark:bg-green-900/70 dark:text-white/80">0%</Badge>
                    </CardAction>
                    <div className="font-display text-3xl">
                        <CountAnimation number={statistics.total_success_calls} />
                    </div>
                    <div className="text-muted-foreground text-sm">Less than last month</div>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardDescription>Failed Calls</CardDescription>
                    <CardAction>
                        <Badge variant="destructive">0%</Badge>
                    </CardAction>
                    <div className="font-display text-3xl">
                        <CountAnimation number={statistics.total_failed_calls} />
                    </div>
                    <div className="text-muted-foreground text-sm">More than last month</div>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardDescription>Total Calls</CardDescription>
                    <CardAction>
                        <Badge className="border border-green-400 bg-green-50 text-green-800 [a&]:hover:bg-green-500/90 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/40 dark:bg-green-900/70 dark:text-white/80">0%</Badge>
                    </CardAction>
                    <div className="font-display text-3xl">
                        <CountAnimation number={statistics.total_calls} />
                    </div>
                    <div className="text-muted-foreground text-sm">More than last month</div>
                </CardHeader>
            </Card>
        </div>
    )
}

export default Stats;