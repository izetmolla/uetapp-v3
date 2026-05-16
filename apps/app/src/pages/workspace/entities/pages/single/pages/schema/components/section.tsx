import { useState } from "react";
import SingleColumn from "./single-column";



interface SectionProps {
    title: string;
    action?: { label: string; onClick: () => void };
    children: React.ReactNode;
}
function Section({ title, action, children }: SectionProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    {title}
                </h3>
                {action && (
                    <button
                        // onClick={action.onClick}
                        onClick={() => setOpen(!open)}
                        className="text-xs text-sky-400 hover:text-sky-300 transition"
                    >
                        {action.label}
                    </button>
                )}
            </div>
            {open && (
                <div className="rounded-md border border-border bg-muted/30 divide-y divide-border">
                    <SingleColumn
                        column={{ id: "1", name: "test", column_name: "test", dataType: "VARCHAR(50)" }}
                        isNew={true}
                        onRemoveNewColumn={() => setOpen(!open)}
                    />
                </div>
            )}
            {children}
        </div>
    );
}

export default Section