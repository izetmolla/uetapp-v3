import { useEffect, useRef, useState, type FC } from "react";
import { Input } from "@workspace/ui/components/input";
import { useTranslation } from "react-i18next";
import { ButtonGroup, ButtonGroupSeparator } from "@workspace/ui/components/button-group";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
    ChevronDownIcon,
    PlusIcon,
    ComponentIcon,
    CodeIcon
} from "lucide-react";

const SEARCH_DEBOUNCE_MS = 500;

interface RightHeaderElementProps {
    keyword: string;
    setKeyword: (keyword: string) => void;
    onAddEndpointGroup?: () => void;
    onAddEndpointPath?: () => void;
    onAddMiddleware?: () => void;
}

const RightHeaderElement: FC<RightHeaderElementProps> = ({
    keyword,
    setKeyword,
    onAddEndpointGroup,
    onAddEndpointPath,
    onAddMiddleware,
}) => {
    const { t } = useTranslation();
    const [localKeyword, setLocalKeyword] = useState(keyword);
    const keywordRef = useRef(keyword);
    keywordRef.current = keyword;

    useEffect(() => {
        setLocalKeyword(keyword);
    }, [keyword]);

    useEffect(() => {
        const id = window.setTimeout(() => {
            if (localKeyword !== keywordRef.current) {
                setKeyword(localKeyword);
            }
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(id);
    }, [localKeyword, setKeyword]);

    return (
        <div className="ml-auto flex items-center gap-2">
            <Input
                className="h-7 py-0 text-sm"
                placeholder={t("Search endpoints")}
                value={localKeyword}
                onChange={(e) => setLocalKeyword(e.target.value)}
            />
            <ButtonGroup className="shadow-xs">
                <Button size="sm" onClick={() => onAddEndpointPath?.()}>
                    <PlusIcon />
                    {t("Add Endpoint")}
                </Button>
                <ButtonGroupSeparator className="bg-primary-foreground/25 dark:bg-primary-foreground/20" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon-sm"
                            aria-label={t("More actions")}
                        >
                            <ChevronDownIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={6} className="w-52">
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => onAddEndpointGroup?.()}
                            >
                                <ComponentIcon />
                                {t("Add Group")}
                                <DropdownMenuShortcut>G</DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => onAddMiddleware?.()}
                            >
                                <CodeIcon />
                                {t("Add Middleware")}
                                <DropdownMenuShortcut>M</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </ButtonGroup>
        </div>
    );
};

export default RightHeaderElement;
