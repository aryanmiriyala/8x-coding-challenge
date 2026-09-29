# API and Application Contracts

Status: Living P0 contract
Applies to: NAV, HOME, CAT, SEARCH, PDP, CART, AUTH, ACCT, CHECK, ORDER, ADMIN, DEPLOY requirements

## Decision

The clone is one Next.js application, so P0 will not build a second general-purpose REST or GraphQL backend for its own pages.

Neon's Data API may be enabled on the project and supply `NEON_DATA_API_URL`. P0 does not consume it: the application reads and mutates PostgreSQL from server-only use cases. A browser-facing Data API consumer would require a separate decision and verified row-level security policies.

- Server Components call server-only query/use-case functions directly.
- Same-origin forms and mutations use thin Server Actions that validate input and call the same use-case layer.
- Route Handlers exist only for genuine HTTP boundaries: the Neon Auth proxy, health/readiness, and a later autocomplete endpoint if it becomes active.
- Domain/use-case functions do not import React, Next.js request objects, or provider SDKs.

Server Actions remain remotely invocable POST boundaries. Each action authenticates, authorizes, validates, and returns a minimal DTO; being called from our own UI does not make it trusted.

## Layers and dependency direction

```text
Page / Component
  -> query function or Server Action
      -> use-case service
          -> repository / transaction
              -> PostgreSQL
          -> small provider integration when required
```

Route Handlers follow the same path. UI and HTTP adapters translate transport input/output only; they do not contain pricing, inventory, ownership, or state-transition rules.

## Shared contract conventions

### Input

- Zod schemas parse all `FormData`, JSON, query parameters, path parameters, cookies, and provider payloads after any required signature check.
- Unknown fields are stripped or rejected according to the boundary; security-sensitive and admin input is strict.
- Identifiers are opaque strings. The server never accepts a user ID, role, price, total, verification flag, or payment result as authority from the browser.
- Search arrays are bounded, strings are normalized, pagination has a maximum page size, and sort/filter values are allowlisted.

### Action result

Expected validation/business failures use a serializable discriminated result:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: {
        code: ErrorCode
        message: string
        fieldErrors?: Record<string, string[]>
        correlationId?: string
      }
    }
```

Unexpected failures are logged with a correlation ID and return a generic message. Stack traces, SQL, provider payloads, secrets, and existence-sensitive details never reach the client.

### Stable error codes

| Code | HTTP equivalent | Meaning |
| --- | ---: | --- |
| `VALIDATION_ERROR` | 400 | Input failed schema/business validation |
| `UNAUTHENTICATED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Authenticated but action is not allowed |
| `NOT_FOUND` | 404 | Missing or intentionally concealed resource |
| `CONFLICT` | 409 | Stale version, duplicate intent with changed input, or state conflict |
| `OUT_OF_STOCK` | 409 | Requested inventory is unavailable |
| `PRICE_CHANGED` | 409 | Current authoritative price differs and needs acknowledgment |
| `CART_EMPTY` | 409 | Checkout cannot begin |
| `EMAIL_UNVERIFIED` | 403 | Verified identity required for checkout |
| `INVALID_ORDER_STATE` | 409 | Requested transition is not allowed |
| `RATE_LIMITED` | 429 | Risk-appropriate limit exceeded |
| `DEPENDENCY_UNAVAILABLE` | 503 | Required provider/database temporarily unavailable |
| `INTERNAL_ERROR` | 500 | Non-disclosing unexpected failure |

### DTO rules

- Return explicit DTOs, never Prisma/database records.
- Use integer minor-unit money fields with currency, for example `{ amount: 1299, currency: "USD" }`.
- Dates cross the server/client boundary as ISO 8601 strings.
- Public catalog DTOs contain no draft/admin metadata.
- Cart/order DTOs contain only the current owner's required view and no auth/session/provider secrets.
- Provider errors are mapped to stable application codes and safe recovery text.

### Request metadata

- Generate or accept a safe request/correlation ID and return it as `X-Request-Id` on Route Handler responses.
- Incrementing or externally consequential mutations accept an unpredictable client request key or stored server attempt ID.
- Never log complete cookies, addresses, emails, reset tokens, API keys, or raw provider payloads.

## Server-side read contracts

These are functions, not public HTTP endpoints.

| Contract | Caller/access | Input | Output |
| --- | --- | --- | --- |
| `getHomePage()` | Public | Current locale/currency constants | Curated hero, categories, one product row |
| `searchCatalog(input)` | Public | Query, category, bounded filters, sort, page | `SearchPageDTO` with normalized state and pagination |
| `getCategoryPage(slug, input)` | Public | Category slug plus search controls | Category metadata and `SearchPageDTO` |
| `getProductPage(slug, selectedVariant?)` | Public | Product slug and optional valid variant | Product, media, attributes, variants, active offer/stock summary |
| `getCart()` | Guest/customer owner | Session or signed guest-cart cookie | Repriced `CartDTO`, notices, version |
| `getAccountHome()` | Customer | Session-derived user | Minimal account summary |
| `listAddresses()` | Customer | Session-derived user | Owned address summaries |
| `listOrders(page)` | Customer | Session-derived user, bounded page | Owned order summaries |
| `getOrder(orderNumber)` | Customer/admin use case | Session-derived actor plus opaque number | Owned order detail or concealed not-found |
| `getAdminOrders(input)` | Admin | Status filter and bounded page | Operational order summaries |

Public catalog queries return only active products and active offers. User-specific reads are dynamic/private and include ownership in the repository predicate.

## Server Action mutation contracts

Each exported action is a thin adapter over the named use case.

### Cart

| Use case | Input | Important behavior | Result |
| --- | --- | --- | --- |
| `addCartItem` | `offerId`, positive quantity, `idempotencyKey` | Resolve owner, validate active offer/current stock, deduplicate retry, upsert one line | Repriced `CartDTO` and notice |
| `setCartItemQuantity` | `cartItemId`, absolute quantity, `expectedCartVersion` | Owner predicate, optimistic conflict check, current stock cap; zero may remove | Repriced `CartDTO` |
| `removeCartItem` | `cartItemId`, `expectedCartVersion` | Owner predicate; repeated removal is a safe no-op | Repriced `CartDTO` |
| `mergeGuestCart` | Internal after successful sign-in | One transaction; merge by offer, cap conflicts, retire guest cart | Customer `CartDTO` plus conflict notices |

### Address and account

| Use case | Input | Important behavior | Result |
| --- | --- | --- | --- |
| `createAddress` | Recipient/address fields, optional default | Verified session, country/length validation, transactional default selection | `AddressDTO` |
| `updateAddress` | Owned address ID plus editable fields | Ownership in query; order snapshots unaffected | `AddressDTO` |
| `deleteAddress` | Owned address ID | Ownership; reject or choose replacement when checkout needs it | Success plus remaining default ID |
| `setDefaultAddress` | Owned address ID | One transaction leaves exactly one default | `AddressDTO` |
| `revokeSession` | Owned session ID | Cannot revoke another user's session | Success |
| `revokeOtherSessions` | Current session context | Keep or rotate current session per auth-library contract | Success |

Authentication registration, verification, sign-in, sign-out, recovery, and auth-email delivery are owned by Neon Auth. Application wrappers supply safe redirects, protected-use-case checks, rate-limit integration, and cart-merge hooks without reimplementing credential logic.

### Checkout and orders

| Use case | Input | Important behavior | Result |
| --- | --- | --- | --- |
| `placeDemoOrder` | Owned `addressId`, `idempotencyKey` | Verified user; reprice cart; atomically decrement inventory, create order/payment snapshots, consume purchased cart lines; deduplicate retries | Owned placed demo order number |
| `getCheckoutStatus` | Owned order number | Never trusts URL parameters; reads committed local state | Placed/not-found status DTO |
| `advanceOrderStatus` | Order number, target status, expected version | Admin role; allowed transition only; append audit/timeline event | Updated operational order DTO |

`placeDemoOrder` is one database transaction. The same customer/key/intent returns the same order, changed intent with the same key is a conflict, and an aborted transaction leaves stock/cart unchanged. Browser input never includes authoritative amounts or payment status.

## HTTP Route Handlers

| Method and path | Caller | Contract |
| --- | --- | --- |
| `GET/POST/PUT/DELETE/PATCH /api/auth/[...path]` | Browser/auth emails | `@neondatabase/auth` Next.js handler proxy with branch Auth URL, trusted origins, secure cookie cache, and safe redirect policy |
| `GET /api/health` | Host/smoke checks | `200 {"status":"ok"}` when app/database are ready; generic `503` otherwise; no config/version/query details |
| `GET /api/search/suggestions` | Public, P1 only | Bounded query, rate limit, active products/categories only, accessible combobox DTO |

There is no P0 payment webhook or reservation-cleanup route. Simulated checkout has no asynchronous provider state.

## Authorization matrix at the contract boundary

| Operation group | Guest | Customer | Admin |
| --- | --- | --- | --- |
| Catalog reads | Yes | Yes | Yes |
| Guest cart | Signed guest identifier | Own/merged cart | Own cart |
| Address/account/order read | No | Own rows only | Own rows unless explicitly using admin operation |
| Checkout | No | Verified user and owned cart/address | Same customer checkout rules |
| Catalog/order operations | No | No | Explicit role plus allowed transition |

Proxy/middleware may redirect for UX but is never the secure authorization layer.

## Cache behavior

- Home/category/PDP content may use bounded tag-based caching.
- Search state is URL-driven; price/availability is revalidated on cart and checkout mutations.
- Cart, account, address, checkout, order, and admin responses are private and not shared-cacheable.
- Mutations invalidate only affected catalog/cart/order tags or paths.
- Authorization decisions and session-derived DTOs are never stored in a shared cache.

## Versioning and documentation

P0 has no public third-party API consumer, so `/api/v1` and OpenAPI generation would be ceremony without value. TypeScript/Zod contracts, stable error codes, integration tests, and this document are the contract. If a mobile client, seller API, or external consumer becomes active, introduce an explicit versioned HTTP API and OpenAPI document through a new decision.

Any later payment-provider integration needs an explicit contract and decision; P0 has no provider API version.

## Contract verification

- Schema tests for valid, boundary, and unknown input.
- Authorization table tests for anonymous, owner, other customer, admin, stale session, and unverified user.
- Real PostgreSQL integration tests for ownership predicates, constraints, transactions, conflicts, and idempotency.
- Concurrent simulated checkout tests for one effect, changed-intent conflict, stock conflict, and rollback.
- HTTP tests for Origin/Host, cookies, headers, rate limits, and health disclosure.
- Playwright only for high-value customer/admin journeys.

## Primary guidance

- [Next.js forms and Server Actions](https://nextjs.org/docs/app/guides/forms)
- [Next.js authentication and data-access guidance](https://nextjs.org/docs/app/guides/authentication)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Next.js Backend for Frontend guide](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Prisma transactions and idempotency](https://docs.prisma.io/docs/orm/v7/prisma-client/queries/transactions)
