#!/usr/bin/env node
/** Generates types/items.ts LayoutBuilderItem union from render folders */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rendersDir = path.join(__dirname, "../src/components/layout/builder/renders");
const itemsPath = path.join(__dirname, "../src/components/layout/builder/types/items.ts");

const EXCLUDE = new Set(["manifest", "registry", "index"]);

const folders = fs.readdirSync(rendersDir).filter((f) => {
    if (EXCLUDE.has(f)) return false;
    return fs.existsSync(path.join(rendersDir, f, "types.ts"));
});

const imports = folders
    .map((folder) => {
        const typesFile = fs.readFileSync(path.join(rendersDir, folder, "types.ts"), "utf8");
        const exports = [...typesFile.matchAll(/export type (\w+Item)\b/g)].map((m) => m[1]);
        if (exports.length === 0) return null;
        if (exports.length === 1) {
            return `import type { ${exports[0]} } from "../renders/${folder}/types";`;
        }
        return `import type { ${exports.join(", ")} } from "../renders/${folder}/types";`;
    })
    .filter(Boolean);

const unionMembers = folders.flatMap((folder) => {
    const typesFile = fs.readFileSync(path.join(rendersDir, folder, "types.ts"), "utf8");
    return [...typesFile.matchAll(/export type (\w+Item)\b/g)].map((m) => m[1]);
});

const content = `import type { CSSProperties } from "react";
import type { BaseFormFieldItem } from "./items-types";
${imports.join("\n")}

/** Base properties shared by all layout items */
export type BaseLayoutItem = {
  type: string;
  id: string;
  className?: string;
  style?: CSSProperties;
  condition?: string;
  locked?: boolean;
};

/** Base properties for items that can contain children */
export type ContainerItem = BaseLayoutItem & {
  children?: LayoutBuilderItem[];
};

export type LayoutBuilderItem =
${unionMembers.map((m) => `  | ${m}`).join("\n")};

/** Items that have a form field name */
export type FormFieldItem = BaseFormFieldItem;
`;

fs.writeFileSync(itemsPath, content);
console.log("Updated items.ts with", unionMembers.length, "types");
