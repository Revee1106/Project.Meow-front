import { create } from "zustand";

type ReportsStore = {
  filter: "all" | "attack" | "defense" | "lost";
  setFilter: (filter: ReportsStore["filter"]) => void;
};

export const useReportsStore = create<ReportsStore>((set) => ({
  filter: "all",
  setFilter: (filter) => set({ filter }),
}));
