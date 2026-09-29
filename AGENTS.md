# Repository Instructions for Coding Agents

## Current phase

Read `docs/project-status.md` before acting. While the phase is `discovery`, do not scaffold the application, install dependencies, create a database, or implement product code unless the user explicitly advances the project into implementation.

## Required context order

For work that changes product behavior or architecture, read:

1. `intent.md`
2. the relevant part of `spec.md`
3. the relevant part of `architecture.md`
4. `docs/project-status.md`
5. the matching use case, traceability row, risk, and decision records

For API, persistence, provider, or deployment work, also read the relevant contract in `docs/api-contracts.md`, `docs/database-design.md`, `docs/service-access.md`, or `docs/deployment-strategy.md`.

Do not load every document for a narrow copy or formatting change.

## Living-spec rule

The docs guide the current slice; they are not immutable. When evidence contradicts a document:

- do not silently diverge;
- update the smallest affected artifact;
- add or supersede an ADR only when the rationale is significant or expensive to rediscover;
- update traceability and tests for changed behavior;
- preserve historical decisions through Git and ADR supersession, not commented-out text.

## Delivery style

- Work in the smallest end-to-end slice that produces observable user value.
- Prefer reversible choices until evidence demands commitment.
- Keep business rules outside route/UI files.
- Treat all client and provider data as untrusted.
- Re-check identity, resource ownership, price, inventory, and allowed state transitions on the server.
- Use integer minor units for money; never use floating-point totals.
- Make retries safe for checkout, payment events, inventory, email, and fulfillment changes.
- Keep secrets and unnecessary PII out of code, client bundles, logs, fixtures, and screenshots.

## Change discipline

### Incremental commit rule

- Work in tiny, single-purpose commits. Each commit should introduce one coherent behavior, test, refactor, migration, documentation decision, or configuration change.
- Commit after the smallest meaningful increment is verified; do not wait until an entire slice is finished, and do not commit every keystroke or an incoherent half-change.
- Keep behavior, its focused tests, and directly affected documentation in the same commit when separating them would make history misleading.
- Before committing, inspect `git status` and the staged diff, stage only files belonging to that increment, and preserve unrelated user or agent changes.
- Use concise imperative messages that state the outcome, for example `Add owned-address authorization checks` rather than `updates` or `work in progress`.
- A normal commit must pass the narrowest relevant verification. Record checks that were not run; never hide a known failure behind a commit.
- Do not mix formatting sweeps, dependency upgrades, generated artifacts, or unrelated cleanup with behavior changes.
- Do not amend, squash, rebase, force-push, bypass hooks, or rewrite another contributor's history unless the user explicitly asks.
- Use Git history as the implementation journal: meaningful new behavior and decisions must not exist only in chat or an uncommitted working tree.

Before implementation of a slice:

- identify the requirement and use-case IDs;
- write examples and failure cases;
- state the verification command/manual check;
- resolve only the decisions needed by that slice.
- identify the first few commit boundaries so the slice does not collapse into one large change.

During implementation:

- make focused edits and preserve unrelated user changes;
- add tests with the behavior, not in a distant cleanup pass;
- avoid speculative abstractions and infrastructure;
- use adapters only at real external boundaries;
- add dependencies only with a concrete, documented purpose.

After implementation:

- run the narrowest relevant checks, then broader checks proportional to risk;
- record evidence in the handoff or project status;
- reconcile discovered behavior with specs/ADRs;
- confirm the slice is represented by small, reviewable commits and the working tree contains no forgotten slice files;
- do not call a slice complete when required evidence is missing.

## Architecture guardrails

These are current invariants; proposals to change them require explicit rationale:

- PostgreSQL or an equivalent transactional source of truth owns commerce state.
- Product, variant, offer, and inventory are separate concepts even if the first store has one seller.
- Account-owned reads and writes enforce ownership at the trusted boundary.
- Browser-supplied prices, totals, roles, verification state, and payment results are never authoritative.
- Order items and addresses are snapshotted when an order is created.
- Payment success comes from a verified provider event, not a return URL.
- The clone must never accept live payments. Local/E2E runs use a deterministic fake or Stripe test mode; deployed configuration rejects live Stripe keys and live-mode events.
- Duplicate requests and events do not duplicate charges, orders, reservations, emails, or fulfillment.
- Public catalog caching must never leak private cart/account/order data.
- Product scope is one physical-goods retail storefront. Do not add standalone Amazon service clones, service launchers, or Seller Central workflows without an explicit scope change.
- Do not add a parallel REST/GraphQL backend for the same Next.js UI without a real external consumer and an accepted decision; use the documented typed use-case boundary.
- Do not create P1/P2 tables speculatively. P0 schema and transaction invariants live in `docs/database-design.md`.

## Verification expectations

When code exists, the project should expose standard scripts for formatting, linting, type checking, unit tests, integration tests, E2E tests, and production build. Exact commands belong in this file once the scaffold is selected. Never invent passing results.

## Documentation style

- State status and date on high-level living documents.
- Use stable IDs for requirements, use cases, risks, and decisions.
- Prefer examples, invariants, and measurable evidence over aspirational prose.
- Link to primary sources for external technical guidance.
- Clearly label observation, inference, decision, assumption, and open question.
