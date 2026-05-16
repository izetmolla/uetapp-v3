import { ReactSelect } from "@workspace/ui/components/reactselect";
import { Badge } from "@workspace/ui/components/badge";
import { Globe } from "lucide-react";
import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import type { Domain } from "../api";

export type DomainComboItem = { value: string; label: string; primary: boolean };

interface DomainSelectProps {
    domains: Domain[];
    onDomainChange: (domainId: string) => void;
    activeDomain: Domain | null;
}

const DomainSelect: FC<DomainSelectProps> = ({ domains, onDomainChange, activeDomain }) => {
    const { t } = useTranslation();

    const options = useMemo<DomainComboItem[]>(
        () => domains.map((d) => ({ value: d.id, label: d.domain, primary: d.primary })),
        [domains],
    );

    return (
        <div className="w-full">
            <ReactSelect<DomainComboItem>
                aria-label={t("Filter endpoints by domain")}
                options={options}
                placeholder={t("Search or select domain…")}
                value={activeDomain?.id ?? null}
                onValueChange={(id) => {
                    if (id != null) onDomainChange(id);
                }}
                isClearable={false}
                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                noOptionsMessage={() => t("No domains match your search.")}
                formatOptionLabel={(item) => (
                    <span className="flex min-w-0 flex-1 items-center gap-2.5 py-0.5">
                        <Globe
                            className="size-3.5 shrink-0 text-muted-foreground"
                            strokeWidth={2}
                            aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate text-left font-mono text-xs tabular-nums tracking-tight">
                            {item.label}
                        </span>
                        {item.primary ? (
                            <Badge variant="secondary" className="h-5 shrink-0 px-1.5 text-[10px] font-medium">
                                {t("Primary")}
                            </Badge>
                        ) : null}
                    </span>
                )}
                classNames={{
                    menu: () => "max-w-[min(24rem,calc(100vw-2rem))]",
                }}
                styles={{
                    control: (base) => ({
                        ...base,
                        minHeight: "2.25rem",
                    }),
                }}
            />
        </div>
    );
};

export default DomainSelect;
