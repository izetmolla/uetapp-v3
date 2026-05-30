"use client"

import * as React from "react"
import RawSelect, {
    components as defaultComponents,
    mergeStyles,
    type ClassNamesConfig,
    type ClearIndicatorProps,
    type DropdownIndicatorProps,
    type GroupBase,
    type LoadingIndicatorProps,
    type MenuListProps,
    type MultiValueRemoveProps,
    type OptionProps,
    type Props as ReactSelectProps,
    type SelectComponentsConfig,
    type SelectInstance,
    type StylesConfig,
} from "react-select"
import { CheckIcon, ChevronDownIcon, Loader2Icon, XIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

type Size = "sm" | "default"

/** z-index above Radix `Dialog` / `Sheet` (z-50) and aligned with `SelectContent` (z-110). */
const REACT_SELECT_MENU_Z_INDEX = 110

/**
 * Portal target for the dropdown menu. Prefer the Radix dialog portal root so
 * the menu stays outside `inert` / `aria-hidden` siblings while not being
 * clipped by `overflow-hidden` on `[data-slot=dialog-content]`.
 */
export function resolveReactSelectMenuPortalTarget(
    explicit?: HTMLElement | null,
): HTMLElement | null {
    if (typeof document === "undefined") return null
    if (explicit !== undefined) return explicit

    const dialogContent = document.querySelector("[data-slot=dialog-content]")
    const portalParent = dialogContent?.parentElement
    if (portalParent instanceof HTMLElement) {
        return portalParent
    }

    return document.body
}

/**
 * Convenience type that extracts the primitive `value` field from an
 * `Option` shape like `{ label: string; value: "web" | "api" }`.
 */
export type OptionValue<Option> = Option extends { value: infer V }
    ? V
    : string

export interface ReactSelectShadcnProps {
    /** Visual size matching the rest of the design system. */
    size?: Size
    /** Render the destructive border/ring when the field is invalid. */
    invalid?: boolean
    /**
     * When true, menu options wrap to multiple lines so long labels are fully
     * readable instead of truncated with an ellipsis.
     */
    wrapOptionText?: boolean
}

/**
 * Lets consumers bind by primitive value (`"web"`) instead of the full
 * `Option` object (`{ label, value: "web" }`). The wrapper resolves it
 * against `options` via `getOptionValue` (defaults to `(o) => o.value`).
 *
 * - `value` accepts either the native `Option` (array in multi mode) or the
 *   primitive `value` field — pick whichever is more convenient at the call
 *   site. `null` clears the selection.
 * - `onValueChange` is a convenience callback that fires with the primitive
 *   value(s); use it instead of (or alongside) native `onChange`.
 */
export type ReactSelectKeyApi<Option, IsMulti extends boolean> =
    IsMulti extends true
        ? {
              value?:
                  | ReadonlyArray<Option>
                  | ReadonlyArray<OptionValue<Option>>
                  | null
              onValueChange?: (
                  value: ReadonlyArray<OptionValue<Option>>,
              ) => void
          }
        : {
              value?: Option | OptionValue<Option> | null
              onValueChange?: (value: OptionValue<Option> | null) => void
          }

export type ReactSelectComponentProps<
    Option = unknown,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
> = Omit<ReactSelectProps<Option, IsMulti, Group>, "value"> &
    ReactSelectShadcnProps &
    ReactSelectKeyApi<Option, IsMulti> & {
        ref?: React.Ref<SelectInstance<Option, IsMulti, Group>>
    }

/**
 * Shared, theme-aware Tailwind classNames for every inner react-select slot.
 * Works in light and dark mode via the standard `dark:` variant because the
 * inner DOM is rendered inside the document root that carries the `dark` class.
 */
export function reactSelectClassNames<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
>({
    size = "default",
    invalid = false,
    wrapOptionText = false,
}: ReactSelectShadcnProps = {}): ClassNamesConfig<Option, IsMulti, Group> {
    return {
        container: () => "w-full min-w-0",
        // Mirrors `SelectTrigger` 1:1 so a `ReactSelect` placed next to a
        // shadcn `Select` or `Input` reads as the same control: same height,
        // typography (`text-sm`), asymmetric padding (`ps-2.5 pe-2`), border,
        // focus ring, disabled bg, invalid + dark states.
        control: ({ isFocused, isDisabled }) =>
            cn(
                "flex w-full gap-1.5 rounded-lg border border-input bg-transparent text-sm transition-colors outline-none",
                wrapOptionText ? "items-start" : "items-center whitespace-nowrap",
                size === "sm"
                    ? "min-h-7 rounded-[min(var(--radius-md),10px)] ps-2.5 pe-2 py-0.5"
                    : "min-h-8 ps-2.5 pe-2 py-1",
                wrapOptionText && (size === "sm" ? "py-1" : "py-1.5"),
                isDisabled &&
                    "pointer-events-none cursor-not-allowed bg-input/50 opacity-50 dark:bg-input/80",
                isFocused &&
                    !invalid &&
                    "border-ring ring-3 ring-ring/50",
                invalid &&
                    "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
                "dark:bg-input/30 dark:hover:bg-input/50",
            ),
        // Reset internal padding so `control`'s px-2.5 owns horizontal spacing.
        valueContainer: () =>
            "flex min-w-0 flex-1 flex-wrap items-center gap-1 px-0 py-0",
        placeholder: () => "text-muted-foreground",
        singleValue: () =>
            cn(
                "text-foreground",
                wrapOptionText && "whitespace-normal break-words leading-snug",
            ),
        // Inherit text size from `control`; just reset the inner <input> styles
        // that react-select would otherwise leave unstyled in user agents.
        input: () =>
            "py-0 text-foreground caret-foreground [&_input]:outline-none [&_input]:focus:ring-0 [&_input]:focus:outline-none",
        multiValue: () =>
            "inline-flex items-center gap-1 rounded-md border border-border bg-secondary py-0.5 ps-1.5 pe-0.5 text-xs text-secondary-foreground",
        multiValueLabel: () => "text-secondary-foreground",
        multiValueRemove: () =>
            "flex size-4 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
        indicatorsContainer: () =>
            "flex items-center gap-0.5 self-stretch",
        indicatorSeparator: () =>
            "mx-1 w-px self-stretch min-h-0 bg-border",
        dropdownIndicator: ({ isFocused }) =>
            cn(
                "flex size-5 items-center justify-center rounded-sm text-muted-foreground transition-colors",
                isFocused && "text-foreground",
            ),
        clearIndicator: ({ isFocused }) =>
            cn(
                "flex size-5 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-destructive",
                isFocused && "text-foreground",
            ),
        loadingIndicator: () =>
            "flex size-5 items-center justify-center text-muted-foreground",
        loadingMessage: () =>
            "py-2 text-center text-sm text-muted-foreground",
        // Mirrors `SelectContent`.
        menu: () =>
            cn(
                "mt-1 overflow-visible rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10",
                wrapOptionText
                    ? "max-w-[min(100vw-2rem,28rem)]"
                    : "min-w-36",
            ),
        menuList: () =>
            cn(
                "group/rs-menulist max-h-64 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y p-1",
                wrapOptionText && "max-h-72",
            ),
        menuPortal: () => "z-[110] pointer-events-auto",
        group: () => "py-1",
        // Mirrors `SelectLabel`.
        groupHeading: () => "px-1.5 py-1 text-xs text-muted-foreground",
        // Mirrors `SelectItem` 1:1 (same gap, padding, typography, rounded).
        // Highlight is driven by CSS `:hover` instead of react-select's
        // `isFocused` so the background clears the moment the cursor leaves
        // the option (otherwise the last-hovered option stays "stuck" because
        // react-select keeps `isFocused` on it). When another option in the
        // same menu list is being hovered, the selected option drops its
        // accent background so only one row reads as active.
        option: ({ isSelected, isDisabled }) =>
            cn(
                "relative flex cursor-pointer gap-1.5 rounded-md ps-1.5 pe-1.5 py-1 text-sm select-none outline-hidden transition-colors",
                wrapOptionText ? "items-start py-2" : "items-center",
                !isDisabled &&
                    "hover:bg-accent hover:text-accent-foreground",
                isSelected &&
                    "bg-accent text-accent-foreground font-medium group-has-[[role=option]:hover]/rs-menulist:not-hover:bg-transparent group-has-[[role=option]:hover]/rs-menulist:not-hover:text-popover-foreground group-has-[[role=option]:hover]/rs-menulist:not-hover:font-normal",
                isDisabled && "pointer-events-none cursor-not-allowed opacity-50",
            ),
        noOptionsMessage: () =>
            "py-2 text-center text-sm text-muted-foreground",
    }
}

function DropdownIndicator<
    Option,
    IsMulti extends boolean,
    Group extends GroupBase<Option>,
>(props: DropdownIndicatorProps<Option, IsMulti, Group>) {
    return (
        <defaultComponents.DropdownIndicator {...props}>
            <ChevronDownIcon aria-hidden className="size-4" />
        </defaultComponents.DropdownIndicator>
    )
}

function ClearIndicator<
    Option,
    IsMulti extends boolean,
    Group extends GroupBase<Option>,
>(props: ClearIndicatorProps<Option, IsMulti, Group>) {
    return (
        <defaultComponents.ClearIndicator {...props}>
            <XIcon aria-hidden className="size-3.5" />
        </defaultComponents.ClearIndicator>
    )
}

function MultiValueRemove<
    Option,
    IsMulti extends boolean,
    Group extends GroupBase<Option>,
>(props: MultiValueRemoveProps<Option, IsMulti, Group>) {
    return (
        <defaultComponents.MultiValueRemove {...props}>
            <XIcon aria-hidden className="size-3" />
        </defaultComponents.MultiValueRemove>
    )
}

function LoadingIndicator<
    Option,
    IsMulti extends boolean,
    Group extends GroupBase<Option>,
>(props: LoadingIndicatorProps<Option, IsMulti, Group>) {
    return (
        <defaultComponents.LoadingIndicator {...props}>
            <Loader2Icon aria-hidden className="size-3.5 animate-spin" />
        </defaultComponents.LoadingIndicator>
    )
}

function createOptionComponent<
    Option,
    IsMulti extends boolean,
    Group extends GroupBase<Option>,
>(wrapOptionText: boolean) {
    return function Option(props: OptionProps<Option, IsMulti, Group>) {
        return (
            <defaultComponents.Option {...props}>
                <span
                    className={cn(
                        "min-w-0 flex-1 text-left",
                        wrapOptionText
                            ? "whitespace-normal break-words leading-snug"
                            : "truncate",
                    )}
                >
                    {props.children}
                </span>
                {props.isSelected ? (
                    <CheckIcon
                        aria-hidden
                        className={cn(
                            "size-3.5 shrink-0 text-current",
                            wrapOptionText && "mt-0.5",
                        )}
                    />
                ) : null}
            </defaultComponents.Option>
        )
    }
}

const Option = createOptionComponent(false)

function MenuList<
    Option,
    IsMulti extends boolean,
    Group extends GroupBase<Option>,
>(props: MenuListProps<Option, IsMulti, Group>) {
    const { innerProps, ...rest } = props
    return (
        <defaultComponents.MenuList
            {...rest}
            innerProps={{
                ...innerProps,
                onWheel: (event) => {
                    event.stopPropagation()
                    innerProps?.onWheel?.(event)
                },
            }}
        />
    )
}

/**
 * Default `components` overrides used by the shadcn-styled wrappers.
 * Spread on top with the user-provided `components` to override per-call.
 */
export const reactSelectComponents = {
    DropdownIndicator,
    ClearIndicator,
    MultiValueRemove,
    LoadingIndicator,
    Option,
    MenuList,
}

/**
 * Merge two `ClassNamesConfig` objects so user overrides extend (not replace)
 * the defaults. Each slot becomes `cn(defaultFn(state), overrideFn(state))`.
 */
export function composeClassNames<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
>(
    base: ClassNamesConfig<Option, IsMulti, Group>,
    override?: ClassNamesConfig<Option, IsMulti, Group>,
): ClassNamesConfig<Option, IsMulti, Group> {
    if (!override) return base
    const merged: Record<string, (state: unknown) => string> = {}
    const keys = new Set<string>([
        ...Object.keys(base),
        ...Object.keys(override),
    ])
    for (const key of keys) {
        const a = (base as Record<string, ((s: unknown) => string) | undefined>)[
            key
        ]
        const b = (
            override as Record<string, ((s: unknown) => string) | undefined>
        )[key]
        merged[key] = (state: unknown) => cn(a?.(state), b?.(state))
    }
    return merged as ClassNamesConfig<Option, IsMulti, Group>
}

export function composeComponents<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
>(
    override?: SelectComponentsConfig<Option, IsMulti, Group>,
    options?: Pick<ReactSelectShadcnProps, "wrapOptionText">,
): SelectComponentsConfig<Option, IsMulti, Group> {
    const base =
        options?.wrapOptionText === true
            ? {
                  ...reactSelectComponents,
                  Option: createOptionComponent<
                      Option,
                      IsMulti,
                      Group
                  >(true),
              }
            : reactSelectComponents

    return {
        ...(base as unknown as SelectComponentsConfig<Option, IsMulti, Group>),
        ...(override ?? {}),
    }
}

/**
 * Default `styles` overrides for slots where react-select injects inline
 * Emotion styles that would otherwise beat our Tailwind classes.
 *
 * - `menuPortal`: z-index above Radix `Dialog`/`Sheet` and `pointer-events:
 *   auto`. The menu is portaled via `resolveReactSelectMenuPortalTarget` into
 *   the open dialog's portal root (not `document.body`) so it is not `inert`.
 * - `option`: always gets `display: block` from react-select even in
 *   `unstyled` mode, which would stack the children of our overridden Option
 *   component vertically. Force a horizontal flex row so the label and the
 *   selection check icon sit side-by-side.
 * - `control`: react-select bakes in `min-height: 38px` from its default
 *   theme `spacing.controlHeight` regardless of `unstyled`. Override to the
 *   shadcn control height (`h-8` = 32px / `h-7` = 28px) so a `ReactSelect`
 *   sits at the same height as `Input` / `SelectTrigger` in the same form.
 */
export function reactSelectStyles<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
>({
    size = "default",
    wrapOptionText = false,
}: ReactSelectShadcnProps = {}): StylesConfig<Option, IsMulti, Group> {
    return {
        menuPortal: (base) => ({
            ...base,
            zIndex: REACT_SELECT_MENU_Z_INDEX,
            pointerEvents: "auto",
        }),
        menuList: (base) => ({
            ...base,
            maxHeight: wrapOptionText ? "18rem" : "16rem",
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            pointerEvents: "auto",
        }),
        menu: (base) =>
            wrapOptionText
                ? {
                      ...base,
                      width: "max-content",
                      minWidth: "100%",
                      maxWidth: "min(100vw - 2rem, 28rem)",
                  }
                : base,
        option: (base) => ({
            ...base,
            display: "flex",
            alignItems: wrapOptionText ? "flex-start" : "center",
            gap: "0.375rem",
            cursor: "pointer",
            width: "100%",
            ...(wrapOptionText
                ? {
                      whiteSpace: "normal",
                      overflow: "visible",
                      textOverflow: "unset",
                  }
                : {}),
        }),
        singleValue: (base) =>
            wrapOptionText
                ? {
                      ...base,
                      whiteSpace: "normal",
                      overflow: "visible",
                      textOverflow: "unset",
                      position: "relative",
                      transform: "none",
                      maxWidth: "100%",
                  }
                : base,
        control: (base) => ({
            ...base,
            minHeight: size === "sm" ? "1.75rem" : "2rem",
            ...(wrapOptionText ? { height: "auto" } : {}),
        }),
    }
}

function defaultGetOptionValue(option: unknown): string {
    return String((option as { value?: unknown })?.value ?? "")
}

function isOptionValuePrimitive(v: unknown): v is string | number {
    return typeof v === "string" || typeof v === "number"
}

/** Flatten `OptionsOrGroups` (which may contain `{ options }` groups) to a flat array. */
export function flattenOptions<Option, Group extends GroupBase<Option>>(
    options: ReadonlyArray<Option | Group> | undefined,
): Option[] {
    if (!options) return []
    const out: Option[] = []
    for (const entry of options) {
        if (
            entry &&
            typeof entry === "object" &&
            "options" in entry &&
            Array.isArray((entry as Group).options)
        ) {
            out.push(...((entry as Group).options as readonly Option[]))
        } else {
            out.push(entry as Option)
        }
    }
    return out
}

/**
 * Normalize the wrapper's `value` prop into the shape react-select expects.
 *
 * Accepts either the native `Option` (or array of them in multi mode) or a
 * primitive (or array of primitives) — primitives are matched against
 * `options` via `getOptionValue` (defaults to `(o) => o.value`). Anything
 * that already looks like an `Option` object is passed through unchanged.
 */
export function resolveValue<Option, Group extends GroupBase<Option>>(
    rawValue: unknown,
    options: ReadonlyArray<Option | Group> | undefined,
    isMulti: boolean | undefined,
    getOptionValue?: (option: Option) => string,
): Option | readonly Option[] | null | undefined {
    if (rawValue == null) return rawValue as null | undefined

    const getter = (getOptionValue ??
        (defaultGetOptionValue as unknown as (o: Option) => string)) as (
        o: Option,
    ) => string

    if (Array.isArray(rawValue)) {
        if (rawValue.length === 0) return rawValue as readonly Option[]
        const flat = flattenOptions<Option, Group>(options)
        return rawValue
            .map((entry) =>
                isOptionValuePrimitive(entry)
                    ? flat.find((o) => getter(o) === String(entry))
                    : (entry as Option),
            )
            .filter((o): o is Option => !!o)
    }

    if (isOptionValuePrimitive(rawValue)) {
        const flat = flattenOptions<Option, Group>(options)
        const found =
            flat.find((o) => getter(o) === String(rawValue)) ?? null
        if (isMulti) return found ? [found] : []
        return found
    }

    return rawValue as Option
}

/** Convert a react-select `onChange` payload back into a primitive (or array). */
export function extractValueFromChange<Option>(
    value: unknown,
    getOptionValue?: (option: Option) => string,
): unknown {
    const getter = (getOptionValue ??
        (defaultGetOptionValue as unknown as (o: Option) => string)) as (
        o: Option,
    ) => string
    if (value == null) return null
    if (Array.isArray(value)) return value.map((o) => getter(o as Option))
    return getter(value as Option)
}

/**
 * shadcn-styled wrapper around the default `react-select` component.
 *
 * All native react-select props are forwarded (options, onChange, isMulti,
 * isDisabled, isClearable, isSearchable, isLoading, closeMenuOnSelect,
 * blurInputOnSelect, captureMenuScroll, controlShouldRenderValue, formatGroupLabel,
 * formatOptionLabel, getOptionLabel, getOptionValue, isOptionDisabled,
 * isOptionSelected, menuPlacement, menuPosition, menuPortalTarget,
 * menuShouldBlockScroll, openMenuOnFocus, openMenuOnClick, hideSelectedOptions,
 * filterOption, noOptionsMessage, loadingMessage, ariaLiveMessages,
 * tabSelectsValue, components, classNames, styles, theme, etc.).
 *
 * - `value` accepts either the native `Option` object or the option's
 *   primitive `value` (e.g. `"web"`); primitives are resolved against
 *   `options` via `getOptionValue` (defaults to `(o) => o.value`).
 * - `onValueChange` is a convenience callback firing with the primitive.
 *   If you also pass native `onChange` it still gets called, so external
 *   state (RHF, telemetry, etc.) keeps working.
 */
export function ReactSelect<
    Option = unknown,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
>(props: ReactSelectComponentProps<Option, IsMulti, Group>) {
    const {
        size = "default",
        invalid,
        wrapOptionText = false,
        classNames,
        components,
        styles,
        unstyled = true,
        value: providedValue,
        onValueChange,
        onChange: providedOnChange,
        options,
        isMulti,
        getOptionValue,
        menuPortalTarget,
        menuPosition,
        menuShouldBlockScroll,
        captureMenuScroll,
        ...rest
    } = props as ReactSelectComponentProps<Option, IsMulti, Group> & {
        onValueChange?: (value: unknown) => void
        onChange?: ReactSelectProps<Option, IsMulti, Group>["onChange"]
    }

    const resolvedMenuPortalTarget = resolveReactSelectMenuPortalTarget(
        menuPortalTarget,
    )
    const resolvedMenuPosition =
        menuPosition ?? (resolvedMenuPortalTarget ? "fixed" : undefined)

    const resolvedValue = resolveValue<Option, Group>(
        providedValue,
        options,
        isMulti as boolean | undefined,
        getOptionValue,
    ) as ReactSelectProps<Option, IsMulti, Group>["value"]

    const resolvedOnChange: ReactSelectProps<
        Option,
        IsMulti,
        Group
    >["onChange"] = onValueChange
        ? (newValue, meta) => {
              onValueChange(
                  extractValueFromChange<Option>(newValue, getOptionValue),
              )
              providedOnChange?.(newValue, meta)
          }
        : providedOnChange

    return (
        <RawSelect<Option, IsMulti, Group>
            unstyled={unstyled}
            classNames={composeClassNames<Option, IsMulti, Group>(
                reactSelectClassNames<Option, IsMulti, Group>({
                    size,
                    invalid,
                    wrapOptionText,
                }),
                classNames,
            )}
            components={composeComponents<Option, IsMulti, Group>(components, {
                wrapOptionText,
            })}
            styles={mergeStyles(
                reactSelectStyles<Option, IsMulti, Group>({
                    size,
                    invalid,
                    wrapOptionText,
                }),
                styles,
            )}
            options={options}
            isMulti={isMulti}
            getOptionValue={getOptionValue}
            value={resolvedValue}
            onChange={resolvedOnChange}
            {...rest}
            menuPortalTarget={resolvedMenuPortalTarget}
            menuPosition={resolvedMenuPosition}
            menuShouldBlockScroll={menuShouldBlockScroll ?? false}
            captureMenuScroll={captureMenuScroll ?? true}
        />
    )
}

export type {
    ClassNamesConfig,
    GroupBase,
    ReactSelectProps,
    SelectComponentsConfig,
    SelectInstance,
}
