# Tower PvP — Frontend Development Handoff

> Handoff target: **Codex CLI** (real frontend implementation).
> Source of truth for design: `Tower PvP UI Design Spec.md` + `Tower PvP Hi-Fi Spec Addendum.md`.
> Source of truth for current code: the eight files this prototype actually ships (listed in §2).
>
> **Read this first, then inspect the files. This document describes what exists *today*, not what the spec wishes existed.** Wherever the spec and the code disagree, the code wins for "what's built" and the spec wins for "what to build next" — both are flagged inline.

---

## 1. Project Overview

| Aspect | Reality in this project |
|---|---|
| **Game type** | Lightweight gear-looting tower-climber with **asynchronous, node-occupation PvP**. Single character; "one character, one position" is the central rule. Battles are auto-resolved server-side; the client is theater + decisions. |
| **Core user flow** | Land on **Home** (shows your state: Free / Garrisoning / In Battle) → tap into a **Floor** (grid of nodes) → tap a node to open the **Node Detail Sheet** → Challenge / Occupy / Leave. Occupying a node makes you *Garrisoning*; you must Leave before you can climb again. |
| **Pages designed *today*** | **Home**, **Floor**, **Node Detail Sheet** — fully built across all states. (Equipment, Garrison page, Reports, Battle, Battle Result, Settings are **spec-only**, not yet coded — see §3.) |
| **Target platform** | Mobile **portrait**, WeChat Mini Game runtime is the stated production target. Mockups are sized to a 360×760 phone frame. The current prototype runs in a desktop browser inside a pan/zoom design canvas. |
| **Current frontend stack (as-built)** | **React 18.3.1 UMD + Babel Standalone, transpiled in the browser at runtime.** No build step, no bundler, no module system — files are loaded as `<script type="text/babel">` and communicate through `window.*` globals. No TypeScript (despite the spec being written in TS-interface style). |
| **Intended production stack** | The spec calls for React / Taro / Vue with i18n, Zustand-style stores, and a thin async service layer. For Codex: **React + TypeScript (Next.js App Router or Vite)**, real ES modules, a small store, and `react-i18next`. This handoff assumes that target. |

**The one-line summary for Codex:** *This is a static, in-browser-Babel design prototype of 3 screens. Your job is to turn it into a real, typed, routed, build-tooled React app while preserving the exact visual design — not to redesign anything.*

---

## 2. Existing Generated Files

Everything that ships is below. There are **no** config files, no `package.json`, no tests, no lockfiles — the prototype has zero tooling.

| File | What it does | Keep / Refactor / Remove | Depended on by | Known issues |
|---|---|---|---|---|
| `Tower PvP Hi-Fi Mockups.html` | Canvas entry point. Loads React/ReactDOM/Babel UMD bundles, then the 8 JSX files **in dependency order** (i18n → data → components → home → floor → nodedetail → canvas-app). Mounts `<CanvasRoot>` into `#root`. | **Refactor** → becomes the app's `index.html`/root layout. Drop Babel-in-browser; drop the canvas wrapper. | — (it's the root) | In-browser Babel = no type checking, slow, not production-viable. Script-order coupling is implicit and fragile. |
| `design-canvas.jsx` | Starter component (`DesignCanvas`, `DCSection`, `DCArtboard`) — a pan/zoom board that arranges the phone artboards for *review*. Pure presentation scaffolding. | **Remove** in the real app. It is a design-review tool, not product UI. | `src/canvas-app.jsx` | Not part of the product. Will be dead weight once real routing exists. |
| `src/i18n.jsx` | The i18n core: `DICTS` (a flat key→string map), `interpolate()`, `t(key, vars, locale)`, and `<LocaleText>`. Attaches `window.TowerI18n`. | **Refactor** → port `DICTS.en` into real locale JSON; replace `t()` with `react-i18next`. Keep the *key set* verbatim. | every screen + component | **Only `en` exists** despite a 5-locale requirement. `t()` takes a `locale` arg but nothing ever passes it. `home.notif.newReports_plural` is defined but no plural resolver calls it. |
| `src/data.jsx` | All mock data: `Player`, `Floor2Base` + 4 patched variants (`_Early`, `_PostClear`, `_PvP`, `_Garrisoning`), `RecentActivity`, and the `patchFloor()` cloning helper. Attaches `window.TowerData`. | **Refactor** → becomes `src/mocks/*.ts` typed fixtures behind the service layer (§8). | `home.jsx`, `floor.jsx`, `nodedetail.jsx`, `canvas-app.jsx` | `Floor2_Garrisoning === Floor2_PvP` (same object reference). Node names are i18n keys (good), but reward amounts are raw strings like `"gold:600"`. |
| `src/components.jsx` | The shared library: `tokens` (the entire design system), `PhoneFrame`, `StateBanner`, `Btn`, `RewardChip`/`RewardList`, `NodeStateBadge`, `NodeTypeBadge`, `RedDot`, `TimerPill`, `TabBar`, `PlayerChip`, `SectionHead`, `winChanceBucket()`, `WinChancePill`. Attaches `window.TowerUI`. Injects the Google Fonts link + a `<style id="tw-tokens">`. | **Refactor + split.** This is the keeper — it *is* the design system. Split into `components/` + a `tokens.ts` module + a global stylesheet. | every screen | One 576-line file mixing tokens, font injection, and ~14 components. `PhoneFrame` is mockup-only chrome (remove for product; replaced by `AppShell`). Styling is 100% inline-style objects. |
| `src/home.jsx` | `<HomeScreen variant>` + Home-only atoms: `TowerPreview`, `GarrisonPreview`, `QuickAction`, `ActivityRow`, `PageHeader`. Attaches `window.HomeScreen` + `window.PageHeader`. | **Refactor** → `pages/HomePage.tsx` + extract atoms to `components/`. | `canvas-app.jsx` | State is faked via a `variant` string prop instead of a store. Many hardcoded strings/values (see §15). `PageHeader` is exported here but only used by Home. |
| `src/floor.jsx` | `<FloorScreen variant onTapNode>` + `FloorHeader`, `MajorNodeCard`, `MediumNodeCard`, `SmallNodeTile`, `FloorSwitcher`. Attaches `window.FloorScreen`. | **Refactor** → `pages/FloorPage.tsx` + `components/NodeCard/*`. | `canvas-app.jsx` | 494 lines; the 3 node cards duplicate state→label→color logic three times — consolidate. `SmallNodeTile` derives its label by `T(name).split(" ").slice(-1)[0]` which **breaks for CJK** (see §15). The `floor.unlocksNext` ternary in `MajorNodeCard` has identical branches (dead logic). |
| `src/nodedetail.jsx` | `<NodeDetailSheet variant node ...>` + `StatRow`, `SheetSection`, `DefenderChip`, `SheetBody`, `SheetActions`. Attaches `window.NodeDetailSheet`. | **Refactor** → `components/NodeDetailSheet/*`. | `canvas-app.jsx` | Bottom-sheet with no swipe-to-dismiss (tap-scrim/close only). Accumulated rewards + amounts are hardcoded inside `SheetBody`. Two literal English fragments ("Up to … of passive rewards", a `Free` badge) bypass i18n. |
| `src/canvas-app.jsx` | Wires every screen×variant into `DCArtboard`s: `HomePhone`, `FloorPhone`, `NodeDetailPhone`, `CoverArtboard`, `CanvasRoot`, and the `ReactDOM.createRoot` mount. | **Remove / replace** with the app router. `FloorPhone`'s tap→sheet logic is the one piece of real interaction worth porting. | — (top of tree) | Couples routing/mounting to the review canvas. Only the `openNode` state machine in `FloorPhone` carries product value. |

**Repo-level gaps (all "add"):** `package.json`, `tsconfig.json`, ESLint/Prettier config, a bundler config, a test runner, locale JSON files, and a real entry/router. None exist yet.

---

## 3. Page Inventory and Routes

Two tiers: **Built** (coded in this prototype) and **Spec-only** (described in `Tower PvP UI Design Spec.md`, not yet coded). Build the spec-only pages from the spec, reusing the built component library.

| Page | Suggested route | Source file (today) | Purpose | Main components | Data needed | Current mock | Missing interactions | Priority |
|---|---|---|---|---|---|---|---|---|
| **Home** | `/` | `src/home.jsx` (`HomeScreen`) | Show player state + the single state-driven primary CTA; quick actions; recent activity | `StateBanner`, `PlayerChip`, `TowerPreview`/`GarrisonPreview`, `Btn`, `QuickAction`, `ActivityRow`, `TabBar` | `Player`, garrison summary, `RecentActivity`, red-dot/notif counts | `TowerData.Player`, `RecentActivity`, `variant` prop | Real CTA routing; live garrison timers; live red dots | **P0** |
| **Floor** | `/floor/:floorId` | `src/floor.jsx` (`FloorScreen`) | The core gameplay grid: 1 major + 2 medium + 4 small nodes, by state | `FloorHeader`, `MajorNodeCard`, `MediumNodeCard`, `SmallNodeTile`, `FloorSwitcher`, `TabBar` | floor + nodes list, player state/CP | `Floor2_*` variants | Floor switching; tap→sheet wired (in `FloorPhone`, not page); disabled-with-reason toasts | **P0** |
| **Node Detail Sheet** | overlay on `/floor/:floorId` (`?node=:nodeId`) | `src/nodedetail.jsx` | The decision surface: challenge / occupy / leave / blocked | `NodeDetailSheet`, `DefenderChip`, `StatRow`, `WinChancePill`, `RewardList`, `Btn` | one node, player, my-garrison name | synthesized in `canvas-app.jsx` | Swipe-to-dismiss; real action calls; protection-window variant (spec §5.4, not built) | **P0** |
| **Battle** | `/battle/:battleId` | — *(spec §4.4, not built)* | Replay an auto-resolved battle log; skip/speed | (new) `BattleStage`, HP bars, damage feed | `BattleLog` JSON | — | everything | **P1** |
| **Battle Result** | `/battle/:battleId/result` | — *(spec §4.4)* | Victory/Defeat, drops, unlock/occupy CTAs | (new) `ResultBanner`, `GearDropCard`, `RewardList` | result payload | — | everything | **P1** |
| **Equipment** | `/equipment` | — *(spec §4.5)* | Equipped slots + backpack + auto-equip + compare | (new) `EquipmentSlotGrid`, `GearCard`, `GearCompareSheet` | `Gear[]`, equipped map | — | everything | **P2** |
| **Garrison** | `/garrison` (not a tab) | — *(spec §4.6)* | Claim rewards, defense log, leave-node confirm | (new) `NodeBanner`, `RewardList`, `TimerPill`, `DangerButton` | active garrison, defense log | partial (in Home/Detail) | everything | **P2** |
| **Reports** | `/reports` | — *(spec §4.7)* | Async-PvP battle report list + replay link | (new) `ReportRow`, `EmptyState`, filter tabs | `Report[]` | — | everything | **P2** |
| **Settings** | `/settings` | — *(spec §4.8)* | Language / audio / battle-speed | (new) language picker, toggles | settings, locale list | — | everything; **drives i18n** | **P1** (language switch unblocks i18n testing) |

> **Tab bar** = 4 tabs only: `Home`, `Floor`, `Equipment`, `Reports`. `Garrison` is intentionally **not** a tab — it's reached from the Home state banner and the "mine" node card. Don't add a 5th tab.

---

## 4. Component Inventory

All reusable components live in `src/components.jsx` unless noted. Props below reflect the **current** signatures; the "should become props" column is the refactor target (today many values are hardcoded inside the components or passed as a fake `variant`).

### 4.1 Global / layout

| Component | File | Purpose | Props it accepts (today) | Hardcoded → should be props | Used by | Refactor |
|---|---|---|---|---|---|---|
| `PhoneFrame` | components | Mockup device bezel + status bar | `width=360, height=760, children, modal` | status-bar time `"21:42"`, battery 78% | every artboard | **Delete for product.** Replace with `AppShell` (safe-area + outlet + `TabBar`). |
| `StateBanner` | components | Top strip describing player state | `state, nodeName` | — (clean) | Home, Floor | Keep. Subscribe to `playerStore` instead of receiving `state` by prop. Add `inBattle` visuals (keys exist, no artboard). |
| `Btn` | components | The one button (4 variants) | `variant, disabled, onClick, children, fullWidth, small, style` | — (clean) | everywhere | Keep. Split spec's `PrimaryButton`/`SecondaryButton`/`DangerButton` are just `variant`s of this — fine. |
| `TabBar` | components | 4-tab bottom nav | `active, redDots` | tab list is internal (fine) | Home, Floor | Keep. Wire `redDots` from `notifStore`; make tabs navigate. |
| `SectionHead` | components | Uppercase section label + right slot | `title, right` | — | Home | Keep. Note: callers pass already-translated/`.toUpperCase()` strings — keep that out of the component. |
| `PageHeader` | home | Title + right slot | `title, right` | — | Home | Move to `components/`. |

### 4.2 Domain components

| Component | File | Purpose | Props (today) | Hardcoded → should be props | Used by | Refactor |
|---|---|---|---|---|---|---|
| `RewardChip` | components | One currency/gear pill | `type, amount, rarity` | — | reward lists, player chip, garrison | Keep. |
| `RewardList` | components | Wraps reward strings → chips | `rewards: string[]` ("gold:240") | — | cards, sheet | Keep, but **change the data contract**: parse `"type:amount"` strings into typed `Reward[]` upstream (§6), pass objects. |
| `NodeStateBadge` | components | State pill (color+glyph+label) | `state, occupierName, protectionMin` | — | cards, sheet | Keep. This is the canonical state→visual map; centralize all node-state styling here. |
| `NodeTypeBadge` | components | small/medium/major pill | `type` | — | cards, sheet | Keep. |
| `RedDot` | components | Notification dot/count | `count, dotOnly, style` | — | tabs, quick actions | Keep. |
| `TimerPill` | components | ⏳ label + time | `label, time, urgent` | — | garrison preview, sheet | Keep. **`time` is a pre-formatted string today** — make it accept seconds and format internally (live countdown), per spec `<TimerPill seconds>`. |
| `WinChancePill` + `winChanceBucket()` | components | Bucketed win chance (low/fair/high) | `bucket` / `(playerCP, recCP)` | thresholds 1.15 / 0.9 | sheet | Keep. Export thresholds as constants. |
| `PlayerChip` | components | Avatar + name + Lv/CP + currencies | `player` | avatar letter `"V"` is literal | Home | Keep. Derive avatar initial from `player.name`. |
| `TowerPreview` | home | Free-state hero card | `floor, floorNameKey` | art is a CSS placeholder + `[tower_silhouette.png]` tag | Home | Keep; swap placeholder for real art slot. |
| `GarrisonPreview` | home | Garrisoning hero card | `floor, nodeNameKey, durationLabel, accumulated, capLabel, capUrgent` | capacity bar width `"62%"` | Home | Keep; capacity % should be a prop. |
| `QuickAction` | home | One of 4 quick-entry tiles | `glyph, labelKey, redDotCount, muted` | — | Home | Keep. |
| `ActivityRow` | home | One recent-activity line | `row` | — | Home | Keep. |
| `MajorNodeCard` / `MediumNodeCard` / `SmallNodeTile` | floor | The 3 node card sizes | `node, playerState, playerCP, onTap` (+`floorNext` on major) | blocked-banner `nodeName: "Crystal Vault"` literal | Floor | **Consolidate** the repeated state→label/color logic into one `useNodePresentation(node, playerState)` hook. Fix `SmallNodeTile` label-by-`split()` bug. |
| `FloorHeader` / `FloorSwitcher` | floor | Floor title/rule + floor picker | `floor, floorNameKey, ruleKey, cleared, nextUnlocked` / `current, max` | switcher renders fixed 1–5 | Floor | Keep; drive switcher from real floor list. |
| `DefenderChip` | nodedetail | PvP defender summary | `defender` | — | sheet | Keep. |
| `StatRow` / `SheetSection` | nodedetail | Sheet body rows/sections | `label, value, valueColor, hint` / `title, children, paddingless` | — | sheet | Keep; move to `components/`. |
| `SheetBody` / `SheetActions` | nodedetail | Variant-specific sheet content/buttons | `node, variant, playerCP, myGarrisonNodeName` / `node, variant, onClose` | accumulated rewards array + `"5h 48m"` + claim amount `"1,240"` + `Free` badge literal | sheet | Keep structure; **lift all hardcoded values to props/data**. |

### 4.3 Components named in the spec but **not yet built**
`GearCard`, `GearCompareSheet`, `EquipmentSlotGrid`, `EquippedSlot`, `CPDelta`, `EmptyState`, `ReportRow`, `ConfirmModal`, `Toast`, `Coachmark`, `BattleStage`. Build these from spec §5/§9 when their pages come up (§3 priorities).

---

## 5. Layout Structure

### 5.1 Today vs. target

**Today** there is no app shell. `design-canvas.jsx` arranges `PhoneFrame`s on a board; each `PhoneFrame` draws a fake status bar and renders one screen. State is faked with a `variant` prop per artboard.

**Target** is a single mounted app with a real shell, router, and global stores. `PhoneFrame` and the canvas disappear.

### 5.2 Intended application tree

```
App (router + i18n provider + stores)
└── AppShell
    ├── SafeArea (notch / home-indicator insets)
    ├── StateBanner            ← global, reads playerStore (free | garrisoning | battle | blocked)
    ├── <Outlet> (routed page)
    │   ├── HomePage
    │   │   ├── PlayerChip
    │   │   ├── TowerPreview | GarrisonPreview      (by player state)
    │   │   ├── PrimaryCTA (Btn)                    (state-driven matrix, §3 spec)
    │   │   ├── QuickAction × 4
    │   │   └── ActivityRow × n
    │   ├── FloorPage
    │   │   ├── FloorHeader
    │   │   ├── MajorNodeCard
    │   │   ├── MediumNodeCard × 2
    │   │   ├── SmallNodeTile × 4
    │   │   └── FloorSwitcher
    │   │   └── NodeDetailSheet (overlay, ?node=)
    │   ├── EquipmentPage   (spec-only)
    │   ├── GarrisonPage    (spec-only, not a tab)
    │   ├── ReportsPage     (spec-only)
    │   ├── BattlePage / BattleResultPage (spec-only)
    │   └── SettingsPage    (spec-only)
    ├── TabBar                 ← 4 tabs, red dots from notifStore
    └── ModalLayer             ← ConfirmModal, Toast, Coachmark (single global layer)
```

### 5.3 Navigation, persistent UI, modals

- **Navigation:** bottom `TabBar` (Home/Floor/Equipment/Reports). Garrison & Battle are pushed routes, not tabs.
- **Persistent player-status UI:** `StateBanner` sits above every primary page and is the canonical "one character, one position" indicator. **Do not duplicate state badges elsewhere** (spec §5.3).
- **Modals/sheets/toasts:** Node Detail is a bottom sheet (currently scrim + tap-to-close; add swipe-down). Leave-Node confirm is a `ConfirmModal` (spec §4.6, not built). Blocked actions surface a sheet (not a toast) per addendum §5.5; other blocked actions show a `Toast` with a "Go to Garrison" action. Build a single global `ModalLayer` rather than per-screen portals.
- **Mobile/responsive:** the product is portrait-mobile-first; see §11.

---

## 6. State and Data Model

Interfaces below are reverse-engineered from `src/data.jsx` + the component prop shapes. `// MOCK` marks fields that are fabricated in the prototype; `// API` marks fields that must come from the backend. Names use i18n **keys** where the prototype already does (do not change this — it's correct).

```ts
// ---------- Player ----------
interface Player {
  id: string;                 // API   (absent in mock — add)
  name: string;               // API   ("Veyra" mock)  — raw user string, never translated
  level: number;              // API   (14 mock)
  cp: number;                 // API   (1284 mock) — combat power, derived from equipped gear
  stamina: number;            // API   (8 mock)   — OPEN: stamina may be cut (spec §11 Q1)
  staminaMax: number;         // API   (10 mock)
  currencies: {               // API
    gold: number;             //       (4820)
    stones: number;           //       (124)  upgrade stones
    fragments: number;        //       (38)   gear fragments
    tickets: number;          //       (3)    challenge tickets
  };
  state: PlayerState;         // API   — derived/owned by server; client mirrors it
  garrisonNodeId?: string;    // API   — set when state === "garrisoning"
}

type PlayerState = "free" | "garrisoning" | "battle";
// NB: the UI also uses a 4th *presentational* state "blocked" (StateBanner/NodeDetail).
// "blocked" is NOT a player state — it's derived: playerState === "garrisoning"
// while interacting with a non-mine node. Keep it out of the data model.

// ---------- Floor & Node ----------
interface Floor {
  floor: number;              // API   (2)
  nameKey: string;            // i18n key ("floor.f2.name")
  ruleKey: string;            // i18n key ("floor.f2.rule")  — OPEN: MVP scope? (spec §11 Q4)
  cleared: boolean;           // API
  nextUnlocked: boolean;      // API
  nodes: Node[];              // API
}

type NodeType  = "small" | "medium" | "major";
type NodeState =
  | "npcControlled" | "available" | "playerOccupied"
  | "occupiedByMe"  | "protected" | "locked" | "cleared";

interface Node {
  id: string;                 // API   ("n_major")
  nameKey: string;            // i18n key ("node.f2.lichWarden.name")
  type: NodeType;             // API
  state: NodeState;           // API   (server-owned)
  recommendedCP: number;      // API   (1600)
  rewards: Reward[];          // API   — currently encoded as "gold:600" strings; parse to objects
  rewardCapHours: number;     // API   (12)
  occupier?: Occupier;        // API   — present for playerOccupied / protected
  garrison?: GarrisonState;   // API   — present for occupiedByMe
  protectionMin?: number;     // API   — present for protected (OPEN: window length, spec §11 Q2)
}

interface Occupier {
  name: string;               // API   — raw player name, truncate at 12 chars visually
  cp: number;                 // API
  garrisonedMin: number;      // API
  defenses: number;           // API
}

interface GarrisonState {
  startedMin: number;         // API
  accumulated: Record<string, number>; // API  { gold, fragments, stones, ... }
  capInMin: number;           // API   — OPEN: cap formula / source (spec §11 Q3)
  defenses: number;           // API
}

// ---------- Rewards / Equipment ----------
type RewardType = "gold" | "stones" | "fragments" | "tickets" | "gear";
interface Reward {            // replaces the "type:amount" string encoding
  type: RewardType;           // API
  amount?: number;            // API   — for currencies
  rarity?: Rarity;            // API   — for type === "gear"
}

type Rarity = "common" | "rare" | "epic" | "legendary";
type GearSlot = "weapon" | "helmet" | "armor" | "ring" | "necklace" | "boots";
type AttrKey =
  | "attack" | "health" | "defense" | "critRate"
  | "dodge" | "lifesteal" | "attackSpeed" | "nodeRewardBonus";

interface Gear {              // spec §5.2 — NOT in current code, build for Equipment page
  id: string;                 // API
  slot: GearSlot;             // API
  tier: 1 | 2 | 3 | 4 | 5;    // API
  rarity: Rarity;             // API
  nameKey: string;            // i18n key
  attrs: Partial<Record<AttrKey, number>>; // API
}

// ---------- Battle / Reports ----------  (spec-only, not in current code)
interface BattleLog {         // returned by challengeNode(); replayed on BattlePage
  id: string;                 // API
  result: "victory" | "defeat";
  frames: Array<{ t: number; actor: "self" | "enemy"; dmg: number; crit?: boolean; heal?: number }>;
  rewards: Reward[];
  unlockedFloor?: number;
  nodeNowAvailable?: boolean;
}

interface Report {            // ReportsPage rows + async-PvP defense outcomes
  id: string;                 // API
  kind: "attackWin" | "attackLoss" | "defenseWin" | "nodeLost";
  opponentName: string;       // API   raw player name
  nodeNameKey: string;        // i18n key
  myCP: number; theirCP: number;
  rewards?: Reward[];         // auto-settled rewards for nodeLost
  battleId?: string;          // replay link
  createdAt: number;          // API   epoch ms; render relative < 24h
  unread: boolean;            // API
}

// ---------- Activity / Notifications ----------
interface ActivityRow {       // TowerData.RecentActivity
  type: "defeatedNpc" | "lootRare" | "unlockedFloor" | "defenseSuccess" | "nodeLost";
  vars: Record<string, string | number>; // interpolated into home.activity.* keys
  time: string;               // MOCK  "12m ago" — replace with createdAt:number + relative formatter
  fresh?: boolean;
}

interface RedDots {           // notifStore
  reports?: boolean | number;
  garrison?: boolean | number;
  equipment?: boolean | number;
  floor?: boolean | number;
}
```

**Stores to create** (Zustand or equivalent; spec §9.4): `playerStore`, `floorStore`, `inventoryStore`, `reportsStore`, `notifStore`, `i18nStore`, `tutorialStore`. In the prototype these don't exist — state is faked with `variant` props. The first refactor milestone is replacing `variant` props with store reads.

---

## 7. API Contract Draft

Minimal set the **current UI** plus the immediate next pages require. One async call per CTA; no optimistic updates in MVP — transition through `state: "battle"` then re-fetch (addendum §9).

| Method | Path | Purpose | Request | Response (shape) | Used by |
|---|---|---|---|---|---|
| `GET` | `/api/bootstrap` | Seed everything on app open | — | `{ player: Player, floor: Floor, redDots: RedDots, activity: ActivityRow[] }` | Home (`fetchHomeBootstrap`) |
| `GET` | `/api/player/profile` | Player + currencies + state | — | `Player` | Home, StateBanner, PlayerChip |
| `GET` | `/api/floors/:floorId` | Nodes for a floor | — | `Floor` | Floor (`fetchFloor`) |
| `POST` | `/api/tower/challenge` | Challenge an NPC or player node | `{ nodeId }` | `BattleLog` | NodeDetailSheet → Battle |
| `POST` | `/api/strongholds/occupy` | Occupy a defeated/available node | `{ nodeId }` | `{ player: Player, node: Node }` (state → garrisoning) | NodeDetailSheet (available) |
| `POST` | `/api/garrison/claim` | Claim accumulated garrison rewards | `{ nodeId }` | `{ rewards: Reward[], player: Player }` | Home CTA, Garrison, "mine" sheet |
| `POST` | `/api/garrison/leave` | Leave node (optionally claim first) | `{ nodeId, claim: boolean }` | `{ player: Player }` (state → free) | Garrison, Home secondary CTA |
| `GET` | `/api/reports` | Paginated battle reports | `?filter=all\|attack\|defense\|lost&cursor=` | `{ rows: Report[], nextCursor?: string }` | Reports |
| `GET` | `/api/battles/:battleId` | Fetch a battle log for replay | — | `BattleLog` | Battle / Report replay |
| `GET` | `/api/equipment` | Equipped map + backpack | — | `{ equipped: Record<GearSlot, Gear\|null>, backpack: Gear[], capacity: number }` | Equipment |
| `POST` | `/api/equipment/equip` | Equip one item | `{ gearId }` | `{ cp: number, equipped: Record<GearSlot, Gear\|null> }` | Equipment |
| `POST` | `/api/equipment/auto-equip` | Best-CP pass across slots | — | `{ equippedCount: number, cpDelta: number, equipped: ... }` | Equipment |
| `POST` | `/api/equipment/dismantle` | Dismantle items → mats | `{ gearIds: string[] }` | `{ rewards: Reward[] }` | Equipment |
| `GET` | `/api/locales/:lc` | (optional) fetch a locale dict | — | flat key→string map | i18n / Settings |

**Do not add** endpoints for: real-time PvP, world map, guild/chat/friends, marketplace, revenge auto-challenge, leaderboards (spec §10). They are out of MVP.

---

## 8. Mock Data Plan

The goal: Codex ships a fully clickable app **with no backend**, where swapping to real APIs is a one-file change.

**Recommended structure**
```
src/
├── mocks/
│   ├── player.ts          ← from TowerData.Player
│   ├── floors.ts          ← Floor2Base + patchFloor() variants (port verbatim)
│   ├── activity.ts        ← RecentActivity
│   ├── reports.ts         ← NEW typed fixtures
│   ├── equipment.ts       ← NEW typed fixtures
│   └── index.ts
├── services/
│   ├── api.ts             ← the ONLY place that knows mock vs. real
│   └── types.ts           ← the §6 interfaces
```

**Pattern — keep the seam thin.** Every service function returns a typed Promise. A single flag flips the implementation:

```ts
// services/api.ts
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";

export const fetchFloor = (id: number): Promise<Floor> =>
  USE_MOCKS ? Promise.resolve(mockFloors[id]) : http.get(`/api/floors/${id}`);
```

**Which page uses which mock**

| Page | Mock source | Note |
|---|---|---|
| Home | `mocks/player`, `mocks/activity` | replace the `variant` prop with `player.state` |
| Floor | `mocks/floors` | the 4 prototype variants become real state combinations, not separate fixtures |
| Node Detail | derived from the tapped `Node` | stop synthesizing occupier/garrison inside the sheet (see §15) — read from the node |
| Reports / Equipment / Garrison | `mocks/reports`, `mocks/equipment` | new typed fixtures from §6 |

**State management recommendation:** use **Zustand** for client/session state (`playerStore`, `floorStore`, `notifStore`) and **TanStack Query** for server state (the §7 calls), with the mock layer behind the `queryFn`. This gives loading/error/empty states for free (§12) and matches the spec's "service layer = single async fn" intent. Avoid plain constants-as-state — the prototype's `variant`-prop approach does not scale to real flows. Keep `tokens` as a plain constants module (it's static design data, not app state).

---

## 9. Internationalization Plan

The prototype is **i18n-aware but not i18n-complete**: every label *routes through* `t("key")`, but only `en` exists and there's no way to switch locale. Codex must finish the job and remove the few hardcoded leaks (§15).

**Required locales (spec §8 / addendum §6.4):** `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, plus `de`/`fr`/`ru` as stress cases. Minimum to ship: `en` + `zh-CN`.

**Namespace → file mapping.** Split the current flat `DICTS.en` (in `src/i18n.jsx`) along its existing prefixes into per-namespace JSON:

```
locales/
├── en/
│   ├── common.json     ← common.*, tab.*, time.*, res.*, rarity.*, winChance.*
│   ├── home.json       ← home.*, state.*
│   ├── tower.json      ← tower.*, floor.*  (incl. floor.fN.name / .rule content keys)
│   ├── node.json       ← node.*, nodeDetail.*, blocked.*
│   ├── garrison.json   ← garrison.*
│   └── (battle.json, equipment.json, reports.json, settings.json, tutorial.json — as pages land)
├── zh/  (zh-CN)  ← same files, translated
└── …ja, ko, de, fr, ru
```

**Example keys (already in the prototype — reuse exactly):**
```json
{
  "common.challenge": "Challenge",
  "state.free.title": "Ready to climb",
  "state.garrisoning.title": "Garrisoning {nodeName}",
  "home.cta.fightMajor": "Fight the Floor Boss",
  "home.cta.claimRewards": "Claim Rewards ({amount})",
  "floor.title": "Floor {floor}",
  "node.state.playerOccupied": "Held by {player}",
  "nodeDetail.winChance": "Win chance",
  "winChance.fair": "Fair"
}
```

**Rules to carry over (from `src/i18n.jsx` + spec §8.3):**
- Interpolation is `{var}` only — **no MessageFormat plurals in MVP.** Use explicit keys (`newReports` / `newReports_plural`) and a tiny resolver, or migrate to `react-i18next`'s plural support. (Today `_plural` is defined but never invoked — wire it.)
- Fallback chain is **`en` only**.
- `{playerName}` / occupier names are **raw user data — never translated**; truncate to 12 chars visually.
- Numbers via `toLocaleString()`; never hand-concatenate time strings — go through `time.h_m` / `time.m` / `time.minAgo`.

**Hardcoded strings to extract (must-fix — see §15 for the full list):** the `Free` cost badge, the "Up to {h}h of passive rewards" sentence in `nodedetail.jsx`, all literal node names passed as fallbacks (`"Crystal Vault"`, `"Bone Reliquary"`), and `SmallNodeTile`'s `T(name).split(" ")` label derivation (which silently breaks CJK and must be replaced with a dedicated short-name key).

---

## 10. Styling and Design Tokens

The entire design system is the `tokens` object in `src/components.jsx`. It is **consistent and complete** — the main styling problem is *delivery* (inline-style objects, no CSS variables), not the values themselves.

| Concern | Token / value (from `tokens`) |
|---|---|
| **Surfaces** | `bg #15131C`, `surface #1F1B29`, `surfaceRaised #2A2438`, `inset #100E18` |
| **Borders** | `borderSubtle #3A3247`, `borderStrong #5A4D72` |
| **Text** | `textPrimary #F2ECDC`, `textSecondary #A89F8C`, `textMuted #6B6478` |
| **Accents / status** | `gold #E8B53C` (CTA, mine, currency), `purple #8A5BD6` (garrison, epic), `crimson #C8384B` (PvP, danger, enemy), `teal #3FB8A1` (free, available, success), `npc #7A6E59` |
| **Dim pairs** | `goldDim`, `purpleDim`, `crimsonDim`, `tealDim` (used for borders/shadows) |
| **Rarity** | `common #9EA0A6`, `rare #3D8FE0`, `epic #8A5BD6`, `legendary #E8B53C` |
| **Typography** | Display: **Cinzel** 500/700 (titles only, never inside controls). UI: **Inter** + Noto Sans SC/JP/KR fallback. Numbers: Inter `tabular-nums` 700 (`.tw-num`). Sizes: display 28/700, title 20/600, body 14/400, caption 12/500. |
| **Radius** | card 10–12, major card 14, modal/sheet 16–18, button 10 (`small` 6). |
| **Elevation** | one level: sheet `0 -8px 32px rgba(0,0,0,.4)`; phone `0 10px 40px`. Spec mandates a *single* shadow layer — don't add more. |
| **Card style** | `surface`/`surfaceRaised` bg + 1px state-colored border + subtle top gradient wash on major cards. |
| **Buttons** | `Btn` variants: `primary` (gold fill, dark text, 2px gold under-shadow), `secondary` (outlined), `danger` (crimson fill), `ghost` (raised surface). `min-height` 44 (`small` 32), `text-wrap: balance`, never truncate. |
| **Progress bars** | thin 4px inset track + accent fill (garrison capacity, HP). |
| **Badges** | `NodeStateBadge` / `NodeTypeBadge` — uppercase 10px 700, `accent + "1a/20/26"` tints. |
| **Icons** | **Unicode glyphs** today (⚔ ⛨ ⚑ ● ⏳ ⛃ ✦ ◈ 🜚 ⚒). Inconsistent rendering across platforms — see normalization below. |
| **Motion** | 150ms ease-out state changes, 300ms modal; no 3D/particles/shake. |

**Normalization tasks for Codex:**
1. **Promote `tokens` to CSS custom properties** (`:root { --bg: …; --gold: … }`) + a typed `tokens.ts` mirror. Today every color is an inline JS string — that blocks theming, dark/light, and direct CSS.
2. **Replace inline-style objects** with CSS Modules / Tailwind / vanilla-extract (pick one). The inline approach is the single biggest maintainability cost.
3. **Replace Unicode-glyph icons with a real icon set** (e.g. an SVG sprite). Glyphs like `⛨ 🜚 ◈` render differently per OS and don't respect stroke weight.
4. **De-duplicate the state→color maps**: `NodeStateBadge`, `MajorNodeCard.borderColor`, `MediumNodeCard.borderColor`, and `SmallNodeTile.color` each re-declare the same node-state palette. Centralize into one `nodeStatePalette` constant.
5. **Fonts:** load Cinzel/Inter via the build (self-host for WeChat), not the runtime `<link>` injection in `components.jsx`.

The values are good — **do not restyle.** Preserve the dark-fantasy look exactly; this is a delivery/structure refactor, not a visual one.

---

## 11. Responsive Behavior

The product is **portrait-mobile-first** (360–430px wide, WeChat Mini Game). The prototype hardcodes a 360×760 `PhoneFrame`; the real app must be fluid within phone widths and degrade gracefully on tablet/desktop preview.

| Breakpoint | Layout behavior |
|---|---|
| **Mobile (≤ 480px) — primary** | Single column. `TabBar` fixed bottom (+ safe-area inset). `StateBanner` + content scroll between fixed banner and tab bar. Node grid: major full-width, medium 2-up, small 4-up. Node Detail = bottom sheet ~70% height, swipe-down to dismiss. |
| **Tablet (481–1024px)** | Center the column at a max-width (~480px) on the dark `bg`; do **not** stretch cards full-bleed. Optionally show Node Detail as a centered modal instead of a bottom sheet. |
| **Desktop (> 1024px)** | Same centered phone-width column (this is a mobile game). Don't build a desktop layout; just center + letterbox on `bg`. |

Specifics:
- **Navigation:** bottom tab bar at all sizes; never converts to a sidebar.
- **Card stacking:** medium row is `flex` 2-up and may wrap to 1-up on very narrow widths; small row is 4-up `flex` and should stay one row (tiles shrink, don't wrap) down to 320px.
- **Tables/lists:** Reports/Backpack are vertical card lists, not tables — they stack natively. Lazy-mount past ~20 rows (spec §9.6).
- **Modals/sheets:** bottom sheet on mobile, centered modal on tablet+. Always dismissible by scrim tap + a visible close.
- **Touch targets:** `Btn` `min-height` 44 already meets the 44px minimum; keep small node tiles ≥ 44px tap area even though their visual is compact.

---

## 12. Interaction Requirements

Status legend: ✅ implemented · ◑ partial / visual-with-handler · ○ visual only (no behavior) · ✕ not built.

| Interaction | Status today | Where | Notes for Codex |
|---|---|---|---|
| Tab navigation (Home/Floor/Equipment/Reports) | ○ | `TabBar` | Tabs render + show red dots but don't navigate. Wire to router. |
| State banner tap → relevant screen | ✕ | `StateBanner` | Spec §5.3: Free→Floor, Garrisoning→Garrison, Battle→replay. Add. |
| Home primary CTA (state-driven) | ◑ | `HomeScreen` | `onClick` handlers exist but are passed empty in canvas. Implement the full CTA matrix (spec §3.2). |
| Open Floor from Home | ◑ | `HomeScreen` | handler prop exists; route it. |
| Select / tap a node → open detail sheet | ✅ | `FloorPhone` (`openNode` state) | This is the one real interaction. Port the `openNode` state machine to `FloorPage`. |
| Floor switching (1–5) | ○ | `FloorSwitcher` | Renders current/locked; no switch behavior. |
| Node Detail: Challenge NPC | ○ | `SheetActions` | Button renders; no `onClick`. Wire to `POST /tower/challenge` → Battle. |
| Node Detail: Occupy | ○ | `SheetActions` | Wire to `POST /strongholds/occupy` → Garrisoning. |
| Node Detail: Challenge player (PvP) | ○ | `SheetActions` | danger button; wire to challenge. |
| Node Detail: Claim rewards (mine) | ○ | `SheetActions` | Wire to `POST /garrison/claim`. |
| Node Detail: Leave node | ○ | `SheetActions` | Needs `ConfirmModal` (spec §4.6) — not built. |
| Blocked-by-garrison → sheet (not toast) | ✅ | `FloorPhone` + `blocked` variant | Logic correct; the routing CTA ("Go to Garrison") has no handler. |
| Disabled-with-reason on cards | ✅ (visual) | node cards | Buttons render disabled with reason; tapping should also open the blocked sheet/toast — partially wired. |
| Swipe-down to dismiss sheet | ✕ | `NodeDetailSheet` | Only scrim-tap + ✕ today. Add gesture. |
| Battle replay / skip / speed | ✕ | — | Whole page unbuilt (spec §4.4). |
| Battle Result (victory/defeat, drops) | ✕ | — | Unbuilt. |
| Equipment: equip / dismantle / auto-equip / compare | ✕ | — | Unbuilt (spec §4.5). |
| Garrison: claim / defense log / leave-confirm | ◑ | partial in Home/Detail | Standalone page unbuilt (spec §4.6). |
| Reports list + replay link | ✕ | — | Unbuilt (spec §4.7). |
| Protection-window detail variant | ✕ | — | Only the inline `⏳ 2m` tile on Floor exists; full sheet variant reserved (addendum §5.4). |
| Loading / error / empty states | ✕ | — | None exist (static mocks). Add per query via TanStack Query; `EmptyState` component is spec'd but unbuilt. |
| Toasts / confirm modals / coachmarks | ✕ | — | No `ModalLayer`. Build the global layer (§5.3). |

---

## 13. Development Priorities for Codex

Phased plan with concrete tasks **and** acceptance criteria. Earlier phases unblock later ones.

### Phase 1 — Project cleanup & tooling
- Tasks: scaffold Vite (or Next.js App Router) + **TypeScript**; add ESLint/Prettier; create `services/types.ts` from §6; port `tokens` to `tokens.ts` + CSS variables; delete `design-canvas.jsx`, `PhoneFrame`, and the browser-Babel loading from the HTML.
- Acceptance: `npm run build` and `npm run lint` pass; app boots to a blank shell with no console errors; **no `<script type="text/babel">` remains**.

### Phase 2 — App layout & routing
- Tasks: build `AppShell` (SafeArea + `StateBanner` + `<Outlet>` + `TabBar` + `ModalLayer`); wire routes from §3; make tabs navigate; `StateBanner`/`TabBar` read from a (mock-seeded) `playerStore`/`notifStore`.
- Acceptance: all 4 tabs navigate; refreshing a route lands on the right page; `StateBanner` reflects `playerStore.state`.

### Phase 3 — Core pages with mock data
- Tasks: port **Home**, **Floor**, **Node Detail** to real pages reading from `mocks/` via the service layer; replace every `variant` prop with derived state; wire `FloorPage` tap→sheet (port `openNode`); implement the Home CTA matrix.
- Acceptance: from Home you can reach Floor, open any node's correct detail variant, and see the blocked sheet when garrisoning — **with zero hardcoded display strings** (all via `t()` and node data).

### Phase 4 — Reusable components & props refactor
- Tasks: split `components.jsx` into a `components/` tree; consolidate the 3 node cards behind `useNodePresentation`; centralize `nodeStatePalette`; lift all hardcoded values (§15) to props/data; add `EmptyState`, `ConfirmModal`, `Toast`.
- Acceptance: no component contains a literal node name, reward amount, or duplicated state-color map; node cards share one presentation source.

### Phase 5 — State management & API abstraction
- Tasks: add Zustand stores (§6) + TanStack Query for §7 calls behind the mock seam; add loading/error/empty states to every query; implement Occupy/Leave/Claim/Challenge transitions through `state: "battle"` + refetch.
- Acceptance: flipping `VITE_USE_MOCKS=false` swaps to `http` calls with no component changes; occupying a node moves the player to Garrisoning and Home updates.

### Phase 6 — i18n extraction
- Tasks: split `DICTS.en` into the namespaced JSON of §9; install `react-i18next`; wire a language switch in Settings; fix the plural resolver; remove all hardcoded strings; add `zh-CN`.
- Acceptance: switching `en`↔`zh-CN` updates every visible label; a missing key falls back to `en` and logs in dev; **no untranslated literal renders** in any screen.

### Phase 7 — Responsive polish
- Tasks: make the column fluid 320–480px, centered/letterboxed on tablet+; safe-area insets; swipe-down sheet; verify 44px tap targets; lazy-mount long lists.
- Acceptance: layouts hold from 320px to desktop without overflow or clipped buttons; sheet dismisses by swipe and scrim.

### Phase 8 — Testing & validation
- Tasks: unit-test `winChanceBucket`, `interpolate`, the CTA matrix, and node-state→presentation mapping; add the spec's i18n snapshot tests (de Home CTA wraps to 2 lines; ja Battle banner doesn't truncate; zh-CN equipment alignment); a smoke test per page.
- Acceptance: `npm test` green; the 3 spec i18n snapshots pass; CI runs lint + build + test.

### (Deferred to feature work, after Phase 8)
Battle/Result, Equipment, Garrison page, Reports, Settings, and the onboarding overlay — build from the spec, reusing the now-clean component library. These are P1–P2 per §3.

---

## 14. Codex Execution Prompt

> Paste the block below into Codex CLI from the project root.

```
You are implementing the Tower PvP frontend. Before writing any code:

1. READ `Tower PvP Frontend Development Handoff.md` end to end. It is the
   authoritative plan. Also skim `Tower PvP UI Design Spec.md` and
   `Tower PvP Hi-Fi Spec Addendum.md` for design intent.
2. INSPECT the current files: `Tower PvP Hi-Fi Mockups.html` and everything
   under `src/` (i18n.jsx, data.jsx, components.jsx, home.jsx, floor.jsx,
   nodedetail.jsx, canvas-app.jsx) and `design-canvas.jsx`. Understand the
   real code before changing it — do not work from memory.

CONSTRAINTS:
- PRESERVE THE VISUAL DESIGN EXACTLY. The `tokens` object, layout, spacing,
  fonts (Cinzel/Inter), and dark-fantasy look are correct. This is a
  structure/delivery refactor, NOT a redesign. Do not restyle.
- Convert the in-browser-Babel prototype into a real React + TypeScript app
  (Vite or Next.js App Router). Add a build, lint, and test setup. Remove
  `design-canvas.jsx`, the `PhoneFrame` mockup chrome, and all
  `<script type="text/babel">` loading.
- Refactor the generated JSX into maintainable, typed components: split the
  monolithic files, consolidate the three node cards behind one presentation
  hook, and centralize the duplicated node-state color maps.
- KEEP i18n. Every visible string must route through translation keys —
  reuse the existing key set verbatim, split `DICTS.en` into namespaced
  locale JSON, add zh-CN, and remove the hardcoded strings listed in the
  handoff (§15). No user-facing literals in components.
- USE MOCK DATA FIRST. Put the existing data behind a thin service layer
  with a single mock/real switch, so swapping to real APIs is one change.
  Do not build a backend.
- Work in the phases defined in §13. AVOID large unnecessary rewrites — port
  and restructure the existing code; don't reinvent the design system.
- After each phase: run lint, build, and tests if available. Report which
  files changed, what each change does, anything you had to assume, and the
  next step. Stop and ask before deviating from the handoff.

START with Phase 1 (tooling + TypeScript scaffold + tokens port). When it
builds clean, report back before starting Phase 2.
```

---

## 15. Known Risks / Open Questions

**Hardcoded values that leak past the i18n/data layer (must fix in Phase 3/4/6):**
- `src/home.jsx`: `StateBanner nodeName="Bone Reliquary"` literal; `GarrisonPreview` `accumulated={["gold:1,240","fragments:8","stones:24"]}`, `durationLabel "4h 12m"`, `capLabel "5h 48m"` all literal; CTA amount `vars={{ amount: "1,240" }}` literal; the report-notice hardcodes `player: "Mira"`.
- `src/floor.jsx`: `MajorNodeCard` blocked label uses `blocked.byGarrison` with `{ nodeName: "Crystal Vault" }` literal; `FloorScreen` `mineName` fallback `"Crystal Vault"`; `FloorSwitcher` renders a fixed 1–5 regardless of real floor count.
- `src/nodedetail.jsx`: `SheetBody` hardcodes `["gold:1,240","fragments:8","stones:24"]` and `"5h 48m"`; `SheetActions` claim amount `"1,240"` literal; the **`Free` cost badge is a raw string** (no key); the "Up to {h}h of passive rewards" sentence is **half English literal** (only the number is dynamic); `myGarrisonNodeName` defaults to `"Crystal Vault"`; the sheet **synthesizes** a fake occupier (`Ardyn`) and garrison block when missing instead of trusting node data.
- `src/components.jsx`: `PlayerChip` avatar letter `"V"` is hardcoded (derive from name); `PhoneFrame` status bar `"21:42"` + battery 78% (mockup-only, removed with the frame).

**i18n / correctness bugs:**
- **`SmallNodeTile` derives its label via `T(node.nameKey).split(" ").slice(-1)[0]`** — string-splitting a translated name. Breaks for CJK (no spaces) and any single-word/locale variation. Replace with a dedicated short-name key per node.
- Only `en` exists; `t()`'s `locale` arg is never used; no language switch. `home.notif.newReports_plural` is defined but no plural resolver invokes it.

**Dead / duplicated logic:**
- `MajorNodeCard`'s `floor.unlocksNext` ternary has **identical branches** (no-op conditional).
- The node-state→color palette is re-declared in 4 places (`NodeStateBadge`, both card `borderColor` maps, `SmallNodeTile.color`).
- `Floor2_Garrisoning === Floor2_PvP` (same object reference) — fine for the mock but confusing; the garrisoning behavior is driven entirely by `playerState`, not the data.

**Missing pages / states (spec'd, not built):** Battle, Battle Result, Equipment, Garrison page, Reports, Settings; plus all **loading / error / empty** states and the global Toast/ConfirmModal/Coachmark layer. The protection-window full sheet variant is reserved but unimplemented.

**Architectural risks:**
- Components communicate via `window.*` globals and Babel-in-browser — **not production-viable**; the Phase 1 port is non-negotiable before features.
- State is faked with `variant` string props instead of stores — every flow that mutates state (occupy → garrison → leave) has to be rebuilt on a real store.
- `floor.jsx` (494 lines) and `components.jsx` (576 lines) are oversized and mix concerns; split during Phase 4.

**Open questions for the designer/PM (from spec §11 — confirm before backend wiring):**
1. **Stamina:** does it ship? It appears in `Player` but no current screen consumes it. If cut, remove from `Node` cost UI.
2. **Protection window:** duration + source of truth for `protectionMin` / `state: "protected"`?
3. **Reward cap formula:** per-node-type cap and whether `capInMin` is server-authoritative or client-extrapolated.
4. **Floor modifiers** (`floor.fN.rule`): MVP content or post-MVP flavor?
5. **Player rename:** any backend support? (No rename UI in MVP otherwise.)
6. **WeChat surfaces:** share-card art, subpackage split, and offline-mail for auto-settlement need a separate platform-integration doc — out of scope here.
