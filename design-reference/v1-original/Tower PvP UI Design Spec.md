# Tower PvP — Mobile UI Design Specification (MVP)

> Lightweight gear-looting tower-climbing game with asynchronous node-occupation PvP.
> Target platform: WeChat Mini Game (mobile portrait).
> Audience for this doc: solo developer / frontend AI coding agent.

This document is the implementation-ready frontend spec. Every page, component, state, and string is written so it can be translated directly into a React / Taro / Vue / Cocos-UI codebase by a single developer.

---

## 0. Design Principles (read first)

1. **One character, one position.** This rule drives every screen. The Home page header always shows the player's current state (`Free` / `In Battle` / `Garrisoning`), and any action that conflicts with the current state is *disabled with a reason*, never silently hidden.
2. **3-second next-action rule.** Whatever screen the player lands on, the primary CTA is the largest, most saturated button on screen.
3. **No invented complexity.** No gem sockets, no set bonuses, no real-time map, no guilds. If a feature isn't on the spec, it's not in the MVP.
4. **i18n-first.** No hard-coded strings. Every visible label is a key. Layouts assume strings may grow up to 1.6× (German/French) or shrink to ~0.5× (CJK).
5. **Dark-fantasy card UI, not 3D.** All artwork is flat illustration / icon-driven. The "tower" is a stack of pages, not a 3D scene.

---

## 1. Overall Visual Style

### 1.1 Mood

A muted dark-fantasy abyss tower. Think weathered parchment lit by torchlight, gold filigree on stone, glowing rune accents. Not grimdark, not cartoony — somewhere between an idle ARPG and a tabletop dungeon book.

### 1.2 Color tokens

| Token | Hex | Usage |
|---|---|---|
| `bg.base` | `#15131C` | App background |
| `bg.surface` | `#1F1B29` | Card background |
| `bg.surfaceRaised` | `#2A2438` | Modal, elevated card |
| `bg.inset` | `#100E18` | Inset / slot background |
| `border.subtle` | `#3A3247` | Card borders, dividers |
| `border.strong` | `#5A4D72` | Active card, focused modal |
| `text.primary` | `#F2ECDC` | Headings, body |
| `text.secondary` | `#A89F8C` | Sub-labels, hints |
| `text.muted` | `#6B6478` | Disabled, captions |
| `accent.gold` | `#E8B53C` | Primary CTA, rare rewards, currency |
| `accent.purple` | `#8A5BD6` | Epic gear, garrison state |
| `accent.crimson` | `#C8384B` | PvP, danger, "Leave" warning |
| `accent.teal` | `#3FB8A1` | Success, victory, "available" node |
| `state.npc` | `#7A6E59` | NPC-controlled node |
| `state.available` | `#3FB8A1` | Defeated / occupy-ready |
| `state.mine` | `#E8B53C` | Occupied by me |
| `state.enemy` | `#C8384B` | Occupied by other player |
| `rarity.common` | `#9EA0A6` | |
| `rarity.rare` | `#3D8FE0` | |
| `rarity.epic` | `#8A5BD6` | |
| `rarity.legendary` | `#E8B53C` | |

### 1.3 Type

- **Display / titles:** `Cinzel` (or system equivalent serif). Floor names, battle result banners.
- **UI:** `Inter` Latin + `Noto Sans SC/JP/KR` for CJK. One stack, swap by locale.
- **Numbers (combat power, damage, rewards):** `Inter` tabular-nums, weight 700.
- Sizes (mobile @ 1× / `rem` = 16px):
  - `display`: 28 / 700
  - `title`: 20 / 600
  - `body`: 14 / 400
  - `caption`: 12 / 500
  - `numericLarge`: 32 / 700 tabular
  - `numericInline`: 14 / 700 tabular

### 1.4 Shape, elevation, motion

- Card radius `12px`, modal radius `16px`, button radius `8px` (pill for primary CTA).
- One elevation level (`shadow: 0 4px 12px rgba(0,0,0,.45)`). No second layer.
- Motion: 150ms ease-out for state changes, 300ms for modal in/out. Avoid 3D flips, particle bursts, screen shakes. A subtle gold glow on a "loot drop" frame is enough.

---

## 2. Information Architecture

```
App
├── Home (Tower Overview)              ← default tab
│   ├── State Banner (Free / Battle / Garrisoning)
│   ├── Primary CTA (state-driven)
│   └── Quick entries: Floor · Equipment · Reports · Garrison
│
├── Floor (Node Page)                  ← entered from Home
│   └── Node Detail Modal              ← over Floor
│       └── Battle → Battle Result     ← takes over screen
│
├── Equipment
│   ├── Equipped slots
│   ├── Backpack list
│   └── Gear Compare sheet
│
├── Garrison (only meaningful when state=Garrisoning)
│   ├── Reward Claim
│   ├── Defense Log
│   └── Leave Node confirm
│
├── Reports (Battle Reports)
│   └── Report Detail
│
└── Profile / Settings (minimal: language, audio, account)
```

Tab bar: **4 tabs only** — `Home`, `Floor`, `Equipment`, `Reports`.
`Garrison` is *not* a tab — it's accessed from a state banner on Home and from the occupied node card. This reinforces "one position".

---

## 3. Global Layout & Components

### 3.1 Screen frame

```
┌─────────────────────────────┐  ← safe-area top (notch)
│  StatusStrip                │  44pt
├─────────────────────────────┤
│  PageHeader (title + back)  │  48pt
├─────────────────────────────┤
│                             │
│  Scrollable content         │
│                             │
├─────────────────────────────┤
│  TabBar                     │  64pt + safe-area bottom
└─────────────────────────────┘
```

`StatusStrip` is a slim 28pt strip that sits *above* every page header on Home/Floor/Equipment/Reports. It shows the player state and is the single most important UI guarantee in the game:

```
[ ⚔ Free ]   CP 1,284   ⛃ 4,820   ✦ 12
[ ⛨ Garrisoning · F2 Crypt Gate ]   CP 1,284   ⛃ 4,820
[ ⚡ In Battle ]   …spinner…
```

Background color of the strip changes by state:
- `Free` → `bg.surface`
- `Garrisoning` → `accent.purple @ 18% opacity` over `bg.surface`
- `In Battle` → `accent.crimson @ 18% opacity` (non-interactive)

### 3.2 Reusable components (used everywhere)

| Component | Purpose |
|---|---|
| `<StateBanner state />` | Top strip describing player state. Tap → routes to relevant screen (Garrison if garrisoning, Floor if free). |
| `<PrimaryButton labelKey />` | Full-width pill. Gold background, dark text. Only one per screen. |
| `<SecondaryButton labelKey />` | Outlined, used for "Leave", "Cancel", "Auto-equip". |
| `<DangerButton labelKey />` | Crimson fill for "Leave Node", "Dismantle". |
| `<NodeCard node />` | Used on Floor, Garrison, Reports. |
| `<GearCard gear compareTo? />` | Used in Equipment, drop screens, modals. |
| `<RewardChip type amount />` | `⛃ 240`, `✦ 3`, `🜚 1` — single line. |
| `<CPDelta from to />` | `CP 1,284 → 1,412 (+128)` with color: green positive, red negative. |
| `<TimerPill seconds />` | Live countdown, used for reward-cap timers and PvP protection. |
| `<EmptyState iconKey titleKey hintKey />` | Used in Reports / Backpack when empty. |
| `<RedDot count? />` | Used on tab icons and entry buttons. |
| `<LocaleText k vars? />` | Single source of truth for rendering localized strings. **Never write raw text in JSX.** |

---

## 4. Page-by-Page Layout

> Wireframes are ASCII for clarity. All dimensions assume a 375×812 logical viewport (iPhone-class). Scale tokens, not pixels.

### 4.1 Home / Tower Overview

```
┌─────────────────────────────┐
│ ⚔ Free          CP 1,284 ⛃ │  StateBanner
├─────────────────────────────┤
│  Floor 2 · Crypt Gate       │  PageHeader
│  Highest unlocked: 2 / 5    │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │  Tower preview art    │  │  ~140pt, static illustration
│  │  (placeholder)        │  │  reuses 1 image per floor band
│  └───────────────────────┘  │
│                             │
│  ┌─── PrimaryCTA ────────┐  │
│  │  ▶ Continue Climbing  │  │  state-driven label
│  └───────────────────────┘  │
│                             │
│  ── Quick Actions ───       │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│  │ ⚙   │ │ 📜  │ │ 🏰  │ │ 🏆  │
│  │Gear │ │Rep. │ │Garr.│ │Rank │
│  │ (●3)│ │ (●1)│ │     │ │ —   │
│  └─────┘ └─────┘ └─────┘ └─────┘
│                             │
│  ── Last Activity ───       │
│  • Won vs Ardyn at F1·N3    │
│  • Picked up Rare Helm      │
│                             │
├─────────────────────────────┤
│  [Home][Floor][Gear][Rep]   │  TabBar
└─────────────────────────────┘
```

**State-driven primary CTA matrix**

| State | Primary CTA | Action |
|---|---|---|
| Free, current floor has uncleared major node | `home.cta.fightMajor` "Fight the Floor Boss" | → Floor → preselect major node modal |
| Free, current floor cleared, next floor unlocked | `home.cta.continueClimbing` "Continue Climbing" | → Floor (next floor) |
| Free, all 5 floors cleared | `home.cta.farmFloor` "Farm Floor {n}" | → Floor selector |
| Garrisoning, rewards claimable | `home.cta.claimRewards` "Claim Rewards ({amount})" | → Garrison |
| Garrisoning, no rewards yet | `home.cta.viewGarrison` "View Garrison" | → Garrison |
| In Battle | (CTA hidden, replaced with spinner) | — |
| Has unread reports + above conditions | Above unchanged; Reports quick-entry gets red dot | — |

**Notification rules**

- Red dot on `Reports` icon if `unreadReports > 0`.
- Red dot on `Garrison` icon if `claimableRewards > 0` OR `pendingDefenseReports > 0`.
- Red dot on `Equipment` if `unequippedBetterGearCount > 0` (one CP comparison pass on backpack).

### 4.2 Floor / Node Page

The single most-used gameplay screen. Default to **card grid**, not a hand-drawn map — easier to implement and to localize.

```
┌─────────────────────────────┐
│ ⚔ Free          CP 1,284 ⛃ │
├─────────────────────────────┤
│ ◀ Floor 2 · Crypt Gate   ☰  │  PageHeader: back, title, floor switcher
│ Rule: Undead deal +10% dmg  │  floor modifier (caption)
├─────────────────────────────┤
│                             │
│  ┌─ Major ──────────────┐   │  major node is full-width,
│  │  💀  Lich Warden     │   │  taller, visually distinct
│  │  CP 1,600 · ⛃✦ Loot │   │
│  │  [ NPC Controlled ]  │   │
│  │  ▶ Challenge         │   │
│  └──────────────────────┘   │
│                             │
│  Medium                     │
│  ┌──────────┐ ┌──────────┐  │
│  │ Crystal  │ │ Bone     │  │
│  │ Vault    │ │ Reliquary│  │
│  │ CP 980   │ │ CP 1,020 │  │
│  │ [Player] │ │ [Avail.] │  │
│  │ Ardyn    │ │  Occupy  │  │
│  │ Challenge│ │          │  │
│  └──────────┘ └──────────┘  │
│                             │
│  Small                      │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐        │
│  │N1│ │N2│ │N3│ │N4│        │  compact small-node tiles
│  │⚔ │ │● │ │⛨ │ │⚔ │        │  icon shows state
│  └──┘ └──┘ └──┘ └──┘        │
│                             │
├─────────────────────────────┤
│  Floor 1 ◀ ● ● ○ ○ ▶ Floor 5│  FloorSwitcher (locked floors greyed)
└─────────────────────────────┘
```

**Node card states** (also drives icon + border color):

| State key | Border | Icon | Action label |
|---|---|---|---|
| `node.state.npcControlled` | `state.npc` | ⚔ | `common.challenge` |
| `node.state.available` | `state.available` | ● | `common.occupy` |
| `node.state.mine` | `state.mine` | ⛨ | `node.action.viewGarrison` |
| `node.state.playerOccupied` | `state.enemy` | ⚑ | `node.action.challengePlayer` |
| `node.state.protected` | `border.subtle` | ⏳ | `common.locked` (disabled, with timer) |
| `node.state.locked` | `border.subtle` | 🔒 | (disabled, floor not unlocked) |

**Disabled-with-reason pattern**: if player is `Garrisoning`, all `Challenge`/`Occupy` buttons render *disabled* with caption `node.disabled.garrisoning` "Leave your garrison to challenge". Tapping shows a small toast, not a blocking modal.

### 4.3 Node Detail Modal

Bottom sheet, ~70% of screen height, dismissible by swipe-down.

```
   ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
 ╱                            ╲
│  ╳        Crystal Vault      │  close on top-left, title centered
│           Medium · Floor 2   │
│  ┌──────────────────────────┐│
│  │  Defender: Ardyn         ││  appears only if player-occupied
│  │  CP 1,402 · Garrison 4h  ││
│  │  Defended 3 attacks      ││
│  └──────────────────────────┘│
│                              │
│  Recommended CP   1,200      │
│  Your CP          1,284 ✓    │  ✓ green if >= rec, ✗ red otherwise
│  Win Chance       ≈ 62%      │  bucketed: low / fair / high
│                              │
│  ── Rewards ──               │
│  ⛃ 240   ✦ 2   🜚 fragment×3 │
│  +0.6% gear drop bonus       │
│                              │
│  ── Cost ──                  │
│  ⏳ 1 Stamina  (you have 8)  │
│                              │
│  ┌───── PrimaryButton ─────┐ │
│  │  ▶ Challenge            │ │  label varies by node state
│  └─────────────────────────┘ │
│  [Secondary] Cancel          │
└──────────────────────────────┘
```

Rules:
- Win chance is a 3-bucket text label (`battle.winChance.low|fair|high`), not a misleading exact percentage.
- If player is `Garrisoning`, the primary button is replaced by a banner: `node.modal.garrisoningWarning` "You're garrisoning Bone Reliquary. Leave first to challenge." with a `node.modal.gotoGarrison` link.
- If node is `node.state.mine`, the modal becomes the **Garrison Reward Modal** (§4.6) — same component, different mode.

### 4.4 Battle Page & Battle Result

Battle is auto-resolved server-side; the page is theater for the outcome. ~6–10 second show, with a skip button always visible.

**Battle Page**

```
┌─────────────────────────────┐
│             ╳   ⏩ Skip      │  close & skip top-right
├─────────────────────────────┤
│                             │
│  You              Enemy     │
│  ┌──────┐         ┌──────┐  │
│  │ avt  │   VS    │ avt  │  │  portraits, ~96pt
│  └──────┘         └──────┘  │
│   ▰▰▰▰▱            ▰▱▱▱▱   │  HP bars
│  Player Name      Lich Warden│
│  CP 1,284         CP 1,600  │
│                             │
│  ⚡ -240   💢 -180 (CRIT!)   │  damage feed, last 4 lines
│  🩸 +60   ⚡ -210            │
│                             │
│  [Skill icons row: ◆ ◆ ◆ ◆] │  cosmetic only in MVP
│                             │
└─────────────────────────────┘
```

Implementation note: the entire battle can be a precomputed JSON log replayed at 1× / 3× / instant. No physics, no skill targeting UI.

**Battle Result — Victory**

```
┌─────────────────────────────┐
│           VICTORY           │  large display text, gold glow
│        Lich Warden fell     │
├─────────────────────────────┤
│  Rewards                    │
│  ⛃ 480   ✦ 8   🜚 ×2        │
│                             │
│  ┌─ GearDropCard ──────────┐│
│  │ ✦ Warden's Maul · Epic ││  gear drops are individually
│  │ +Atk 42 +Crit 4%       ││  card-presented, tappable
│  │ [ Compare ▸ ]          ││  → opens GearCompareSheet
│  └─────────────────────────┘│
│                             │
│  ✨ Floor 3 Unlocked!       │  contextual banner
│  ✨ Node available to occupy│
│                             │
│  ┌── Occupy This Node ────┐ │  primary if node-occupy unlocked
│  └────────────────────────┘ │
│  [ Continue ]               │  secondary
│  [ Next Floor ▸ ]           │  tertiary if unlocked
└─────────────────────────────┘
```

**Battle Result — Defeat**

```
┌─────────────────────────────┐
│           DEFEAT            │  muted crimson, no shake
├─────────────────────────────┤
│  You fell to the Lich Warden│
│                             │
│  Recommended CP   1,600     │
│  Your CP          1,284     │
│  Hint: Upgrade armor for HP.│  battle.defeat.hint.{key}
│                             │
│  Consolation                │
│  ⛃ 30   ✦ 1                 │
│                             │
│  [ Improve Equipment ]      │  → Equipment
│  [ Try Again ]              │
│  [ Back to Floor ]          │
└─────────────────────────────┘
```

Defeat in PvP defense (passive, while offline) generates a Battle Report instead of opening this screen — see §4.7.

### 4.5 Equipment

Two zones: **Equipped** (top, fixed) and **Backpack** (bottom, scrolling).

```
┌─────────────────────────────┐
│ ⚔ Free          CP 1,284    │
├─────────────────────────────┤
│ ◀ Equipment    [Auto-equip] │
├─────────────────────────────┤
│  Total CP                   │
│      1,284                  │  numericLarge
│  ATK 320 · HP 1,820 · DEF 84│
│                             │
│  ┌───────────────────────┐  │  Equipped: 6 slots, 2 rows × 3
│  │ Wpn │ Hlm │ Arm       │  │
│  │ ✦   │ ✦   │ —         │  │  rarity dot per slot, "—" if empty
│  │ Rng │ Nck │ Bts       │  │
│  │ ●   │ —   │ ●         │  │
│  └───────────────────────┘  │
│                             │
│  ── Backpack (12 / 40) ──   │
│  [All] [Wpn][Hlm][Arm][…]   │  filter tabs
│  [✓ Hide common] [Sort: CP] │  toggle + sort dropdown
│                             │
│  ┌──── GearCard ─────────┐  │
│  │ ✦ Warden's Maul · Epic│  │  Backpack list, vertical cards
│  │ Wpn · T2              │  │
│  │ ATK 42  Crit 4%       │  │
│  │ CP +128 if equipped   │  │  CPDelta computed live
│  │ [Equip] [Dismantle]   │  │
│  └───────────────────────┘  │
│  ┌──── GearCard ─────────┐  │
│  │ ● Iron Cap · Common   │  │
│  │ Hlm · T1              │  │
│  │ CP -8 if equipped     │  │  negative → muted text
│  │ [Equip] [Dismantle]   │  │
│  └───────────────────────┘  │
│  …                          │
│                             │
│  [Auto-dismantle commons]   │  bottom utility
└─────────────────────────────┘
```

- Tapping an Equipped slot opens the **Gear Compare sheet**: side-by-side current vs. best backpack option for that slot, with CPDelta and per-attribute diff.
- `Auto-equip best gear` performs a single pass: for each slot, equip the item that maximizes CP. Show a result toast: `equipment.autoEquip.result` "Equipped 3 items · CP +180".

MVP gear attributes only: `attack`, `health`, `defense`, `critRate`, `dodge`, `lifesteal`, `attackSpeed`, `nodeRewardBonus`. No sub-stats, no rerolls.

### 4.6 Garrison Page

Reachable from: Home StateBanner, the `Mine` node card on Floor, or the red-dot Garrison quick-entry.

```
┌─────────────────────────────┐
│ ⛨ Garrisoning · Bone Reliq. │  purple-tinted state banner
├─────────────────────────────┤
│ ◀ Garrison                  │
├─────────────────────────────┤
│  ┌─ NodeBanner ────────────┐│
│  │  Bone Reliquary          ││
│  │  Floor 2 · Medium        ││
│  │  Garrisoned for 4h 12m   ││
│  └──────────────────────────┘│
│                             │
│  ── Accumulated Rewards ──  │
│  ⛃ 1,240   ✦ 8   🜚 ×3      │
│                             │
│  Reward cap in: 3h 48m      │  TimerPill, turns crimson < 1h
│  Capacity bar: ▰▰▰▰▰▰▱▱     │
│                             │
│  ┌───── Claim Rewards ─────┐│  primary, gold
│  └─────────────────────────┘│
│                             │
│  ── Defense Log (3) ──      │  inline mini-list, last 3
│  ✓ Defeated Ardyn (CP1,180) │
│  ✓ Defeated Mira (CP 980)   │
│  ✗ Lost to Talen (CP 1,500) │  shown only if lost; takes player to
│                             │  Reports for full chain
│                             │
│  ── One Position Reminder ──│
│  Your character is guarding │
│  this node. Leave the node  │
│  to climb higher floors.    │
│                             │
│  [ Leave Node ]             │  DangerButton
└─────────────────────────────┘
```

**Leave Node confirmation**

```
   ┌── Confirm ──┐
   │  Leave Bone Reliquary?      │
   │  • Garrison rewards stop     │
   │  • Unclaimed rewards: ⛃240   │  warn if unclaimed > 0
   │  • You can re-occupy any     │
   │    available node            │
   │  [Cancel]    [Leave Node]    │
   └──────────────────────────────┘
```

If `unclaimed > 0` the confirm has a third button `garrison.leave.claimThenLeave` "Claim & Leave" that runs both transactions.

### 4.7 Reports Page

```
┌─────────────────────────────┐
│ ⚔ Free          CP 1,284    │
├─────────────────────────────┤
│ ◀ Battle Reports            │
│ [All][Attack][Defense][Lost]│  filter tabs
├─────────────────────────────┤
│  ┌─ ReportRow ─────────────┐│
│  │ ⛨ Defense Success        ││  green left edge
│  │ vs Mira  · Bone Reliq.   ││
│  │ CP 980 vs 1,284          ││
│  │ +⛃ 60                    ││
│  │ 4m ago                   ││
│  └──────────────────────────┘│
│  ┌─ ReportRow ─────────────┐│
│  │ ✗ Node Lost              ││  crimson left edge
│  │ vs Talen · Bone Reliq.   ││
│  │ CP 1,500 vs 1,284        ││
│  │ Auto-settled: ⛃ 320 ✦ 4  ││  auto reward shown
│  │ 12m ago                  ││
│  │ [ View Battle Replay ]   ││
│  └──────────────────────────┘│
│  …                          │
└─────────────────────────────┘
```

Report Detail = the Battle page in replay mode, plus header `reports.detail.title`.
"Revenge Challenge" is intentionally **out of MVP**.

### 4.8 Profile / Settings (minimal)

Single page reached from a small avatar tap on Home.

- Avatar + name (rename: post-MVP if no name service)
- Language picker: `zh-CN`, `zh-TW`, `en`, `ja`, `ko`
- Sound / Music toggles
- Battle speed default: 1× / 2× / 3×
- About / Privacy / TOS links

---

## 5. Key Components — Implementation Notes

### 5.1 `<NodeCard>`

Props:

```ts
type NodeCardProps = {
  node: {
    id: string;
    nameKey: string;        // i18n key, e.g. "node.f2.cryptVault.name"
    type: "small" | "medium" | "major";
    state: NodeState;
    recommendedCP: number;
    rewards: Reward[];
    occupier?: { name: string; cp: number; garrisonStartedAt: number };
    protectedUntil?: number;
  };
  playerState: "free" | "garrisoning" | "battle";
  playerCP: number;
  onAction: (action: NodeAction) => void;
};
```

Card height varies by type:
- `small`: 72pt, icon + state + CP
- `medium`: 132pt, full state
- `major`: 180pt, full state + reward preview + "Unlocks floor {n+1}" badge

### 5.2 `<GearCard>` & Gear Compare

```ts
type Gear = {
  id: string;
  slot: "weapon"|"helmet"|"armor"|"ring"|"necklace"|"boots";
  tier: 1|2|3|4|5;
  rarity: "common"|"rare"|"epic"|"legendary";
  nameKey: string;
  attrs: Partial<Record<AttrKey, number>>;
};
```

Rarity drives card border color + a corner ribbon icon. The card always shows **CP delta vs. currently equipped slot**, computed locally — never trust the server's preview.

### 5.3 `<StateBanner>`

A single component that subscribes to a global `playerState` store. Lives above every page header. Tap behavior:
- `Free` → if on Home, no-op; elsewhere → Floor
- `Garrisoning` → Garrison
- `In Battle` → Battle replay page (recover)

This is the canonical visualization of the "one character, one position" rule. **Do not duplicate state badges elsewhere on the page.**

### 5.4 `<LocaleText>`

```tsx
<LocaleText k="garrison.rewardCapIn" vars={{ time: "3h 48m" }} />
```

- Reads from a flat key store (one JSON per locale).
- Falls back to `en` if key missing in current locale.
- Logs missing keys in dev mode.
- Supports `{vars}` interpolation only — no MessageFormat plurals in MVP (use explicit keys: `gear.dropCount.one`, `gear.dropCount.many`).

### 5.5 Layout rules for i18n elasticity

- Buttons: `min-width: 96pt`, content padding `12pt 16pt`, text never truncated — buttons grow vertically (2 lines max) before truncating. Use `text-wrap: balance`.
- Stat rows: label left, value right, both with `flex: 1 1 auto`. If labels overflow, label wraps; value stays single-line.
- Tabs: horizontal scroll if combined width > viewport. Never compress to ellipsis.
- Numbers: format with locale-aware separator (`1,284` en, `1 284` fr, `1,284` zh, `1,284` ja).
- Dates: relative for < 24h, absolute date for ≥ 24h.

---

## 6. Core Interaction Flows

### 6.1 Defeat-NPC-then-Occupy

```
Home (Free) ─tap▶ Floor
Floor ─tap NodeCard (NPC)▶ NodeDetail modal
NodeDetail ─tap Challenge▶ Battle page
Battle ─auto-resolve▶ BattleResult (Victory)
BattleResult shows "Node available to occupy"
  ├─ tap Occupy ▶ state becomes Garrisoning ▶ Garrison page
  └─ tap Continue ▶ Floor (node now `state.available` for later)
```

### 6.2 Garrison → Leave → Climb

```
Home (Garrisoning) ─tap StateBanner▶ Garrison
Garrison ─tap Claim Rewards▶ inline animation, rewards added
Garrison ─tap Leave Node▶ confirm modal
  ├─ Cancel
  └─ Leave (or Claim & Leave) ▶ state becomes Free
Home now shows "Continue Climbing" CTA
```

### 6.3 Asynchronous PvP — being attacked while offline

```
[Server tick] Another player challenges your node.
Outcome A — Defender wins:
  Report row "Defense Success" appended. Garrison continues.
  Red dot on Reports tab on next app open.
Outcome B — Defender loses:
  Player state auto-transitions Garrisoning → Free (server-side).
  Auto-settlement: unclaimed rewards mailed to inventory.
  Report row "Node Lost" appended with replay link.
  On next app open: Home shows toast `reports.toast.nodeLost`.
```

### 6.4 Disabled actions due to state

```
Player is Garrisoning. Taps a different node's "Challenge" button.
→ Toast: node.disabled.garrisoning "Leave your garrison to challenge"
→ Toast has action: "Go to Garrison" (links to Garrison page)
```

No silent failures. Every blocked action explains why and offers the fix.

---

## 7. First 10-Minute Onboarding Flow

The onboarding is built as a **scripted overlay** with 5 beats. No separate tutorial scene — the player plays the real game with constrained choices.

| Minute | Beat | UI element |
|---|---|---|
| 0:30 | Welcome — show Home with `Free`, highlight Primary CTA "Fight First Foe" | Spotlight + caption `tutorial.t1.cta` |
| 1:00 | Player taps CTA → goes to Floor 1 → only small node N1 is interactable; rest are dimmed with `tutorial.lock` | Spotlight on N1 |
| 1:30 | NodeDetail forced-open; primary button highlighted | Caption `tutorial.t1.nodeDetail` |
| 2:00 | Battle starts, guaranteed victory script | Skip is hidden first time |
| 2:30 | Result: drop = guaranteed Rare weapon. Highlight "Compare" | Caption `tutorial.t1.firstLoot` |
| 3:00 | GearCompare sheet opens, highlight "Equip" | Caption `tutorial.t1.equip` |
| 3:30 | Back to Home; CP visibly increased; CTA changes to "Challenge medium node" | Toast `tutorial.t1.cpUp` |
| 5:00 | Defeat medium node N5; better gear; Equipment opened, highlight `Auto-equip` | Caption `tutorial.t1.autoEquip` |
| 7:00 | CTA "Fight the Floor Boss"; route to major node | Spotlight |
| 8:00 | Boss battle (scripted, win with current gear) | — |
| 9:00 | Victory result shows: `Floor 2 unlocked`. New panel: `tutorial.t1.unlockExplainer` — three lines explaining: defeat→loot→climb, and *teasing* occupation. | Caption block |
| 10:00 | Player returns to Home; CTA = "Continue Climbing"; onboarding ends. Garrisoning is introduced *only on Floor 2*, when the player first sees a `Available` node. | Coachmark `tutorial.t2.firstOccupy` |

PvP defense is introduced **after** the player first occupies a node (event-triggered coachmark, not time-triggered).

---

## 8. i18n Design

### 8.1 Namespace structure

```
common.*        global verbs and nouns (buttons, generic labels)
home.*          home page strings
tower.*         floor + tower meta strings
node.*          node names, states, actions
battle.*        battle UI + result strings
equipment.*     equipment page + slots + actions
gear.*          gear names, rarity, attributes
garrison.*      garrison page
reports.*       battle reports
resources.*     currency / item names
attributes.*    stat names (atk, hp, crit…)
rarity.*        common/rare/epic/legendary
errors.*        error toasts
tutorial.*      onboarding script
settings.*      settings page
time.*          time formats (e.g. "{h}h {m}m")
```

### 8.2 Example keys (canonical en)

```json
{
  "common.challenge": "Challenge",
  "common.occupy": "Occupy",
  "common.leave": "Leave",
  "common.claimRewards": "Claim Rewards",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.back": "Back",
  "common.close": "Close",
  "common.locked": "Locked",
  "common.you": "You",

  "home.state.free": "Free",
  "home.state.garrisoning": "Garrisoning · {nodeName}",
  "home.state.inBattle": "In Battle",
  "home.cta.fightMajor": "Fight the Floor Boss",
  "home.cta.continueClimbing": "Continue Climbing",
  "home.cta.farmFloor": "Farm Floor {floor}",
  "home.cta.claimRewards": "Claim Rewards ({amount})",
  "home.cta.viewGarrison": "View Garrison",

  "tower.floorTitle": "Floor {floor}",
  "tower.floorSubtitle": "{floorName}",
  "tower.highestUnlocked": "Highest unlocked: {floor} / {max}",
  "tower.floorRule": "Rule: {rule}",
  "tower.unlocksNext": "Defeating this unlocks Floor {next}",

  "node.type.small": "Small",
  "node.type.medium": "Medium",
  "node.type.major": "Major",
  "node.state.npcControlled": "NPC Controlled",
  "node.state.available": "Available",
  "node.state.mine": "Occupied by You",
  "node.state.playerOccupied": "Occupied by {player}",
  "node.state.protected": "Protected · {time} left",
  "node.state.locked": "Locked",
  "node.action.viewGarrison": "View Garrison",
  "node.action.challengePlayer": "Challenge Player",
  "node.modal.recommendedCP": "Recommended CP",
  "node.modal.yourCP": "Your CP",
  "node.modal.winChance": "Win Chance",
  "node.modal.rewards": "Rewards",
  "node.modal.cost": "Cost",
  "node.modal.garrisoningWarning": "You're garrisoning {nodeName}. Leave first to challenge.",
  "node.modal.gotoGarrison": "Go to Garrison",
  "node.disabled.garrisoning": "Leave your garrison to challenge",
  "node.disabled.inBattle": "Battle in progress",
  "node.disabled.lowStamina": "Not enough stamina",

  "battle.winChance.low": "Low",
  "battle.winChance.fair": "Fair",
  "battle.winChance.high": "High",
  "battle.skip": "Skip",
  "battle.speed": "Speed {x}×",
  "battle.result.victory": "Victory",
  "battle.result.defeat": "Defeat",
  "battle.result.unlockedFloor": "Floor {floor} Unlocked!",
  "battle.result.nodeNowAvailable": "Node available to occupy",
  "battle.result.continue": "Continue",
  "battle.result.occupy": "Occupy This Node",
  "battle.result.nextFloor": "Next Floor",
  "battle.result.tryAgain": "Try Again",
  "battle.result.improveGear": "Improve Equipment",
  "battle.defeat.hint.lowDefense": "Upgrade armor for more HP.",
  "battle.defeat.hint.lowAttack": "Find a stronger weapon.",
  "battle.defeat.hint.lowCrit": "Look for crit gear.",

  "equipment.totalCP": "Total CP",
  "equipment.autoEquip": "Auto Equip",
  "equipment.autoEquip.result": "Equipped {count} items · CP {delta}",
  "equipment.autoDismantle": "Auto-dismantle commons",
  "equipment.backpack": "Backpack ({used} / {cap})",
  "equipment.slot.weapon": "Weapon",
  "equipment.slot.helmet": "Helmet",
  "equipment.slot.armor": "Armor",
  "equipment.slot.ring": "Ring",
  "equipment.slot.necklace": "Necklace",
  "equipment.slot.boots": "Boots",
  "equipment.compare.title": "Compare",
  "equipment.equip": "Equip",
  "equipment.dismantle": "Dismantle",
  "equipment.cpDelta.positive": "CP +{n} if equipped",
  "equipment.cpDelta.negative": "CP {n} if equipped",

  "gear.tier": "T{tier}",
  "rarity.common": "Common",
  "rarity.rare": "Rare",
  "rarity.epic": "Epic",
  "rarity.legendary": "Legendary",

  "attributes.attack": "Attack",
  "attributes.health": "Health",
  "attributes.defense": "Defense",
  "attributes.critRate": "Crit Rate",
  "attributes.dodge": "Dodge",
  "attributes.lifesteal": "Lifesteal",
  "attributes.attackSpeed": "Attack Speed",
  "attributes.nodeRewardBonus": "Node Reward Bonus",

  "garrison.title": "Garrison",
  "garrison.duration": "Garrisoned for {time}",
  "garrison.accumulated": "Accumulated Rewards",
  "garrison.rewardCapIn": "Reward cap in {time}",
  "garrison.capacityFull": "Reward cap reached — claim now",
  "garrison.defenseLog": "Defense Log ({count})",
  "garrison.onePositionReminder": "Your character is guarding this node. Leave to climb higher floors.",
  "garrison.leave.confirmTitle": "Leave {nodeName}?",
  "garrison.leave.confirmBullet1": "Garrison rewards stop",
  "garrison.leave.confirmBullet2": "Unclaimed rewards: {amount}",
  "garrison.leave.confirmBullet3": "You can re-occupy any available node",
  "garrison.leave.claimThenLeave": "Claim & Leave",

  "reports.title": "Battle Reports",
  "reports.tab.all": "All",
  "reports.tab.attack": "Attack",
  "reports.tab.defense": "Defense",
  "reports.tab.lost": "Lost",
  "reports.row.attackWin": "Victory",
  "reports.row.attackLoss": "Defeat",
  "reports.row.defenseWin": "Defense Success",
  "reports.row.nodeLost": "Node Lost",
  "reports.row.autoSettled": "Auto-settled: {rewards}",
  "reports.detail.viewReplay": "View Battle Replay",
  "reports.empty.title": "No battle reports yet",
  "reports.empty.hint": "Reports appear when you fight or are challenged.",
  "reports.toast.nodeLost": "You lost {nodeName} while offline. Rewards mailed.",

  "resources.gold": "Gold",
  "resources.stones": "Upgrade Stones",
  "resources.fragments": "Gear Fragments",
  "resources.stamina": "Stamina",

  "time.short.h.m": "{h}h {m}m",
  "time.short.m": "{m}m",
  "time.relative.justNow": "just now",
  "time.relative.minAgo": "{n}m ago",
  "time.relative.hourAgo": "{n}h ago",

  "tutorial.t1.cta": "Tap to fight your first foe.",
  "tutorial.t1.nodeDetail": "Review the node, then tap Challenge.",
  "tutorial.t1.firstLoot": "You got new gear — tap Compare.",
  "tutorial.t1.equip": "Tap Equip to grow stronger.",
  "tutorial.t1.cpUp": "Your CP went up!",
  "tutorial.t1.autoEquip": "Tap Auto-Equip to gear up quickly.",
  "tutorial.t2.firstOccupy": "Defeated nodes can be occupied for passive rewards.",

  "settings.language": "Language",
  "settings.sound": "Sound",
  "settings.music": "Music",
  "settings.battleSpeed": "Battle Speed",

  "errors.network": "Connection error. Retry?",
  "errors.staminaLow": "Not enough stamina.",
  "errors.garrisoningBlock": "You are garrisoning. Leave first."
}
```

### 8.3 Variable formatting rules

| Variable | Format spec | Example (en / zh-CN / ja) |
|---|---|---|
| `{floor}` | integer | `2 / 2 / 2` |
| `{combatPower}` | locale-aware thousands | `1,284 / 1,284 / 1,284` |
| `{rewardAmount}` | resource icon + locale int | `⛃ 1,240` |
| `{time}` | `time.short.h.m` etc. | `3h 48m / 3小时48分 / 3時間48分` |
| `{nodeName}` | i18n key reference, not literal | `node.f2.cryptVault.name` |
| `{playerName}` | raw user input — never translated; sanitized for length, max 12 chars rendered with ellipsis |
| `{rarity}` | `rarity.*` | Common / 普通 / ノーマル |
| `{tier}` | `gear.tier` with var | T1 / T1 / T1 |

**Critical i18n test cases (write at least one snapshot per page):**

- German Home with `home.cta.continueClimbing` ("Aufstieg fortsetzen") — ensure CTA grows to 2 lines without cropping.
- Japanese Battle Result with `battle.result.unlockedFloor` ("フロア3 解放！") — ensure banner doesn't truncate.
- Simplified Chinese Equipment row with 4-character attribute names — ensure alignment.

---

## 9. Component Breakdown for Frontend Implementation

Organized as a flat component tree a solo dev can build top-down. Each item lists Props in / State out / Dependencies.

### 9.1 Pages

```
<HomePage />
<FloorPage />
<EquipmentPage />
<ReportsPage />
<GarrisonPage />
<BattlePage />
<BattleResultPage />
<SettingsPage />
```

### 9.2 Layout chrome

```
<AppShell>
  <SafeArea />
  <StateBanner />        ← global, reads playerStore
  <PageOutlet />
  <TabBar />             ← 4 tabs, with red-dot from notifStore
</AppShell>
```

### 9.3 Domain components

```
<NodeCard size="small|medium|major" />
<NodeDetailSheet />
<GearCard />
<GearCompareSheet />
<EquipmentSlotGrid />
<EquippedSlot />
<RewardChip />
<RewardList />
<CPDelta />
<TimerPill />
<RedDot />
<EmptyState />
<ReportRow />
<ConfirmModal />
<Toast />
<Coachmark />            ← tutorial overlay
```

### 9.4 Stores (Zustand / Pinia / equivalent)

```
playerStore   { id, name, cp, state, garrisonNodeId?, stamina, currencies }
floorStore    { floors[], currentFloorId, nodesByFloor }
inventoryStore{ equipped, backpack, capacity }
reportsStore  { rows[], unreadCount }
notifStore    { redDots: { reports, garrison, equipment } }
i18nStore     { locale, dict, t(k, vars) }
tutorialStore { step, completedSteps[] }
```

### 9.5 Service layer (each is a single async fn)

```
fetchHomeBootstrap()        → seeds player, floor, notifs
fetchFloor(floorId)         → nodes for a floor
challengeNode(nodeId)       → returns BattleLog
occupyNode(nodeId)          → flips state to Garrisoning
leaveNode({ claim: bool })  → flips state to Free
claimGarrisonRewards()      → returns reward delta
fetchReports({ filter })    → paginated
equipGear(gearId)           → returns new CP + slots
dismantleGear(gearIds[])    → returns mats
autoEquip()                 → returns diff log
setLocale(lc)               → swaps dict
```

### 9.6 Render budget targets (WeChat Mini Game friendly)

- ≤ 60 DOM/canvas nodes per page above the fold.
- Single static illustration per page (no spritesheets).
- Battle replay = JSON log + tween, no skeletal animation.
- Avoid `box-shadow` on lists (use border + bg tint).
- Lazy-mount Reports list rows past 20 items.

---

## 10. What to Avoid in MVP

- **No real-time PvP.** Asynchronous only.
- **No world map.** Floors are pages, nodes are cards in a grid.
- **No alliance / guild / chat / friends.** Reports replace social.
- **No gear washing / sockets / runes / set bonuses / random affix rerolls.**
- **No marketplace, trading, gifting.**
- **No daily quests system or pass.** A single login claim is enough if needed at all.
- **No multiple characters / roster.** One character. Always.
- **No 3D scenes / spine animations / particle systems.** Flat illustration + CSS transitions.
- **No revenge auto-challenge.** Reports are read-only in MVP.
- **No leaderboard / ranking page surface.** Reserve a stub, don't ship UI.
- **No deep settings (graphics, account merging, region select).** Language + audio + battle speed only.
- **No notification permission prompts on first run.** Ask only after first garrison.
- **No localization fallback chain beyond `en`.** Don't build a tree if not needed.

---

## 11. Open Questions (flag back to designer/PM before build)

1. **Stamina or not?** The spec implies stamina for challenges; if not, remove from NodeDetail modal and adjust win-cycle pacing.
2. **Garrison protection window.** Is there a protected window after a node changes hands? UI has `state.protected` reserved — confirm duration and source of truth.
3. **Reward cap formula.** Spec says "cap exists" — define the per-node-type cap and where the timer comes from (server vs. client extrapolation).
4. **Floor-modifier scope.** Floor rules ("Undead deal +10%") are shown in PageHeader caption. Is this MVP content or post-MVP?
5. **Player rename.** No rename UI in MVP unless backend supports it.
6. **WeChat-specific surfaces.** Share card art, mini-game subpackage split, and offline-mail (for auto-settlement) need a separate platform-integration doc.

---

## 12. Implementation Order (recommended for solo dev)

1. Shell + i18n: `AppShell`, `LocaleText`, `TabBar`, `StateBanner`, settings language switch. *Day 1–2.*
2. Home with mocked store + state-driven CTA. *Day 3.*
3. Floor page + NodeCard + NodeDetailSheet (NPC only). *Day 4–5.*
4. Battle page (JSON-log replay) + Result page. *Day 6–7.*
5. Equipment + GearCard + Auto-equip. *Day 8–9.*
6. Garrison flow (occupy → garrison page → claim → leave). *Day 10–11.*
7. Async PvP: defender flow + Reports. *Day 12–13.*
8. Onboarding scripted overlay. *Day 14.*
9. i18n pass: load 5 locales, fix elasticity bugs. *Day 15.*

End of spec.
