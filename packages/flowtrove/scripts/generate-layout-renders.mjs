#!/usr/bin/env node
/**
 * Generates layout builder render stubs. Run from packages/flowtrove:
 * node scripts/generate-layout-renders.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rendersDir = path.join(__dirname, "../src/components/layout/builder/renders");
const SKIP = new Set(["div", "button", "card", "dialog", "select", "repeatable", "manifest"]);

const FOLDER_CONFIG = {
    badge: { pascal: "Badge", form: false, text: true, variant: true },
    label: { pascal: "Label", form: false, text: true },
    separator: { pascal: "Separator", form: false, kind: "separator" },
    skeleton: { pascal: "Skeleton", form: false, kind: "skeleton" },
    progress: { pascal: "Progress", form: false, kind: "progress" },
    avatar: { pascal: "Avatar", form: false, kind: "avatar" },
    icon: { pascal: "Icon", form: false, kind: "icon" },
    "long-text": { pascal: "LongText", form: false, kind: "long-text" },
    toggle: { pascal: "Toggle", form: false, kind: "toggle" },
    input: { pascal: "Input", form: true, kind: "input" },
    textarea: { pascal: "Textarea", form: true, kind: "textarea" },
    checkbox: { pascal: "Checkbox", form: true, kind: "checkbox" },
    switch: { pascal: "Switch", form: true, kind: "switch" },
    slider: { pascal: "Slider", form: true, kind: "slider" },
    "radio-group": { pascal: "RadioGroup", form: true, kind: "radio-group" },
    combobox: { pascal: "Combobox", form: true, kind: "combobox" },
    "rs-fixed": { pascal: "RsFixed", form: true, kind: "rs-fixed" },
    "rs-async": { pascal: "RsAsync", form: true, kind: "rs-async" },
    "rs-creatable": { pascal: "RsCreatable", form: true, kind: "rs-creatable" },
    "scroll-area": { pascal: "ScrollArea", form: false, container: true, kind: "scroll-area" },
    "button-group": { pascal: "ButtonGroup", form: false, container: true, kind: "button-group" },
    calendar: { pascal: "Calendar", form: false, kind: "calendar" },
    breadcrumb: { pascal: "Breadcrumb", form: false, kind: "breadcrumb" },
    pagination: { pascal: "Pagination", form: false, kind: "pagination" },
    "dropdown-menu": { pascal: "DropdownMenu", form: false, kind: "dropdown-menu" },
    command: { pascal: "Command", form: false, container: true, kind: "command" },
    "input-group": { pascal: "InputGroup", form: false, container: true, kind: "input-group" },
    timeline: { pascal: "Timeline", form: false, container: true, kind: "timeline" },
    sonner: { pascal: "Sonner", form: false, kind: "sonner" },
};

function writeTypes(folder, cfg) {
    const typeName = `${cfg.pascal}Item`;
    const base = cfg.form ? "BaseFormFieldItem" : "BaseLayoutItem";
    const imports = cfg.form
        ? `import type { BaseFormFieldItem } from "../../types/items-types";`
        : `import type { BaseLayoutItem, LayoutBuilderItem } from "../../types/items";`;

    let fields = "";
    if (cfg.text && cfg.variant) {
        fields = `    text: string;\n    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";`;
    } else if (cfg.text) {
        fields = `    text: string;`;
    } else if (cfg.form && cfg.kind === "radio-group") {
        fields = `    options?: { value: string; label: string }[];\n    defaultValue?: string;`;
    } else if (cfg.form && cfg.kind?.startsWith("rs-")) {
        fields = `    options?: { value: string; label: string }[];\n    placeholder?: string;\n    defaultValue?: string;\n    multi?: boolean;\n    loadOptionsUrl?: string;`;
    } else if (cfg.form) {
        fields = `    placeholder?: string;\n    defaultValue?: string;\n    inputType?: string;\n    defaultChecked?: boolean;\n    rows?: number;\n    min?: number;\n    max?: number;\n    step?: number;\n    size?: "default" | "sm";`;
    } else if (cfg.container) {
        fields = `    children?: LayoutBuilderItem[];`;
    } else if (cfg.kind === "separator") {
        fields = `    orientation?: "horizontal" | "vertical";`;
    } else if (cfg.kind === "progress") {
        fields = `    value?: number;`;
    } else if (cfg.kind === "avatar") {
        fields = `    src?: string;\n    fallback?: string;\n    size?: "default" | "sm" | "lg";`;
    } else if (cfg.kind === "icon") {
        fields = `    name: string;`;
    } else if (cfg.kind === "sonner") {
        fields = `    position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";`;
    } else {
        fields = `    children?: LayoutBuilderItem[];`;
    }

    fs.mkdirSync(path.join(rendersDir, folder), { recursive: true });
    fs.writeFileSync(
        path.join(rendersDir, folder, "types.ts"),
        `${imports}

export type ${typeName} = ${base}${cfg.container && !cfg.form ? "" : ""} & {
    type: "${folder}";
${fields}
};
`,
    );
}

function writeIndex(folder, cfg) {
    const typeName = `${cfg.pascal}Item`;
    const formImport = cfg.form ? `\nimport { FormFieldPreview } from "../../lib/form-field-preview";` : "";
    const sig = cfg.container
        ? `{ item, renderItems, path }: LayoutRendererProps<${typeName}>`
        : `{ item }: LayoutRendererProps<${typeName}>`;
    const childrenDecl = cfg.container ? `\n    const children = item.children ?? [];` : "";

    let body = `return null;`;
    const k = cfg.kind;
    if (k === "badge") body = `return <Badge variant={item.variant} className={cn(item.className)} style={item.style}>{item.text}</Badge>;`;
    else if (k === "label") body = `return <Label className={cn(item.className)} style={item.style}>{item.text}</Label>;`;
    else if (k === "long-text") body = `return <LongText className={cn(item.className)}>{item.text}</LongText>;`;
    else if (k === "separator") body = `return <Separator orientation={item.orientation ?? "horizontal"} className={cn(item.className)} style={item.style} />;`;
    else if (k === "skeleton") body = `return <Skeleton className={cn(item.className)} style={item.style} />;`;
    else if (k === "progress") body = `return <Progress value={item.value ?? 0} className={cn(item.className)} style={item.style} />;`;
    else if (k === "avatar") body = `return (<Avatar className={cn(item.className)} style={item.style} size={item.size}>{item.src ? <AvatarImage src={item.src} alt={item.fallback ?? ""} /> : null}<AvatarFallback>{item.fallback ?? "?"}</AvatarFallback></Avatar>);`;
    else if (k === "icon") body = `return <Icon name={item.name as never} className={cn(item.className)} style={item.style} />;`;
    else if (k === "input") body = `return (<FormFieldPreview item={item}><Input type={item.inputType ?? "text"} placeholder={item.placeholder} defaultValue={item.defaultValue} disabled={item.disabled} className={cn(item.className)} /></FormFieldPreview>);`;
    else if (k === "textarea") body = `return (<FormFieldPreview item={item}><Textarea placeholder={item.placeholder} defaultValue={item.defaultValue} disabled={item.disabled} rows={item.rows} className={cn(item.className)} /></FormFieldPreview>);`;
    else if (k === "checkbox") body = `return (<FormFieldPreview item={item}><Checkbox defaultChecked={item.defaultChecked} disabled={item.disabled} className={cn(item.className)} /></FormFieldPreview>);`;
    else if (k === "switch") body = `return (<FormFieldPreview item={item}><Switch defaultChecked={item.defaultChecked} disabled={item.disabled} size={item.size} className={cn(item.className)} /></FormFieldPreview>);`;
    else if (k === "slider") body = `return (<FormFieldPreview item={item}><Slider defaultValue={item.defaultValue ?? [50]} min={item.min ?? 0} max={item.max ?? 100} step={item.step ?? 1} disabled={item.disabled} className={cn(item.className)} /></FormFieldPreview>);`;
    else if (k === "scroll-area") body = `return (<ScrollArea className={cn(item.className)} style={item.style}>{renderItems(children, path)}</ScrollArea>);`;
    else if (k === "button-group") body = `return (<ButtonGroup className={cn(item.className)} style={item.style}>{renderItems(children, path)}</ButtonGroup>);`;
    else if (k === "sonner") body = `return <Toaster position={item.position} className={cn(item.className)} />;`;
    else if (k === "calendar") body = `return <Calendar className={cn(item.className)} style={item.style} />;`;
    else body = `return (<div className={cn("rounded-md border border-dashed p-4 text-sm text-muted-foreground", item.className)} style={item.style}>${cfg.pascal} — implement renderer</div>);`;

    const uiImports = getUiImports(cfg);
    fs.writeFileSync(
        path.join(rendersDir, folder, "index.tsx"),
        `"use client";

import { cn } from "@workspace/ui/lib/utils";
${uiImports}
import type { LayoutRendererProps } from "../../types";
import type { ${typeName} } from "./types";${formImport}

function ${cfg.pascal}Renderer(${sig}) {${childrenDecl}
    ${body}
}

export default ${cfg.pascal}Renderer;
export type { ${typeName} };
`,
    );
}

function getUiImports(cfg) {
    const m = {
        badge: `import { Badge } from "@workspace/ui/components/badge";`,
        label: `import { Label } from "@workspace/ui/components/label";`,
        separator: `import { Separator } from "@workspace/ui/components/separator";`,
        skeleton: `import { Skeleton } from "@workspace/ui/components/skeleton";`,
        progress: `import { Progress } from "@workspace/ui/components/progress";`,
        avatar: `import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";`,
        icon: `import Icon from "@workspace/ui/components/icon";`,
        "long-text": `import LongText from "@workspace/ui/components/long-text";`,
        input: `import { Input } from "@workspace/ui/components/input";`,
        textarea: `import { Textarea } from "@workspace/ui/components/textarea";`,
        checkbox: `import { Checkbox } from "@workspace/ui/components/checkbox";`,
        switch: `import { Switch } from "@workspace/ui/components/switch";`,
        slider: `import { Slider } from "@workspace/ui/components/slider";`,
        "scroll-area": `import { ScrollArea } from "@workspace/ui/components/scroll-area";`,
        "button-group": `import { ButtonGroup } from "@workspace/ui/components/button-group";`,
        sonner: `import { Toaster } from "@workspace/ui/components/sonner";`,
        calendar: `import { Calendar } from "@workspace/ui/components/calendar";`,
    };
    return m[cfg.kind] ?? "";
}

for (const [folder, cfg] of Object.entries(FOLDER_CONFIG)) {
    if (SKIP.has(folder)) continue;
    writeTypes(folder, cfg);
    writeIndex(folder, cfg);
}

console.log("Done:", Object.keys(FOLDER_CONFIG).filter((f) => !SKIP.has(f)).length, "folders");
