import type { LayoutBuilderItem } from "@workspace/flowtrove/components/layout/builder";

/** Runtime data — form reads `data.profile` via `source: "profile"`. */
export const sampleData: Record<string, unknown> = {
    profile: {
        firstName: "Jane",
        lastName: "Doe",
        newsletter: true,
        notifications: false,
        phoneNumbers: [
            { label: "Home", number: "+1 555-0100" },
            { label: "Mobile", number: "+1 555-0199" },
        ],
        skills: [
            { name: "TypeScript", level: "expert" },
            { name: "React", level: "advanced" },
        ],
        title: "Senior Engineer",
        department: "Engineering",
        accountType: "personal",
        companyName: "",
        emailFrequency: "weekly",
    },
};

export const layoutItems: LayoutBuilderItem[] = [
    {
        type: "content",
        id: "profile-header",
        source: "profile",
        className: "rounded-lg border bg-muted/40 p-4 space-y-1",
        children: [
            {
                type: "long-text",
                id: "profile-greeting",
                text: "Editing profile for {{ content.firstName }} {{ content.lastName }}",
                className: "text-lg font-medium",
            },
            {
                type: "long-text",
                id: "profile-meta",
                text: "{{ content.title }} · {{ content.department }}",
                className: "text-muted-foreground text-sm",
            },
        ],
    },
    {
        type: "form",
        id: "profile-form",
        source: "profile",
        action: "/api/save1",
        method: "POST",
        showSuccessToast: true,
        showErrorAsToast: true,
        successMessage: "Profile saved successfully",
        onSubmitAction: "reset",
        children: [
            {
                type: "div",
                id: "name-row",
                className: "grid gap-4 sm:grid-cols-2",
                children: [
                    {
                        type: "input",
                        id: "first-name",
                        name: "firstName",
                        label: "First name",
                        placeholder: "Jane",
                        validation: {
                            required: true,
                            minLength: 2,
                            maxLength: 50,
                            requiredMessage: "First name is required",
                            minLengthMessage: "At least 2 characters",
                        },
                    },
                    {
                        type: "input",
                        id: "last-name",
                        name: "lastName",
                        label: "Last name",
                        placeholder: "Doe",
                        validation: {
                            required: true,
                            minLength: 2,
                            maxLength: 50,
                            requiredMessage: "Last name is required",
                        },
                    },
                ],
            },
            {
                type: "checkbox",
                id: "newsletter",
                name: "newsletter",
                label: "Subscribe to newsletter",
                description: "Receive product updates by email",
            },
            {
                type: "select",
                id: "email-frequency",
                name: "emailFrequency",
                label: "Email frequency",
                condition: "newsletter === true",
                options: [
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                ],
            },
            {
                type: "radio-group",
                id: "account-type",
                name: "accountType",
                label: "Account type",
                defaultValue: "personal",
                options: [
                    { value: "personal", label: "Personal" },
                    { value: "business", label: "Business" },
                ],
            },
            {
                type: "input",
                id: "company-name",
                name: "companyName",
                label: "Company name",
                placeholder: "Acme Inc.",
                condition: "form.accountType === 'business'",
                validation: {
                    required: true,
                    minLength: 2,
                    requiredMessage: "Company name is required for business accounts",
                },
            },
            {
                type: "switch",
                id: "notifications",
                name: "notifications",
                label: "Enable notifications",
                description: "Push alerts for important events",
            },
            {
                type: "repeatable",
                id: "phone-numbers",
                name: "phoneNumbers",
                label: "Phone numbers",
                addButtonLabel: "Add phone",
                validation: {
                    required: true,
                    minItems: 1,
                    minItemsMessage: "Add at least one phone number",
                },
                fields: [
                    {
                        type: "input",
                        name: "label",
                        label: "Label",
                        placeholder: "Home",
                        required: true,
                    },
                    {
                        type: "input",
                        name: "number",
                        label: "Number",
                        placeholder: "+1 555-0000",
                        required: true,
                    },
                ],
            },
            {
                type: "repeatable",
                id: "skills",
                name: "skills",
                label: "Skills",
                addButtonLabel: "Add skill",
                validation: {
                    required: true,
                    minItems: 1,
                    minItemsMessage: "Add at least one skill",
                },
                fields: [
                    {
                        type: "input",
                        name: "name",
                        label: "Skill",
                        placeholder: "TypeScript",
                        required: true,
                    },
                    {
                        type: "select",
                        name: "level",
                        label: "Level",
                        placeholder: "Select level",
                        required: true,
                        options: [
                            { value: "beginner", label: "Beginner" },
                            { value: "intermediate", label: "Intermediate" },
                            { value: "advanced", label: "Advanced" },
                            { value: "expert", label: "Expert" },
                        ],
                    },
                ],
            },
            {
                type: "button",
                id: "save",
                label: "Save profile",
                buttonType: "submit",
                variant: "default",
            },
        ],
    },
];
