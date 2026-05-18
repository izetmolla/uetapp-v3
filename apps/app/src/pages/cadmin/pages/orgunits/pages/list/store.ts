import { create } from "zustand";

type OrgUnitsListStore = {
    isAddOrgUnitDialogOpen: boolean;
    setIsAddOrgUnitDialogOpen: (isAddOrgUnitDialogOpen: boolean) => void;
}
const useOrgUnitsListStore = create<OrgUnitsListStore>((set) => ({
    isAddOrgUnitDialogOpen: false,
    setIsAddOrgUnitDialogOpen: (isAddOrgUnitDialogOpen) => set({ isAddOrgUnitDialogOpen }),
}));

export { useOrgUnitsListStore };