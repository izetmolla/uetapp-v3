import type { LayoutBuilderItem } from "@workspace/flowtrove/components/layout/builder";

/** Profile settings — select, radio, checkbox, switch, slider, and react-select. */
export const intermediateProfileForm: LayoutBuilderItem[] = [
    {
        type: "form",
        id: "profile-form",
        showSuccessToast: true,
        successMessage: "Profile saved!",
        children: [
    {
        type: "card",
        id: "profile-card",
        title: "Profile settings",
        description: "Mix common field types in a responsive grid layout.",
        children: [
            {
                type: "div",
                id: "profile-grid",
                className: "grid gap-4 md:grid-cols-2",
                children: [
                    {
                        type: "input",
                        id: "profile-display-name",
                        name: "displayName",
                        label: "Display name",
                        placeholder: "jane_doe",
                    },
                    {
                        type: "select",
                        id: "profile-country",
                        name: "country",
                        label: "Country",
                        placeholder: "Select country",
                        options: [
                            { value: "al", label: "Albania" },
                            { value: "xk", label: "Kosovo" },
                            { value: "mk", label: "North Macedonia" },
                            { value: "de", label: "Germany" },
                        ],
                    },
                    {
                        type: "radio-group",
                        id: "profile-plan",
                        name: "plan",
                        label: "Subscription plan",
                        defaultValue: "free",
                        options: [
                            { value: "free", label: "Free" },
                            { value: "pro", label: "Pro" },
                            { value: "team", label: "Team" },
                        ],
                    },
                    {
                        type: "rs-fixed",
                        id: "profile-skills",
                        name: "skills",
                        label: "Skills",
                        placeholder: "Pick skills…",
                        multi: true,
                        options: [
                            { value: "react", label: "React" },
                            { value: "typescript", label: "TypeScript" },
                            { value: "node", label: "Node.js" },
                            { value: "design", label: "UI Design" },
                        ],
                    },
                ],
            },
            {
                type: "div",
                id: "profile-toggles",
                className: "space-y-4 rounded-lg border bg-muted/30 p-4",
                children: [
                    {
                        type: "checkbox",
                        id: "profile-newsletter",
                        name: "newsletter",
                        label: "Email me product updates",
                        defaultChecked: true,
                    },
                    {
                        type: "switch",
                        id: "profile-notifications",
                        name: "notifications",
                        label: "Push notifications",
                        defaultChecked: false,
                    },
                    {
                        type: "slider",
                        id: "profile-volume",
                        name: "notificationVolume",
                        label: "Notification volume",
                        defaultValue: [60],
                        min: 0,
                        max: 100,
                        step: 5,
                    },
                ],
            },
        ],
        footer: [
            {
                type: "div",
                id: "profile-actions",
                className: "flex w-full justify-end gap-2",
                children: [
                    {
                        type: "button",
                        id: "profile-reset",
                        label: "Reset",
                        variant: "ghost",
                        buttonType: "button",
                    },
                    {
                        type: "button",
                        id: "profile-save",
                        label: "Save profile",
                        buttonType: "submit",
                    },
                ],
            },
        ],
    },
        ],
    },
];
