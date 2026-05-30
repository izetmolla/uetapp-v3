"use client";

import type { FC } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";
import type { LayoutRendererProps } from "../../types";
import type {
    TableBodyItem,
    TableCellItem,
    TableFooterItem,
    TableHeadItem,
    TableHeaderItem,
    TableItem,
    TableRowItem,
} from "./types";

const TableRenderer: FC<LayoutRendererProps<TableItem>> = ({ item, renderItems, path }) => (
    <Table className={cn(item.className)} style={item.style}>
        {renderItems(item.children ?? [], path)}
    </Table>
);

const TableHeaderRenderer: FC<LayoutRendererProps<TableHeaderItem>> = ({ item, renderItems, path }) => (
    <TableHeader className={cn(item.className)}>{renderItems(item.children ?? [], path)}</TableHeader>
);

const TableBodyRenderer: FC<LayoutRendererProps<TableBodyItem>> = ({ item, renderItems, path }) => (
    <TableBody className={cn(item.className)}>{renderItems(item.children ?? [], path)}</TableBody>
);

const TableRowRenderer: FC<LayoutRendererProps<TableRowItem>> = ({ item, renderItems, path }) => (
    <TableRow className={cn(item.className)}>{renderItems(item.children ?? [], path)}</TableRow>
);

const TableHeadRenderer: FC<LayoutRendererProps<TableHeadItem>> = ({ item }) => (
    <TableHead className={cn(item.className)} style={item.style}>{item.text}</TableHead>
);

const TableCellRenderer: FC<LayoutRendererProps<TableCellItem>> = ({ item, renderItems, path }) => (
    <TableCell className={cn(item.className)} style={item.style}>
        {item.text ?? renderItems(item.children ?? [], path)}
    </TableCell>
);

const TableFooterRenderer: FC<LayoutRendererProps<TableFooterItem>> = ({ item, renderItems, path }) => (
    <TableFooter className={cn(item.className)}>{renderItems(item.children ?? [], path)}</TableFooter>
);

export default TableRenderer;
export {
    TableHeaderRenderer,
    TableBodyRenderer,
    TableRowRenderer,
    TableHeadRenderer,
    TableCellRenderer,
    TableFooterRenderer,
};
