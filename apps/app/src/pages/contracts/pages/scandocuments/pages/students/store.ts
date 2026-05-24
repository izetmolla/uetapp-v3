import { create } from "zustand";


export type StudentListStore = {
    isAddStudentDialogOpen: boolean;
    setIsAddStudentDialogOpen: (isAddStudentDialogOpen: boolean) => void;
    isImportUsersDialogOpen: boolean;
    setIsImportUsersDialogOpen: (isImportUsersDialogOpen: boolean) => void;
}

export const useStudentListStore = create<StudentListStore>((set) => ({
    isAddStudentDialogOpen: false,
    setIsAddStudentDialogOpen: (isAddStudentDialogOpen) => set({ isAddStudentDialogOpen }),
    isImportUsersDialogOpen: false,
    setIsImportUsersDialogOpen: (isImportUsersDialogOpen) => set({ isImportUsersDialogOpen }),
}));