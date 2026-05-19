import { create } from "zustand";
import type { User } from "./api";

export const EMPTY_USER: User = {
    id: "",
    email: "",
    first_name: "",
    last_name: "",
    username: "",
    ldap_username: "",
    image: "",
    status: "new",
    is_confirmed: false,
    roles: [],
};

type DialogState = {
    selectedUser: User | null;
    isCreateMode: boolean;
    isQuickEditDialogOpen: boolean;
    isDeleteDialogOpen: boolean;
    isDisableDialogOpen: boolean;
    isEnableDialogOpen: boolean;
};

type UsersListStore = DialogState & {
    openQuickEdit: (user: User) => void;
    openCreateUser: () => void;
    promoteCreatedUser: (user: User) => void;
    openDelete: (user: User) => void;
    openDisable: (user: User) => void;
    openEnable: (user: User) => void;
    closeDialogs: () => void;
};

const closedState: DialogState = {
    selectedUser: null,
    isCreateMode: false,
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
            isCreateMode: false,
            isQuickEditDialogOpen: true,
        }),
    openCreateUser: () =>
        set({
            ...closedState,
            selectedUser: EMPTY_USER,
            isCreateMode: true,
            isQuickEditDialogOpen: true,
        }),
    promoteCreatedUser: (user) =>
        set((state) => ({
            ...state,
            selectedUser: user,
            isCreateMode: false,
        })),
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
