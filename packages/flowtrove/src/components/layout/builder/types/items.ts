import type { CSSProperties } from "react";
import type { AlertDialogItem, AlertDialogTriggerItem, AlertDialogContentItem, AlertDialogHeaderItem, AlertDialogTitleItem, AlertDialogDescriptionItem, AlertDialogFooterItem } from "../renders/alert-dialog/types";
import type { AvatarItem } from "../renders/avatar/types";
import type { BadgeItem } from "../renders/badge/types";
import type { BreadcrumbItem } from "../renders/breadcrumb/types";
import type { ButtonItem } from "../renders/button/types";
import type { ButtonGroupItem } from "../renders/button-group/types";
import type { CalendarItem } from "../renders/calendar/types";
import type { CardItem, CardActionItem, CardContentItem, CardDescriptionItem, CardTitleItem, CardFooterItem, CardHeaderItem } from "../renders/card/types";
import type { CheckboxItem } from "../renders/checkbox/types";
import type { CollapsibleItem, CollapsibleTriggerItem, CollapsibleContentItem } from "../renders/collapsible/types";
import type { ComboboxItem } from "../renders/combobox/types";
import type { CommandItem } from "../renders/command/types";
import type { ContentItem } from "../renders/content/types";
import type { DialogItem, DialogTriggerItem, DialogContentItem, DialogHeaderItem, DialogTitleItem, DialogDescriptionItem, DialogFooterItem } from "../renders/dialog/types";
import type { DivItem } from "../renders/div/types";
import type { DropdownMenuItem } from "../renders/dropdown-menu/types";
import type { FormItem } from "../renders/form/types";
import type { IconItem } from "../renders/icon/types";
import type { InputItem } from "../renders/input/types";
import type { InputGroupItem } from "../renders/input-group/types";
import type { ItemListItem } from "../renders/item-list/types";
import type { LabelItem } from "../renders/label/types";
import type { LongTextItem } from "../renders/long-text/types";
import type { MultiSelectItem } from "../renders/multi-select/types";
import type { PaginationItem } from "../renders/pagination/types";
import type { PasswordInputItem } from "../renders/password-input/types";
import type { PopoverItem, PopoverTriggerItem, PopoverContentItem } from "../renders/popover/types";
import type { ProgressItem } from "../renders/progress/types";
import type { RadioGroupItem } from "../renders/radio-group/types";
import type { RepeatableItem } from "../renders/repeatable/types";
import type { RsAsyncItem } from "../renders/rs-async/types";
import type { RsCreatableItem } from "../renders/rs-creatable/types";
import type { RsFixedItem } from "../renders/rs-fixed/types";
import type { ScrollAreaItem } from "../renders/scroll-area/types";
import type { SelectItem } from "../renders/select/types";
import type { SeparatorItem } from "../renders/separator/types";
import type { SheetItem, SheetTriggerItem, SheetContentItem, SheetHeaderItem, SheetTitleItem, SheetDescriptionItem, SheetFooterItem } from "../renders/sheet/types";
import type { SkeletonItem } from "../renders/skeleton/types";
import type { SliderItem } from "../renders/slider/types";
import type { SonnerItem } from "../renders/sonner/types";
import type { SwitchItem } from "../renders/switch/types";
import type { TableItem, TableHeaderItem, TableBodyItem, TableRowItem, TableHeadItem, TableCellItem, TableFooterItem } from "../renders/table/types";
import type { TabsItem, TabsListItem, TabsTriggerItem, TabsContentItem } from "../renders/tabs/types";
import type { TextareaItem } from "../renders/textarea/types";
import type { TimelineItem } from "../renders/timeline/types";
import type { ToggleItem } from "../renders/toggle/types";
import type { ToggleGroupLayoutItem, ToggleGroupMemberItem } from "../renders/toggle-group/types";
import type { TooltipItem, TooltipTriggerItem, TooltipContentItem } from "../renders/tooltip/types";

export type LayoutBuilderItem =
  | AlertDialogItem
  | AlertDialogTriggerItem
  | AlertDialogContentItem
  | AlertDialogHeaderItem
  | AlertDialogTitleItem
  | AlertDialogDescriptionItem
  | AlertDialogFooterItem
  | AvatarItem
  | BadgeItem
  | BreadcrumbItem
  | ButtonItem
  | ButtonGroupItem
  | CalendarItem
  | CardItem
  | CardActionItem
  | CardContentItem
  | CardDescriptionItem
  | CardTitleItem
  | CardFooterItem
  | CardHeaderItem
  | CheckboxItem
  | CollapsibleItem
  | CollapsibleTriggerItem
  | CollapsibleContentItem
  | ComboboxItem
  | CommandItem
  | ContentItem
  | DialogItem
  | DialogTriggerItem
  | DialogContentItem
  | DialogHeaderItem
  | DialogTitleItem
  | DialogDescriptionItem
  | DialogFooterItem
  | DivItem
  | DropdownMenuItem
  | FormItem
  | IconItem
  | InputItem
  | InputGroupItem
  | ItemListItem
  | LabelItem
  | LongTextItem
  | MultiSelectItem
  | PaginationItem
  | PasswordInputItem
  | PopoverItem
  | PopoverTriggerItem
  | PopoverContentItem
  | ProgressItem
  | RadioGroupItem
  | RepeatableItem
  | RsAsyncItem
  | RsCreatableItem
  | RsFixedItem
  | ScrollAreaItem
  | SelectItem
  | SeparatorItem
  | SheetItem
  | SheetTriggerItem
  | SheetContentItem
  | SheetHeaderItem
  | SheetTitleItem
  | SheetDescriptionItem
  | SheetFooterItem
  | SkeletonItem
  | SliderItem
  | SonnerItem
  | SwitchItem
  | TableItem
  | TableHeaderItem
  | TableBodyItem
  | TableRowItem
  | TableHeadItem
  | TableCellItem
  | TableFooterItem
  | TabsItem
  | TabsListItem
  | TabsTriggerItem
  | TabsContentItem
  | TextareaItem
  | TimelineItem
  | ToggleItem
  | ToggleGroupLayoutItem
  | ToggleGroupMemberItem
  | TooltipItem
  | TooltipTriggerItem
  | TooltipContentItem;

/** Items that have a form field name */
export type FormFieldItem =
    | InputItem
    | PasswordInputItem
    | TextareaItem
    | SelectItem
    | CheckboxItem
    | SwitchItem
    | SliderItem
    | RadioGroupItem
    | MultiSelectItem
    | ComboboxItem
    | RsFixedItem
    | RsAsyncItem
    | RsCreatableItem
    | RepeatableItem;

export type { BaseLayoutItem, ContainerItem, LayoutBuilderChildItem } from "./base-layout";
