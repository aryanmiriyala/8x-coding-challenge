# ADR-003: Use typed use cases and a minimal HTTP surface

Status: accepted
Date: 2026-09-29
Decision needed by: Slice 0/1 scaffold

## Context and problem

The Next.js application needs explicit, testable boundaries for catalog, cart, authentication, checkout, and orders. Building a general REST or GraphQL API for the same web UI would duplicate transport schemas, authorization, and data fetching without an active external consumer.

## Decision drivers

- Keep one lightweight application.
- Make authorization and commerce rules independently testable.
- Preserve progressive-enhancement and server-rendering benefits.
- Keep genuine external HTTP boundaries explicit and secure.
- Avoid an API platform that no P0 user requires.

## Options considered

### General REST API for all reads and writes

Clear HTTP contracts and future client reuse, but duplicates an internal network layer and DTO plumbing for the only current client.

### GraphQL API

Flexible client queries, but introduces schema/runtime/security complexity with no active need.

### Typed server use cases plus narrow adapters

Server Components call queries directly; Server Actions translate same-origin mutations; Route Handlers serve auth, webhook, health, cron, and other real HTTP boundaries.

## Decision outcome

Use typed server-only query/use-case functions as the application contract. Keep Server Actions and Route Handlers thin, untrusted adapters that authenticate, authorize, validate, call a use case, and return minimal DTOs. Do not create `/api/v1`, GraphQL, or a duplicated REST layer during P0.

The exact operations, errors, idempotency behavior, and HTTP routes are defined in `docs/api-contracts.md`.

## Consequences

- Business rules remain independent of React, Next.js transport objects, and provider SDKs.
- Server Actions receive the same security treatment as public endpoints.
- Tests exercise use cases directly and add HTTP/browser coverage only where transport behavior matters.
- A future external/mobile client requires a new versioned HTTP API decision rather than exposing internal actions accidentally.

## Validation and revisit triggers

- Revisit if a real mobile app, seller integration, public API consumer, or independently deployed frontend enters active scope.
- Revisit if framework constraints make typed actions materially less reliable than a small explicit HTTP API.
- Do not revisit solely for hypothetical reuse.

## Links

- `docs/api-contracts.md`
- `architecture.md`
- [Next.js Server Actions security guidance](https://nextjs.org/docs/app/guides/authentication#server-actions)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
