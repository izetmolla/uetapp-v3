"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
  useCallback,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from "react";

// --- Size configuration (moved out for clarity and tree-shaking)

const TAILWIND_SIZES = [
  "sm:max-w-sm",
  "sm:max-w-md",
  "sm:max-w-lg",
  "sm:max-w-xl",
  "sm:max-w-2xl",
  "sm:max-w-3xl",
  "sm:max-w-4xl",
  "sm:max-w-5xl",
] as const;

const PERCENTAGE_SIZES = ["30%", "40%", "50%", "60%", "70%", "80%", "90%"] as const;

export type DialogSize =
  | (typeof TAILWIND_SIZES)[number]
  | (typeof PERCENTAGE_SIZES)[number]
  | "auto";

const PERCENTAGE_TO_CLASS: Record<(typeof PERCENTAGE_SIZES)[number], string> = {
  "30%": "!w-[30vw] !h-[30vh] !max-w-[30vw] !max-h-[30vh] overflow-auto",
  "40%": "!w-[40vw] !h-[40vh] !max-w-[40vw] !max-h-[40vh] overflow-auto",
  "50%": "!w-[50vw] !h-[50vh] !max-w-[50vw] !max-h-[50vh] overflow-auto",
  "60%": "!w-[60vw] !h-[60vh] !max-w-[60vw] !max-h-[60vh] overflow-auto",
  "70%": "!w-[70vw] !h-[70vh] !max-w-[70vw] !max-h-[70vh] overflow-auto",
  "80%": "!w-[80vw] !h-[80vh] !max-w-[80vw] !max-h-[80vh] overflow-auto",
  "90%": "!w-[90vw] !h-[90vh] !max-w-[90vw] !max-h-[90vh] overflow-auto",
};

function getDialogContentClassName(size: DialogSize, className?: string): string {
  if (size === "auto") {
    return cn("max-h-[90vh] overflow-auto w-full max-w-2xl", className);
  }
  const percentageClass = PERCENTAGE_TO_CLASS[size as (typeof PERCENTAGE_SIZES)[number]];
  if (percentageClass) {
    return cn(percentageClass, className);
  }
  return cn(size, className);
}

// --- Props

export interface DialogButtonProps {
  /** Controlled open state. When provided, dialog is controlled by parent. */
  open?: boolean;
  /** Called when open state should change (e.g. close button, overlay click). */
  onOpenChange?: (open: boolean) => void;
  /** Convenience callback when dialog closes. */
  onClose?: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  triggerText?: string;
  triggerIcon?: ReactNode;
  triggerButton?: ReactNode;
  noButtonText?: boolean;
  className?: string;
  fullScreen?: boolean;
  size?: DialogSize;
  showCloseButton?: boolean;
}

// Support legacy `isOpen` prop name for backward compatibility
type DialogButtonPropsWithLegacy = DialogButtonProps & {
  isOpen?: boolean;
};

// --- Component

const DialogButtonRoot: FC<DialogButtonPropsWithLegacy> = ({
  open: openProp,
  isOpen: isOpenProp,
  onOpenChange,
  onClose,
  children,
  triggerText,
  triggerIcon,
  triggerButton,
  size = "sm:max-w-sm",
  title,
  description,
  noButtonText,
  className,
  fullScreen,
  showCloseButton = true,
}) => {
  const isControlled = openProp !== undefined || isOpenProp !== undefined;
  const controlledOpen = openProp ?? isOpenProp ?? false;

  const [internalOpen, setInternalOpen] = useState(false);

  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onClose?.();
      }
      onOpenChange?.(nextOpen);
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
    },
    [isControlled, onClose, onOpenChange]
  );

  const contentClassName = useMemo(
    () =>
      fullScreen ? undefined : getDialogContentClassName(size, className),
    [fullScreen, size, className]
  );

  const showHeader = Boolean(title ?? description);

  const defaultTrigger = useMemo(
    () => (
      <Button variant="outline">
        {triggerIcon ?? null}
        {!noButtonText && (triggerText ?? "Open Dialog")}
      </Button>
    ),
    [triggerIcon, noButtonText, triggerText]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton ?? defaultTrigger}
      </DialogTrigger>
      {open && (
        <DialogContent
          showCloseButton={showCloseButton}
          className={contentClassName}
        >
          <DialogHeader className={showHeader ? undefined : "hidden"}>
            <DialogTitle className={title ? undefined : "hidden"}>
              {title}
            </DialogTitle>
            <DialogDescription className={description ? undefined : "hidden"}>
              {description}
            </DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      )}
    </Dialog>
  );
};

// --- Compound component exports

const DialogButton = Object.assign(DialogButtonRoot, {
  DialogFooter,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
});

export default DialogButton;
