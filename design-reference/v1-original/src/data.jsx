// Mock data for Tower PvP hi-fi mockups.
// All "names" are i18n keys, never raw strings, to keep mockups i18n-safe.

const Player = {
  name: "Veyra",
  level: 14,
  cp: 1284,
  stamina: 8,
  staminaMax: 10,
  currencies: { gold: 4820, stones: 124, fragments: 38, tickets: 3 },
};

// Floor 2 - Crypt Gate node layout (4 small, 2 medium, 1 major).
// Each variant of the Floor screen overrides selected nodes' states.

const Floor2Base = {
  floor: 2,
  nameKey: "floor.f2.name",
  ruleKey: "floor.f2.rule",
  cleared: false,
  nextUnlocked: false,
  nodes: [
    {
      id: "n_major",
      nameKey: "node.f2.lichWarden.name",
      type: "major",
      recommendedCP: 1600,
      state: "npcControlled",
      rewards: ["gold:600", "fragments:6", "gear:epic"],
      rewardCapHours: 12,
    },
    {
      id: "n_med1",
      nameKey: "node.f2.crystalVault.name",
      type: "medium",
      recommendedCP: 980,
      state: "npcControlled",
      rewards: ["gold:240", "fragments:3"],
      rewardCapHours: 10,
    },
    {
      id: "n_med2",
      nameKey: "node.f2.boneReliquary.name",
      type: "medium",
      recommendedCP: 1020,
      state: "npcControlled",
      rewards: ["gold:240", "fragments:3"],
      rewardCapHours: 10,
    },
    {
      id: "n_s1",
      nameKey: "node.f2.barrowMaw.name",
      type: "small",
      recommendedCP: 720,
      state: "npcControlled",
      rewards: ["gold:120", "stones:4"],
      rewardCapHours: 8,
    },
    {
      id: "n_s2",
      nameKey: "node.f2.gravePyre.name",
      type: "small",
      recommendedCP: 780,
      state: "npcControlled",
      rewards: ["gold:120", "stones:4"],
      rewardCapHours: 8,
    },
    {
      id: "n_s3",
      nameKey: "node.f2.silentLamp.name",
      type: "small",
      recommendedCP: 800,
      state: "npcControlled",
      rewards: ["gold:120", "stones:4"],
      rewardCapHours: 8,
    },
    {
      id: "n_s4",
      nameKey: "node.f2.cracklingFont.name",
      type: "small",
      recommendedCP: 820,
      state: "npcControlled",
      rewards: ["gold:120", "stones:4"],
      rewardCapHours: 8,
    },
  ],
};

// Helper to deep-clone and patch nodes by id.
function patchFloor(base, patches) {
  const f = { ...base, nodes: base.nodes.map((n) => ({ ...n })) };
  for (const [id, patch] of Object.entries(patches.nodes || {})) {
    const idx = f.nodes.findIndex((n) => n.id === id);
    if (idx >= 0) f.nodes[idx] = { ...f.nodes[idx], ...patch };
  }
  if (patches.cleared !== undefined) f.cleared = patches.cleared;
  if (patches.nextUnlocked !== undefined) f.nextUnlocked = patches.nextUnlocked;
  return f;
}

// Variant: early NPC progression
const Floor2_Early = Floor2Base;

// Variant: major cleared, next unlocked, two smalls available
const Floor2_PostClear = patchFloor(Floor2Base, {
  cleared: true,
  nextUnlocked: true,
  nodes: {
    n_major: { state: "available" },
    n_med1: { state: "available" },
    n_s1: { state: "available" },
    n_s2: { state: "available" },
  },
});

// Variant: PvP occupation phase
const Floor2_PvP = patchFloor(Floor2Base, {
  cleared: true,
  nextUnlocked: true,
  nodes: {
    n_major: {
      state: "playerOccupied",
      occupier: { name: "Talen", cp: 1620, garrisonedMin: 132, defenses: 4 },
    },
    n_med1: {
      state: "occupiedByMe",
      garrison: { startedMin: 252, accumulated: { gold: 1240, fragments: 8 }, capInMin: 348, defenses: 3 },
    },
    n_med2: {
      state: "playerOccupied",
      occupier: { name: "Ardyn", cp: 1402, garrisonedMin: 240, defenses: 3 },
    },
    n_s1: {
      state: "protected",
      occupier: { name: "Mira", cp: 980, garrisonedMin: 3, defenses: 0 },
      protectionMin: 2,
    },
    n_s2: { state: "available" },
    n_s3: {
      state: "playerOccupied",
      occupier: { name: "Joryn", cp: 880, garrisonedMin: 75, defenses: 1 },
    },
    n_s4: { state: "available" },
  },
});

// Variant: same as PvP but player state is Garrisoning (mine on med1)
const Floor2_Garrisoning = Floor2_PvP;

// Recent activity (mock)
const RecentActivity = {
  free: [
    { type: "defeatedNpc", vars: { npcName: "Crystal Vault" }, time: "12m ago" },
    { type: "lootRare", vars: { gearName: "Warden's Maul" }, time: "13m ago" },
    { type: "unlockedFloor", vars: { floor: 2 }, time: "1h ago" },
  ],
  garrisoning: [
    { type: "defenseSuccess", vars: { player: "Mira" }, time: "4m ago", fresh: true },
    { type: "defenseSuccess", vars: { player: "Ardyn" }, time: "1h ago" },
    { type: "defeatedNpc", vars: { npcName: "Crystal Vault" }, time: "5h ago" },
  ],
};

Object.assign(window, {
  TowerData: {
    Player,
    Floor2_Early,
    Floor2_PostClear,
    Floor2_PvP,
    Floor2_Garrisoning,
    RecentActivity,
  },
});
