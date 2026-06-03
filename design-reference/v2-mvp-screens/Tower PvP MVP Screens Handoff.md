# Tower PvP — MVP Screens Handoff Addendum (Codex)

> Companion to `Tower PvP Frontend Development Handoff.md`. Covers the **six new MVP screens** that were previously spec-only and are now fully designed in `Tower PvP MVP Screens.html`.
> The approved Home / Floor / Node Detail screens are **unchanged** — they are re-shown in the canvas only as reference.
> Same rules as the base handoff: code wins for "what's built", spec wins for "what to build next". Preserve the visual design verbatim.

---

## 1. What was added

| New file | What it does | Attaches to | Depends on |
|---|---|---|---|
| `src/components2.jsx` | New shared atoms, extends the existing `window.TowerUI` in place: `PushHeader`, `Panel`, `MiniHead`, `ProgressBar`, `HPBar`, `Toggle`, `Segmented`, `ListRow`, `EmptyState`, `GearIcon`, `GearCard`, `RarityDot`, `CombatantAvatar`, `SLOT_ORDER`. | `window.TowerUI.*` | `components.jsx` (tokens, Btn, RewardChip, badges) |
| `src/data2.jsx` | Mock fixtures: `Equipped`, `Backpack`, `GearDrop`, `Reports`, `Battle` (victoryNpc / victoryPlayer / defeat), `ResolveLog`, `Garrison` (normal / capNear / capFull / empty / lost). Extends `window.TowerData`. | `window.TowerData.*` | `data.jsx` |
| `src/i18n2.jsx` | New EN keys for all six screens **and a full `zh` (Simplified Chinese) dictionary**. Mutates `window.TowerI18n.DICTS` in place. | `DICTS.en`, `DICTS.zh` | `i18n.jsx` |
| `src/battleresult.jsx` | `<BattleResultScreen data locale onBack>` | `window.BattleResultScreen` | components, components2 |
| `src/battleresolve.jsx` | `<BattleResolveScreen data log phase visibleLines myHp enemyHp locale onBack>` | `window.BattleResolveScreen` | components, components2 |
| `src/garrison.jsx` | `<GarrisonScreen data locale onBack startModalOpen>` + internal `LeaveModal` | `window.GarrisonScreen` | components, components2 |
| `src/equipment.jsx` | `<EquipmentScreen empty locale onSettings>` + internal `CompareSheet` | `window.EquipmentScreen` | components, components2 |
| `src/reports.jsx` | `<ReportsScreen empty locale>` | `window.ReportsScreen` | components, components2 |
| `src/settings.jsx` | `<SettingsScreen initialLocale onBack>` — **live language switch** | `window.SettingsScreen` | components, components2 |
| `src/canvas-app2.jsx` | Review canvas for all screens (new + approved reference). | mounts `#root` | all of the above |
| `Tower PvP MVP Screens.html` | Entry point; loads scripts in dependency order. | — | — |

**Load order matters** (in-browser Babel, `window.*` globals): `i18n → i18n2 → data → data2 → components → components2 → screens → canvas-app2`.

---

## 2. Page inventory, routes, navigation

| Page | Suggested route | Nav surface | Tier |
|---|---|---|---|
| Battle Result | `/battle/result` (pushed; param `battleId`) | Pushed after resolve; not a tab | **P0** |
| Garrison | `/garrison` (pushed; param `nodeId`) | From Home garrison card / StateBanner / occupied node in Node Detail. **Not a tab.** | **P0** |
| Battle Resolving / Replay | `/battle/resolve` (pushed; param `battleId`) | Pushed after tapping Challenge → auto-advances to `/battle/result` | P1 |
| Equipment | `/equipment` | **Bottom tab** (`Gear`) | P1 |
| Reports | `/reports` | **Bottom tab** (`Reports`) | P1 |
| Settings | `/settings` (pushed) | From Equipment header gear icon / profile. Not a tab. | P1 |

Bottom tabs stay exactly four: **Home · Floor · Gear · Reports**. No fifth tab. The full Challenge flow is: `Node Detail → /battle/resolve → /battle/result → (Occupy ⇒ /garrison) or (Return ⇒ /floor)`.

---

## 3. New components (inventory)

All extend `window.TowerUI`; in the real app fold them into `components/` + `tokens.ts`.

- **`PushHeader`** — back-chevron + title + optional right slot. Used by all pushed screens (Result, Garrison, Settings). 32px hit-target back button.
- **`GearCard` / `GearIcon` / `RarityDot`** — gear item card with rarity-tinted border/glow, monochrome stroke slot icon, stat list, `+CP`, optional `New` badge and `footer` slot. Rarity colors come from `tokens.rarity.{common|rare|epic|legendary}`.
- **`CombatantAvatar`** — versus avatar (`kind: me | npc | player`) with CP. Used by Result & Resolve.
- **`HPBar`** — combat HP bar (`side: me | enemy`), animates width.
- **`ProgressBar`** — reward-cap bar; `urgent` (crimson) / `full` (gold + sheen) variants.
- **`Toggle`** — switch. **`Segmented`** — segmented control (battle speed, report filters, language); options take either `labelKey`+`locale` or a literal `label`.
- **`ListRow`** — generic settings/report row (icon tile, title, subtitle, right slot, `unread`, `danger`).
- **`EmptyState`** — glyph + title + body + optional action. Used by empty Backpack, empty Reports, empty Defense log.
- **`Panel` / `MiniHead`** — recurring inset panel + uppercase section label.

---

## 4. Required data (per page)

> Reward strings keep the existing `"type:amount"` convention (e.g. `"gold:240"`, `"gear:epic"`). Time strings are `"i18nKey:arg"` (e.g. `"time.minAgo:4"`). Names that are content use i18n keys (`nodeKey`, `nameKey`); player-supplied names (opponents) are raw strings.

**Battle Result** — `{ outcome: 'victory'|'defeat', opponentKind: 'npc'|'player', enemyNameKey|enemyName, myCP, enemyCP, nodeNameKey, nodeType, floor, stats:{ rounds, dmgDealt, dmgTaken, hpLeft }, rewards:[], drop: Gear|null, nodeUnlocked, canOccupy, upset? }`.

**Battle Resolve** — same battle payload + `log: [{ side:'me'|'enemy', key, vars }]`. Presentation only; server returns the resolved outcome + log. `phase`, `myHp`, `enemyHp`, `visibleLines` drive the theatrical step (client-side animation in production).

**Garrison** — `{ floor, nodeNameKey, nodeType, durationMin, rewards:[], capPct, capInLabel, capHours, capUrgent?, capFull?, defenses:{ wins, losses }, log:[{ result:'win'|'loss', opponent, time, fresh? }], lost?, lostTo? }`.

**Equipment** — `Equipped: { [slot]: Gear }` over the six slots `weapon, helmet, armor, ring, necklace, boots`; `Backpack: Gear[]`. `Gear = { id, slot, nameKey, rarity, cp, level, stats:[{k,v}], isNew? }`. Total CP = `Player.cp`.

**Reports** — `Report[] = { id, type:'attackWin'|'attackLoss'|'defenseWin'|'nodeLost', opponent, nodeKey, rewards:[], time, unread? }`.

**Settings** — local UI prefs only: `{ locale:'en'|'zh', sfx, music, notifications, battleSpeed:'normal'|'fast'|'instant' }` + read-only `playerId`, `version`. Persist to the store; `locale` drives `react-i18next`.

Mock data for all of the above already exists in `src/data2.jsx`.

---

## 5. Interactions & states (coverage shown in canvas)

- **Battle Result** — Victory vs NPC (gear drop), Victory vs NPC (no drop), Victory vs player (upset, lower CP), Defeat. Node-unlocked banner, rewards / no-rewards, gear-drop card with CP-delta vs equipped. Actions branch: win+betterDrop ⇒ `Equip` primary + `Occupy` + `Return`; win ⇒ `Occupy` + `Return`; defeat ⇒ `Try Again` + `Return`.
- **Battle Resolve** — `resolving` (skip button + speed segmented + spinner) and `complete` (enemy HP 0 → `View Result`).
- **Garrison** — accruing, cap nearly full (urgent), cap full (claim-to-keep-earning), no rewards yet (+ empty defense log), node lost (crimson banner, claim still available, footer ⇒ Return), and the **Leave confirmation** modal (warns the character is freed + node reverts to NPC; unclaimed rewards lost). `Claim` disabled when nothing to claim.
- **Equipment** — equipped 2-col slot grid, Auto-Equip Best, backpack list with `▲ +CP` better-than-equipped flags, tap a backpack item ⇒ **CompareSheet** (stat-by-stat delta table + CP delta + Equip), empty-backpack state.
- **Reports** — list with All / Attacks / Defenses filter, unread red-dots + count + Mark-all-read, per-row reward chips + relative time + `View`, empty state.
- **Settings** — **live EN / 简体中文 switch** re-renders the whole screen; audio toggles, battle-speed segmented, account rows, version.

**Loading / error (to add in product):** Resolve screen *is* the loading state for a battle; show a skeleton on Equipment/Reports/Garrison while fetching; on fetch error show an inline retry using `EmptyState` with a retry action. Claim/Leave/Equip should optimistically update then reconcile.

---

## 6. i18n notes

- Every visible string routes through `t(key, vars, locale)`. New keys live in `i18n2.jsx`; a complete **`zh` dictionary** is included, so the Settings switch is real (it passes `locale` into every `t()` on the screen). Port the whole key set verbatim into `react-i18next` JSON.
- The base handoff flags that nothing currently passes `locale` into `t()`. The new screens **all thread a `locale` prop** as the migration pattern — in production this becomes `useTranslation()` and the prop disappears.
- CJK width: buttons use `min-height: 44px` and wrap (`text-wrap: balance`), never truncate. Chinese labels are shorter, so EN is the tight case — keep CTAs single-purpose. Avoid the `split(" ").slice(-1)` name trick from `floor.jsx` (breaks for CJK).
- Numbers stay LTR tabular (`.tw-num`); reward/CP formatting is locale-agnostic.
- Currency/“(amount)” strings interpolate with `{amount}` — the zh garrison claim key uses full-width parens `（{amount}）` intentionally.

---

## 7. Add to the design system

Promote these from prototype atoms to first-class library components: `GearCard` (+ `GearIcon`, rarity tokens already exist), `CompareSheet` (bottom-sheet pattern, share scrim/grabber with `NodeDetailSheet`), `Toggle`, `Segmented`, `ProgressBar`, `HPBar`, `PushHeader`, `ListRow`, `EmptyState`. The bottom-sheet scrim/grabber/footer is now used by three places (Node Detail, Leave modal, Compare) — extract a single `Sheet` primitive.
