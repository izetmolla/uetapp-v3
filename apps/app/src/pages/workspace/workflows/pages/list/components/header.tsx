import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useDebounce } from "@workspace/ui/hooks/use-debounce";
import { ChevronRight, LayoutGrid, List, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useWorkflowListStore } from "../store";


interface HeaderProps {
    search: string;
    onSearch: (search: string) => void;
}
const Header: FC<HeaderProps> = ({
    search,
    onSearch,
}) => {
    const {
        mode,
        setMode,
        setIsCreateWorkflowDialogOpen
    } = useWorkflowListStore();
    const [localSearch, setLocalSearch] = useState(search);
    const searchRef = useRef<HTMLInputElement>(null);
    const debouncedSearch = useDebounce<string>(localSearch, 500);
    const { t } = useTranslation();

    useEffect(() => {
        setLocalSearch(search);
    }, [search]);

    useEffect(() => {
        onSearch(debouncedSearch);
    }, [debouncedSearch, onSearch]);


    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-background">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-2.5 sm:h-14 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-0">
                <nav className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground sm:gap-1.5 sm:text-sm" aria-label="Breadcrumb">
                    <Link
                        to={"#"}
                        className="truncate font-medium transition-colors hover:text-foreground"
                    >
                        {t("Workspace")}
                    </Link>
                    <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
                    <span className="truncate font-semibold text-foreground">{t("Backends")}</span>
                </nav>

                <div className="relative order-last w-full sm:order-none sm:w-56 md:w-64 lg:flex-1 lg:max-w-md">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        ref={searchRef}
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder={t("Search backends")}
                        className="h-8 w-full pl-8 pr-12 text-xs"
                    />
                    <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
                        {t("⌘K")}
                    </kbd>
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                    <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
                        <button
                            type="button"
                            onClick={() => setMode("grid")}
                            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${mode === "grid" ? "bg-background text-foreground ring-1 ring-border" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <LayoutGrid className="size-3.5" />
                            <span className="hidden sm:inline">Grid</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("list")}
                            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${mode === "list" ? "bg-background text-foreground ring-1 ring-border" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <List className="size-3.5" />
                            <span className="hidden sm:inline">List</span>
                        </button>
                    </div>

                    <Button type="button" onClick={() => setIsCreateWorkflowDialogOpen(true)} size="sm" className="h-8 shrink-0 gap-1">
                        <Plus className="size-4" />
                        <span className="hidden sm:inline">New workflow</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                </div>
            </div>
        </header>

    );
};

export default Header;