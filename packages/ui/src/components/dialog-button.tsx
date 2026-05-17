import type { FC, ReactNode } from "react";
import { Button } from "@workspace/ui/components/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog"
import { create, type StateCreator } from "zustand";
import { cn } from "@workspace/ui/lib/utils";
import { useId } from "react";



interface ButtonDialogProps {
    className?: string;
    view: ReactNode;
    footer?: ReactNode;
    description?: string;
    title?: string;
    button?: ReactNode;
    buttonPorps?: React.ComponentProps<"button"> | {};
    buttonContent?: string | ReactNode
    maxWidth?: string;
    modalClassName?: string; // New prop for modal width styling
    id?: string; // Optional custom ID
    children?: ReactNode;
    btnClassName?: string;
    name?: string;
    icon?: ReactNode;
}
const ButtonDialog: FC<ButtonDialogProps> = ({ name, icon, className, children, view, footer, description, title, button, buttonPorps, buttonContent, maxWidth = "sm:max-w-[395px]", modalClassName, id, btnClassName }) => {
    const dialogId = useId(); // Generate unique ID for this dialog instance
    const uniqueId = id || dialogId; // Use custom ID or generated one
    const { openDialogs, setDialogStatus } = useDialogStore();
    const isOpen = openDialogs[uniqueId] || false;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => setDialogStatus(uniqueId, open)}>
            <DialogTrigger asChild className={cn(btnClassName, "cursor-pointer")}>
                {children ? children : button ? button : (
                    <Button variant="outline" {...buttonPorps}>
                        {icon && icon}  {buttonContent ? buttonContent : name ? name : "Open Dialog"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className={cn(className, maxWidth, modalClassName)}>
                <DialogHeader className={title ? "" : "hidden"}>
                    <DialogTitle className={title ? "" : "hidden"}>{title}</DialogTitle>
                    <DialogDescription className={description ? "" : "hidden"}>{description}</DialogDescription>
                </DialogHeader>
                {view}
                {footer && <DialogFooter className={footer ? "" : "hidden"}>
                    {footer}
                </DialogFooter>}
            </DialogContent>
        </Dialog>
    )
}


export interface DialogState {
    openDialogs: Record<string, boolean>,
    openDialog: (id: string) => void,
    closeDialog: (id: string) => void,
    setDialogStatus: (id: string, open: boolean) => void
}

const dialogStore: StateCreator<DialogState> = (set) => ({
    openDialogs: {},
    openDialog: (id: string) => set((state) => ({
        openDialogs: { ...state.openDialogs, [id]: true }
    })),
    closeDialog: (id: string) => set((state) => ({
        openDialogs: { ...state.openDialogs, [id]: false }
    })),
    setDialogStatus: (id: string, open: boolean) => set((state) => ({
        openDialogs: { ...state.openDialogs, [id]: open }
    })),
})

export const useDialogStore = create(dialogStore);


export default ButtonDialog;