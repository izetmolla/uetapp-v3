import { create } from "zustand";


interface MCPStore {
   isCreateMCPTokenDialogOpen: boolean;
   setIsCreateMCPTokenDialogOpen: (isCreateMCPTokenDialogOpen: boolean) => void;
}
const useMCPStore = create<MCPStore>((set) => ({
    isCreateMCPTokenDialogOpen: false,
    setIsCreateMCPTokenDialogOpen: (isCreateMCPTokenDialogOpen) => set({ isCreateMCPTokenDialogOpen }),
}));

export { useMCPStore };