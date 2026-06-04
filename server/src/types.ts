export interface Player {
  id: string;
  name: string;
  level: number;
  cp: number;
  stamina: number;
  staminaMax: number;
  currencies: {
    gold: number;
    stones: number;
    fragments: number;
    tickets: number;
  };
  state: PlayerState;
  garrisonNodeId?: string;
  activeBattleId?: string;
  pvpDaily?: {
    date: string;
    freeUsed: number;
    freeMax: 5;
  };
  highestUnlockedFloor?: number;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export type PlayerState = "free" | "garrisoning" | "battle";

export interface Floor {
  floor: number;
  nameKey: string;
  ruleKey: string;
  cleared: boolean;
  nextUnlocked: boolean;
  nodes: TowerNode[];
}

export type NodeType = "small" | "medium" | "major";

export type NodeState =
  | "npcControlled"
  | "available"
  | "playerOccupied"
  | "occupiedByMe"
  | "protected"
  | "locked"
  | "cleared";

export interface TowerNode {
  id: string;
  nameKey: string;
  shortNameKey?: string;
  type: NodeType;
  state: NodeState;
  recommendedCP: number;
  rewards: Reward[];
  rewardCapHours: number;
  cost?: NodeCost;
  occupier?: Occupier;
  garrison?: GarrisonState;
  protectionMin?: number;
}

export interface NodeCost {
  dailyFreeUsed: number;
  dailyFreeMax: number;
}

export interface Occupier {
  name: string;
  cp: number;
  garrisonedMin: number;
  defenses: number;
}

export interface GarrisonState {
  startedMin: number;
  accumulated: Partial<Record<RewardType, number>>;
  capInMin: number;
  defenses: number;
}

export type RewardType = "gold" | "stones" | "fragments" | "tickets" | "gear";
export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Reward {
  type: RewardType;
  amount?: number;
  rarity?: Rarity;
}

export interface Gear {
  id: string;
  slot: GearSlot;
  tier?: 1 | 2 | 3 | 4 | 5;
  rarity: Rarity;
  nameKey: string;
  attrs?: Partial<Record<AttrKey, number>>;
  cp?: number;
  level?: number;
  stats?: Array<{ k: "atk" | "def" | "hp" | "crit" | "spd"; v: string | number }>;
  isNew?: boolean;
}

export type GearSlot = "weapon" | "helmet" | "armor" | "ring" | "necklace" | "boots";

export type AttrKey =
  | "attack"
  | "health"
  | "defense"
  | "critRate"
  | "dodge"
  | "lifesteal"
  | "attackSpeed"
  | "nodeRewardBonus";

export type EquipmentPayload = {
  equipped: Record<GearSlot, Gear | null>;
  backpack: Gear[];
  capacity: number;
};

export interface EquipGearResponse {
  ok: true;
  player: Player;
  equipment: EquipmentPayload;
  equipped: Gear;
  replaced?: Gear | null;
}

export interface AutoEquipResponse {
  ok: true;
  player: Player;
  equipment: EquipmentPayload;
  changedSlots: GearSlot[];
}

export type BattleOutcome = "victory" | "defeat";
export type OpponentKind = "npc" | "player";

export interface BattleStats {
  rounds: number;
  dmgDealt: number;
  dmgTaken: number;
  hpLeft: number;
}

export interface BattleResult {
  id: string;
  nodeId: string;
  outcome: BattleOutcome;
  opponentKind: OpponentKind;
  enemyNameKey?: string;
  enemyName?: string;
  myCP: number;
  enemyCP: number;
  nodeNameKey: string;
  nodeType: NodeType;
  floor: number;
  stats: BattleStats;
  rewards: string[];
  rewardTokens?: string[];
  typedRewards?: Reward[];
  drop: Gear | null;
  nodeUnlocked: boolean;
  canOccupy: boolean;
  upset?: boolean;
}

export interface BattleResolveLogEntry {
  side: "me" | "enemy";
  key: string;
  vars?: Record<string, string | number>;
}

export interface BattleResolvePayload {
  battle: BattleResult;
  log: BattleResolveLogEntry[];
}

export interface ChallengeResponse {
  battleId: string;
  player: Player;
  battle: BattleResolvePayload;
  result: BattleResult;
  pvpCost?: {
    freeUsed: number;
    freeMax: 5;
    ticketSpent: boolean;
    ticketsRemaining: number;
  };
  nextRoute: string;
}

export interface OccupyResponse {
  ok: true;
  garrisonId: string;
  player: Player;
  node: TowerNode;
  garrison: Garrison;
  protectedUntil: string;
  protectionMin: number;
  floor?: Floor;
  redDots?: RedDots;
}

export interface ClaimGarrisonResponse {
  ok: true;
  rewards: Reward[];
  rewardTokens: string[];
  player: Player;
  garrison?: Garrison | null;
  redDots?: RedDots;
}

export interface LeaveGarrisonResponse {
  ok: true;
  player: Player;
  claimedRewards?: Reward[];
  rewardTokens?: string[];
  floor?: Floor;
  redDots?: RedDots;
}

export interface GarrisonDefenseEntry {
  result: "win" | "loss";
  opponent: string;
  time: string;
  fresh?: boolean;
  battleId?: string;
}

export interface Garrison {
  id?: string;
  nodeId?: string;
  floor: number;
  nodeNameKey: string;
  nodeType: NodeType;
  durationMin: number;
  rewards: string[];
  rewardTokens?: string[];
  typedRewards?: Reward[];
  capPct: number;
  capInLabel: string;
  capHours: number;
  capUrgent?: boolean;
  capFull?: boolean;
  defenses: { wins: number; losses: number };
  log: GarrisonDefenseEntry[];
  lost?: boolean;
  lostTo?: string;
}

export interface Report {
  id: string;
  kind: "attackWin" | "attackLoss" | "defenseWin" | "nodeLost";
  opponentName: string;
  nodeNameKey: string;
  myCP?: number;
  theirCP?: number;
  rewards?: Reward[];
  time?: string;
  battleId?: string;
  createdAt?: number;
  createdAtIso?: string;
  unread: boolean;
}

export type ReportsPayload = {
  rows: Report[];
  nextCursor?: string;
};

export interface PlayerSettings {
  locale: "en" | "zh-CN";
  sfx: boolean;
  music: boolean;
  notifications: boolean;
  battleSpeed: "normal" | "fast" | "instant";
  updatedAt?: string;
}

export interface ActivityRow {
  type:
    | "defeatedNpc"
    | "lootRare"
    | "unlockedFloor"
    | "defenseSuccess"
    | "nodeLost";
  vars: Record<string, string | number>;
  timeKey: string;
  timeVars: Record<string, string | number>;
  fresh?: boolean;
}

export interface RedDots {
  reports?: boolean | number;
  garrison?: boolean | number;
  equipment?: boolean | number;
  floor?: boolean | number;
}

export type BootstrapPayload = {
  player: Player;
  floor: Floor;
  redDots: RedDots;
  activity: ActivityRow[];
  garrison?: Garrison | null;
};

export interface ApiErrorResponse {
  ok: false;
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
  requestId: string;
}

export type ApiErrorCode =
  | "PLAYER_NOT_FREE"
  | "PLAYER_IN_BATTLE"
  | "PLAYER_GARRISONING"
  | "NODE_NOT_FOUND"
  | "NODE_LOCKED"
  | "NODE_PROTECTED"
  | "NODE_NOT_CHALLENGEABLE"
  | "NODE_NOT_OCCUPIABLE"
  | "NOT_NODE_OWNER"
  | "GARRISON_NOT_FOUND"
  | "NO_REWARDS_TO_CLAIM"
  | "GEAR_NOT_FOUND"
  | "GEAR_SLOT_MISMATCH"
  | "REPORT_NOT_FOUND"
  | "INSUFFICIENT_TICKETS"
  | "CONFLICT_STATE_CHANGED"
  | "DUPLICATE_REQUEST"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | "BATTLE_NOT_FOUND"
  | "BATTLE_NOT_COMPLETED";
