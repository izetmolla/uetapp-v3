import { create } from "zustand";
import type { User } from "./api";

type DialogState = {
    selectedUser: User | null;
    isQuickEditDialogOpen: boolean;
    isDeleteDialogOpen: boolean;
    isDisableDialogOpen: boolean;
    isEnableDialogOpen: boolean;
};

type UsersListStore = DialogState & {
    openQuickEdit: (user: User) => void;
    openDelete: (user: User) => void;
    openDisable: (user: User) => void;
    openEnable: (user: User) => void;
    closeDialogs: () => void;
};

const closedState: DialogState = {
    selectedUser: null,
    isQuickEditDialogOpen: false,
    isDeleteDialogOpen: false,
    isDisableDialogOpen: false,
    isEnableDialogOpen: false,
};

const useUsersListStore = create<UsersListStore>((set) => ({
    ...closedState,
    openQuickEdit: (user) =>
        set({
            ...closedState,
            selectedUser: user,
            isQuickEditDialogOpen: true,
        }),
    openDelete: (user) =>
        set({
            ...closedState,
            selectedUser: user,
            isDeleteDialogOpen: true,
        }),
    openDisable: (user) =>
        set({
            ...closedState,
            selectedUser: user,
            isDisableDialogOpen: true,
        }),
    openEnable: (user) =>
        set({
            ...closedState,
            selectedUser: user,
            isEnableDialogOpen: true,
        }),
    closeDialogs: () => set(closedState),
}));

export default useUsersListStore;
