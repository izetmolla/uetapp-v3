import DialogButton from "@workspace/ui/components/dialog-button";
import { Cog } from "lucide-react";

const TableConfigCustomizator = () => {
    return (
        <DialogButton noButtonText triggerIcon={<Cog />} size="auto">
            <div>
                <h1>Table Config Customization</h1>
            </div>
        </DialogButton>
    );
};

export default TableConfigCustomizator;
