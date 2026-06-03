import type { BattleResult } from "../../services/types";
import { gearDrop } from "./gear";

export type BattleResultFixtureKey =
  | "victoryNpc"
  | "victoryNpcNoDrop"
  | "victoryPlayer"
  | "defeat";

export const battleFixtures: Record<BattleResultFixtureKey, BattleResult> = {
  victoryNpc: {
    id: "victoryNpc",
    nodeId: "n_med1",
    outcome: "victory",
    opponentKind: "npc",
    enemyNameKey: "node.f2.crystalVault.name",
    myCP: 1284,
    enemyCP: 980,
    nodeNameKey: "node.f2.crystalVault.name",
    nodeType: "medium",
    floor: 2,
    stats: { rounds: 6, dmgDealt: 8420, dmgTaken: 3110, hpLeft: 62 },
    rewards: ["gold:240", "fragments:3", "stones:4"],
    drop: gearDrop,
    nodeUnlocked: true,
    canOccupy: true,
  },
  victoryNpcNoDrop: {
    id: "victoryNpcNoDrop",
    nodeId: "n_med1",
    outcome: "victory",
    opponentKind: "npc",
    enemyNameKey: "node.f2.crystalVault.name",
    myCP: 1284,
    enemyCP: 980,
    nodeNameKey: "node.f2.crystalVault.name",
    nodeType: "medium",
    floor: 2,
    stats: { rounds: 6, dmgDealt: 8420, dmgTaken: 3110, hpLeft: 62 },
    rewards: ["gold:240", "fragments:3", "stones:4"],
    drop: null,
    nodeUnlocked: true,
    canOccupy: true,
  },
  victoryPlayer: {
    id: "victoryPlayer",
    nodeId: "n_med2",
    outcome: "victory",
    opponentKind: "player",
    enemyName: "Ardyn",
    myCP: 1284,
    enemyCP: 1402,
    nodeNameKey: "node.f2.boneReliquary.name",
    nodeType: "medium",
    floor: 2,
    stats: { rounds: 9, dmgDealt: 11240, dmgTaken: 9870, hpLeft: 11 },
    rewards: ["gold:240", "fragments:3"],
    drop: null,
    nodeUnlocked: false,
    canOccupy: true,
    upset: true,
  },
  defeat: {
    id: "defeat",
    nodeId: "n_major",
    outcome: "defeat",
    opponentKind: "player",
    enemyName: "Talen",
    myCP: 1284,
    enemyCP: 1620,
    nodeNameKey: "node.f2.lichWarden.name",
    nodeType: "major",
    floor: 2,
    stats: { rounds: 7, dmgDealt: 6210, dmgTaken: 14200, hpLeft: 0 },
    rewards: [],
    drop: null,
    nodeUnlocked: false,
    canOccupy: false,
  },
};

export function getBattleResultFixture(key: string) {
  return battleFixtures[key as BattleResultFixtureKey] ?? battleFixtures.victoryNpc;
}
