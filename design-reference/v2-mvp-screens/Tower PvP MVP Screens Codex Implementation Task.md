# Tower PvP — MVP Screens Codex Implementation Task

You are extending the **existing Tower PvP React + TypeScript frontend** with the six newly designed MVP screens. This is your task file. Read it fully, then read `Tower PvP MVP Screens Handoff.md` (the v2 design handoff) and skim the v2 design reference under `design-reference/v2-mvp-screens/`. Work top-to-bottom. **Do not redesign anything.**

This task implements **Phase A only** on the first run. Stop and report after Phase A. Do not start Phase B until told.

---

## 1. Current project status

- The real frontend has already shipped v1 of three screens: **Home**, **Floor**, and **Node Detail Sheet**, ported into a production stack via `Codex Implementation Task.md`.
- The production project is **React 18 + TypeScript + Vite**, with routing, namespaced **react-i18next** (`en` + `zh-CN`), a **mock service layer** behind a single `VITE_USE_MOCKS` flag, **Zustand** stores and **TanStack Query**, design tokens in `src/tokens.ts` + CSS variables, CSS Modules, ESLint, Prettier, Vitest. No Babel-in-browser. No `window.*` globals. No `<script type="text/babel">`.
- The v2 design package adds **six new MVP screens**:
  - Battle Result
  - Garrison
  - Battle Resolving / Replay
  - Equipment
  - Reports
  - Settings (live language switch)
- The v2 package is **design reference only**. It is a Babel-in-browser prototype that uses `window.*` globals, plain `.jsx`, and string-prop "variants" instead of real state. **Codex must not import any file from `design-reference/v2-mvp-screens/` into production source**, and must not run those files through the production build.
- The approved v1 screens (Home / Floor / Node Detail) are **frozen**. Do not redesign or restyle them. They re-appear in the v2 canvas only for visual continuity.
- The v2 package introduces **new shared atoms** that the v1 design system doesn't have yet. These atoms belong in the production design system (`src/components/`) and must be ported as first-class TypeScript components — not duplicated per screen.

---

## 2. Design reference files

All v2 design reference files live under `design-reference/v2-mvp-screens/`. **Inspect, don't import.**

| Path (under `design-reference/v2-mvp-screens/`) | Contents | Port what? | Maps to in production |
|---|---|---|---|
| `Tower PvP MVP Screens.html` | Entry point that wires the v2 prototype together. Loads `i18n → i18n2 → data → data2 → components → components2 → screens → canvas-app2`. | **Visual reference only.** Use to view states in a browser if useful. | — (do not import) |
| `Tower PvP MVP Screens Handoff.md` | Authoritative v2 design handoff. Page inventory, routes, data shapes, interactions/states, i18n notes, design-system additions. | Use as the **source of truth** for routes, data shapes, state matrix, and design-system additions. | This file is the spec; everything else is illustration. |
| `src/components2.jsx` | New shared atoms extending `window.TowerUI`: `PushHeader`, `Panel`, `MiniHead`, `ProgressBar`, `HPBar`, `Toggle`, `Segmented`, `ListRow`, `EmptyState`, `GearIcon`, `GearCard`, `RarityDot`, `CombatantAvatar`, `SLOT_ORDER`. | **Port components verbatim** as TypeScript components into `src/components/`. Match markup, classes, and visual behaviour pixel-for-pixel. Do **not** port the `window.TowerUI` mutation pattern. | `src/components/{PushHeader,Panel,MiniHead,ProgressBar,HPBar,Toggle,Segmented,ListRow,EmptyState,GearCard,GearIcon,RarityDot,CombatantAvatar}/` |
| `src/data2.jsx` | Mock fixtures: `Equipped`, `Backpack`, `GearDrop`, `Reports`, `Battle` (`victoryNpc` / `victoryPlayer` / `defeat`), `ResolveLog`, `Garrison` (`normal` / `capNear` / `capFull` / `empty` / `lost`). | **Port the data values verbatim** into the existing mock fixture structure under `src/mocks/`. Retype as TypeScript. Do not change game content (CP, names, reward amounts, durations). | `src/mocks/fixtures/{gear,reports,battle,garrison}.ts` |
| `src/i18n2.jsx` | New EN keys for all six screens **and a full `zh` (Simplified Chinese) dictionary**. Mutates `window.TowerI18n.DICTS` in place. | **Port keys verbatim** (both `en` and `zh-CN`) into the existing react-i18next namespaced JSON. Preserve punctuation, full-width parens, plural rules, `{vars}`. | `src/i18n/locales/en/*.json`, `src/i18n/locales/zh-CN/*.json` |
| `src/battleresult.jsx` | `<BattleResultScreen data locale onBack>`. Reference markup, layout, and state branches (victory/defeat, NPC/player, drop/no-drop, occupy/return). | **Port page structure and state branches** into a typed page component. Replace the `locale` prop with `useTranslation()`. Replace `data` prop with a TanStack Query call into the mock service. | `src/pages/BattleResult/BattleResultPage.tsx` |
| `src/battleresolve.jsx` | `<BattleResolveScreen data log phase visibleLines myHp enemyHp locale onBack>`. Reference for the theatrical replay state machine. | **Phase B only.** Inspect to understand the resolve-then-result flow that funnels into `/battle/result`. Do not port in Phase A. | `src/pages/BattleResolve/BattleResolvePage.tsx` (Phase B) |
| `src/garrison.jsx` | `<GarrisonScreen data locale onBack startModalOpen>` + internal `LeaveModal`. Reference markup for accruing/cap-near/cap-full/empty/lost states and the leave-confirmation modal. | **Port page structure and state branches.** Lift `LeaveModal` into a reusable `LeaveConfirmModal` and route it through the global `ModalLayer`. | `src/pages/Garrison/GarrisonPage.tsx`, `src/components/LeaveConfirmModal/` |
| `src/equipment.jsx` | `<EquipmentScreen empty locale onSettings>` + internal `CompareSheet`. Reference for equipped 2-col grid, backpack list, better-than-equipped flags, compare sheet. | **Phase C.** Inspect only in Phase A; port in Phase C. | `src/pages/Equipment/EquipmentPage.tsx` (Phase C) |
| `src/reports.jsx` | `<ReportsScreen empty locale>`. Reference for filter segmented control, unread state, list rows, empty state. | **Phase C.** Inspect only in Phase A; port in Phase C. | `src/pages/Reports/ReportsPage.tsx` (Phase C) |
| `src/settings.jsx` | `<SettingsScreen initialLocale onBack>`. Reference for the **live EN ↔ 简体中文 switch** plus audio toggles, battle-speed segmented, account rows. | **Phase D.** Inspect only in Phase A; port in Phase D. The language switch hooks up to `i18n.changeLanguage()`. | `src/pages/Settings/SettingsPage.tsx` (Phase D) |
| `src/canvas-app2.jsx` | Pan/zoom review canvas for all v2 screens. Wires variants for each state. | **Do not port.** Use only as a state-matrix index — which states each screen must support. | — |

---

## 3. Implementation scope

The work is split into four phases. **Phase A is the only phase to implement on this run.** Phases B–D are documented here so Codex understands the eventual shape, but **must not** be started.

### Phase A — P0 Core loop (this run)

- **Goal:** Make the Challenge → Result → Occupy → Garrison loop playable on mock data.
- **Pages:** `BattleResultPage`, `GarrisonPage`.
- **Components to port:** `PushHeader`, `Panel`, `MiniHead`, `ProgressBar`, `EmptyState`, `GearCard`, `GearIcon`, `RarityDot`, `CombatantAvatar`, `LeaveConfirmModal`. Optionally extract a generic `Sheet` primitive (see §7).
- **Mock data to port:** all `Battle.*`, `Garrison.*`, and `GearDrop` fixtures from `data2.jsx`. Skip `Equipped`, `Backpack`, `Reports`, `ResolveLog`.
- **i18n keys to port:** the `battleResult.*`, `garrison.*`, `gear.*` (only those referenced by `Battle` / `Garrison` / `GearDrop`), `time.*`, and shared button/CTA keys touched by these two screens — both `en` and `zh-CN`. **Do not port** the Equipment-only, Reports-only, Settings-only, or Resolve-only keys yet.
- **Interactions:** Result actions (Occupy → push `/garrison`, Return → pop to `/floor`, Equip — gated to Phase C, Try Again — re-issue challenge); Garrison actions (Claim, Leave → opens `LeaveConfirmModal`, Confirm → pop to `/floor`, Cancel, Return on `lost`).
- **Acceptance criteria:** see §12.
- **Stop condition:** after Phase A passes `lint`/`build`/`test`, **stop and report**. Do not start Phase B.

### Phase B — Battle Resolving / Replay (future run)

- **Goal:** Wedge the theatrical resolve screen between Node Detail's Challenge and Battle Result.
- **Pages:** `BattleResolvePage`.
- **Components:** `HPBar`, speed `Segmented`.
- **Mock data:** `ResolveLog`, the matching `Battle.*` payload.
- **Interactions:** speed (Normal / Fast / Instant), Skip, auto-advance to `/battle/result`.
- **Stop condition:** Node Detail Challenge now routes through `/battle/resolve` → `/battle/result`.

### Phase C — Support tabs (future run)

- **Goal:** Light up the two existing bottom tabs that today route to stubs.
- **Pages:** `EquipmentPage` (with `CompareSheet`), `ReportsPage`.
- **Components:** `Toggle`, `ListRow`, the rest of the gear stack (full `Equipped`/`Backpack` grid, better-than-equipped indicators).
- **Mock data:** `Equipped`, `Backpack`, `Reports`.
- **Stop condition:** both tabs render real lists; Compare sheet equips; Reports filter + mark-all-read works.

### Phase D — Settings & language switch (future run)

- **Goal:** Replace the Settings stub with the real screen and a live language switch.
- **Pages:** `SettingsPage`.
- **Components:** `Segmented` (battle speed, language), `Toggle` (audio, notifications), `ListRow` (account, version).
- **Mock data:** local `settingsStore` (Zustand) for `locale`, `sfx`, `music`, `notifications`, `battleSpeed`.
- **Interactions:** language switch calls `i18n.changeLanguage()` and persists; everything else writes to the store and rehydrates from `localStorage`.
- **Stop condition:** the Settings gear icon on Equipment opens `/settings`; toggling language flips every visible label on every screen.

---

## 4. Phase A — detailed task

This is the only section Codex executes on this run. Be exhaustive.

### 4.1 Battle Result

**Route:** `/battle/result` — pushed route, not a tab. Query param `battleId` selects the fixture in mocks. In production this becomes a server lookup; for now `battleId ∈ { "victoryNpc", "victoryPlayer", "defeat" }` selects from `Battle.*`. If the param is missing, default to `victoryNpc` and log a dev warning.

**Data shape** (port verbatim into `src/services/types.ts`):

```ts
export type BattleOutcome = "victory" | "defeat";
export type OpponentKind = "npc" | "player";

export interface BattleStats {
  rounds: number;
  dmgDealt: number;
  dmgTaken: number;
  hpLeft: number; // percent 0–100
}

export interface BattleResult {
  outcome: BattleOutcome;
  opponentKind: OpponentKind;
  enemyNameKey?: string;       // i18n key when opponent is NPC content
  enemyName?: string;          // raw string when opponent is a player handle
  myCP: number;
  enemyCP: number;
  nodeNameKey: string;
  nodeType: "major" | "medium" | "small";
  floor: number;
  stats: BattleStats;
  rewards: string[];           // "type:amount" tokens — gold:240, fragments:3, stones:4
  drop: Gear | null;
  nodeUnlocked: boolean;
  canOccupy: boolean;
  upset?: boolean;             // beat a higher-CP player
}
```

**Required states** (each must render correctly when its fixture is selected):

| State | Fixture key | What must render |
|---|---|---|
| Victory vs NPC with gear drop | `victoryNpc` (set `drop = GearDrop`) | Victory banner + `Node unlocked` banner + rewards row + `GearCard` for the drop with CP-delta vs currently equipped weapon + CP comparison vs enemy + battle summary stats. Primary `Equip`, secondary `Occupy`, tertiary `Return to Floor`. |
| Victory vs NPC no drop | `victoryNpc` with `drop = null` | Same as above without the drop card. Primary `Occupy`, secondary `Return to Floor`. |
| Victory vs player (upset) | `victoryPlayer` | Victory banner, no `Node unlocked` banner, rewards, opponent name (raw string), upset highlight on enemy CP (lower-CP win indicator). Primary `Occupy`, secondary `Return to Floor`. |
| Defeat | `defeat` | Defeat banner (crimson), zero rewards (use `EmptyState`-like empty rewards row), full battle summary, opponent CP highlighted as higher. Primary `Try Again`, secondary `Return to Floor`. |
| Node unlocked / occupiable | derived from `nodeUnlocked` && `canOccupy` | `Node unlocked` banner + `Occupy` CTA enabled. When `canOccupy` is false, suppress `Occupy`. |
| Reward list | `rewards: string[]` | Render each `"type:amount"` token as a `RewardChip` (existing component from v1) in a flex row. When `rewards` is empty, render the rewards-empty placeholder. |
| Gear drop card | `drop: Gear` | `GearCard` with rarity-tinted border, slot icon, name (via `nameKey`), stat list, `+CP`, optional `New` badge. CP delta vs `Equipped[drop.slot].cp` shown in the card footer (`▲ +44 CP` or `▼ −12 CP`). When delta > 0, mark `Equip` as primary CTA. |
| CP comparison | `myCP` vs `enemyCP` via `CombatantAvatar` | Versus block: `CombatantAvatar` for `me` and `npc|player`, with CP numbers, vs separator. |
| Battle summary | `stats` | `Panel` containing 4 stat rows: rounds, damage dealt, damage taken, HP left (%). Use `MiniHead` for the section label. |

**Required actions**:

- `Occupy` — calls `mockService.occupyNode({ nodeId, battleId })`, then `navigate("/garrison", { state: { nodeId } })`.
- `Return to Floor` — `navigate("/floor/" + floor)`.
- `Equip` (only when `drop` present and CP delta > 0) — calls `mockService.equipGear({ gearId })`, optimistically updates the equipment store, then keeps the user on Result with the `Equip` CTA replaced by `Occupy`.
- `Try Again` (defeat only) — `navigate("/floor/" + floor + "?node=" + nodeId)`; in Phase B this routes back through `/battle/resolve`.

**Mock service expectations** (add to `src/services/mockService.ts`):

```ts
getBattleResult(battleId: string): Promise<BattleResult>;
occupyNode(args: { nodeId: string; battleId: string }): Promise<{ ok: true; garrisonId: string }>;
equipGear(args: { gearId: string }): Promise<{ ok: true }>;
```

Behind the same `VITE_USE_MOCKS` switch as v1. Resolve after a 150ms delay so loading states are real.

**i18n expectations** — port these key namespaces from `i18n2.jsx` (both `en` and `zh-CN`):

- `battleResult.*` (banners, CTAs, stat labels, CP labels, "Node unlocked", "Defeat", "Victory", "vs", upset/no-rewards messaging)
- `common.*` keys referenced by the screen (`common.back`, etc.)
- `gear.lichcleaver` (the drop fixture)
- Reward type labels already covered by the existing v1 reward chip mapping — extend if `GearDrop` introduces new ones.

No literal display strings in the page component. Every `t()` call must be a real key present in both locales.

**Visual / component expectations**:

- Use `PushHeader` for the top nav (back chevron + title from `battleResult.title`).
- Banner sits directly under the header; full-width, rarity-tinted background per outcome.
- `CombatantAvatar` pair centered, then rewards, then drop, then summary panel.
- CTAs pinned to the safe-area bottom; `min-height: 44px`; **never truncate** — wrap to two lines (`text-wrap: balance`).
- All spacing, type, and colors come from existing tokens. No new colors.

### 4.2 Garrison

**Route:** `/garrison` — pushed route, not a tab. Query param `nodeId` selects which occupied node is being shown. For mocks, query param `state` ∈ `{ normal, capNear, capFull, empty, lost }` selects the fixture from `Garrison.*` for review purposes; in production it derives from server state.

**Data shape**:

```ts
export interface GarrisonDefenseEntry {
  result: "win" | "loss";
  opponent: string;
  time: string;        // i18n key:arg, e.g. "time.minAgo:4"
  fresh?: boolean;
}

export interface Garrison {
  floor: number;
  nodeNameKey: string;
  nodeType: "major" | "medium" | "small";
  durationMin: number;
  rewards: string[];
  capPct: number;            // 0–100
  capInLabel: string;        // "5h 48m"
  capHours: number;          // total cap window
  capUrgent?: boolean;
  capFull?: boolean;
  defenses: { wins: number; losses: number };
  log: GarrisonDefenseEntry[];
  lost?: boolean;
  lostTo?: string;
}
```

**Required states**:

| State | Fixture key | What must render |
|---|---|---|
| Normal (accruing) | `normal` | Header with node name, duration, rewards panel with `ProgressBar` at 62%, defense log with three wins. `Claim` enabled. `Leave` enabled. |
| Cap nearly full | `capNear` | Same layout; `ProgressBar` in `urgent` variant (crimson) at 92%; "Cap in 41m" label. |
| Cap full | `capFull` | `ProgressBar` in `full` variant (gold + sheen) at 100%; "Claim to keep earning" CTA-adjacent hint string. |
| No rewards yet | `empty` | Empty rewards row (`EmptyState`-flavoured), `Claim` **disabled**. Empty defense log slot with `EmptyState` ("No defenses yet"). `Leave` enabled. |
| Empty defense log | (any state with `log.length === 0`) | Defense panel renders `EmptyState`. |
| Node lost | `lost` | Crimson "Node lost to {opponent}" banner at top. Rewards still claimable (unclaimed rewards before the loss). Footer CTA replaced with single `Return` (no Leave). |
| Leave confirmation modal | triggered by `Leave` button | `LeaveConfirmModal` over the page: warns character is freed, node reverts to NPC, unclaimed rewards lost. Buttons: `Confirm Leave` (destructive), `Cancel`. Use the global `ModalLayer` slot. |

**Required actions**:

- `Claim` — calls `mockService.claimGarrisonRewards({ nodeId })`. On success, rewards become empty and `capPct` resets in the store. Disabled when `rewards.length === 0`. Disabled visually with reduced opacity + `aria-disabled`.
- `Leave` — opens `LeaveConfirmModal`. Hidden when `lost` is true.
- `Confirm Leave` — calls `mockService.leaveGarrison({ nodeId })`, then `navigate("/floor/" + floor)`.
- `Cancel Leave` — closes the modal, no state change.
- `Return` (lost only) — `navigate("/floor/" + floor)`.

**Mock service expectations**:

```ts
getGarrison(nodeId: string, opts?: { state?: GarrisonStateKey }): Promise<Garrison>;
claimGarrisonRewards(args: { nodeId: string }): Promise<{ ok: true; rewards: string[] }>;
leaveGarrison(args: { nodeId: string }): Promise<{ ok: true }>;
```

The `state` opt is dev-only and ignored by the real backend; behind a `if (import.meta.env.DEV)` guard.

**i18n expectations** — port `garrison.*` keys (both `en` and `zh-CN`), plus the shared `time.minAgo`, `time.hourAgo`, `common.cancel`, `common.confirm`, and any reward chip labels referenced by `Garrison.*`. The zh-CN claim string intentionally uses full-width parens `（{amount}）` — preserve that.

**Visual / component expectations**:

- `PushHeader` titled from `garrison.title`.
- Top section: node name + type chip + duration (`Garrisoned for 4h 12m`).
- Rewards panel with `MiniHead` label, reward chips row, `ProgressBar` (variant per state), capInLabel text.
- Defense panel with `MiniHead` label, list of `ListRow`-style entries (but Phase A may inline a `DefenseRow` since the generic `ListRow` is a Phase C atom — use whichever yields the matching design; do not block Phase A on `ListRow`).
- Footer CTAs: `Claim` + `Leave` (or `Return` when `lost`). `min-height: 44px`. Wrap on CJK.
- `LeaveConfirmModal` shares scrim, grabber, and bottom-sheet rhythm with the v1 `NodeDetailSheet`. If you extract a `Sheet` primitive (see §7) it must be a non-breaking refactor of `NodeDetailSheet`.

---

## 5. Non-goals (Phase A)

Do not do any of the following during Phase A. Defer to later phases or future scope as noted.

- Do **not** implement Battle Resolving / Replay yet (Phase B).
- Do **not** implement Equipment yet (Phase C). The Equipment tab keeps its existing v1 stub.
- Do **not** implement Reports yet (Phase C). The Reports tab keeps its existing v1 stub.
- Do **not** implement Settings yet (Phase D). The Settings stub stays where it is.
- Do **not** build a backend or any HTTP layer. Only `VITE_USE_MOCKS=true` is exercised.
- Do **not** redesign Home / Floor / Node Detail. They are frozen. You may extend them only to wire the new routes (StateBanner deep-link to `/garrison`, Node Detail's Challenge CTA's `onClick` may push `/battle/result?battleId=victoryNpc` as a stand-in for Phase A; in Phase B this becomes `/battle/resolve`).
- Do **not** add a fifth bottom tab. Tabs stay exactly **Home · Floor · Gear · Reports**. Garrison and Settings are pushed routes.
- Do **not** introduce real-time PvP, presence, websockets, or any live data.
- Do **not** add guilds, leaderboards, marketplace, chat, friends, complex equipment enhancement, sockets, gems, or set bonuses.
- Do **not** directly import any file from `design-reference/v2-mvp-screens/`. No `from "../../design-reference/..."` paths in production source. The design-reference tree is **not** part of the TypeScript project and **not** scanned by ESLint, Vitest, or Vite.

---

## 6. Production integration rules

Codex must integrate the v2 design into the existing production project. **Do not scaffold a new project.**

- **Tokens & design system** — use existing `src/tokens.ts` + CSS variables. Rarity colors already exist (`tokens.rarity.{common|rare|epic|legendary}`); reuse them. No new colors.
- **Routing** — extend the existing router. Add `/battle/result` and `/garrison` as pushed routes (no `<TabBar>` highlight). Keep the four-tab `TabBar` exactly as-is.
- **i18n** — use the existing react-i18next setup. Add keys to the existing namespaced JSON. Use `useTranslation()` inside components. Both `en` and `zh-CN` must be complete for every Phase A key.
- **Mock service layer** — extend the existing `src/services/mockService.ts` with the new methods. Real implementations behind `VITE_USE_MOCKS=false` get the same signature but throw `NotImplemented` for now — do not stub them with fake HTTP.
- **State** — extend existing Zustand stores. If a `playerStore` already tracks `state` (free / garrisoning / battle), it must transition correctly on Occupy/Leave/Claim. If a `notifStore` exists, leave it alone (Reports/Settings are Phase C/D).
- **TanStack Query** — wrap `getBattleResult` and `getGarrison` in query hooks with proper loading/error/empty states. Mutations (`occupyNode`, `claimGarrisonRewards`, `leaveGarrison`, `equipGear`) use `useMutation` with optimistic updates where the design implies one (Claim, Leave).
- **TypeScript types** — add interfaces to `src/services/types.ts`. Reuse existing `Gear`, `Reward`, `Player` types if present; **extend** rather than fork. Export everything new from the module's index.
- **Mock fixtures** — port `data2.jsx` values into the existing fixture module structure (`src/mocks/fixtures/`). Do not hardcode fixtures inside page components. Each fixture file exports a default object + a discriminated union of state keys for the dev `state` param.
- **Translations** — append to the existing locale JSONs. Match the existing namespace conventions (likely `home.*`, `floor.*`, `nodeDetail.*`, `common.*`); add `battleResult.*`, `garrison.*` namespaces. Run an "all keys present in all locales" check in the i18n smoke test.
- **Tests** — follow the existing Vitest + React Testing Library style. Co-locate `*.test.tsx` files next to the page/component. CI commands stay `npm run lint && npm run build && npm test`.

---

## 7. Component migration guidance — Phase A atoms

Port these atoms first. All become first-class components under `src/components/<Name>/`, each with `index.ts`, `<Name>.tsx`, `<Name>.module.css`, and a `<Name>.test.tsx` smoke test. **No `window.TowerUI`** mutation pattern in production source.

| Component | From | Phase A? | Reusable? | Notes |
|---|---|---|---|---|
| `PushHeader` | `components2.jsx` | Yes | Yes — every pushed route uses it | Back chevron is a 32px hit target wrapped in a 44px tappable area. Optional `right` slot. Title via `children` or `titleKey` prop. |
| `Panel` | `components2.jsx` | Yes | Yes | Inset card. Padding tokens come from `tokens.space.*`. Border + subtle inner shadow. |
| `MiniHead` | `components2.jsx` | Yes | Yes | Uppercase section label, letter-spaced. Pair with `Panel` or used standalone above a list. |
| `ProgressBar` | `components2.jsx` | Yes | Yes | Props: `value` (0–100), `variant?: "default" \| "urgent" \| "full"`. `urgent` = crimson; `full` = gold with sheen animation (respect `prefers-reduced-motion: reduce` — skip the sheen). |
| `EmptyState` | `components2.jsx` | Yes | Yes — Garrison empty defense log, empty rewards | Glyph + title + body + optional action button. Glyph is a stroke SVG matching the existing v1 icon style. |
| `GearCard` | `components2.jsx` | Yes — used by Battle Result drop | Yes — Phase C Equipment reuses | Props: `gear`, `footer?`, `delta?` (CP delta vs equipped), `compact?`. Rarity-tinted border + glow from tokens. |
| `GearIcon` | `components2.jsx` | Yes (inside `GearCard`) | Yes | Monochrome stroke slot icon. Props: `slot: "weapon" \| "helmet" \| "armor" \| "ring" \| "necklace" \| "boots"`, `size?`. |
| `RarityDot` | `components2.jsx` | Yes (inside `GearCard`) | Yes | Small rarity-color dot used in compact gear references. |
| `CombatantAvatar` | `components2.jsx` | Yes — Battle Result versus block | Yes — Phase B reuses | Props: `kind: "me" \| "npc" \| "player"`, `nameKey?`, `name?`, `cp`, `upset?`. |
| `LeaveConfirmModal` | extracted from `garrison.jsx` | Yes | Yes | Generic confirm modal wired to global `ModalLayer`. Props: `open`, `onConfirm`, `onCancel`, `titleKey`, `bodyKey`, `confirmKey`, `cancelKey`, `destructive`. |
| `Sheet` primitive | extracted across `NodeDetailSheet` + `LeaveConfirmModal` | **Optional in Phase A** | Yes | If the refactor is non-breaking, extract it. If it bloats Phase A, defer to Phase B and note in the report. |

Defer to later phases (do **not** port in Phase A):

- `HPBar` → Phase B
- `Toggle`, `Segmented`, `ListRow` → Phase C / D
- `SLOT_ORDER` constant → Phase C (Equipment grid)
- `CompareSheet` → Phase C

**Visual constraints (all Phase A components):**

- All measurements from `tokens.space.*`; no magic numbers.
- All colors from `tokens.*`; no inline hex except inside `tokens.ts` itself.
- All fonts via existing token variables (Cinzel for display, Inter for UI). Do not introduce new font families.
- Hit targets ≥ 44px. CJK labels wrap (`text-wrap: balance`); never truncate.
- Each component exports its props interface.

---

## 8. Mock data migration guidance — Phase A

Port only what Phase A needs. Skip Equipment, Reports, Resolve fixtures.

| Fixture | Source in `data2.jsx` | Destination | Notes |
|---|---|---|---|
| `Battle.victoryNpc` | top-level | `src/mocks/fixtures/battle.ts` | Set `drop = GearDrop` for the "with drop" variant; expose both `victoryNpc` and `victoryNpcNoDrop` (the same payload with `drop: null`) as keys, so the state matrix can be exercised. |
| `Battle.victoryPlayer` | top-level | `src/mocks/fixtures/battle.ts` | Keep `upset: true`. `enemyName` is a raw string, **not** an i18n key. |
| `Battle.defeat` | top-level | `src/mocks/fixtures/battle.ts` | `rewards: []`. `canOccupy: false`. |
| `GearDrop` | top-level | `src/mocks/fixtures/gear.ts` (`gearDrop`) | Only the drop. Skip `Equipped` and `Backpack` until Phase C. |
| `Garrison.normal` | top-level | `src/mocks/fixtures/garrison.ts` | |
| `Garrison.capNear` | top-level | same | preserves `capUrgent: true` |
| `Garrison.capFull` | top-level | same | preserves `capFull: true` |
| `Garrison.empty` | top-level | same | `rewards: []`, `log: []` — exercises both empty states |
| `Garrison.lost` | top-level | same | preserves `lost: true`, `lostTo: "Talen"` |

Fixture files export typed objects, a `union of keys` type, and a default `getBattleResultFixture(key)` / `getGarrisonFixture(key)` accessor. **Page components must not import fixtures directly** — they go through the mock service.

Reward strings keep the existing `"type:amount"` convention (`"gold:240"`, `"fragments:3"`, `"stones:4"`, `"gear:epic"`). Time strings use the `"i18nKey:arg"` convention (`"time.minAgo:4"`).

---

## 9. i18n migration guidance — Phase A

Port only the keys these two screens use. Do **not** dump the entire `DICTS.en` / `DICTS.zh` from `i18n2.jsx` — leave Equipment/Reports/Resolve/Settings keys for their respective phases.

**Namespaces to add:**

- `battleResult` (new namespace) — title, banners, CTAs (`occupy`, `return`, `equip`, `tryAgain`), section labels (`rewardsLabel`, `summaryLabel`, `cpLabel`), stat labels (`rounds`, `dmgDealt`, `dmgTaken`, `hpLeft`), upset / no-rewards messaging, "Node unlocked" banner, vs separator.
- `garrison` (new namespace) — title, header copy (`occupied`, duration), rewards panel labels, cap labels (`capIn`, `capFull`, `capNear`), defense panel labels (`defenseLog`, `defenseEmpty`), CTAs (`claim`, `leave`, `return`), lost banner (`lostTo` with `{opponent}` interpolation), and the leave confirmation strings (`confirmTitle`, `confirmBody`, `confirmConfirm`, `confirmCancel`).
- `gear.lichcleaver` (single key under existing `gear` namespace) — referenced by `GearDrop`.
- `time.minAgo`, `time.hourAgo` if not already present from v1 — confirm before adding.
- Any `common.*` keys touched (`common.back`).

**Both locales required.** Each key must exist in both `en` and `zh-CN`. The Settings switch is Phase D; for Phase A the active locale comes from whatever the existing i18n init resolves to. A Vitest smoke test must assert that every Phase A key is present in both locales.

**Formatting rules:**

- No hardcoded visible strings in components. Every visible label goes through `useTranslation()`.
- CJK buttons wrap, never truncate (`text-wrap: balance`, `min-height: 44px`). Test renders Chinese strings without overflow.
- Numbers stay LTR tabular (`.tw-num`).
- Variable interpolation uses `{varName}`. The zh-CN garrison claim string uses full-width parens `（{amount}）` intentionally — preserve verbatim.
- No `split(" ")` name tricks (breaks CJK).

---

## 10. Route and navigation integration

Routes to add (both pushed):

```
/battle/result?battleId=<key>
/garrison?nodeId=<id>[&state=<key>]   # `state` is DEV-only
```

Bottom tabs remain exactly **Home · Floor · Gear (Equipment) · Reports**. **No fifth tab.** Garrison and Settings are pushed routes only.

Navigation wiring required in Phase A:

- **Home → Garrison.** When `playerStore.state === "garrisoning"`, the existing v1 Home garrison card's tap target navigates to `/garrison?nodeId=<id>`.
- **StateBanner → Garrison.** The global `StateBanner` (when surfacing the garrisoning state) deep-links to `/garrison?nodeId=<id>` on tap.
- **Node Detail → Garrison.** When the user taps an occupied-by-you node, Node Detail's primary CTA pushes `/garrison?nodeId=<id>`.
- **Battle Result → Floor.** `Return to Floor` pops via `navigate("/floor/" + floor)` (not browser-back; preserves Floor scroll state).
- **Battle Result → Garrison.** `Occupy` calls `occupyNode` then `navigate("/garrison?nodeId=" + nodeId, { replace: true })` (replace so back-from-Garrison goes to Floor, not Result).
- **Garrison → Floor.** `Confirm Leave` and `Return` (lost state) both `navigate("/floor/" + floor)`.
- **Node Detail Challenge → Battle Result.** As a Phase A stand-in (until Phase B wires `/battle/resolve`), the existing Challenge CTA navigates to `/battle/result?battleId=victoryNpc`. Mark this call site with a `// TODO(phase-b): route through /battle/resolve` comment.

Do **not** modify the existing `TabBar` layout, ordering, or count.

---

## 11. Tests and validation — Phase A

Add the following Vitest specs alongside production code. Follow the existing test style and reuse the existing `render` helper if present.

**Smoke tests (one per page):**

- `BattleResultPage.test.tsx`:
  - Renders `victoryNpc` with `drop` → asserts `Equip` is the primary CTA and CP-delta is shown.
  - Renders `victoryNpc` without `drop` → asserts `Occupy` is primary and no drop card is mounted.
  - Renders `victoryPlayer` → asserts opponent's raw name is shown (not run through `t()`), upset highlight present.
  - Renders `defeat` → asserts crimson defeat banner, no rewards row, `Try Again` primary, `Occupy` not present.
- `GarrisonPage.test.tsx`:
  - Renders `normal` → `Claim` enabled, progress bar at 62%, defense log has three entries.
  - Renders `capNear` → progress bar has `urgent` variant.
  - Renders `capFull` → progress bar has `full` variant.
  - Renders `empty` → `Claim` is disabled (`aria-disabled="true"`), defense log shows `EmptyState`.
  - Renders `lost` → crimson lost-banner present, only `Return` CTA in footer (no `Leave`).

**Interaction tests:**

- `LeaveConfirmModal.test.tsx` — tapping `Leave` opens the modal; `Cancel` closes it with no service call; `Confirm` calls `leaveGarrison` and navigates to `/floor/<floor>`.
- `BattleResult.actions.test.tsx` — `Occupy` calls `occupyNode` then navigates to `/garrison`; `Return` navigates to `/floor/<floor>`; `Equip` (when drop present) calls `equipGear`.
- `Claim` button disabled/enabled — Garrison `Claim` button is disabled when `rewards.length === 0` and enabled otherwise.

**i18n tests:**

- `i18n.battleResult.test.ts` — every Phase A `battleResult.*` and `garrison.*` key exists in both `en` and `zh-CN`. Snapshot the rendered CTAs in both locales to catch overflow regressions.

**Commands** (must all pass before reporting DONE):

```
npm install
npm run lint
npm run build
npm test
```

If `npm run typecheck` exists as a separate script, run it too.

---

## 12. Acceptance criteria — Phase A

All of the following must be true before reporting **DONE**:

- `npm run build`, `npm run lint`, and `npm test` all pass with exit code 0.
- No console errors or warnings on Battle Result or Garrison in any of their states.
- No hardcoded user-facing strings in `BattleResultPage`, `GarrisonPage`, or the new Phase A atoms — every visible label routes through `useTranslation()`.
- No imports anywhere in `src/` from `design-reference/`. Grep confirms this.
- The five Battle Result states (NPC w/ drop, NPC no drop, player upset, defeat, occupiable) all render correctly when their fixture is selected via `battleId`.
- The six Garrison states (normal, capNear, capFull, empty, lost, leave-modal-open) all render correctly when their fixture is selected via the dev `state` param.
- Existing Home / Floor / Node Detail still pass their existing tests and render identically (visual diff is zero).
- The mock service layer remains swappable: setting `VITE_USE_MOCKS=false` does not import any mock fixture (verified by build-time tree-shaking or explicit conditional import).
- Both `en` and `zh-CN` contain every Phase A key; the i18n parity test passes.
- The four-tab `TabBar` is unchanged. Garrison is reachable only as a pushed route. Battle Result is reachable only as a pushed route.
- All Phase A CTAs have `min-height: 44px` and wrap rather than truncate on CJK strings.

---

## 13. Final report format

After finishing Phase A, emit exactly this report. Do not start Phase B.

```
## Phase A — Battle Result + Garrison — <DONE | BLOCKED>

### Implemented
- <bullet list of pages, components, mock methods, i18n namespaces, tests added>

### Changed files
- path/to/file — what changed and why

### Added files
- path/to/file — purpose

### Mock/service changes
- mockService.<method> — signature + behavior
- fixtures added — file + state keys

### i18n changes
- new namespaces — battleResult, garrison
- locales touched — en, zh-CN
- count of keys added per locale

### Tests
- new test files + what they cover
- existing tests run — pass/fail counts

### Commands run
- npm install        → pass/fail
- npm run lint       → pass/fail (key output if fail)
- npm run typecheck  → pass/fail (if applicable)
- npm run build      → pass/fail
- npm test           → pass/fail (X passed, Y failed)

### Assumptions made
- <every decision you made that wasn't explicitly specified>

### Risks / open questions
- <anything ambiguous, anything you noticed but didn't fix, anything that may block Phase B>

### Recommended next step
- Phase B (Battle Resolving / Replay) — or surface a blocker if Phase A revealed one
```

Stop after this report. Do **not** start Phase B.

---

## 14. Ready-to-paste Codex prompt

Paste this verbatim into Codex CLI to start the first implementation run:

> You are extending the existing Tower PvP React + TypeScript frontend with the v2 MVP screens. Do not scaffold a new project. Do not redesign the v1 screens.
>
> 1. Read `Tower PvP Frontend Development Handoff.md` (base handoff), `Codex Implementation Task.md` (v1 task that already shipped), `Tower PvP MVP Screens Codex Implementation Task.md` (this task), and `Tower PvP MVP Screens Handoff.md` (v2 design handoff). Treat this task file as the source of truth for what to do; treat the v2 design handoff as the source of truth for what the screens look like.
> 2. Inspect the **real project source** under `src/` first. Confirm the routing layout, i18n setup, mock service shape, Zustand stores, TanStack Query usage, design tokens, and test style. Do not assume — verify.
> 3. Inspect the v2 design reference under `design-reference/v2-mvp-screens/`. Read `Tower PvP MVP Screens Handoff.md`, then read `src/components2.jsx`, `src/data2.jsx`, `src/i18n2.jsx`, `src/battleresult.jsx`, and `src/garrison.jsx`. **Treat these as design reference only.** Do not import any file under `design-reference/` from production source. Do not run them through Vite, ESLint, or Vitest.
> 4. Implement **Phase A only** as specified in §3 and §4 of `Tower PvP MVP Screens Codex Implementation Task.md`: Battle Result page, Garrison page, the Phase A atoms (`PushHeader`, `Panel`, `MiniHead`, `ProgressBar`, `EmptyState`, `GearCard`, `GearIcon`, `RarityDot`, `CombatantAvatar`, `LeaveConfirmModal`), Phase A mock fixtures (`Battle.*`, `Garrison.*`, `GearDrop`), Phase A i18n keys in both `en` and `zh-CN`, Phase A routes (`/battle/result`, `/garrison`), Phase A navigation wiring from Home/StateBanner/Node Detail, and Phase A tests.
> 5. Honor every non-goal in §5. Specifically: do **not** start Phases B / C / D, do **not** add a fifth tab, do **not** modify v1 screens beyond adding the navigation links specified in §10, do **not** import from `design-reference/`.
> 6. Run `npm install`, `npm run lint`, `npm run build`, and `npm test` (and `npm run typecheck` if present) until they all pass.
> 7. Report using the **exact** format in §13 of the task file. Stop after the report. Do not start Phase B.
>
> If anything in the v1 production code blocks Phase A and the task file does not resolve the ambiguity, stop and report **BLOCKED** with the specific question.
