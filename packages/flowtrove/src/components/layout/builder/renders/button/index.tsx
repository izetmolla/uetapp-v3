"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import type { LayoutRendererProps } from "../../types";
import { type ButtonItem } from "./types";




function ButtonRenderer({ item, renderItems, path = [] }: LayoutRendererProps<ButtonItem>) {
    const {
        label,
        buttonType,
        className,
        action,
        actionParams,
        id,
        children = [],
        ...props
    } = item;


    return (
        <Button
            {...props}
            className={cn("cursor-pointer", className)}
            type={buttonType}
        >
            {children.length > 0 ? renderItems(children, path) : label}
        </Button>
    );
}

export default ButtonRenderer;
export type { ButtonItem };
