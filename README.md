# Tower PvP Frontend / Project.Meow-front

Version: `0.1.0`

Frontend repository:

```bash
https://github.com/Revee1106/Project.Meow-front.git
```

Backend repository:

```bash
https://github.com/Revee1106/Project.Meow.git
```

## Overview

This repository contains the Tower PvP frontend built with React, TypeScript, and Vite. It includes the mobile-first MVP screens, mock data mode, and HTTP service integration points for the separate backend repository.

Backend code does not live in this repository. Run the backend from `Project.Meow` when testing with `VITE_USE_MOCKS=false`.

## Current Frontend Scope

- Home
- Floor
- Node Detail Sheet
- Battle Resolve
- Battle Result
- Garrison
- Equipment
- Reports
- Settings

## Frontend Integration Status

- `VITE_USE_MOCKS=true` keeps using local mock services.
- `VITE_USE_MOCKS=false` switches service calls to HTTP `/api/...`.
- Vite proxies `/api` to `http://localhost:3001` for local backend integration.
- Node Detail challenge now calls `challengeNode(node.id)` and navigates with the backend battle id.
- HTTP service mappings are present for read APIs, battle/garrison APIs, equipment, reports, and settings.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- i18next / react-i18next
- Vitest
- Playwright
- ESLint / Prettier

## Development

Install dependencies:

```bash
npm install
```

Run frontend with mocks:

```bash
npm run dev
```

Run frontend against the backend:

```powershell
$env:VITE_USE_MOCKS="false"; npm run dev
```

Frontend dev URL:

```text
http://localhost:5173
```

Expected backend URL:

```text
http://localhost:3001
```

## Commands

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

## Environment Variables

```bash
VITE_USE_MOCKS=true
```

Use frontend mock services.

```bash
VITE_USE_MOCKS=false
```

Use HTTP API through the local Vite proxy.

## Project Structure

```text
src/
  components/
  layouts/
  pages/
  services/
  mocks/
  stores/
  locales/
  styles/
tests/
  e2e/
design-reference/
```

## Notes

- This frontend repository should not contain backend implementation files.
- The API contract document is kept for reference, but backend implementation belongs in `Project.Meow`.
- Settings UI currently still uses localStorage; backend settings APIs are available in the backend repository for later integration.
