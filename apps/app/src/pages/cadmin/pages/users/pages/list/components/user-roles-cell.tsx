import type { FC } from "react";
import { Badge } from "@workspace/ui/components/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@workspace/ui/components/tooltip";

function roleLabel(grant: string): string {
    const colon = grant.indexOf(":");
    const name = colon === -1 ? grant : grant.slice(0, colon);
    if (!name) return grant;
    return name.charAt(0).toUpperCase() + name.slice(1);
}

interface UserRolesCellProps {
    roles?: string[] | null;
}

const UserRolesCell: FC<UserRolesCellProps> = ({ roles }) => {
    const grants = Array.isArray(roles) ? roles.filter(Boolean) : [];

    if (grants.length === 0) {
        return <span className="text-muted-foreground text-xs">—</span>;
    }

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex max-w-[280px] flex-wrap gap-1">
                {grants.map((grant) => (
                    <Tooltip key={grant}>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="secondary"
                                className="max-w-[8rem] truncate font-mono text-[10px] font-normal leading-none"
                            >
                                {roleLabel(grant)}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="font-mono text-xs">
                            {grant}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
};

export default UserRolesCell;
