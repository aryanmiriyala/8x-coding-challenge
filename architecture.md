# Technical Architecture

Status: Living architecture hypothesis
Product contract: `intent.md` and `spec.md`

## How to use this architecture

This is the current technical direction, not a promise to keep every tool or boundary. The stable parts should be system qualities and commerce invariants: server-authoritative totals, owned-resource authorization, transactional inventory/order changes, idempotent payment handling, and accessible user journeys. Frameworks and providers are replaceable hypotheses.

Before implementing a slice, confirm only the decisions that slice needs. Use a short record in `docs/decisions/` when alternatives have meaningful tradeoffs. Prefer reversible choices early, measure the result, and update this document when reality differs.

Concrete P0 contracts are maintained in `docs/api-contracts.md`, `docs/database-design.md`, `docs/service-access.md`, and `docs/deployment-strategy.md`. This file explains the system shape; those files prevent implementation from inventing boundary details.

## 1. Architecture hypothesis

The chosen deployment shape is a **lightweight modular monolith**: one Next.js application, one Neon PostgreSQL database with Managed Better Auth, and only the external providers required to demonstrate a feature safely (Stripe test mode and later application email). It gives us transactional correctness and strong server-side authorization without pretending this clone needs Amazon's infrastructure.

Microservices are out of scope. “Modules” mean ordinary folders and boundaries inside one application, not independently deployed services. Catalog, cart, inventory, checkout, and orders are easier to keep correct with local database transactions.

```text
Browser
   |
   | HTTPS
   v
Next.js application
   |-- Server-rendered storefront
   |-- Route handlers / Server Functions
   |-- Authentication and authorization layer
   |-- Small domain modules
   |     catalog | cart | checkout | orders | auth
   |-- Thin provider boundaries
   |     Stripe test payments | email
   |
   +------ PostgreSQL (source of truth)
   +------ Stripe test mode (payment UI + events)
   +------ Email provider (verification/recovery)
```

That is the entire baseline topology. Product images ship as approved static assets. PostgreSQL handles the small catalog's search. Framework/host logging is sufficient initially. No Redis, queue, event bus, separate search service, object-storage upload pipeline, or telemetry cluster is part of the first build.

## 2. Working stack hypotheses

| Layer | Current preference | Confidence / revisit trigger |
| --- | --- | --- |
| Runtime | Node.js 24 LTS-compatible target | Medium; confirm framework/auth/ORM compatibility at scaffold time |
| Web | Next.js 16 App Router + React 19 + strict TypeScript | Medium-high; revisit only if a required commerce/auth path is materially harder |
| Styling | Tailwind CSS + semantic CSS variables | Medium; validate speed, consistency, and accessibility in the shell slice |
| Accessible primitives | Radix UI or equivalent headless primitives | Medium; choose per-component and avoid an unnecessary dependency if native HTML is enough |
| Validation | Zod at external boundaries | High, though an equivalent schema library is acceptable if the scaffold already standardizes on it |
| Database | PostgreSQL | High because commerce transactions and constraints are central |
| ORM/migrations | Prisma ORM 8 | Medium; run a locking/migration spike before committing inventory logic |
| Authentication | Neon Auth (Managed Better Auth) via `@neondatabase/auth` | Trial; enabled by the owner, then verify Next.js proxy, email/password lifecycle, branch isolation, and protected operations in Slice 0 |
| Payments | Stripe Checkout Sessions in test mode | High for provider; hosted versus embedded remains an experiment |
| Rate limiting | Auth-library/host capability or a simple application mechanism | Medium; use the lightest option that fits the actual preview topology; no Redis by default |
| Email | Neon-managed auth email; provider adapter later for order messages | Medium for auth; custom SMTP is required before a production-like auth release, while Resend remains optional for application mail |
| Testing | Vitest + Testing Library + Playwright + axe | Medium-high; exact split should follow test value and runtime cost |
| Observability | Structured redacted logs and framework error handling | High for the clone; no tracing platform unless debugging evidence calls for it |
| Deployment | Vercel application + directly owned Neon PostgreSQL integration | Trial; validate pooled Prisma connections, preview branches, migrations, region, and cost in Slice 0; Railway is the fallback |

Version numbers will be pinned from the package registry at scaffold time and recorded in the lockfile. The architecture does not use floating `latest` versions after initialization.

## 3. Repository shape

```text
app/
  (store)/                 # public shopping routes/layout
  (auth)/                  # sign-in/up/recovery routes
  account/                 # authenticated customer routes
  admin/                   # small role-protected order-operations route; catalog UI only if needed
  api/
    auth/[...path]/
    stripe/webhook/
  actions/                 # thin mutation entry points
components/
  ui/                      # accessible primitives
  commerce/                # product/cart/price components
  layout/
modules/                    # folders, not services; add only when used
  {auth,catalog,cart,checkout,orders}/
    domain.ts              # pure types/rules/state transitions
    schemas.ts             # boundary validation
    repository.ts          # focused persistence functions
    service.ts             # use cases, transactions, authorization calls
lib/
  db/
  auth/
  security/
  money/
  providers/
prisma/
  schema.prisma
  migrations/
  seed.ts
tests/
  unit/
  integration/
  e2e/
```

Rules:

- Pages and route handlers call services; they do not contain business rules or arbitrary ORM queries.
- Client Components receive minimal serializable DTOs. Database records and secrets never cross the React server/client boundary directly.
- Domain modules may depend on shared primitives, not on UI. Keep the number of modules small; add one only for an active use case.
- Provider SDK calls live in small server-only files so tests stay deterministic. Do not build an elaborate adapter framework.

## 4. Request and trust boundaries

```text
Untrusted: browser input, cookies, URL params, Server Function args,
           webhook bodies, provider callbacks, imported seed/catalog data
                     |
                     v
Validate shape -> authenticate -> authorize action/resource -> execute use case
                     |
                     v
DB transaction / small provider integration -> minimal DTO -> render or JSON response
```

Every mutation follows this order:

1. Parse and normalize input.
2. Verify the current session where required.
3. Authorize the action and resource ownership in the data-access/service layer.
4. Re-read authoritative price/inventory/state.
5. Execute a transaction and enforce database constraints.
6. Record a safe audit/log event without secrets or unnecessary PII.
7. Return the minimum safe DTO.

Next.js Proxy is used only for cheap, optimistic routing decisions such as redirecting an obviously anonymous request away from `/account`. It must not query the database on every static/prefetch request and must not replace secure checks inside services, Server Functions, or route handlers.

## 5. Data model

This is a domain map, not a mandate to create every table up front. A slice adds only the entities and constraints it exercises. P1/P2 concepts such as reviews, wishlists, two-factor credentials, and shipment detail remain sketches until their use cases enter the active build.

`docs/database-design.md` is the authoritative P0 table/constraint/transaction contract. If this conceptual map differs, the active P0 contract wins and this file must be reconciled during convergence.

Primary IDs are opaque native PostgreSQL UUID values. Public product URLs use unique slugs; order numbers use separate random human-readable identifiers. Money is stored as integer minor units plus ISO currency.

### Identity and access

```text
User 1---* Session
User 1---* Account/AuthIdentity
User 1---* VerificationToken / TwoFactorCredential
User 1---* Address
User 1---* AuditLog (actor, when present)
```

`User.role` begins with `CUSTOMER | ADMIN`. If seller capabilities are added, use explicit memberships/permissions rather than accumulating booleans.

### Catalog and commerce

```text
Category 1---* ProductCategory *---1 Product
Product 1---* ProductImage
Product 1---* ProductVariant (SKU)
ProductVariant 1---* VariantAttribute
ProductVariant 1---* Offer *---1 Seller
Offer 1---1 Inventory
Product 1---* Review *---1 User
```

Important separation:

- Product content is shared catalog truth.
- Variant identifies what the item is.
- Offer identifies who sells it, for how much, in what condition, and how it is fulfilled.
- Inventory belongs to the offer, not the product.

The first release seeds one platform seller, but all purchase records reference `offerId` so a second seller does not require a cart/order rewrite.

### Cart, list, order, and fulfillment

```text
Cart 1---* CartItem *---1 Offer
User 1---* Wishlist 1---* WishlistItem *---1 Product
User 1---* Order 1---* OrderItem
Order 1---* Payment
Order 1---* Shipment 1---* ShipmentItem *---1 OrderItem
Order 1---* InventoryReservation
```

Constraints and snapshots:

- One open customer cart per currency; one guest cart per signed guest identifier.
- Unique `(cartId, offerId)` prevents duplicate lines.
- Inventory maintains non-negative `available` and `reserved` quantities; updates are atomic.
- `OrderItem` snapshots product/variant/offer title, SKU, seller, image, unit price, discount, tax basis, and quantity.
- `Order` snapshots the shipping address and totals. Editing the address book never mutates history.
- Provider event IDs and checkout idempotency keys are unique.
- If reviews enter scope, unique `(userId, productId)` supports the initial one-review policy.

## 6. Database strategy

- PostgreSQL is the only source of truth for users, catalog, carts, inventory, orders, and payment reconciliation.
- Foreign keys, unique indexes, checks, and enums enforce invariants in addition to application validation.
- Transactions protect cart merge, reservation, order creation, webhook reconciliation, cancellation, and inventory release.
- Use optimistic version columns for cart/order UI conflicts and explicit row locking/raw SQL for inventory reservation if ORM primitives are insufficient.
- Apply migrations forward in CI and production; never use schema push as the production deployment mechanism.
- Seed is idempotent and creates deterministic categories, products, offers, stock states, users, and example orders.
- Backups and point-in-time recovery are mandatory before live money or user data.

Candidate indexes, added with the slice that uses them:

- Product status/created date; unique slug.
- Category parent/slug; product-category join keys.
- Variant product/SKU; offer variant/status/price.
- Inventory offer.
- Cart owner/status and item cart/offer.
- Order user/created date and unique order number.
- Payment provider reference and webhook event provider ID.
- Review product/status/created date and user/product unique key, only if reviews are implemented.

## 7. Search architecture

P0 uses PostgreSQL full-text search plus `pg_trgm` similarity over a denormalized search document containing title, brand, category names, and keywords. A focused server-side search function owns this query.

```text
query -> normalize -> validate filters/sort -> ranked DB query -> product-card DTOs
```

Why this first:

- The seeded catalog is small.
- Search remains transactionally close to active offer/inventory state.
- It avoids operating Elasticsearch/OpenSearch during a 24-hour build.

For this clone, PostgreSQL search is expected to remain sufficient. A dedicated search service is not planned. If a later expansion materially changes catalog size or search requirements, that expansion can make a fresh decision instead of carrying unused infrastructure now.

## 8. Authentication and authorization

Neon Auth owns credential hashing, verification/reset tokens, and sessions in the branch-local `neon_auth` schema. The Next.js app uses Neon's managed wrapper rather than a parallel self-hosted Better Auth server. Configuration requirements:

- Database-backed, revocable sessions.
- Secure, HttpOnly, SameSite cookies in production.
- Verified email before checkout and other high-value mutations.
- Generic registration/recovery responses to reduce enumeration.
- Session rotation/revocation according to the managed provider contract after password or security changes.
- Normalized email uniqueness and safe redirect allowlist.
- Practical rate limits at IP and normalized-identity scopes using the selected auth/hosting capabilities; do not add a separate data service merely for theoretical scale.

Each Neon branch has a distinct Auth URL. `NEON_AUTH_BASE_URL` identifies that endpoint; `NEON_AUTH_COOKIE_SECRET` is an application-managed, environment-specific secret used for cached session cookies. Trusted production and preview origins must be registered with Neon before use. Managed Auth currently covers P0 email/password, verification, recovery, session, and supported social-login needs. MFA, passkeys, SSO, custom claims, or unsupported plugins trigger a new decision rather than an accidental second auth system.

Authorization lives in server-only functions such as:

```text
requireUser()
requireVerifiedUser()
requireRole('ADMIN')
requireOwnedAddress(userId, addressId)
requireOwnedOrder(userId, orderNumber)
```

Resource fetches should include ownership in the query predicate rather than fetching by ID and checking later. Client-side role checks control presentation only.

## 9. Cart and checkout consistency

### Guest/customer cart

- A guest receives a cryptographically random cart token in a signed HttpOnly cookie.
- The database stores only a hash/reference sufficient to resolve the cart.
- Sign-in merges within one transaction: sum matching quantities, cap to available/order limits, retain conflicts as customer-visible notices, then retire the guest cart.
- The server recalculates all commercial values on read and mutation.

### Checkout sequence

```text
Customer starts checkout
  -> validate verified session, address ownership, cart, offers, prices
  -> transaction:
       lock relevant inventory
       create PENDING_PAYMENT order snapshots
       create expiring inventory reservations
       record checkout idempotency key
  -> create Stripe Checkout Session with order ID metadata
  -> persist provider session reference
  -> redirect/embed provider UI

Stripe signed event arrives
  -> verify signature using raw body
  -> insert unique provider event record
  -> transaction:
       lock order
       validate amount/currency/reference
       transition payment and order exactly once
       convert reservation to sold inventory
       retire purchased cart lines
  -> acknowledge
```

The success redirect is advisory. Only a verified provider event can mark payment successful. A scheduled job releases reservations for expired sessions and reconciles stuck provider/order states.

## 10. Payment boundary

P0 uses a small server-only Stripe module for creating Checkout Sessions and verifying events. Retrieval, expiry, and refunds are added only when an implemented flow needs them; there is no generalized payment framework.

Rules:

- Stripe secret keys exist only on the server.
- Use a deterministic fake for most automated/local tests and Stripe test mode for the integrated demo.
- Environment validation accepts only test/sandbox credentials for this project and fails startup/deployment if a Stripe key has a live-mode prefix.
- Webhook reconciliation requires the verified event and referenced payment/session objects to report `livemode: false`; live-mode input is rejected and safely logged.
- Send Stripe an idempotency key derived from the stored checkout attempt.
- Store provider IDs, status, amount, currency, timestamps, and safe last-four/brand only if returned and useful. Never store PAN/CVC.
- Verify webhook signature and compare order ID, currency, and amount to local state.
- Persist event ID before processing so retries are no-ops.
- Log Stripe request IDs and local correlation IDs, not payload secrets.

Hosted Checkout is the recommended P0 choice because it is faster and reduces payment UI/security surface. Embedded Checkout can be reconsidered later without changing order semantics if visual fidelity becomes more important.

The storefront and confirmation surfaces must visibly say that checkout is a demo and no money is charged. Demo users use Stripe-provided test payment values, never real payment details.

## 11. Security hardening

### Application

- Strict TypeScript; Zod parsing for forms, params, query strings, webhooks after signature verification, and admin imports.
- Server-only modules for database, auth, and provider SDKs.
- No secrets in `NEXT_PUBLIC_*`; startup environment validation fails closed.
- Content Security Policy starts in report-only during integration, then enforcing before release.
- Security headers: HSTS in production, `nosniff`, strict referrer policy, restrictive permissions policy, and `frame-ancestors`/frame protection.
- Same-origin checks for custom mutations; safe CORS default is no cross-origin access.
- Rate limits by route risk. Search uses a higher burst than auth/checkout/admin.
- File uploads are P2; when added, inspect MIME/content, size-limit, randomize keys, and serve from a separate origin.

### Data

- Least-privilege application database user; migration credentials are separate.
- DTO allowlists prevent accidental exposure of password/session/token/address internals.
- PII is minimized, encrypted by provider/storage controls, redacted in logs, and omitted from analytics.
- Backups, restoration test, retention policy, and deletion/export workflow are required before production use.
- PostgreSQL row-level security is a future defense-in-depth option, not a substitute for application authorization. If enabled, requests must set trusted user context transactionally and tests must cover bypass roles.

### Supply chain and operations

- Committed lockfile, automated dependency/security scanning, secret scanning, protected production variables, and separated test/prod provider accounts.
- CI runs lint, typecheck, unit/integration tests, build, migration validation, and a small E2E smoke set.
- Admin bootstrap is an explicit one-time command/environment operation; public sign-up can never choose admin.

## 12. Caching and rendering

| Surface | Strategy |
| --- | --- |
| Category/PDP public content | Server render; bounded cache/revalidation by catalog tag |
| Price/availability | Dynamic or very short cache; always revalidated on mutation/checkout |
| Search results | Server render; URL-driven; optional short anonymous cache for common queries |
| Cart/account/orders/admin | Private dynamic response; never shared-cache |
| Static images/assets | CDN with content hashes and long immutable cache |

Catalog mutations invalidate affected product/category tags. Never cache authorization decisions or user-specific DTOs in a shared cache.

## 13. Minimal scheduled work

If required by the implemented checkout flow, one protected scheduled route or host scheduler may:

- Expire inventory reservations and pending checkouts.
- Reconcile stuck Stripe sessions/orders.

Email can be sent directly through the provider for the clone, with user-visible retry/recovery where appropriate. There is no queue, worker fleet, or outbox in the baseline. If a concrete correctness problem later requires durable asynchronous work, record that decision then.

## 14. Observability

- Generate or propagate a request correlation ID.
- Use structured logs with event name, safe entity IDs, duration, outcome, and provider request ID.
- Include the correlation/order/provider request IDs needed to debug checkout and webhook flows.
- Use the hosting platform's basic request/error visibility. A separate metrics, tracing, or alerting stack is outside the baseline.
- Provide a small health endpoint that checks the application and database without exposing secrets.

## 15. Test architecture

- Pure domain functions are unit-tested without Next.js or the database.
- Repository/service integration tests run against an isolated PostgreSQL schema/database and exercise real constraints/transactions.
- Payment/email/rate-limit integration modules have focused tests and deterministic fakes where useful.
- Stripe webhook fixtures are signed using a test secret; duplicate/out-of-order delivery is covered.
- Playwright owns only high-value browser journeys and runs with seeded state.
- Authorization is table-tested for anonymous, owner, other customer, admin, stale session, and unverified user.
- Accessibility checks combine axe with manual keyboard, zoom, screen-reader spot checks, and reduced motion.

## 16. Environments and deployment

The detailed living release plan is in `docs/deployment-strategy.md`. Provider choice remains reversible, but environment isolation, controlled migrations, validated secrets, health checks, and rollback evidence are requirements.

```text
local     -> local PostgreSQL, Stripe test or deterministic fake, captured email
preview   -> isolated database/namespace, Stripe test, non-delivering email domain
public demo-> managed PostgreSQL, Stripe test, provider secrets, host logs
```

Deployment order:

1. Validate environment and migration compatibility.
2. Apply additive/backward-compatible migration.
3. Deploy application.
4. Run smoke/readiness checks.
5. Enable destructive cleanup only in a later migration after old code is gone.

Rollback application independently when the schema remains backward compatible. Payment webhooks continue to be accepted during partial degradation and are safe to retry.

## 17. Evolving build sequence

No product slice begins until its intent, examples, risks, and verification are clear enough to learn safely. The full backlog does not need to be frozen first.

1. Scaffold, quality gates, environment validation, database, and seed.
2. Design tokens, accessible shell, responsive navigation.
3. Catalog/search/category/PDP read path.
4. Auth lifecycle and ownership/role authorization primitives.
5. Guest/customer cart and merge.
6. Addresses, checkout order snapshots, inventory reservations.
7. Stripe test integration and idempotent webhook reconciliation.
8. Orders/account and admin fulfillment controls.
9. Security headers, limits, observability, accessibility/performance pass.
10. P1 only after the P0 acceptance suite is green.

## 18. Deliberate infrastructure non-goals

The first build will not contain microservices, a message broker, event bus, search cluster, distributed cache, multi-region database, ML recommendations, upload processing, live tax/carrier integrations, seller payouts, or production payment mode. If the project later becomes a real commerce business, those needs should be designed from evidence in a new phase rather than preloaded into the clone.

## 19. Referenced implementation guidance

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js authentication and authorization guidance](https://nextjs.org/docs/app/guides/authentication)
- [Next.js security headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers)
- [Neon Auth overview](https://neon.com/docs/auth/overview)
- [Neon Auth Next.js quickstart](https://neon.com/docs/auth/quick-start/nextjs-api-only)
- [Prisma with Next.js and PostgreSQL](https://docs.prisma.io/docs/guides/frameworks/nextjs)
- [PostgreSQL row security](https://www.postgresql.org/docs/18/ddl-rowsecurity.html)
- [Stripe Checkout quickstarts](https://docs.stripe.com/payments/checkout/quickstarts)
- [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [Stripe webhook endpoints](https://docs.stripe.com/api/webhook_endpoints)

## 20. Architecture review checklist

- [ ] The next slice has enough architecture to proceed safely and no more infrastructure than it needs.
- [ ] Important alternatives and reversibility are visible.
- [ ] Product/variant/offer/inventory separation is still useful without growing into a generic commerce platform.
- [ ] Auth and checkout assumptions are validated before those slices begin.
- [ ] Provider decisions are made only when required or intentionally deferred.
- [ ] Current priorities in `spec.md` match what we intend to learn next.
- [ ] Manual Amazon screenshot/authenticated-flow validation has an owner and timing before visual lock.
- [ ] Evidence from the completed slice has been folded back into docs and decisions.
