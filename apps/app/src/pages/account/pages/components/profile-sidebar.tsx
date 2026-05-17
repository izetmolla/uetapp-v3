"use client";

import { Briefcase, FolderKanban, Mail, Phone, TrendingUp, Users } from "lucide-react";
import { Progress } from "@workspace/ui/components/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { useProfileStore } from "../../store";

export function ProfileSidebar() {
    const { user, profileCompletion } = useProfileStore();

    return (
        <aside className="space-y-5 lg:sticky lg:top-[calc(var(--header-height)+var(--account-nav-height,3.5rem)+1rem)] lg:self-start lg:pt-1">
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Profile completeness</CardTitle>
                    <CardDescription className="text-xs">
                        Complete your profile to improve visibility.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Progress value={profileCompletion} className="h-1.5" />
                    <p className="text-muted-foreground text-right text-xs tabular-nums">
                        {profileCompletion}%
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-sm">
                    <section className="space-y-3">
                        <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                            Identity
                        </p>
                        <ul className="space-y-2.5">
                            <li className="flex items-center gap-2.5">
                                <Users className="text-muted-foreground size-4 shrink-0" />
                                <span className="truncate">{user.name}</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Briefcase className="text-muted-foreground size-4 shrink-0" />
                                <span className="truncate">{user.department}</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <TrendingUp className="text-muted-foreground size-4 shrink-0" />
                                <span className="truncate">{user.role}</span>
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                            Contact
                        </p>
                        <ul className="space-y-2.5">
                            <li className="flex items-center gap-2.5">
                                <Mail className="text-muted-foreground size-4 shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Phone className="text-muted-foreground size-4 shrink-0" />
                                <span className="truncate">{user.phone}</span>
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                            Work
                        </p>
                        <ul className="space-y-2.5">
                            <li className="flex items-center gap-2.5">
                                <Users className="text-muted-foreground size-4 shrink-0" />
                                <span>{user.teams} teams</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <FolderKanban className="text-muted-foreground size-4 shrink-0" />
                                <span>{user.projects} active projects</span>
                            </li>
                        </ul>
                    </section>
                </CardContent>
            </Card>
        </aside>
    );
}
