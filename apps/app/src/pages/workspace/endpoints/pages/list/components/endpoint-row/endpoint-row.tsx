import { cn } from "@workspace/ui/lib/utils";
import { useCallback, useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import EndpointRowActions from "../endpoint-row-action";
import { Collapsible, CollapsibleContent } from "@workspace/ui/components/collapsible";
import { ENDPOINT_ROW_SHELL, TREE_DEPTH_INDENT } from "./constants";
import { GroupEndpointMainColumn, HttpMethodEndpointMainColumn } from "./endpoint-row-grids";
import {
    ChevronToFirstChildConnector,
    LastSiblingTreeElbow,
    SiblingTreeSpine,
} from "./tree-guides";
import type { EndpointRowProps } from "./types";
import { getEndpointRelativePath, isGroupEndpointOption } from "./utils";
import useEndpointsListStore from "../../store";
import { Button } from "@workspace/ui/components/button";

const EndpointRow: FC<EndpointRowProps> = ({
    endpoint,
    depth = 0,
    isChild,
    isFirstChild,
    isLastChild,
    showTopBorder,
}) => {
    const { t } = useTranslation();
    const {
        domain,
        setSelectedEndpoint,
        setAddEndpointPathDialogOpen,
    } = useEndpointsListStore();
    const childList = endpoint.children ?? [];
    const hasChildren = childList.length > 0;
    const isGroupLike = hasChildren || isGroupEndpointOption(endpoint.option);
    const [expanded, setExpanded] = useState(true);

    const displayPath = useMemo(() => getEndpointRelativePath(endpoint), [endpoint]);

    const openEndpointUrl = () => {
        const host = domain?.domain;
        if (host) window.open(`https://${host}/${endpoint.path.replace(/^\//, "")}`, "_blank");
    };

    const handleAddEndpoint = useCallback(() => {
        setSelectedEndpoint(endpoint);
        setAddEndpointPathDialogOpen(true);
    }, [endpoint, setAddEndpointPathDialogOpen, setSelectedEndpoint]);

    return (
        <div className={cn(depth > 0 && TREE_DEPTH_INDENT)}>
            <div className="relative">
                {isChild && !isLastChild ? <SiblingTreeSpine /> : null}
                <div className="relative">
                    {isChild && isLastChild ? <LastSiblingTreeElbow /> : null}
                    <div
                        className={cn(
                            ENDPOINT_ROW_SHELL,
                            showTopBorder && "border-t border-border",
                            !(isChild && isLastChild) && !hasChildren && "border-b border-border",
                        )}
                    >
                        {isGroupLike ? (
                            <button
                                type="button"
                                className={cn(
                                    "flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
                                    hasChildren && "cursor-pointer hover:bg-muted hover:text-foreground",
                                    !hasChildren && "cursor-default opacity-60",
                                )}
                                aria-expanded={hasChildren ? expanded : undefined}
                                aria-label={hasChildren ? (expanded ? "Collapse" : "Expand") : undefined}
                                disabled={!hasChildren}
                                onClick={() => hasChildren && setExpanded((v) => !v)}
                            >
                                {hasChildren ? (
                                    expanded ? (
                                        <ChevronDown className="size-3.5" strokeWidth={2} />
                                    ) : (
                                        <ChevronRight className="size-3.5" strokeWidth={2} />
                                    )
                                ) : (
                                    <ChevronRight className="size-3.5 opacity-70" strokeWidth={2} aria-hidden />
                                )}
                            </button>
                        ) : null}
                        {isGroupLike ? (
                            <GroupEndpointMainColumn endpoint={endpoint} displayPath={displayPath} />
                        ) : (
                            <HttpMethodEndpointMainColumn
                                endpoint={endpoint}
                                displayPath={displayPath}
                                onOpenUrl={openEndpointUrl}
                            />
                        )}
                        
                        {endpoint.option === "group" ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={t("Add Endpoint")}
                                className={cn(
                                    "shrink-0 text-muted-foreground",
                                    "transition-colors",
                                    "hover:bg-primary/10 hover:text-primary",
                                    "dark:hover:bg-primary/15",
                                )}
                                onClick={handleAddEndpoint}
                            >
                                <Plus className="size-3.5" strokeWidth={2} aria-hidden />
                            </Button>
                        ) : null}
                        <div className="ml-auto flex shrink-0 items-center gap-1">
                            <EndpointRowActions
                                endpoint={endpoint}
                                isFirstChild={isFirstChild}
                                isLastChild={isLastChild}
                                onOpenUrl={openEndpointUrl}
                            />
                        </div>
                    </div>
                    <ChevronToFirstChildConnector show={hasChildren && expanded} />
                </div>
                {hasChildren ? (
                    <Collapsible open={expanded} onOpenChange={setExpanded}>
                        <CollapsibleContent>
                            {childList.map((child, i) => {
                                const prev = i > 0 ? childList[i - 1] : undefined;
                                const childShowTopBorder =
                                    i === 0 || (i > 0 && (prev?.children?.length ?? 0) > 0);
                                return (
                                    <EndpointRow
                                        key={child.id}
                                        endpoint={child}
                                        depth={depth + 1}
                                        isChild
                                        isFirstChild={i === 0}
                                        isLastChild={i === childList.length - 1}
                                        showTopBorder={childShowTopBorder}
                                    />
                                );
                            })}
                        </CollapsibleContent>
                    </Collapsible>
                ) : null}
            </div>
        </div>
    );
};

export default EndpointRow;
