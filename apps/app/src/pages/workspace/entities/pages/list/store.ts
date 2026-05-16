import { create } from "zustand";
import type { Entity } from "./types";

interface Store {
  isAddEntrypointDialogOpen: boolean;
  setIsAddEntrypointDialogOpen: (isAddEntrypointDialogOpen: boolean) => void;
  viewMode: "grid" | "list";
  setViewMode: (v: "grid" | "list") => void;
  selectedEntity: Entity | null;
  setSelectedEntity: (entity: Entity | null) => void;
  isDeleteEntityModalOpen: boolean;
  setIsDeleteEntityModalOpen: (open: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  isAddEntrypointDialogOpen: false,
  setIsAddEntrypointDialogOpen: (isAddEntrypointDialogOpen) => set({ isAddEntrypointDialogOpen }),
  viewMode: "grid",
  setViewMode: (v) => set({ viewMode: v }),
  selectedEntity: null,
  setSelectedEntity: (selectedEntity) => set({ selectedEntity }),
  isDeleteEntityModalOpen: false,
  setIsDeleteEntityModalOpen: (isDeleteEntityModalOpen) => set({ isDeleteEntityModalOpen }),
}));


