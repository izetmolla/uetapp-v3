"use client";

import { Briefcase, Calendar, MapPin, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { generateAvatarFallback } from "@workspace/ui/lib/utils";
import { useProfileStore } from "../../store";

export function ProfileHeader() {
    const user = useProfileStore((state) => state.user);

    return (
        <div className="relative">
            <div className="relative aspect-[3/1] max-h-40 w-full overflow-hidden sm:aspect-[4/1] md:max-h-44">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://img.magnific.com/free-photo/gradient-dark-blue-futuristic-digital-background_53876-160646.jpg?semt=ais_hybrid&w=740&q=80')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
                <div className="absolute end-3 top-3">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="bg-background/80 h-7 gap-1 text-xs shadow-sm backdrop-blur-sm"
                    >
                        <Pencil className="size-3" />
                        Edit cover
                    </Button>
                </div>
            </div>

            <div className="relative border-t bg-card px-4 pb-3 pt-1 sm:px-5 sm:pb-4">
                <div className="flex flex-col items-center gap-1.5 text-center sm:items-start sm:text-left">
                    <div className="relative -mt-12 sm:-mt-14">
                        <Avatar className="border-background size-20 border-[3px] shadow-md sm:size-24">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-base font-medium">
                                {generateAvatarFallback(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            type="button"
                            size="icon-sm"
                            variant="secondary"
                            className="border-background absolute end-0 bottom-0 size-7 rounded-full border-2 shadow-sm"
                            aria-label="Edit avatar"
                        >
                            <Pencil className="size-3" />
                        </Button>
                    </div>

                    <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{user.name}</h2>

                    <ul className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs sm:justify-start sm:text-sm">
                        <li className="flex items-center gap-1">
                            <Briefcase className="size-3.5 shrink-0 opacity-70" aria-hidden />
                            <span>{user.role}</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <MapPin className="size-3.5 shrink-0 opacity-70" aria-hidden />
                            <span>{user.location}</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <Calendar className="size-3.5 shrink-0 opacity-70" aria-hidden />
                            <span>Joined {user.joinedDate}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
