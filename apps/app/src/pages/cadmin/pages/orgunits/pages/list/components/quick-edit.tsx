import DialogButton from "@workspace/ui/components/dialog-button";
import { PlusIcon } from "lucide-react";
import { useCallback, useState, type FC } from "react";
import type { OrgUnit } from "../api";

interface QuickOrgUnitEditProps {
    orgUnit?: OrgUnit | null;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onClose?: () => void;
}

const QuickOrgUnitEdit: FC<QuickOrgUnitEditProps> = ({
    orgUnit,
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
            triggerText={orgUnit ? "Edit Org Unit" : "Add Org Unit"}
            size="sm:max-w-3xl"
        >
            <div>
                <h1>Edit Org Unit Modal</h1>
                {JSON.stringify(orgUnit)}
                <DialogButton.DialogClose>
                    CLose
                </DialogButton.DialogClose>
            </div>
        </DialogButton>
    );
};

export default QuickOrgUnitEdit;