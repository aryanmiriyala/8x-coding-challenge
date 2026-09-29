# Neon/Vercel Integration Smoke Check

Status: Partial; provider checks refreshed 2026-09-29 after Vercel env refresh
Scope: Existing Neon Free project `8x-amazon-clone` and personal Vercel Hobby project `8x-coding-challenge` only

## Results

| Check | Evidence | Result |
| --- | --- | --- |
| Exact project/branch | Neon CLI lists default `production` and a new `vercel-dev` branch | Pass; branch separation now exists |
| Local pooled/direct URLs | Parsed ignored `.env.local` without printing values; pooled host has `-pooler`, direct host does not, and both now target the `vercel-dev` endpoint | Pass for local development branch targeting |
| Database connectivity | `neon inspect db table-sizes --project-id ... --branch production --role-name neondb_owner` returned only managed `neon_auth` table sizes | Pass, read-only; no app schema exists |
| Managed Auth | `neon neon-auth status` reports `better_auth`; configured JWKS endpoint returned HTTP 200 and one public key | Pass for provider reachability; sign-up/session flow not yet tested |
| Managed Auth on `vercel-dev` | Empty cloned `neon_auth` schema was dropped on `vercel-dev` only, then Managed Better Auth was provisioned with `auth_provider=better_auth`; status reports a branch Auth base URL and JWKS returned HTTP 200 with one key | Pass for provider reachability; sign-up/session flow not yet tested |
| Optional Data API | `neon data-api get` reports active on `public` | Pass for status only; P0 does not use it |
| Optional Data API on `vercel-dev` | `neon data-api get --branch vercel-dev --database neondb` reports active on `public` | Pass for status only; P0 does not use it |
| Local Data API env | Parsed ignored `.env.local` without printing values; `NEON_DATA_API_URL` now targets the `vercel-dev` `apirest` host | Pass for env correctness; P0 still does not use the Data API |
| Neon Object Storage | Created `catalog-assets` (`public_read`) and `private-uploads` (`private`) on `production` and `vercel-dev`; `neon buckets list` verified both branches; local `vercel-dev` put/head/delete smoke passed for both buckets | Pass |
| GitHub to Vercel | Deployment metadata references this repository's `main` | Pass for source linkage |
| Vercel production deploy | Two listed deployments are `ERROR`; latest build says `No Next.js version detected` | Fail as an app smoke; expected while repository is documentation-only |
| Neon database envs in Vercel | `vercel env ls` lists `DATABASE_URL` and `DATABASE_URL_UNPOOLED` for Development and Production; temp env pulls show Development targets `ep-cool-shape...` and Production targets `ep-autumn-rain...` | Pass for database env injection and branch targeting |
| Neon Auth/storage envs in Vercel | Vercel Development and Production envs were refreshed after credential rotation. Temp pulls show branch-correct DB/Auth/Data API/storage hosts; Production secret values return `[SENSITIVE]` placeholders as expected | Pass for variable presence and branch targeting; runtime app smoke still blocked by missing scaffold |
| Vercel marketplace installation list | `vercel integration installations --scope aryans-projects-4cd8154d` reports no marketplace installations | Observation only; database env injection exists despite no marketplace installation being listed |

No app schema, Auth users, provider links, or deployments were created or changed by these checks. Provider mutations were limited to the verified existing Neon project/branches and Vercel Hobby project: Object Storage bucket creation, `vercel-dev` Auth provisioning, removing the empty cloned `neon_auth` schema on `vercel-dev`, rotating the `vercel-dev` owner-role password after a dev connection string exposure, rotating the production owner-role password after a stale production DB URL exposure, and refreshing Vercel Development/Production env vars. The ignored local file was updated without committing secret values. Test output intentionally excludes current credentials and full connection strings.

## Next flexible gate

1. Register the deployed origins as trusted Neon Auth domains once the app URLs exist.
2. After the owner authorizes Slice 0 and an application skeleton exists, run a healthy preview build, database-readiness check, Neon Auth lifecycle test, and branch-isolation test. The current documentation-only Vercel deployment cannot prove runtime integration.

## Guidance

- [Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Neon branching](https://neon.com/docs/introduction/branching)
- [Neon/Vercel preview integration](https://neon.com/blog/neon-vercel-native-integration)
- [Neon Object Storage](https://neon.com/blog/building-neon-object-storage)
