# Project Status

Last updated: 2026-09-29
Phase: **Discovery**
Overall state: **Active; no implementation authorized yet**

## Current objective

Produce a reviewable, flexible discovery package for an Amazon-inspired commerce clone, then select the smallest end-to-end slice that tests the highest-value architectural assumptions.

## Confirmed product boundary

Build one Amazon.com-style physical-goods retail storefront. Separate Amazon businesses and services are out of scope; future expansion deepens discovery, purchase, account, and post-purchase behavior within this storefront.

## Completed in this phase

- Public Amazon homepage, search/product, account, address, payment, order, tracking, return, review, and authentication research.
- Initial product intent, requirements, architecture, use cases, risk model, security model, test strategy, delivery slices, traceability, and decision process.
- Lightweight environment, migration, deployment, rollback, and post-release verification strategy.
- Concrete service-account/secret placement, minimal HTTP/use-case contracts, and P0 relational schema/transaction design.
- A flexible pre-build readiness gate covering repository, Neon Auth/database, Vercel, CI, seed/assets, and technical-spike evidence.
- Public visual-reference links and a manual authenticated-flow capture matrix.

## Known evidence gap

An interactive browser session was unavailable, so fresh screenshots and signed-in end-to-end Amazon flows were not captured. Public pages and official documentation were used instead. Authenticated visual validation remains an explicit pre-visual-lock task and must use a dedicated test identity and test payment data.

## Active questions

| ID | Question | Needed by | Current leaning |
| --- | --- | --- | --- |
| Q-001 | Is the first slice a read-only catalog/PDP or a walking skeleton through mocked checkout? | Slice 1 planning | Catalog/PDP first, then add one real mutation |
| Q-002 | Build commerce primitives ourselves or adopt a headless backend? | Before schema/scaffold | Lightweight custom monolith; use external platforms as domain references, not baseline dependencies |
| Q-003 | Prisma or a lighter SQL/query layer for transaction/locking control? | Database scaffold | Prisma, conditional on an inventory-locking spike |
| Q-004 | Better Auth or managed identity provider? | Auth slice | Resolved as a trial: Neon Auth (Managed Better Auth), enabled by the owner; validate in Slice 0 |
| Q-005 | Stripe hosted or embedded Checkout? | Checkout slice | Hosted for speed/security; embedded if visual fidelity is a scored criterion |
| Q-006 | Deployment, database, and email providers? | Slice 0 preview/application email | Trial Vercel + directly owned Neon integration; Neon handles auth email; defer application email provider |
| Q-007 | Final brand and image licensing strategy? | Visual lock/seed | Original brand plus generated/licensed product images |

## Next flexible checkpoint

Review `intent.md`, `spec.md`, `architecture.md`, and `docs/pre-build-readiness.md` together. Then either:

1. revise scope/assumptions;
2. run one or more time-boxed technical spikes; or
3. approve Slice 0/1 planning without freezing later slices.

## How to advance phase

Update this file to `Slice planning` only after the next slice has:

- a named user outcome;
- linked requirement and use-case IDs;
- acceptance examples and failure paths;
- known risks and required decisions;
- a verification approach;
- no unresolved safety or authority blocker.
