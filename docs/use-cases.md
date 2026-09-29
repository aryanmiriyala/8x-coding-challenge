# Use Cases

Status: Living examples
Purpose: Clarify behavior without prematurely fixing UI or implementation.

## Use-case format

- **State:** candidate, active, validated, deferred, or removed.
- **Outcome:** observable user value.
- **Examples:** scenarios that can later become tests.
- **Open choices:** details intentionally left flexible.

## UC-DISC-01 — Find a known product

State: candidate for first release

Outcome: A guest can search for a known item and reach a relevant product/variant.

Main example:

1. Guest searches `wireless headphones`.
2. Results preserve the query in the URL and show active products with purchasable offers.
3. Guest applies brand, price, rating, and in-stock filters and sorts by price.
4. Guest opens a product and sees the chosen variant reflected in price/availability.

Variations:

- Typo or partial phrase still finds plausible seeded products.
- No results explains active filters and offers recovery.
- Archived products or inactive offers do not appear.
- Unsupported filter/sort input is rejected or normalized, never interpolated into a query.

Open choices: exact search engine, facet counts, autocomplete timing, pagination style.

## UC-DISC-02 — Browse without knowing the exact product

State: candidate

Outcome: A guest moves from home merchandising or a category to a useful PDP without search.

Examples:

- Hero/category cards link to real query/category states.
- Product rows explain whether they are deals, popular, recent, or personalized.
- Empty personalized modules fall back to generic content without a broken shell.

## UC-CART-01 — Build a guest cart

State: candidate

Outcome: A guest can add, revisit, change, and remove valid offers before signing in.

Examples:

- Adding the same offer twice increases one line's quantity.
- A variant creates a distinct line from another variant.
- Quantity cannot exceed current stock or purchase limit.
- Price/availability changes are disclosed on cart revisit.
- Repeated submission does not duplicate a mutation.

Open choices: signed cart cookie design, cart expiry, optimistic UI.

## UC-AUTH-01 — Create and recover a customer account

State: candidate

Outcome: A shopper can establish and recover a secure identity without losing shopping context.

Examples:

- Registration validates email/password and sends a verification link.
- The response does not reveal whether an email is already registered beyond the chosen safe UX.
- A successful sign-in merges the guest cart within inventory limits.
- Reset token is single-use and short-lived; success revokes existing sessions.
- Unsafe external return URLs are rejected.

Open choices: password policy details and whether a later requirement justifies leaving Managed Auth. Provider is Neon Auth; P1 MFA/passkeys remain deferred because they are not currently exposed by its managed contract.

## UC-CHECK-01 — Complete a test purchase

State: candidate; highest-risk commerce flow

Outcome: A verified customer can pay in test mode and receive exactly one correct order.

Main example:

1. Customer enters checkout from a non-empty cart.
2. Customer chooses an owned address and sees items and totals.
3. Server revalidates offers/prices/inventory and creates an expiring reservation plus pending order snapshot.
4. Customer completes a Stripe test payment.
5. A signed provider event confirms matching order, amount, and currency.
6. The order becomes paid once, inventory is reconciled, purchased lines leave the cart, and confirmation appears.

Failure/abuse examples:

- Modified browser price is ignored.
- Address belonging to another user is rejected.
- Stock conflict returns to cart with an actionable message.
- Duplicate checkout request returns/reuses the same attempt where semantics match.
- Duplicate or out-of-order provider events do not duplicate effects.
- Return URL arrives before webhook: screen shows processing, not a false success.
- Provider reports success for mismatched amount/currency/order: quarantine and alert.

Open choices: hosted vs embedded checkout, reservation duration, tax/shipping simulation.

## UC-ORDER-01 — Review and manage an order

State: candidate

Outcome: A customer can understand the current state of an owned order.

Examples:

- Order list and detail show snapshots, totals, payment, and fulfillment timeline.
- Another customer's opaque order number still cannot be accessed.
- Admin transitions follow the allowed state machine and create an audit entry.
- P1 cancellation is available only before the fulfillment lock and remains idempotent.

## UC-LIST-01 — Save an item for later

State: deferred candidate (P1)

Outcome: A signed-in customer can keep a private set of products and later move a purchasable offer to cart.

Open choices: product versus variant fidelity, multiple lists, collaboration/visibility.

## UC-REV-01 — Review a delivered product

State: deferred candidate (P1)

Outcome: An eligible customer can contribute one honest product review and manage it later.

Examples:

- Verified-purchase label derives from a delivered order.
- Ownership and eligibility are checked on create/edit/delete.
- Aggregate rating is consistent after mutation/retry.
- Shipping/seller complaints are directed to the appropriate support surface.

## UC-ADMIN-01 — Operate the demo catalog and order flow

State: candidate, scope intentionally minimal

Outcome: An administrator can make the demo useful without direct database editing.

Examples:

- Seed/import or protected UI creates categories, products, variants, offers, and inventory.
- Public sign-up cannot request an admin role.
- Catalog and fulfillment changes validate allowed states and write audit records.

Open choices: seed-only versus minimal admin UI in the first release.
