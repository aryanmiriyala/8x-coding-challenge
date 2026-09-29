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

- The ignored `.env.local` has pooled/direct database connections, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, Neon Object Storage connection variables, and `NEON_DATA_API_URL`. Current inspection shows the database and storage hosts still target the `production` branch. `NEON_PUBLIC_ASSETS_BUCKET` and `NEON_PRIVATE_UPLOADS_BUCKET` are not present under the documented names. Do not use local env for development writes until it is retargeted to an isolated branch.
- P0 does not require the Data API. The local `NEON_DATA_API_URL` value is present but currently appears to use the Neon Auth host (`neonauth`) instead of the active Data API host (`apirest`) reported by `neon data-api get`; correct it before any Data API experiment.
- Neon Object Storage now has two architecture-aligned buckets on both `production` and `vercel-dev`: `catalog-assets` (`public_read`) for catalog/merchandising media and `private-uploads` (`private`) for source/generated/admin files or future moderation queues. Object upload/read/delete has not yet been tested.
- No application scaffold or storage SDK dependency has been added. Runtime-managed files remain deferred until an active slice needs them.
- Neon and Vercel CLIs are installed and authenticated. Read-only checks identified the owner's personal Vercel Hobby scope and its `8x-coding-challenge` project, and the existing Neon Free project `8x-amazon-clone`. Vercel deployment metadata verifies the GitHub `main` link, but both recorded production deployments are in `ERROR`: the build detects no Next.js version because the repository intentionally has no application scaffold yet.
- The Neon/Vercel database integration is now partially verified. Neon has a `vercel-dev` branch, and Vercel has `DATABASE_URL`/`DATABASE_URL_UNPOOLED` for Development and Production. Temporary env pulls confirmed Development targets the `vercel-dev` endpoint and Production targets the `production` endpoint without printing secret values.
- The integration is not yet complete for Auth/storage. `vercel-dev` exists but `neon neon-auth status --branch vercel-dev` reports Auth is not configured for that branch. Vercel envs do not currently include `NEON_AUTH_BASE_URL`, `NEON_AUTH_URL`, Neon storage endpoint variables, or a visible app-managed cookie-secret variable. Local storage env still targets `production`.
- Integration checks passed for pooled/direct URL agreement, Neon database diagnostics on `production` and `vercel-dev`, Neon Auth enabled status and JWKS HTTP 200 on `production`, active optional Data API status on both branches, Vercel database env branch targeting, and Neon Object Storage bucket provisioning. No database mutation, Auth user creation, Vercel configuration change, or app deployment was made.
- A local anti-slop design and style reference pack now lives in `docs/design/amazon-quality-reference.md`; it constrains implementation toward dense Amazon-style retail workflows and away from generic AI-generated SaaS aesthetics.
- The exact smoke matrix, limitations, and next gate are recorded in `docs/neon-integration-smoke.md`.
- The owner chose simulated, no-money checkout. Stripe is out of P0 entirely (ADR-007); no Stripe account, key, SDK, or webhook is required. P0 payment contracts now specify one atomic demo-order transaction.
- No Resend API key is needed for P0. Application-owned order emails remain captured locally until a later slice chooses and verifies a sender provider.

## Known evidence gap

An interactive browser session was unavailable, so fresh screenshots and signed-in end-to-end Amazon flows were not captured. Public pages and official documentation were used instead. Authenticated visual validation remains an explicit pre-visual-lock task and must use a dedicated test identity; do not enter real payment details.

The database portion of the Neon-to-Vercel integration is partially proven, but Auth/storage runtime configuration and a healthy deployed application are still unproven. Before implementation writes, retarget local env to the isolated development branch, configure branch Auth and per-environment cookie secrets, and confirm the first app deployment after a separately authorized application skeleton. GitHub linkage and database env injection alone cannot pass the full smoke gate.

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
