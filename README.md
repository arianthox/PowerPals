# Agent Battery

[![CI](https://github.com/arianthox/PowerPals/actions/workflows/ci.yml/badge.svg)](https://github.com/arianthox/PowerPals/actions/workflows/ci.yml)

Cross-platform desktop app (Electron + React + TypeScript + SQLite) for tracking AI usage batteries across OpenAI/ChatGPT, Claude, and Cursor accounts.

## Architecture summary

- `apps/desktop/electron`: Electron main process, typed IPC handlers, sync engine, provider adapters, keytar credential vault integration, notifications, redacted logger.
- `apps/desktop/renderer`: React + Vite UI (`Dashboard`, `Accounts`, `Settings`) with React Query and Zustand.
- `packages/shared`: canonical types, Zod validation schemas, IPC contracts, battery math helpers.
- `packages/db`: Prisma SQLite schema + migration + shared Prisma client.
- `tests`: unit/integration/ipc/db/renderer coverage.

## Features

- Multi-account model with provider/auth metadata and sync status tracking.
- Normalized usage snapshots (`UsageSnapshot`) with confidence/source fields.
- Background sync scheduler with jitter, per-account exponential backoff, sync history (`SyncRun`).
- Manual sync trigger.
- Low-battery and persistent sync failure desktop notifications (debounced).
- Credentials only in OS vault (`keytar`), never stored in SQLite.
- Structured logging with automatic secret redaction.

## Current provider limitations

- Official usage endpoints are not wired yet for OpenAI/Claude/Cursor in this scaffold.
- Non-manual auth currently returns typed `unsupported` errors from adapters.
- Manual mode is fully supported and persisted safely.

## Prerequisites

- Node.js 20+
- npm 10+
- Build tooling for native modules (`keytar`, Prisma engine binaries)

## Install

```bash
cd agent-battery
npm install
```

## Run in development

```bash
npm run dev
```

Renderer runs at `http://localhost:5173` and Electron launches with typed preload bridge.

## Build

```bash
npm run build
```

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
```

## Database

- SQLite file path defaults to Electron `app.getPath('userData')/agent-battery.db` in runtime.
- Prisma schema: `packages/db/prisma/schema.prisma`
- Migration: `packages/db/prisma/migrations/202602180001_init/migration.sql`

## Security

Read [`SECURITY.md`](SECURITY.md) for threat model, credential handling, redaction policy, and known limitations.
