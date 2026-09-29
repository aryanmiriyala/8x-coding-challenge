# ADR-004: Trial Vercel with directly owned Neon PostgreSQL

Status: trial
Date: 2026-09-29
Decision needed by: Slice 0 preview deployment

## Context and problem

The Next.js clone needs fast preview deployment, managed PostgreSQL, isolated preview data, secure environment configuration, and a simple rollback path without adding infrastructure operations.

## Decision outcome

Trial Vercel for the one Next.js application and a directly owned Neon PostgreSQL project connected through Neon's Vercel integration. Use pooled application connections and isolated Neon branches for previews. Keep database ownership independent from the application host.

Railway is the fallback because it can host Next.js and PostgreSQL together with an explicit pre-deploy migration step if the Vercel/Neon serverless model causes avoidable friction.

## Validation criteria

- Pinned runtime/framework builds on Vercel.
- Prisma connects through Neon pooling for application traffic and a direct URL for migrations; transaction/inventory spikes pass.
- Preview deployments receive isolated database branches and cannot mutate public-demo data.
- Migrations run through one controlled step and application rollback remains possible.
- Neon Auth URLs/cookies/trusted domains, Stripe sandbox webhooks, health checks, regions, and cost controls behave as documented.

## Consequences

- We get first-class Next.js previews without building a deployment platform.
- Database and application remain separate managed services but one application topology.
- Credentials and branch lifecycle should come from the integration where possible.
- Failure of the validation criteria triggers a bounded Railway comparison, not a multi-provider survey.

## Links

- `docs/deployment-strategy.md`
- `docs/service-access.md`
- [Vercel deployments](https://vercel.com/docs/deployments/overview)
- [Vercel Postgres integrations](https://vercel.com/docs/postgres)
- [Neon preview branches with Vercel](https://neon.com/blog/neon-vercel-native-integration)
- [Railway Next.js and PostgreSQL guide](https://docs.railway.com/guides/nextjs)
