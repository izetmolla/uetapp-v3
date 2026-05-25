import { create } from "zustand";
import type { Folder } from "./api";


interface FoldersStore {
    folder: Folder | null;
    setFolder: (folder: Folder | null) => void;
    isSaveFolderDialogOpen: boolean;
    setIsSaveFolderDialogOpen: (isSaveFolderDialogOpen: boolean) => void;
    isAddStudentToScanDialogOpen: boolean;
    setIsAddStudentToScanDialogOpen: (isAddStudentToScanDialogOpen: boolean) => void;
    isDownloadDialogOpen: boolean;
    setIsDownloadDialogOpen: (isDownloadDialogOpen: boolean) => void;
    isDeleteFolderDialogOpen: boolean;
    setIsDeleteFolderDialogOpen: (isDeleteFolderDialogOpen: boolean) => void;
}

const useFoldersStore = create<FoldersStore>((set) => ({
    folder: null,
    setFolder: (folder) => set({ folder }),
    isSaveFolderDialogOpen: false,
    setIsSaveFolderDialogOpen: (isSaveFolderDialogOpen) => set({ isSaveFolderDialogOpen }),
    isAddStudentToScanDialogOpen: false,
    setIsAddStudentToScanDialogOpen: (isAddStudentToScanDialogOpen) => set({ isAddStudentToScanDialogOpen }),
    isDeleteFolderDialogOpen: false,
    setIsDeleteFolderDialogOpen: (isDeleteFolderDialogOpen) => set({ isDeleteFolderDialogOpen }),
    isDownloadDialogOpen: false,
    setIsDownloadDialogOpen: (isDownloadDialogOpen) => set({ isDownloadDialogOpen }),
}));

export default useFoldersStore;