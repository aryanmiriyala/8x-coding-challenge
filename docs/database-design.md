# P0 Database Design

Status: Living schema contract; exact Prisma syntax is confirmed during the Slice 0/1 spike
Database: PostgreSQL through Neon
Identity store: Neon Auth managed `neon_auth` schema
ORM/migrations: Prisma candidate, with reviewed SQL migrations for constraints/indexes Prisma cannot express

## Goals

- Represent one physical-goods storefront correctly without building a generic commerce platform.
- Keep authentication, authorization ownership, prices, inventory, orders, and payment reconciliation server-authoritative.
- Make duplicate requests and provider events safe.
- Preserve historical order facts when catalog, price, address, or user data changes.
- Create only P0 tables. P1/P2 schemas are designed when those slices become active.

## Conventions

- PostgreSQL tables/columns use `snake_case`; application models may map to idiomatic TypeScript names.
- Application-owned primary keys use opaque native `uuid` values. Neon Auth identity keys retain their provider-managed type; app-owned identity references are opaque text unless the Slice 0 schema proves otherwise. Order numbers are separate random human-readable identifiers.
- All timestamps are `timestamptz` in UTC with `created_at`; mutable rows also have `updated_at`.
- Money uses non-negative integer minor units plus uppercase ISO 4217 currency, initially `USD`.
- Countries use uppercase ISO 3166-1 alpha-2 codes.
- Mutable concurrency-sensitive aggregates have an integer `version` incremented on update.
- User-supplied display text is stored as plain text; P0 stores no arbitrary HTML.
- JSONB is used only for bounded shape-varying data or deliberate immutable snapshots, not as a substitute for core relational columns.
- Foreign keys and database constraints reinforce application validation.

## P0 relationship map

```text
AuthUser --< Session / Account / Verification    (Neon Auth owned)
AuthUser --1 CustomerProfile --< Address

Category --< ProductCategory >-- Product --< ProductImage
Product --< ProductVariant --< Offer >-- Seller
Offer --1 Inventory

User or signed guest --1 open Cart --< CartItem >-- Offer

User --< CommerceOrder --< CommerceOrderItem
CommerceOrder --< InventoryReservation >-- Offer
CommerceOrder --1 Payment
CommerceOrder --< OrderEvent

ProviderEvent                 (Stripe event deduplication)
IdempotencyRecord             (request retry deduplication)
AuditLog                      (sensitive/admin changes)
```

## Identity and account tables

### Neon Auth owned tables

Neon Auth manages Better Auth tables in the branch-local `neon_auth` schema. Application migrations must not recreate, rename, or directly mutate those tables. The provider owns credential/session token formats; application code never adds password columns or reads password material.

Required semantics:

| Table | Required application assumptions |
| --- | --- |
| `user` | Opaque provider ID, normalized unique email, display name, email verification state, timestamps |
| `session` | Opaque hashed/library-managed token, user FK, expiry, revocation/lifecycle data; indexed by user and expiry |
| `account` | Library identity/credential record linked to user; no application reads of password material |
| `verification` | Short-lived verification/recovery values owned by the library; indexed for lookup/expiry |

The Slice 0 spike records the exact installed schema/API instead of relying on generic Better Auth names. Prisma may introspect the managed schema for read relationships, but application migrations remain scoped to app-owned schemas/tables.

### `customer_profile`

Application-owned commerce identity and role data stays separate from provider-owned auth state.

| Column | Type/constraint |
| --- | --- |
| `auth_user_id` | Opaque text primary key corresponding to the current Neon Auth user |
| `role` | `CUSTOMER | ADMIN`, required, default `CUSTOMER` |
| timestamps | Required |

On the first authenticated application operation, an idempotent server-side use case creates the profile as `CUSTOMER`. Whether a foreign key to `neon_auth.user(id)` is safe with the pinned managed schema is validated in Slice 0; until proven, session identity plus application integrity checks are authoritative. Admin role is assigned only through a protected bootstrap operation and never from registration input.

### `address`

| Column | Type/constraint |
| --- | --- |
| `id` | UUID primary key |
| `user_id` | Opaque auth user ID, required, indexed; application-enforced owner and FK only if the managed-schema spike approves it |
| `label` | Bounded text, optional |
| `recipient_name` | Bounded text, required |
| `line1` | Bounded text, required |
| `line2` | Bounded text, optional |
| `city` | Bounded text, required |
| `region` | Bounded text, required for initial US flow |
| `postal_code` | Bounded text, required |
| `country_code` | `char(2)`, required |
| `phone` | Bounded text, optional; minimize use/display |
| `is_default` | Boolean, required |
| timestamps | Required |

A partial unique index permits at most one default address per user. The service changes defaults in one transaction. Deleting an address cannot affect an order because orders store snapshots.

## Catalog tables

### `seller`

Minimal table seeded with one platform seller.

- `id` UUID PK
- `slug` unique
- `display_name`
- `status`: `ACTIVE | ARCHIVED`
- timestamps

There is no seller account, portal, payout, commission, or settlement schema.

### `category`

- `id` UUID PK
- `parent_id` nullable self-FK with restricted/careful deletion
- `slug` unique
- `name`
- `description` optional
- `sort_order` integer default 0
- `status`: `ACTIVE | ARCHIVED`
- timestamps

Index `(parent_id, sort_order)` and `status`.

### `product`

- `id` UUID PK
- `slug` unique
- `title`, `brand`, `description`
- `bullet_points` bounded JSONB array of strings
- `status`: `DRAFT | ACTIVE | ARCHIVED`
- `rating_average_hundredths` integer `0..500` representing 0.00–5.00 without float arithmetic
- `rating_count` non-negative integer; seeded/read-only until reviews are implemented
- `search_text` normalized text assembled from title, brand, categories, and keywords
- timestamps

Indexes: status/created date, GIN full-text expression over `search_text`, and `pg_trgm` index for bounded typo/partial matching.

### `product_category`

- `product_id` FK
- `category_id` FK
- composite PK `(product_id, category_id)`

### `product_image`

- `id` UUID PK
- `product_id` FK indexed
- `variant_id` nullable FK for variant-specific media
- approved static asset path/URL for P0
- required `alt_text`
- `sort_order`
- optional width/height

Images are approved static app assets in P0; there is no runtime upload/storage pipeline. If a later active slice adds Neon Object Storage, persist the stable bucket object key in this row (never a credential-bearing or expiring signed URL); create metadata/migration changes only with that slice.

### `product_variant`

- `id` UUID PK
- `product_id` FK indexed
- `sku` unique
- `title`
- `attributes` bounded JSONB object such as `{ "color": "Black", "size": "M" }`
- `status`: `ACTIVE | ARCHIVED`
- timestamps

Attribute keys/values are validated against seeded product/category rules. P0 does not build a generic attribute/PIM engine.

### `offer`

- `id` UUID PK
- `variant_id` FK indexed
- `seller_id` FK indexed
- `condition`: initially only `NEW`
- `fulfillment_type`: initially `PLATFORM`
- `price_minor` non-negative integer
- `compare_at_minor` nullable integer, must be greater than or equal to price when present
- `currency` `char(3)`
- `status`: `ACTIVE | ARCHIVED`
- optional bounded per-order limit
- timestamps

P0 enforces one active platform offer per variant/currency. Cart/order code still references `offer_id` so later customer-visible offers are additive.

### `inventory`

- `offer_id` PK/FK offer
- `available` non-negative integer
- `reserved` non-negative integer
- `version` non-negative integer
- `updated_at`

`available` means immediately reservable units. Reserving atomically moves quantity from `available` to `reserved`; consuming a paid reservation decreases `reserved`; releasing restores it to `available`. The database checks both values remain non-negative.

## Cart and retry tables

### `cart`

- `id` UUID PK
- `user_id` nullable FK indexed
- `guest_token_hash` nullable unique/indexed; never store the raw cookie token
- `status`: `OPEN | MERGED | CHECKED_OUT | EXPIRED`
- `currency` `char(3)`
- `version`
- optional `expires_at` for guest carts
- timestamps

Constraint: exactly one of `user_id` and `guest_token_hash` identifies an open cart. Partial unique indexes allow at most one open cart per user/currency and one per guest token/currency.

### `cart_item`

- `id` UUID PK
- `cart_id` FK indexed, cascade when an ephemeral cart is removed
- `offer_id` FK indexed
- `quantity` positive integer with a bounded maximum
- timestamps
- unique `(cart_id, offer_id)`

Cart reads always join current offer/inventory data and calculate fresh totals; no client-supplied or stale cart price is authoritative.

### `idempotency_record`

Used for retry-prone incrementing actions and checkout creation, not every read/update.

- `id` UUID PK
- `scope` bounded enum/text such as `CART_ADD` or `CHECKOUT_CREATE`
- `key_hash` fixed hash, never log/store an unnecessarily reusable raw key
- `actor_fingerprint` user/cart reference hash
- `request_hash` to reject the same key with changed intent
- `resource_type` and `resource_id` for the created/reused result
- `status`: `STARTED | COMPLETED | FAILED_RETRYABLE`
- `expires_at`
- timestamps
- unique `(scope, key_hash)`

## Order and payment tables

### `commerce_order`

- `id` UUID PK
- `order_number` unique random display identifier
- `user_id` FK indexed
- `status`: `PENDING_PAYMENT | PAID | PAYMENT_FAILED | EXPIRED | PROCESSING | SHIPPED | DELIVERED | CANCELLED`
- `currency` `char(3)`
- `subtotal_minor`, `discount_minor`, `shipping_minor`, `tax_minor`, `total_minor`: non-negative integers
- `shipping_address_snapshot` bounded JSONB with the exact fulfillment fields at purchase time
- `checkout_idempotency_key_hash` unique
- `version`
- `payment_expires_at` nullable/indexed
- timestamps

Check: `total = subtotal - discount + shipping + tax`, with discount not exceeding the permitted base. The service controls allowed transitions; every transition appends an order event and sensitive/admin transitions also append an audit log.

### `commerce_order_item`

- `id` UUID PK
- `order_id` FK indexed
- source IDs: product, variant, offer, seller
- snapshots: product title, variant title/attributes, SKU, seller name, image URL
- `unit_price_minor`, `discount_minor`, `tax_minor`, `quantity`, `line_total_minor`
- `currency`

Historical display uses snapshots, not mutable catalog joins. Source IDs remain for internal traceability.

### `inventory_reservation`

- `id` UUID PK
- `order_id` FK indexed
- `offer_id` FK indexed
- `quantity` positive integer
- `status`: `ACTIVE | CONSUMED | RELEASED`
- `expires_at` indexed
- timestamps
- unique `(order_id, offer_id)`

Expiration is determined by `expires_at`, not by whether a cron job has already cleaned the row.

### `payment`

P0 permits only `FAKE` or `STRIPE_TEST` providers.

- `id` UUID PK
- `order_id` unique FK
- `provider`: `FAKE | STRIPE_TEST`
- `status`: `PENDING | SUCCEEDED | FAILED | EXPIRED`
- `amount_minor`, `currency`
- `provider_session_id` nullable unique
- `provider_payment_id` nullable unique
- optional safe display fields `brand`, `last4` only when useful and returned by Stripe
- provider/request correlation ID, timestamps

Constraint: provider can never be a live Stripe mode. Raw PAN/CVC and full provider objects are never stored.

### `provider_event`

- `id` UUID PK
- `provider`: initially `STRIPE_TEST`
- `provider_event_id` unique
- `event_type`
- `livemode` boolean, must be false for processable events
- safe referenced object/order identifiers
- `payload_hash` for diagnostics/deduplication; no full raw payload by default
- `status`: `RECEIVED | PROCESSED | DUPLICATE | REJECTED | FAILED_RETRYABLE`
- safe `failure_code` optional
- `received_at`, `processed_at`

The unique provider event ID is inserted before effects are applied. Permanent mismatch/live-mode input is recorded rejected; transient transaction failure remains retryable.

### `order_event`

- `id` UUID PK
- `order_id` FK indexed
- `from_status` nullable
- `to_status`
- `actor_user_id` nullable FK
- `source`: `SYSTEM | CUSTOMER | ADMIN | STRIPE_TEST`
- safe customer-visible message/key
- `created_at`

This supplies the order timeline without introducing P0 shipment/carrier tables.

### `audit_log`

- `id` UUID PK
- `actor_user_id` nullable FK/indexed
- `action`
- `resource_type`, `resource_id`
- request correlation ID
- bounded sanitized metadata JSONB
- `created_at`

Append only. No secrets, complete addresses/emails, provider payloads, or raw cookies. Customer-facing order history comes from `order_event`, not audit metadata.

## Explicitly deferred tables

Do not create these during P0:

- wishlist/list and list items;
- reviews, votes, moderation, or review media;
- shipment, package, tracking scan, carrier, or return tables;
- promotion, coupon, gift card, tax rule, or pricing-engine tables;
- seller accounts, listings UI, commission, payout, or settlement tables;
- recommendation, ad, personalization-profile, or analytics warehouse tables;
- uploaded asset/storage tables.

They receive migrations only when their requirement moves into an active slice.

## Critical transactions

### Guest/customer cart merge

1. Lock/resolve the guest and customer open carts.
2. Merge unique offers and sum quantities within current limits/availability.
3. Preserve visible conflict notices.
4. Mark the guest cart `MERGED` and increment the customer cart version.
5. Commit once.

### Start checkout

1. Resolve verified user, owned address, and open cart.
2. Re-read active offers, authoritative prices, limits, and inventory.
3. In one transaction, claim the idempotency record, conditionally reserve every offer, create the pending order/items/address snapshot/reservations/payment, and mark the attempt completed.
4. Commit before calling Stripe.
5. Create/retrieve the Stripe test Checkout Session using the stored attempt/order ID and persist the provider session reference.

No network/provider call occurs inside a database transaction. If Stripe is unavailable, the pending local attempt can be resumed or expired without creating another order.

### Stripe test webhook

1. Verify signature on the raw body and reject live mode.
2. Insert the unique provider event or return success for a duplicate.
3. In one transaction, lock the owned order/payment, match order/amount/currency, apply one allowed state transition, consume reservations, and mark purchased cart lines/order events.
4. Mark the provider event processed and commit.

### Expire reservation

In bounded batches, claim active reservations whose `expires_at <= now()`, atomically restore `available`, reduce `reserved`, mark reservations released, and transition eligible pending orders to `EXPIRED`. Repetition is a no-op.

## Delete and retention behavior

- Catalog and sellers are archived rather than deleted when referenced by commerce history.
- Cart data may be expired/purged after the documented demo retention period.
- Deleting an address is safe because orders use snapshots.
- Orders, payments, events, and audits are not cascade-deleted through ordinary UI operations.
- Session/verification cleanup follows Neon Auth's supported lifecycle; application jobs never delete managed auth rows.
- Before real personal data is ever accepted, retention/export/deletion rules require a separate production-readiness decision.

## Migration and seed rules

- Prisma migration files are reviewed and committed; public-demo deploys use `migrate deploy`, never schema push.
- Partial indexes, expression indexes, extensions such as `pg_trgm`, and advanced checks may use explicit SQL migrations.
- Prefer additive/backward-compatible migrations so the previous Vercel deployment can still run during rollback.
- Seed is deterministic and idempotent: one seller, a small category tree, representative products/variants/offers/images, stock states, safe demo users, and supported order states.
- Seed never silently runs during application startup and never destroys public-demo data.

## Schema verification

- Empty database migrates and seeds cleanly twice.
- Foreign-key, uniqueness, check, partial-index, and ownership behavior have integration tests.
- Concurrent reservation tests prove inventory cannot become negative.
- Duplicate cart/checkout keys and Stripe event IDs prove one effect.
- Address/catalog edits prove order snapshots remain unchanged.
- Query plans for search, open cart, owned order list/detail, expiry scan, and provider-event lookup use intended indexes on representative seed data.

## Primary guidance

- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Prisma transactions and idempotency](https://docs.prisma.io/docs/orm/v7/prisma-client/queries/transactions)
- [Neon Auth overview](https://neon.com/docs/auth/overview)
- [Neon Auth Next.js quickstart](https://neon.com/docs/auth/quick-start/nextjs-api-only)
