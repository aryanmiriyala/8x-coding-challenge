# Product Specification

Status: Living product draft; priorities and details are expected to evolve
Depends on: `intent.md`
Technical realization: `architecture.md`

## How to use this specification

This file expresses the current best hypothesis for the product. It is intentionally more precise about user-visible outcomes and invariants than about implementation. Requirement IDs provide traceability; they do not make a requirement permanent.

Changes are welcome when new evidence appears:

1. Update or annotate the affected requirement.
2. Update `docs/traceability.md` and any affected use case/test idea.
3. Create or supersede a decision record only when the change is architecturally significant or costly to rediscover.
4. Preserve history in Git instead of accumulating obsolete prose in the active specification.

Labels mean **current sequencing hypotheses**, not promises. `P0`, `P1`, and `P2` may move as we learn; a requirement may also become `EXPERIMENT`, `DEFERRED`, or `REMOVED` with a short rationale.

Only P0 is a first-release candidate. P1/P2 document possible expansion and must not become placeholder screens, fake controls, or speculative infrastructure. Whenever a capability is marked implemented, its success, empty, error, authorization, and persistence behavior must work at the depth promised by its acceptance criteria.

## 1. Release hypothesis

The first release is a responsive Amazon.com-inspired physical-goods storefront with a real database, authentication, server-authoritative cart and checkout, Stripe test payments, and customer order history. It supports guests, customers, and administrators. It launches with one platform seller; the product/variant/offer separation models the storefront correctly without adding a seller portal or multi-seller operations.

“Real” means the implemented demo behavior works: state persists, permissions are enforced, totals are correct, and test payments reconcile. It does not mean production Amazon-scale logistics, uptime, traffic, fraud, tax, or marketplace operations.

### Current scope labels

| Level | Meaning | Included capabilities |
| --- | --- | --- |
| P0 | Current candidate for the first coherent demo | Catalog, practical search/filter/sort, PDP, cart, auth, address, test checkout, order confirmation/history, authorization, repeatable seed workflow, security baseline |
| P1 | Likely next, if P0 learning supports it | Wishlist, verified-purchase reviews, cancellation before fulfillment, basic shipment timeline, 2FA, richer admin UI |
| P2 | Plausible expansion, not yet committed | Multiple customer-visible offers, returns/refunds automation, recommendations, coupons, passkeys, object uploads, real carrier/tax services |

Standalone Amazon businesses and service lines are outside every current priority tier. Expansion means deepening this one retail storefront, not adding Prime Video, Music, Kindle/Audible, AWS, Alexa, grocery, pharmacy, Amazon Business, Amazon Pay, Seller Central, or advertising products.

## 2. Roles and permissions

| Capability | Guest | Customer | Admin |
| --- | :---: | :---: | :---: |
| Browse/search/view products | Yes | Yes | Yes |
| Maintain cart | Yes | Yes | Yes |
| Checkout | Sign-in required | Own cart | Own cart |
| Manage address/list/review/order | No | Own resources only | Own resources only unless using admin tools |
| Manage catalog/offers/inventory | No | No | Yes |
| Update fulfillment state | No | No | Yes |
| View another user's secrets/payment details | Never | Never | Never |

Admin access is a separate role check at the server boundary. Hiding a link is not authorization.

## 3. Core domain language

- **Product:** Shared catalog identity: title, brand, description, attributes, category, images, and variation family.
- **SKU / Variant:** A purchasable variation such as color and size.
- **Offer:** A seller's commercial terms for one SKU: seller, condition, price, fulfillment method, and status.
- **Inventory:** Available and reserved quantity for an offer.
- **Cart:** A guest- or user-owned mutable selection of offers.
- **Order:** An immutable commercial snapshot created for checkout.
- **Payment:** Provider state associated with an order; it does not contain raw card data.
- **Shipment:** Fulfillment state and optional tracking data for order items.

## 4. Functional requirements

### 4.1 Global shell and home

- **NAV-01 (P0):** The desktop header shows brand/home, delivery context, category-aware search, language placeholder, account, orders, and cart count.
- **NAV-02 (P0):** Mobile uses a compact header with menu, brand, account, cart, full-width search, and delivery row.
- **NAV-03 (P0):** The cart count reflects total item quantity and updates after mutations without a full page reload.
- **NAV-04 (P0):** All flyouts/drawers use buttons, correct expanded state, Escape close, focus return, and click-outside behavior.
- **HOME-01 (P0):** Home renders one curated hero, category cards, and a small database-driven product row. More merchandising modules are added only if they improve discovery or the demo.
- **HOME-02 (P0):** Every product module is database-driven and has a useful empty state.
- **HOME-03 (P1):** Signed-in modules may show buy-again/recent items with a visible reason and dismiss control.

Acceptance:

- Header actions are keyboard reachable in visual order.
- Search remains prominent at all supported breakpoints.
- Promotional and personalized modules are labeled; fake countdowns or unverifiable scarcity are prohibited.

### 4.2 Catalog, search, filtering, and sorting

- **CAT-01 (P0):** Users can browse a category and its descendants.
- **SEARCH-01 (P0):** Search matches title, brand, description keywords, and category with typo-tolerant partial matching suitable for the seeded catalog.
- **SEARCH-02 (P0):** Query, category, filters, sort, and page are represented in the URL and survive refresh/share.
- **SEARCH-03 (P0):** Results support category, price range, minimum rating, availability, and brand filters.
- **SEARCH-04 (P0):** Results support relevance, price ascending, price descending, rating, and newest sorting.
- **SEARCH-05 (P0):** Product cards show image, title, rating/count, current price, optional comparison price, delivery text, stock state, and sponsor label when applicable.
- **SEARCH-06 (P0):** No-results state preserves the query, explains active constraints, and offers clear-filter/category actions.
- **SEARCH-07 (P1):** Autocomplete returns products, categories, and recent searches with full keyboard combobox behavior.

Acceptance:

- Search returns only active products with at least one active offer.
- Client-provided sort/filter values are allowlisted and validated.
- Pagination is deterministic; no duplicate/missing items while traversing an unchanged result set.

### 4.3 Product detail page

- **PDP-01 (P0):** The page includes breadcrumbs, image gallery, title, brand, rating summary, price, availability, delivery estimate, seller/fulfillment, quantity, add-to-cart, and buy-now entry.
- **PDP-02 (P0):** Variant selection changes SKU-specific image, offer, price, availability, and URL state.
- **PDP-03 (P0):** Add to cart requires a valid variant/offer and cannot exceed server-known available quantity or per-order limit.
- **PDP-04 (P0):** Below-the-fold content includes key bullets, description, structured attributes, shipping/returns summary, and review summary.
- **PDP-05 (P1):** Related and frequently-bought-together modules are labeled as heuristic demo recommendations and permit individual removal.
- **PDP-06 (P1):** Add to list requires authentication and gives a return path to the product after sign-in.

Acceptance:

- The displayed and submitted offer IDs belong to the selected SKU.
- Out-of-stock offers disable purchase actions and remain discoverable only when the availability filter permits them.
- Gallery buttons have descriptive labels; images have useful alt text; zoom is optional and never the only way to inspect an image.

### 4.4 Cart

- **CART-01 (P0):** A guest cart is owned by a signed, HttpOnly identifier; a customer cart is bound to the user.
- **CART-02 (P0):** On sign-in, guest and customer carts merge by offer, bounded by current inventory and purchase limits.
- **CART-03 (P0):** Users can change quantity, remove an item, move to list (P1), and return to the product.
- **CART-04 (P0):** Server recalculates unit price, discounts, availability, and subtotal on every cart read and mutation.
- **CART-05 (P0):** Cart displays changed-price, low-stock, out-of-stock, and unavailable-offer messages before checkout.
- **CART-06 (P0):** Proceed to checkout redirects guests to sign-in and then returns them to checkout.

Acceptance:

- Concurrent quantity updates cannot create duplicate cart lines.
- Cart mutations are idempotent from repeated submissions.
- An empty cart cannot create a checkout.

### 4.5 Authentication, account, and authorization

- **AUTH-01 (P0):** Email/password registration validates input, hashes passwords through the auth library, and avoids account-enumerating responses.
- **AUTH-02 (P0):** Email verification is required before checkout. Development may use Neon Auth shared SMTP; production-like environments use custom SMTP configured for Neon Auth.
- **AUTH-03 (P0):** Sign-in creates a revocable database session in a Secure, HttpOnly, SameSite cookie.
- **AUTH-04 (P0):** Sign-out ends the current browser session; a sign-out-all/session-management requirement is accepted only after the managed provider contract is verified in Slice 0.
- **AUTH-05 (P0):** Password reset uses Neon Auth's short-lived provider flow. Post-reset session behavior is verified and documented before acceptance rather than assumed.
- **AUTH-06 (P0):** Authentication endpoints are rate-limited by normalized identity and IP signals.
- **AUTH-07 (P1):** TOTP 2FA with backup codes may be added from Login & Security after a provider-revisit decision; it is not currently exposed by Managed Auth.
- **AUTH-08 (P2):** Passkeys may be added after the password/verification/recovery flows and a provider-revisit decision are complete.
- **ACCT-01 (P0):** Account hub links to orders, addresses, and login/security. Lists appear when the P1 list slice is implemented.
- **ACCT-02 (P0):** Users can create, edit, delete, and mark a default address. Addresses on placed orders remain snapshots.
- **AUTHZ-01 (P0):** Every protected read and mutation verifies the session and resource ownership in the data-access layer.
- **AUTHZ-02 (P0):** Admin mutations verify role and write an audit record.

Acceptance:

- A cross-user ID substitution returns not-found or forbidden without leaking the resource.
- Proxy/middleware redirects improve UX but are never the sole authorization check.
- Passwords, reset tokens, auth secrets, and complete provider payloads never appear in logs.

### 4.6 Checkout and payment

- **CHECK-01 (P0):** Checkout requires a verified customer, non-empty valid cart, and at least one valid shipping address.
- **CHECK-02 (P0):** Checkout shows address, delivery option placeholder, item summary, server-derived subtotal, discounts, shipping, estimated tax, and total.
- **CHECK-03 (P0):** The app creates one pending order with immutable item/price/address snapshots before handing off to Stripe Checkout in test mode.
- **CHECK-04 (P0):** Inventory is reserved transactionally for a bounded window; expired/failed sessions release it.
- **CHECK-05 (P0):** Payment completion is confirmed by a verified Stripe webhook, not by trusting the browser redirect.
- **CHECK-06 (P0):** Checkout creation and webhook handling use idempotency keys and stored provider event IDs.
- **CHECK-07 (P0):** Success page handles webhook delay by showing a bounded processing state and polling the owned order.
- **CHECK-08 (P0):** No raw PAN, CVC, or full payment credentials pass through or persist in the application.
- **CHECK-09 (P0):** The clone cannot process live payments: configuration rejects live Stripe keys, webhook handling rejects live-mode events, and the UI clearly labels checkout and resulting orders as demonstrations.

Acceptance:

- Editing request payload prices has no effect on order totals.
- Sending the same checkout request twice returns the same pending order/session when appropriate.
- Sending the same webhook twice changes state once.
- Payment success produces a paid order and cart consumption; failure/expiry never produces a paid order.
- Test checkout produces simulated provider records only and never moves real money.

### 4.7 Orders and fulfillment

- **ORDER-01 (P0):** Customers can list their orders and open an order detail with items, totals, address snapshot, payment state, and timeline.
- **ORDER-02 (P0):** Order numbers are human-readable opaque identifiers, not sequential database IDs.
- **ORDER-03 (P0):** Admin can move paid orders through processing, shipped, and delivered demo states.
- **ORDER-04 (P1):** Customer may cancel before processing/shipment; cancellation releases/refunds as appropriate and is idempotent.
- **ORDER-05 (P1):** Shipment timeline supports label-created, shipped, out-for-delivery, delivered, delayed, and exception states.
- **ORDER-06 (P2):** Eligible delivered items can enter a return/replacement workflow with reason, method, and refund state.

Allowed order transitions:

```text
PENDING_PAYMENT -> PAID -> PROCESSING -> SHIPPED -> DELIVERED
PENDING_PAYMENT -> PAYMENT_FAILED | EXPIRED
PAID -> CANCELLED (only before fulfillment lock)
DELIVERED -> RETURN_REQUESTED -> RETURNED -> REFUNDED   [P2]
```

### 4.8 Lists and reviews

- **LIST-01 (P1):** A customer has a default private list and can create additional named lists.
- **LIST-02 (P1):** Users can add/remove products and move purchasable items to cart.
- **LIST-03 (P2):** Lists support public/unlisted/private visibility and collaboration.
- **REV-01 (P1):** Signed-in customers can rate 1–5 and write one review per product; edit/delete remains owner-only.
- **REV-02 (P1):** A verified-purchase badge is computed from a delivered order, never submitted by the client.
- **REV-03 (P1):** Product rating aggregates update after approved review mutations.
- **REV-04 (P2):** Admin moderation, reporting, media, and anti-abuse tooling.

### 4.9 Administration

- **ADMIN-01 (P0):** A repeatable seed command creates categories, products, variants, offers, prices, inventory, and demo states. A UI is optional and should be added only if it improves the scored demo.
- **ADMIN-02 (P0):** Product/offers support draft, active, and archived states.
- **ADMIN-03 (P0):** Admin can inspect orders and update demo fulfillment status using allowed transitions.
- **ADMIN-04 (P0):** Sensitive actions create append-only audit entries with actor, action, resource, timestamp, and request correlation ID.
- **ADMIN-05 (P1):** Admin UI supports image metadata, featured modules, and review moderation.

## 5. Page and route inventory

| Route | Audience | Priority | Purpose |
| --- | --- | --- | --- |
| `/` | Public | P0 | Merchandising/discovery home |
| `/s` | Public | P0 | Search and filtered results |
| `/category/[slug]` | Public | P0 | Category browse |
| `/product/[slug]` | Public | P0 | Product detail and offer selection |
| `/cart` | Public | P0 | Guest/customer cart |
| `/sign-in`, `/sign-up`, `/verify-email`, `/forgot-password`, `/reset-password` | Public | P0 | Auth lifecycle |
| `/checkout` | Verified customer | P0 | Address, delivery, review, payment handoff |
| `/checkout/success` | Customer | P0 | Processing/confirmation |
| `/account` | Customer | P0 | Account hub |
| `/account/orders`, `/account/orders/[orderNumber]` | Customer | P0 | Order history/detail |
| `/account/addresses` | Customer | P0 | Address book |
| `/account/security` | Customer | P0 | Sessions/password/2FA |
| `/account/lists/[id]` | Customer | P1 | Saved items |
| `/admin/orders` | Admin | P0 | Inspect orders and advance demo fulfillment state |
| `/admin/products` | Admin | P1 | Optional catalog UI; the P0 catalog uses a repeatable seed command |

## 6. UI system

### Visual direction

- Familiar dense-commerce hierarchy without copying Amazon branding.
- Dark navy global header, warm amber primary commerce action, neutral canvas, white content surfaces, blue text links, red error/price accents, green success/availability.
- Use a distinct wordmark and icon system. No Amazon logo, smile mark, proprietary fonts, copy, or screenshots in the shipped UI.
- Maximum content width approximately 1500 px; search/results remain fluid; reading-heavy content uses narrower measures.
- Product cards use stable image aspect ratios to prevent layout shift.

### Tokens

Exact token values will live in CSS variables. The initial semantic set is:

- `--color-brand`, `--color-brand-strong`, `--color-accent`, `--color-accent-hover`
- `--color-canvas`, `--color-surface`, `--color-text`, `--color-muted`, `--color-link`
- `--color-success`, `--color-warning`, `--color-danger`, `--color-focus`
- `--radius-sm/md/lg`, `--shadow-card/popover`, 4 px spacing base

### Required component states

Every interactive component specifies default, hover, focus-visible, active, disabled, loading, success, and error states. Data surfaces specify loading skeleton, empty, partial, stale, and failure states.

## 7. Accessibility requirements

- Target WCAG 2.2 AA for the core flow.
- Use semantic `header`, `nav`, `main`, `aside`, and `footer` landmarks plus skip links.
- All functionality works by keyboard; dialogs/drawers trap focus only while open and restore it on close.
- Search autocomplete follows the ARIA combobox pattern; filters use real checkboxes/radios, not interactive controls nested in links.
- Visible focus meets contrast/area requirements and is never removed.
- Text zoom to 200% and browser zoom to 400% do not lose content or require two-dimensional scrolling at supported layouts, excluding inherently tabular content.
- Minimum touch target 44 × 44 CSS px where practical.
- Announce cart changes, validation errors, and async checkout status in appropriate live regions without excessive chatter.
- Respect `prefers-reduced-motion`; carousels never auto-advance by default.

## 8. Security and privacy requirements

- Validate every external input with shared schemas and explicit allowlists.
- Encode output through React; sanitize any future rich HTML with an allowlist.
- Use parameterized ORM queries; no dynamic SQL from user input.
- Set CSP, HSTS in production, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and clickjacking protection.
- Use Secure/HttpOnly/SameSite session and guest-cart cookies; rotate sessions on sensitive identity changes.
- Check Origin/Host for state-changing custom endpoints and rely on same-site protections only as defense in depth.
- Apply practical rate limits to high-risk public/auth/payment mutations using the lightest mechanism supported by the chosen deployment. Do not add a distributed cache solely to imitate large-scale infrastructure.
- Redact credentials, tokens, addresses, email, and provider secrets from logs and error tracking.
- Store provider customer/payment-method references only; Stripe owns payment entry.
- Use least-privilege production keys, environment separation, secret scanning, dependency audit, and locked dependencies.
- Audit admin and order/payment state changes.

## 9. Performance and reliability

- Target p75 Core Web Vitals: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 on representative seeded pages.
- Public catalog pages use server rendering and bounded caching; personalized/account/cart pages are private and dynamic.
- Images are responsive, sized, lazy-loaded below the fold, and served in modern formats where possible.
- Database queries are paginated, indexed, selected to DTOs, and protected from N+1 patterns.
- Payment/order mutations are transactional and idempotent.
- External calls have timeouts; webhook processing can be retried safely.
- User-facing errors include a recovery action and correlation ID, never a stack trace.

## 10. Deployment and release requirements

- **DEPLOY-01 (P0):** Local, test, preview, and public-demo environments use documented, validated configuration and isolated secrets/data.
- **DEPLOY-02 (P0):** A clean checkout installs from the lockfile and passes type checking, tests, and the application build without undocumented manual steps.
- **DEPLOY-03 (P0):** Reviewed migrations run once through a controlled release step; application instances do not race migrations on startup.
- **DEPLOY-04 (P0):** Seed is explicit, repeatable, and cannot silently destroy public-demo data.
- **DEPLOY-05 (P0):** The deployed app exposes a non-sensitive health/readiness endpoint and has critical post-deployment smoke checks.
- **DEPLOY-06 (P0):** Releases record the deployed revision and retain a practical rollback path while schema changes remain backward compatible.
- **DEPLOY-07 (P0):** The public demo uses HTTPS, secure deployed-domain cookie/origin settings, Stripe test mode, and environment-specific webhook secrets.
- **DEPLOY-08 (P0):** Preview deployments never mutate the public-demo database automatically.

The provider is deliberately undecided. Selection follows `docs/deployment-strategy.md` and must preserve the one-app/one-database architecture.

## 11. Analytics and observability

Minimum product events:

- `search_submitted`, `filter_applied`, `product_viewed`
- `add_to_cart`, `remove_from_cart`, `checkout_started`
- `payment_succeeded`, `payment_failed`, `order_viewed`

Minimum operational signals:

- Structured redacted application logs with a request/correlation ID where useful.
- Clear server/client error capture during development and preview.
- A simple health check for the application and database.
- A few useful events around auth, checkout, webhook failure, and order transitions; no dedicated telemetry platform is required for the clone.

Analytics must not contain raw search PII, addresses, payment data, auth tokens, or full emails.

## 12. Test and acceptance strategy

### Automated

- Unit: money/totals, promotion rules, state transitions, search parsing, permission predicates.
- Integration: auth lifecycle, cross-user denial, cart merge, transactional inventory, order creation, idempotent webhook processing.
- E2E: guest browse → cart → sign-in → checkout → confirmation; customer order access; admin fulfillment; mobile navigation.
- Accessibility: automated axe checks plus keyboard/manual zoom checks for home, results, PDP, cart, auth, checkout, and order detail.
- Security regression: unauthenticated and cross-tenant requests, forged totals, invalid Origin, duplicate webhook, rate limits, and unsafe redirects.

### Current P0 convergence checklist

- [ ] All P0 requirements have a passing automated or documented manual acceptance check.
- [ ] No high/critical dependency vulnerabilities without a written exception.
- [ ] Database migrations apply cleanly to an empty database and seed is repeatable.
- [ ] Stripe test success, failure, retry, expiry, and duplicate-webhook paths are verified.
- [ ] Cross-user authorization tests pass for every account-owned resource.
- [ ] Responsive and keyboard paths pass at defined viewports.
- [ ] Public-demo configuration fails closed when required secrets/providers are missing.
- [ ] Deployment health/smoke checks pass and the deployed revision has a rollback path.
- [ ] Documentation reflects the shipped behavior.

## 13. Open decisions and experiments

These do not block unrelated work. Each only needs to be decided before the slice that depends on it:

1. Validate the Vercel + directly owned Neon integration trial: runtime compatibility, pooled application connections, direct migration connections, preview database/Auth branches, migration flow, region, and cost controls.
2. Validate Neon Auth for the complete P0 lifecycle. Custom SMTP is required before treating auth as production-like; a separate application email provider remains deferred until order messaging exists.
3. Whether P0 uses Stripe-hosted Checkout or embedded Checkout. Hosted is faster and lowers UI/security burden; embedded is visually closer to Amazon.
4. Final name, logo, and licensed/generated product imagery.

Provider calls stay in small server-only integration files so secrets and SDK details do not leak into UI or domain rules. This is simple code organization, not a generalized adapter framework.
