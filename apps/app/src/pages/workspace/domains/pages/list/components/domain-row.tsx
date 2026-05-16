import { cn } from "@workspace/ui/lib/utils";
import type { FC } from "react";
import type { Domain } from "../api";
import { Link } from "react-router";
import { Globe } from "lucide-react";
import StatusDot from "./status-dot";
import DomainRowActions from "./domain-row-actions";
import { Switch } from "@workspace/ui/components/switch";


interface DomainRowProps {
    domain: Domain;
    isChild?: boolean;
    isLastChild?: boolean;
    /** True when this row follows a group whose last row has no bottom border (separator on this row). */
    showTopBorder?: boolean;
    onToggle: (id: string) => void;
}


const DomainRow: FC<DomainRowProps> = ({ domain, isChild, isLastChild, showTopBorder, onToggle }) => {
    return (
        <div className={cn("relative", isChild && "ml-6")}>
            {isChild && (
                <span
                    aria-hidden
                    className={cn(
                        "absolute left-0 top-0 w-4 border-l-2 border-dashed border-muted",
                        isLastChild ? "h-1/2 border-b-2 rounded-bl-md" : "h-full",
                    )}
                />
            )}
            <div
                className={cn(
                    "group flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/50",
                    isChild && "pl-6",
                    showTopBorder && "border-t border-border",
                    !(isChild && isLastChild) && "border-b border-border",
                )}
            >
                <Globe className="h-4 w-4 text-muted-foreground shrink-0 cursor-pointer" onClick={() => window.open(`https://${domain.domain}`, "_blank")} />
                <Link
                    to={`${domain.id}`}
                    state={{ domain }}
                    className="font-mono text-sm hover:underline truncate"
                >
                    {domain.domain}
                </Link>
                <StatusDot status={domain.status} />
                <span className="text-xs text-muted-foreground capitalize">{domain.type}</span>
                <div className="ml-auto flex items-center gap-2">
                    <Switch
                        checked={domain.status === "active"}
                        onCheckedChange={() => onToggle(domain.id)}
                        aria-label="Toggle domain"
                    />
                    <DomainRowActions domain={domain} />
                </div>
            </div>
        </div>
    );
}


export default DomainRow;