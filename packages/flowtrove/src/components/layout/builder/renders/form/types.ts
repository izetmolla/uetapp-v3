import type { BaseLayoutItem, LayoutBuilderChildItem } from "../../types/base-layout";

/**
 * Form – form container
 * | Element | Item prop(s)  | Notes          |
 * |---------|---------------|----------------|
 * | Root    | className, style | BaseLayoutItem |
 */
export type FormItem = BaseLayoutItem & {
    type: "form";
    /** Form children */
    children: LayoutBuilderChildItem[];
    /** HTML `name` on the root form element (identifies the form in the document). */
    name?: string;
    /** Key from designer config.forms_fields to bind this form to; when set, field names are restricted to that config. */
    formConfigKey?: string;
    /** Key on layout `data` whose object pre-fills named fields (merged over JSON defaults). */
    source?: string;
    /** Static values merged over field defaults when live `data[source]` is absent. */
    value?: Record<string, unknown>;
    /** Form action URL */
    action?: string;
    /** HTTP method */
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    /** Encoding type */
    encType?: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain";
    /** Behaviour after submit */
    onSubmitAction?: "reset" | "redirect" | "none";
    /** Redirect URL (when onSubmitAction is "redirect") */
    redirectUrl?: string;
    /** Show success toast on submit */
    showSuccessToast?: boolean;
    /** Success toast message */
    successMessage?: string;
    /** Show server/validation errors as toast instead of inline banner */
    showErrorAsToast?: boolean;
    className?: string;
};
