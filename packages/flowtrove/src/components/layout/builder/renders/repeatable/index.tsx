"use client";

import { useState } from "react";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Trash2Icon, PlusIcon } from "lucide-react";
import type { LayoutRendererProps } from "../../types";
import { FormFieldPreview } from "../../lib/form-field-preview";
import { useLayoutForm } from "../../lib/use-layout-form";
import type { RepeatableFieldDef, RepeatableItem } from "./types";
import { fromSafeSelectValue, safeSelectValue } from "../../lib/select-value";

function getEmptyRow(fields: RepeatableFieldDef[]): Record<string, string | number | undefined> {
    const row: Record<string, string | number | undefined> = {};
    for (const f of fields) {
        row[f.name] = f.type === "input" && f.inputType === "number" ? undefined : "";
    }
    return row;
}

type Props = {
    item: RepeatableItem;
    form: UseFormReturn<Record<string, unknown>>;
};

export function RepeatableField({ item, form }: Props) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: item.name as never,
    });

    const addLabel = item.addButtonLabel ?? "Add item";

    return (
        <FormField
            control={form.control}
            name={item.name}
            render={() => (
                <FormItem>
                    {item.label && <FormLabel>{item.label}</FormLabel>}
                    <FormControl>
                        <div className="space-y-3 rounded-lg border bg-card p-4">
                            {/* Column headers (optional, for table-like layout) */}
                            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${item.fields.length}, 1fr) 2.5rem` }}>
                                {item.fields.map((def) => (
                                    <span key={def.name} className="text-muted-foreground text-xs font-medium">
                                        {def.label ?? def.name}
                                    </span>
                                ))}
                                <span className="w-10" aria-hidden />
                            </div>

                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid gap-2 items-center"
                                    style={{ gridTemplateColumns: `repeat(${item.fields.length}, 1fr) 2.5rem` }}
                                >
                                    {item.fields.map((def) => (
                                        <Cell
                                            key={def.name}
                                            form={form}
                                            baseName={`${item.name}.${index}.${def.name}`}
                                            def={def}
                                        />
                                    ))}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => remove(index)}
                                        aria-label={`Remove item ${index + 1}`}
                                    >
                                        <Trash2Icon className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => append(getEmptyRow(item.fields) as never)}
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                {addLabel}
                            </Button>
                        </div>
                    </FormControl>
                    {item.description && <FormDescription>{item.description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

function Cell({
    form,
    baseName,
    def,
}: {
    form: UseFormReturn<Record<string, unknown>>;
    baseName: string;
    def: RepeatableFieldDef;
}) {
    if (def.type === "input") {
        return (
            <FormField
                control={form.control}
                name={baseName as never}
                render={({ field }) => (
                    <FormItem className="space-y-1">
                        <FormControl>
                            <Input
                                {...field}
                                type={def.inputType ?? "text"}
                                placeholder={def.placeholder}
                                value={(field.value as string | number | undefined) ?? ""}
                                onChange={field.onChange}
                                className="h-9"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    }
    return (
        <FormField
            control={form.control}
            name={baseName as never}
            render={({ field }) => {
                const currentValue = (field.value as string | undefined) ?? "";
                const selectValue =
                    currentValue === ""
                        ? (() => {
                            const idx = def.options.findIndex((o) => o.value === "");
                            return idx >= 0 ? safeSelectValue("", idx) : "";
                        })()
                        : currentValue;
                return (
                    <FormItem className="space-y-1">
                        <Select
                            value={selectValue}
                            onValueChange={(v) => field.onChange(fromSafeSelectValue(v))}
                        >
                            <FormControl>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder={def.placeholder ?? "Select…"} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {def.options.map((opt, idx) => {
                                    const safe = safeSelectValue(opt.value, idx);
                                    return (
                                        <SelectItem key={safe} value={safe}>
                                            {opt.label}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}

type RowValues = Record<string, string | number | undefined>;

function RepeatablePreviewRenderer({ item }: LayoutRendererProps<RepeatableItem>) {
    const [rows, setRows] = useState<RowValues[]>(() => [getEmptyRow(item.fields)]);

    const updateCell = (rowIndex: number, fieldName: string, value: string | number | undefined) => {
        setRows((prev) =>
            prev.map((row, i) => (i === rowIndex ? { ...row, [fieldName]: value } : row)),
        );
    };

    const addLabel = item.addButtonLabel ?? "Add item";
    const gridCols = `repeat(${item.fields.length}, 1fr) 2.5rem`;

    return (
        <FormFieldPreview item={item}>
            <div className="space-y-3 rounded-lg border bg-card p-4">
                <div className="grid gap-2" style={{ gridTemplateColumns: gridCols }}>
                    {item.fields.map((def) => (
                        <span key={def.name} className="text-xs font-medium text-muted-foreground">
                            {def.label ?? def.name}
                        </span>
                    ))}
                    <span className="w-10" aria-hidden />
                </div>

                {rows.map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="grid items-center gap-2"
                        style={{ gridTemplateColumns: gridCols }}
                    >
                        {item.fields.map((def) => (
                            <PreviewCell
                                key={def.name}
                                def={def}
                                value={row[def.name]}
                                onChange={(value) => updateCell(rowIndex, def.name, value)}
                            />
                        ))}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                            disabled={rows.length <= 1}
                            onClick={() => setRows((prev) => prev.filter((_, i) => i !== rowIndex))}
                            aria-label={`Remove item ${rowIndex + 1}`}
                        >
                            <Trash2Icon className="h-4 w-4" />
                        </Button>
                    </div>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setRows((prev) => [...prev, getEmptyRow(item.fields)])}
                >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    {addLabel}
                </Button>
            </div>
        </FormFieldPreview>
    );
}

function PreviewCell({
    def,
    value,
    onChange,
}: {
    def: RepeatableFieldDef;
    value: string | number | undefined;
    onChange: (value: string | number | undefined) => void;
}) {
    if (def.type === "input") {
        return (
            <Input
                type={def.inputType ?? "text"}
                placeholder={def.placeholder}
                value={value ?? ""}
                onChange={(e) =>
                    onChange(def.inputType === "number" ? e.target.valueAsNumber : e.target.value)
                }
                className="h-9"
            />
        );
    }

    const currentValue = (value as string | undefined) ?? "";
    const selectValue =
        currentValue === ""
            ? (() => {
                const idx = def.options.findIndex((o) => o.value === "");
                return idx >= 0 ? safeSelectValue("", idx) : "";
            })()
            : currentValue;

    return (
        <Select
            value={selectValue}
            onValueChange={(v) => onChange(fromSafeSelectValue(v))}
        >
            <SelectTrigger className="h-9">
                <SelectValue placeholder={def.placeholder ?? "Select…"} />
            </SelectTrigger>
            <SelectContent>
                {def.options.map((opt, idx) => {
                    const safe = safeSelectValue(opt.value, idx);
                    return (
                        <SelectItem key={safe} value={safe}>
                            {opt.label}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}

export default function RepeatableRenderer(props: LayoutRendererProps<RepeatableItem>) {
    const form = useLayoutForm();
    if (form) {
        return <RepeatableField item={props.item} form={form} />;
    }
    return <RepeatablePreviewRenderer {...props} />;
}
export type { RepeatableItem, RepeatableFieldDef } from "./types";
