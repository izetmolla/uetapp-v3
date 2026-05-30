import type { LayoutBuilderItem } from "@workspace/flowtrove/components/layout/builder";

/** Validation showcase — composable type rules, number constraints, and array limits. */
export const validationDemoForm: LayoutBuilderItem[] = [
    {
        type: "form",
        id: "validation-form",
        showSuccessToast: true,
        successMessage: "Validation passed!",
        children: [
    {
        type: "card",
        id: "validation-card",
        title: "Validation rules",
        description: "Each field declares rules consumed by buildFormSchema() to produce a Zod schema.",
        children: [
            {
                type: "input",
                id: "val-username",
                name: "username",
                label: "Username",
                placeholder: "jane_doe",
                description: "Required, 3–20 chars, lowercase letters and underscores only.",
                validation: {
                    required: true,
                    minLength: 3,
                    maxLength: 20,
                    pattern: "^[a-z_]+$",
                    toLowerCase: true,
                    trim: true,
                },
            },
            {
                type: "input",
                id: "val-website",
                name: "website",
                label: "Website",
                placeholder: "https://example.com",
                description: "Optional URL — validated with typeRules (url | empty).",
                validation: {
                    typeRules: ["string", "url"],
                    typeRuleMode: "or",
                },
            },
            {
                type: "input",
                id: "val-age",
                name: "age",
                label: "Age",
                inputType: "number",
                placeholder: "25",
                description: "Integer between 18 and 120.",
                validation: {
                    required: true,
                    int: true,
                    min: 18,
                    max: 120,
                },
            },
            {
                type: "rs-fixed",
                id: "val-languages",
                name: "languages",
                label: "Languages",
                placeholder: "Select languages…",
                multi: true,
                description: "Multi-select with min 1 and max 4 items.",
                options: [
                    { value: "sq", label: "Albanian" },
                    { value: "en", label: "English" },
                    { value: "de", label: "German" },
                    { value: "fr", label: "French" },
                ],
                validation: {
                    required: true,
                    minItems: 1,
                    maxItems: 4,
                    minItemsMessage: "Pick at least one language",
                },
            },
        ],
        footer: [
            {
                type: "button",
                id: "validation-submit",
                label: "Validate & preview schema",
                buttonType: "submit",
                className: "w-full sm:w-auto",
            },
        ],
    },
        ],
    },
];
