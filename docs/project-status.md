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

- The ignored `.env.local` is now retargeted to the isolated `vercel-dev` branch for pooled/direct database, Neon Auth, Data API, and Neon Object Storage. It includes the documented bucket-name variables and no longer carries the stale provider-extra Postgres connection or Resend placeholder.
- P0 does not require the Data API, but the local `NEON_DATA_API_URL` now uses the correct `vercel-dev` `apirest` host if a later experiment needs it.
- Neon Object Storage now has two architecture-aligned buckets on both `production` and `vercel-dev`: `catalog-assets` (`public_read`) for catalog/merchandising media and `private-uploads` (`private`) for source/generated/admin files or future moderation queues. Local `vercel-dev` put/head/delete smoke passed for both buckets.
- No application scaffold or storage SDK dependency has been added. Runtime-managed files remain deferred until an active slice needs them.
- Neon and Vercel CLIs are installed and authenticated. Read-only checks identified the owner's personal Vercel Hobby scope and its `8x-coding-challenge` project, and the existing Neon Free project `8x-amazon-clone`. Vercel deployment metadata verifies the GitHub `main` link, but both recorded production deployments are in `ERROR`: the build detects no Next.js version because the repository intentionally has no application scaffold yet.
- The Neon/Vercel database integration is now partially verified. Neon has a `vercel-dev` branch, and Vercel previously had `DATABASE_URL`/`DATABASE_URL_UNPOOLED` for Development and Production. Temporary env pulls confirmed Development targeted the `vercel-dev` endpoint and Production targeted the `production` endpoint at that time.
- The integration is not yet complete for deployed runtime. `vercel-dev` Auth is now configured and local env is branch-correct, but Vercel envs still need refresh for Auth/storage/Data API/cookie-secret variables. Because the `vercel-dev` owner role was rotated after a dev URL exposure, Vercel Development database envs likely need refresh before any app deployment can use them.
- Integration checks passed for local pooled/direct URL agreement, Neon database diagnostics on `production` and `vercel-dev`, Neon Auth enabled status and JWKS HTTP 200 on both branches, active optional Data API status on both branches, local Data API host correctness, and Neon Object Storage bucket provisioning plus local `vercel-dev` upload/read/delete. No Auth users, Vercel configuration change, or app deployment was made.
- A local anti-slop design and style reference pack now lives in `docs/design/amazon-quality-reference.md`; it constrains implementation toward dense Amazon-style retail workflows and away from generic AI-generated SaaS aesthetics.
- The exact smoke matrix, limitations, and next gate are recorded in `docs/neon-integration-smoke.md`.
- The owner chose simulated, no-money checkout. Stripe is out of P0 entirely (ADR-007); no Stripe account, key, SDK, or webhook is required. P0 payment contracts now specify one atomic demo-order transaction.
- No Resend API key is needed for P0. Application-owned order emails remain captured locally until a later slice chooses and verifies a sender provider.
- A production database URL was exposed in tool output while inspecting stale local env. Rotating the production owner-role password and refreshing Vercel Production/Development envs requires explicit approval because it changes deployed secrets across services; the attempted broad bundled update was blocked by execution policy.

## Known evidence gap

An interactive browser session was unavailable, so fresh screenshots and signed-in end-to-end Amazon flows were not captured. Public pages and official documentation were used instead. Authenticated visual validation remains an explicit pre-visual-lock task and must use a dedicated test identity; do not enter real payment details.

The local `vercel-dev` provider baseline is now usable for implementation planning, but deployed Vercel runtime configuration and a healthy deployed application are still unproven. Before deployment, refresh Vercel envs, register trusted Auth origins, and confirm the first app deployment after a separately authorized application skeleton. GitHub linkage and local provider readiness alone cannot pass the full smoke gate.

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
