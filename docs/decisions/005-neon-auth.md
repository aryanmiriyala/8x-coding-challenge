# ADR-005: Use Neon Auth for P0 identity

Status: trial
Date: 2026-09-29
Decision needed by: Slice 0 auth spike

## Context and problem

The clone needs real registration, verification, recovery, revocable sessions, and protected customer/admin actions without maintaining a second auth service. The owner has enabled Neon Auth on the project. Identity should remain testable in isolated preview branches and authorization must stay explicit in application use cases.

## Decision outcome

Use Neon Auth (Managed Better Auth) through `@neondatabase/auth` for P0 identity. Keep users, sessions, accounts, and verification data in Neon's managed `neon_auth` schema. Proxy the managed handler through the Next.js application and use the server session as identity input to application authorization.

Do not install or configure a parallel Clerk, Auth.js, or self-managed Better Auth service. Keep commerce roles and ownership rules explicit in application code and app-owned tables; authentication does not grant resource access by itself.

## Validation criteria

- Sign-up, verification, sign-in, sign-out, recovery, and session restoration work through custom Aster Market pages.
- Direct unauthenticated requests to protected operations fail even if routing middleware is bypassed.
- Cross-user address, cart, and order access is denied by server-side ownership predicates.
- `NEON_AUTH_BASE_URL` follows the active Neon branch and trusted local/preview/demo origins are registered.
- `NEON_AUTH_COOKIE_SECRET` is unique per deployed environment, stored outside Git, and produces secure cookies on HTTPS.
- Preview auth users/sessions are isolated from the public-demo branch.
- Managed auth email is sufficient for development; custom SMTP is configured before any production-like release.

## Revisit triggers

Reconsider the managed service only if an active requirement needs an unsupported capability such as MFA, passkeys, SSO, custom JWT claims, or a custom Better Auth plugin. A future need is not enough to add a second provider now.

## Consequences

- Identity branches with the database and needs no separately hosted auth server.
- The app must use Neon's wrapper, callback proxy, middleware/proxy behavior, and environment contract rather than generic Better Auth snippets.
- Neon Auth authenticates the actor; application services still authorize each action and owned resource.
- The managed plugin surface is intentionally narrower than unrestricted self-hosted Better Auth.

## Links

- `architecture.md`
- `docs/security-model.md`
- `docs/service-access.md`
- [Neon Auth overview](https://neon.com/docs/auth/overview)
- [Neon Auth Next.js quickstart](https://neon.com/docs/auth/quick-start/nextjs-api-only)
- [Neon Auth production checklist](https://neon.com/docs/auth/production-checklist)
