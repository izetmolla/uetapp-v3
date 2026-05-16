import { create } from "zustand";

type WorkflowListStore = {
    mode: "grid" | "list";
    setMode: (mode: "grid" | "list") => void;
    isCreateWorkflowDialogOpen: boolean;
    setIsCreateWorkflowDialogOpen: (isCreateWorkflowDialogOpen: boolean) => void;
}
const useWorkflowListStore = create<WorkflowListStore>((set) => ({
    mode: "grid",
    setMode: (mode) => set({ mode }),
    isCreateWorkflowDialogOpen: false,
    setIsCreateWorkflowDialogOpen: (isCreateWorkflowDialogOpen) => set({ isCreateWorkflowDialogOpen }),
}));

export { useWorkflowListStore };