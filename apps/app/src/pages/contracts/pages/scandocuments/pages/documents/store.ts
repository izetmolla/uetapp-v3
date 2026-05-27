import { create } from "zustand";


export type DocumentListStore = {
    isAddDocumentDialogOpen: boolean;
    setIsAddDocumentDialogOpen: (isAddDocumentDialogOpen: boolean) => void;
    isImportDocumentsDialogOpen: boolean;
    setIsImportDocumentsDialogOpen: (isImportDocumentsDialogOpen: boolean) => void;
}

export const useDocumentListStore = create<DocumentListStore>((set) => ({
    isAddDocumentDialogOpen: false,
    setIsAddDocumentDialogOpen: (isAddDocumentDialogOpen) => set({ isAddDocumentDialogOpen }),
    isImportDocumentsDialogOpen: false,
    setIsImportDocumentsDialogOpen: (isImportDocumentsDialogOpen) => set({ isImportDocumentsDialogOpen }),
}));