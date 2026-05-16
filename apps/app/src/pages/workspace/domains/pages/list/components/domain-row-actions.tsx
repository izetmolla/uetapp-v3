import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ExternalLink, Globe, Key, Link2, MoreHorizontal, Plus, SettingsIcon,Trash2 } from "lucide-react";
import type { FC } from "react";
import type { Domain } from "../api";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import useDomainsListStore from "../store";

interface DomainRowActionsProps {
    domain: Domain;
}

const DomainRowActions: FC<DomainRowActionsProps> = ({ domain }) => {
    const { t } = useTranslation();
    const {
        setSelectedDomain,
        setIsSubdomainDialogOpen,
        setIsAliasDomainDialogOpen,
        setIsDeleteDomainDialogOpen,
        setIsMakePrimaryDomainDialogOpen,
    } = useDomainsListStore();

    const canAddChildren = domain.type !== "alias";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t("More actions")}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48 rounded-xl p-1 shadow-md">
                <DropdownMenuItem className="cursor-pointer rounded-lg">
                    <ExternalLink className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                    {t("Visit")}
                </DropdownMenuItem>

                {(!domain.primary && domain.type === "domain") && (
                    <DropdownMenuItem
                        className="cursor-pointer rounded-lg"
                        onClick={() => {
                            setSelectedDomain(domain);
                            setIsMakePrimaryDomainDialogOpen(true);
                        }}
                    >
                        <Key className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                        {t("Make primary")}
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link
                        to={`${domain.id}`}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 [&_svg]:text-foreground"
                    >
                        <SettingsIcon className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                        {t("Settings")}
                    </Link>
                </DropdownMenuItem>

                {canAddChildren ? (
                    <>
                        <DropdownMenuItem className="cursor-pointer rounded-lg" disabled>
                            <Globe className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                            {t("DNS Records")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer rounded-lg" disabled>
                            <Globe className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                            {t("Redirects")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem
                            className="cursor-pointer rounded-lg"
                            onClick={() => {
                                setSelectedDomain(domain);
                                setIsSubdomainDialogOpen(true);
                            }}
                        >
                            <Plus className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                            {t("Add subdomain")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer rounded-lg"
                            onClick={() => {
                                setSelectedDomain(domain);
                                setIsAliasDomainDialogOpen(true);
                            }}
                        >
                            <Link2 className="size-4 opacity-80" strokeWidth={2} aria-hidden />
                            {t("Add alias domain")}
                        </DropdownMenuItem>
                    </>
                ) : null}

                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer rounded-lg"
                    onClick={() => {
                        setSelectedDomain(domain);
                        setIsDeleteDomainDialogOpen(true);
                    }}
                >
                    <Trash2 className="size-4" strokeWidth={2} aria-hidden />
                    {t("Delete")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default DomainRowActions;
