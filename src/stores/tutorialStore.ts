import { create } from "zustand";

type TutorialStore = {
  seenIntro: boolean;
  setSeenIntro: (seenIntro: boolean) => void;
};

export const useTutorialStore = create<TutorialStore>((set) => ({
  seenIntro: true,
  setSeenIntro: (seenIntro) => set({ seenIntro }),
}));
