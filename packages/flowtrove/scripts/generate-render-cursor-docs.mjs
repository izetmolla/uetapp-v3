#!/usr/bin/env node
/**
 * Generates .cursor/ AGENTS.md, rules, and generate-*-json skills for layout renders.
 * Run: node scripts/generate-render-cursor-docs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rendersDir = path.join(__dirname, "../src/components/layout/builder/renders");
const manifestPath = path.join(rendersDir, "manifest.ts");

/** Folders with hand-authored .cursor docs — do not overwrite. */
const SKIP = new Set(["button", "card", "dialog", "div"]);

function readManifest() {
    const src = fs.readFileSync(manifestPath, "utf8");
    const entries = [];
    const re = /\{\s*folder:\s*"([^"]+)"[^}]*type:\s*"([^"]+)"([^}]*)\}/g;
    let m;
    while ((m = re.exec(src))) {
        entries.push({
            folder: m[1],
            type: m[2],
            formField: m[3].includes("formField: true"),
            namedExport: /namedExport:\s*"([^"]+)"/.exec(m[3])?.[1],
        });
    }
    const folders = [...new Set(entries.map((e) => e.folder))];
    return { entries, folders };
}

function titleCase(folder) {
    return folder
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

function parseTypesFile(content) {
    const types = [];
    const blocks = content.split(/export type /).slice(1);
    for (const block of blocks) {
        const nameMatch = /^(\w+)\s*=/.exec(block);
        if (!nameMatch) continue;
        const name = nameMatch[1];
        const isForm = block.includes("BaseFormFieldItem");
        const typeMatch = block.match(/type:\s*"([^"]+)"/);
        const discriminant = typeMatch?.[1];
        const fields = [];
        const fieldRe = /\/\*\*([^*]*)\*\/\s*\n\s*(\w+\??)\s*:/g;
        let fm;
        while ((fm = fieldRe.exec(block))) {
            fields.push({ comment: fm[1].trim(), name: fm[2].replace("?", "") });
        }
        if (fields.length === 0) {
            const simpleRe = /^\s*(\w+\??)\s*:/gm;
            let sm;
            while ((sm = simpleRe.exec(block))) {
                const n = sm[1].replace("?", "");
                if (n !== "type" && !fields.some((f) => f.name === n)) {
                    fields.push({ comment: "", name: n });
                }
            }
        }
        types.push({ name, discriminant, isForm, fields });
    }
    return types;
}

function primaryType(types, folderTypes) {
    const root = types.find((t) => t.discriminant && folderTypes.includes(t.discriminant));
    return root ?? types[0];
}

function skillName(folder) {
    return `generate-${folder}-json`;
}

function agentsMd(folder, folderEntries, types, primary) {
    const title = titleCase(folder);
    const typeList = folderEntries.map((e) => `\`${e.type}\``).join(", ");
    const skill = skillName(folder);
    const formNote = primary?.isForm
        ? "\n6. Form fields require unique `name` inside a `form` item.\n7. Use `validation` for Zod rules (see `lib/form/types.ts`)."
        : "";

    return `# Flowtrove Layout Builder — ${title} render

Maps layout JSON (${typeList}) to UI components via **LayoutBuilder**.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/${skill}/SKILL.md](skills/${skill}/SKILL.md) | **Start here** — generate or validate JSON |
| [skills/${skill}/reference.md](skills/${skill}/reference.md) | Full prop schema |
| [skills/${skill}/examples.md](skills/${skill}/examples.md) | Copy-paste JSON patterns |
| [../../types/items.ts](../../types/items.ts) | \`LayoutBuilderItem\` union |
| [../manifest.ts](../manifest.ts) | Registered type strings |

## Source files

| Path | Role |
|------|------|
| \`types.ts\` | TypeScript schema source of truth |
| \`index.tsx\` | Renderer component(s) |
| [../../renders/registry.tsx](../../renders/registry.tsx) | Dispatch registration |

## Rules

- [rules/${folder}-render-core.mdc](rules/${folder}-render-core.mdc)

## MCP / AI output contract

1. Always set \`type\` + unique \`id\` on every item.
2. Valid types for this folder: ${typeList}.
3. Return strict JSON (no comments, no trailing commas).
4. Read \`types.ts\` before inventing new fields.${formNote}
`;
}

function ruleMdc(folder, folderEntries, primary) {
    const types = folderEntries.map((e) => `"${e.type}"`).join(" | ");
    const formRules = primary?.isForm
        ? `\n- **Form fields**: require \`name\` (string); optional \`label\`, \`description\`, \`validation\`, \`placeholder\`.
- **Inside forms**: fields auto-bind via \`LayoutBuilderContext.form\`; preview mode when outside a form.
- **Validation**: use \`FieldValidation\` from \`lib/form/types.ts\`; schema built by \`buildFormSchema\`.`
        : "";
    const childrenRule = primary?.fields.some((f) => f.name === "children")
        ? `\n- **Children**: \`children\` is an array of layout items; nest valid \`LayoutBuilderItem\` objects.`
        : "";

    return `---
description: Flowtrove layout builder ${folder} render — JSON schema, MCP output rules
globs: packages/flowtrove/src/components/layout/builder/renders/${folder}/**
alwaysApply: false
---

# ${titleCase(folder)} render (layout builder)

Read \`.cursor/AGENTS.md\` and \`skills/${skillName(folder)}/SKILL.md\` before generating or editing JSON.

## JSON rules

- **Required**: \`type\` (${types}), \`id\` (unique string).
- **Discriminant**: \`type\` must match exactly one of the registered values above.
- **BaseLayoutItem**: optional \`className\`, \`style\`, \`condition\`, \`locked\`.
- **Condition**: evaluated against \`LayoutBuilder\` \`data\` (see \`lib/utils.ts\`).${formRules}${childrenRule}

## Renderer rules

- Map props to \`@workspace/ui\` components; do not add JSON fields without updating \`types.ts\`.
- Keep renderer in sync with \`types.ts\` — schema is the source of truth.

## Validation checklist

\`\`\`
- [ ] type is one of: ${folderEntries.map((e) => e.type).join(", ")}
- [ ] id is unique within the layout tree
- [ ] JSON is strict (no comments, no trailing commas)
- [ ] Props match types.ts (no invented fields)
\`\`\`
`;
}

function skillMd(folder, folderEntries, types, primary) {
    const skill = skillName(folder);
    const typeList = folderEntries.map((e) => `\`${e.type}\``).join(", ");
    const mainType = primary?.discriminant ?? folder;
    const fieldRows = (primary?.fields ?? [])
        .filter((f) => f.name !== "type")
        .slice(0, 20)
        .map((f) => `| \`${f.name}\` | no | ${f.comment || "See types.ts"} |`)
        .join("\n");

    const formExtra = primary?.isForm
        ? `\n| \`name\` | yes | Form field key (react-hook-form) |\n| \`validation\` | no | Zod rules object |`
        : "";

    const minimal = JSON.stringify(
        {
            type: mainType,
            id: `${folder}-1`,
            ...(primary?.isForm ? { name: "fieldName", label: "Label" } : {}),
            ...(primary?.fields.some((f) => f.name === "text") ? { text: "Example" } : {}),
            ...(primary?.fields.some((f) => f.name === "label") && !primary?.isForm
                ? { label: "Example" }
                : {}),
        },
        null,
        2,
    );

    const slotTypes = folderEntries.filter((e) => e.type !== mainType);
    const slotSection =
        slotTypes.length > 0
            ? `\n## Slot / related types\n\nThis folder also registers: ${slotTypes.map((e) => `\`${e.type}\``).join(", ")}. Each needs its own \`type\` discriminant — see [reference.md](reference.md).\n`
            : "";

    return `---
name: ${skill}
description: >-
  Generates and validates Flowtrove layout builder JSON for ${typeList}. Use when
  building layout JSON, MCP layout tools, or adding ${titleCase(folder)} items to
  LayoutBuilder trees.
---

# Generate ${titleCase(folder)} layout JSON

Produces valid items for \`LayoutBuilder\`. Schema source: \`types.ts\`.

---

## Quick checklist

\`\`\`
- [ ] 1. Set type (${typeList}) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
\`\`\`

---

## Minimal template

\`\`\`json
${minimal}
\`\`\`
${slotSection}
---

## Field guide (primary type: \`${mainType}\`)

| Field | Required | Notes |
|-------|----------|-------|
| \`type\` | yes | \`"${mainType}"\` |
| \`id\` | yes | Unique in tree |${formExtra}
${fieldRows || "| _(see types.ts)_ | — | — |"}

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (\`${folder}-save\`, not \`x1\`).
3. Do **not** invent props absent from \`types.ts\`.
4. Form fields must live under a \`form\` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong \`type\` string | Use exactly: ${typeList} |
| Missing \`id\` | Every item requires unique \`id\` |
| Invalid JSON | No comments; no trailing commas |
${primary?.isForm ? "| Missing `name` on form field | Add `name` for RHF binding |" : ""}
`;
}

function referenceMd(folder, types, folderEntries) {
    const sections = types
        .map((t) => {
            const fields = t.fields
                .map((f) => `| \`${f.name}\` | — | ${f.comment || ""} |`)
                .join("\n");
            return `## ${t.name} (\`type: "${t.discriminant ?? "?"}"\`)

${t.isForm ? "Extends `BaseFormFieldItem` (requires `name` in forms)." : "Extends `BaseLayoutItem`."}

| Field | Type | Description |
|-------|------|-------------|
| \`type\` | \`"${t.discriminant ?? folder}"\` | Discriminant |
| \`id\` | string | Unique identifier |
${fields}
`;
        })
        .join("\n");

    return `# ${titleCase(folder)} — JSON reference

TypeScript: \`renders/${folder}/types.ts\`.

Registered manifest types: ${folderEntries.map((e) => `\`${e.type}\``).join(", ")}.

## BaseLayoutItem (all layout items)

| Field | Type | Description |
|-------|------|-------------|
| \`type\` | string | Discriminant |
| \`id\` | string | Unique identifier |
| \`className\` | string? | Tailwind classes |
| \`style\` | object? | Inline CSS |
| \`condition\` | string? | Hide when false (evaluated against \`data\`) |
| \`locked\` | boolean? | Designer-only |

## BaseFormFieldItem (form fields)

| Field | Type | Description |
|-------|------|-------------|
| \`name\` | string | react-hook-form field key |
| \`label\` | string? | Visible label |
| \`description\` | string? | Help text |
| \`validation\` | object? | Zod rules — see \`lib/form/types.ts\` |
| \`disabled\` | boolean? | Disable input |

${sections}

## Condition syntax

- Boolean path: \`"data.isVisible"\`
- Equality: \`"data.status === 'active'"\`
- Comparison: \`"data.count > 5"\`
`;
}

function examplesMd(folder, primary, folderEntries) {
    const mainType = primary?.discriminant ?? folder;
    const examples = [
        {
            title: "Minimal",
            json: {
                type: mainType,
                id: `${folder}-example`,
                ...(primary?.isForm ? { name: "example", label: "Example" } : {}),
            },
        },
    ];

    if (primary?.isForm && mainType === "select") {
        examples.push({
            title: "Select with static options",
            json: {
                type: "select",
                id: "country",
                name: "country",
                label: "Country",
                options: [
                    { value: "al", label: "Albania" },
                    { value: "de", label: "Germany" },
                ],
            },
        });
        examples.push({
            title: "Select with HTTP options",
            json: {
                type: "select",
                id: "country-api",
                name: "country",
                label: "Country",
                options: { url: "/api/countries", method: "get" },
            },
        });
    }

    if (mainType === "form") {
        examples.push({
            title: "Form with fields",
            json: {
                type: "form",
                id: "example-form",
                action: "/api/submit",
                method: "POST",
                showSuccessToast: true,
                children: [
                    {
                        type: "input",
                        id: "email",
                        name: "email",
                        label: "Email",
                        validation: { required: true, email: true },
                    },
                    { type: "button", id: "submit", label: "Submit", buttonType: "submit" },
                ],
            },
        });
    }

    if (mainType === "content") {
        examples.push({
            title: "Content scope with interpolation",
            json: {
                type: "content",
                id: "profile-block",
                source: "profile",
                children: [
                    { type: "long-text", id: "name-line", text: "{{ displayName }}" },
                ],
            },
        });
    }

    if (mainType === "item-list") {
        examples.push({
            title: "Item list from data",
            json: {
                type: "item-list",
                id: "rows",
                source: "items",
                children: [
                    { type: "long-text", id: "row-text", text: "{{ title }}" },
                ],
            },
        });
    }

    const body = examples
        .map(
            (ex) => `## ${ex.title}

\`\`\`json
${JSON.stringify(ex.json, null, 2)}
\`\`\`
`,
        )
        .join("\n");

    return `# ${titleCase(folder)} — JSON examples

Copy-paste patterns for MCP / AI layout generation.

${body}
`;
}

function writeFile(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, "utf8");
}

function generateForFolder(folder, manifestEntries) {
    if (SKIP.has(folder)) {
        console.log(`skip (hand-authored): ${folder}`);
        return;
    }

    const typesPath = path.join(rendersDir, folder, "types.ts");
    if (!fs.existsSync(typesPath)) {
        console.log(`skip (no types.ts): ${folder}`);
        return;
    }

    const cursorDir = path.join(rendersDir, folder, ".cursor");
    if (fs.existsSync(path.join(cursorDir, "AGENTS.md"))) {
        console.log(`skip (exists): ${folder}`);
        return;
    }

    const folderEntries = manifestEntries.filter((e) => e.folder === folder);
    const typesContent = fs.readFileSync(typesPath, "utf8");
    const types = parseTypesFile(typesContent);
    const folderTypes = folderEntries.map((e) => e.type);
    const primary = primaryType(types, folderTypes);

    const skill = skillName(folder);
    writeFile(path.join(cursorDir, "AGENTS.md"), agentsMd(folder, folderEntries, types, primary));
    writeFile(
        path.join(cursorDir, "rules", `${folder}-render-core.mdc`),
        ruleMdc(folder, folderEntries, primary),
    );
    writeFile(path.join(cursorDir, "skills", skill, "SKILL.md"), skillMd(folder, folderEntries, types, primary));
    writeFile(path.join(cursorDir, "skills", skill, "reference.md"), referenceMd(folder, types, folderEntries));
    writeFile(path.join(cursorDir, "skills", skill, "examples.md"), examplesMd(folder, primary, folderEntries));
    console.log(`generated: ${folder}`);
}

function updateBuilderAgents(folders) {
    const agentsPath = path.join(__dirname, "../src/components/layout/builder/.cursor/AGENTS.md");
    if (!fs.existsSync(agentsPath)) return;

    const sorted = [...folders].sort();
    const table = sorted.map((f) => `| ${titleCase(f)} | \`renders/${f}/.cursor/\` |`).join("\n");

    let content = fs.readFileSync(agentsPath, "utf8");
    content = content.replace(
        /## Per-render AI docs[\s\S]*?(?=## Registered renders)/,
        `## Per-render AI docs\n\n| Render | \`.cursor\` path |\n|--------|----------------|\n${table}\n\n`,
    );
    fs.writeFileSync(agentsPath, content, "utf8");
    console.log("updated: builder/.cursor/AGENTS.md");
}

const { entries, folders } = readManifest();
for (const folder of folders) {
    generateForFolder(folder, entries);
}
updateBuilderAgents(folders);
console.log("done");
