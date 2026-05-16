import { create } from "zustand";
import type { Domain } from "./api";

interface DomainsListStore {
    isAddDomainDialogOpen: boolean;
    setIsAddDomainDialogOpen: (isAddDomainDialogOpen: boolean) => void;
    isSubdomainDialogOpen: boolean;
    setIsSubdomainDialogOpen: (isSubdomainDialogOpen: boolean) => void;
    isDeleteDomainDialogOpen: boolean;
    setIsDeleteDomainDialogOpen: (isDeleteDomainDialogOpen: boolean) => void;
    isAliasDomainDialogOpen: boolean;
    setIsAliasDomainDialogOpen: (isAliasDomainDialogOpen: boolean) => void;
    /** Domain selected for make primary flow */
    isMakePrimaryDomainDialogOpen: boolean;
    setIsMakePrimaryDomainDialogOpen: (isMakePrimaryDomainDialogOpen: boolean) => void;
    /** Domain selected for delete / add subdomain / add alias flows */
    selectedDomain: Domain | null;
    setSelectedDomain: (domain: Domain | null) => void;
    /** Clears selection and closes subdomain, delete, and alias modals */
    resetDomainDialogContext: () => void;
}

const useDomainsListStore = create<DomainsListStore>((set) => ({
    isAddDomainDialogOpen: false,
    setIsAddDomainDialogOpen: (isAddDomainDialogOpen) => set({ isAddDomainDialogOpen }),
    isSubdomainDialogOpen: false,
    setIsSubdomainDialogOpen: (isSubdomainDialogOpen) => set({ isSubdomainDialogOpen }),
    isDeleteDomainDialogOpen: false,
    setIsDeleteDomainDialogOpen: (isDeleteDomainDialogOpen) => set({ isDeleteDomainDialogOpen }),
    isAliasDomainDialogOpen: false,
    setIsAliasDomainDialogOpen: (isAliasDomainDialogOpen) => set({ isAliasDomainDialogOpen }),
    isMakePrimaryDomainDialogOpen: false,
    setIsMakePrimaryDomainDialogOpen: (isMakePrimaryDomainDialogOpen) => set({ isMakePrimaryDomainDialogOpen }),
    selectedDomain: null,
    setSelectedDomain: (selectedDomain) => set({ selectedDomain }),
    resetDomainDialogContext: () =>
        set({
            selectedDomain: null,
            isSubdomainDialogOpen: false,
            isDeleteDomainDialogOpen: false,
            isAliasDomainDialogOpen: false,
            isMakePrimaryDomainDialogOpen: false,
        }),
}));

export default useDomainsListStore;
