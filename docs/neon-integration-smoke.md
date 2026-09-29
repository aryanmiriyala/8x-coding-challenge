# Neon/Vercel Integration Smoke Check

Status: Partial; provider checks refreshed 2026-09-29
Scope: Existing Neon Free project `8x-amazon-clone` and personal Vercel Hobby project `8x-coding-challenge` only

## Results

| Check | Evidence | Result |
| --- | --- | --- |
| Exact project/branch | Neon CLI lists default `production` and a new `vercel-dev` branch | Pass; branch separation now exists |
| Local pooled/direct URLs | Parsed ignored `.env.local` without printing values; pooled host has `-pooler`, direct host does not, but both still point at `production` | Pass for shape; fail for safe local development because local config still targets production |
| Database connectivity | `neon inspect db table-sizes --project-id ... --branch production --role-name neondb_owner` returned only managed `neon_auth` table sizes | Pass, read-only; no app schema exists |
| Managed Auth | `neon neon-auth status` reports `better_auth`; configured JWKS endpoint returned HTTP 200 and one public key | Pass for provider reachability; sign-up/session flow not yet tested |
| Managed Auth on `vercel-dev` | `neon neon-auth status --branch vercel-dev` reported Auth is not configured for this branch | Fail for branch-complete dev/preview Auth |
| Optional Data API | `neon data-api get` reports active on `public` | Pass for status only; P0 does not use it |
| Optional Data API on `vercel-dev` | `neon data-api get --branch vercel-dev --database neondb` reports active on `public` | Pass for status only; P0 does not use it |
| Local Data API env | Parsed ignored `.env.local` without printing values; `NEON_DATA_API_URL` is set, but the host currently contains `neonauth` while CLI Data API endpoints contain `apirest` | Fail for env correctness; P0 still does not use the Data API |
| Neon Object Storage | Created `catalog-assets` (`public_read`) and `private-uploads` (`private`) on `production` and `vercel-dev`; `neon buckets list` verified both branches | Pass for bucket provisioning; object upload/read not yet tested |
| GitHub to Vercel | Deployment metadata references this repository's `main` | Pass for source linkage |
| Vercel production deploy | Two listed deployments are `ERROR`; latest build says `No Next.js version detected` | Fail as an app smoke; expected while repository is documentation-only |
| Neon database envs in Vercel | `vercel env ls` lists `DATABASE_URL` and `DATABASE_URL_UNPOOLED` for Development and Production; temp env pulls show Development targets `ep-cool-shape...` and Production targets `ep-autumn-rain...` | Pass for database env injection and branch targeting |
| Neon Auth/storage envs in Vercel | Temp Vercel env pulls show no `NEON_AUTH_BASE_URL`, `NEON_AUTH_URL`, `AWS_ENDPOINT_URL_S3`, or `NEON_DATA_API_URL` in Development or Production | Fail for Auth/storage runtime configuration |
| Vercel marketplace installation list | `vercel integration installations --scope aryans-projects-4cd8154d` reports no marketplace installations | Observation only; database env injection exists despite no marketplace installation being listed |

No database rows/schema, Auth users, provider links, Vercel settings, or deployments were created or changed by these checks. The only provider mutation was explicit owner-requested Neon Object Storage bucket creation on the verified existing project/branches. The ignored local file was read only. Test output intentionally excludes credentials and full connection strings.

## Next flexible gate

1. Decide whether `vercel-dev` is the local/preview development branch. If yes, update local ignored env values to target it before any write, without overwriting owner-provided secrets blindly.
2. Configure Neon Auth for the branch that will run local/preview auth, then expose the branch-specific Auth base URL to local and Vercel environments.
3. Add a distinct 256-bit `NEON_AUTH_COOKIE_SECRET` per environment in local/Vercel secret storage; do not reuse the production value.
4. If the Data API becomes an active experiment, correct `NEON_DATA_API_URL` to the branch `apirest` URL first; otherwise leave it unused.
5. Leave Object Storage object writes deferred unless the first slice needs runtime files. If it becomes active, inject branch-specific storage envs into local/Vercel and test upload/read/delete on the intended branch.
6. After the owner authorizes Slice 0 and an application skeleton exists, run a healthy preview build, database-readiness check, Neon Auth lifecycle test, and branch-isolation test. The current documentation-only Vercel deployment cannot prove runtime integration.

## Guidance

- [Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Neon branching](https://neon.com/docs/introduction/branching)
- [Neon/Vercel preview integration](https://neon.com/blog/neon-vercel-native-integration)
- [Neon Object Storage](https://neon.com/blog/building-neon-object-storage)
