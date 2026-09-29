# Development Start Prompt

Status: Draft handoff prompt
Last updated: 2026-09-29

Use this prompt to start the implementation chat after the owner explicitly authorizes Slice 0. Keep the project in Discovery until that authorization happens.

```text
We are building Aster Market, a lightweight Amazon.com-inspired physical-goods retail storefront. The repo is /Users/aryanmiriyala/Desktop/Personal-Projects/8x-coding-challenge.

Before making changes, read AGENTS.md and docs/project-status.md. The current rule is: while phase is Discovery, do not scaffold, install dependencies, create database objects, or implement product code unless I explicitly advance the project into implementation. Use tiny, single-purpose local commits. Push main only after a substantial coherent batch is complete and reviewed.

Core direction:
- One Next.js app on Vercel, not microservices.
- Neon provides PostgreSQL, Managed Better Auth, and later Neon Object Storage.
- P0 checkout is simulated and no-money. Do not add Stripe, a card form, payment SDK, payment keys, or payment webhooks.
- PostgreSQL is the transactional source of truth. Server code rechecks identity, ownership, prices, inventory, and state transitions.
- Product, variant, offer, and inventory are separate concepts.
- Order items and addresses are snapshotted at order creation.
- Browser-supplied prices, totals, roles, payment results, and verification state are never authoritative.

Current provider evidence:
- Existing Neon project: 8x-amazon-clone, project ID late-union-80394914, Free plan.
- Existing Vercel Hobby project: 8x-coding-challenge in scope aryans-projects-4cd8154d.
- Vercel GitHub link exists, but deployments fail because the repo intentionally has no app scaffold yet.
- Neon branches: production and vercel-dev.
- Local .env.local targets vercel-dev for database, Neon Auth, Data API, and Neon Object Storage.
- Neon Auth is configured on production and vercel-dev. vercel-dev JWKS returned HTTP 200 with one key.
- Local NEON_DATA_API_URL uses the vercel-dev apirest host. P0 still does not use the Data API.
- Neon Object Storage buckets exist on production and vercel-dev: catalog-assets is public_read; private-uploads is private. Local vercel-dev put/head/delete smoke passed for both buckets.
- Vercel envs still need refresh before deployment, especially after vercel-dev owner-role rotation. Production owner-role rotation also needs explicit approval because a stale production DB URL was exposed in tool output.
- No Resend key is needed for P0. Keep application-owned email in capture mode unless a later slice explicitly chooses a provider.

First task for the implementation chat:
1. Confirm I explicitly authorize moving from Discovery to Slice planning/implementation.
2. Re-read intent.md, spec.md, architecture.md, docs/project-status.md, docs/pre-build-readiness.md, docs/service-access.md, docs/deployment-strategy.md, docs/database-design.md, docs/api-contracts.md, docs/use-cases.md, docs/traceability.md, docs/risks.md, and relevant ADRs only as needed.
3. Resolve the Slice 0 gate before product code:
   - Decide whether vercel-dev is the local/preview branch.
   - Refresh Vercel envs and trusted Auth origins before relying on deployed auth/storage.
   - Add distinct 256-bit NEON_AUTH_COOKIE_SECRET values to each deployed runtime environment.
   - Do not run migrations or seeds against production; local writes use vercel-dev.
4. Identify requirement/use-case IDs, examples, failure paths, verification commands, and first commit boundaries before scaffolding.
5. Then scaffold the smallest Next.js skeleton that proves runtime/build, env validation, health/readiness, and Neon connectivity without adding product breadth.
```
