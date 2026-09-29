# Commerce Discovery Research

Status: Living research log
Research date: 2026-09-28

## Method and limitations

Research used public Amazon pages, official Amazon help/business/seller materials, official framework/provider/security documentation, and a small number of clearly labeled independent UX references. An interactive signed-in browser session was unavailable, so no claim is made that authenticated Amazon flows were personally completed. Amazon also runs locale/device/account experiments; visible details are observations, not permanent requirements.

## Amazon product model and journey

### Observations

- The public global navigation centers delivery context, category-aware search, language/region, account/lists, returns/orders, and cart.
- Search results expose category, price, review, deal, condition, subscription, sustainability, shipping, and availability filters. Cards can offer direct add-to-cart.
- Amazon describes a listing as a product detail page plus one or more seller offers. Product content covers name, images, description, attributes, and variations; the offer covers quantity, price, condition, seller, and fulfillment.
- A product page layers media, identity, social proof, commercial offer, delivery promise, purchase actions, details, comparisons/recommendations, and reviews.
- Saved lists are account-owned and accept products from product pages.
- Account flows cover addresses, payment methods, login/security, orders, returns, and customer service.
- Order management includes pre-dispatch edits/cancellation, tracking, return/replacement, refund status, and third-party seller distinctions.
- Current Amazon authentication documentation describes password, OTP/passwordless, passkeys, and two-step verification.

### Implications for our clone

- Preserve the familiar journey and information hierarchy, not every business line.
- Treat Amazon.com retail as the complete product boundary; do not reproduce the surrounding Amazon service ecosystem.
- Model product identity separately from variants/offers/inventory.
- Treat delivery and seller/fulfillment identity as purchase-critical information.
- Make cart/checkout/order state real and server-authoritative.
- Implement email/password + verification/recovery first; retain a clean path to 2FA/passkeys.

### Primary Amazon references

- [Amazon home](https://www.amazon.com/)
- [Amazon product listing anatomy](https://sell.amazon.com/blog/amazon-product-listings)
- [Amazon Business product detail API](https://docs.business.amazon.com/docs/defining-product-detail-pages)
- [Create a list](https://digprjsurvey.amazon.com/csad/help/node/GHCGC7B7SQ222YMD)
- [Manage addresses](https://digprjsurvey.amazon.com/csad/help/node/GQT5HV6YYGNDSFNW)
- [Manage payment methods](https://digprjsurvey.amazon.com/csad/help/node/GNQFBWDZJN838JZF)
- [Third-party seller ordering](https://digprjsurvey.amazon.com/csad/help/node/GEF528GN65XSJ7V8)
- [Customer service and order actions](https://digprjsurvey.amazon.com/csad/help/node/GSD587LKW72HKU2V)
- [Tracking states](https://digprjsurvey.amazon.com/csad/help/node/GENAFPTNLHV7ZACW)
- [Returns](https://digprjsurvey.amazon.com/csad/help/node/G6E3B2E8QPHQ88KF)
- [Authentication options](https://digprjsurvey.amazon.com/csad/help/node/GAM5QWMWMTFCHEQT)
- [Two-step verification](https://digprjsurvey.amazon.com/csad/help/node/G3PWZPU52FKN7PW4)
- [Community/review rules](https://digprjsurvey.amazon.com/csad/help/node/GLHXEX85MENUE4XF)

## UI and accessibility research

Amazon's density is useful for product comparison but should not be copied uncritically. An independent audit found issues involving semantic controls, filter labeling, landmarks, focus, alt text, and zoom/reflow. A recent UX teardown also highlights ambiguity between organic, sponsored, personalized, scarcity, and popularity signals.

Implications:

- Use native buttons/inputs and correct ARIA patterns.
- Keep keyboard order aligned with visual/task order.
- Make filters real labeled inputs, not controls nested in links.
- Keep sponsored/personalized/deal modules distinct and explainable.
- Use responsive layout rather than device-specific adaptive markup where possible.
- Do not auto-advance merchandising carousels.

References:

- [Amazon accessibility audit](https://dustinwhisman.com/writing/accessibility-top-100/amazon/)
- [Amazon product-discovery UX study](https://theuxologist.com/case-studies/personalisation-and-persuasion-in-amazons-content-browsing)
- [Amazon homepage design direction](https://www.aboutamazon.com/news/retail/amazon-homepage-redesign-features)

## Commerce architecture research

### Domain boundaries

Medusa organizes commerce into product, pricing, cart, inventory, payment, order, fulfillment, tax, and related modules, then composes them into workflows. Shopify similarly treats a cart line as a quantity of merchandise/variant and checkout as a distinct final-decision phase. These are good conceptual boundaries even if we do not adopt either platform.

Medusa's inventory lifecycle is particularly relevant: availability is checked when adding to cart, reservations are created at order placement, fulfillment converts reserved stock to consumed stock, cancellation releases it, and return condition determines whether stock is restored.

Implications:

- Keep module boundaries in code without deploying microservices.
- Model reservation lifecycle explicitly and test concurrent behavior.
- Treat checkout/order as a workflow with allowed transitions and compensation, not CRUD screens.
- Use headless commerce platforms as domain references; do not adopt one unless a later scope change clearly saves more work than it adds.

References:

- [Medusa commerce modules](https://docs.medusajs.com/resources/commerce-modules)
- [Medusa inventory in flows](https://docs.medusajs.com/resources/commerce-modules/inventory/inventory-in-flows)
- [Medusa reservation lifecycle](https://docs.medusajs.com/resources/commerce-modules/inventory/reservations-lifecycle)
- [Shopify cart model](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart)
- [Shopify product/variant form](https://shopify.dev/docs/storefronts/themes/architecture/templates/product/overview)
- [AWS e-commerce architecture guide](https://aws.amazon.com/blogs/industries/the-cto-guide-to-ecommerce-architectures/)
- [AWS web store guidance](https://docs.aws.amazon.com/solutions/web-store-on-aws/)

### Deployment shape

Large reference architectures use CDN/WAF, managed identity, object storage, caches, search, event buses, queues, and independent compute. AWS explicitly notes that the full scaled architecture is not necessarily appropriate in the first phase. For this challenge, the transferable lessons are transactional correctness, clear ownership, and secure provider integration—not copying the production topology of Amazon.

Working implication: use one modular application and one transactional database for the clone. Service extraction is outside the current product scope.

## Payment, retries, and consistency research

OWASP's payment guidance recommends recalculating cart totals on the backend, verifying server-to-server payment status, matching order/amount/currency, authenticating callbacks, and handling them idempotently. Stripe supports idempotency keys and signed events. Amazon's Builders' Library recommends caller-provided request identifiers and atomic recording of the identifier with mutations for safe retry semantics.

Implications:

- Create a pending local order/reservation before provider handoff.
- Never mark paid from the browser return URL.
- Store a unique checkout request key and unique provider event ID.
- Return a semantically equivalent response for matching retries; reject reused keys with changed intent.
- Expect duplicate, delayed, and out-of-order events.

References:

- [OWASP payment gateway integration](https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Payment_Gateway_Integration_Cheat_Sheet.html)
- [Stripe Checkout](https://docs.stripe.com/payments/checkout/quickstarts)
- [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [AWS: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)

## Web stack and security research

Next.js recommends an authentication library, secure server-set cookies, a data-access layer, minimal DTOs, and authorization inside every Server Function/route—not only in routing middleware. Neon Auth is Managed Better Auth with branch-local users and sessions; its current managed P0 surface includes email/password, verification/recovery, and revocable sessions, while MFA/passkeys remain revisit triggers rather than assumed features. PostgreSQL provides relational constraints/transactions and optional row-level security as defense in depth.

Implications:

- Verify the Neon Auth/ORM combination in a thin spike rather than treating documentation as proof.
- Keep Proxy/middleware optimistic; enforce secure authorization in services/data access.
- Use server-only modules and DTO allowlists.
- Do not add Redis to the clone baseline. Revisit rate limiting only if the chosen public-demo host cannot provide a simple adequate mechanism.

References:

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js authentication](https://nextjs.org/docs/app/guides/authentication)
- [Next.js security headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers)
- [Neon Auth overview](https://neon.com/docs/auth/overview)
- [Neon Auth Next.js quickstart](https://neon.com/docs/auth/quick-start/nextjs-api-only)
- [Prisma with Next.js](https://docs.prisma.io/docs/guides/frameworks/nextjs)
- [PostgreSQL row security](https://www.postgresql.org/docs/18/ddl-rowsecurity.html)
- [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

## AI-assisted engineering research

GitHub Spec Kit frames agentic delivery as Specify → Plan → Tasks → Implement → Converge and treats clarification/checklists as optional quality gates for ambiguity. ADR guidance recommends short records of one significant decision, its context, alternatives, and consequences; changed decisions should be superseded rather than rewritten.

Our adaptation:

- Keep three high-level living docs plus narrow use cases, traceability, risk, testing, and decision artifacts.
- Gate one slice at a time rather than freezing the whole product.
- Give agents stable IDs, current status, repository guardrails, and explicit evidence requirements.
- Reconcile docs after implementation so future agents are grounded in actual behavior.

References:

- [GitHub Spec Kit](https://github.com/github/spec-kit)
- [Agentic spec-driven development](https://github.github.com/spec-kit/reference/agentic-sdd.html)
- [MADR](https://adr.github.io/madr/)
- [Architecture Decision Records](https://martinfowler.com/bliki/ArchitectureDecisionRecord.html)

## Research backlog

- Manually capture current Amazon desktop/mobile authenticated flows.
- Compare custom modular monolith against a minimal Medusa and Saleor spike using the same catalog/cart use case.
- Verify Prisma locking/transaction options against the chosen PostgreSQL host.
- Inspect current package/runtime compatibility when implementation is authorized.
- Obtain the coding challenge scoring rubric and deployment constraints.
- Decide asset licensing/generation and final brand before visual lock.
