import type { BaseLayoutItem } from "../../types/base-layout";
import type { LayoutBuilderItem } from "../../types/items";

export type TableItem = BaseLayoutItem & { type: "table"; children?: LayoutBuilderItem[] };
export type TableHeaderItem = BaseLayoutItem & { type: "table-header"; children?: LayoutBuilderItem[] };
export type TableBodyItem = BaseLayoutItem & { type: "table-body"; children?: LayoutBuilderItem[] };
export type TableRowItem = BaseLayoutItem & { type: "table-row"; children?: LayoutBuilderItem[] };
export type TableHeadItem = BaseLayoutItem & { type: "table-head"; text: string };
export type TableCellItem = BaseLayoutItem & { type: "table-cell"; text?: string; children?: LayoutBuilderItem[] };
export type TableFooterItem = BaseLayoutItem & { type: "table-footer"; children?: LayoutBuilderItem[] };
