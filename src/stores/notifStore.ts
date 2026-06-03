import { create } from "zustand";
import { redDots as mockRedDots } from "../mocks/tower";
import type { RedDots } from "../services/types";

type NotifStore = {
  redDots: RedDots;
  setRedDots: (redDots: RedDots) => void;
};

export const useNotifStore = create<NotifStore>((set) => ({
  redDots: mockRedDots,
  setRedDots: (redDots) => set({ redDots }),
}));
