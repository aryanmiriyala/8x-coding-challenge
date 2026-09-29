# Neon/Vercel Integration Smoke Check

Status: Partial; read-only checks completed 2026-09-29
Scope: Existing Neon Free project `8x-amazon-clone` and personal Vercel Hobby project `8x-coding-challenge` only

## Results

| Check | Evidence | Result |
| --- | --- | --- |
| Exact project/branch | Neon CLI lists one project and one default `production` branch; local pooled hostname matches its endpoint | Pass; local configuration currently targets production, so no development writes are safe |
| Pooled/direct URLs | Parsed ignored `.env.local` without printing values; pooled host has `-pooler`, direct host does not, database/user/endpoint match | Pass |
| Database connectivity | `neon inspect db table-sizes --project-id ... --branch production --role-name neondb_owner` returned only managed `neon_auth` table sizes | Pass, read-only; no app schema exists |
| Managed Auth | `neon neon-auth status` reports `better_auth`; configured JWKS endpoint returned HTTP 200 and one public key | Pass for provider reachability; sign-up/session flow not yet tested |
| Optional Data API | `neon data-api get` reports active on `public` | Pass for status only; P0 does not use it |
| Neon Object Storage | Neon-endpoint-only S3 `ListBuckets` with configured credentials succeeded | Pass for credential/endpoint reachability; zero buckets, so upload/read not yet tested |
| GitHub to Vercel | Deployment metadata references this repository's `main` | Pass for source linkage |
| Vercel production deploy | Two listed deployments are `ERROR`; latest build says `No Next.js version detected` | Fail as an app smoke; expected while repository is documentation-only |
| Neon to Vercel | `vercel env ls` lists zero variables and Hobby scope lists zero marketplace installations | Not connected; no preview branch or injected Auth/database configuration can be tested |

No database rows/schema, Auth users, buckets, provider links, Vercel settings, or deployments were created or changed by these checks. The ignored local file was read only. Test output intentionally excludes credentials and full connection strings.

## Next flexible gate

1. Connect the **existing Neon-owned** project to the verified personal Hobby Vercel project through Neon's existing-account/Connected Accounts flow. Do not use `vercel integration add neon`, which can provision a different Vercel-managed resource. Because this grants cross-service access and may accept terms, perform the consent step with the owner present.
2. Establish an isolated development branch before local writes; ensure local pooled/direct/Auth/storage URLs all target that branch. Preserve the current ignored file and do not pull over it blindly.
3. Inspect the injected Vercel variable **names and branch targets** without printing values. Verify Preview and Production isolation before any migration or seed.
4. After the owner authorizes Slice 0 and an application skeleton exists, run a healthy preview build, database-readiness check, Neon Auth lifecycle test, and branch-isolation test. The current documentation-only Vercel deployment cannot prove runtime integration.

## Guidance

- [Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Neon branching](https://neon.com/docs/introduction/branching)
- [Neon/Vercel preview integration](https://neon.com/blog/neon-vercel-native-integration)
