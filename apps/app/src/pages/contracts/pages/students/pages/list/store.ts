import { create } from "zustand";
import type { Student } from "./api";

export const EMPTY_STUDENT: Student = {
    id: 0,
    firstname: "",
    lastname: "",
    email: "",
    document_id: "",
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
    isSyncStudentsDialogOpen: boolean;
};

type StudentsListStore = DialogState & {
    openQuickEdit: (student: Student) => void;
    openCreateStudent: () => void;
    openSyncStudents: () => void;
    setSyncStudentsDialogOpen: (open: boolean) => void;
    openDisable: (student: Student) => void;
    openEnable: (student: Student) => void;
    closeDialogs: () => void;
};

const closedState: DialogState = {
    isSyncStudentsDialogOpen: false,
    selectedStudent: null,
    isCreateMode: false,
    isQuickEditDialogOpen: false,
    isDisableDialogOpen: false,
    isEnableDialogOpen: false,
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
    openSyncStudents: () =>
        set({
            ...closedState,
            isSyncStudentsDialogOpen: true,
        }),
    setSyncStudentsDialogOpen: (open) =>
        set({
            ...closedState,
            isSyncStudentsDialogOpen: open,
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
