import type { FC } from "react";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

interface StatusTabsProps {
    value: string;
    onChange: (value: string) => void;
}
const StatusTabs: FC<StatusTabsProps> = ({ value, onChange }) => {
    const tabItems = [
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "aliases", label: "Aliases" },
    ] as const;

    return (
        <Tabs value={value} onValueChange={onChange}>
            <TabsList className="h-auto grid grid-cols-4 gap-1.5 bg-transparent p-0">
                {tabItems.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="h-7 rounded-md border border-transparent bg-transparent px-2.5 text-center text-xs font-medium text-muted-foreground shadow-none transition-all hover:border-border hover:text-foreground data-[state=active]:border-primary/25 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}

export default StatusTabs;