import DialogButton from "@workspace/ui/components/dialog-button";
import { PlusIcon } from "lucide-react";
import { useCallback, useState, type FC } from "react";
import type { User } from "../api";

interface QuickUserEditProps {
    user?: User | null;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onClose?: () => void;
}

const QuickUserEdit: FC<QuickUserEditProps> = ({
    user,
    isOpen = false,
    onOpenChange,
    onClose,
}) => {
    const [triggerOpened, setTriggerOpened] = useState(false);
    const open = isOpen || triggerOpened;

    const handleOpenChange = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) {
                setTriggerOpened(false);
                onClose?.();
            } else {
                setTriggerOpened(true);
            }
            onOpenChange?.(nextOpen);
        },
        [onClose, onOpenChange]
    );

    return (
        <DialogButton
            isOpen={open}
            onOpenChange={handleOpenChange}
            onClose={onClose}
            triggerIcon={<PlusIcon />}
            triggerText={user ? "Edit User" : "Add User"}
            size="sm:max-w-3xl"
        >
            <div>
                <h1>Edit User Modal</h1>
                {JSON.stringify(user)}
                <DialogButton.DialogClose>
                    CLose
                </DialogButton.DialogClose>
            </div>
        </DialogButton>
    );
};

export default QuickUserEdit;