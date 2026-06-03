import { create } from "zustand";

type FloorStore = {
  currentFloorId: string;
  setCurrentFloorId: (floorId: string) => void;
};

export const useFloorStore = create<FloorStore>((set) => ({
  currentFloorId: "2",
  setCurrentFloorId: (currentFloorId) => set({ currentFloorId }),
}));
