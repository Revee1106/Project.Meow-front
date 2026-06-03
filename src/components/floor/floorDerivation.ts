import type { Floor, GarrisonState } from "../../services/types";

export const DEFAULT_GARRISON: GarrisonState = {
  startedMin: 252,
  accumulated: { gold: 1240, fragments: 8, stones: 24 },
  capInMin: 348,
  defenses: 3,
};

export function deriveFloorForPlayer(floor: Floor, garrisonNodeId?: string): Floor {
  return {
    ...floor,
    nodes: floor.nodes.map((node) => {
      if (garrisonNodeId && node.id === garrisonNodeId) {
        return {
          ...node,
          state: "occupiedByMe",
          garrison: node.garrison ?? DEFAULT_GARRISON,
        };
      }

      if (node.state === "occupiedByMe" && node.id !== garrisonNodeId) {
        return {
          ...node,
          state: "available",
          garrison: undefined,
        };
      }

      return node;
    }),
  };
}
