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

export interface Reward {
  type: RewardType;
  amount?: number;
  rarity?: Rarity;
}

export type Rarity = "common" | "rare" | "epic" | "legendary";

export type GearSlot =
  | "weapon"
  | "helmet"
  | "armor"
  | "ring"
  | "necklace"
  | "boots";

export type GearStatKey = "atk" | "def" | "hp" | "crit" | "spd";

export interface GearStat {
  k: GearStatKey;
  v: string | number;
}

export type AttrKey =
  | "attack"
  | "health"
  | "defense"
  | "critRate"
  | "dodge"
  | "lifesteal"
  | "attackSpeed"
  | "nodeRewardBonus";

export interface Gear {
  id: string;
  slot: GearSlot;
  tier?: 1 | 2 | 3 | 4 | 5;
  rarity: Rarity;
  nameKey: string;
  attrs?: Partial<Record<AttrKey, number>>;
  cp?: number;
  level?: number;
  stats?: GearStat[];
  isNew?: boolean;
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

export interface GarrisonDefenseEntry {
  result: "win" | "loss";
  opponent: string;
  time: string;
  fresh?: boolean;
}

export type GarrisonStateKey = "normal" | "capNear" | "capFull" | "empty" | "lost";

export interface Garrison {
  floor: number;
  nodeNameKey: string;
  nodeType: NodeType;
  durationMin: number;
  rewards: string[];
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

export type BasicOkResponse = { ok: true };

export interface BattleLog {
  id: string;
  result: "victory" | "defeat";
  frames: Array<{
    t: number;
    actor: "self" | "enemy";
    dmg: number;
    crit?: boolean;
    heal?: number;
  }>;
  rewards: Reward[];
  unlockedFloor?: number;
  nodeNowAvailable?: boolean;
}

export type EquipmentPayload = {
  equipped: Record<GearSlot, Gear | null>;
  backpack: Gear[];
  capacity: number;
};

export type BootstrapPayload = {
  player: Player;
  floor: Floor;
  redDots: RedDots;
  activity: ActivityRow[];
};

export type ReportsPayload = {
  rows: Report[];
  nextCursor?: string;
};

export type OccupyResponse = {
  player: Player;
  node: TowerNode;
};

export type ClaimResponse = {
  rewards: Reward[];
  player: Player;
};

export type LeaveResponse = {
  player: Player;
};

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
  unread: boolean;
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
