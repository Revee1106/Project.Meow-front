import { create } from "zustand";

type InventoryStore = {
  selectedGearId?: string;
  setSelectedGearId: (gearId?: string) => void;
};

export const useInventoryStore = create<InventoryStore>((set) => ({
  selectedGearId: undefined,
  setSelectedGearId: (selectedGearId) => set({ selectedGearId }),
}));
