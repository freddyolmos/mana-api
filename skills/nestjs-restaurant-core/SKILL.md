---
name: nestjs-restaurant-core
description: Build and evolve a NestJS Restaurant API (Prisma + Postgres) with strict server-side business rules, state machines, totals computation, and thin controllers.
metadata:
  short-description: NestJS restaurant core rules and workflow
---

# NestJS Restaurant Core (Mana Restaurante)

Use this skill when implementing or modifying the Restaurant API in NestJS with Prisma + Postgres.

## Workflow (default)

1) Inspect existing module/service/DTO structure and Prisma schema.
2) Update DTOs, controller, and service (controllers stay thin).
3) Enforce business rules and state transitions in the service/domain layer.
4) Compute totals on the backend only; never trust client totals.
5) Use Prisma explicit selects to avoid leaks; use transactions for multi-step flows.
6) Add or update Swagger decorators on DTOs and controllers.
7) If schema changes are required, add a migration (no implicit tables).

## Non-negotiables

- Totals (subtotal/discounts/tax/total) are computed server-side only.
- Controllers do not implement business logic; services/domain enforce rules.
- Status transitions are validated in service/domain layer.
- All protected routes use JwtAuthGuard; privileged routes require RolesGuard.

## References

- Domain rules, endpoints, state machines, RBAC, and error mapping: `references/domain.md`

## Context7 usage

Use Context7 when you need up-to-date NestJS patterns for guards, interceptors, pipes, exception filters, Swagger decorators, or WebSockets gateway usage. If docs conflict with domain rules, follow the domain rules unless it breaks correctness.
