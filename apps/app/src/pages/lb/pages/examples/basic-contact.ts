import type { LayoutBuilderItem } from "@workspace/flowtrove/components/layout/builder";

/** Basic contact form — input, textarea, and action buttons inside a card. */
export const basicContactForm: LayoutBuilderItem[] = [
    {
        type: "form",
        id: "basic-contact-form",
        showSuccessToast: true,
        successMessage: "Message sent!",
        onSubmitAction: "reset",
        children: [
            {
                type: "card",
                id: "basic-contact-card",
                title: "Contact us",
                description: "Send a message with your name, email, and a short note.",
                children: [
                    {
                        type: "input",
                        id: "basic-full-name",
                        name: "fullName",
                        label: "Full name",
                        placeholder: "Jane Doe",
                        validation: { required: true },
                    },
                    {
                        type: "input",
                        id: "basic-email",
                        name: "email",
                        label: "Email",
                        inputType: "email",
                        placeholder: "jane@example.com",
                        validation: { required: true, email: true },
                    },
                    {
                        type: "textarea",
                        id: "basic-message",
                        name: "message",
                        label: "Message",
                        placeholder: "How can we help?",
                        rows: 4,
                        validation: { required: true, minLength: 10 },
                    },
                ],
                footer: [
                    {
                        type: "div",
                        id: "basic-actions",
                        className: "flex w-full justify-end gap-2",
                        children: [
                            {
                                type: "button",
                                id: "basic-cancel",
                                label: "Cancel",
                                variant: "outline",
                                buttonType: "button",
                            },
                            {
                                type: "button",
                                id: "basic-submit",
                                label: "Send message",
                                buttonType: "submit",
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
