import { Checkbox } from "@workspace/ui/components/checkbox";
import { cn } from "@workspace/ui/lib/utils";
import { useDatabaseStore, type SchemaKind } from "../../store";



interface CodeRowProps {
    text: React.ReactNode;
    kind: SchemaKind
    id: string;
}
function CodeRow({ text, kind, id }: CodeRowProps) {
    const { selectedSchema, toggleSchemaSelection } = useDatabaseStore();
    const checked = !!selectedSchema[kind][id];
    return (
        <div
            className={cn(
                "group flex items-center px-3 py-3 font-mono text-sm transition-colors",
                checked && "bg-primary/5",
            )}
        >
            <div
                className={cn(
                    "mr-2 transition-opacity",
                    checked ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                )}
            >
                <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleSchemaSelection(kind, id)}
                    aria-label="Select"
                />
            </div>
            <div className="flex-1 truncate">{text}</div>
        </div>
    );
}


export default CodeRow;