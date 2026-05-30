import type { ContainerItem } from "../../types/base-layout";


/**
 * Button – maps to shadcn Button (single element, no nested slots)
 * | Shadcn element | Item prop(s)     | Notes          |
 * |----------------|------------------|----------------|
 * | Root           | className, style | BaseLayoutItem |
 * | Button         | label, variant, size, disabled, action, icon, iconPosition |
 */
export type ButtonItem = ContainerItem & {
    type: "button";
    /** Button label */
    label: string;
    /** Button type */
    buttonType?: "submit" | "button" | "reset";
    /** Button variant */
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    /** Button size */
    size?: "default" | "sm" | "lg" | "icon";
    /** Icon name (lucide icon) */
    icon?: string;
    /** Icon position */
    iconPosition?: "left" | "right";
    /** Disabled state */
    disabled?: boolean;
    /** Action on click (event name or URL) */
    action?: string;
    /** Optional parameters forwarded to `onAction` as `detail.params`. */
    actionParams?: Record<string, unknown>;
    /**
     * Declarative actions for any `<button>` DOM handler (`onClick`, `onFocus`, …).
     * Overrides the legacy `action` / `actionParams` for `onClick` when `onClick` is set here.
     */
};