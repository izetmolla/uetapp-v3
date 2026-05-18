import { create } from "zustand";

export const useStudyLevelsListStore = create<{
    isFormDialogOpen: boolean;
    setIsFormDialogOpen: (open: boolean) => void;
}>((set) => ({
    isFormDialogOpen: false,
    setIsFormDialogOpen: (isFormDialogOpen) => set({ isFormDialogOpen }),
}));
