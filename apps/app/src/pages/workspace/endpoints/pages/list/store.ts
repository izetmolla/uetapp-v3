import { create } from "zustand";
import type { Endpoint } from "./api";
import type { Domain } from "./api";


interface EndpointsListStore {
    moveEndpointDialogOpen: boolean;
    setMoveEndpointDialogOpen: (open: boolean) => void;
    direction: "up" | "down" | null;
    setDirection: (direction: "up" | "down" | null) => void;
    selectedEndpoint: Endpoint | null;
    setSelectedEndpoint: (endpoint: Endpoint | null) => void;
    domain: Domain | null;
    setDomain: (domain: Domain | null) => void;
    addEndpointPathDialogOpen: boolean;
    setAddEndpointPathDialogOpen: (open: boolean) => void;
    isDeleteEndpointModalOpen: boolean;
    setIsDeleteEndpointModalOpen: (open: boolean) => void;
    addEndpointGroupDialogOpen: boolean;
    setAddEndpointGroupDialogOpen: (open: boolean) => void;

}

export const useEndpointsListStore = create<EndpointsListStore>((set) => ({
    moveEndpointDialogOpen: false,
    setMoveEndpointDialogOpen: (open) => set({ moveEndpointDialogOpen: open }),
    direction: null,
    setDirection: (direction) => set({ direction }),
    selectedEndpoint: null,
    setSelectedEndpoint: (endpoint) => set({ selectedEndpoint: endpoint }),
    domain: { id: (new URL(window.location.href))?.searchParams.get("domain_id") ?? "", domain: "-", primary: true },
    setDomain: (domain) => set({ domain }),
    addEndpointPathDialogOpen: false,
    setAddEndpointPathDialogOpen: (open) => set({ addEndpointPathDialogOpen: open }),
    isDeleteEndpointModalOpen: false,
    setIsDeleteEndpointModalOpen: (open) => set({ isDeleteEndpointModalOpen: open }),
    addEndpointGroupDialogOpen: false,
    setAddEndpointGroupDialogOpen: (open) => set({ addEndpointGroupDialogOpen: open }),
}));


export default useEndpointsListStore 