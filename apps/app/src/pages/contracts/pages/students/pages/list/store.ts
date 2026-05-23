import { create } from "zustand";
import type { Student } from "./api";

export const EMPTY_STUDENT: Student = {
    id: 0,
    firstname: "",
    lastname: "",
    email: "",
    id_number: "",
    pasport_number: "",
    status: "active",
    user_id: "",
};

type DialogState = {
    selectedStudent: Student | null;
    isCreateMode: boolean;
    isQuickEditDialogOpen: boolean;
    isDisableDialogOpen: boolean;
    isEnableDialogOpen: boolean;
    isImportUsersDialogOpen: boolean;
};

type StudentsListStore = DialogState & {
    openQuickEdit: (student: Student) => void;
    openCreateStudent: () => void;
    openImportUsers: () => void;
    openDisable: (student: Student) => void;
    openEnable: (student: Student) => void;
    closeDialogs: () => void;
};

const closedState: DialogState = {
    selectedStudent: null,
    isCreateMode: false,
    isQuickEditDialogOpen: false,
    isDisableDialogOpen: false,
    isEnableDialogOpen: false,
    isImportUsersDialogOpen: false,
};

const useStudentsListStore = create<StudentsListStore>((set) => ({
    ...closedState,
    openQuickEdit: (student) =>
        set({
            ...closedState,
            selectedStudent: student,
            isCreateMode: false,
            isQuickEditDialogOpen: true,
        }),
    openCreateStudent: () =>
        set({
            ...closedState,
            selectedStudent: EMPTY_STUDENT,
            isCreateMode: true,
            isQuickEditDialogOpen: true,
        }),
    openImportUsers: () =>
        set({
            ...closedState,
            isImportUsersDialogOpen: true,
        }),
    openDisable: (student) =>
        set({
            ...closedState,
            selectedStudent: student,
            isDisableDialogOpen: true,
        }),
    openEnable: (student) =>
        set({
            ...closedState,
            selectedStudent: student,
            isEnableDialogOpen: true,
        }),
    closeDialogs: () => set(closedState),
}));

export default useStudentsListStore;
