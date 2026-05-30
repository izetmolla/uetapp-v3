import type { BaseLayoutItem, LayoutBuilderChildItem } from "../../types/base-layout";

export type TableItem = BaseLayoutItem & { type: "table"; children?: LayoutBuilderChildItem[] };
export type TableHeaderItem = BaseLayoutItem & { type: "table-header"; children?: LayoutBuilderChildItem[] };
export type TableBodyItem = BaseLayoutItem & { type: "table-body"; children?: LayoutBuilderChildItem[] };
export type TableRowItem = BaseLayoutItem & { type: "table-row"; children?: LayoutBuilderChildItem[] };
export type TableHeadItem = BaseLayoutItem & { type: "table-head"; text: string };
export type TableCellItem = BaseLayoutItem & { type: "table-cell"; text?: string; children?: LayoutBuilderChildItem[] };
export type TableFooterItem = BaseLayoutItem & { type: "table-footer"; children?: LayoutBuilderChildItem[] };
