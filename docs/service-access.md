# Service Accounts and Access

Status: Living access plan
Rule: Never place credentials in Git, documentation, screenshots, logs, fixtures, issue text, or chat.

## Accounts to create

### Create before Slice 0

| Service | Purpose | Recommended ownership/access |
| --- | --- | --- |
| GitHub | Repository, pull requests, CI, Vercel source integration | Personal or project organization; enable MFA/passkey; no shared password |
| Vercel | Next.js preview and public-demo deployment | Connect GitHub directly so routine deploys need no stored Vercel token |
| Neon | Managed PostgreSQL, Managed Better Auth, and isolated preview branches | Use the directly owned project with Auth already enabled, then connect its Vercel integration; keep database ownership independent of the application host |
| Stripe | Sandbox Checkout and signed test webhooks | Sandbox/test access only; do not enter live keys, enable live mode, or connect payout/bank details for this clone |

### Create only when the dependent slice starts

| Service | Needed when | Notes |
| --- | --- | --- |
| Custom SMTP and/or application email provider | Production-like auth email or order email becomes active | Neon shared SMTP is sufficient for development auth codes. Configure custom SMTP before a production-like auth release; add Resend or another provider only for application-owned messages when needed |
| Neon Object Storage | Runtime-managed catalog images, generated assets, or user uploads become an active use case | Preferred S3-compatible store for this Neon-backed app because buckets and objects branch with PostgreSQL. Declare only required buckets through `neon.ts`; credentials are injected by Neon per branch |
| Domain registrar/DNS | We want branded public URLs and real email delivery | A `vercel.app` URL is sufficient for early previews; a controlled domain is useful before public auth email |

No separate hosted identity account is required: Neon Auth is Managed Better Auth. No hosted account is required for Prisma, Tailwind CSS, Zod, Vitest, Playwright, axe, or local PostgreSQL.

## Human access

- Every person uses an individual account with MFA/passkey; never share passwords or recovery codes.
- Store recovery codes and original one-time secrets in a trusted password manager.
- Grant the smallest project role required and review collaborators before a public release.
- The project owner retains billing, domain, repository, database, Stripe, and email-provider recovery access.
- Removing a collaborator also triggers review/rotation of credentials they could read.

## Application and automation access

Prefer this order:

1. Native service integration with scoped project access.
2. Short-lived identity/OIDC when a required workflow supports it cleanly.
3. Project-scoped or restricted API key.
4. Broad personal token only as a short-lived exception with an owner and removal date.

For this clone:

- GitHub connects to Vercel directly; CI should not need a personal Vercel token for normal deployments.
- The Neon/Vercel integration supplies environment-specific database/Auth configuration and creates isolated preview branches.
- Application queries use pooled `DATABASE_URL`; migrations and administrative tasks use direct `DATABASE_URL_UNPOOLED`. Both must target the same branch. A Neon management API key is unnecessary unless we automate branch lifecycle outside the integration; if later needed, use a project-scoped key.
- Neon Auth supplies each branch's `NEON_AUTH_BASE_URL`. The application supplies a unique `NEON_AUTH_COOKIE_SECRET`; trusted preview/demo origins are registered in Neon.
- Stripe uses a sandbox restricted key where its permissions cover the implemented Checkout operations; otherwise use the standard test secret temporarily. A webhook signing secret is separate and unique per endpoint/environment.
- Custom SMTP or a later application email provider uses a sending-only, domain-restricted credential when enabled.
- Coding agents do not receive dashboard passwords, recovery codes, broad personal tokens, or live-payment credentials.

## Secret storage model

### Repository

Commit:

- `.env.example` with variable names, descriptions, and non-secret placeholders;
- an executable environment schema that validates presence, format, allowed mode, and cross-field rules;
- documentation identifying the owner and rotation procedure, never the value.

Ignore:

- `.env`, `.env.local`, `.env.*.local`, Vercel local state, database dumps, and generated credential files.

Tracked test configuration contains fake values only. Real sandbox credentials never enter fixtures.

### Local development

- Use `.env.local` only for developer-specific sandbox values and ensure it is ignored before adding any value.
- Prefer local PostgreSQL, captured application email, and deterministic provider fakes for normal commerce development. Focused auth tests use a dedicated Neon development branch because managed auth is branch-scoped.
- Use Stripe CLI/test credentials only for the focused webhook/integration checks that need them.
- Do not paste secrets into agent prompts or terminal commands that will echo them into logs.

### Vercel preview and public demo

- Store secrets as project-level Sensitive Environment Variables so values cannot be read back from the dashboard.
- Use different values for Preview and Production/public-demo environments.
- Let the Neon integration inject the correct preview/production database and Auth URLs rather than copying shared values.
- Environment changes require a new deployment; verify the new deployment before revoking the old value during rotation.
- Do not put secrets in `vercel.json` or `NEXT_PUBLIC_*` variables.

### GitHub Actions

- Prefer local service containers and deterministic fakes so most CI requires no external credentials.
- Add a GitHub Actions secret only for a workflow that genuinely needs an external sandbox or deployment API.
- Scope environment secrets and approvals to the deployment job; do not expose them to untrusted pull-request code.

## Planned environment variables

Names are hypotheses until the scaffold establishes the executable environment schema.

| Variable | Secret | Environments | Purpose/rule |
| --- | :---: | --- | --- |
| `DATABASE_URL` | Yes | Local/test/preview/demo | Pooled PostgreSQL connection; unique per environment |
| `DATABASE_URL_UNPOOLED` | Yes | Local/test/preview/demo | Direct PostgreSQL connection for migrations, dumps, and admin tasks; same branch as pooled URL |
| `NEON_AUTH_BASE_URL` | No | Auth test/preview/demo | Branch Managed Auth URL including its path; supplied by Neon |
| `NEON_AUTH_COOKIE_SECRET` | Yes | Auth test/preview/demo | 32+ character Next.js cached-session cookie secret; unique per environment and not injected by Neon |
| `AWS_ACCESS_KEY_ID` | Yes | Local/preview/demo only when Neon Object Storage is provisioned | Branch-scoped Neon S3 credential; generated/injected by Neon, keep in ignored local or managed environment storage |
| `AWS_SECRET_ACCESS_KEY` | Yes | Local/preview/demo only when Neon Object Storage is provisioned | Branch-scoped Neon S3 secret; generated/injected by Neon, never commit or expose to browser code |
| `AWS_ENDPOINT_URL_S3` | No | Local/preview/demo only when Neon Object Storage is provisioned | Branch-specific S3 endpoint supplied by Neon; the S3 client must use path-style addressing |
| `AWS_REGION` | No | Local/preview/demo only when Neon Object Storage is provisioned | Region supplied by Neon; verify the project's region supports Object Storage |
| `PAYMENT_MODE` | No | All | Allow only `fake` or `stripe_test`; no live value exists |
| `STRIPE_SECRET_KEY` | Yes | Focused local/preview/demo | Must be a sandbox/test or restricted-test key; live prefixes fail validation |
| `STRIPE_WEBHOOK_SECRET` | Yes | Focused local/preview/demo | Separate signing secret per webhook endpoint/environment |
| `RESEND_API_KEY` | Yes | Preview/demo only when application email is active | Optional sending-only/domain-restricted key; not needed for Neon Auth email |
| `EMAIL_FROM` | No | Preview/demo when application email is active | Verified sender identity; demo-safe value |
| `CRON_SECRET` | Yes | Demo if scheduled cleanup exists | Protects the reservation-cleanup route |
| `APP_BASE_URL` | No | All | Canonical links and redirects; must match trusted origin policy |

Stripe-hosted Checkout does not require a browser publishable key for the initial redirect flow. Add one only if the selected Stripe presentation actually uses client-side Stripe components.

## Rotation and incident procedure

1. Create a replacement credential with equal or narrower scope.
2. Update the correct Vercel/GitHub/local environment without printing the value.
3. Redeploy and run the dependent smoke check.
4. Revoke the old credential.
5. Record the date, affected service, and validation result without recording the secret.

If a value enters Git or chat, treat it as compromised immediately. Revoke/rotate it first; removing the text later is not remediation.

## Access readiness gate

- [ ] Required accounts have named owners and MFA/passkeys.
- [ ] Vercel is connected to GitHub without a broad personal deployment token.
- [ ] Neon preview and public-demo credentials/data are isolated.
- [ ] Neon Auth is enabled on the intended AWS project/branches; Auth is not combined with incompatible IP Allow or Private Networking settings.
- [ ] Each deployed origin is trusted in Neon and each environment has its own cookie secret.
- [ ] If runtime file storage is in the active slice, confirm Object Storage region availability, declare the minimal bucket set, and verify branch isolation. Otherwise keep images in app static assets and leave `AWS_*` values unset.
- [ ] Stripe is sandbox-only and live credentials are technically rejected.
- [ ] `.env.example`, ignore rules, and executable environment validation exist before secrets are introduced.
- [ ] Deployed secrets use write-only/sensitive storage and least privilege.
- [ ] No external credential is added until its slice needs it.
- [ ] Rotation and collaborator removal are possible without code changes.

## Primary guidance

- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Vercel sensitive environment variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables)
- [Neon preview branches with Vercel](https://neon.com/blog/neon-vercel-native-integration)
- [Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Neon Auth overview](https://neon.com/docs/auth/overview)
- [Neon Auth production checklist](https://neon.com/docs/auth/production-checklist)
- [Neon Object Storage](https://neon.com/docs/storage/overview)
- [Neon Object Storage S3 compatibility](https://neon.com/docs/storage/s3-compatibility)
- [Stripe API-key authentication](https://docs.stripe.com/api/authentication)
- [Stripe testing](https://docs.stripe.com/testing)
- [Resend API-key permissions](https://resend.com/changelog/new-api-key-permissions)
