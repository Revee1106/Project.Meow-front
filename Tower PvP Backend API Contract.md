# Tower PvP Backend API Contract v0.1 Final

## 1. Overview

This contract defines the MVP backend API needed to replace the current `tower-pvp` frontend mock service layer. It is based primarily on the real production frontend source under `src/`, especially `src/services/types.ts`, `src/services/api.ts`, `src/services/queries.ts`, the page components, stores, and mock fixtures. The design handoff files are used only to clarify gameplay intent and missing backend responsibilities.

Version: `v0.1 Final`

Scope covers the implemented v1 + v2 MVP screens:

- Home
- Floor
- Node Detail Sheet
- Battle Resolving / Replay
- Battle Result
- Garrison
- Equipment
- Reports
- Settings

The first backend version must be an in-memory API with the same response shapes expected by the current frontend. It should not connect to a database in v0.1. Database persistence can be added later without changing frontend components. API payloads should stay close to `services/types.ts` and `services/api.ts` so `VITE_USE_MOCKS=false` can swap the current mock layer for HTTP with minimal service-layer changes.

The backend is authoritative for player state, node ownership, battle settlement, reward settlement, equipment ownership/equipping, reports, and red-dot summaries. The client must not decide battle results, rewards, CP changes, or node ownership.

Final v0.1 product decisions:

- PVE NPC challenges have no attempt limit in MVP.
- PVP challenges allow 5 free attempts per player per day. After that, each PVP challenge consumes 1 `tickets`; if tickets are insufficient, return `INSUFFICIENT_TICKETS`.
- Occupying a node applies a fixed 5-minute protection window. Backend stores `protectedUntil`; frontend receives derived `protectionMin`.
- `available` nodes can be occupied directly.
- Defeating an NPC changes the node to `available`; Battle Result can then call Occupy.
- When a node is lost, the defender loses the stronghold, but already accrued unclaimed rewards remain claimable by the defender. The attacker does not steal old rewards.
- Battle Resolve MVP does not need true frame-by-frame combat. Backend returns the final `BattleResult` plus a simplified i18n log.
- Settings MVP remains `localStorage` first. `GET /api/settings` and `PATCH /api/settings` stay in the contract, but backend implementation can be deferred.
- Backend reward logic uses typed `Reward[]` internally. API responses temporarily return both typed rewards and `rewardTokens` for current v2 UI compatibility.
- `occupiedByMe` is a current-player view state only. It is never persisted.
- Node Detail challenge integration must call `challengeNode(node.id)` and must not route to a fixed mock battle id.

## 2. Frontend Inventory Summary

| Page | Route | Data used | Service methods | Required state | Actions |
|---|---|---|---|---|---|
| Home | `/` | `Player`, current `Floor`, `RedDots`, `ActivityRow[]`, current garrison node from floor nodes | `fetchBootstrap`, `claimGarrison`, `leaveGarrison` | `player.state`, `player.garrisonNodeId`, node `garrison.accumulated`, red dots | go floor, go garrison, claim rewards, leave node, go equipment/reports/settings |
| Floor | `/floor/:floorId`, node sheet via `?node=` | `Floor`, `TowerNode[]`, `Player` | `fetchFloor`, `fetchPlayerProfile`, indirectly `occupyNode`, `leaveGarrison` from sheet | player free/battle/garrisoning; node state variants | open node sheet, switch floor, occupy available node, route to battle, go garrison, leave |
| Node Detail | overlay on Floor | selected `TowerNode`, `Player`, occupier, garrison summary, rewards, cost | `challengeNode`, `occupyNode`, `leaveGarrison`; current code still routes to fixed mock battle and must be changed during integration | derived detail variant: available, npcControlled, playerOccupied, occupiedByMe, protected, locked, blocked | occupy, challenge NPC/player, claim/go garrison, leave, blocked go garrison |
| Battle Resolve | `/battle/resolve?battleId=` | `BattleResolvePayload` = `BattleResult` + `BattleResolveLogEntry[]` | `fetchBattleResolve` | battle resolving/completed theater | play log, speed, skip, auto route to result |
| Battle Result | `/battle/result?battleId=` | `BattleResult`, optional `Gear` drop | `fetchBattleResult`, `occupyBattleNode`, `equipGear` | battle completed, victory/defeat, canOccupy | return floor, occupy, equip drop, retry |
| Battle legacy | `/battle/:battleId` | legacy `BattleLog` frames and rewards | `fetchBattle` | compatibility route only | display frames/rewards; not the main battle contract |
| Garrison | `/garrison?nodeId=&state=` | `Garrison` view model | `fetchGarrison`, `claimGarrisonRewards`, `leaveGarrisonNode` | active, capNear, capFull, empty, lost | claim, leave, confirm leave, return floor |
| Equipment | `/equipment` | `EquipmentPayload`, equipped gear, backpack gear | `fetchEquipment`, `equipGear`; auto-equip currently client-derived | equipped slots, selected backpack item | compare, equip, auto-equip best, open settings |
| Reports | `/reports?filter=` | `ReportsPayload`, `Report[]` | `fetchReports`, `markReportsRead` | unread count, attack/defense filter | mark all read, open replay/result |
| Settings | `/settings` | local `settingsStore`, `i18nStore`, `Player` | currently no API | locale, sfx, music, notifications, battleSpeed | change locale/preferences; optional backend persistence |

Important observed frontend behavior:

- `VITE_USE_MOCKS` defaults to mocks unless it is exactly `"false"`.
- `httpApi` currently implements only bootstrap, profile, floor, challenge, direct occupy, claim, leave, reports, legacy battle, and equipment. v2 methods are `notImplemented` in real HTTP mode and must be completed during backend integration.
- `NodeDetailSheet` challenge currently navigates directly to `/battle/resolve?battleId=victoryNpc` instead of calling `challengeNode`. Integration must call `POST /api/tower/challenge` through `challengeNode(node.id)` and then navigate with the returned `battleId`.
- `SettingsPage` persists to `localStorage` only. Backend settings endpoints remain in this contract, but their implementation can be deferred for v0.1.

## 3. Existing Frontend Service Mapping

| Frontend service method | Current mock source | Proposed backend endpoint | Notes |
|---|---|---|---|
| `fetchBootstrap()` | `mockPlayer`, `floor2`, `redDots`, `recentActivity` | `GET /api/bootstrap` | Home initial aggregate. |
| `fetchPlayerProfile()` | `mockSession.player` | `GET /api/player/profile` | Used by Floor to sync store. |
| `fetchFloor(floorId)` | `mockSession.floors` / fallback empty floor | `GET /api/floors/:floorId` | Must return current-player view states. |
| `challengeNode(nodeId)` | creates legacy `BattleLog` and sets player `battle` | `POST /api/tower/challenge` | Main response is `ChallengeResponse` with `BattleResolvePayload`/`BattleResult`; legacy `BattleLog` is compatibility only. |
| `occupyNode(nodeId)` | directly marks node `occupiedByMe` | `POST /api/strongholds/occupy` | Supports directly occupying `available` nodes. Backend persists occupation and `protectedUntil`; `occupiedByMe` is only a returned view state. |
| `claimGarrison(nodeId)` | older v1 claim using node `garrison.accumulated` | `POST /api/garrison/claim` | Must use the same backend `ClaimGarrisonResponse` as `claimGarrisonRewards`. |
| `leaveGarrison(nodeId, claim)` | older v1 leave flow | `POST /api/garrison/leave` | Must use the same backend `LeaveGarrisonResponse` as `leaveGarrisonNode`; body can include `claim`. |
| `fetchReports()` | `reportsFixture` | `GET /api/reports` | Should support pagination later. |
| `fetchBattle(battleId)` | `mockSession.battles` | `GET /api/battles/:battleId` | Compatibility route. Main line should return `BattleResolvePayload`; legacy `BattleLog` support is temporary. |
| `fetchBattleResolve(battleId)` | `resolveLog` + `battleFixtures` | `GET /api/battles/:battleId` | Main Battle Resolve payload: final result plus simplified i18n log, not true frame-by-frame combat. |
| `fetchBattleResult(battleId)` | `battleFixtures` | `GET /api/battles/:battleId/result` | Result page shape. |
| `occupyBattleNode({ nodeId, battleId })` | calls `occupyNode`, creates garrison fixture | `POST /api/strongholds/occupy` | Body should include `battleId` to verify win. |
| `equipGear({ gearId })` | moves gear from backpack to equipped | `POST /api/equipment/equip` | Response should include updated equipment/player. |
| `fetchGarrison(nodeId, opts)` | `garrisonFixtures` | `GET /api/garrison/current?nodeId=` | `state` query is dev/mock only. |
| `claimGarrisonRewards({ nodeId })` | clears string reward tokens | `POST /api/garrison/claim` | Same backend response as `claimGarrison`: typed `rewards` plus `rewardTokens`. |
| `leaveGarrisonNode({ nodeId })` | calls old leave and deletes garrison fixture | `POST /api/garrison/leave` | Same backend response as `leaveGarrison`; v2 defaults to `claim=false`. |
| `fetchEquipment()` | `equipmentFixture` | `GET /api/equipment` | Equipment page. |
| `markReportsRead()` | marks all reports unread false | `POST /api/reports/read-all` | Current frontend has no single-report read mutation. |

Recommended new service methods:

- `fetchNode(nodeId)` -> `GET /api/nodes/:nodeId` for direct node refresh after a stale sheet.
- `autoEquipGear()` -> `POST /api/equipment/auto-equip`; current auto-equip only equips the first locally detected upgrade.
- `markReportRead(reportId)` -> `POST /api/reports/:reportId/read`; required by the prompt and useful when replay is opened.
- `fetchSettings()` / `patchSettings()` -> `GET /api/settings`, `PATCH /api/settings`; current settings are local only and backend implementation can be deferred for v0.1.

## 4. Core Backend Modules

| Module | Responsibility | Main data | Main APIs | Relations |
|---|---|---|---|---|
| Auth / Session placeholder | Resolve current player for MVP, later auth token/session | `sessionId`, `playerId` | all APIs via current player | Used by all modules. MVP can hardcode a dev player. |
| Player | Player profile, currencies, CP, state machine | `Player`, `CurrencyWallet`, `PlayerState` | bootstrap, profile | Owns active battle/garrison state. |
| Tower | Global tower config and unlocked floors | floor config, unlock rules | bootstrap | Reads floor/node config. |
| Floor | Current-player floor view model | `Floor`, node list | `GET /api/floors/:floorId` | Derives node display states. |
| Node | Node config and ownership/protection | `Node`, `NodeOccupation` | node detail, challenge validation, occupy | Source for ownership and protection. |
| Battle | Auto settlement, replay log, result | `Battle`, `BattleResult`, frames/log | challenge, get battle, get result | Updates nodes, rewards, reports. |
| Garrison | Active/lost garrison lifecycle and lazy rewards | `Garrison`, rewards, defense log | current, claim, leave | Tied to player state and node ownership. |
| Equipment | Gear inventory, equipped slots, CP derivation | `Gear`, `EquipmentState` | equipment, equip, auto-equip | Battle drops create gear. |
| Reports | Attack/defense reports and read state | `Report` | list, read, read-all | Generated by battle/garrison events. |
| Settings | Player preferences | `PlayerSettings` | get, patch | Optional persistence for current local settings. |
| Rewards | Shared reward token generation and application | `Reward`, drop tables | used internally | Applies to battle, garrison, claim, drops. |

## 5. Data Models

Use ISO 8601 strings for persisted timestamps and API responses, except current frontend-only fields such as `createdAt?: number` that can remain supported during migration. New backend fields should use ISO strings consistently.

```ts
type ISODateTime = string;

// persisted
export interface Player {
  id: string;
  name: string; // raw user string; never translated
  level: number;
  cp: number; // derived by backend from equipment, persisted/cacheable
  stamina: number;
  staminaMax: number;
  currencies: CurrencyWallet;
  state: PlayerState; // backend authoritative
  garrisonNodeId?: string; // active or lost-unclaimed garrison
  activeBattleId?: string;
  pvpDaily: PlayerPvpDailyState; // persisted/reset daily
  highestUnlockedFloor: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  version: number;
}

export type PlayerState = "free" | "battle" | "garrisoning";

export interface PlayerPvpDailyState {
  date: string; // YYYY-MM-DD in backend reset timezone
  freeUsed: number;
  freeMax: 5;
}

export interface CurrencyWallet {
  gold: number;
  stones: number;
  fragments: number;
  tickets: number;
}

// floor config plus current-player view
export interface Floor {
  floor: number;
  nameKey: string; // i18n content key
  ruleKey: string; // i18n content key
  cleared: boolean; // derived for current player
  nextUnlocked: boolean; // derived for current player
  nodes: TowerNode[];
}

export type NodeType = "small" | "medium" | "major";

// View state returned to the current player.
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
  floor: number;
  nameKey: string;
  shortNameKey?: string;
  type: NodeType;
  state: NodeState; // derived view
  recommendedCP: number;
  rewards: Reward[];
  rewardCapHours: number;
  cost?: NodeCost;
  occupier?: Occupier; // derived public owner summary
  garrison?: GarrisonState; // only for occupiedByMe
  protectionMin?: number; // derived from protectedUntil
}

export interface NodeCost {
  dailyFreeUsed: number; // derived from PVP daily counters; omitted for PVE
  dailyFreeMax: number; // fixed 5 for PVP in v0.1
}

export interface Occupier {
  playerId?: string; // omit or mask if not needed by frontend
  name: string; // raw user string
  cp: number;
  garrisonedMin: number; // derived from garrison startedAt
  defenses: number;
}

// persisted node occupation. This is the persisted source for node ownership.
export interface NodeOccupation {
  id: string;
  nodeId: string;
  playerId: string;
  garrisonId: string;
  startedAt: ISODateTime;
  protectedUntil: ISODateTime; // fixed startedAt + 5 minutes in v0.1
  endedAt?: ISODateTime;
  status: "active" | "left" | "lost";
  version: number;
}

// persisted occupation/garrison state
export interface Garrison {
  id: string;
  playerId: string;
  nodeId: string;
  status: GarrisonStatus;
  startedAt: ISODateTime;
  endedAt?: ISODateTime;
  lostAt?: ISODateTime;
  lostToPlayerId?: string;
  lastClaimedAt: ISODateTime;
  rewardCapHours: number;
  defenseWins: number;
  defenseLosses: number;
  unclaimedRewards: Reward[]; // persisted after lost or claim checkpoints
  version: number;
}

export type GarrisonStatus = "active" | "left" | "lost";

// view embedded in TowerNode for current player
export interface GarrisonState {
  startedMin: number; // derived
  accumulated: Partial<Record<RewardType, number>>; // lazy-derived
  capInMin: number; // derived
  defenses: number; // derived
}

// view used by GarrisonPage; compatible with current frontend
export interface GarrisonView {
  id: string;
  nodeId: string;
  floor: number;
  nodeNameKey: string;
  nodeType: NodeType;
  durationMin: number;
  rewards: string[]; // current frontend tokens, same content as rewardTokens
  rewardTokens: string[]; // compatibility for current v2 UI
  typedRewards: Reward[]; // canonical API representation
  capPct: number;
  capInLabel: string;
  capHours: number;
  capUrgent?: boolean;
  capFull?: boolean;
  defenses: { wins: number; losses: number };
  log: GarrisonDefenseEntry[];
  lost?: boolean;
  lostTo?: string; // raw user string
}

export type RewardType = "gold" | "stones" | "fragments" | "tickets" | "gear";

export interface Reward {
  type: RewardType;
  amount?: number;
  rarity?: GearRarity;
  gearId?: string; // for concrete drops after settlement
}

export type GearSlot =
  | "weapon"
  | "helmet"
  | "armor"
  | "ring"
  | "necklace"
  | "boots";

export type GearRarity = "common" | "rare" | "epic" | "legendary";

export type GearAttribute =
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
  ownerPlayerId: string; // persisted; not always returned
  slot: GearSlot;
  tier?: 1 | 2 | 3 | 4 | 5;
  rarity: GearRarity;
  nameKey: string; // i18n content key
  attrs?: Partial<Record<GearAttribute, number>>;
  cp?: number;
  level?: number;
  stats?: GearStat[]; // frontend display rows, derived from attrs
  isNew?: boolean; // display/user inventory state
  createdAt?: ISODateTime;
}

export type GearStatKey = "atk" | "def" | "hp" | "crit" | "spd";
export interface GearStat {
  k: GearStatKey;
  v: string | number;
}

export type EquipmentState = {
  equipped: Record<GearSlot, Gear | null>;
  backpack: Gear[];
  capacity: number;
};

export interface Battle {
  id: string;
  playerId: string;
  nodeId: string;
  opponentKind: OpponentKind;
  opponentPlayerId?: string;
  status: BattleStatus;
  result?: BattleResult;
  log: BattleResolveLogEntry[]; // MVP canonical simplified i18n log
  legacyFrames?: BattleLogFrame[]; // compatibility only
  createdAt: ISODateTime;
  completedAt?: ISODateTime;
  expiresAt?: ISODateTime;
  idempotencyKey?: string;
}

export type BattleStatus = "resolving" | "completed" | "expired" | "abandoned";
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
  enemyNameKey?: string; // NPC/content only
  enemyName?: string; // raw player name
  myCP: number;
  enemyCP: number;
  nodeNameKey: string;
  nodeType: NodeType;
  floor: number;
  stats: BattleStats;
  rewards: string[]; // current frontend token list, same content as rewardTokens
  rewardTokens: string[]; // compatibility for current v2 UI
  typedRewards: Reward[]; // canonical backend/API reward representation
  drop: Gear | null;
  nodeUnlocked: boolean;
  canOccupy: boolean;
  upset?: boolean;
}

export interface BattleLogFrame {
  t: number; // ms from battle start
  actor: "self" | "enemy";
  dmg: number;
  crit?: boolean;
  heal?: number;
}

export interface BattleResolveLogEntry {
  side: "me" | "enemy";
  key: string; // i18n key
  vars?: Record<string, string | number>;
}

export interface BattleResolvePayload {
  battle: BattleResult;
  log: BattleResolveLogEntry[];
}

export interface GarrisonDefenseEntry {
  result: "win" | "loss";
  opponent: string; // raw user string
  time: string; // current frontend i18n token, e.g. "time.minAgo:4"
  fresh?: boolean;
  battleId?: string;
}

export interface Report {
  id: string;
  kind: ReportType;
  opponentName: string; // raw user string
  nodeNameKey: string;
  myCP?: number;
  theirCP?: number;
  rewards?: Reward[];
  time?: string; // current frontend display token
  battleId?: string;
  createdAt?: number; // legacy current frontend
  createdAtIso?: ISODateTime;
  unread: boolean;
}

export type ReportType = "attackWin" | "attackLoss" | "defenseWin" | "nodeLost";

export interface PlayerSettings {
  locale: "en" | "zh-CN";
  sfx: boolean;
  music: boolean;
  notifications: boolean;
  battleSpeed: "normal" | "fast" | "instant";
  updatedAt?: ISODateTime;
}

export interface NotificationSummary {
  reports?: boolean | number;
  garrison?: boolean | number;
  equipment?: boolean | number;
  floor?: boolean | number;
}

export type RedDots = NotificationSummary;

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
```

Persistence notes:

- Persist for in-memory v0.1 state: `Player`, wallet, player state, PVP daily counters, floors/nodes config, node occupation/garrison rows, battles, simplified battle logs/results, gear ownership/equipped status, reports. Settings endpoints remain in the contract but can keep returning local/default values until backend persistence is prioritized.
- Derived: `cp`, `Floor.cleared`, `Floor.nextUnlocked`, current-player `NodeState`, `Occupier.garrisonedMin`, `GarrisonView.durationMin`, `capPct`, `capInLabel`, red dots, activity feed.
- Display/view only: `occupiedByMe`, `nameKey`, `shortNameKey`, `nodeNameKey`, `enemyNameKey`, `time` tokens, `stats` rows when derived from attributes.

## 6. State Machines

### Player State Machine

States:

- `free`
- `battle`
- `garrisoning`

Allowed transitions:

| Transition | Allowed | Trigger |
|---|---:|---|
| `free -> battle` | yes | successful `POST /api/tower/challenge` |
| `battle -> free` | yes | battle completed and result viewed/expired without occupation |
| `free -> garrisoning` | yes | successful direct occupation of available node |
| `battle -> garrisoning` | yes | successful occupy from a winning battle result |
| `garrisoning -> free` | yes | leave node; lost node after claim/return cleanup |
| `garrisoning -> battle` | no by default | MVP should reject challenges while garrisoning |
| `battle -> battle` | no | reject duplicate challenge unless idempotency returns existing battle |

Backend rule: at most one active player state is true. The server must re-read player state before challenge, occupy, claim, leave, or equip operations that can affect CP/state.

### Node State Machine

Current frontend states:

- `npcControlled`
- `available`
- `playerOccupied`
- `occupiedByMe`
- `protected`
- `locked`
- `cleared`

Recommended persisted raw node ownership status:

```ts
type NodeOwnerKind = "npc" | "none" | "player";
type NodeDbStatus = "locked" | "npcControlled" | "available" | "occupied";
```

View-state derivation:

- `locked`: persisted lock or floor not unlocked for current player.
- `npcControlled`: persisted NPC owner.
- `available`: no owner and current player can occupy/challenge state allows it.
- `playerOccupied`: owner is another player and not protected.
- `occupiedByMe`: owner is current player, derived from occupation row.
- `protected`: owner is another player and `protectedUntil > now`.
- `cleared`: current player has cleared the node for floor progression; display-only if needed.

Transitions:

- NPC defeated: `npcControlled -> available`; if major/boss, may set floor cleared and unlock next floor. Battle Result should expose `canOccupy=true` when the resulting available node can be occupied.
- Player occupies available node: `available -> occupied`; backend creates `NodeOccupation.protectedUntil = now + 5 minutes`. Current player sees `occupiedByMe`; others see `protected` while `protectedUntil > now`, otherwise `playerOccupied`.
- Player leaves: `occupied -> available`. API should return floor/node refresh.
- Other player defeats occupier: old garrison becomes `lost`; node occupation moves to attacker or `available` depending whether attacker immediately occupies. MVP should use attacker occupation after `Occupy`.
- Protection expires: derived `protected -> playerOccupied`.

### Battle State Machine

States:

- `resolving`
- `completed`
- `expired` / `abandoned` optional; MVP may omit except cleanup.

Flow:

1. `POST /api/tower/challenge` validates player is `free`, node challengeable, costs available, and creates battle.
2. Backend auto-settles immediately or after a short artificial delay.
3. Player state becomes `battle` while resolving/result is pending.
4. `GET /api/battles/:battleId` returns `BattleResolvePayload` for resolve theater. The MVP log is a simplified i18n log, not a true frame-by-frame simulation.
5. `GET /api/battles/:battleId/result` returns final `BattleResult`.
6. If result is defeat or user returns to floor, backend can move `player.state` back to `free`.
7. If user occupies after victory, `battle -> garrisoning`.

`GET /api/battles/:battleId` returns the main `BattleResolvePayload`. Keep `/result` as the dedicated result endpoint because the current frontend has separate query hooks. Legacy `BattleLog`/frame compatibility is allowed only for `/battle/:battleId` until that route is retired.

### Garrison State Machine

States:

- `active`
- `left`
- `lost`

Rules:

- `claim` does not change `active`; it only transfers lazy-calculated rewards to the wallet and resets `lastClaimedAt`.
- `leave` changes `active -> left`, frees player, removes occupation, and may discard or claim rewards according to request body.
- `lost` is caused by another player's successful attack. Player state should recover to `free`, but the lost garrison remains readable until unclaimed rewards are claimed or acknowledged.
- Lost garrison must still allow claiming rewards accrued before loss. The attacker does not steal those old rewards. After claim, mark the garrison settled/archived and clear `player.garrisonNodeId`.

## 7. API Endpoints

Common conventions:

- Base path: `/api`.
- Authentication: MVP uses current dev session; later use bearer token/session cookie.
- Error response:

```ts
type ApiErrorResponse = {
  ok: false;
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
  requestId: string;
};
```

Final v0.1 API list:

| Method | Path | Primary frontend service |
|---|---|---|
| `GET` | `/api/health` | backend health check |
| `GET` | `/api/bootstrap` | `fetchBootstrap` |
| `GET` | `/api/player/profile` | `fetchPlayerProfile` |
| `GET` | `/api/floors/:floorId` | `fetchFloor` |
| `GET` | `/api/nodes/:nodeId` | recommended `fetchNode` |
| `POST` | `/api/tower/challenge` | `challengeNode` |
| `GET` | `/api/battles/:battleId` | `fetchBattleResolve`, compatibility `fetchBattle` |
| `GET` | `/api/battles/:battleId/result` | `fetchBattleResult` |
| `GET` | `/api/garrison/current` | `fetchGarrison` |
| `POST` | `/api/strongholds/occupy` | `occupyNode`, `occupyBattleNode` |
| `POST` | `/api/garrison/claim` | `claimGarrison`, `claimGarrisonRewards` |
| `POST` | `/api/garrison/leave` | `leaveGarrison`, `leaveGarrisonNode` |
| `GET` | `/api/equipment` | `fetchEquipment` |
| `POST` | `/api/equipment/equip` | `equipGear` |
| `POST` | `/api/equipment/auto-equip` | recommended `autoEquipGear` |
| `GET` | `/api/reports` | `fetchReports` |
| `POST` | `/api/reports/:reportId/read` | recommended `markReportRead` |
| `POST` | `/api/reports/read-all` | `markReportsRead` |
| `GET` | `/api/settings` | reserved `fetchSettings` |
| `PATCH` | `/api/settings` | reserved `patchSettings` |

### Bootstrap / Player

#### `GET /api/bootstrap`

- Purpose: Home aggregate needed on app launch.
- Request params/body: none.
- Response: `BootstrapResponse`.
- Errors: `INTERNAL_ERROR`.
- Pages: Home, app shell initialization.
- Service: `fetchBootstrap`.
- Notes: Should calculate lazy garrison rewards before returning floor/garrison summaries.

#### `GET /api/player/profile`

- Purpose: Return current player profile.
- Request: none.
- Response: `Player`.
- Errors: `INTERNAL_ERROR`.
- Pages: Floor, shell/player store.
- Service: `fetchPlayerProfile`.

### Floor / Node

#### `GET /api/floors/:floorId`

- Purpose: Return a floor view for current player.
- Params: `floorId: number|string`.
- Response: `Floor`.
- Errors: `NODE_NOT_FOUND` if floor not configured, `INTERNAL_ERROR`.
- Pages: Floor, Home bootstrap internally.
- Service: `fetchFloor`.
- Notes: Derive `occupiedByMe` and `protected`; do not persist those exact view states.

#### `GET /api/nodes/:nodeId`

- Purpose: Optional direct Node Detail refresh.
- Params: `nodeId`.
- Response: `TowerNode`.
- Errors: `NODE_NOT_FOUND`, `NODE_LOCKED`, `INTERNAL_ERROR`.
- Pages: Node Detail Sheet.
- Service: recommended new `fetchNode`.

### Battle

#### `POST /api/tower/challenge`

- Purpose: Start and auto-settle an NPC/PVP battle.
- Body: `{ nodeId: string; idempotencyKey?: string }`.
- Response: `ChallengeResponse`.
- Errors: `PLAYER_NOT_FREE`, `PLAYER_GARRISONING`, `PLAYER_IN_BATTLE`, `NODE_NOT_FOUND`, `NODE_LOCKED`, `NODE_PROTECTED`, `NODE_NOT_CHALLENGEABLE`, `INSUFFICIENT_TICKETS`, `DUPLICATE_REQUEST`, `CONFLICT_STATE_CHANGED`.
- Pages: Node Detail, future Battle Resolve.
- Service: `challengeNode`.
- Notes: In MVP, backend can settle synchronously and return `battleId`, `resolve`, and `result`. PVE NPC challenges have no attempt limit. PVP uses 5 free challenges per day, then consumes 1 `tickets`; insufficient tickets returns `INSUFFICIENT_TICKETS`.

#### `GET /api/battles/:battleId`

- Purpose: Return battle replay/resolve payload.
- Params: `battleId`.
- Response: `BattleResolvePayload`.
- Errors: `BATTLE_NOT_FOUND`, `INTERNAL_ERROR`.
- Pages: Battle Resolve, legacy Battle.
- Service: `fetchBattle`, `fetchBattleResolve`.
- Notes: Main line is `BattleResolvePayload` with final result plus simplified i18n log. Legacy `BattleLog` frames are compatibility only and should not drive new UI.

#### `GET /api/battles/:battleId/result`

- Purpose: Return final battle result view.
- Params: `battleId`.
- Response: `BattleResult`.
- Errors: `BATTLE_NOT_FOUND`, `BATTLE_NOT_COMPLETED`, `INTERNAL_ERROR`.
- Pages: Battle Result.
- Service: `fetchBattleResult`.

### Garrison

#### `GET /api/garrison/current`

- Purpose: Return active/lost garrison view for current player.
- Query: `nodeId?: string`.
- Response: `GarrisonView | null`.
- Errors: `GARRISON_NOT_FOUND`, `NOT_NODE_OWNER`, `INTERNAL_ERROR`.
- Pages: Garrison, Home via bootstrap.
- Service: `fetchGarrison`.
- Notes: `state` query used by mock review must not be part of production API.

#### `POST /api/strongholds/occupy`

- Purpose: Occupy an available node directly or after battle victory.
- Body: `{ nodeId: string; battleId?: string; idempotencyKey?: string }`.
- Response: `OccupyResponse`.
- Errors: `PLAYER_NOT_FREE`, `PLAYER_IN_BATTLE`, `NODE_NOT_FOUND`, `NODE_NOT_OCCUPIABLE`, `NODE_PROTECTED`, `CONFLICT_STATE_CHANGED`, `DUPLICATE_REQUEST`.
- Pages: Node Detail, Battle Result.
- Services: `occupyNode`, `occupyBattleNode`.
- Notes: `available` nodes may be occupied directly. If `battleId` is present, verify current player won and `canOccupy=true`. Successful occupation stores `protectedUntil = now + 5 minutes`; frontend receives derived `protectionMin`.

#### `POST /api/garrison/claim`

- Purpose: Claim lazy-calculated rewards for active or lost garrison.
- Body: `{ nodeId?: string; garrisonId?: string; idempotencyKey?: string }`.
- Response: `ClaimGarrisonResponse`.
- Errors: `GARRISON_NOT_FOUND`, `NO_REWARDS_TO_CLAIM`, `NOT_NODE_OWNER`, `DUPLICATE_REQUEST`, `CONFLICT_STATE_CHANGED`.
- Pages: Home, Node Detail, Garrison.
- Services: `claimGarrison`, `claimGarrisonRewards`.
- Notes: This is the single backend claim contract for both v1 and v2 frontend methods. Response always includes canonical typed `rewards` and compatibility `rewardTokens`.

#### `POST /api/garrison/leave`

- Purpose: Leave active garrison and free player.
- Body: `{ nodeId?: string; garrisonId?: string; claim?: boolean; idempotencyKey?: string }`.
- Response: `LeaveGarrisonResponse`.
- Errors: `GARRISON_NOT_FOUND`, `NOT_NODE_OWNER`, `CONFLICT_STATE_CHANGED`, `DUPLICATE_REQUEST`.
- Pages: Home, Node Detail, Garrison.
- Services: `leaveGarrison`, `leaveGarrisonNode`.
- Notes: This is the single backend leave contract for both v1 and v2 frontend methods. If `claim=true`, response includes `claimedRewards` and `rewardTokens`; otherwise unclaimed active rewards are discarded.

### Equipment

#### `GET /api/equipment`

- Purpose: Return equipped gear and backpack.
- Response: `EquipmentPayload`.
- Errors: `INTERNAL_ERROR`.
- Pages: Equipment, Battle Result drop comparison if needed.
- Service: `fetchEquipment`.

#### `POST /api/equipment/equip`

- Purpose: Equip a gear item owned by the player.
- Body: `{ gearId: string; idempotencyKey?: string }`.
- Response: `EquipGearResponse`.
- Errors: `GEAR_NOT_FOUND`, `GEAR_SLOT_MISMATCH`, `CONFLICT_STATE_CHANGED`, `DUPLICATE_REQUEST`.
- Pages: Equipment, Battle Result.
- Service: `equipGear`.

#### `POST /api/equipment/auto-equip`

- Purpose: Equip best owned gear per slot according to backend CP.
- Body: `{ strategy?: "cp"; idempotencyKey?: string }`.
- Response: `AutoEquipResponse`.
- Errors: `CONFLICT_STATE_CHANGED`, `DUPLICATE_REQUEST`.
- Pages: Equipment.
- Service: recommended new `autoEquipGear`.
- Notes: Current compare logic is client-side and does not need backend compare; backend should only own final equip/auto-equip decisions.

### Reports

#### `GET /api/reports`

- Purpose: Return report list.
- Query: `cursor?: string`, `limit?: number`, `filter?: "all" | "attack" | "defense"`.
- Response: `ReportsPayload`.
- Errors: `VALIDATION_ERROR`, `INTERNAL_ERROR`.
- Pages: Reports, Home red dot via bootstrap.
- Service: `fetchReports`.

#### `POST /api/reports/:reportId/read`

- Purpose: Mark one report as read.
- Params: `reportId`.
- Response: `BasicOkResponse`.
- Errors: `REPORT_NOT_FOUND`, `INTERNAL_ERROR`.
- Pages: Reports, replay open.
- Service: recommended new `markReportRead`.

#### `POST /api/reports/read-all`

- Purpose: Mark all current player's reports as read.
- Response: `BasicOkResponse`.
- Errors: `INTERNAL_ERROR`.
- Pages: Reports.
- Service: `markReportsRead`.

### Settings

#### `GET /api/settings`

- Purpose: Return persisted player preferences.
- Response: `PlayerSettings`.
- Errors: `INTERNAL_ERROR`.
- Pages: Settings.
- Service: recommended `fetchSettings`.
- Notes: Contract is reserved for MVP, but backend implementation can be deferred while Settings remains `localStorage`.

#### `PATCH /api/settings`

- Purpose: Persist changed preferences.
- Body: `Partial<PlayerSettings>`.
- Response: `PlayerSettings`.
- Errors: `VALIDATION_ERROR`, `INTERNAL_ERROR`.
- Pages: Settings.
- Service: recommended `patchSettings`.
- Notes: Contract is reserved for MVP, but backend implementation can be deferred while Settings remains `localStorage`.

## 8. Request / Response Schemas

```ts
type BasicOkResponse = { ok: true };

type BootstrapResponse = {
  player: Player;
  floor: Floor;
  garrison?: GarrisonView | null;
  redDots: NotificationSummary;
  activity: ActivityRow[];
};

type ChallengeRequest = {
  nodeId: string;
  idempotencyKey?: string;
};

type ChallengeResponse = {
  battleId: string;
  player: Player;
  battle: BattleResolvePayload;
  result?: BattleResult;
  pvpCost?: {
    freeUsed: number;
    freeMax: 5;
    ticketSpent: boolean;
    ticketsRemaining: number;
  };
  nextRoute: `/battle/resolve?battleId=${string}` | `/battle/result?battleId=${string}`;
};

type OccupyRequest = {
  nodeId: string;
  battleId?: string;
  idempotencyKey?: string;
};

type OccupyResponse = {
  ok: true;
  garrisonId: string;
  player: Player;
  node: TowerNode;
  garrison: GarrisonView;
  protectedUntil: ISODateTime;
  protectionMin: number;
  floor?: Floor;
  redDots?: NotificationSummary;
};

type ClaimGarrisonRequest = {
  nodeId?: string;
  garrisonId?: string;
  idempotencyKey?: string;
};

type ClaimGarrisonResponse = {
  ok: true;
  rewards: Reward[]; // canonical
  rewardTokens: string[]; // required compatibility for current v2 UI
  player: Player;
  garrison?: GarrisonView | null;
  redDots?: NotificationSummary;
};

type LeaveGarrisonRequest = {
  nodeId?: string;
  garrisonId?: string;
  claim?: boolean;
  idempotencyKey?: string;
};

type LeaveGarrisonResponse = {
  ok: true;
  player: Player;
  claimedRewards?: Reward[];
  rewardTokens?: string[];
  floor?: Floor;
  redDots?: NotificationSummary;
};

type EquipmentPayload = {
  equipped: Record<GearSlot, Gear | null>;
  backpack: Gear[];
  capacity: number;
};

type EquipGearRequest = {
  gearId: string;
  idempotencyKey?: string;
};

type EquipGearResponse = {
  ok: true;
  player: Player;
  equipment: EquipmentPayload;
  equipped: Gear;
  replaced?: Gear | null;
};

type AutoEquipRequest = {
  strategy?: "cp";
  idempotencyKey?: string;
};

type AutoEquipResponse = {
  ok: true;
  player: Player;
  equipment: EquipmentPayload;
  changedSlots: GearSlot[];
};

type ReportsPayload = {
  rows: Report[];
  nextCursor?: string;
};

type PlayerSettingsPatch = Partial<
  Pick<PlayerSettings, "locale" | "sfx" | "music" | "notifications" | "battleSpeed">
>;
```

View model vs DB model:

- `TowerNode.state`, `occupiedByMe`, `protectionMin`, `garrison.accumulated`, `GarrisonView.capPct`, `GarrisonView.capInLabel`, `RedDots`, and `ActivityRow` are view/derived fields.
- Persist raw occupation, garrison timestamps, player state, battle result, gear ownership, reports, and settings.

## 9. Error Codes

| Code | APIs | Frontend display guidance |
|---|---|---|
| `PLAYER_NOT_FREE` | challenge, occupy | Toast action failed; optionally go to current state route. |
| `PLAYER_IN_BATTLE` | challenge, occupy, leave | Show state banner; route to battle result/resolve if `battleId` provided. |
| `PLAYER_GARRISONING` | challenge, occupy | Show blocked sheet or toast with Go to Garrison. |
| `NODE_NOT_FOUND` | floor, node, challenge, occupy | Inline error/retry; close stale sheet if needed. |
| `NODE_LOCKED` | node, challenge | Disabled locked state; refresh floor. |
| `NODE_PROTECTED` | challenge, occupy | Show protected badge/timer; refresh floor. |
| `NODE_NOT_CHALLENGEABLE` | challenge | Toast and refresh node. |
| `NODE_NOT_OCCUPIABLE` | occupy | Toast and refresh floor/result. |
| `NOT_NODE_OWNER` | claim, leave, garrison current | Route back to floor and refresh state. |
| `GARRISON_NOT_FOUND` | garrison current, claim, leave | Show empty/error with Return to Floor. |
| `NO_REWARDS_TO_CLAIM` | claim | Keep claim disabled; refresh garrison. |
| `GEAR_NOT_FOUND` | equip | Toast and refresh equipment. |
| `GEAR_SLOT_MISMATCH` | equip | Toast and refresh equipment; should be rare. |
| `REPORT_NOT_FOUND` | report read | Refresh reports. |
| `INSUFFICIENT_TICKETS` | PVP challenge | Toast insufficient tickets; keep sheet. PVE challenge never uses tickets in v0.1. |
| `CONFLICT_STATE_CHANGED` | all mutations | Refresh bootstrap/floor/garrison/equipment as appropriate. |
| `DUPLICATE_REQUEST` | all idempotent mutations | Return previous successful response when possible; otherwise refresh. |
| `VALIDATION_ERROR` | all body/query validation | Inline form/control error where applicable. |
| `INTERNAL_ERROR` | all | Generic retry state/toast. |
| `BATTLE_NOT_FOUND` | battle get/result | Error state with Return to Floor. |
| `BATTLE_NOT_COMPLETED` | battle result | Keep resolve/loading state and retry. |

## 10. Core Settlement Rules

Challenge settlement:

1. Validate player is `free`.
2. Validate node is challengeable for current player.
3. If opponent is NPC/PVE, do not enforce attempt limits.
4. If opponent is another player/PVP, apply daily cost:
   - first 5 PVP challenges per day are free;
   - after 5 free attempts, consume 1 `tickets`;
   - if no tickets are available, return `INSUFFICIENT_TICKETS`.
5. Validate costs/tickets for PVP before mutating battle state.
6. Set player `state="battle"` and create battle row.
7. Snapshot player CP/equipment and opponent CP/node at settlement time.
8. Auto-resolve battle server-side.
9. Generate battle result, simplified i18n resolve log, rewards, possible gear drop, reports.
10. Return battle payload; keep player `battle` until result return/occupy finalizes.

NPC victory:

- Mark node `available` for occupation. Do not auto-occupy.
- Generate configured node rewards and optional gear.
- Major node may set floor cleared and unlock next floor.
- `canOccupy=true` when node can be garrisoned.

NPC defeat:

- No occupation change.
- Optional no rewards for MVP.
- Player returns to `free` after result is acknowledged.

PVP attack victory:

- Defender garrison becomes `lost`.
- Defender player state becomes `free`, but lost garrison remains claimable/acknowledgeable.
- Defender keeps all rewards accrued before `lostAt`; attacker does not steal old unclaimed rewards.
- Attacker receives attack rewards and can occupy.
- Generate attackWin report for attacker and nodeLost report for defender.

PVP attack defeat:

- Defender remains active; defense win count increments.
- Attacker gets attackLoss report; defender gets defenseWin report.
- Optional defense reward is added to defender garrison/reports.

Battle rewards:

- Backend internally generates and applies typed `Reward[]`.
- API temporarily returns `rewardTokens`/`rewards: string[]` generated from typed rewards for current v2 UI compatibility.
- Gear drops should create real owned gear with `id`, not just a display token.

Occupy:

- Player must be `free` for direct available-node occupation or `battle` with a winning battle result for result occupation.
- `available` nodes are occupiable directly without another challenge.
- Player cannot occupy a second node; must leave first.
- Create garrison with `startedAt=now`, `lastClaimedAt=now`, reward cap from node config.
- Create/update node occupation with `protectedUntil = now + 5 minutes`.
- Return derived `protectionMin` for frontend display.
- Set player `state="garrisoning"` and `garrisonNodeId=nodeId`.

Garrison lazy rewards:

- Do not write rewards every minute.
- On bootstrap, garrison current, claim, leave, and lost handling, calculate:
  - elapsed = `min(now, startedAt + capHours) - lastClaimedAt`
  - reward = node rate * elapsed, plus gear bonuses if any
  - cap full when `now >= startedAt + capHours` and no claim since then
- Stop accumulation beyond cap.

Claim:

- Active claim: transfer calculated rewards to wallet, set `lastClaimedAt=now`, keep status active.
- Lost claim: transfer rewards accrued before `lostAt`; mark lost garrison settled and clear `garrisonNodeId` if still pointing to it.

Leave:

- If `claim=true`, claim first in the same transaction.
- If `claim=false`, unclaimed active rewards are discarded per current leave warning.
- Free player and release node.

Node lost:

- Defender loses only the current node, not unlocked floors.
- Existing unlocked floors remain unchanged.
- Lost state can still show rewards and logs.
- Lost accrued rewards remain claimable by the defender and are not transferred to the attacker.

Equipment:

- Equip validates gear ownership and slot.
- Move previously equipped gear to backpack.
- Recalculate player CP on backend.
- Auto-equip chooses best CP gear per slot.
- Compare can remain client-side because backend returns current equipped/backpack stats.

Reports and red dots:

- Generate reports on attack win/loss, defense win, node lost.
- `reports` red dot is true/count when unread reports exist.
- `garrison` red dot can be true/count for claimable rewards or lost state.
- `equipment` red dot can count new/better gear.

## 11. Concurrency and Idempotency

Recommended strategy:

- Accept optional `idempotencyKey` on all mutation APIs.
- For in-memory MVP, keep a per-player map of `idempotencyKey -> response` for a short TTL.
- For database version, store idempotency records keyed by `(playerId, endpoint, idempotencyKey)`.

Cases:

- Challenge repeated click: if same key, return existing battle. Without key, if player is already `battle`, return `PLAYER_IN_BATTLE` with active battle id.
- PVP daily counter race: increment free-use count or consume ticket in the same critical section as battle creation. Do not charge tickets for PVE.
- Occupy race: lock node/occupation record. If another player occupies first, return `CONFLICT_STATE_CHANGED` or `NODE_NOT_OCCUPIABLE` with fresh node.
- Claim repeated submit: same key returns same claim response; no key and no rewards returns `NO_REWARDS_TO_CLAIM`.
- Leave and claim simultaneously: serialize by garrison version. If leave wins, claim gets `GARRISON_NOT_FOUND` or settled response. If claim wins, leave proceeds with zero unclaimed rewards.
- Equip repeated submit: same key returns same updated equipment. If already equipped, return ok with current equipment.
- Database version: use transactions and optimistic `version` columns on players, garrisons, nodes/occupations, and player gear.

## 12. Mock-to-Real Migration Plan

Current switch:

```ts
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
export const towerApi = USE_MOCKS ? mockApi : httpApi;
```

Plan:

1. Keep `VITE_USE_MOCKS=true` for fixtures.
2. Implement every `TowerApi` method in `httpApi` with the endpoints above before backend integration is considered complete.
3. Keep frontend components unchanged; only update `src/services/api.ts` and possibly `src/services/types.ts`.
4. Replace current v2 `notImplemented` methods in `httpApi`:
   - `fetchBattleResolve`
   - `fetchBattleResult`
   - `occupyBattleNode`
   - `equipGear`
   - `fetchGarrison`
   - `claimGarrisonRewards`
   - `leaveGarrisonNode`
   - `markReportsRead`
5. Add missing service wrappers:
   - `autoEquipGear`
   - `markReportRead`
   - `fetchSettings`
   - `patchSettings`
6. Align fields:
   - Use typed `Reward[]` as canonical backend data.
   - Return `rewardTokens` and current `rewards: string[]` fields until components are migrated.
   - Keep i18n key fields (`nameKey`, `nodeNameKey`, `enemyNameKey`) unchanged.
   - Raw player/opponent names remain raw strings.
   - Keep `GarrisonView` fields currently consumed by Garrison page (`capPct`, `capInLabel`, `rewards`).
   - Do not persist `occupiedByMe`; derive it in floor/node view responses.
7. Wire Node Detail challenge through `challengeNode(node.id)` and remove fixed mock battle-id routing during integration.

Potential type tweaks:

- `Reward["rarity"]` currently uses `Rarity`; backend model should call it `GearRarity` but can export alias.
- `Report.createdAt` currently number; add `createdAtIso` and migrate page later.
- Settings service hooks are optional in v0.1 because the UI remains `localStorage`; endpoint contract is reserved.

## 13. Backend Implementation Phases

### Phase 1 - Backend scaffold

- Use Node.js with Express or NestJS. Express is enough for MVP and matches a small frontend-only repo; NestJS is reasonable if the team wants stricter module structure.
- Add CORS for Vite dev origin.
- Add `GET /api/health`.
- Add request id and standard error response format.

### Phase 2 - In-memory API

- Implement current dev player/session.
- Implement bootstrap, profile, floors/nodes.
- Implement challenge/result/resolve with PVE unlimited, PVP 5 daily free attempts then tickets.
- Implement occupy/garrison claim/leave.
- Implement 5-minute `protectedUntil` for occupation.
- Implement equipment/equip/auto-equip.
- Implement reports/read/read-all.
- Keep settings get/patch as optional/default stubs; full persistence can be deferred.

### Phase 3 - Frontend integration

- Set `VITE_USE_MOCKS=false`.
- Fix service contract mismatches only in service layer.
- Confirm Home, Floor, Node Detail, Battle Resolve, Battle Result, Garrison, Equipment, Reports, Settings.

### Phase 4 - Persistence

- Add database schema after v0.1 in-memory API is validated.
- Migrate in-memory data model into repositories.
- Add transactions and optimistic versions.

### Phase 5 - Hardening

- Add concurrency tests, logs, metrics, validation schemas, deployment config.
- Add auth/session integration.

## 14. Database Persistence Plan

Suggested tables:

| Table | Primary key | Important fields | Indexes | Version |
|---|---|---|---|---|
| `players` | `id` | name, level, cp, stamina, state, garrison_node_id, active_battle_id, highest_unlocked_floor | state, updated_at | yes |
| `player_wallets` | `player_id` | gold, stones, fragments, tickets | none | yes |
| `floors` | `floor` | name_key, rule_key, config_json | floor | no/config |
| `nodes` | `id` | floor, type, name_key, short_name_key, recommended_cp, reward_config_json, reward_cap_hours, base_status | floor, type | yes if mutable |
| `node_occupations` | `id` | node_id, player_id, status, protected_until, started_at, ended_at | node_id active unique, player_id active unique | yes |
| `garrisons` | `id` | player_id, node_id, status, started_at, lost_at, lost_to_player_id, last_claimed_at, unclaimed_rewards_json, wins, losses | player_id status, node_id status | yes |
| `battles` | `id` | player_id, node_id, opponent_kind, opponent_player_id, status, outcome, result_json, created_at, completed_at, idempotency_key | player_id created_at, idempotency | yes |
| `battle_logs` | `battle_id` + `seq` | frame_json, log_key, vars_json | battle_id | no |
| `gear` | `id` | template/name_key, slot, rarity, tier, attrs_json, cp, level | slot, rarity | no for templates |
| `player_gear` | `id` | player_id, gear_id/template fields, slot, equipped, is_new, created_at | player_id equipped, player_id slot | yes |
| `reports` | `id` | player_id, kind, opponent_name, node_name_key, rewards_json, battle_id, unread, created_at | player_id unread, player_id created_at | yes optional |
| `player_settings` | `player_id` | locale, sfx, music, notifications, battle_speed, updated_at | none | yes; post-v0.1 optional |
| `idempotency_keys` | `player_id + endpoint + key` | response_json, created_at, expires_at | expires_at | no |

Configurable data:

- Floors, nodes, reward rates, drop tables, NPC CP, PVP daily free challenge max. Protection duration is fixed at 5 minutes in v0.1 but can later move to config.

Optimistic lock candidates:

- `players`
- `player_wallets`
- `node_occupations` / `garrisons`
- `player_gear`
- `reports` if read state race matters

## 15. Security / Validation Notes

- Client cannot decide battle results, rewards, node ownership, CP changes, or report ownership.
- Backend must reload player and node/garrison state inside each mutation.
- Validate player can perform the requested operation from current `PlayerState`.
- Validate node is unlocked/challengeable/occupiable for the player.
- Validate battle belongs to player and has winning result before occupy.
- Validate gear belongs to player and matches slot before equip.
- Validate report belongs to player before read.
- Validate settings enum values.
- Do not trust `nodeId`, `gearId`, `battleId`, `reportId` from client without ownership checks.
- MVP can defer complex anti-cheat, but endpoint design must avoid obvious client authority.

## 16. Frontend Adjustments, If Any

Priority is no component changes. Most integration should be service-layer only.

Likely minimal adjustments:

- Wire Node Detail challenge action to call `challengeNode(node.id)` and navigate using returned `battleId`; fixed mock battle-id routing is not allowed for backend integration.
- Implement remaining `httpApi` v2 methods currently `notImplemented`: `fetchBattleResolve`, `fetchBattleResult`, `occupyBattleNode`, `equipGear`, `fetchGarrison`, `claimGarrisonRewards`, `leaveGarrisonNode`, and `markReportsRead`.
- Add `autoEquipGear`, `markReportRead`, and settings service hooks if full prompt scope is required.
- Use the unified claim/leave backend responses for both v1 and v2 service methods.
- Keep typed `Reward[]` as canonical and return `rewardTokens` plus existing string `rewards` fields for compatibility.
- Settings remains `localStorage` for v0.1; service hooks can be added later against reserved endpoints.
- Add API error code parsing in `request()`; current code throws generic `Error(status)`.

Resolved contract risks in v0.1 Final:

- `claimGarrison` and `claimGarrisonRewards` both map to `POST /api/garrison/claim` and receive `ClaimGarrisonResponse`.
- `leaveGarrison` and `leaveGarrisonNode` both map to `POST /api/garrison/leave` and receive `LeaveGarrisonResponse`.
- Legacy `BattleLog` is compatibility only. Main battle flow uses `BattleResolvePayload` and `BattleResult`.
- Rewards are canonical typed `Reward[]`; string reward tokens are compatibility output.
- `occupiedByMe` is explicitly a derived current-player view state and is not persisted.
- Settings endpoints are reserved, with implementation deferred while the UI remains localStorage.

## 17. Open Questions

1. Should `GET /api/battles/:battleId` return only `BattleResolvePayload`, or also include a legacy `BattleLog` adapter until `/battle/:battleId` is retired?
2. Do Reports need cursor pagination in v0.1, or is a simple full list acceptable for the first backend integration?
3. Does Equipment need backpack capacity enforcement in v0.1, or should capacity remain display-only?
4. Should player stamina remain in the API despite no current screen consuming it?
5. Are floors/nodes static config for MVP, or should admin-editable content be planned early?
6. What backend reset timezone should define the PVP daily free challenge window?
