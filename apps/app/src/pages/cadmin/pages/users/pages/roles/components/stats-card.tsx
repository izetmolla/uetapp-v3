"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ROLES_FETCH_PERSISTANT } from "../api";
import { getRolesStats } from "./stats-card/api";

const StatsCard = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: [ROLES_FETCH_PERSISTANT, "stats"],
        queryFn: () => getRolesStats().then((res) => res.data.stats),
        staleTime: 60_000,
    });

    const stats = data ?? [];

    return (
        <div className="flex w-full items-center justify-center mb-4">
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-4">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                          <Card key={i} className="py-0">
                              <CardContent className="space-y-4 p-6">
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-9 w-16" />
                                  <Skeleton className="h-3 w-full" />
                              </CardContent>
                          </Card>
                      ))
                    : stats.map((item) => (
                          <Card key={item.id} className="py-0">
                              <CardContent className="space-y-2 p-6">
                                  <span className="text-muted-foreground truncate text-sm">
                                      {item.name}
                                  </span>
                                  <dd className="text-foreground text-3xl font-semibold">
                                      {isError ? "—" : item.value.toLocaleString()}
                                  </dd>
                                  {item.description ? (
                                      <p className="text-muted-foreground text-xs leading-snug">
                                          {item.description}
                                      </p>
                                  ) : null}
                              </CardContent>
                          </Card>
                      ))}
            </div>
        </div>
    );
};

export default StatsCard;
