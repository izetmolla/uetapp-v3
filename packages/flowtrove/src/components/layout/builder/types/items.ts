import type { CSSProperties } from "react";
import type { DivItem } from "../renders/div";
import type { ButtonItem } from "../renders/button";
import type { CardItem, CardHeaderItem, CardTitleItem, CardDescriptionItem, CardActionItem, CardContentItem, CardFooterItem } from "../renders/card/types";
import type {
    DialogItem,
    DialogTriggerItem,
    DialogContentItem,
    DialogHeaderItem,
    DialogTitleItem,
    DialogDescriptionItem,
    DialogFooterItem,
} from "../renders/dialog/types";

// import type { AlertItem } from "../renders/alert/types";
// import type { DivItem } from "../renders/div/types";
// import type { HeadingItem } from "../renders/heading/types";
// import type { ButtonItem } from "../renders/button/types";
// import type { CardItem } from "../renders/card/types";
// import type {
//   ButtonGroupItem,
//   ButtonGroupSeparatorItem,
//   ButtonGroupTextItem,
// } from "../renders/button-group/types";
// import type { CalendarItem } from "../renders/calendar/types";
// import type { CollapsibleItem } from "../renders/collapsible/types";
// import type { InputItem } from "../renders/input/types";
// import type {
//   InputGroupItem,
//   InputGroupInputItem,
//   InputGroupAddonItem,
//   InputGroupTextItem,
//   InputGroupButtonItem,
// } from "../renders/input-group/types";
// import type { ComboboxItem } from "../renders/combobox/types";
// import type { CommandItem } from "../renders/command/types";
// import type { ContextMenuItem } from "../renders/context-menu/types";
// import type { DataTableItem } from "../renders/data-table/types";
// import type { DialogItem } from "../renders/dialog/types";
// import type { DirectionItem } from "../renders/direction/types";
// import type { DrawerItem } from "../renders/drawer/types";
// import type { DropdownMenuItem } from "../renders/dropdown-menu/types";
// import type { EmptyItem } from "../renders/empty/types";
// import type { FieldItem } from "../renders/field/types";
// import type { HoverCardItem } from "../renders/hover-card/types";
// import type { AccordionItem } from "../renders/accordion/types";
// import type { AlertDialogItem } from "../renders/alert-dialog/types";
// import type { AspectRatioItem } from "../renders/aspect-ratio/types";
// import type { AvatarItem } from "../renders/avatar/types";
// import type { BadgeItem } from "../renders/badge/types";
// import type { BreadcrumbItem } from "../renders/breadcrumb/types";
// import type { CarouselItem } from "../renders/carousel/types";
// import type { CheckboxItem } from "../renders/checkbox/types";
// import type { InputOTPItem } from "../renders/input-otp/types";
// import type { KbdItem } from "../renders/kbd/types";
// import type { MultiSelectItem } from "../renders/multi-select/types";
// import type { NativeSelectItem } from "../renders/native-select/types";
// import type { PaginationItem } from "../renders/pagination/types";
// import type { PopoverItem } from "../renders/popover/types";
// import type { ProgressItem } from "../renders/progress/types";
// import type { RadioGroupItem } from "../renders/radio-group/types";
// import type { ResizableItem } from "../renders/resizable/types";
// import type { ScrollAreaItem } from "../renders/scroll-area/types";
// import type { SelectItem } from "../renders/select/types";
// import type { SeparatorItem } from "../renders/separator/types";
// import type { SheetItem } from "../renders/sheet/types";
// import type { SkeletonItem } from "../renders/skeleton/types";
// import type { SliderItem } from "../renders/slider/types";
// import type { SpinnerItem } from "../renders/spinner/types";
// import type { SwitchItem } from "../renders/switch/types";
// import type { TabsItem } from "../renders/tabs/types";
// import type { TextareaItem } from "../renders/textarea/types";
// import type { ToggleItem } from "../renders/toggle/types";
// import type { ToggleGroupItem } from "../renders/toggle-group/types";
// import type { TooltipItem } from "../renders/tooltip/types";
// import type { ChartItem } from "../renders/chart/types";
// import type { DatePickerItem } from "../renders/date-picker/types";
// import type { ItemItem } from "../renders/item/types";
// import type { ItemListItem } from "../renders/itemlist/types";
// import type { MenubarItem } from "../renders/menubar/types";
// import type { NavigationMenuItem } from "../renders/navigation-menu/types";
// import type { SonnerItem } from "../renders/sonner/types";
// import type { ToastItem } from "../renders/toast/types";
// import type { TypographyItem } from "../renders/typography/types";
// import type { FetchOptions } from ".";
// import type { FormItem } from "../renders/form/types";
// import type { StepsItem } from "../renders/steps/types";
// import type { RepeatableItem } from "../renders/repeatable/types";
// import type { FieldValidation } from "./form-validations";
// import type { RsAsyncItem } from "../renders/rs-async/types";
// import type { RsCreatableItem } from "../renders/rs-creatable/types";
// import type { RsFixedOptionsItem } from "../renders/rs-fixed/types";
// import type { Content } from "../renders/content/types";
// import type { ContentItemsItem } from "../renders/content-items/types";
// import type { LinkItem } from "../renders/link/types";
// import type { QrBarcodeScannerItem } from "../renders/qr-barcode-scanner/types";


// ============================================================================
// BASE TYPES
// ============================================================================

/** Base properties shared by all layout items */
export type BaseLayoutItem = {
  /** Discriminant for the item kind (e.g. "div"). Required on all layout items. */
  type: string;
  /** Unique identifier for the item (optional, auto-generated if not provided). */
  id: string;
  /** Optional Tailwind classes applied to the outer wrapper. */
  className?: string;
  /** Optional inline styles applied to the outer wrapper. */
  style?: CSSProperties;
  /** Conditional rendering expression (e.g., "data.showSection === true"). */
  condition?: string;
  /** When true, item cannot be changed, deleted, or modified in the designer; unlock via Layers context menu. */
  locked?: boolean;
  /** Fetch options for the item. */
  // fetchOptions?: FetchOptions;
};


/** Base properties for items that can contain children */
export type ContainerItem = BaseLayoutItem & {
  children?: LayoutBuilderItem[];
};




export type LayoutBuilderItem =
  | DivItem
  | ButtonItem
  | CardItem | CardHeaderItem | CardTitleItem | CardDescriptionItem | CardActionItem | CardContentItem | CardFooterItem
  | DialogItem
  | DialogTriggerItem
  | DialogContentItem
  | DialogHeaderItem
  | DialogTitleItem
  | DialogDescriptionItem
  | DialogFooterItem
// Layout containers (concrete types only — `ContainerItem` is a structural base, not a union member,
// or `type: string` breaks discriminated narrowing on `item.type`)
// | QrBarcodeScannerItem
// | Content
// | ContentItemsItem
// | LinkItem
// | AlertItem
// | DivItem
// | HeadingItem
// | ButtonItem
// | CardItem
// | ButtonGroupItem
// | ButtonGroupSeparatorItem
// | ButtonGroupTextItem
// | CalendarItem
// | CollapsibleItem
// | InputItem
// | InputGroupItem
// | InputGroupInputItem
// | InputGroupAddonItem
// | InputGroupTextItem
// | InputGroupButtonItem
// | ComboboxItem
// | CommandItem
// | ContextMenuItem
// | DataTableItem
// | DialogItem
// | DirectionItem
// | DrawerItem
// | DropdownMenuItem
// | EmptyItem
// | FieldItem
// | HoverCardItem
// | AccordionItem
// | AlertDialogItem
// | AspectRatioItem
// | AvatarItem
// | BadgeItem
// | BreadcrumbItem
// | CarouselItem
// | CheckboxItem
// | InputOTPItem
// | KbdItem
// | MultiSelectItem
// | NativeSelectItem
// | PaginationItem
// | PopoverItem
// | ProgressItem
// | RadioGroupItem
// | ResizableItem
// | RsAsyncItem
// | RsCreatableItem
// | RsFixedOptionsItem
// | ScrollAreaItem
// | SelectItem
// | SeparatorItem
// | SheetItem
// | SkeletonItem
// | SliderItem
// | SpinnerItem
// | SwitchItem
// | TabsItem
// | TextareaItem
// | ToggleItem
// | ToggleGroupItem
// | TooltipItem
// | ChartItem
// | DatePickerItem
// | ItemItem
// | ItemListItem
// | MenubarItem
// | NavigationMenuItem
// | SonnerItem
// | ToastItem
// | TypographyItem
// | FormItem
// | StepsItem
// | RepeatableItem




/** Items that have a form field name */
export type FormFieldItem =
  | unknown
// | InputItem
// // | PasswordInputItem
// | TextareaItem
// | SelectItem
// | CheckboxItem
// | RadioGroupItem
// | RsAsyncItem
// | RsCreatableItem
// | RsFixedOptionsItem
// | SwitchItem
// | MultiSelectItem
// | ComboboxItem
// | RepeatableItem
// | RsAsyncItem
// | RsCreatableItem
// | RsFixedOptionsItem
// | FileUploadItem;