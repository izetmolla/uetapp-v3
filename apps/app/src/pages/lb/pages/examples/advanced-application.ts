import type { LayoutBuilderItem } from "@workspace/flowtrove/components/layout/builder";

/** Job application — tabs, validation rules, repeatable rows, and conditional fields. */
export const advancedApplicationForm: LayoutBuilderItem[] = [
    {
        type: "form",
        id: "application-form",
        showSuccessToast: true,
        successMessage: "Application submitted!",
        children: [
    {
        type: "card",
        id: "application-card",
        title: "Job application",
        description: "Multi-step layout with tabs, repeatable experience, and conditional referral code.",
        children: [
            {
                type: "tabs",
                id: "application-tabs",
                defaultValue: "personal",
                tabs: [
                    {
                        value: "personal",
                        label: "Personal",
                        children: [
                            {
                                type: "div",
                                id: "personal-fields",
                                className: "grid gap-4 md:grid-cols-2",
                                children: [
                                    {
                                        type: "input",
                                        id: "app-first-name",
                                        name: "firstName",
                                        label: "First name",
                                        placeholder: "Jane",
                                        validation: {
                                            required: true,
                                            minLength: 2,
                                            minLengthMessage: "At least 2 characters",
                                        },
                                    },
                                    {
                                        type: "input",
                                        id: "app-last-name",
                                        name: "lastName",
                                        label: "Last name",
                                        placeholder: "Doe",
                                        validation: {
                                            required: true,
                                            minLength: 2,
                                        },
                                    },
                                    {
                                        type: "input",
                                        id: "app-email",
                                        name: "email",
                                        label: "Email",
                                        inputType: "email",
                                        placeholder: "jane@company.com",
                                        validation: {
                                            required: true,
                                            email: true,
                                            emailMessage: "Enter a valid email address",
                                        },
                                    },
                                    {
                                        type: "input",
                                        id: "app-phone",
                                        name: "phone",
                                        label: "Phone",
                                        placeholder: "+383 44 000 000",
                                        validation: {
                                            pattern: "^\\+?[0-9\\s-]{8,}$",
                                            patternMessage: "Enter a valid phone number",
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        value: "professional",
                        label: "Professional",
                        children: [
                            {
                                type: "select",
                                id: "app-role",
                                name: "role",
                                label: "Role applying for",
                                placeholder: "Select role",
                                validation: { required: true, requiredMessage: "Choose a role" },
                                options: [
                                    { value: "frontend", label: "Frontend engineer" },
                                    { value: "backend", label: "Backend engineer" },
                                    { value: "design", label: "Product designer" },
                                ],
                            },
                            {
                                type: "textarea",
                                id: "app-cover-letter",
                                name: "coverLetter",
                                label: "Cover letter",
                                placeholder: "Tell us why you are a great fit…",
                                rows: 5,
                                validation: {
                                    required: true,
                                    minLength: 50,
                                    maxLength: 2000,
                                    minLengthMessage: "Write at least 50 characters",
                                },
                            },
                            {
                                type: "repeatable",
                                id: "app-experience",
                                name: "experience",
                                label: "Work experience",
                                description: "Add previous roles. At least one entry is required.",
                                addButtonLabel: "Add experience",
                                validation: {
                                    required: true,
                                    minItems: 1,
                                    maxItems: 5,
                                    minItemsMessage: "Add at least one experience row",
                                },
                                fields: [
                                    {
                                        type: "input",
                                        name: "company",
                                        label: "Company",
                                        placeholder: "Acme Inc.",
                                    },
                                    {
                                        type: "input",
                                        name: "title",
                                        label: "Title",
                                        placeholder: "Senior engineer",
                                    },
                                    {
                                        type: "select",
                                        name: "employmentType",
                                        label: "Type",
                                        placeholder: "Select",
                                        options: [
                                            { value: "full-time", label: "Full-time" },
                                            { value: "contract", label: "Contract" },
                                            { value: "internship", label: "Internship" },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        value: "preferences",
                        label: "Preferences",
                        children: [
                            {
                                type: "radio-group",
                                id: "app-heard-from",
                                name: "heardFrom",
                                label: "How did you hear about us?",
                                defaultValue: "website",
                                options: [
                                    { value: "website", label: "Company website" },
                                    { value: "linkedin", label: "LinkedIn" },
                                    { value: "friend", label: "Friend or colleague" },
                                    { value: "other", label: "Other" },
                                ],
                            },
                            {
                                type: "input",
                                id: "app-referral-code",
                                name: "referralCode",
                                label: "Referral code",
                                placeholder: "REF-12345",
                                description: "Shown only when you were referred by someone.",
                                condition: "data.heardFrom === 'friend'",
                            },
                            {
                                type: "switch",
                                id: "app-remote",
                                name: "openToRemote",
                                label: "Open to remote work",
                                defaultChecked: true,
                            },
                        ],
                    },
                ],
            },
        ],
        footer: [
            {
                type: "div",
                id: "application-actions",
                className: "flex w-full justify-end gap-2",
                children: [
                    {
                        type: "button",
                        id: "application-draft",
                        label: "Save draft",
                        variant: "outline",
                        buttonType: "button",
                    },
                    {
                        type: "button",
                        id: "application-submit",
                        label: "Submit application",
                        buttonType: "submit",
                    },
                ],
            },
        ],
    },
        ],
    },
];

/** Runtime data for conditional fields in the advanced form demo. */
export const advancedApplicationData = {
    heardFrom: "friend",
};
