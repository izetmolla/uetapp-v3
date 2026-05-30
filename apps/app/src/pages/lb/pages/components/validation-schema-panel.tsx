import { useMemo } from "react";
import {
    buildDefaultValues,
    buildFormSchema,
    getFormFieldNames,
} from "@workspace/flowtrove/components/layout/builder";
import type { LayoutBuilderItem } from "@workspace/flowtrove/components/layout/builder";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";

type ValidationSchemaPanelProps = {
    items: LayoutBuilderItem[];
};

export function ValidationSchemaPanel({ items }: ValidationSchemaPanelProps) {
    const fieldNames = useMemo(() => getFormFieldNames(items), [items]);
    const defaults = useMemo(() => buildDefaultValues(items), [items]);
    const schemaKeys = useMemo(() => {
        const schema = buildFormSchema(items);
        return Object.keys(schema.shape);
    }, [items]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Generated schema preview</CardTitle>
                <CardDescription>
                    Output from <code className="text-xs">buildFormSchema()</code> and{" "}
                    <code className="text-xs">buildDefaultValues()</code> for this JSON tree.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div>
                    <p className="mb-2 font-medium">Form fields ({fieldNames.length})</p>
                    <div className="flex flex-wrap gap-2">
                        {fieldNames.map((name) => (
                            <Badge key={name} variant="outline">
                                {name}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="mb-2 font-medium">Zod shape keys</p>
                    <div className="flex flex-wrap gap-2">
                        {schemaKeys.map((key) => (
                            <Badge key={key} variant="secondary">
                                {key}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="mb-2 font-medium">Default values</p>
                    <pre className="overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
                        {JSON.stringify(defaults, null, 2)}
                    </pre>
                </div>
            </CardContent>
        </Card>
    );
}
