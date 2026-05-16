import { cn } from "@workspace/ui/lib/utils";

import type { FC } from "react";

interface StatusDotProps {
    status: "active" | "inactive";
}
const StatusDot: FC<StatusDotProps> = ({ status }) => {
    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
                className={cn(
                    "w-2 h-2 rounded-full",
                    status === "active" ? "bg-green-500" : "bg-muted-foreground/40",
                )}
            />
            {status === "active" ? "Active" : "Inactive"}
        </span>
    );
}


export default StatusDot;