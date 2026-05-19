import { create } from "zustand";
import type { Role } from "./api";

export const EMPTY_ROLE: Role = {
    id: 0,
    name: "",
    description: "",
    status: "active",
};

type DialogState = {
    selectedRole: Role | null;
    isCreateMode: boolean;
    isQuickEditDialogOpen: boolean;
    isDeleteDialogOpen: boolean;
    isDisableDialogOpen: boolean;
    isEnableDialogOpen: boolean;
};

type RolesListStore = DialogState & {
    openQuickEdit: (role: Role) => void;
    openCreateRole: () => void;
    openDelete: (role: Role) => void;
    openDisable: (role: Role) => void;
    openEnable: (role: Role) => void;
    closeDialogs: () => void;
};

const closedState: DialogState = {
    selectedRole: null,
    isCreateMode: false,
    isQuickEditDialogOpen: false,
    isDeleteDialogOpen: false,
    isDisableDialogOpen: false,
    isEnableDialogOpen: false,
};

const useRolesListStore = create<RolesListStore>((set) => ({
    ...closedState,
    openQuickEdit: (role) =>
        set({
            ...closedState,
            selectedRole: role,
            isCreateMode: false,
            isQuickEditDialogOpen: true,
        }),
    openCreateRole: () =>
        set({
            ...closedState,
            selectedRole: EMPTY_ROLE,
            isCreateMode: true,
            isQuickEditDialogOpen: true,
        }),
    openDelete: (role) =>
        set({
            ...closedState,
            selectedRole: role,
            isDeleteDialogOpen: true,
        }),
    openDisable: (role) =>
        set({
            ...closedState,
            selectedRole: role,
            isDisableDialogOpen: true,
        }),
    openEnable: (role) =>
        set({
            ...closedState,
            selectedRole: role,
            isEnableDialogOpen: true,
        }),
    closeDialogs: () => set(closedState),
}));

export default useRolesListStore;
