import { describe, expect, it } from "vitest";
import { changeLocale } from "../../i18n/strings";
import type { NodeState, TowerNode } from "../../services/types";
import {
  getDetailVariant,
  getNodeActionLabel,
  getNodeButtonVariant,
  isBlockedForPlayer,
  nodeStatePalette,
} from "./nodePresentation";

const baseNode: TowerNode = {
  id: "node_1",
  nameKey: "node.f2.gravePyre.name",
  shortNameKey: "node.f2.gravePyre.short",
  type: "small",
  state: "available",
  recommendedCP: 780,
  rewards: [],
  rewardCapHours: 8,
};

function nodeWithState(state: NodeState): TowerNode {
  return {
    ...baseNode,
    state,
    occupier:
      state === "playerOccupied"
        ? { name: "Mira", cp: 980, garrisonedMin: 5, defenses: 1 }
        : undefined,
    protectionMin: state === "protected" ? 2 : undefined,
  };
}

describe("node-state presentation map", () => {
  it("has a palette class for every node state", () => {
    expect(nodeStatePalette).toEqual({
      npcControlled: { className: "npcControlled" },
      available: { className: "available" },
      playerOccupied: { className: "playerOccupied" },
      occupiedByMe: { className: "occupiedByMe" },
      protected: { className: "protected" },
      locked: { className: "locked" },
      cleared: { className: "cleared" },
    });
  });

  it.each([
    ["npcControlled", "Challenge", "primary"],
    ["available", "Occupy Node", "primary"],
    ["playerOccupied", "Challenge", "danger"],
    ["occupiedByMe", "View Garrison", "secondary"],
    ["protected", "Locked", "ghost"],
    ["locked", "Locked", "ghost"],
    ["cleared", "Locked", "ghost"],
  ] as const)(
    "maps %s to label and button variant",
    async (state, label, variant) => {
      await changeLocale("en");
      const node = nodeWithState(state);

      expect(getNodeActionLabel(node, false)).toBe(label);
      expect(getNodeButtonVariant(node)).toBe(variant);
    },
  );

  it("blocks other nodes while the player is garrisoning", async () => {
    await changeLocale("en");
    const node = nodeWithState("available");

    expect(isBlockedForPlayer(node, "garrisoning", "another_node")).toBe(true);
    expect(
      getDetailVariant({
        node,
        playerState: "garrisoning",
        playerGarrisonNodeId: "another_node",
      }),
    ).toBe("blocked");
    expect(getNodeActionLabel(node, true, "Crystal Vault")).toBe(
      "Leave Crystal Vault to challenge other nodes.",
    );
  });
});
