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
- [ ] Link the repository to the intended Neon project/branch without printing or committing credentials.
- [ ] Pull/store `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and `NEON_AUTH_BASE_URL` in ignored local or Vercel-managed environment storage.
- [ ] Generate a distinct `NEON_AUTH_COOKIE_SECRET` for each deployed environment; never commit the populated value.
- [ ] Confirm pooled application and direct migration URLs address the same branch.
- [ ] Register the exact preview/public-demo origins with Neon Auth; keep login, recovery, callback, `/api/auth`, and static assets outside protected-route matchers.
- [ ] Decide whether local commerce integration tests use local PostgreSQL while focused auth tests use a Neon dev branch, then encode that split in test scripts.
- [ ] Validate Managed Auth sign-up, verification, sign-in, sign-out, recovery, session restoration, and direct protected-operation denial.
- [ ] Validate the managed-schema relationship strategy before adding app-owned foreign keys to `neon_auth.user`.

## Vercel and runtime

- [ ] Connect Vercel to GitHub and the directly owned Neon project through native integrations; avoid personal deployment/database tokens for normal builds.
- [ ] Define Local, Test, Preview, and Public Demo environment boundaries; Preview and Demo must not share data, auth sessions, or secrets.
- [ ] Confirm Node/Next.js runtime, database pooling, build output, secure cookies, trusted origins, health checks, logs, rollback, and spending controls in a minimal preview.
- [ ] Establish one controlled migration step using the direct URL; do not run migrations concurrently at application startup.
- [ ] Keep Railway as a bounded fallback only if the Vercel/Neon trial fails recorded criteria.

## Provider safety

- [ ] Keep `PAYMENT_MODE=fake` for ordinary local work; create/use Stripe sandbox credentials only when the checkout integration slice begins.
- [ ] Executable configuration rejects live Stripe keys and live-mode events.
- [ ] Use Neon-managed auth email during development. Configure custom SMTP before any production-like auth release.
- [ ] Defer Resend or another application-mail provider until an order/customer message actually exists.
- [ ] Do not create object storage, Redis, queues, search services, analytics platforms, or Neon Functions unless an active slice demonstrates the need.

## Data, assets, and UX evidence

- [ ] Define a small, deterministic, idempotent seed catalog that exercises variants, inventory states, price ranges, search, and empty/error states.
- [ ] Use original branding and generated/licensed product imagery; track provenance and avoid shipping Amazon marks or scraped customer content.
- [ ] Capture current Amazon desktop/mobile reference flows with a dedicated test identity before visual lock; record date, locale, viewport, and experiment variance.
- [ ] Define demo identities/data that contain no real addresses, card details, or customer information.

## Slice 0 technical spikes

Time-box these and record results; they are evidence gathering, not foundations to expand indefinitely.

1. **Runtime/build:** minimal pinned Next.js application builds locally and on Vercel.
2. **Database:** chosen ORM applies an empty migration through the direct URL and performs pooled reads/writes on Neon.
3. **Transactions:** inventory decrement/reservation proves the required lock or optimistic-concurrency behavior.
4. **Auth:** Neon Auth completes the P0 lifecycle through the Next.js proxy and server-side authorization denies bypass attempts.
5. **Preview isolation:** a Vercel preview uses an isolated Neon database/Auth branch and cannot mutate public-demo state.

Delete spike-only code or turn it into the smallest tested production path. Record failures and changed decisions in `docs/project-status.md` and an ADR when warranted.

## Gate outcome

The gate passes when no unresolved item blocks the next slice's safety or learning goal. Items unrelated to that slice may remain open. Passing this gate authorizes only the named slice—not the entire backlog—and any assumption may be revisited with evidence.
