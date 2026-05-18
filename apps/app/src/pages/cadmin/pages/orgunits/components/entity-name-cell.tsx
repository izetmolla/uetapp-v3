import type { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { generateAvatarFallback } from "@workspace/ui/lib/utils";
import { cn } from "@workspace/ui/lib/utils";

interface EntityNameCellProps {
    name: string;
    description?: string | null;
    image?: string | null;
    subtitle?: string | null;
    className?: string;
}

/** Primary list cell: full name visible (wraps), optional subtitle; fills the table cell width. */
const EntityNameCell: FC<EntityNameCellProps> = ({
    name,
    description,
    image,
    subtitle,
    className,
}) => {
    const displayName = name?.trim() || "-";
    const secondary = subtitle ?? description;

    return (
        <div className={cn("flex w-full min-w-0 items-start gap-3", className)}>
            <Avatar className="size-9 shrink-0">
                <AvatarImage src={image ?? undefined} alt={displayName} />
                <AvatarFallback>{generateAvatarFallback(displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-semibold leading-snug break-words whitespace-normal">{displayName}</p>
                {secondary ? (
                    <p className="text-xs leading-snug text-muted-foreground break-words whitespace-normal line-clamp-2">
                        {secondary}
                    </p>
                ) : null}
            </div>
        </div>
    );
};

export default EntityNameCell;
