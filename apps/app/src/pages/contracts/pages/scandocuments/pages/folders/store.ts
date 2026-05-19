import { create } from "zustand";


interface FoldersStore {
    isCreateFolderDialogOpen: boolean;
    setIsCreateFolderDialogOpen: (isCreateFolderDialogOpen: boolean) => void;
}

const useFoldersStore = create<FoldersStore>((set) => ({
    isCreateFolderDialogOpen: false,
    setIsCreateFolderDialogOpen: (isCreateFolderDialogOpen) => set({ isCreateFolderDialogOpen }),
}));

export default useFoldersStore;