import z from "zod";
import { evaluateCondition, hasChildren } from "../utils";
import type { FormFieldItem } from "../../types/items";
import type { LayoutBuilderChildItem } from "../../types/base-layout";
import type { FieldValidation } from "./types";
import type { InputItem } from "../../renders/input/types";
import type { PasswordInputItem } from "../../renders/password-input/types";
import type { RadioGroupItem } from "../../renders/radio-group/types";
import type { SelectItem } from "../../renders/select/types";
import type { RepeatableFieldDef, RepeatableItem } from "../../renders/repeatable/types";
import {
    getStaticSelectOptions,
    hasRemoteSelectOptions,
} from "../select-options-source";

/**
 * Type guard: narrows `item` to `FormFieldItem` when it has a non-empty `"name"` string.
 * Form-field items (input, textarea, etc.) use this to be distinguished from other layout items.
 */
export function isFormFieldItem(item: any): item is FormFieldItem {
    if (Object.hasOwn(item, "name")) {
        return typeof item?.name === "string" && item.name !== "";
    }
    return false;
}



/** Child arrays on layout containers (card footer, tabs, etc.) that may hold form fields. */
function collectNestedItemLists(item: LayoutBuilderChildItem): LayoutBuilderChildItem[][] {
    const lists: LayoutBuilderChildItem[][] = [];

    if (hasChildren(item) && Array.isArray(item.children)) {
        lists.push(item.children);
    }

    const raw = item as LayoutBuilderChildItem & {
        footer?: LayoutBuilderChildItem[];
        headerAction?: LayoutBuilderChildItem[];
        tabs?: { children?: LayoutBuilderChildItem[] }[];
        steps?: { children?: LayoutBuilderChildItem[] }[];
    };

    if (Array.isArray(raw.footer) && raw.footer.length > 0) {
        lists.push(raw.footer);
    }
    if (Array.isArray(raw.headerAction) && raw.headerAction.length > 0) {
        lists.push(raw.headerAction);
    }

    const itemType = item.type as string;
    if (itemType === "tabs") {
        for (const tab of raw.tabs ?? []) {
            if (tab.children?.length) {
                lists.push(tab.children);
            }
        }
    }
    if (itemType === "steps") {
        for (const step of raw.steps ?? []) {
            if (step.children?.length) {
                lists.push(step.children);
            }
        }
    }

    return lists;
}

function collectFieldItems(items: LayoutBuilderChildItem[] | undefined): FormFieldItem[] {
    if (!Array.isArray(items)) return [];
    const fields: FormFieldItem[] = [];
    for (const item of items) {
        if (isFormFieldItem(item)) {
            fields.push(item);
        }

        for (const nested of collectNestedItemLists(item)) {
            fields.push(...collectFieldItems(nested));
        }
    }
    return fields;
}

function passesItemCondition(
    item: LayoutBuilderChildItem,
    context: Record<string, unknown>,
): boolean {
    if (!item.condition) return true;
    return evaluateCondition(item.condition, context);
}

/** Collect form fields whose `condition` passes for the current layout + form values. */
function collectVisibleFieldItems(
    items: LayoutBuilderChildItem[] | undefined,
    context: Record<string, unknown>,
): FormFieldItem[] {
    if (!Array.isArray(items)) return [];
    const fields: FormFieldItem[] = [];
    for (const item of items) {
        if (!passesItemCondition(item, context)) continue;
        if (isFormFieldItem(item)) {
            fields.push(item);
        }
        for (const nested of collectNestedItemLists(item)) {
            fields.push(...collectVisibleFieldItems(nested, context));
        }
    }
    return fields;
}

function getVisibleFieldsByName(
    items: LayoutBuilderChildItem[],
    context: Record<string, unknown>,
): Map<string, FormFieldItem> {
    const map = new Map<string, FormFieldItem>();
    for (const field of collectVisibleFieldItems(items, context)) {
        const existing = map.get(field.name);
        if (!existing || (field.validation && !existing.validation)) {
            map.set(field.name, field);
        }
    }
    return map;
}

/** Collect all form field names from items (for server error field mapping). */
export function getFormFieldNames(items: LayoutBuilderChildItem[]): string[] {
    return collectFieldItems(items).map((f) => f.name);
}

/** Deduplicate by field name: when multiple fields share a name, prefer the one with validation. */
function getFieldsByName(items: LayoutBuilderChildItem[]): Map<string, FormFieldItem> {
    const fields = collectFieldItems(items);
    const nameToField = new Map<string, FormFieldItem>();
    for (const field of fields) {
        const existing = nameToField.get(field.name);
        const preferNew = !existing || (field.validation != null && existing.validation == null);
        if (preferNew) {
            nameToField.set(field.name, field);
        }
    }
    return nameToField;
}

const defaultRequiredMessage = (label?: string, name?: string) => `${label ?? name ?? "Field"} is required`;

function getRequiredMessage(v: FieldValidation | undefined, field: { label?: string; name: string }): string {
    return v?.requiredMessage ?? v?.message ?? defaultRequiredMessage(field.label, field.name);
}

// ─── Composable type rules ────────────────────────────────────────────────────

type TypeRuleId = NonNullable<FieldValidation["typeRules"]>[number]

/**
 * Maps a single type-rule identifier to its Zod schema.
 * Returns `undefined` for unknown IDs so callers can skip gracefully.
 */
type ZodStringWithIp = z.ZodString & {
    ip: (options?: { version?: "v4" | "v6"; message?: string }) => z.ZodString;
};

function zodIp(options?: { version?: "v4" | "v6"; message?: string }) {
    return (z.string() as ZodStringWithIp).ip(options);
}

function typeRuleToSchema(id: TypeRuleId): z.ZodTypeAny | undefined {
    switch (id) {
        case "string": return z.string()
        case "number": return z.coerce.number()
        case "boolean": return z.coerce.boolean()
        case "email": return z.string().email()
        case "url": return z.string().url()
        case "uuid": return z.string().uuid()
        case "cuid": return z.string().cuid()
        case "ipv4": return zodIp({ version: "v4" })
        case "ipv6": return zodIp({ version: "v6" })
        case "emoji": return z.string().emoji()
        case "base64": return z.string().base64()
        case "datetime": return z.string().datetime()
        case "date": return z.string().date()
        case "time": return z.string().time()
        case "int": return z.coerce.number().int()
        case "float": return z.coerce.number()
        default: return undefined
    }
}

/**
 * Builds a composed schema from `typeRules` + `typeRuleMode`.
 *
 * - **`"or"`** (default): `z.union([schemaA, schemaB, …])` — value must match **any** rule.
 * - **`"and"`**: schemas are chained with `.pipe()` — value must pass through **all** rules sequentially.
 *
 * Returns `undefined` when no valid rules are provided so the caller can fall back.
 */
export function buildTypeRuleSchema(v: FieldValidation | undefined): z.ZodTypeAny | undefined {
    const ids = v?.typeRules
    if (!ids?.length) return undefined

    const schemas = ids.map(typeRuleToSchema).filter((s): s is z.ZodTypeAny => s != null)
    if (schemas.length === 0) return undefined
    if (schemas.length === 1) return schemas[0]

    const mode = v?.typeRuleMode ?? "or"

    if (mode === "or") {
        return z.union(schemas as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]])
    }

    // "and": pipe each schema into the next — `a.pipe(b).pipe(c)`
    let piped: z.ZodTypeAny = schemas[0]
    for (let i = 1; i < schemas.length; i++) {
        piped = piped.pipe(schemas[i])
    }
    return piped
}

/**
 * Builds a Zod schema for a single array **element** using `itemValidation`.
 * Applies the same string validation pipeline + typeRules so you can say
 * "every item must be a valid email" or "every item must be uuid | cuid".
 */
function buildItemElementSchema(iv: FieldValidation): z.ZodTypeAny {
    const fromTypeRules = buildTypeRuleSchema(iv)
    if (fromTypeRules) return fromTypeRules
    return applyStringValidation(z.string(), iv, { label: "Item", name: "item" })
}

/**
 * Applies user-defined `customRefines` from `FieldValidation`.
 * Each refine entry has an `expression` (JS body with arg `val`) and a `message`.
 * Invalid expressions are silently skipped so a bad user string never crashes schema building.
 */
function applyCustomRefines(schema: z.ZodTypeAny, v: FieldValidation | undefined): z.ZodTypeAny {
    if (!v?.customRefines?.length) return schema;
    let s = schema;
    for (const { expression, message } of v.customRefines) {
        try {
            // eslint-disable-next-line no-new-func
            const fn = new Function("val", `return (${expression})`) as (val: unknown) => boolean;
            s = s.refine(fn, { message });
        } catch {
            // bad expression — skip silently
        }
    }
    return s;
}

function applyStringValidation(
    base: z.ZodString,
    v: FieldValidation | undefined,
    field: { label?: string; name: string }
): z.ZodTypeAny {
    if (!v) return base.optional();
    const req = v.required ?? false;
    const reqMsg = getRequiredMessage(v, field);

    // If composable typeRules are defined they take priority over individual format flags.
    const typeRuleSchema = buildTypeRuleSchema(v)
    if (typeRuleSchema) {
        let s: z.ZodTypeAny = typeRuleSchema
        s = applyCustomRefines(s, v)
        if (req) {
            s = s.refine((val) => val != null && String(val).trim().length > 0, { message: reqMsg })
        } else {
            s = s.optional()
        }
        if (v.nullable) s = s.nullable()
        return s
    }

    let s: z.ZodTypeAny = base;

    // --- transforms (must run on ZodString before pipes) ---
    if (v.trim) {
        s = (s as z.ZodString).trim();
    }
    if (v.toLowerCase) {
        s = (s as z.ZodString).toLowerCase();
    }
    if (v.toUpperCase) {
        s = (s as z.ZodString).toUpperCase();
    }

    // --- length checks ---
    // Zod builds an internal regex for min/max; min > max yields /^[\s\S]{max,min}$/ and throws.
    const ex = v.exactLength
    const minL = v.minLength
    const maxL = v.maxLength
    const minGreaterThanMax = minL != null && maxL != null && minL > maxL
    const exactConflictsMin = ex != null && minL != null && ex < minL
    const exactConflictsMax = ex != null && maxL != null && ex > maxL

    if (minGreaterThanMax || exactConflictsMin || exactConflictsMax) {
        const msg = minGreaterThanMax
            ? (v.minLengthMessage ??
                v.maxLengthMessage ??
                "Minimum length cannot be greater than maximum length")
            : (v.exactLengthMessage ??
                v.minLengthMessage ??
                v.maxLengthMessage ??
                "Exact length conflicts with min/max length")
        s = (s as z.ZodString).refine(() => false, { message: msg })
    } else {
        if (ex != null) {
            s = (s as z.ZodString).length(ex, {
                message: v.exactLengthMessage ?? `Must be exactly ${ex} characters`,
            })
        }
        if (minL != null) {
            s = (s as z.ZodString).min(minL, {
                message: v.minLengthMessage ?? `Min ${minL} characters`,
            })
        }
        if (maxL != null) {
            s = (s as z.ZodString).max(maxL, {
                message: v.maxLengthMessage ?? `Max ${maxL} characters`,
            })
        }
    }

    // --- containment checks ---
    if (v.startsWith) {
        s = (s as z.ZodString).startsWith(v.startsWith, { message: v.startsWithMessage ?? `Must start with "${v.startsWith}"` });
    }
    if (v.endsWith) {
        s = (s as z.ZodString).endsWith(v.endsWith, { message: v.endsWithMessage ?? `Must end with "${v.endsWith}"` });
    }
    if (v.includes) {
        s = (s as z.ZodString).includes(v.includes, { message: v.includesMessage ?? `Must include "${v.includes}"` });
    }

    // --- regex ---
    if (v.pattern) {
        try {
            const re = new RegExp(v.pattern);
            s = (s as z.ZodString).regex(re, v.patternMessage ?? "Invalid format");
        } catch {
            // invalid regex, skip
        }
    }

    // --- format pipes (result no longer has .min/.max) ---
    if (v.email) {
        s = (s as z.ZodString).pipe(
            v.emailMessage ? z.string().email(v.emailMessage) : z.string().email()
        );
    }
    if (v.url) {
        s = (s as z.ZodString).pipe(
            v.urlMessage ? z.string().url(v.urlMessage) : z.string().url()
        );
    }
    if (v.uuid) {
        s = (s as z.ZodString).pipe(
            v.uuidMessage ? z.string().uuid(v.uuidMessage) : z.string().uuid()
        );
    }
    if (v.cuid) {
        s = (s as z.ZodString).pipe(
            v.cuidMessage ? z.string().cuid(v.cuidMessage) : z.string().cuid()
        );
    }
    if (v.ip) {
        s = (s as z.ZodString).pipe(
            v.ipMessage ? zodIp({ message: v.ipMessage }) : zodIp()
        );
    }
    if (v.emoji) {
        s = (s as z.ZodString).pipe(
            v.emojiMessage ? z.string().emoji(v.emojiMessage) : z.string().emoji()
        );
    }
    if (v.base64) {
        s = (s as z.ZodString).pipe(
            v.base64Message ? z.string().base64(v.base64Message) : z.string().base64()
        );
    }
    if (v.datetime) {
        s = (s as z.ZodString).pipe(
            v.datetimeMessage ? z.string().datetime({ message: v.datetimeMessage }) : z.string().datetime()
        );
    }

    // --- custom refines ---
    s = applyCustomRefines(s, v);

    // --- required / optional ---
    if (req) {
        s = (s as z.ZodTypeAny).refine((val) => val != null && String(val).trim().length > 0, { message: reqMsg });
    } else {
        s = (s as z.ZodTypeAny).optional();
    }

    // --- nullable wrapper ---
    if (v.nullable) {
        s = (s as z.ZodTypeAny).nullable();
    }

    return s;
}

function applyNumberValidation(
    base: z.ZodTypeAny,
    v: FieldValidation | undefined,
    _field: { label?: string; name: string }
): z.ZodTypeAny {
    if (!v) return base.optional();

    const typeRuleSchema = buildTypeRuleSchema(v)
    if (typeRuleSchema) {
        let s: z.ZodTypeAny = typeRuleSchema
        s = applyCustomRefines(s, v)
        if (!(v.required ?? false)) s = s.optional()
        if (v.nullable) s = s.nullable()
        return s
    }

    let n: z.ZodTypeAny = base;
    const req = v.required ?? false;

    if (v.int) {
        n = (n as z.ZodNumber).int(v.intMessage ?? "Must be an integer");
    }
    if (v.positive) {
        n = (n as z.ZodNumber).positive("Must be positive");
    }
    if (v.nonnegative) {
        n = (n as z.ZodNumber).nonnegative("Must be ≥ 0");
    }
    if (v.negative) {
        n = (n as z.ZodNumber).negative("Must be negative");
    }
    if (v.nonpositive) {
        n = (n as z.ZodNumber).nonpositive("Must be ≤ 0");
    }
    if (v.finite) {
        n = (n as z.ZodNumber).finite("Must be finite");
    }
    if (v.safe) {
        n = (n as z.ZodNumber).safe("Must be a safe integer");
    }
    if (v.multipleOf != null) {
        n = (n as z.ZodNumber).multipleOf(v.multipleOf, { message: v.multipleOfMessage ?? `Must be a multiple of ${v.multipleOf}` });
    }
    if (v.min != null && v.max != null && v.min > v.max) {
        n = (n as z.ZodNumber).refine(() => false, {
            message:
                v.minMessage ??
                v.maxMessage ??
                "Minimum cannot be greater than maximum",
        })
    } else {
        if (v.min != null) {
            n = (n as z.ZodNumber).min(v.min, { message: v.minMessage ?? `Min ${v.min}` });
        }
        if (v.max != null) {
            n = (n as z.ZodNumber).max(v.max, { message: v.maxMessage ?? `Max ${v.max}` });
        }
    }

    // custom refines
    n = applyCustomRefines(n, v);

    if (!req) {
        n = (n as z.ZodNumber).optional();
    }

    // nullable wrapper
    if (v.nullable) {
        n = (n as z.ZodTypeAny).nullable();
    }

    return n;
}

function applyEnumValidation(
    allowedValues: string[],
    v: FieldValidation | undefined,
    field: { label?: string; name: string }
): z.ZodTypeAny {
    // typeRules override enum validation entirely
    const typeRuleSchema = buildTypeRuleSchema(v)
    if (typeRuleSchema) {
        let s: z.ZodTypeAny = typeRuleSchema
        s = applyCustomRefines(s, v)
        const req = v?.required ?? false
        const reqMsg = v?.requiredMessage ?? v?.message ?? defaultRequiredMessage(field.label, field.name)
        if (req) {
            s = s.refine((val) => val != null && String(val).trim().length > 0, { message: reqMsg })
        } else {
            s = s.optional()
        }
        if (v?.nullable) s = s.nullable()
        return s
    }

    const oneOf = v?.oneOf?.length ? v.oneOf : allowedValues;
    const req = v?.required ?? false;
    const reqMsg = v?.requiredMessage ?? v?.message ?? v?.oneOfMessage ?? defaultRequiredMessage(field.label, field.name);
    if (oneOf.length === 0) {
        return z.string().optional();
    }
    const enumSchema = z.enum(oneOf as [string, ...string[]]);
    if (req) {
        return z
            .union([z.literal(""), enumSchema])
            .refine((val) => val != null && val !== "", { message: reqMsg });
    }
    return z.union([enumSchema, z.literal("")]).optional();
}

export function applyArrayValidation(
    base: z.ZodArray<z.ZodTypeAny>,
    v: FieldValidation | undefined,
    field: { label?: string; name: string }
): z.ZodTypeAny {
    if (!v) return base.optional();

    // If `itemValidation` is provided, rebuild the array with a typed element schema.
    let arr: z.ZodTypeAny = v.itemValidation
        ? z.array(buildItemElementSchema(v.itemValidation as FieldValidation))
        : base

    const req = v.required ?? false;
    const reqMsg = getRequiredMessage(v, field);

    if (v.minItems != null) {
        arr = (arr as z.ZodArray<z.ZodTypeAny>).min(v.minItems, { message: v.minItemsMessage ?? `Select at least ${v.minItems}` });
    }
    if (v.maxItems != null) {
        arr = (arr as z.ZodArray<z.ZodTypeAny>).max(v.maxItems, { message: v.maxItemsMessage ?? `Select at most ${v.maxItems}` });
    }

    arr = applyCustomRefines(arr, v);

    if (req) {
        arr = (arr as z.ZodArray<z.ZodTypeAny>).min(1, { message: reqMsg });
    } else {
        arr = (arr as z.ZodArray<z.ZodTypeAny>).optional();
    }

    if (v.nullable) {
        arr = arr.nullable();
    }

    return arr;
}

function zodTypeForRepeatableFieldDef(def: RepeatableFieldDef): z.ZodTypeAny {
    const label = def.label ?? def.name;
    if (def.type === "input") {
        if (def.inputType === "number") {
            const base = z.coerce.number();
            return def.required
                ? base.refine((n) => !Number.isNaN(n), { message: `${label} is required` })
                : base.optional();
        }
        const base = z.string();
        return def.required
            ? base.min(1, { message: `${label} is required` })
            : base.optional();
    }
    const base = z.string();
    return def.required
        ? base.min(1, { message: `${label} is required` })
        : base.optional();
}

function zodTypeForField(field: FormFieldItem): z.ZodTypeAny {
    const v = field.validation;
    const label = field.label ?? field.name;

    switch (field.type) {
        case "input": {
            const inputField = field as InputItem;
            if (inputField.inputType === "number") {
                return applyNumberValidation(z.coerce.number(), v, { label, name: field.name });
            }
            const base = z.string();
            return applyStringValidation(base, v, { label, name: field.name });
        }
        case "password-input": {
            const base = z.string();
            return applyStringValidation(base, v, { label, name: field.name });
        }
        case "textarea": {
            const base = z.string();
            return applyStringValidation(base, v, { label, name: field.name });
        }
        case "select": {
            const selectField = field as SelectItem;
            const values = getStaticSelectOptions(selectField.options).map((o) => o.value);
            if (values.length === 0 || hasRemoteSelectOptions(selectField)) {
                return applyStringValidation(z.string(), v, { label, name: field.name });
            }
            return applyEnumValidation(values, v, { label, name: field.name });
        }
        case "radio-group": {
            const radioField = field as RadioGroupItem;
            const values = (radioField.options ?? []).map((o) => o.value);
            if (values.length === 0) {
                return applyStringValidation(z.string(), v, { label, name: field.name });
            }
            return applyEnumValidation(values, v, { label, name: field.name });
        }
        case "combobox": {
            const values = (field as { items?: string[] }).items ?? [];
            const multi = (field as { multiple?: boolean }).multiple === true;
            if (values.length === 0) {
                return applyStringValidation(z.string(), v, { label, name: field.name });
            }
            if (multi) {
                const base = z.array(z.string());
                return applyArrayValidation(base, v, { label, name: field.name });
            }
            return applyEnumValidation(values, v, { label, name: field.name });
        }
        case "checkbox":
            return z.boolean().optional();
        case "switch":
            return z.boolean().optional();
        case "slider": {
            const base = z.array(z.coerce.number());
            return applyArrayValidation(base, v, { label, name: field.name });
        }
        case "multi-select": {
            const base = z.array(z.string());
            return applyArrayValidation(base, v, { label, name: field.name });
        }
        case "rs-async":
        case "rs-creatable":
        case "rs-fixed": {
            const rsField = field as { multi?: boolean; optionsApi?: unknown; loadOptionsUrl?: string };
            const remote = Boolean(rsField.optionsApi || rsField.loadOptionsUrl);
            const multi = rsField.multi === true;
            if (multi) {
                const base = z.array(z.string());
                return applyArrayValidation(base, v, { label, name: field.name });
            }
            if (remote) {
                return applyStringValidation(z.string(), v, { label, name: field.name });
            }
            return applyStringValidation(z.string(), v, { label, name: field.name });
        }
        case "repeatable": {
            const repeatableField = field as RepeatableItem;
            const itemShape: Record<string, z.ZodTypeAny> = {};
            for (const def of repeatableField.fields) {
                itemShape[def.name] = zodTypeForRepeatableFieldDef(def);
            }
            const itemSchema = z.object(itemShape);
            let arr: z.ZodTypeAny = z.array(itemSchema);
            const req = v?.required ?? false;
            const reqMsg = getRequiredMessage(v, field);
            if (v?.minItems != null) {
                arr = (arr as z.ZodArray<z.ZodObject<Record<string, z.ZodTypeAny>>>).min(
                    v.minItems,
                    { message: v.minItemsMessage ?? `Add at least ${v.minItems} item(s)` }
                );
            }
            if (v?.maxItems != null) {
                arr = (arr as z.ZodArray<z.ZodObject<Record<string, z.ZodTypeAny>>>).max(
                    v.maxItems,
                    { message: v.maxItemsMessage ?? `At most ${v.maxItems} item(s)` }
                );
            }
            if (req) {
                arr = (arr as z.ZodArray<z.ZodTypeAny>).min(1, { message: reqMsg });
            } else {
                arr = (arr as z.ZodArray<z.ZodTypeAny>).optional();
            }
            return arr;
        }
        // case "rs_async":
        // case "rs_creatable":
        // case "rs_fixed_options": {
        //     const multi = (field as { multi?: boolean }).multi === true;
        //     if (multi) {
        //         const base = z.array(z.string());
        //         return applyArrayValidation(base, v, { label, name: field.name });
        //     }
        //     const base = z.string();
        //     return applyStringValidation(base, v, { label, name: field.name });
        // }
        // case "file_upload": {
        //     const req = v?.required ?? (field as { required?: boolean }).required ?? false;
        //     const reqMsg = v?.requiredMessage ?? defaultRequiredMessage(label, field.name);
        //     if (field.multiple) {
        //         const base = z.array(z.union([z.instanceof(File), z.string().url()]));
        //         let s: z.ZodTypeAny = base;
        //         if (v?.minItems != null) {
        //             s = (s as z.ZodArray<z.ZodTypeAny>).min(v.minItems, { message: v.minItemsMessage ?? `Add at least ${v.minItems} file(s)` });
        //         }
        //         if (v?.maxItems != null) {
        //             s = (s as z.ZodArray<z.ZodTypeAny>).max(v.maxItems, { message: v.maxItemsMessage ?? `At most ${v.maxItems} file(s)` });
        //         }
        //         if (req) {
        //             s = (s as z.ZodArray<z.ZodTypeAny>).min(1, { message: reqMsg });
        //         } else {
        //             s = (s as z.ZodArray<z.ZodTypeAny>).optional();
        //         }
        //         return s;
        //     }
        //     const single = z.union([z.instanceof(File), z.string().url()]).nullable();
        //     if (req) {
        //         return single.refine((val) => val != null && (typeof val === "string" ? val.length > 0 : true), { message: reqMsg });
        //     }
        //     return single.optional();
        // }
        default:
            return z.unknown().optional();
    }
}

/**
 * Build a Zod schema from a flat or nested array of form builder items.
 * When multiple fields share the same name, the one with validation is preferred so schema rules apply.
 */
export function buildFormSchema(items: LayoutBuilderChildItem[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
    const nameToField = getFieldsByName(items);
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const field of nameToField.values()) {
        shape[field.name] = zodTypeForField(field);
    }
    return z.object(shape);
}

/**
 * Build a Zod schema for currently visible form fields only.
 * Hidden fields (failed `condition`) are excluded from validation and submit payload.
 */
export function buildFormSchemaForContext(
    items: LayoutBuilderChildItem[],
    context: Record<string, unknown>,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
    const nameToField = getVisibleFieldsByName(items, context);
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const field of nameToField.values()) {
        shape[field.name] = zodTypeForField(field);
    }
    return z.object(shape);
}

/** Field names currently visible inside a form tree. */
export function getVisibleFormFieldNames(
    items: LayoutBuilderChildItem[],
    context: Record<string, unknown>,
): string[] {
    return [...getVisibleFieldsByName(items, context).keys()];
}

/**
 * Build default values for react-hook-form from the same items.
 * Uses the same field selection as buildFormSchema (prefer field with validation when names duplicate).
 */
export function buildDefaultValues(items: LayoutBuilderChildItem[]): Record<string, unknown> {
    const nameToField = getFieldsByName(items);
    const defaults: Record<string, unknown> = {};
    for (const field of nameToField.values()) {
        switch (field.type) {
            case "checkbox":
            case "switch": {
                const toggled = field as { defaultChecked?: boolean };
                defaults[field.name] = toggled.defaultChecked ?? false;
                break;
            }
            case "slider": {
                const slider = field as { defaultValue?: number[] };
                defaults[field.name] = slider.defaultValue ?? [50];
                break;
            }
            case "textarea": {
                const textarea = field as { defaultValue?: string };
                defaults[field.name] = textarea.defaultValue ?? "";
                break;
            }
            case "input": {
                const inputField = field as InputItem;
                const fallback = inputField.inputType === "number" ? undefined : "";
                defaults[field.name] =
                    inputField.defaultValue !== undefined ? inputField.defaultValue : fallback;
                break;
            }
            case "password-input": {
                const passwordField = field as PasswordInputItem;
                defaults[field.name] = passwordField.defaultValue ?? "";
                break;
            }
            case "select":
            case "radio-group":
                defaults[field.name] =
                    "defaultValue" in field && (field as { defaultValue?: unknown }).defaultValue !== undefined
                        ? (field as { defaultValue: string }).defaultValue
                        : "";
                break;
            case "combobox": {
                const def = field as { multiple?: boolean; defaultValue?: string | string[] };
                defaults[field.name] = def.multiple === true
                    ? (Array.isArray(def.defaultValue) ? def.defaultValue : [])
                    : (typeof def.defaultValue === "string" ? def.defaultValue : "");
                break;
            }
            // case "rs_async":
            // case "rs_creatable":
            // case "rs_fixed_options":
            //     defaults[field.name] = (field as { multi?: boolean }).multi === true ? [] : "";
            //     break;
            case "multi-select":
                defaults[field.name] =
                    "defaultValue" in field && Array.isArray((field as { defaultValue?: unknown }).defaultValue)
                        ? (field as { defaultValue: string[] }).defaultValue
                        : [];
                break;
            case "rs-async":
            case "rs-creatable":
            case "rs-fixed": {
                const def = field as { multi?: boolean; defaultValue?: string | string[] };
                if (def.multi === true) {
                    defaults[field.name] =
                        Array.isArray(def.defaultValue) ? def.defaultValue : [];
                } else {
                    defaults[field.name] =
                        typeof def.defaultValue === "string" ? def.defaultValue : "";
                }
                break;
            }
            // case "file_upload":
            //     defaults[field.name] = field.multiple ? [] : null;
            //     break;
            case "repeatable": {
                const repeatableField = field as RepeatableItem;
                const emptyRow: Record<string, unknown> = {};
                for (const def of repeatableField.fields) {
                    emptyRow[def.name] = def.type === "input" && def.inputType === "number" ? undefined : "";
                }
                defaults[field.name] = [emptyRow];
                break;
            }
            default:
                defaults[(field as FormFieldItem).name] = "";
        }
    }
    return defaults;
}

function asPlainObject(value: unknown): Record<string, unknown> | null {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    return null;
}

export type ResolveFormDefaultValuesOptions = {
    /** Inline object merged over field defaults (designer preview / static seed). */
    value?: Record<string, unknown>;
    /** Layout runtime `data` — used with `source` or matching top-level field names. */
    data?: Record<string, unknown>;
    /** Key on `data` whose object is merged into defaults (e.g. `"profile"`). */
    source?: string;
};

/**
 * Build react-hook-form defaults from field items, then overlay runtime / static values.
 * Field JSON `defaultValue` / `options` still seed the form; `value` and `data[source]` win on overlap.
 */
export function resolveFormDefaultValues(
    items: LayoutBuilderChildItem[],
    options?: ResolveFormDefaultValuesOptions,
): Record<string, unknown> {
    const defaults = buildDefaultValues(items);
    const fieldNames = getFormFieldNames(items);
    const overlay: Record<string, unknown> = {};

    if (options?.source && options.data) {
        const scoped = asPlainObject(options.data[options.source]);
        if (scoped) {
            Object.assign(overlay, scoped);
        }
    }

    if (options?.value) {
        Object.assign(overlay, options.value);
    }

    if (options?.data) {
        for (const name of fieldNames) {
            if (Object.hasOwn(options.data, name) && !Object.hasOwn(overlay, name)) {
                overlay[name] = options.data[name];
            }
        }
    }

    const resolved = { ...defaults };
    for (const name of fieldNames) {
        if (Object.hasOwn(overlay, name) && overlay[name] !== undefined) {
            resolved[name] = overlay[name];
        }
    }
    return resolved;
}
