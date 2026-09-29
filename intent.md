# Product Intent

Status: Living discovery draft
Last updated: 2026-09-29
Working title: **Aster Market** (temporary; deliberately not an Amazon trademark)

## Why we are building this

Build a credible, end-to-end commerce product inspired by Amazon's core shopping journey within a 24-hour coding-challenge window. The goal is not to reproduce Amazon's catalog size, logistics network, advertising business, or every historical feature. The goal is to demonstrate that the smallest useful version is built on sound product and engineering foundations and can grow without a rewrite.

The product should feel immediately familiar to an Amazon shopper:

1. Discover products from a merchandising-led home page or search.
2. Narrow results with categories, filters, and sorting.
3. Evaluate a product, its variants, price, availability, fulfillment, and reviews.
4. Add products to a persistent cart or list.
5. Authenticate, select an address, review the total, and pay in test mode.
6. See an order confirmation and manage the order from an account area.

This is a **functional clone, not an Amazon-scale system**. Core features should work end to end in the demo using real application state and safe test integrations, but we will not recreate Amazon's operational topology, global scale, internal services, or organizational complexity.

## Product boundary: one retail storefront

The product represents one Amazon.com-style general-merchandise storefront for physical goods. We are cloning the connected customer shopping experience, not the wider Amazon company or a launcher for its separate businesses.

Included when prioritized: home merchandising, category/search discovery, product evaluation, variants and seller/fulfillment context, cart, lists, account/security, addresses, simulated checkout, orders, reviews, and later cancellation/returns. These belong to one retail journey.

Excluded from this product: Prime membership as a subscription, Prime Video, Amazon Music, Kindle, Audible, AWS, Alexa/device services, Amazon Pay as a separate wallet, Fresh/Whole Foods grocery, Pharmacy, Amazon Business, Seller Central, advertising consoles, and other standalone Amazon products. A generic simulated delivery benefit may be shown when useful, but it must not use Prime branding or imply a real membership.

## Product thesis

A strong commerce clone is convincing because the state transitions are real, not because every screen is present. Search must return seeded catalog data, cart totals must be derived on the server, inventory must be protected from races, payment must be reconciled through signed webhooks, and users must only be able to access their own account data.

We will borrow Amazon's information hierarchy and shopping mental model, then improve areas where the original is visibly dense or inaccessible:

- Keep search, delivery context, account, orders, and cart persistently available.
- Separate product identity from seller offers so the design can grow into a marketplace.
- Make sponsored, personalized, and organic content visually distinct.
- Prefer responsive design, semantic controls, strong focus states, and reduced-motion support.
- Explain price comparisons, scarcity, and personalization instead of relying on ambiguous persuasion labels.
- Optimize for task completion and trust before recommendation volume.

## Primary users

### Shopper

A guest or signed-in customer who wants to find, compare, buy, and later manage physical products.

Top jobs:

- Find a known product quickly.
- Browse a category when the exact item is unknown.
- Judge whether a product, variant, seller, price, and delivery promise are acceptable.
- Complete checkout without re-entering known information.
- Understand what happened after payment and what can still be changed.

### Store administrator

An internal operator who needs a minimal, protected way to create and maintain products, offers, inventory, categories, and order status during development and demos.

### Seller boundary

A third-party seller is not an active user of this clone. The storefront may eventually display multiple offers because that is part of Amazon.com shopping, but seller onboarding, listing management, payouts, and Seller Central workflows remain outside the product boundary.

## Outcomes

The first release is successful when:

- A new user can register, verify/sign in, shop, pay with a Stripe test method, and see the resulting order.
- A guest can browse, search, filter, and maintain a cart; the cart merges safely after sign-in.
- Prices, inventory, discounts, tax/shipping placeholders, and order totals are never trusted from the browser.
- A customer cannot read or mutate another customer's addresses, cart, list, reviews, or orders.
- Retrying checkout or receiving a duplicate payment webhook cannot create a duplicate charge or order.
- The main journey works at 360 px, 768 px, 1280 px, and keyboard-only.
- Seed data makes every core state demoable without depending on a third-party catalog API.

## Non-goals for the first release

- Prime membership, Prime Video, Amazon Music, Kindle, Audible, AWS, Alexa/device services, Amazon Pay, Fresh/Whole Foods grocery, Pharmacy, Amazon Business, gift cards, or other standalone Amazon services.
- A production seller portal, seller payouts, marketplace commissions, or fulfillment-by-merchant operations.
- Real carrier purchasing or live tracking integrations.
- Multi-country tax compliance, currency conversion, localization, or international shipping.
- Sophisticated ML recommendations, ad auctions, visual search, or an AI shopping assistant.
- Real customer charges. All payment work remains in Stripe test mode until an explicit production-readiness review.
- Pixel-for-pixel copying of Amazon branding, copy, proprietary images, or trademarks.

## Principles that constrain implementation

1. **Intent before code, learning during code.** `intent.md`, `spec.md`, and `architecture.md` are living maps, not a frozen contract. Before a slice starts they must explain why it exists and how success will be observed. As implementation teaches us something, update the relevant artifact and record significant tradeoffs instead of forcing the code to match an obsolete assumption.
2. **Correctness over breadth.** One complete purchase journey beats many disconnected screens.
3. **Server authority.** Identity, permissions, price, promotions, inventory, and totals are revalidated at the trusted boundary.
4. **Secure by default.** Deny access unless allowed; expose only the fields a screen needs; keep secrets and payment data out of the client and database.
5. **Accessible by construction.** Native controls, landmarks, labels, focus visibility, keyboard operation, and zoom support are requirements, not polish.
6. **One lightweight application.** Use a small number of clear folders/modules inside one deployable application and one database. Microservices and distributed infrastructure are outside the clone's intended scope, not a deferred default.
7. **Deterministic demos.** The app ships with a curated catalog, users, orders, and inventory states that make every acceptance path reproducible.
8. **Honest commerce.** Clearly label simulated delivery dates, test payments, discounts, low-stock states, and personalized modules.

## Discovery findings

Public Amazon surfaces and official documentation show a stable core model:

- The global header prioritizes category-aware search, language/region, account/lists, orders, and cart.
- Search results mix product cards with filters, sorting, delivery promises, ratings, price, stock, and direct add-to-cart actions.
- A product detail page combines a product identity (title, images, description, attributes) with one or more offers (seller, price, condition, fulfillment, availability).
- Account-owned resources include addresses, payment preferences, lists, orders, returns, reviews, and login/security settings.
- The post-purchase model exposes editing/cancellation before dispatch, shipment tracking, returns/replacements, refunds, and seller-specific support paths.
- Amazon currently supports password, OTP/passwordless, passkey, and two-step verification patterns. The first release will implement email/password plus verification and secure database sessions through Neon Auth. Passkeys and 2FA remain possible later increments, but each requires a fresh provider decision because the current managed surface does not expose them.

Useful public references:

- [Amazon home page](https://www.amazon.com/)
- [Official product-detail-page anatomy](https://sell.amazon.com/blog/amazon-product-listings)
- [Official product search/detail API model](https://docs.business.amazon.com/docs/defining-product-detail-pages)
- [Official order and customer-service capabilities](https://digprjsurvey.amazon.com/csad/help/node/GSD587LKW72HKU2V)
- [Official address-management flow](https://digprjsurvey.amazon.com/csad/help/node/GQT5HV6YYGNDSFNW)
- [Official tracking states](https://digprjsurvey.amazon.com/csad/help/node/GENAFPTNLHV7ZACW)
- [Official returns flow](https://digprjsurvey.amazon.com/csad/help/node/G6E3B2E8QPHQ88KF)
- [Official authentication options](https://digprjsurvey.amazon.com/csad/help/node/GAM5QWMWMTFCHEQT)
- [Amazon homepage design direction](https://www.aboutamazon.com/news/retail/amazon-homepage-redesign-features)
- [Independent Amazon accessibility audit](https://dustinwhisman.com/writing/accessibility-top-100/amazon/)

## Visual reference set

These are research references, not assets approved for shipping:

- [Amazon personalized-homepage overview (official)](https://assets.aboutamazon.com/dims4/default/099a31a/2147483647/strip/true/crop/2550x1429%2B0%2B0/resize/1920x1076%21/quality/90/?url=https%3A%2F%2Fassets.aboutamazon.com%2F73%2F0d%2F19dd4b7f45748fe567fb620b4e37%2Fwd-hero.jpg)
- [Amazon homepage module examples (official)](https://assets.aboutamazon.com/25/df/7efff3ff44729641da2fd4cb8744/wd-trio.jpg)
- [Amazon product-detail-page anatomy (official)](https://cdn.sell2.brightspotcdn.com/dims4/default/d28f501/2147483647/strip/true/crop/1280x406%2B0%2B0/resize/1280x406%21/quality/90/?url=https%3A%2F%2Fsell2-production-sell2.s3.us-west-2.amazonaws.com%2Fbrightspot%2F16%2F5b%2Fcc8b4d164bd5b0c8842deaefbbbb%2Fproduct-detail-page-on-amazon.png)
- [Amazon PDP content callouts (official)](https://cdn.sell2.brightspotcdn.com/dims4/default/fa98f68/2147483647/strip/true/crop/1568x942%2B0%2B0/resize/1568x942%21/quality/90/?url=https%3A%2F%2Fsell2-production-sell2.s3.us-west-2.amazonaws.com%2Fbrightspot%2Fe3%2F81%2F46494c6e40c38a73374f6c015c34%2Fproduct-detail-page-3-callouts.png)
- [Desktop/mobile home, results, and PDP composition (independent, 2024)](https://dustinwhisman.com/images/accessibility-top-100/amazon/pages-tested-v.png)

Fresh screenshots and authenticated flow recordings were not captured in this environment because an interactive browser session was unavailable. We will not claim those flows were tested. Before implementation is considered visually locked, manually capture the validation matrix below using a test account with no real payment credentials.

## Required manual validation before visual lock

| Flow | Screens to capture | Safety boundary |
| --- | --- | --- |
| Guest discovery | Home, nav drawer, autocomplete, results, filters, PDP, add-to-cart feedback, cart | No account needed |
| Registration/auth | Create account, verification, sign-in, recovery, error/rate-limit states | Use a dedicated test identity |
| Account | Account hub, addresses, lists, orders, security | Redact all personal data |
| Checkout | Address selection, delivery, payment, review, confirmation | Use only provider test mode; never enter a real card |
| Post-purchase | Order detail, cancellation, tracking, return/replacement, refund status | Use a reversible test order |
| Responsive/accessibility | 360/768/1280 px, 200% zoom, keyboard sequence, reduced motion | Record defects as spec deltas |

## Flexible decision gates

The gates are confidence checks, not locks:

- **Discovery → first vertical slice:** the problem, primary journey, initial risks, and a reversible technical direction are clear enough to test. Not every later feature or provider must be selected.
- **Slice planning → implementation:** the slice has a small use case, examples, acceptance signals, affected decisions, and a verification approach. Ambiguity outside that slice does not block it.
- **Implementation → convergence:** evidence from tests, browser review, logs, and discovered constraints is folded back into the docs. Drift is either reconciled or recorded as an intentional decision.
- **Expansion:** P1/P2 work is reprioritized from what we learned rather than mechanically following the original list.

Any gate may be reopened. A material change updates the relevant living document and, when the rationale matters, adds a decision record under `docs/decisions/`. Superseded decisions remain in history so later contributors and coding agents can understand why the direction changed.
