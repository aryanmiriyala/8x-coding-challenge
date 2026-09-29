# Learning-Oriented Delivery Plan

Status: Proposed sequence; reorder when evidence warrants it.

## Strategy

Build thin vertical slices that cross UI, domain, persistence, and verification. Avoid completing all database work, then all API work, then all UI work; that delays the discovery of broken assumptions.

Each slice should fit the loop:

```text
frame outcome -> examples -> decide only what is needed -> implement
-> verify -> demo -> reconcile docs -> choose next slice
```

## Slice 0 — Executable foundation

Outcome: The repository can prove that a small, reliable demo application builds and tests consistently.

Candidate work:

- Confirm framework/runtime/package manager through a short compatibility check.
- Scaffold strict TypeScript, formatting, linting, unit test, browser test, environment validation, and CI.
- Establish CSS tokens and one accessible page shell.
- Establish PostgreSQL migration/seed workflow with one simple health check.
- Select the lightest compatible app/database hosts and prove one repeatable preview deployment with isolated configuration.

Learning sought: Are the working stack hypotheses compatible and pleasant enough to continue?

Exit evidence: clean install/build/test; empty migration and repeatable seed; one browser smoke test; one healthy preview deployment with a recorded revision/rollback path; docs updated with exact commands/versions.

## Slice 1 — Discover one real product

Outcome: A guest reaches a real database-backed PDP from home/search at mobile and desktop sizes.

Candidate scope: a few categories/products/variants/offers, search query, product card, PDP gallery/variant state, stock display.

Learning sought: product/variant/offer boundaries, server rendering, image strategy, PostgreSQL search adequacy, responsive shell.

Defer: personalization, full faceting, reviews, sophisticated admin.

## Slice 2 — Cart plus identity continuity

Outcome: A guest creates a persistent cart, signs up/signs in, and keeps a correctly merged cart.

Learning sought: session/auth library ergonomics, cart token ownership, merge transactions, rate limits, email verification workflow.

Defer: 2FA/passkeys, multiple lists, social auth unless evidence makes them essential.

## Slice 3 — Correct test checkout

Outcome: A verified customer completes exactly one test purchase and sees one correct order.

Learning sought: inventory locking/reservation, order snapshots, Stripe presentation, webhook idempotency, failure recovery.

This slice receives the strongest integration and abuse-case testing.

## Slice 4 — Account and operations

Outcome: Customer understands the order; admin advances fulfillment safely.

Learning sought: account information architecture, order state model, audit usefulness, customer/admin authorization separation.

## Slice 5 — Convergence and optional value

Outcome: The demonstrated product is reliable, accessible, explainable, and deployable.

Candidate work: cross-device/manual accessibility pass, performance budgets, security review, observability, demo data polish, visual comparison, then select the highest-value P1 item.

## Time-box guidance for a 24-hour challenge

Treat time as a constraint for prioritization, not an excuse to fake behavior:

- Preserve the end-to-end P0 journey and cut breadth first.
- Prefer seeded data to fragile third-party product APIs.
- Prefer hosted payment UI to custom card handling.
- Prefer one correct seller/offer path while retaining the catalog boundary.
- Do not add Redis, queues, search infrastructure, object storage, or tracing platforms for hypothetical scale.
- If a provider blocks progress, use a contract-compatible fake and clearly label the demo state.
- Stop adding features early enough to run the convergence checklist.

No hour allocation is fixed until the team knows the actual challenge clock, scoring rubric, and deployment constraints.
