# Tower PvP — Hi-Fi Mockup Spec Addendum

Companion document to `Tower PvP UI Design Spec.md` and the live mockups in `Tower PvP Hi-Fi Mockups.html`.
Scope: the three highest-leverage screens — **Home**, **Floor**, **Node Detail Sheet** — across every required state.

All strings shown in the mockups are looked up via `t("key", vars)` — see §6 for the full key set.

---

## 1. Design Direction Recap

| Dimension | Choice | Why |
|---|---|---|
| Mood | Dark fantasy, abyss-tower | Matches the prompt; reads premium without art assets |
| Layout | Card-based, vertical, portrait | Solo-dev friendly; localizes well |
| Map metaphor | **Card grid**, not hand-drawn node map | Implementation cost / i18n elasticity |
| Color discipline | One accent per node state (gold/teal/crimson/purple) + neutral surfaces | Lets the eye scan node states in <1 second |
| Motion | 150–300ms ease-out only | WeChat Mini Game render budget |
| Typography | Cinzel display + Inter UI + Noto CJK fallback | One serif moment per page, never inside controls |

Tokens used everywhere are exported from `src/components.jsx → tokens`.

---

## 2. The Three Screens (mockup ↔ state matrix)

| Screen | Variants in mockup | Drives |
|---|---|---|
| **Home** | Free · Garrisoning · Garrisoning + new report | "What is my next action?" + the one-position rule |
| **Floor** | Early NPC · Post-clear · PvP occupation · Garrisoning-blocked | Node state literacy + blocked-action UX |
| **Node Detail Sheet** | NPC Controlled · Available · Player-Occupied · Occupied by Me · Blocked by garrison | The decision: challenge / occupy / leave / cancel |

---

## 3. Screen 1 — Home

### 3.1 Layout

```
┌──────────────────────────────────────┐
│ ⚔ Ready to climb                     │ ← StateBanner (per state)
│ Defeat nodes to loot gear …          │
├──────────────────────────────────────┤
│  V  Veyra                ⛃ 4,820 ✦38│ ← PlayerChip
│     Lv 14 · CP 1,284                 │
├──────────────────────────────────────┤
│ ┌───── TowerPreview (Free) ────┐     │
│ │ TOWER OF ASH    [tower_art]  │     │   or
│ │ Floor 2 · Crypt Gate         │     │ ┌── GarrisonPreview (Garrisoning) ─┐
│ └──────────────────────────────┘     │ │ ⛨ GARRISON · Bone Reliquary      │
│   Highest unlocked  2 of 5  ▰▰▱▱▱   │ │ Floor 2 · Garrisoned 4h 12m      │
│                                      │ │ ⛃1,240 ✦8 ◈24                    │
│   (notice strip — only if new repo.) │ │ ⏳ cap in 5h 48m                  │
│                                      │ └──────────────────────────────────┘
│ ┌───── Primary CTA (state-driven) ─┐ │
│ │  ▶ Fight the Floor Boss          │ │   or "Claim Rewards (1,240)"
│ └──────────────────────────────────┘ │
│ [ Leave Node ]   (only when garr.)   │
│                                      │
│ QUICK ACTIONS                        │
│ [⚒ Gear] [📜 Reports] [⛨ Garr] [🏆]  │
│                                      │
│ RECENT ACTIVITY              View all│
│  ⚔ Defeated Crystal Vault   12m ago  │
│  ✦ Looted Rare Warden's Maul …       │
│  ▲ Unlocked Floor 2          1h ago  │
│                                      │
│ (Garrisoning footer reminder line)   │
├──────────────────────────────────────┤
│ ⌂ Home   ▤ Floor   ⚒ Gear   📜 Rep   │ TabBar
└──────────────────────────────────────┘
```

### 3.2 State-driven CTA matrix

| Player state | Conditions | Primary CTA | Secondary |
|---|---|---|---|
| Free | Current floor has uncleared major node | `home.cta.fightMajor` | — |
| Free | Major cleared, next floor unlocked | `home.cta.continueClimbing` | — |
| Free | All floors cleared | `home.cta.farmFloor` | — |
| Garrisoning | rewards > 0 | `home.cta.claimRewards` with amount | `home.cta.leaveNode` |
| Garrisoning | rewards = 0 | `home.cta.viewGarrison` | `home.cta.leaveNode` |
| In Battle | n/a | spinner; no CTA | — |

### 3.3 Notification rules

- Red dot on **Reports** when `unreadReports > 0`.
- Red dot on **Garrison** when `claimableRewards > 0` OR `pendingDefenseReports > 0`.
- Red dot on **Equipment** when at least one backpack item would raise CP if equipped (one-pass diff).
- Variant 3 (Garrisoning + new report) shows an inline **report-notice card** above the CTA so the report is glanceable without leaving Home.

---

## 4. Screen 2 — Floor

### 4.1 Layout

```
┌──────────────────────────────────────┐
│ StateBanner (Free or Garrisoning)    │
├──────────────────────────────────────┤
│ ◀ Floor 2 · Crypt Gate          ☰    │
│ RULE Undead deal +10% damage  [✓ Cleared]│ ← cleared chip when applicable
├──────────────────────────────────────┤
│                                      │
│ ┌─────── Major Node Card ────────┐   │ ← full-width, taller, art strip
│ │ MAJOR · NPC CONTROLLED         │   │
│ │ Lich Warden                    │   │
│ │ Rec CP 1,600 · You 1,284 ✗    │   │
│ │ ⛃600 ✦6 ⚒Epic                  │   │
│ │ ▲ Defeating this unlocks Floor 3│   │
│ │ ▶ Challenge                    │   │
│ └────────────────────────────────┘   │
│                                      │
│ MEDIUM                                │
│ ┌──────────┐ ┌──────────┐            │
│ │ Medium   │ │ Medium   │            │
│ │ Crystal V│ │ Bone Rel │            │
│ │ … state… │ │ … state… │            │
│ │ [Action] │ │ [Action] │            │
│ └──────────┘ └──────────┘            │
│                                      │
│ SMALL                                 │
│ [⚔ N1] [● N2] [⛨ N3] [⚔ N4]          │ ← compact tiles
│                                      │
├──────────────────────────────────────┤
│ F1 ◀ [1][2][3][🔒][🔒] ▶ F5           │ ← FloorSwitcher
├──────────────────────────────────────┤
│ TabBar (active: Floor)               │
└──────────────────────────────────────┘
```

### 4.2 Variant differences

| Variant | Major | Mediums | Smalls | Banner |
|---|---|---|---|---|
| **Early NPC** | NPC controlled, primary "Challenge" | Both NPC | All NPC | Free |
| **Post-clear** | Available · CTA "Occupy" + cleared chip on floor | One available, one NPC | 2 available + 2 NPC | Free |
| **PvP occupation** | Held by `Talen` · CTA "Challenge" (danger) | One mine, one enemy | mixed: protected, mine, available, enemy | Free |
| **Garrisoning blocked** | Same nodes as PvP; all non-mine cards' actions disabled with reason | mine = "View Garrison", others = "Locked" + toast on tap | same | Garrisoning |

### 4.3 Disabled-with-reason

Every blocked button on the Floor screen still **renders** so the layout is stable. Two reasons surface today:

- `blocked.byGarrison` "Leave {nodeName} to challenge other nodes." (player garrisoning elsewhere)
- `node.state.protected` "Protected · {time}" (node in protection window)

Tapping a disabled button opens the matching variant of the Node Detail Sheet (see §5.5) rather than silently failing.

---

## 5. Screen 3 — Node Detail Sheet

### 5.1 Anatomy

```
            ── grabber ──
┌──────────────────────────────┐
│ [type] [state]          ✕    │   header
│ Node Name (display serif)    │
│ Medium · Floor 2             │
├──────────────────────────────┤
│ (Defender chip — PvP)        │   variant-specific block
│ (Accumulated rewards — Mine) │
│ (Blocked banner — Blocked)   │
├──────────────────────────────┤
│ RECOMMENDED CP               │
│ Recommended CP        1,200  │
│ Your CP               1,284 ✓│
│ Win chance         [ FAIR ]  │
├──────────────────────────────┤
│ REWARDS / CAPTURE / CAP      │
│ ⛃240 ✦3   (cap: 10h)         │
├──────────────────────────────┤
│ (Cost row — PvP)             │
│ 2 / 5 free attempts today    │
├──────────────────────────────┤
│ ▶ Primary action             │
│ Leave Node           (Mine)  │
│ Cancel                       │
└──────────────────────────────┘
```

### 5.2 The 5 variants

| Variant | Primary action | Extras shown | Source of truth (key) |
|---|---|---|---|
| **NPC Controlled** | `node.action.challengeNpc` | Major nodes get "Unlocks Floor {next}" tip | `node.state.npcControlled` |
| **Available** | `node.action.occupy` | Reward cap hours | `node.state.available` |
| **Player Occupied** | `node.action.challengePlayer {player}` (danger) | Defender chip, capture reward, free-attempts cost | `node.state.playerOccupied` |
| **Occupied by Me** | `node.action.claimRewards {amount}` (gold) + `node.action.leave` (danger) | Accumulated reward card, cap timer, defense count | `node.state.occupiedByMe` |
| **Blocked by Garrison** | `nodeDetail.gotoGarrison` (routes to Garrison) | Crimson banner with `nodeDetail.blockedTitle` + `nodeDetail.blockedHint` | n/a — driven by `playerState === "garrisoning"` |

### 5.3 Win chance

Bucketed, never an exact percentage:
- `ratio = playerCP / recommendedCP`
- `ratio ≥ 1.15` → `winChance.high` (teal)
- `1.15 > ratio ≥ 0.9` → `winChance.fair` (gold)
- otherwise → `winChance.low` (crimson)

Implemented as `winChanceBucket(playerCP, recCP)` in `components.jsx`.

### 5.4 Protection rule surface

When a node is in its 5-minute post-occupation protection window, opening its detail sheet should show:

- Header state badge `node.state.protected` with the live timer.
- A line `nodeDetail.protectionEnds` "Protection ends in {time}" replacing the cost row.
- Primary button disabled with caption `nodeDetail.protectedHint`.

(In the mockup this is rendered inline on Floor variant 3 as a small `Mira ⏳ 2m` tile; the full sheet variant is reserved for build.)

### 5.5 Blocked-action coherence

When the player is `Garrisoning` and taps any non-mine node:
1. Floor card button text becomes `common.locked`.
2. Tapping opens the **Blocked variant** of the detail sheet (not a toast). Why a sheet, not a toast? Because the blocked decision is structurally identical to a regular detail decision: "look at this node, then either go back to your garrison or cancel." A sheet centers the decision; a toast vanishes.
3. The sheet's primary CTA routes to Garrison so the player can leave from one tap.

---

## 6. i18n Key Set (used by the mockups)

The full dictionary lives in `src/i18n.jsx`. Highlights:

### 6.1 Namespaces

```
common.*       generic verbs / nouns (challenge, occupy, leave, cancel, …)
state.*        StateBanner copy (free/garrisoning/inBattle/blocked) — title + hint pairs
home.*         home page copy (CTAs, quick actions, activity rows, notifications)
tower.*        tower meta (title)
floor.*        floor titles / rules / chips / names
node.type.*    small / medium / major (long + short forms)
node.state.*   npcControlled / available / playerOccupied / occupiedByMe / protected / locked / cleared
node.action.*  challengeNpc / occupy / challengePlayer / viewGarrison / claimRewards / leave
nodeDetail.*   CP labels, win chance label, defender meta, cost, blocked, unlocks-next tip
winChance.*    low / fair / high
garrison.*     duration / capIn / capFull / accumulated / defenses / reminder
res.*          gold / stones / fragments / tickets / gear
rarity.*       common / rare / epic / legendary
time.*         time format templates
blocked.*      reasons surfaced under disabled actions
tab.*          home / floor / equipment / reports
```

### 6.2 Key examples used directly by the mockups

```json
{
  "state.free.title": "Ready to climb",
  "state.free.hint": "Defeat nodes to loot gear and unlock higher floors.",
  "state.garrisoning.title": "Garrisoning {nodeName}",
  "state.garrisoning.hint": "Rewards are accumulating. Leave to climb higher.",
  "state.blocked.title": "One character, one position",
  "state.blocked.hint": "Leave {nodeName} before challenging another node.",

  "home.cta.fightMajor": "Fight the Floor Boss",
  "home.cta.continueClimbing": "Continue Climbing",
  "home.cta.claimRewards": "Claim Rewards ({amount})",
  "home.cta.leaveNode": "Leave Node",
  "home.notif.newReports": "{count} new battle report",

  "floor.title": "Floor {floor}",
  "floor.unlocksNext": "Defeating this unlocks Floor {next}",
  "floor.cleared": "Cleared",

  "node.type.major.short": "Major",
  "node.state.npcControlled": "NPC Controlled",
  "node.state.available": "Available",
  "node.state.playerOccupied": "Held by {player}",
  "node.state.occupiedByMe": "Occupied by you",
  "node.state.protected": "Protected · {time}",

  "node.action.challengeNpc": "Challenge",
  "node.action.occupy": "Occupy Node",
  "node.action.challengePlayer": "Challenge {player}",
  "node.action.viewGarrison": "View Garrison",
  "node.action.claimRewards": "Claim ({amount})",
  "node.action.leave": "Leave Node",

  "nodeDetail.recommendedCP": "Recommended CP",
  "nodeDetail.yourCP": "Your CP",
  "nodeDetail.winChance": "Win chance",
  "nodeDetail.rewards": "Rewards",
  "nodeDetail.defender": "Defender",
  "nodeDetail.captureReward": "Capture reward",
  "nodeDetail.dailyFree": "{used} / {max} free attempts used today",
  "nodeDetail.blockedTitle": "You're garrisoning {nodeName}",
  "nodeDetail.blockedHint": "Leave it before you can challenge another node.",
  "nodeDetail.gotoGarrison": "Go to Garrison",

  "winChance.low": "Low",
  "winChance.fair": "Fair",
  "winChance.high": "High",

  "garrison.duration": "Garrisoned for {time}",
  "garrison.capIn": "Reward cap in {time}",
  "garrison.reminder": "Your character is guarding this node. Leave to climb higher floors.",

  "blocked.byGarrison": "Leave {nodeName} to challenge other nodes.",
  "blocked.dailyLimit": "Daily free attempts used.",
  "blocked.lowTickets": "Not enough Challenge Tickets."
}
```

### 6.3 i18n layout rules (applied in the mockups)

| Concern | Rule in code | Where it shows |
|---|---|---|
| Button text growth | `text-wrap: balance`, `min-height` instead of `height`, two-line max | All `<Btn>` instances |
| Tab labels | 4 fixed tabs, each label gets `flex: 1`; never truncated | `<TabBar>` |
| Node card names | Display serif, line-clamp 2; medium cards intentionally taller than 4 lines of CJK text | `<MediumNodeCard>` |
| Defender chip | Avatar fixed, name flex, CP fixed right column; long names ellipsize, never push CP off-screen | `<DefenderChip>` |
| Numbers | `font-variant-numeric: tabular-nums` everywhere; locale-aware thousands separator via `.toLocaleString()` | `.tw-num` class |
| Time strings | Templated through `time.h_m`, `time.m`, `time.minAgo` — never concatenated | Activity rows, timers |
| Player names | Raw user data, never translated. Sanitized; truncated visually at 12 chars in the defender chip | Defender chip, activity rows |

### 6.4 Language stress matrix

| Language | Worst-case sample | UI behavior |
|---|---|---|
| en | "Continue Climbing" | baseline |
| zh-CN | "继续登塔" | shrinks to ~50% — banner copy stays single-line |
| zh-TW | "繼續攀登" | same as zh-CN |
| ja | "登攀を続ける" | ~70% — fine |
| ko | "타워 등반 계속" | ~95% — fine |
| de | "Aufstieg fortsetzen" | ~120% — button grows to 2 lines without crop |
| fr | "Continuer l'ascension" | ~130% — same |
| ru | "Продолжить восхождение" | ~140% — same; defender CP column does not collide |

---

## 7. Component Breakdown (mockup → code)

Every shipped component is in `src/components.jsx`, `src/home.jsx`, `src/floor.jsx`, `src/nodedetail.jsx`. Prop sketches below match the implementation.

### 7.1 Global

```ts
// <StateBanner>
type StateBannerProps = {
  state: "free" | "garrisoning" | "battle" | "blocked";
  nodeName?: string;       // used by garrisoning / blocked
};

// <PhoneFrame>
type PhoneFrameProps = {
  width?: number; height?: number;
  children: React.ReactNode;
  modal?: React.ReactNode; // overlay (Node Detail sheet, confirms)
};

// <Btn>
type BtnProps = {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean; fullWidth?: boolean; small?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

// <TabBar>
type TabBarProps = {
  active: "home" | "floor" | "equipment" | "reports";
  redDots?: Partial<Record<"home"|"floor"|"equipment"|"reports"|"garrison", boolean | number>>;
};
```

### 7.2 Home

```ts
// <HomeScreen>
type HomeVariant = "free" | "garrisoning" | "garrisoning_with_report";
type HomeScreenProps = {
  variant?: HomeVariant;
  onOpenFloor?: () => void;
  onOpenGarrison?: () => void;
  onOpenReports?: () => void;
};

// <TowerPreview>     { floor, floorNameKey }
// <GarrisonPreview>  { floor, nodeNameKey, durationLabel, accumulated[], capLabel, capUrgent }
// <QuickAction>      { glyph, labelKey, redDotCount?, muted? }
// <ActivityRow>      { row: { type, vars, time, fresh? } }
// <PlayerChip>       { player }
// <SectionHead>      { title, right? }
```

### 7.3 Floor

```ts
type FloorVariant = "early" | "postClear" | "pvp" | "garrisoning";
type FloorScreenProps = {
  variant?: FloorVariant;
  onTapNode: (node: NodeData) => void;
};

type NodeState =
  | "npcControlled" | "available" | "playerOccupied"
  | "occupiedByMe" | "protected" | "locked" | "cleared";

type NodeType = "small" | "medium" | "major";

type NodeData = {
  id: string;
  nameKey: string;
  type: NodeType;
  state: NodeState;
  recommendedCP: number;
  rewards: string[];           // "gold:240" | "fragments:3" | "gear:epic"
  rewardCapHours: number;
  occupier?: { name: string; cp: number; garrisonedMin: number; defenses: number };
  garrison?: { startedMin: number; accumulated: Record<string, number>; capInMin: number; defenses: number };
  protectionMin?: number;
};

// <MajorNodeCard>   { node, playerState, playerCP, floorNext, onTap }
// <MediumNodeCard>  { node, playerState, playerCP, onTap }
// <SmallNodeTile>   { node, playerState, onTap }
// <FloorHeader>     { floor, floorNameKey, ruleKey, cleared, nextUnlocked }
// <FloorSwitcher>   { current, max }
// <NodeStateBadge>  { state, occupierName?, protectionMin? }  → drives color + label
// <NodeTypeBadge>   { type }
```

### 7.4 Node Detail

```ts
type NodeDetailVariant =
  | "npcControlled" | "available" | "playerOccupied"
  | "occupiedByMe" | "blocked";

type NodeDetailSheetProps = {
  variant: NodeDetailVariant;
  node: NodeData;
  player?: Player;
  myGarrisonNodeName?: string;   // for "blocked" copy
  onClose: () => void;
  inline?: boolean;              // when true, no scrim — used for stand-alone variants
};

// Internal:
// <SheetBody>    renders variant-specific blocks (defender chip, accumulated, blocked banner)
// <SheetActions> renders primary / danger / cancel buttons per variant
// <DefenderChip> { defender: { name, cp, garrisonedMin, defenses } }
// <StatRow>      { label, value, valueColor, hint }
// <WinChancePill>{ bucket: "low"|"fair"|"high" }
```

### 7.5 Token bundle

`tokens` exported from `src/components.jsx`:

```ts
const tokens = {
  // surfaces
  bg, surface, surfaceRaised, inset,
  // borders
  borderSubtle, borderStrong,
  // text
  textPrimary, textSecondary, textMuted,
  // accents (state colors)
  gold, goldDim,     // currency, mine, primary CTA
  purple, purpleDim, // garrisoning, epic rarity
  crimson, crimsonDim, // PvP / enemy / danger
  teal, tealDim,     // free, available, success
  npc,               // NPC-controlled state
  rarity: { common, rare, epic, legendary },
  // type
  fontUI, fontDisplay, fontNum,
};
```

---

## 8. Interaction notes baked into the mockup

- Tapping a node card on **any Floor artboard** opens the matching Node Detail variant inside that phone — proves the routing.
- Tapping the **mine** node card on Floor variant 3 (PvP) opens the "Occupied by Me" variant.
- Tapping any **non-mine** node card on Floor variant 4 (Garrisoning) opens the **Blocked** variant.
- The cancel/close buttons in the sheet dismiss back to the Floor.

---

## 9. Implementation Feasibility Notes (for a solo dev)

- **Zero custom illustrations.** Tower preview and node art strips are CSS gradients + a monospace `[placeholder]` tag so an artist can drop in real PNGs later without touching layout.
- **Single React tree per phone.** No portals, no global modal stack. Each phone owns its own `openNode` state.
- **No transitions on enter.** The sheet just appears. WeChat Mini Game runtimes are happier without entrance animations.
- **No virtualization needed.** Floor screen has at most 7 cards on screen.
- **Server contract:** every CTA in the mockup maps to a single async call (`challengeNode(id)`, `occupyNode(id)`, `claimGarrison()`, `leaveNode({ claim })`, `fetchFloor(id)`). No optimistic state needed for MVP; transition through a global `In Battle` state then re-fetch.
- **i18n install cost:** the entire mockup uses one helper (`t(key, vars)`) and one dictionary file. Swapping to react-i18next / vue-i18n is a one-line change later.

---

## 10. What to Avoid in This Mockup Phase

Reaffirmed from the brief; everything below is **explicitly not** in the mockups and should not be added when implementing:

- World map / drag-to-pan node graph.
- Real-time multiplayer combat surfaces.
- Guild / chat / friend list.
- Skill tree, gear washing, gem sockets, set bonuses.
- Heavy 3D / Spine / particle scenes.
- Hard-coded visible strings.
- Designs that lock to English string lengths.
- Exact win-percentage numbers (we render buckets only).
- Notifications / push-permission prompts on first run.

---

## 11. File Map

```
Tower PvP Hi-Fi Mockups.html        ← canvas entry
design-canvas.jsx                   ← starter (pan/zoom canvas shell)
src/
├── i18n.jsx                        ← dictionary + t() + <LocaleText>
├── data.jsx                        ← Player + Floor2 variants + activity
├── components.jsx                  ← tokens, PhoneFrame, StateBanner, Btn, badges, …
├── home.jsx                        ← <HomeScreen> + Home-specific atoms
├── floor.jsx                       ← <FloorScreen> + Major/Medium/Small cards + FloorSwitcher
├── nodedetail.jsx                  ← <NodeDetailSheet> with 5 variants
└── canvas-app.jsx                  ← wires phones into design canvas artboards
```

End of addendum.
