import type {
  ActivityRow,
  Floor,
  Player,
  RedDots,
  Reward,
} from "../services/types";

export const mockPlayer: Player = {
  id: "player_veyra",
  name: "Veyra",
  level: 14,
  cp: 1284,
  stamina: 8,
  staminaMax: 10,
  currencies: { gold: 4820, stones: 124, fragments: 38, tickets: 3 },
  state: "free",
};

const rewards = {
  gold: (amount: number): Reward => ({ type: "gold", amount }),
  stones: (amount: number): Reward => ({ type: "stones", amount }),
  fragments: (amount: number): Reward => ({ type: "fragments", amount }),
  gear: (rarity: Reward["rarity"]): Reward => ({ type: "gear", rarity }),
};

export const floor2: Floor = {
  floor: 2,
  nameKey: "floor.f2.name",
  ruleKey: "floor.f2.rule",
  cleared: true,
  nextUnlocked: true,
  nodes: [
    {
      id: "n_major",
      nameKey: "node.f2.lichWarden.name",
      shortNameKey: "node.f2.lichWarden.short",
      type: "major",
      recommendedCP: 1600,
      state: "playerOccupied",
      rewards: [rewards.gold(600), rewards.fragments(6), rewards.gear("epic")],
      rewardCapHours: 12,
      cost: { dailyFreeUsed: 2, dailyFreeMax: 5 },
      occupier: { name: "Talen", cp: 1620, garrisonedMin: 132, defenses: 4 },
    },
    {
      id: "n_med1",
      nameKey: "node.f2.crystalVault.name",
      shortNameKey: "node.f2.crystalVault.short",
      type: "medium",
      recommendedCP: 980,
      state: "occupiedByMe",
      rewards: [rewards.gold(240), rewards.fragments(3)],
      rewardCapHours: 10,
      garrison: {
        startedMin: 252,
        accumulated: { gold: 1240, fragments: 8, stones: 24 },
        capInMin: 348,
        defenses: 3,
      },
    },
    {
      id: "n_med2",
      nameKey: "node.f2.boneReliquary.name",
      shortNameKey: "node.f2.boneReliquary.short",
      type: "medium",
      recommendedCP: 1020,
      state: "available",
      rewards: [rewards.gold(240), rewards.fragments(3)],
      rewardCapHours: 10,
    },
    {
      id: "n_s1",
      nameKey: "node.f2.barrowMaw.name",
      shortNameKey: "node.f2.barrowMaw.short",
      type: "small",
      recommendedCP: 720,
      state: "protected",
      rewards: [rewards.gold(120), rewards.stones(4)],
      rewardCapHours: 8,
      occupier: { name: "Mira", cp: 980, garrisonedMin: 3, defenses: 0 },
      protectionMin: 2,
    },
    {
      id: "n_s2",
      nameKey: "node.f2.gravePyre.name",
      shortNameKey: "node.f2.gravePyre.short",
      type: "small",
      recommendedCP: 780,
      state: "available",
      rewards: [rewards.gold(120), rewards.stones(4)],
      rewardCapHours: 8,
    },
    {
      id: "n_s3",
      nameKey: "node.f2.silentLamp.name",
      shortNameKey: "node.f2.silentLamp.short",
      type: "small",
      recommendedCP: 800,
      state: "playerOccupied",
      rewards: [rewards.gold(120), rewards.stones(4)],
      rewardCapHours: 8,
      cost: { dailyFreeUsed: 2, dailyFreeMax: 5 },
      occupier: { name: "Joryn", cp: 880, garrisonedMin: 75, defenses: 1 },
    },
    {
      id: "n_s4",
      nameKey: "node.f2.cracklingFont.name",
      shortNameKey: "node.f2.cracklingFont.short",
      type: "small",
      recommendedCP: 820,
      state: "npcControlled",
      rewards: [rewards.gold(120), rewards.stones(4)],
      rewardCapHours: 8,
    },
  ],
};

export const recentActivity: Record<"free" | "garrisoning", ActivityRow[]> = {
  free: [
    {
      type: "defeatedNpc",
      vars: { npcNameKey: "node.f2.crystalVault.name" },
      timeKey: "time.minutesAgo",
      timeVars: { count: 12 },
    },
    {
      type: "lootRare",
      vars: { gearNameKey: "gear.wardenMaul.name" },
      timeKey: "time.minutesAgo",
      timeVars: { count: 13 },
    },
    {
      type: "unlockedFloor",
      vars: { floor: 2 },
      timeKey: "time.hoursAgo",
      timeVars: { count: 1 },
    },
  ],
  garrisoning: [
    {
      type: "defenseSuccess",
      vars: { player: "Mira" },
      timeKey: "time.minutesAgo",
      timeVars: { count: 4 },
      fresh: true,
    },
    {
      type: "defenseSuccess",
      vars: { player: "Ardyn" },
      timeKey: "time.hoursAgo",
      timeVars: { count: 1 },
    },
    {
      type: "defeatedNpc",
      vars: { npcNameKey: "node.f2.crystalVault.name" },
      timeKey: "time.hoursAgo",
      timeVars: { count: 5 },
    },
  ],
};

export const redDots: RedDots = {
  equipment: 2,
  reports: 1,
};
