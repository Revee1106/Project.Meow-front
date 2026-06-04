import { ApiError } from "./errors.js";
import type {
  ActivityRow,
  AutoEquipResponse,
  BattleResolveLogEntry,
  BattleResolvePayload,
  BattleResult,
  BootstrapPayload,
  ChallengeResponse,
  ClaimGarrisonResponse,
  EquipmentPayload,
  EquipGearResponse,
  Floor,
  Garrison,
  Gear,
  GearSlot,
  LeaveGarrisonResponse,
  NodeState,
  NodeType,
  Occupier,
  OccupyResponse,
  Player,
  PlayerSettings,
  RedDots,
  Report,
  ReportsPayload,
  Reward,
  RewardType,
  TowerNode,
} from "./types.js";

type StoredNode = Omit<TowerNode, "state" | "cost" | "occupier" | "garrison" | "protectionMin"> & {
  state: NodeState;
  owner?: Occupier & { playerId?: string };
  protectedUntil?: string;
};

type BattleRecord = {
  id: string;
  playerId: string;
  nodeId: string;
  status: "completed";
  result: BattleResult;
  log: BattleResolveLogEntry[];
  createdAt: string;
};

type GarrisonRecord = {
  id: string;
  playerId: string;
  nodeId: string;
  status: "active" | "left" | "lost";
  startedAt: string;
  lastClaimedAt: string;
  rewardCapHours: number;
  defenseWins: number;
  defenseLosses: number;
  log: Garrison["log"];
  lostAt?: string;
  lostTo?: string;
};

type MutationEndpoint = "challenge" | "occupy" | "claim" | "leave" | "equip" | "auto-equip";

const initialIso = "2026-06-04T00:00:00.000Z";
const protectionMinutes = 5;
const baseCp = 475;
const gearSlots = ["weapon", "helmet", "armor", "ring", "necklace", "boots"] as const satisfies GearSlot[];

const player: Player = {
  id: "player_veyra",
  name: "Veyra",
  level: 14,
  cp: 1284,
  stamina: 8,
  staminaMax: 10,
  currencies: { gold: 4820, stones: 124, fragments: 38, tickets: 3 },
  state: "free",
  pvpDaily: {
    date: utc8Date(new Date()),
    freeUsed: 2,
    freeMax: 5,
  },
  highestUnlockedFloor: 2,
  createdAt: initialIso,
  updatedAt: initialIso,
  version: 1,
};

const rewards = {
  gold: (amount: number): Reward => ({ type: "gold", amount }),
  stones: (amount: number): Reward => ({ type: "stones", amount }),
  fragments: (amount: number): Reward => ({ type: "fragments", amount }),
  gear: (rarity: Reward["rarity"]): Reward => ({ type: "gear", rarity }),
};

const nodes: StoredNode[] = [
  {
    id: "n_major",
    nameKey: "node.f2.lichWarden.name",
    shortNameKey: "node.f2.lichWarden.short",
    type: "major",
    recommendedCP: 1600,
    state: "playerOccupied",
    rewards: [rewards.gold(600), rewards.fragments(6), rewards.gear("epic")],
    rewardCapHours: 12,
    owner: { playerId: "rival_talen", name: "Talen", cp: 1620, garrisonedMin: 132, defenses: 4 },
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
    owner: { playerId: "rival_mira", name: "Mira", cp: 980, garrisonedMin: 3, defenses: 0 },
    protectedUntil: new Date(Date.now() + 2 * 60_000).toISOString(),
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
    owner: { playerId: "rival_joryn", name: "Joryn", cp: 880, garrisonedMin: 75, defenses: 1 },
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
];

const equipment: EquipmentPayload = {
  equipped: {
    weapon: {
      id: "eq_weapon",
      slot: "weapon",
      tier: 2,
      nameKey: "gear.wardensMaul.name",
      rarity: "rare",
      cp: 188,
      level: 12,
      stats: [
        { k: "atk", v: 142 },
        { k: "crit", v: "6%" },
      ],
      attrs: { attack: 142, critRate: 6 },
    },
    helmet: {
      id: "eq_helmet",
      slot: "helmet",
      tier: 1,
      nameKey: "gear.cryptHood.name",
      rarity: "common",
      cp: 64,
      level: 10,
      stats: [
        { k: "def", v: 38 },
        { k: "hp", v: 120 },
      ],
      attrs: { defense: 38, health: 120 },
    },
    armor: {
      id: "eq_armor",
      slot: "armor",
      tier: 3,
      nameKey: "gear.bonewovenPlate.name",
      rarity: "epic",
      cp: 246,
      level: 12,
      stats: [
        { k: "def", v: 96 },
        { k: "hp", v: 540 },
      ],
      attrs: { defense: 96, health: 540 },
    },
    ring: {
      id: "eq_ring",
      slot: "ring",
      tier: 2,
      nameKey: "gear.emberBand.name",
      rarity: "rare",
      cp: 132,
      level: 11,
      stats: [
        { k: "atk", v: 64 },
        { k: "spd", v: 4 },
      ],
      attrs: { attack: 64, attackSpeed: 4 },
    },
    necklace: {
      id: "eq_necklace",
      slot: "necklace",
      tier: 1,
      nameKey: "gear.lumenLocket.name",
      rarity: "common",
      cp: 58,
      level: 9,
      stats: [{ k: "hp", v: 210 }],
      attrs: { health: 210 },
    },
    boots: {
      id: "eq_boots",
      slot: "boots",
      tier: 2,
      nameKey: "gear.gravewalkers.name",
      rarity: "rare",
      cp: 121,
      level: 11,
      stats: [
        { k: "spd", v: 9 },
        { k: "def", v: 32 },
      ],
      attrs: { attackSpeed: 9, defense: 32 },
    },
  },
  backpack: [
    {
      id: "b1",
      slot: "weapon",
      tier: 3,
      nameKey: "gear.lichcleaver.name",
      rarity: "epic",
      cp: 232,
      level: 12,
      isNew: true,
      stats: [
        { k: "atk", v: 188 },
        { k: "crit", v: "9%" },
      ],
      attrs: { attack: 188, critRate: 9 },
    },
    {
      id: "b2",
      slot: "necklace",
      tier: 2,
      nameKey: "gear.wardingCharm.name",
      rarity: "rare",
      cp: 118,
      level: 11,
      isNew: true,
      stats: [
        { k: "hp", v: 360 },
        { k: "def", v: 20 },
      ],
      attrs: { health: 360, defense: 20 },
    },
    {
      id: "b3",
      slot: "helmet",
      tier: 2,
      nameKey: "gear.ashenCowl.name",
      rarity: "rare",
      cp: 104,
      level: 11,
      stats: [
        { k: "def", v: 58 },
        { k: "hp", v: 180 },
      ],
      attrs: { defense: 58, health: 180 },
    },
    {
      id: "b4",
      slot: "ring",
      tier: 1,
      nameKey: "gear.hollowSignet.name",
      rarity: "common",
      cp: 71,
      level: 10,
      stats: [{ k: "atk", v: 40 }],
      attrs: { attack: 40 },
    },
    {
      id: "b5",
      slot: "boots",
      tier: 1,
      nameKey: "gear.dustTreads.name",
      rarity: "common",
      cp: 54,
      level: 9,
      stats: [{ k: "spd", v: 5 }],
      attrs: { attackSpeed: 5 },
    },
    {
      id: "b6",
      slot: "weapon",
      tier: 4,
      nameKey: "gear.sunderAxe.name",
      rarity: "legendary",
      cp: 274,
      level: 13,
      stats: [
        { k: "atk", v: 214 },
        { k: "crit", v: "12%" },
        { k: "spd", v: 3 },
      ],
      attrs: { attack: 214, critRate: 12, attackSpeed: 3 },
    },
  ],
  capacity: 80,
};

const reports: Report[] = [
  {
    id: "r1",
    kind: "defenseWin",
    opponentName: "Mira",
    nodeNameKey: "node.f2.crystalVault.name",
    rewards: [rewards.gold(60)],
    time: "time.minAgo:4",
    unread: true,
  },
  {
    id: "r2",
    kind: "nodeLost",
    opponentName: "Talen",
    nodeNameKey: "node.f2.silentLamp.name",
    rewards: [],
    time: "time.minAgo:38",
    unread: true,
  },
  {
    id: "r3",
    kind: "attackWin",
    opponentName: "Ardyn",
    nodeNameKey: "node.f2.boneReliquary.name",
    rewards: [rewards.gold(240), rewards.fragments(3)],
    time: "time.hourAgo:2",
    unread: false,
  },
  {
    id: "r4",
    kind: "defenseWin",
    opponentName: "Joryn",
    nodeNameKey: "node.f2.crystalVault.name",
    rewards: [rewards.gold(60)],
    time: "time.hourAgo:5",
    unread: false,
  },
  {
    id: "r5",
    kind: "attackLoss",
    opponentName: "Talen",
    nodeNameKey: "node.f2.lichWarden.name",
    rewards: [],
    time: "time.hourAgo:9",
    unread: false,
  },
];

let settings: PlayerSettings = {
  locale: "en",
  sfx: true,
  music: false,
  notifications: true,
  battleSpeed: "fast",
  updatedAt: initialIso,
};

const battles = new Map<string, BattleRecord>();
const garrisons = new Map<string, GarrisonRecord>();
const idempotency = new Map<string, unknown>();

const redDots: RedDots = {
  equipment: 0,
  reports: 0,
};

const recentActivity: Record<"free" | "garrisoning", ActivityRow[]> = {
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
  ],
};

export function getPlayer(): Player {
  return clone(player);
}

export function getBootstrap(): BootstrapPayload {
  return {
    player: getPlayer(),
    floor: getFloor(2),
    redDots: getRedDots(),
    activity: clone(player.state === "garrisoning" ? recentActivity.garrisoning : recentActivity.free),
    garrison: player.garrisonNodeId ? getGarrisonCurrent(player.garrisonNodeId) : null,
  };
}

export function getFloor(floorId: number): Floor {
  if (floorId !== 2) {
    throw new Error("FLOOR_NOT_FOUND");
  }

  return {
    floor: 2,
    nameKey: "floor.f2.name",
    ruleKey: "floor.f2.rule",
    cleared: true,
    nextUnlocked: true,
    nodes: nodes.map(toTowerNode),
  };
}

export function getNode(nodeId: string): TowerNode | null {
  const node = findNode(nodeId);
  return node ? toTowerNode(node) : null;
}

export function challengeNode(body: { nodeId?: string; idempotencyKey?: string }): ChallengeResponse {
  if (!body.nodeId) {
    throw new ApiError("VALIDATION_ERROR", "nodeId is required", 400);
  }

  const cached = getIdempotent<ChallengeResponse>("challenge", body.idempotencyKey);
  if (cached) {
    return cached;
  }

  if (player.state === "battle") {
    throw new ApiError("PLAYER_IN_BATTLE", "Player is already in battle", 409, {
      battleId: player.activeBattleId,
    });
  }

  if (player.state === "garrisoning") {
    throw new ApiError("PLAYER_GARRISONING", "Player is currently garrisoning", 409, {
      nodeId: player.garrisonNodeId,
    });
  }

  const node = requireNode(body.nodeId);
  const state = toTowerNode(node).state;

  if (state === "protected") {
    throw new ApiError("NODE_PROTECTED", "Node is protected", 409, { nodeId: node.id });
  }

  if (state === "locked") {
    throw new ApiError("NODE_LOCKED", "Node is locked", 423, { nodeId: node.id });
  }

  if (state === "available" || state === "occupiedByMe" || state === "cleared") {
    throw new ApiError("NODE_NOT_CHALLENGEABLE", "Node is not challengeable", 409, { nodeId: node.id });
  }

  const opponentKind = state === "npcControlled" ? "npc" : "player";
  const pvpCost = opponentKind === "player" ? applyPvpCost() : undefined;
  const battleId = `battle_${Date.now()}_${battles.size + 1}`;
  const enemyCP = opponentKind === "npc" ? node.recommendedCP : (node.owner?.cp ?? node.recommendedCP);
  const outcome = settleOutcome(node, enemyCP, opponentKind);
  const typedRewards = outcome === "victory" ? getBattleRewards(node) : [];
  const drop = outcome === "victory" && opponentKind === "npc" ? createBattleDrop(battleId) : null;
  const result: BattleResult = {
    id: battleId,
    nodeId: node.id,
    outcome,
    opponentKind,
    enemyNameKey: opponentKind === "npc" ? node.nameKey : undefined,
    enemyName: opponentKind === "player" ? (node.owner?.name ?? "Unknown") : undefined,
    myCP: player.cp,
    enemyCP,
    nodeNameKey: node.nameKey,
    nodeType: node.type,
    floor: 2,
    stats: makeBattleStats(player.cp, enemyCP, outcome),
    rewards: rewardTokens(typedRewards),
    rewardTokens: rewardTokens(typedRewards),
    typedRewards,
    drop,
    nodeUnlocked: outcome === "victory" && opponentKind === "npc",
    canOccupy: outcome === "victory",
    upset: outcome === "victory" && player.cp < enemyCP,
  };
  const log = makeResolveLog(result);

  battles.set(battleId, {
    id: battleId,
    playerId: player.id,
    nodeId: node.id,
    status: "completed",
    result,
    log,
    createdAt: new Date().toISOString(),
  });

  if (outcome === "victory" && opponentKind === "npc") {
    node.state = "available";
  }

  if (outcome === "victory" && opponentKind === "player") {
    loseDefenderGarrison(node, player.name);
    node.state = "available";
    node.owner = undefined;
    node.protectedUntil = undefined;
  }

  if (outcome === "defeat" && opponentKind === "player" && node.owner) {
    node.owner.defenses += 1;
  }

  createBattleReport(result);

  player.state = "battle";
  player.activeBattleId = battleId;
  touchPlayer();

  const response: ChallengeResponse = {
    battleId,
    player: getPlayer(),
    battle: { battle: result, log },
    result,
    pvpCost,
    nextRoute: `/battle/resolve?battleId=${battleId}`,
  };

  setIdempotent("challenge", body.idempotencyKey, response);
  return clone(response);
}

export function getBattleResolve(battleId: string): BattleResolvePayload {
  const battle = requireBattle(battleId);
  return clone({ battle: battle.result, log: battle.log });
}

export function getBattleResult(battleId: string): BattleResult {
  const battle = requireBattle(battleId);

  if (battle.status !== "completed") {
    throw new ApiError("BATTLE_NOT_COMPLETED", "Battle is not completed", 409, { battleId });
  }

  if (battle.result.outcome === "defeat" || !battle.result.canOccupy) {
    player.state = "free";
    player.activeBattleId = undefined;
    touchPlayer();
  }

  return clone(battle.result);
}

export function occupyNode(body: { nodeId?: string; battleId?: string; idempotencyKey?: string }): OccupyResponse {
  if (!body.nodeId) {
    throw new ApiError("VALIDATION_ERROR", "nodeId is required", 400);
  }

  const cached = getIdempotent<OccupyResponse>("occupy", body.idempotencyKey);
  if (cached) {
    return cached;
  }

  if (player.state === "garrisoning") {
    throw new ApiError("PLAYER_GARRISONING", "Player is already garrisoning", 409, {
      nodeId: player.garrisonNodeId,
    });
  }

  const node = requireNode(body.nodeId);
  const nodeView = toTowerNode(node);

  if (body.battleId) {
    const battle = requireBattle(body.battleId);

    if (battle.nodeId !== node.id || battle.result.outcome !== "victory" || !battle.result.canOccupy) {
      throw new ApiError("NODE_NOT_OCCUPIABLE", "Battle does not allow occupying this node", 409, {
        nodeId: node.id,
        battleId: body.battleId,
      });
    }

    if (player.state !== "battle") {
      throw new ApiError("PLAYER_NOT_FREE", "Player must be in battle result state to occupy after battle", 409);
    }
  } else if (player.state !== "free") {
    throw new ApiError("PLAYER_NOT_FREE", "Player must be free to occupy directly", 409);
  }

  if (!body.battleId && nodeView.state !== "available") {
    throw new ApiError("NODE_NOT_OCCUPIABLE", "Node is not occupiable", 409, { nodeId: node.id });
  }

  if (body.battleId && !["available", "npcControlled", "playerOccupied"].includes(nodeView.state)) {
    throw new ApiError("NODE_NOT_OCCUPIABLE", "Node is not occupiable", 409, { nodeId: node.id });
  }

  const now = new Date();
  const startedAt = new Date(now.getTime() - 60 * 60_000);
  const protectedUntil = new Date(now.getTime() + protectionMinutes * 60_000).toISOString();
  const garrisonId = `garrison_${node.id}_${Date.now()}`;
  const garrison: GarrisonRecord = {
    id: garrisonId,
    playerId: player.id,
    nodeId: node.id,
    status: "active",
    startedAt: startedAt.toISOString(),
    lastClaimedAt: startedAt.toISOString(),
    rewardCapHours: node.rewardCapHours,
    defenseWins: 0,
    defenseLosses: 0,
    log: [],
  };

  garrisons.set(garrisonId, garrison);
  node.state = "occupiedByMe";
  node.owner = { playerId: player.id, name: player.name, cp: player.cp, garrisonedMin: 0, defenses: 0 };
  node.protectedUntil = protectedUntil;
  player.state = "garrisoning";
  player.garrisonNodeId = node.id;
  player.activeBattleId = undefined;
  touchPlayer();

  const response: OccupyResponse = {
    ok: true,
    garrisonId,
    player: getPlayer(),
    node: toTowerNode(node),
    garrison: toGarrisonView(garrison),
    protectedUntil,
    protectionMin: protectionMinutes,
    floor: getFloor(2),
    redDots: getRedDots(),
  };

  setIdempotent("occupy", body.idempotencyKey, response);
  return clone(response);
}

export function getGarrisonCurrent(nodeId?: string): Garrison | null {
  const active = getCurrentGarrison(nodeId);

  if (active) {
    return toGarrisonView(active);
  }

  if (nodeId === "n_med1") {
    return getSeedGarrisonView();
  }

  return null;
}

export function claimGarrison(body: { nodeId?: string; garrisonId?: string; idempotencyKey?: string }): ClaimGarrisonResponse {
  const cached = getIdempotent<ClaimGarrisonResponse>("claim", body.idempotencyKey);
  if (cached) {
    return cached;
  }

  const garrison = getCurrentGarrison(body.nodeId, body.garrisonId);

  if (!garrison) {
    if (body.nodeId === "n_med1") {
      const seedRewards = [rewards.gold(1240), rewards.fragments(8), rewards.stones(24)];
      applyRewards(seedRewards);
      const seedNode = requireNode("n_med1");
      seedNode.state = "available";
      seedNode.owner = undefined;
      seedNode.protectedUntil = undefined;
      const response = {
        ok: true,
        rewards: seedRewards,
        rewardTokens: rewardTokens(seedRewards),
        player: getPlayer(),
        garrison: null,
        redDots: getRedDots(),
      } satisfies ClaimGarrisonResponse;
      setIdempotent("claim", body.idempotencyKey, response);
      return clone(response);
    }

    throw new ApiError("GARRISON_NOT_FOUND", "Garrison is not found", 404);
  }

  const typedRewards = calculateGarrisonRewards(garrison);

  if (!typedRewards.length) {
    throw new ApiError("NO_REWARDS_TO_CLAIM", "No rewards to claim", 409);
  }

  applyRewards(typedRewards);
  garrison.lastClaimedAt = new Date().toISOString();

  if (garrison.status === "lost") {
    garrisons.delete(garrison.id);
    if (player.garrisonNodeId === garrison.nodeId) {
      player.garrisonNodeId = undefined;
    }
    player.state = "free";
  }

  touchPlayer();

  const response: ClaimGarrisonResponse = {
    ok: true,
    rewards: typedRewards,
    rewardTokens: rewardTokens(typedRewards),
    player: getPlayer(),
    garrison: garrison.status === "active" ? toGarrisonView(garrison) : null,
    redDots: getRedDots(),
  };

  setIdempotent("claim", body.idempotencyKey, response);
  return clone(response);
}

export function leaveGarrison(body: { nodeId?: string; garrisonId?: string; claim?: boolean; idempotencyKey?: string }): LeaveGarrisonResponse {
  const cached = getIdempotent<LeaveGarrisonResponse>("leave", body.idempotencyKey);
  if (cached) {
    return cached;
  }

  const garrison = getCurrentGarrison(body.nodeId, body.garrisonId);
  let claimedRewards: Reward[] | undefined;

  if (!garrison) {
    if (body.nodeId === "n_med1") {
      const node = requireNode("n_med1");
      node.state = "available";
      node.owner = undefined;
      node.protectedUntil = undefined;
      player.state = "free";
      player.garrisonNodeId = undefined;
      touchPlayer();
      const response = {
        ok: true,
        player: getPlayer(),
        floor: getFloor(2),
        redDots: getRedDots(),
      } satisfies LeaveGarrisonResponse;
      setIdempotent("leave", body.idempotencyKey, response);
      return clone(response);
    }

    throw new ApiError("GARRISON_NOT_FOUND", "Garrison is not found", 404);
  }

  if (garrison.status !== "active" || garrison.playerId !== player.id) {
    throw new ApiError("NOT_NODE_OWNER", "Only the active owner can leave garrison", 403);
  }

  if (body.claim) {
    claimedRewards = calculateGarrisonRewards(garrison);
    applyRewards(claimedRewards);
  }

  garrison.status = "left";
  const node = requireNode(garrison.nodeId);
  node.state = "available";
  node.owner = undefined;
  node.protectedUntil = undefined;
  player.state = "free";
  player.garrisonNodeId = undefined;
  player.activeBattleId = undefined;
  touchPlayer();

  const response: LeaveGarrisonResponse = {
    ok: true,
    player: getPlayer(),
    claimedRewards,
    rewardTokens: claimedRewards ? rewardTokens(claimedRewards) : undefined,
    floor: getFloor(2),
    redDots: getRedDots(),
  };

  setIdempotent("leave", body.idempotencyKey, response);
  return clone(response);
}

export function getEquipment(): EquipmentPayload {
  return clone(equipment);
}

export function equipGear(body: { gearId?: string; idempotencyKey?: string }): EquipGearResponse {
  if (!body.gearId) {
    throw new ApiError("VALIDATION_ERROR", "gearId is required", 400);
  }

  const cached = getIdempotent<EquipGearResponse>("equip", body.idempotencyKey);
  if (cached) {
    return cached;
  }

  const alreadyEquipped = gearSlots
    .map((slot) => equipment.equipped[slot])
    .find((gear) => gear?.id === body.gearId);

  if (alreadyEquipped) {
    const response: EquipGearResponse = {
      ok: true,
      player: getPlayer(),
      equipment: getEquipment(),
      equipped: clone(alreadyEquipped),
      replaced: null,
    };
    setIdempotent("equip", body.idempotencyKey, response);
    return clone(response);
  }

  const backpackIndex = equipment.backpack.findIndex((gear) => gear.id === body.gearId);

  if (backpackIndex < 0) {
    throw new ApiError("GEAR_NOT_FOUND", "Gear is not found", 404, { gearId: body.gearId });
  }

  const gear = { ...equipment.backpack[backpackIndex], isNew: false };
  const replaced = equipment.equipped[gear.slot] ?? null;
  equipment.backpack.splice(backpackIndex, 1);
  equipment.equipped[gear.slot] = gear;

  if (replaced) {
    equipment.backpack.push(replaced);
  }

  recalculatePlayerCp();
  const response: EquipGearResponse = {
    ok: true,
    player: getPlayer(),
    equipment: getEquipment(),
    equipped: clone(gear),
    replaced: clone(replaced),
  };

  setIdempotent("equip", body.idempotencyKey, response);
  return clone(response);
}

export function autoEquipGear(body: { strategy?: "cp"; idempotencyKey?: string } = {}): AutoEquipResponse {
  if (body.strategy && body.strategy !== "cp") {
    throw new ApiError("VALIDATION_ERROR", "strategy must be cp", 400, { strategy: body.strategy });
  }

  const cached = getIdempotent<AutoEquipResponse>("auto-equip", body.idempotencyKey);
  if (cached) {
    return cached;
  }

  const changedSlots: GearSlot[] = [];

  for (const slot of gearSlots) {
    const current = equipment.equipped[slot];
    const best = equipment.backpack
      .filter((gear) => gear.slot === slot)
      .sort((a, b) => (b.cp ?? 0) - (a.cp ?? 0))[0];

    if (best && (best.cp ?? 0) > (current?.cp ?? 0)) {
      equipGear({ gearId: best.id });
      changedSlots.push(slot);
    }
  }

  const response: AutoEquipResponse = {
    ok: true,
    player: getPlayer(),
    equipment: getEquipment(),
    changedSlots,
  };

  setIdempotent("auto-equip", body.idempotencyKey, response);
  return clone(response);
}

export function getReports(filter: string | undefined): ReportsPayload {
  const normalized = filter === "attack" || filter === "defense" ? filter : "all";
  const rows =
    normalized === "all"
      ? reports
      : reports.filter((report) =>
          normalized === "attack"
            ? report.kind === "attackWin" || report.kind === "attackLoss"
            : report.kind === "defenseWin" || report.kind === "nodeLost",
        );

  return { rows: clone(rows) };
}

export function markReportRead(reportId: string): { ok: true } {
  const report = reports.find((item) => item.id === reportId);

  if (!report) {
    throw new ApiError("REPORT_NOT_FOUND", "Report is not found", 404, { reportId });
  }

  report.unread = false;
  return { ok: true };
}

export function markReportsRead(): { ok: true } {
  for (const report of reports) {
    report.unread = false;
  }

  return { ok: true };
}

export function getSettings(): PlayerSettings {
  return clone(settings);
}

export function patchSettings(body: Partial<PlayerSettings>): PlayerSettings {
  const next: PlayerSettings = {
    ...settings,
  };

  if ("locale" in body) {
    if (body.locale !== "en" && body.locale !== "zh-CN") {
      throw new ApiError("VALIDATION_ERROR", "locale must be en or zh-CN", 400, { locale: body.locale });
    }
    next.locale = body.locale;
  }

  if ("battleSpeed" in body) {
    if (body.battleSpeed !== "normal" && body.battleSpeed !== "fast" && body.battleSpeed !== "instant") {
      throw new ApiError("VALIDATION_ERROR", "battleSpeed must be normal, fast, or instant", 400, {
        battleSpeed: body.battleSpeed,
      });
    }
    next.battleSpeed = body.battleSpeed;
  }

  for (const key of ["sfx", "music", "notifications"] as const) {
    if (key in body) {
      if (typeof body[key] !== "boolean") {
        throw new ApiError("VALIDATION_ERROR", `${key} must be boolean`, 400, { [key]: body[key] });
      }
      next[key] = body[key];
    }
  }

  next.updatedAt = new Date().toISOString();
  settings = next;
  return getSettings();
}

function requireNode(nodeId: string) {
  const node = findNode(nodeId);
  if (!node) {
    throw new ApiError("NODE_NOT_FOUND", "Node is not configured", 404, { nodeId });
  }
  return node;
}

function requireBattle(battleId: string) {
  const battle = battles.get(battleId);
  if (!battle || battle.playerId !== player.id) {
    throw new ApiError("BATTLE_NOT_FOUND", "Battle is not found", 404, { battleId });
  }
  return battle;
}

function findNode(nodeId: string) {
  return nodes.find((node) => node.id === nodeId);
}

function toTowerNode(node: StoredNode): TowerNode {
  const protectionMin =
    node.protectedUntil && new Date(node.protectedUntil).getTime() > Date.now()
      ? Math.max(1, Math.ceil((new Date(node.protectedUntil).getTime() - Date.now()) / 60_000))
      : undefined;
  const state =
    node.state === "protected" && !protectionMin
      ? "playerOccupied"
      : node.owner?.playerId === player.id
        ? "occupiedByMe"
        : node.state;
  const active = getCurrentGarrison(node.id);

  return {
    id: node.id,
    nameKey: node.nameKey,
    shortNameKey: node.shortNameKey,
    type: node.type,
    recommendedCP: node.recommendedCP,
    state,
    rewards: clone(node.rewards),
    rewardCapHours: node.rewardCapHours,
    cost: state === "playerOccupied" ? { dailyFreeUsed: player.pvpDaily?.freeUsed ?? 0, dailyFreeMax: 5 } : undefined,
    occupier:
      state === "playerOccupied" || state === "protected"
        ? node.owner
          ? { name: node.owner.name, cp: node.owner.cp, garrisonedMin: node.owner.garrisonedMin, defenses: node.owner.defenses }
          : undefined
        : undefined,
    garrison: state === "occupiedByMe" ? toNodeGarrisonState(active, node) : undefined,
    protectionMin,
  };
}

function toNodeGarrisonState(garrison: GarrisonRecord | undefined, node: StoredNode) {
  if (!garrison) {
    return {
      startedMin: 252,
      accumulated: { gold: 1240, fragments: 8, stones: 24 },
      capInMin: 348,
      defenses: 3,
    };
  }

  const view = toGarrisonView(garrison);
  return {
    startedMin: view.durationMin,
    accumulated: rewardsToMap(view.typedRewards ?? []),
    capInMin: Math.max(0, node.rewardCapHours * 60 - view.durationMin),
    defenses: view.defenses.wins,
  };
}

function toGarrisonView(garrison: GarrisonRecord): Garrison {
  const node = requireNode(garrison.nodeId);
  const now = new Date();
  const startedAt = new Date(garrison.startedAt);
  const durationMin = minutesBetween(startedAt, now);
  const typedRewards = calculateGarrisonRewards(garrison);
  const capMinutes = garrison.rewardCapHours * 60;
  const capPct = Math.min(100, Math.floor((durationMin / capMinutes) * 100));
  const capInMin = Math.max(0, capMinutes - durationMin);

  return {
    id: garrison.id,
    nodeId: garrison.nodeId,
    floor: 2,
    nodeNameKey: node.nameKey,
    nodeType: node.type,
    durationMin,
    rewards: rewardTokens(typedRewards),
    rewardTokens: rewardTokens(typedRewards),
    typedRewards,
    capPct,
    capInLabel: formatDuration(capInMin),
    capHours: garrison.rewardCapHours,
    capUrgent: capPct >= 90 && capPct < 100,
    capFull: capPct >= 100,
    defenses: { wins: garrison.defenseWins, losses: garrison.defenseLosses },
    log: clone(garrison.log),
    lost: garrison.status === "lost",
    lostTo: garrison.lostTo,
  };
}

function getSeedGarrisonView(): Garrison {
  return {
    id: "seed_garrison_n_med1",
    nodeId: "n_med1",
    floor: 2,
    nodeNameKey: "node.f2.crystalVault.name",
    nodeType: "medium",
    durationMin: 252,
    rewards: ["gold:1,240", "fragments:8", "stones:24"],
    rewardTokens: ["gold:1,240", "fragments:8", "stones:24"],
    typedRewards: [rewards.gold(1240), rewards.fragments(8), rewards.stones(24)],
    capPct: 62,
    capInLabel: "5h 48m",
    capHours: 10,
    defenses: { wins: 3, losses: 0 },
    log: [
      { result: "win", opponent: "Mira", time: "time.minAgo:4", fresh: true },
      { result: "win", opponent: "Ardyn", time: "time.hourAgo:1" },
    ],
  };
}

function getCurrentGarrison(nodeId?: string, garrisonId?: string) {
  return [...garrisons.values()].find(
    (garrison) =>
      garrison.playerId === player.id &&
      (garrison.status === "active" || garrison.status === "lost") &&
      (!nodeId || garrison.nodeId === nodeId) &&
      (!garrisonId || garrison.id === garrisonId),
  );
}

function applyPvpCost() {
  resetPvpDailyIfNeeded();
  const daily = player.pvpDaily ?? { date: utc8Date(new Date()), freeUsed: 0, freeMax: 5 as const };
  let ticketSpent = false;

  if (daily.freeUsed < daily.freeMax) {
    daily.freeUsed += 1;
  } else if (player.currencies.tickets > 0) {
    player.currencies.tickets -= 1;
    ticketSpent = true;
  } else {
    throw new ApiError("INSUFFICIENT_TICKETS", "Insufficient tickets", 409);
  }

  player.pvpDaily = daily;

  return {
    freeUsed: daily.freeUsed,
    freeMax: daily.freeMax,
    ticketSpent,
    ticketsRemaining: player.currencies.tickets,
  };
}

function resetPvpDailyIfNeeded() {
  const today = utc8Date(new Date());
  if (!player.pvpDaily || player.pvpDaily.date !== today) {
    player.pvpDaily = { date: today, freeUsed: 0, freeMax: 5 };
  }
}

function settleOutcome(node: StoredNode, enemyCP: number, opponentKind: "npc" | "player") {
  if (opponentKind === "npc") {
    return player.cp >= enemyCP * 0.75 ? "victory" : "defeat";
  }

  return player.cp >= enemyCP ? "victory" : "defeat";
}

function makeBattleStats(myCP: number, enemyCP: number, outcome: "victory" | "defeat") {
  return {
    rounds: outcome === "victory" ? 6 : 7,
    dmgDealt: Math.max(1200, Math.round(myCP * (outcome === "victory" ? 6.5 : 4.8))),
    dmgTaken: Math.max(800, Math.round(enemyCP * (outcome === "victory" ? 3.1 : 8.2))),
    hpLeft: outcome === "victory" ? Math.max(8, Math.min(72, Math.round(50 + (myCP - enemyCP) / 30))) : 0,
  };
}

function makeResolveLog(result: BattleResult): BattleResolveLogEntry[] {
  return [
    { side: "me", key: "resolve.log.start", vars: { cp: result.myCP } },
    { side: "enemy", key: "resolve.log.attack", vars: { dmg: Math.floor(result.stats.dmgTaken / 3) } },
    { side: "me", key: "resolve.log.crit", vars: { dmg: Math.floor(result.stats.dmgDealt / 2) } },
    { side: result.outcome === "victory" ? "me" : "enemy", key: "resolve.log.finish", vars: { outcome: result.outcome } },
  ];
}

function getBattleRewards(node: StoredNode) {
  return node.rewards.filter((reward) => reward.type !== "gear");
}

function createBattleDrop(battleId: string): Gear {
  const drop: Gear = {
    id: `drop_${battleId}`,
    slot: "weapon",
    tier: 3,
    nameKey: "gear.lichcleaver.name",
    rarity: "epic",
    cp: 232,
    level: 12,
    isNew: true,
    stats: [
      { k: "atk", v: 188 },
      { k: "crit", v: "9%" },
    ],
    attrs: {
      attack: 188,
      critRate: 9,
    },
  };

  equipment.backpack.unshift(drop);
  return clone(drop);
}

function createBattleReport(result: BattleResult) {
  const report: Report = {
    id: `report_${Date.now()}_${reports.length + 1}`,
    kind:
      result.outcome === "victory"
        ? "attackWin"
        : "attackLoss",
    opponentName:
      result.opponentKind === "player"
        ? (result.enemyName ?? "Unknown")
        : result.enemyNameKey ?? result.nodeNameKey,
    nodeNameKey: result.nodeNameKey,
    myCP: result.myCP,
    theirCP: result.enemyCP,
    rewards: result.typedRewards ?? [],
    time: "time.minAgo:1",
    battleId: result.id,
    createdAt: Date.now(),
    createdAtIso: new Date().toISOString(),
    unread: true,
  };

  reports.unshift(report);
}

function calculateGarrisonRewards(garrison: GarrisonRecord): Reward[] {
  const node = requireNode(garrison.nodeId);
  const now = garrison.status === "lost" && garrison.lostAt ? new Date(garrison.lostAt) : new Date();
  const startedAt = new Date(garrison.startedAt);
  const capAt = new Date(startedAt.getTime() + garrison.rewardCapHours * 60 * 60_000);
  const rewardUntil = new Date(Math.min(now.getTime(), capAt.getTime()));
  const lastClaimed = new Date(garrison.lastClaimedAt);
  const elapsedHours = Math.max(0, (rewardUntil.getTime() - lastClaimed.getTime()) / 3_600_000);

  return node.rewards
    .filter((reward) => reward.type !== "gear" && reward.amount)
    .map((reward) => ({
      type: reward.type,
      amount: Math.floor((reward.amount ?? 0) * elapsedHours),
    }))
    .filter((reward) => (reward.amount ?? 0) > 0);
}

function loseDefenderGarrison(node: StoredNode, attackerName: string) {
  const defender = [...garrisons.values()].find(
    (garrison) => garrison.nodeId === node.id && garrison.status === "active",
  );

  if (!defender) {
    return;
  }

  defender.status = "lost";
  defender.lostAt = new Date().toISOString();
  defender.lostTo = attackerName;
  defender.defenseLosses += 1;
  defender.log = [
    { result: "loss", opponent: attackerName, time: "time.minAgo:1", fresh: true },
    ...defender.log,
  ];
}

function applyRewards(typedRewards: Reward[]) {
  for (const reward of typedRewards) {
    if (!reward.amount || reward.type === "gear") {
      continue;
    }

    player.currencies[reward.type] += reward.amount;
  }
}

function recalculatePlayerCp() {
  player.cp =
    baseCp +
    gearSlots.reduce((total, slot) => total + (equipment.equipped[slot]?.cp ?? 0), 0);
  touchPlayer();
}

function rewardTokens(typedRewards: Reward[]) {
  return typedRewards.map((reward) =>
    reward.type === "gear"
      ? `gear:${reward.rarity ?? "common"}`
      : `${reward.type}:${(reward.amount ?? 0).toLocaleString("en-US")}`,
  );
}

function rewardsToMap(typedRewards: Reward[]) {
  return typedRewards.reduce<Partial<Record<RewardType, number>>>((acc, reward) => {
    if (reward.type !== "gear" && reward.amount) {
      acc[reward.type] = (acc[reward.type] ?? 0) + reward.amount;
    }
    return acc;
  }, {});
}

function getRedDots() {
  const betterGear = equipment.backpack.filter((gear) => {
    const current = equipment.equipped[gear.slot];
    return gear.isNew || (gear.cp ?? 0) > (current?.cp ?? 0);
  }).length;

  return clone({
    ...redDots,
    reports: reports.filter((report) => report.unread).length || false,
    equipment: betterGear || false,
    garrison: player.state === "garrisoning" ? 1 : false,
  });
}

function touchPlayer() {
  player.updatedAt = new Date().toISOString();
  player.version = (player.version ?? 0) + 1;
}

function getIdempotent<T>(endpoint: MutationEndpoint, key?: string) {
  return key ? clone((idempotency.get(`${endpoint}:${player.id}:${key}`) as T | undefined) ?? null) : null;
}

function setIdempotent(endpoint: MutationEndpoint, key: string | undefined, value: unknown) {
  if (key) {
    idempotency.set(`${endpoint}:${player.id}:${key}`, clone(value));
  }
}

function minutesBetween(from: Date, to: Date): number {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 60_000));
}

function formatDuration(minutes: number) {
  if (minutes <= 0) {
    return "0m";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

function utc8Date(date: Date) {
  return new Date(date.getTime() + 8 * 60 * 60_000).toISOString().slice(0, 10);
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
