import { type FC, lazy, Suspense, useCallback, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@workspace/ui/components/dialog";
import { useStudentListStore } from "../../store";
import Loader from "@workspace/flowtrove/components/loader";
import { ImportDialogPortalContext } from "./portal-container-context";


const ImportStudentsDatatable = lazy(() => import("./components/datatable"));
const ImportUsersDialog: FC = () => {
    const { isImportUsersDialogOpen, setIsImportUsersDialogOpen } = useStudentListStore();
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    const setPortalRef = useCallback((node: HTMLDivElement | null) => {
        setPortalContainer(node);
    }, []);

    return (
        <Dialog open={isImportUsersDialogOpen} onOpenChange={(open) => !open && setIsImportUsersDialogOpen(false)}>
            <DialogContent fullscreen>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="shrink-0 border-b px-5 py-3.5">
                        <DialogHeader className="gap-1 text-left sm:text-left">
                            <DialogTitle className="text-base font-semibold leading-tight">
                                Import Users
                            </DialogTitle>
                            <DialogDescription className="hidden">Import students from a CSV file.</DialogDescription>
                        </DialogHeader>
                    </div>
                    <ImportDialogPortalContext.Provider value={portalContainer}>
                        <div
                            ref={setPortalRef}
                            className="relative flex min-h-0 flex-1 flex-col p-6 text-muted-foreground"
                        >
                            <Suspense
                                fallback={
                                    <div className="flex flex-1 items-center justify-center">
                                        <Loader />
                                    </div>
                                }
                            >
                                <ImportStudentsDatatable />
                            </Suspense>
                        </div>
                    </ImportDialogPortalContext.Provider>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImportUsersDialog;
