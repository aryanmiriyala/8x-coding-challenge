# Testing Strategy

Status: Living risk-based strategy

## Principle

Test according to consequence and uncertainty. Commerce correctness, authorization, and payment reconciliation deserve deeper tests than static presentation. A large test count is not the goal; fast, trustworthy evidence is.

## Layers

### Static checks

- Strict TypeScript, linting, formatting, dependency/secret scanning.
- Database schema and migration validation.
- Architecture checks may later prevent client imports of server-only modules and cross-module shortcuts.

### Unit tests

Best for deterministic rules:

- money, discounts, totals, rounding;
- state-transition tables;
- search/filter parsing;
- quantity/purchase limits;
- permission predicates and DTO shaping;
- idempotency parameter comparison.

### Integration tests with real PostgreSQL

Best for behavior that types/mocks cannot prove:

- constraints and migrations;
- cart merge under concurrency;
- inventory reserve/release/consume;
- order snapshot transaction;
- owned-resource queries;
- unique webhook/idempotency records;
- aggregate updates and rollback.

Each test owns isolated data and is repeatable. Do not make integration tests depend on execution order.

### Provider contract tests

- Exercise the small payment and email integration modules against deterministic fakes for most cases.
- Use Stripe test fixtures and signed webhook payloads for boundary behavior.
- Test configuration fails when given live-key prefixes, and live-mode webhook/object fixtures cannot transition an order.
- Keep a small optional provider smoke suite separate from the normal offline test run.

### Browser/E2E tests

Keep a small set of high-value journeys:

1. guest discovery to cart;
2. guest sign-in/cart merge;
3. verified customer checkout success and processing delay;
4. customer order ownership denial;
5. admin fulfillment transition;
6. mobile navigation/search.

Use role/label locators and seed APIs/fixtures rather than brittle CSS selectors or shared accounts.

### Manual evidence

- Keyboard order, focus behavior, zoom/reflow, screen-reader spot checks, reduced motion.
- Visual comparison at 360, 768, 1280, and wide desktop.
- Stripe test decline, cancel, refresh, redirect-before-webhook, and duplicate-event behavior.
- Recovery from database/provider degradation where practical.

## Critical scenario matrix

| Scenario | Unit | DB integration | Browser/provider | Manual |
| --- | :---: | :---: | :---: | :---: |
| Forged price/total | Yes | Yes | Yes |  |
| Cross-user address/order ID | Permission rule | Yes | Yes |  |
| Two checkouts for same cart | Idempotency rule | Concurrency | Provider boundary |  |
| Duplicate/out-of-order webhook | State rule | Yes | Signed fixture |  |
| Inventory race | Rule | Concurrent transaction | Optional |  |
| Cart merge conflict | Rule | Yes | E2E | UX review |
| Auth enumeration/rate limit | Rule | Integration | HTTP/browser | Copy review |
| Responsive accessible journey |  |  | axe/E2E | Yes |

## Test data

Seed purposeful states rather than random noise:

- active/inactive products;
- single- and multi-variant products;
- in-stock, low-stock, out-of-stock, and archived offers;
- normal and changed prices;
- unverified customer, verified customer, admin;
- pending, paid, shipped, delivered, cancelled, and failed orders as supported;
- review-eligible and ineligible purchases.

Factories may vary irrelevant fields while preserving scenario readability.

## Completion evidence

A slice is not complete because code compiles. The handoff must state:

- commands/checks run and results;
- manual checks performed;
- acceptance examples not covered and why;
- new risks/assumptions;
- docs/decisions reconciled.

Never claim a test or browser flow passed when it was not run.
