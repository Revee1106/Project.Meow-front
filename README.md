# Tower PvP / Project.Meow

Version: `0.0.1`

Repository:

```bash
origin https://github.com/Revee1106/Project.Meow-front.git
```

## Overview

Tower PvP is a mobile-first React + TypeScript + Vite frontend with an in-memory Express backend for the MVP tower PvP gameplay loop.

The backend currently runs inside `server/` and is intended for local development and frontend integration. It does not use a database or auth yet.

## Version 0.0.1 Commit Contents

- Added Express + TypeScript backend scaffold under `server/`.
- Added unified backend error response shape:
  `{ ok:false, code, message, details?, requestId }`.
- Added CORS and request id middleware.
- Added Vite dev proxy for `/api` to `http://localhost:3001`.
- Added in-memory state for player, floors, nodes, battles, garrisons, equipment, reports, settings, and idempotency.
- Implemented read APIs:
  - `GET /api/health`
  - `GET /api/bootstrap`
  - `GET /api/player/profile`
  - `GET /api/floors/:floorId`
  - `GET /api/nodes/:nodeId`
- Implemented battle and garrison APIs:
  - `POST /api/tower/challenge`
  - `GET /api/battles/:battleId`
  - `GET /api/battles/:battleId/result`
  - `POST /api/strongholds/occupy`
  - `GET /api/garrison/current`
  - `POST /api/garrison/claim`
  - `POST /api/garrison/leave`
- Implemented equipment, reports, and settings APIs:
  - `GET /api/equipment`
  - `POST /api/equipment/equip`
  - `POST /api/equipment/auto-equip`
  - `GET /api/reports`
  - `POST /api/reports/:reportId/read`
  - `POST /api/reports/read-all`
  - `GET /api/settings`
  - `PATCH /api/settings`
- Updated frontend HTTP service mappings for `VITE_USE_MOCKS=false`.
- Updated Node Detail challenge flow to call the backend challenge API instead of using a fixed mock battle id.
- Added backend API tests covering read APIs, battle/garrison loop, equipment, reports, settings, and error codes.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- i18next / react-i18next
- Express
- Vitest
- Playwright
- ESLint / Prettier

## Development Commands

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
npm --prefix server install
```

Run frontend with mocks:

```bash
npm run dev
```

Run backend:

```bash
npm run api:dev
```

Run frontend against backend:

```powershell
$env:VITE_USE_MOCKS="false"; npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Backend URL:

```text
http://localhost:3001
```

## Validation Commands

```bash
npm run lint
npm run test
npm run build
npm run api:lint
npm run api:test
npm run api:build
```

## Environment Variables

```bash
VITE_USE_MOCKS=true
```

Uses frontend mock services.

```bash
VITE_USE_MOCKS=false
```

Uses real HTTP APIs through the Vite `/api` proxy.

## Project Structure

```text
server/
  src/
    app.ts
    data.ts
    errors.ts
    index.ts
    types.ts
src/
  components/
  layouts/
  pages/
  services/
  mocks/
  stores/
  locales/
  styles/
```

## Current Limitations

- Backend data is in-memory only and resets when the server restarts.
- Auth/session support is not implemented.
- Database persistence is not implemented.
- Settings UI still primarily uses localStorage, while backend settings APIs are available for future integration.
