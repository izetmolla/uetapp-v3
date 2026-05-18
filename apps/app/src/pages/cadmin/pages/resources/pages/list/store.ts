import { create } from "zustand";

type ResourcesListStore = {
    isFormDialogOpen: boolean;
    setIsFormDialogOpen: (open: boolean) => void;
};

export const useResourcesListStore = create<ResourcesListStore>((set) => ({
    isFormDialogOpen: false,
    setIsFormDialogOpen: (isFormDialogOpen) => set({ isFormDialogOpen }),
}));
