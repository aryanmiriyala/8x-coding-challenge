# ADR-001: Start with a lightweight modular monolith

Status: accepted
Date: 2026-09-28
Decision needed by: Slice 0 scaffold

## Context and problem

The challenge needs a real commerce journey quickly, including transactional cart, inventory, order, and payment behavior. We need enough separation to evolve, but distributed deployment could consume the build window and make cross-domain consistency harder.

## Decision drivers

- Deliver an end-to-end journey within a short challenge.
- Keep commerce mutations transactionally correct.
- Make domain boundaries visible to coding agents and tests.
- Avoid infrastructure that has no demonstrated scale requirement.
- Keep internal boundaries understandable without committing to future service extraction.

## Options considered

### Custom modular monolith

Pros: one deploy/database/transaction boundary; code demonstrates domain reasoning; easiest local reproduction.

Cons: we own commerce workflows; boundaries can erode without tests/review.

### Headless commerce backend such as Medusa or Saleor

Pros: proven product/cart/inventory/order modules and admin capabilities.

Cons: integration/learning overhead; less challenge-specific code; customization and deployment may exceed the first window.

### Microservices/serverless domains

Pros: independent scale and ownership; aligns with large commerce references.

Cons: premature operational/distributed consistency cost for a tiny team and catalog.

## Decision outcome

Use a custom lightweight modular monolith. “Module” means a code folder/boundary, not a deployable service. The baseline topology is one Next.js app, one PostgreSQL database, Stripe test mode, and email only when the auth flow needs it. Keep provider code small and explicit; do not introduce a generalized platform layer.

## Consequences

- Cart, reservation, and order creation can share PostgreSQL transactions.
- We must deliberately model workflows, invariants, and module boundaries.
- We avoid Redis, queues, event buses, dedicated search, object-storage uploads, and tracing infrastructure unless a later concrete requirement justifies a new decision.

## Validation and revisit triggers

- Reject or amend if the first vertical slice shows core commerce implementation cost exceeds the challenge value.
- Reconsider a headless backend if required admin, promotion, fulfillment, or return breadth becomes P0.
- Microservice extraction is outside the clone's scope. If the project is later redefined as a production commerce business, revisit architecture from its new requirements rather than treating extraction as an automatic roadmap item.

## Links

- `architecture.md`
- `docs/delivery-plan.md`
- [Medusa commerce modules](https://docs.medusajs.com/resources/commerce-modules)
- [AWS e-commerce architecture guide](https://aws.amazon.com/blogs/industries/the-cto-guide-to-ecommerce-architectures/)
