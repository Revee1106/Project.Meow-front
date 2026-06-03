// Mock data for the MVP screens: gear, equipment, reports, battle result,
// battle resolve, garrison states. All display strings are i18n keys.

// ===== Gear =====
// stat keys: atk, def, hp, crit, spd
const Equipped = {
  weapon:   { slot: "weapon",   nameKey: "gear.wardensMaul",   rarity: "rare",      cp: 188, level: 12, stats: [{ k: "atk", v: 142 }, { k: "crit", v: "6%" }] },
  helmet:   { slot: "helmet",   nameKey: "gear.cryptHood",     rarity: "common",    cp: 64,  level: 10, stats: [{ k: "def", v: 38 }, { k: "hp", v: 120 }] },
  armor:    { slot: "armor",    nameKey: "gear.bonewoverPlate",rarity: "epic",      cp: 246, level: 12, stats: [{ k: "def", v: 96 }, { k: "hp", v: 540 }] },
  ring:     { slot: "ring",     nameKey: "gear.emberBand",     rarity: "rare",      cp: 132, level: 11, stats: [{ k: "atk", v: 64 }, { k: "spd", v: 4 }] },
  necklace: { slot: "necklace", nameKey: "gear.lumenLocket",   rarity: "common",    cp: 58,  level: 9,  stats: [{ k: "hp", v: 210 }] },
  boots:    { slot: "boots",    nameKey: "gear.gravewalkers",  rarity: "rare",      cp: 121, level: 11, stats: [{ k: "spd", v: 9 }, { k: "def", v: 32 }] },
};

// Backpack — unequipped gear, some better than equipped
const Backpack = [
  { id: "b1", slot: "weapon",   nameKey: "gear.lichcleaver",  rarity: "epic",      cp: 232, level: 12, isNew: true,  stats: [{ k: "atk", v: 188 }, { k: "crit", v: "9%" }] },
  { id: "b2", slot: "necklace", nameKey: "gear.wardingCharm", rarity: "rare",      cp: 118, level: 11, isNew: true,  stats: [{ k: "hp", v: 360 }, { k: "def", v: 20 }] },
  { id: "b3", slot: "helmet",   nameKey: "gear.ashenCowl",    rarity: "rare",      cp: 104, level: 11, stats: [{ k: "def", v: 58 }, { k: "hp", v: 180 }] },
  { id: "b4", slot: "ring",     nameKey: "gear.hollowSignet", rarity: "common",    cp: 71,  level: 10, stats: [{ k: "atk", v: 40 }] },
  { id: "b5", slot: "boots",    nameKey: "gear.dustTreads",   rarity: "common",    cp: 54,  level: 9,  stats: [{ k: "spd", v: 5 }] },
  { id: "b6", slot: "weapon",   nameKey: "gear.sunderAxe",    rarity: "legendary", cp: 274, level: 13, stats: [{ k: "atk", v: 214 }, { k: "crit", v: "12%" }, { k: "spd", v: 3 }] },
];

// New gear drop shown on the battle-result screen (a better weapon)
const GearDrop = { slot: "weapon", nameKey: "gear.lichcleaver", rarity: "epic", cp: 232, level: 12, isNew: true, stats: [{ k: "atk", v: 188 }, { k: "crit", v: "9%" }] };

// ===== Reports =====
// type: attackWin | attackLoss | defenseWin | nodeLost
const Reports = [
  { id: "r1", type: "defenseWin", opponent: "Mira",  nodeKey: "node.f2.crystalVault.name", rewards: ["gold:60"],            time: "time.minAgo:4",  unread: true },
  { id: "r2", type: "nodeLost",   opponent: "Talen", nodeKey: "node.f2.silentLamp.name",   rewards: [],                     time: "time.minAgo:38", unread: true },
  { id: "r3", type: "attackWin",  opponent: "Ardyn", nodeKey: "node.f2.boneReliquary.name",rewards: ["gold:240", "fragments:3"], time: "time.hourAgo:2" },
  { id: "r4", type: "defenseWin", opponent: "Joryn", nodeKey: "node.f2.crystalVault.name", rewards: ["gold:60"],            time: "time.hourAgo:5" },
  { id: "r5", type: "attackLoss", opponent: "Talen", nodeKey: "node.f2.lichWarden.name",   rewards: [],                     time: "time.hourAgo:9" },
];

// ===== Battle result payloads =====
const Battle = {
  victoryNpc: {
    outcome: "victory", opponentKind: "npc",
    enemyNameKey: "node.f2.crystalVault.name",
    myCP: 1284, enemyCP: 980,
    nodeNameKey: "node.f2.crystalVault.name", nodeType: "medium", floor: 2,
    stats: { rounds: 6, dmgDealt: 8420, dmgTaken: 3110, hpLeft: 62 },
    rewards: ["gold:240", "fragments:3", "stones:4"],
    drop: window.TowerData ? null : null, // set below
    nodeUnlocked: true,
    canOccupy: true,
  },
  victoryPlayer: {
    outcome: "victory", opponentKind: "player",
    enemyName: "Ardyn",
    myCP: 1284, enemyCP: 1402,
    nodeNameKey: "node.f2.boneReliquary.name", nodeType: "medium", floor: 2,
    stats: { rounds: 9, dmgDealt: 11240, dmgTaken: 9870, hpLeft: 11 },
    rewards: ["gold:240", "fragments:3"],
    nodeUnlocked: false,
    canOccupy: true,
    upset: true,
  },
  defeat: {
    outcome: "defeat", opponentKind: "player",
    enemyName: "Talen",
    myCP: 1284, enemyCP: 1620,
    nodeNameKey: "node.f2.lichWarden.name", nodeType: "major", floor: 2,
    stats: { rounds: 7, dmgDealt: 6210, dmgTaken: 14200, hpLeft: 0 },
    rewards: [],
    nodeUnlocked: false,
    canOccupy: false,
  },
};

// ===== Battle resolve (theatrical) log =====
const ResolveLog = [
  { side: "me",    key: "resolve.log.open",     vars: {} },
  { side: "enemy", key: "resolve.log.enemyHit", vars: { dmg: 1120 } },
  { side: "me",    key: "resolve.log.crit",     vars: { dmg: 2240 } },
  { side: "enemy", key: "resolve.log.enemyHit", vars: { dmg: 980 } },
  { side: "me",    key: "resolve.log.skill",    vars: { dmg: 1860 } },
  { side: "me",    key: "resolve.log.finish",   vars: {} },
];

// ===== Garrison states =====
const GarrisonBase = {
  floor: 2,
  nodeNameKey: "node.f2.crystalVault.name",
  nodeType: "medium",
  durationMin: 252,           // 4h 12m
  rewards: ["gold:1,240", "fragments:8", "stones:24"],
  capPct: 62,
  capInLabel: "5h 48m",
  capHours: 10,
  defenses: { wins: 3, losses: 0 },
  log: [
    { result: "win",  opponent: "Mira",  time: "time.minAgo:4",  fresh: true },
    { result: "win",  opponent: "Ardyn", time: "time.hourAgo:1" },
    { result: "win",  opponent: "Joryn", time: "time.hourAgo:3" },
  ],
};

const Garrison = {
  normal: GarrisonBase,
  capNear: { ...GarrisonBase, capPct: 92, capInLabel: "41m", capUrgent: true,
    rewards: ["gold:2,980", "fragments:18", "stones:52"] },
  capFull: { ...GarrisonBase, capPct: 100, capInLabel: "0m", capFull: true,
    rewards: ["gold:3,200", "fragments:20", "stones:60"],
    durationMin: 612 },
  empty: { ...GarrisonBase, durationMin: 6, capPct: 2, capInLabel: "9h 54m",
    rewards: [], defenses: { wins: 0, losses: 0 }, log: [] },
  lost: { ...GarrisonBase, lost: true, lostTo: "Talen", capPct: 0,
    rewards: ["gold:1,240", "fragments:8", "stones:24"],
    defenses: { wins: 3, losses: 1 },
    log: [
      { result: "loss", opponent: "Talen", time: "time.minAgo:2", fresh: true },
      { result: "win",  opponent: "Mira",  time: "time.hourAgo:1" },
      { result: "win",  opponent: "Ardyn", time: "time.hourAgo:2" },
    ] },
};

Object.assign(window.TowerData, {
  Equipped, Backpack, GearDrop, Reports, Battle, ResolveLog, Garrison,
});
