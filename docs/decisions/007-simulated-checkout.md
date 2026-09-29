# ADR-007: Use simulated checkout without a payment provider

Status: accepted
Date: 2026-09-29

## Context

This clone demonstrates a physical-goods shopping journey but must never move money. Stripe test mode would add an external session, redirect, webhook, credentials, and failure states without validating a requirement for real payment processing. The owner explicitly chose simulated transactions and parked Stripe.

## Decision

P0 checkout is a server-owned, visibly labeled demo purchase. The server revalidates identity, address ownership, cart, prices, and inventory, then atomically creates one snapshotted order and a `SIMULATED` payment record, consumes inventory, and retires purchased cart lines. A caller-supplied idempotency key prevents duplicate orders; the same key with different intent is rejected. No card form, provider SDK, payment credentials, redirect, webhook, or live-payment mode exists.

## Consequences and evidence gate

- The checkout/order transaction and concurrent stock test become the correctness boundary. A success page only reads the committed, owned order; it cannot assert success from URL parameters.
- The UI explicitly says no money is charged and labels the order as a demo. Never ask for or store card data.
- A failed transaction leaves cart and inventory unchanged; retries return the committed result or a safe conflict.
- Reconsider an external provider only if a later use case genuinely requires demonstrating payment processing. That requires a new decision, security review, and revised contracts; it is not a dormant P0 option.

## Links

- `spec.md` CHECK-01..09
- `docs/database-design.md`
- `docs/api-contracts.md`
