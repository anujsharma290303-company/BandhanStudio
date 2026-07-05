# Bandan Studio — Master Copilot Instructions

Internal use only.

This file is the single source of truth for all Bandan Studio agents.
Every agent must read this file before planning, coding, or testing.

## 1) Product Definition

Bandan Studio is a management suite for a photography studio: clients, quotations,
billing, equipment inventory, and team member self-service equipment checkout ("sessions").

Non-negotiable product constraints:
- No "Booking" entity. A Quotation converts directly to a Bill via one action.
- Team Sessions are fully independent of Clients/Quotations — pure shift + equipment +
  time tracking for a team member's work day.
- Payout defaults to the team member's shift rate, but admin can override per session.
- Exactly 4 fixed shift types: `half_day`, `half_day_camera`, `full_day`, `full_day_camera`.
- GST: `cgst_sgst` (intra-state) or `igst` (inter-state), selectable per quotation.
- A Client is created once and reused across many quotations/bills — never re-entered.
- Two roles only: `admin` (single shared credential, full access) and `team_member`
  (individual login, created by admin, self-service checkout only).

## 2) Core Architecture

Stack:
- Backend: Node.js, Express, TypeScript, Sequelize, PostgreSQL (Supabase)
- Frontend: React, Vite, TypeScript, TanStack Query, Zustand, Tailwind
- Deploy: Render (backend), Cloudflare Pages (frontend)

Auth:
- JWT-based, 1-day expiry, payload = `{ id, username, role }`.
- `requireAuth` middleware for any protected route; `requireAdmin` for admin-only routes.
- Role/id NEVER trusted from request body — only from the verified JWT.

## 3) Data Contracts (see docs/schema.md for full detail — do not duplicate drift)

Core entities: `User`, `Client`, `Quotation`, `Bill`, `Payment`, `InventoryItem`,
`Session`, `SessionItem`. Full field list lives in `docs/schema.md` — agents must read
it before writing any model/migration code and must NOT invent new fields without
flagging it to the human first.

## 4) TDD Standard (mandatory, no exceptions)

```
RED    → Write the test file. Run it. It must fail.
GREEN  → Write the minimum implementation to pass.
REFACTOR → Clean up. Tests still pass.
```

Commit discipline (checked, not optional):
```
✅ Correct:
git commit -m "test: add login endpoint auth-rejection case"
git commit -m "feat: implement login endpoint"

❌ Wrong:
git commit -m "feat: implement login endpoint"
git commit -m "test: add login tests"
```

Every endpoint needs minimum 3 tests: happy-path, auth-rejection (if protected),
validation-failure. Coverage target: 80% lines/functions/branches on backend.

## 5) Module Build Order

1. Auth — hand-built by the human, agents verify/extend only
2. Clients — hand-built by the human, agents verify/extend only
3. Quotations — agents take over here
4. Bills + Payments
5. Inventory
6. Team Sessions
7. Admin Dashboard
8. AI Quotation Assistant (retrieval + drafting + validation — last, needs real data)

## 6) Repository Structure Contract

```text
backend/src/
  config/       — DB connection, env
  models/       — Sequelize models, one file per entity
  controllers/  — business logic per route group
  routes/       — Express routers, thin, just wiring
  middleware/   — auth, validation, error handling
  utils/
  types/
  *.test.ts colocated with the file it tests

frontend/src/
  api/          — typed API client functions (one per module)
  components/   — reusable UI pieces
  pages/        — screen-level components (per docs/screens.md)
  stores/       — Zustand stores
  hooks/
  types/
```

Do not introduce alternate architecture unless explicitly approved.

## 7) Master Agent Orchestration

This project uses specialized agents. Treat this section as master routing logic.

### Agent roles

- `bandan-master` — orchestrates, enforces invariants, does not implement code itself.
- `bandan-planner` — produces one-module-feature implementation plans with TDD cases.
- `bandan-backend` — implements models, controllers, routes. Tests first, always.
- `bandan-frontend` — implements React pages/components against the API contract.
- `bandan-integration` — wires real frontend to real backend, removes mocks.
- `bandan-reviewer` — reviews diffs, forces refactor pass, checks schema drift.
- `bandan-security` — runs the security checklist (see docs/security/checklist.md).
- `bandan-qa` — writes/runs the full test matrix against the module SPEC.
- `bandan-devops` — keeps Render/Cloudflare config and CI in sync.
- `bandan-docs` — updates README and docs/api.md.

### Master workflow order

For any feature request:
1. Plan with `bandan-planner`.
2. Implement in `bandan-backend` and/or `bandan-frontend` — tests first, always.
3. Wire together with `bandan-integration`.
4. Review with `bandan-reviewer`.
5. Security pass with `bandan-security`.
6. Full QA pass with `bandan-qa`.
7. Sync deploy config with `bandan-devops` if new env vars/build steps were introduced.
8. Update docs with `bandan-docs`.

### Routing matrix

- Task mentions Sequelize models, migrations, controllers, Express routes, JWT, bcrypt:
  → `bandan-backend`
- Task mentions React components, pages, Zustand stores, TanStack Query, Tailwind:
  → `bandan-frontend`
- Task mentions wiring real API calls, removing mocks, end-to-end flow:
  → `bandan-integration`
- Task mentions code review, refactor, schema consistency:
  → `bandan-reviewer`
- Task mentions auth bypass, secrets, input validation, data exposure:
  → `bandan-security`
- Task mentions test coverage, test matrix, RED/GREEN verification:
  → `bandan-qa`
- Task mentions deploy config, env vars, CI:
  → `bandan-devops`
- Task mentions README, API docs:
  → `bandan-docs`
- When unclear, route to `bandan-planner` first and request a one-feature plan.

## 8) Quality Gates (Definition of Done)

A feature is done only if all checks pass:
- Correct agent scope respected (backend agent didn't touch frontend, etc.)
- Test-first workflow followed, visible in git history.
- TypeScript strict, zero explicit `any`.
- No endpoint trusts role/id from request body.
- `passwordHash` never appears in any API response.
- 80%+ test coverage on the module.
- `docs/security/<module>-review.md` and `docs/qa/<module>-results.md` exist and pass.

## 9) Delivery Style

- Be explicit about files touched.
- Explain assumptions briefly.
- Prefer small, reversible commits.
- Do not break established contracts in this file unless explicitly requested by the human.

Say "Bandan" to confirm you've read this file.
