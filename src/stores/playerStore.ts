import { create } from "zustand";
import { mockPlayer } from "../mocks/tower";
import type { Player, PlayerState } from "../services/types";

type PlayerStore = {
  player: Player;
  garrisonNodeNameKey: string;
  setPlayer: (player: Player) => void;
  setGarrisonNodeNameKey: (nodeNameKey: string) => void;
  setPlayerState: (state: PlayerState, garrisonNodeId?: string) => void;
  leaveNode: () => void;
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  player: mockPlayer,
  garrisonNodeNameKey: "node.f2.crystalVault.name",
  setPlayer: (player) => set({ player }),
  setGarrisonNodeNameKey: (garrisonNodeNameKey) => set({ garrisonNodeNameKey }),
  setPlayerState: (state, garrisonNodeId) =>
    set((store) => ({
      player: {
        ...store.player,
        state,
        garrisonNodeId:
          state === "garrisoning"
            ? (garrisonNodeId ?? store.player.garrisonNodeId ?? "n_med1")
            : undefined,
      },
    })),
  leaveNode: () =>
    set((store) => ({
      player: {
        ...store.player,
        state: "free",
        garrisonNodeId: undefined,
      },
    })),
}));
