import { createContext, useContext } from "react";

export const ImportDialogPortalContext = createContext<HTMLElement | null>(null);

export function useImportDialogPortalContainer() {
    return useContext(ImportDialogPortalContext);
}
