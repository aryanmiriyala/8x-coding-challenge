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

### Create only when the dependent slice starts

| Service | Needed when | Notes |
| --- | --- | --- |
| Payment provider | Not needed for P0 | Simulated checkout uses only the application database; any provider requires a later decision |
| Custom SMTP and/or application email provider | Production-like auth email or order email becomes active | Neon shared SMTP is sufficient for development auth codes. Configure custom SMTP before a production-like auth release; choose Resend or another provider only when application-owned messages become an active slice |
| Neon Object Storage | Runtime-managed catalog images, generated assets, or user uploads become an active use case | Selected S3-compatible store for this Neon-backed app because buckets and objects branch with PostgreSQL. Declare only required buckets through `neon.ts`; credentials are injected by Neon per branch |
| Domain registrar/DNS | We want branded public URLs and real email delivery | A `vercel.app` URL is sufficient for early previews; a controlled domain is useful before public auth email |

No separate hosted identity account is required: Neon Auth is Managed Better Auth. No hosted account is required for Prisma, Tailwind CSS, Zod, Vitest, Playwright, or axe.

## Human access

- Every person uses an individual account with MFA/passkey; never share passwords or recovery codes.
- Store recovery codes and original one-time secrets in a trusted password manager.
- Grant the smallest project role required and review collaborators before a public release.
- The project owner retains billing, domain, repository, database, and email-provider recovery access.
- Removing a collaborator also triggers review/rotation of credentials they could read.

## Application and automation access

Prefer this order:

1. Native service integration with scoped project access.
2. Short-lived identity/OIDC when a required workflow supports it cleanly.
3. Project-scoped or restricted API key.
4. Broad personal token only as a short-lived exception with an owner and removal date.

For this clone:

- GitHub connects to Vercel directly; CI should not need a personal Vercel token for normal deployments.
- The Neon/Vercel integration currently supplies environment-specific database configuration and creates an isolated Development database branch. Branch-specific Auth configuration still needs to be enabled and exposed before auth work starts.
- Use the existing Neon-owned Free project through the existing-account/Connected Accounts integration in the personal Vercel Hobby scope. Do not choose the flow that provisions a new Vercel-managed Neon account or resource. Verify the exact Vercel scope and Neon project before linking; never rely on CLI defaults.
- Application queries use pooled `DATABASE_URL`; migrations and administrative tasks use direct `DATABASE_URL_UNPOOLED`. Both must target the same branch. A Neon management API key is unnecessary unless we automate branch lifecycle outside the integration; if later needed, use a project-scoped key.
- Neon Auth supplies each branch's `NEON_AUTH_BASE_URL` once Auth is configured on that branch. The application supplies a unique `NEON_AUTH_COOKIE_SECRET`; trusted preview/demo origins are registered in Neon.
- An available `NEON_DATA_API_URL` is provider configuration, not a requirement for the P0 Next.js server path. Do not add browser database access without an explicit use case and tested row-level security policies.
- Neon Object Storage credentials alone do not create a bucket. The verified bucket set is `catalog-assets` (`public_read`) for catalog/merchandising media and `private-uploads` (`private`) for source/generated/admin files or future moderation queues. Before using either bucket from the app, confirm the storage endpoint targets the same branch as the database and run an upload/read/delete smoke test.
- No AWS account or AWS S3 bucket is part of this architecture. The `AWS_*` names are Neon-provided S3 protocol conventions. Storage clients must explicitly use the Neon branch endpoint and Neon-issued credentials, with no fallback to the AWS S3 default endpoint; executable configuration should reject a non-Neon storage endpoint when this integration becomes active.
- Next.js loads `.env.local` itself. A standalone Node script must load that file explicitly (for example, `node --env-file=.env.local script.mjs`); plain `dotenv/config` defaults to `.env`. Treat presigned object URLs as bearer credentials and do not print them to application or CI logs.
- No payment-provider account, key, SDK, or webhook is required for P0 (ADR-007).
- Custom SMTP or a later application email provider uses a sending-only, domain-restricted credential when enabled. No Resend account or key is required for P0.
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
- Use one isolated Neon development branch for local commerce and Managed Auth; use disposable branches for integration tests. Keep application email captured and other provider calls deterministic by default.
- `node scripts/configure-local-neon.mjs` maps the supplied pooled Neon connection into `DATABASE_URL`, derives the matching direct URL for `DATABASE_URL_UNPOOLED`, and fills only blank app-managed secrets with independent 256-bit random values. It does not generate provider-issued database, storage, or payment credentials and never prints values. Confirm the branch before running it.
- Do not add payment credentials to local or deployed environments for P0.
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
| `NEON_AUTH_COOKIE_SECRET` | Yes | Auth test/preview/demo | 32 random bytes (256 bits) for cached-session cookies; unique per environment and not injected by Neon |
| `NEON_DATA_API_URL` | No | Only if the Data API is enabled | Branch Data API endpoint; optional and unused by the P0 server-side data path |
| `AWS_ACCESS_KEY_ID` | Yes | Local/preview/demo only when Neon Object Storage is provisioned | Branch-scoped Neon S3 credential; generated/injected by Neon, keep in ignored local or managed environment storage |
| `AWS_SECRET_ACCESS_KEY` | Yes | Local/preview/demo only when Neon Object Storage is provisioned | Branch-scoped Neon S3 secret; generated/injected by Neon, never commit or expose to browser code |
| `AWS_ENDPOINT_URL_S3` | No | Local/preview/demo only when Neon Object Storage is provisioned | Branch-specific S3 endpoint supplied by Neon; the S3 client must use path-style addressing |
| `AWS_REGION` | No | Local/preview/demo only when Neon Object Storage is provisioned | Region supplied by Neon; verify the project's region supports Object Storage |
| `NEON_PUBLIC_ASSETS_BUCKET` | No | Local/preview/demo when catalog media uses Neon Object Storage | Public-read bucket name; current value is `catalog-assets` |
| `NEON_PRIVATE_UPLOADS_BUCKET` | No | Local/preview/demo when private uploads use Neon Object Storage | Private bucket name; current value is `private-uploads` |
| `EMAIL_FROM` | No | Preview/demo when application email is active | Verified sender identity; demo-safe value |
| `CRON_SECRET` | Yes | Only if a later active slice adds scheduled work | Independent 32-random-byte (256-bit) secret; a previously generated local value is dormant and P0 checkout needs no cron route |
| `APP_BASE_URL` | No | All | Canonical links and redirects; must match trusted origin policy |

P0 has no `PAYMENT_MODE`, Stripe variables, Resend key, or client-side payment configuration in the committed environment contract. Legacy ignored local values, if any, are not used by the planned application.

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
- [ ] If runtime file storage is in the active slice, confirm Object Storage region availability, create/declare the minimal bucket set, and verify branch isolation. If credentials are already present, they do not prove a bucket exists. Otherwise keep images in app static assets.
- [ ] The implemented demo has no card form, payment provider dependency, secret, or webhook; checkout is labeled simulated.
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
