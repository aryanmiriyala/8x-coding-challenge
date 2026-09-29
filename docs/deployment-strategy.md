# Deployment Strategy

Status: Living deployment hypothesis
Scope: Public challenge demo, not production commerce

## Goal

Deploy the same tested application we run locally using the smallest reliable topology: one Next.js application, one Neon PostgreSQL database with Managed Better Auth, simulated checkout, and application email only when a product slice needs it. Deployment must be repeatable, observable, and reversible without introducing a separate platform team or distributed infrastructure.

The current trial is Vercel for the Next.js application plus the existing, directly owned Neon PostgreSQL project through the existing-account integration. Slice 0 must verify runtime compatibility, cost, region availability, pooled database behavior, preview branches, and controlled migrations before the trial becomes accepted. Railway remains the fallback if serverless/database behavior creates disproportionate friction.

Account ownership, credential scope, environment-variable placement, and rotation are defined in `docs/service-access.md`.

## Environment model

| Environment | Purpose | Data and providers |
| --- | --- | --- |
| Local | Development and fast verification | Isolated Neon development branch for commerce and Managed Auth; simulated checkout; captured application email |
| Test | Automated integration/E2E runs | Isolated disposable Neon branch, deterministic providers, and branch-isolated real-auth tests where the auth contract is under test |
| Preview | Shared review before public release | Isolated Neon database/Auth branch, simulated checkout, controlled auth/application email configuration |
| Public demo | Challenge demonstration | Managed PostgreSQL, simulated checkout, approved seed data, host logs |

Preview and public-demo environments must never share sessions, databases, or customer data. No environment has a card-payment path or intentionally stores real customer information during the challenge.

## Provider selection criteria

Select the lightest application host and managed PostgreSQL provider that can demonstrate:

- the pinned Node.js/Next.js runtime and reproducible lockfile build;
- TLS and a stable HTTPS URL;
- encrypted secret storage and separate environment configuration;
- pooled PostgreSQL application traffic plus a direct migration connection for the same branch;
- a controlled migration step rather than migrations racing on app startup;
- simulated checkout that commits atomically and requires no external payment endpoint;
- basic request/error logs and an application health check;
- a straightforward previous-deployment rollback;
- spending limits or alerts suitable for a challenge project.

We do not require Kubernetes, infrastructure-as-code, multiple regions, autoscaling design, a CDN configuration project, or separate staging services. Provider defaults are acceptable when they meet the documented security and runtime needs.

## Configuration and secrets

- Commit an `.env.example` containing names, descriptions, and safe placeholders only.
- Validate required variables at startup and fail closed with a non-secret error.
- Keep local, test, preview, and public-demo secrets separate.
- Use least-privilege database credentials where the provider permits it; migration credentials may be stronger than runtime credentials.
- Keep auth cookie secrets, database URLs, storage keys, and email keys out of Git, client bundles, logs, fixtures, screenshots, and build output.
- Explicitly configure trusted application origins, auth callback URLs, cookie security, and email links per environment.
- Rotate any credential that is accidentally exposed and document the incident; removing it from the latest commit is not sufficient.

## Build and release pipeline

The eventual CI/deployment workflow should perform these steps in order:

1. Install exactly from the committed lockfile.
2. Validate environment shape without printing secret values.
3. Run formatting/lint, strict type checking, unit tests, and the application build.
4. Run database integration tests against an isolated PostgreSQL instance.
5. Validate that migrations apply to an empty database and from the currently supported schema.
6. Create the immutable application deployment artifact.
7. Apply reviewed, forward-compatible migrations once through a controlled release step.
8. Deploy the application artifact.
9. Run health, database-readiness, and critical smoke checks.
10. Record the deployed revision and evidence in the handoff.

Pull-request previews are useful but optional. They must not automatically mutate the public-demo database.

## Database deployment rules

- Use pooled `DATABASE_URL` for application traffic and direct `DATABASE_URL_UNPOOLED` for migrations, dumps, and session-level administration.
- Never run development schema push against the public-demo database.
- Prefer additive migrations: add before backfill, switch application reads/writes, and remove only in a later deployment.
- Do not run migrations concurrently from every application instance.
- Seed is explicit, idempotent, and safe to rerun; deploying the app does not silently reseed or destroy data.
- Back up before a destructive migration. Backups and restore testing become mandatory before accepting real user data or live money.
- Keep application rollback possible while the new schema remains backward compatible.

## Email and scheduled work

- Neon Auth handles verification/recovery delivery. Shared SMTP is development-only; configure custom SMTP before any production-like auth release.
- P0 has no payment-provider webhook or credential. The browser confirmation URL never proves order placement; it reads committed owned state.
- Preview email uses a safe testing/non-delivering configuration; public-demo email sends only to controlled demo identities unless explicitly reviewed.
- P0 checkout needs no scheduled work. Add a protected scheduled route only for a later active use case that demonstrates the need.

## Health and smoke verification

The health endpoint reports only safe application/database readiness and must not expose configuration, versions, queries, or secrets.

After every public-demo deployment, verify at minimum:

- home, search, and one product page render from seeded database data;
- sign-in/session cookies use the expected deployed-domain security settings;
- an anonymous user cannot open protected account/admin routes;
- database reads and one safe test mutation succeed;
- simulated checkout, when implemented, creates one correct demo order and no external payment request;
- logs contain a correlation ID but no credentials or unnecessary personal data;
- security headers are present on the public HTTPS response;
- the deployed revision is identifiable for rollback.

Run the full checkout smoke only after the checkout slice exists. Use a dedicated demo identity and synthetic address.

## Rollback and recovery

- Prefer application rollback to the previous immutable deployment.
- Database migrations must remain backward compatible long enough for that rollback.
- If a release causes unsafe writes, disable the affected mutation or place the demo in a clear maintenance state before repairing data.
- Retried checkout requests must remain idempotent after rollback or redeployment.
- Document the last known-good revision, migration state, and any manual recovery action.

## Deployment readiness gate

A public-demo release is ready when:

- [ ] provider/runtime/database compatibility is proven;
- [ ] required variables and callback URLs are documented and validated;
- [ ] test, preview, and public-demo data and secrets are isolated;
- [ ] migrations and seed are repeatable and have a rollback/compatibility story;
- [ ] the lockfile build, tests, and application build pass in CI;
- [ ] the health endpoint and critical smoke checks pass on the deployed URL;
- [ ] simulated checkout is labeled no-money and its atomicity/idempotency are proven when implemented;
- [ ] no payment SDK, credential, card field, or webhook is present in P0;
- [ ] secure cookies, HTTPS, security headers, and origin configuration are inspected;
- [ ] host logs are useful and redacted;
- [ ] the previous deployment can be restored;
- [ ] known limitations are recorded in `docs/project-status.md`.

This gate is flexible: checks that do not apply to the currently implemented slice are marked not applicable with a reason rather than simulated.
