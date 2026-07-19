# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A reusable **NestJS 11 boilerplate** (TypeScript, pnpm). It is being built out goal-by-goal
into a production-shaped starting point with four pillars: an HTTP response envelope + error
mapping, a Redis cache module, a BullMQ queue, and API key + timestamp header auth (with
Swagger). Currently it is the bare `@nestjs/schematics` scaffold plus this scaffolding effort.

The active build is tracked as a dev-workflow **goal** (the boilerplate itself) in
`.workflows/goals_nestjs-boilerplate/`, broken into numbered **tasks** — goal / brainstorm /
plans / one `task_*.md` per task. "Goal" = the whole boilerplate; "task" = a single numbered
iteration under it. Read `plans.md` there for the current roadmap and decisions before making
structural changes.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml` / `pnpm-workspace.yaml`).

```bash
pnpm install
pnpm start:dev          # watch mode
pnpm start:prod         # node dist/main (after pnpm build)
pnpm build              # nest build
pnpm lint               # eslint --fix over {src,apps,libs,test}
pnpm format             # prettier --write

pnpm test               # all unit specs (*.spec.ts under src/)
pnpm test:watch
pnpm test:cov
pnpm test:e2e           # jest --config ./test/jest-e2e.json
# single unit test:
pnpm test -- src/path/to/file.spec.ts
pnpm test -- -t "name of the test"
```

## Architecture & conventions

- **Folder layout** (target convention — create dirs as goals land):
  - `src/common/` — cross-cutting building blocks: `filters/`, `interceptors/`, `guards/`,
    `decorators/`, `dto/`, `constants/`. This is where the response envelope, exception
    filter, API-key guard, and shared decorators live. Prefer reusing these over per-module copies.
  - `src/config/` — env schema + typed config. Env is validated with **class-validator** via
    a validated config class and `ConfigModule.forRoot({ isGlobal: true, validate })`. Config
    is consumed through `ConfigService`, never `process.env` directly in feature code.
  - Feature modules live **directly under `src/`** as siblings of `app.module.ts` (the
    `nest g module <name>` convention) — e.g. `src/redis/`, `src/cache/`, `src/queue/`. Do
    not nest them under a `src/modules/` folder.
- **Global cross-cutting wiring** is done with `APP_INTERCEPTOR` / `APP_FILTER` / `APP_GUARD`
  providers in a module (not manual `app.use*` in `main.ts`), so the response envelope,
  exception filter, and API-key guard apply everywhere by default. Endpoints opt out of the
  guard with a `@Public()` decorator read via `Reflector`.
- **Redis** is a single central connection config reused by a raw `ioredis` client provider,
  `@nestjs/cache-manager`, and BullMQ. **Never provision Redis** (no docker-compose) — connect
  to an existing instance via `.env`; add placeholders to `.env.example` only.
- **Swagger** CLI plugin is enabled in `nest-cli.json` (`@nestjs/swagger` plugin), so DTO/response
  metadata is inferred from types — keep DTOs typed rather than hand-writing `@ApiProperty` everywhere.

## Standards for this repo

- **TypeScript strict mode** is the target (`tsconfig.json` is being tightened to full `strict`).
  No implicit `any`, no unused vars.
- **Env / secrets:** only `.env.example` with placeholders may be committed. Never add real secrets.
- Add a spec (`*.spec.ts`) alongside filters, guards, and interceptors — these carry the
  boilerplate's core behavior and are the primary things to regression-test.
