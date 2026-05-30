export type TypeRuleId =
    | "string" | "number" | "boolean"
    | "email" | "url" | "uuid" | "cuid"
    | "ipv4" | "ipv6" | "emoji" | "base64"
    | "datetime" | "date" | "time"
    | "int" | "float"

export type FieldValidation = {
    /** Require a value (non-empty string, checked number, at least one item) */
    required?: boolean;
    /** Message when required check fails */
    requiredMessage?: string;
    /** Shorthand for requiredMessage (common in form configs) */
    message?: string;
    /** When true, wraps the final schema in `.nullable()` */
    nullable?: boolean;

    // --- String ---
    /** Min length (string/textarea) */
    minLength?: number;
    /** Max length (string/textarea) */
    maxLength?: number;
    minLengthMessage?: string;
    maxLengthMessage?: string;
    /** Exact string length — `z.string().length(n)` */
    exactLength?: number;
    exactLengthMessage?: string;
    /** Validate as email format */
    email?: boolean;
    emailMessage?: string;
    /** Validate as URL format */
    url?: boolean;
    urlMessage?: string;
    /** Regex pattern (string, e.g. "^[a-z]+$") */
    pattern?: string;
    patternMessage?: string;

    // String format checks (Zod 4 built-in)
    /** UUID v4 — `z.uuid()` pipe */
    uuid?: boolean;
    uuidMessage?: string;
    /** CUID — `z.cuid()` pipe */
    cuid?: boolean;
    cuidMessage?: string;
    /** ISO 8601 date-time — `z.iso.datetime()` pipe */
    datetime?: boolean;
    datetimeMessage?: string;
    /** IP address (v4 or v6) — `z.ip()` pipe */
    ip?: boolean;
    ipMessage?: string;
    /** Emoji — `z.emoji()` pipe */
    emoji?: boolean;
    emojiMessage?: string;
    /** Base64 — `z.base64()` pipe */
    base64?: boolean;
    base64Message?: string;

    // String containment
    /** Must start with this prefix — `z.string().startsWith(s)` */
    startsWith?: string;
    startsWithMessage?: string;
    /** Must end with this suffix — `z.string().endsWith(s)` */
    endsWith?: string;
    endsWithMessage?: string;
    /** Must include this substring — `z.string().includes(s)` */
    includes?: string;
    includesMessage?: string;

    // String transforms (applied after validation, before refine)
    /** Trim whitespace — `z.string().trim()` */
    trim?: boolean;
    /** Lowercase — `z.string().toLowerCase()` */
    toLowerCase?: boolean;
    /** Uppercase — `z.string().toUpperCase()` */
    toUpperCase?: boolean;

    // --- Number ---
    /** Min value (number input) */
    min?: number;
    /** Max value (number input) */
    max?: number;
    minMessage?: string;
    maxMessage?: string;
    /** Integer only */
    int?: boolean;
    intMessage?: string;
    /** Must be > 0 */
    positive?: boolean;
    /** Must be >= 0 */
    nonnegative?: boolean;
    /** Must be < 0 */
    negative?: boolean;
    /** Must be <= 0 */
    nonpositive?: boolean;
    /** Must be divisible by this — `z.number().multipleOf(n)` */
    multipleOf?: number;
    multipleOfMessage?: string;
    /** Must be a finite number — `z.number().finite()` */
    finite?: boolean;
    /** Must be within `Number.MIN_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER` — `z.number().safe()` */
    safe?: boolean;

    // --- Enum / one of (select, radio) ---
    /** Allowed values (overrides options for validation) */
    oneOf?: string[];
    oneOfMessage?: string;

    // --- Array (multi_select) ---
    /** Min number of selected items */
    minItems?: number;
    /** Max number of selected items */
    maxItems?: number;
    minItemsMessage?: string;
    maxItemsMessage?: string;

    // --- Composable type rules (union / intersection) ---

    /**
     * Composable type rules — build complex schemas from named format identifiers
     * combined with `or` (union) or `and` (intersection / pipe).
     *
     * Examples:
     *   `{ typeRules: ["email"] }`                            → z.email()
     *   `{ typeRules: ["email", "url"], typeRuleMode: "or" }` → z.union([z.email(), z.url()])
     *   `{ typeRules: ["ipv4", "ipv6"], typeRuleMode: "or" }` → z.union([z.ipv4(), z.ipv6()])
     *   `{ typeRules: ["string", "uuid"], typeRuleMode: "and" }` → z.string().pipe(z.uuid())
     */
    typeRules?: TypeRuleId[];
    /** How to combine multiple typeRules: `"or"` = union, `"and"` = pipe/intersection. Default `"or"`. */
    typeRuleMode?: "or" | "and";
    /** Custom error shown when the composed type rule fails (for union wrapper). */
    typeRuleMessage?: string;

    // --- Array element validation ---
    /**
     * When the field value is an array (multi-select, combobox multiple, etc.),
     * these rules apply to **each element** inside the array, not the array itself.
     * Supports the same `typeRules` / format toggles so you can say
     * "every item must be a valid email" or "every item must be uuid | cuid".
     */
    itemValidation?: Omit<FieldValidation,
        | "minItems" | "maxItems" | "minItemsMessage" | "maxItemsMessage"
        | "itemValidation" | "customRefines"
    >;

    // --- Custom refines ---
    /**
     * Array of custom refine rules. Each is evaluated as a `refine()` call.
     * `expression` is the JS function body with arg `val`, e.g. `"val.length % 2 === 0"`.
     */
    customRefines?: { expression: string; message: string }[];
};
