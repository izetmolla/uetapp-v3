import type { FC } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import useStudentsListStore from "../../store";

const ImportUsersDialog: FC = () => {
    const { isImportUsersDialogOpen, closeDialogs } = useStudentsListStore();

    return (
        <Dialog open={isImportUsersDialogOpen} onOpenChange={(open) => !open && closeDialogs()}>
            <DialogContent fullscreen>
                <div className="shrink-0 border-b px-5 py-3.5">
                    <DialogHeader className="gap-1 text-left sm:text-left">
                        <DialogTitle className="text-base font-semibold leading-tight">
                            Import Users
                        </DialogTitle>
                    </DialogHeader>
                </div>
                <div className="flex flex-1 items-center justify-center p-6 text-muted-foreground">
                    Coming soon
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImportUsersDialog;
