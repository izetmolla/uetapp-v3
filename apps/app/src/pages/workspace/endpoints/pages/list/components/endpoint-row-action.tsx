import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@workspace/ui/components/dropdown-menu";
import {
    Bot,
    ArrowDown,
    ArrowUp,
    ExternalLink,
    Layout,
    MoreHorizontal,
    Palette,
    Pencil,
    Plus,
    SettingsIcon,
    Trash2
} from "lucide-react";
import { useCallback, type FC } from "react";
import { useTranslation } from "react-i18next";
import type { Endpoint } from "../api";
import { Link } from "react-router";
import useEndpointsListStore from "../store";

interface EndpointRowActionsProps {
    endpoint: Endpoint;
    isLastChild?: boolean;
    isFirstChild?: boolean;
    onOpenUrl: () => void;
}
const EndpointRowActions: FC<EndpointRowActionsProps> = ({ endpoint, isLastChild, isFirstChild, onOpenUrl }) => {
    const { t } = useTranslation();
    const {
        setSelectedEndpoint,
        setAddEndpointGroupDialogOpen,
        setIsDeleteEndpointModalOpen,
        setAddEndpointPathDialogOpen,
        setMoveEndpointDialogOpen,
        setDirection,
    } = useEndpointsListStore();

    const handleAddEndpoint = useCallback(() => {
        setSelectedEndpoint(endpoint);
        setAddEndpointPathDialogOpen(true);
    }, [endpoint, setAddEndpointPathDialogOpen, setSelectedEndpoint]);

    const handleAddGroup = useCallback(() => {
        setSelectedEndpoint(endpoint);
        setAddEndpointGroupDialogOpen(true);
    }, [endpoint, setAddEndpointGroupDialogOpen, setSelectedEndpoint]);

    const handleDelete = useCallback(() => {
        setSelectedEndpoint(endpoint);
        setIsDeleteEndpointModalOpen(true);
    }, [endpoint, setIsDeleteEndpointModalOpen, setSelectedEndpoint]);

    const handleMoveUp = useCallback(() => {
        setSelectedEndpoint(endpoint);
        setDirection("up");
        setMoveEndpointDialogOpen(true);
    }, [endpoint, setDirection, setMoveEndpointDialogOpen, setSelectedEndpoint]);

    const handleMoveDown = useCallback(() => {
        setSelectedEndpoint(endpoint);
        setDirection("down");
        setMoveEndpointDialogOpen(true);
    }, [endpoint, setDirection, setMoveEndpointDialogOpen, setSelectedEndpoint]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("More actions")}
                    aria-haspopup="menu"
                    className={cn(
                        "shrink-0 text-muted-foreground",
                        "transition-colors",
                        "hover:bg-muted/80 hover:text-foreground",
                        "data-[state=open]:bg-muted data-[state=open]:text-foreground",
                    )}
                >
                    <MoreHorizontal className="size-3.5" strokeWidth={2} aria-hidden />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="min-w-52 rounded-xl p-1 shadow-md"
            >
                <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={() => onOpenUrl()}>
                        <ExternalLink className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                        {t("Visit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg">
                        <Pencil className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                        {t("Quick Edit")}
                    </DropdownMenuItem>
                    {endpoint.option === "path" && endpoint.category === "web" && (
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer rounded-lg">
                                <Palette className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                                {t("Build UI")}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="rounded-xl p-1 shadow-md">
                                <DropdownMenuItem className="cursor-pointer rounded-lg">
                                    <Layout className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                                    Visual Builder
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer rounded-lg">
                                    <Bot className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                                    Ai Builder
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    )}

                    {endpoint.option === "group" && (
                        <DropdownMenuItem className="cursor-pointer rounded-lg">
                            <Palette className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                            {t("Select Theme")}
                        </DropdownMenuItem>
                    )}

                </DropdownMenuGroup>


                {endpoint.option === "group" ? (
                    <>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                className="cursor-pointer rounded-lg"
                                onClick={handleAddEndpoint}
                            >
                                <Plus className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                                {t("Add Endpoint")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={handleAddGroup}>
                                <Plus className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                                {t("Add Group")}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </>
                ) : null}

                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link
                            to={`${endpoint.id}`}
                            className="flex cursor-pointer items-center gap-1.5 rounded-lg py-1 [&_svg]:text-foreground"
                        >
                            <SettingsIcon className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                            {t("Settings")}
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                {(!isFirstChild || !isLastChild) && (
                    <>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuGroup>
                            {!isFirstChild && (
                                <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={handleMoveUp}>
                                    <ArrowUp className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                                    {t("Move Up")}
                                </DropdownMenuItem>
                            )}
                            {!isLastChild && (
                                <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={handleMoveDown}>
                                    <ArrowDown className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                                    {t("Move Down")}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuGroup>
                    </>
                )}

                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer rounded-lg"
                    onClick={handleDelete}
                >
                    <Trash2 className="size-4" strokeWidth={2} aria-hidden />
                    {t("Delete")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default EndpointRowActions;