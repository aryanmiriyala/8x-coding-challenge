# Pre-build Readiness

Status: Living, flexible gate
Applies before: application scaffolding and Slice 0 implementation

## Purpose

This checklist makes hidden setup work visible before product code begins. It is a confidence gate, not a promise that every future choice is fixed. Mark an item complete, not applicable with a reason, or replace it when new evidence changes the plan.

## Required before scaffolding

- [ ] The owner has reviewed `intent.md`, `spec.md`, and `architecture.md` and explicitly authorized Slice 0.
- [ ] The first slice has a named outcome, linked requirement/use-case IDs, failure cases, and verification evidence.
- [ ] The repository baseline is committed and pushed in small, single-purpose commits; the worktree contains no accidental secret or unrelated staged file.
- [ ] Node/package-manager versions and the Next.js/React/Auth/ORM compatibility matrix are checked against current primary documentation.
- [ ] Package versions will be pinned in the lockfile; no generated scaffold is accepted before its scripts and defaults are reviewed.

## Repository and delivery controls

- [ ] GitHub access uses individual accounts with MFA/passkeys; branch protection is enabled if it improves this solo challenge workflow without blocking tiny commits.
- [ ] CI design includes format/lint, strict types, unit tests, database integration tests, build, and a secret scan; implementation may add these incrementally with the first code that needs them.
- [ ] Commit scope follows `AGENTS.md`: one observable addition or decision, its focused verification, and matching docs.
- [ ] Generated files, dependency changes, formatting-only changes, and behavior changes are separated when that separation improves reviewability.
- [ ] The untracked/ignored baseline is understood before the first code commit.

## Neon database and Auth

- [x] The owner enabled Neon Auth on the selected Neon project.
- [ ] Confirm the project is in an Auth-supported AWS region and does not combine Managed Auth with incompatible IP Allow or Private Networking settings.
- [ ] Choose/create an isolated development branch on the existing Neon Free project; link local tooling to that branch without overwriting secrets. The current local URLs target `production` and must not be used for dev writes.
- [ ] Pull/store `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and `NEON_AUTH_BASE_URL` in ignored local or Vercel-managed environment storage.
- [x] Generate a 256-bit `NEON_AUTH_COOKIE_SECRET` in the ignored local environment; still generate a distinct value for each deployed environment and never commit one.
- [ ] Treat `NEON_DATA_API_URL` as optional provider configuration; decide on a concrete Data API use case and row-level security model before calling it from a browser.
- [x] Confirm pooled application and direct migration URLs address the same branch; current local URLs match the existing `production` endpoint, not an isolated development branch.
- [ ] Register the exact preview/public-demo origins with Neon Auth; keep login, recovery, callback, `/api/auth`, and static assets outside protected-route matchers.
- [ ] Establish an isolated Neon development branch for local commerce and Managed Auth; automated tests use disposable branches. Encode this in test scripts when implementation begins.
- [ ] Validate Managed Auth sign-up, verification, sign-in, sign-out, recovery, session restoration, and direct protected-operation denial.
- [ ] Validate the managed-schema relationship strategy before adding app-owned foreign keys to `neon_auth.user`.

## Vercel and runtime

- [x] GitHub `main` is linked to the existing Vercel Hobby project, verified from deployment metadata. The current deployments fail because no app scaffold exists; no healthy deployment is claimed.
- [ ] Connect that Hobby project to the existing Neon-owned Free project through the existing-account integration; do not provision a Vercel-managed Neon resource.
- [ ] Confirm Neon-injected variable names and branch targets by inspection; the project currently has no environment variables or marketplace installation.
- [ ] Define Local, Test, Preview, and Public Demo environment boundaries; Preview and Demo must not share data, auth sessions, or secrets.
- [ ] Confirm Node/Next.js runtime, database pooling, build output, secure cookies, trusted origins, health checks, logs, rollback, and spending controls in a minimal preview.
- [ ] Establish one controlled migration step using the direct URL; do not run migrations concurrently at application startup.
- [ ] Keep Railway as a bounded fallback only if the Vercel/Neon trial fails recorded criteria.

## Provider safety

- [ ] Keep P0 checkout server-side and simulated. No payment account, SDK, key, webhook, or card form is needed; test atomic order/stock/cart behavior and visibly label no-money orders.
- [ ] Use Neon-managed auth email during development. Configure custom SMTP before any production-like auth release.
- [ ] Defer Resend or another application-mail provider until an order/customer message actually exists.
- [ ] Keep seeded catalog imagery in app static assets for the first slice. If an active slice adds runtime-managed files, use the selected Neon Object Storage; check region, access mode, CDN, cost, and branch isolation before provisioning.
- [ ] Before using the sample `assets` S3 bucket, confirm it exists on the branch named by the storage endpoint and has the intended access level; S3 credentials alone are insufficient.
- [ ] Do not create Redis, queues, search services, analytics platforms, or Neon Functions unless an active slice demonstrates the need.

## Data, assets, and UX evidence

- [ ] Define a small, deterministic, idempotent seed catalog that exercises variants, inventory states, price ranges, search, and empty/error states.
- [ ] Use original branding and generated/licensed product imagery; track provenance and avoid shipping Amazon marks or scraped customer content.
- [ ] Capture current Amazon desktop/mobile reference flows with a dedicated test identity before visual lock; record date, locale, viewport, and experiment variance.
- [ ] Define demo identities/data that contain no real addresses, card details, or customer information.

## Slice 0 technical spikes

Time-box these and record results; they are evidence gathering, not foundations to expand indefinitely.

1. **Runtime/build:** minimal pinned Next.js application builds locally and on Vercel.
2. **Database:** chosen ORM applies an empty migration through the direct URL and performs pooled reads/writes on Neon.
3. **Transactions:** concurrent inventory decrement and atomic demo-order creation prove the required lock or optimistic-concurrency behavior.
4. **Auth:** Neon Auth completes the P0 lifecycle through the Next.js proxy and server-side authorization denies bypass attempts.
5. **Preview isolation:** a Vercel preview uses an isolated Neon database/Auth branch and cannot mutate public-demo state.

Delete spike-only code or turn it into the smallest tested production path. Record failures and changed decisions in `docs/project-status.md` and an ADR when warranted.

## Gate outcome

The gate passes when no unresolved item blocks the next slice's safety or learning goal. Items unrelated to that slice may remain open. Passing this gate authorizes only the named slice—not the entire backlog—and any assumption may be revisited with evidence.
