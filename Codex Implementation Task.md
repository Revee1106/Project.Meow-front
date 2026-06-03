# Codex Implementation Task

You are implementing the Tower PvP frontend. This is your task file. Read it fully, then read `Tower PvP Frontend Development Handoff.md` (the detailed plan) before writing code. Work top-to-bottom. Do not redesign anything.

---

## 1. Current project status

- This repo is a **design prototype**, not a real app. It renders **3 screens** (Home, Floor, Node Detail Sheet) across all their states.
- It runs as **React 18.3.1 UMD + Babel Standalone transpiled in the browser**. No build, no bundler, no TypeScript, no tests, no `package.json`.
- Files communicate through `window.*` globals (`TowerUI`, `TowerI18n`, `TowerData`, `HomeScreen`, `FloorScreen`, `NodeDetailSheet`).
- Screens are arranged on a pan/zoom review canvas (`design-canvas.jsx`) and faked with a `variant` string prop instead of real state.
- i18n is wired (`t("key")` everywhere) but **only `en` exists** and there is **no way to switch locale**. A few literal strings leak past it.
- Equipment, Garrison page, Reports, Battle, Battle Result, and Settings are **described in the spec but not built**.

## 2. Important existing files

| File | Role |
|---|---|
| `Tower PvP Frontend Development Handoff.md` | **Authoritative plan.** Read first. |
| `Tower PvP UI Design Spec.md` / `Tower PvP Hi-Fi Spec Addendum.md` | Design intent. Reference, not gospel for "what's built." |
| `Tower PvP Hi-Fi Mockups.html` | Entry point; loads scripts in dependency order. |
| `design-canvas.jsx` | Review-canvas scaffolding. **Delete in the real app.** |
| `src/i18n.jsx` | `DICTS.en`, `t()`, `interpolate()`, `<LocaleText>`. Port the key set verbatim. |
| `src/data.jsx` | All mock data: `Player`, `Floor2*` variants, `RecentActivity`, `patchFloor()`. |
| `src/components.jsx` | The design system: `tokens` + ~14 shared components. **The keeper.** |
| `src/home.jsx` | `HomeScreen` + Home atoms. |
| `src/floor.jsx` | `FloorScreen` + node cards + floor switcher. |
| `src/nodedetail.jsx` | `NodeDetailSheet` (5 variants). |
| `src/canvas-app.jsx` | Wires screens into the canvas + mounts React. **Replace with the router.** |

## 3. Exact development goal

Convert this in-browser-Babel prototype into a **real, typed, build-tooled React app** with routing, a thin mock-data service layer, and finished i18n — **while preserving the visual design pixel-for-pixel**. Port and restructure the existing code; do not reinvent it.

Definition of done for this task: Home, Floor, and Node Detail run as real routed pages backed by mock data through a service layer, with zero hardcoded display strings, a working `en`↔`zh-CN` language switch, and a green `lint`/`build`/`test`.

## 4. Non-goals

- **Do not restyle.** `tokens`, layout, spacing, fonts (Cinzel/Inter), and the dark-fantasy look are correct and final.
- Do not build a backend or real API.
- Do not build Battle / Battle Result / Equipment / Garrison page / Reports / Settings yet (later feature work).
- Do not add: real-time PvP, world map, guild/chat/friends, marketplace, revenge auto-challenge, leaderboards, gem sockets/set bonuses, 3D/particles.
- Do not add a 5th tab. Tabs are exactly Home, Floor, Equipment, Reports; Garrison is a pushed route.
- Do not perform large speculative rewrites.

## 5. Required tech assumptions

- **React + TypeScript**, built with **Vite** (or Next.js App Router if you prefer file routing — but default to Vite).
- **Zustand** for client/session stores; **TanStack Query** for server-state calls (behind the mock layer).
- **react-i18next** for i18n; reuse the existing key set; split `DICTS.en` into namespaced JSON.
- ESLint + Prettier. A test runner (Vitest).
- `tokens` becomes a `tokens.ts` module **and** CSS custom properties; replace inline-style objects with CSS Modules (or Tailwind/vanilla-extract — pick one and be consistent).
- A single env flag (e.g. `VITE_USE_MOCKS`) switches mock vs. real data in one file.

## 6. Step-by-step implementation tasks

Do these in order. Report and pause after Phase 1 builds clean.

**Phase 1 — Tooling & TypeScript scaffold**
- Scaffold Vite + React + TS; add ESLint/Prettier/Vitest.
- Create `services/types.ts` from the interfaces in handoff §6.
- Port `tokens` to `tokens.ts` + `:root` CSS variables.
- Remove `design-canvas.jsx`, `PhoneFrame`, and all `<script type="text/babel">` loading.

**Phase 2 — App shell & routing**
- Build `AppShell`: SafeArea + global `StateBanner` + `<Outlet>` + `TabBar` + a global `ModalLayer`.
- Add routes: `/` (Home), `/floor/:floorId` (Floor; Node Detail as `?node=` overlay). Stub Equipment/Reports/Garrison/Settings routes.
- Make tabs navigate; `StateBanner`/`TabBar` read from mock-seeded `playerStore`/`notifStore`.

**Phase 3 — Core pages on mock data**
- Port Home, Floor, Node Detail to real pages reading `mocks/` via the service layer.
- Replace every `variant` prop with state derived from `player.state` + node data.
- Wire `FloorPage` tap→sheet (port the `openNode` machine from `FloorPhone`).
- Implement the Home state-driven CTA matrix (handoff §3 / spec §3.2).

**Phase 4 — Component refactor**
- Split `components.jsx` into a `components/` tree; move `PageHeader`, `StatRow`, `SheetSection` there.
- Consolidate `MajorNodeCard`/`MediumNodeCard`/`SmallNodeTile` behind one `useNodePresentation(node, playerState)`.
- Centralize the node-state color palette (currently duplicated in 4 places).
- Lift all hardcoded values (handoff §15) to props/data. Add `EmptyState`, `ConfirmModal`, `Toast`.

**Phase 5 — State & API abstraction**
- Add Zustand stores + TanStack Query for the endpoints in handoff §7, behind the mock seam.
- Add loading/error/empty states to every query.
- Implement Occupy / Leave / Claim / Challenge transitions through `state: "battle"` then refetch.

**Phase 6 — i18n completion**
- Split `DICTS.en` into namespaced JSON (handoff §9); install react-i18next.
- Add `zh-CN`; add a language switch (Settings stub is fine).
- Fix the plural resolver (`newReports`/`_plural`).
- Remove all hardcoded strings; fix `SmallNodeTile`'s `T(name).split(" ")` label with a dedicated short-name key.

**Phase 7 — Responsive polish**
- Fluid column 320–480px; centered/letterboxed on tablet+; safe-area insets; swipe-down sheet; ≥44px tap targets; lazy-mount long lists.

**Phase 8 — Tests**
- Unit-test `winChanceBucket`, `interpolate`, CTA matrix, node-state→presentation map.
- Add the 3 spec i18n snapshots (de Home CTA wraps to 2 lines; ja Battle banner no truncation; zh-CN equipment alignment).
- One smoke test per page. Wire CI to run lint + build + test.

## 7. Acceptance criteria

- `npm run build`, `npm run lint`, and `npm test` all pass; no console errors on boot.
- No `<script type="text/babel">` and no `window.*` global handoffs remain.
- From Home you can navigate via tabs, open Floor, open any node's correct Detail variant, and see the **blocked sheet** when garrisoning.
- Occupying a node moves the player to Garrisoning and Home reflects it; Leave returns to Free.
- `VITE_USE_MOCKS=false` swaps to HTTP calls with **no component changes**.
- Switching `en`↔`zh-CN` updates every visible label; missing keys fall back to `en` and log in dev.
- **Zero hardcoded user-facing strings** in components (verify against handoff §15 list).
- Visual output matches the prototype — same tokens, spacing, fonts, layout.

## 8. Build / test commands

None exist yet — you create them in Phase 1. Target scripts in `package.json`:

```
npm install
npm run dev      # Vite dev server
npm run build    # production build (must pass)
npm run lint     # ESLint (must pass)
npm test         # Vitest (must pass)
```

If you choose Next.js instead of Vite, use its equivalents (`next dev` / `next build` / `next lint`) and note the change in your report.

## 9. Files Codex should avoid changing unless necessary

- `Tower PvP Frontend Development Handoff.md`, `Tower PvP UI Design Spec.md`, `Tower PvP Hi-Fi Spec Addendum.md`, and this file — **read-only references.** Do not edit specs to match your code.
- The **values** in `tokens` (colors, fonts, sizes, radii, shadows) and the existing **i18n key set** — port them verbatim; don't rename or restyle.
- Mock data semantics in `src/data.jsx` — you may retype/relocate it, but don't change the game content (node names, CP values, reward amounts).

You *will* delete `design-canvas.jsx` and `src/canvas-app.jsx` and heavily restructure the `src/*.jsx` screens — that is expected. "Avoid changing" above means don't alter design decisions, not don't touch files.

## 10. Final report format

After each phase, output:

```
## Phase <n> — <name> — <DONE | BLOCKED>

### Changed files
- path/to/file — what changed and why

### Commands run
- npm run build → pass/fail (key output)
- npm run lint  → pass/fail
- npm test      → pass/fail

### Assumptions made
- ...

### Open questions / blockers
- ...

### Next step
- <the next phase, or what you need to proceed>
```

Stop and ask before deviating from this task file or the handoff. Start with Phase 1; report back when it builds clean before continuing.
