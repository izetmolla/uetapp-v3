import { create } from "zustand";

type AcademicYearsListStore = {
    isFormDialogOpen: boolean;
    setIsFormDialogOpen: (open: boolean) => void;
};

export const useAcademicYearsListStore = create<AcademicYearsListStore>((set) => ({
    isFormDialogOpen: false,
    setIsFormDialogOpen: (isFormDialogOpen) => set({ isFormDialogOpen }),
}));
