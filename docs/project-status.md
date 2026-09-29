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
- A selected file-storage provider: keep seed imagery static for now; use Neon Object Storage if runtime-managed assets become active.
- Public visual-reference links and a manual authenticated-flow capture matrix.

## Provider readiness snapshot (2026-09-29)

- The ignored `.env.local` now has pooled and direct connections for the same Neon branch, plus the Auth base URL and Neon Object Storage connection variables. Independent 256-bit Auth-cookie and cron secrets were generated locally without printing values; the file is owner-readable only. Deployed environments still need their own secrets.
- `NEON_DATA_API_URL` was not saved in the file at inspection, so a blank optional slot was added. P0 does not require the Data API.
- A read-only S3 bucket listing using the configured Neon endpoint and credentials succeeded but returned zero buckets. The sample `assets` bucket does not yet exist on that endpoint/branch; uploads cannot succeed until it is created.
- No application scaffold or storage SDK dependency has been added. Runtime-managed files remain deferred until an active slice needs them.
- Neon and Vercel CLIs are installed and authenticated. Read-only checks found the owner's personal Vercel Hobby scope and its `8x-coding-challenge` project, and the existing Neon Free project `8x-amazon-clone`. The owner reports GitHub is already linked and the Vercel project deployed; that deployment and its environment variables have not yet been independently inspected. No Neon-to-Vercel integration was changed in this check.
- The local pooled database hostname matches the existing Neon project's only endpoint, which is attached to its default `production` branch. There is no isolated development branch yet. Do not run local migrations, seeds, integration tests, or test writes using the current `.env.local` connection. Create or choose an isolated branch and replace local branch-scoped URLs before implementation.
- The owner chose simulated, no-money checkout. Stripe is out of P0 entirely (ADR-007); no Stripe account, key, SDK, or webhook is required. P0 payment contracts now specify one atomic demo-order transaction.

## Known evidence gap

An interactive browser session was unavailable, so fresh screenshots and signed-in end-to-end Amazon flows were not captured. Public pages and official documentation were used instead. Authenticated visual validation remains an explicit pre-visual-lock task and must use a dedicated test identity; do not enter real payment details.

## Active questions

| ID | Question | Needed by | Current leaning |
| --- | --- | --- | --- |
| Q-001 | Is the first slice a read-only catalog/PDP or a walking skeleton through mocked checkout? | Slice 1 planning | Catalog/PDP first, then add one real mutation |
| Q-002 | Build commerce primitives ourselves or adopt a headless backend? | Before schema/scaffold | Lightweight custom monolith; use external platforms as domain references, not baseline dependencies |
| Q-003 | Prisma or a lighter SQL/query layer for transaction/locking control? | Database scaffold | Prisma, conditional on an inventory-locking spike |
| Q-004 | Better Auth or managed identity provider? | Auth slice | Resolved as a trial: Neon Auth (Managed Better Auth), enabled by the owner; validate in Slice 0 |
| Q-005 | Does dummy-only checkout need Stripe at all? | Resolved | No; ADR-007 selects server-authoritative simulated checkout |
| Q-006 | Deployment, database, and email providers? | Slice 0 preview/application email | Trial Vercel + directly owned Neon integration; Neon handles auth email; defer application email provider |
| Q-007 | Final brand and image licensing strategy? | Visual lock/seed | Original brand plus generated/licensed product images |
| Q-008 | Do product images need runtime/admin uploads in the first release? | Image-management slice | Static app assets for the initial catalog; Neon Object Storage is selected when uploads/generated files become active |

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
