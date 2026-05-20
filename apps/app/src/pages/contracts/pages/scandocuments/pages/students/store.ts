import { create } from "zustand";


export type StudentListStore = {
    isAddStudentDialogOpen: boolean;
    setIsAddStudentDialogOpen: (isAddStudentDialogOpen: boolean) => void;
}

export const useStudentListStore = create<StudentListStore>((set) => ({
    isAddStudentDialogOpen: false,
    setIsAddStudentDialogOpen: (isAddStudentDialogOpen) => set({ isAddStudentDialogOpen }),
}));