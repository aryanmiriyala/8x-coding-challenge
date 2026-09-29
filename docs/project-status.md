# Project Status

Last updated: 2026-09-29
Phase: **Slice planning (Slice 0: Executable Foundation)**
Overall state: **Discovery complete; Slice 0 authorized; Slice 0 foundation scaffold in progress**

## Current objective

Complete discovery closure, finalize the Slice 0 plan and verified stack matrix, then execute the Slice 0 foundation walking skeleton in tiny verifiable commits once unpaused.

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
- Neon and Vercel CLIs are installed and authenticated. Read-only checks identified the owner's personal Vercel Hobby scope and its `8x-coding-challenge` project, and the existing Neon Free project `8x-amazon-clone`. Vercel deployment metadata verifies the GitHub `main` link, but both recorded production deployments are in `ERROR`: the build detects no Next.js version (The repository now contains the initial Slice 0 application scaffold, which should fix future deployments).
- The Neon/Vercel database integration is now branch-targeted for local and deployed environments. Vercel Development envs point at `vercel-dev`; Vercel Production envs point at `production`. Auth, Data API, storage endpoint, bucket-name, and app-managed cookie-secret variables have been added/refreshed for both environments.
- Integration has a healthy application scaffold, but awaits a Vercel deployment. Trusted Auth origins also still need registration once real app URLs exist.
- Integration checks passed for local pooled/direct URL agreement, Neon database diagnostics on `production` and `vercel-dev`, Neon Auth enabled status and JWKS HTTP 200 on both branches, active optional Data API status on both branches, local Data API host correctness, Neon Object Storage bucket provisioning plus local `vercel-dev` upload/read/delete, and Vercel Development/Production env host verification. No Auth users or app deployment was made.
- A local anti-slop design and style reference pack now lives in `docs/design/amazon-quality-reference.md`; it constrains implementation toward dense Amazon-style retail workflows and away from generic AI-generated SaaS aesthetics.
- The exact smoke matrix, limitations, and next gate are recorded in `docs/neon-integration-smoke.md`.
- The owner chose simulated, no-money checkout. Stripe is out of P0 entirely (ADR-007); no Stripe account, key, SDK, or webhook is required. P0 payment contracts now specify one atomic demo-order transaction.
- No Resend API key is needed for P0. Application-owned order emails remain captured locally until a later slice chooses and verifies a sender provider.
- Dev and production owner-role passwords were rotated after connection-string exposure in tool output, and Vercel Development/Production envs were refreshed from current Neon branch envs. Production secret values are stored as Vercel secrets and cannot be read back through `vercel env pull`.

## Known evidence gap

An interactive browser session was unavailable, so fresh screenshots and signed-in end-to-end Amazon flows were not captured. Public pages and official documentation were used instead. Authenticated visual validation remains an explicit pre-visual-lock task and must use a dedicated test identity; do not enter real payment details.

The local `vercel-dev` provider baseline and Vercel environment targeting are now usable for implementation planning, but a healthy deployed application is still unproven. Before deployed auth flows can pass, register trusted Auth origins once app URLs exist and confirm the first app deployment after a separately authorized application skeleton.

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

## Next flexible checkpoint: Slice 0 Foundation

Slice 0 candidate scope and gates are defined:
- **Outcome:** Minimal walking skeleton that builds, runs, tests, and verifies Neon database connectivity on `vercel-dev` without product breadth.
- **Linked requirements:** `TECH-FOUNDATION-01` (env validation, health check, Prisma schema, Vitest), `NAV-01` (minimal accessible header shell).
- **Verified Stack Matrix:**
  - Runtime: Node.js `v22.21.0` LTS, npm `11.6.2`
  - Framework: Next.js 16 (`16.3.7`) App Router + React 19 (`19.3.0`) + Strict TypeScript
  - Styling: Tailwind CSS
  - ORM: Prisma 6 (`6.19.3`) using direct connection for migrations, pooled for queries
  - Auth provider: Neon Auth (Managed Better Auth) via `@neondatabase/auth` (`0.5.0-beta`)
  - Testing: Vitest
- **Planned Verification:**
  - `npm run lint` && `npm run typecheck` && `npm test`
  - `/api/health` returns `200` with database status `ok`
  - Isolated Vercel preview builds without error
- **First Commit Boundaries:**
  1. Base package.json, TypeScript config, ESLint, Prettier, Vitest configuration
  2. Environment validation module (`lib/env.ts`)
  3. Health check route handler (`app/api/health/route.ts`) + integration test
  4. Minimal root layout, Tailwind styling, and header shell
  5. Prisma schema init targeting Neon `vercel-dev` with direct migration check
