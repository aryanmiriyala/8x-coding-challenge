# Security and Abuse Model

Status: Living threat model; review per slice

## Assets to protect

- User identity, credentials, sessions, verification/reset tokens.
- Addresses, order history, email, and other personal data.
- Catalog integrity, price, discount, inventory, and seller identity.
- Cart/order/payment/fulfillment state and audit history.
- Provider keys, database credentials, webhook secrets, and deployment controls.
- Service availability and trustworthy, redacted logs.

## Trust boundaries

1. Browser ↔ application: every value is untrusted, including hidden fields and Server Function arguments.
2. Application ↔ PostgreSQL: use least privilege, constraints, parameterization, and transaction boundaries.
3. Application ↔ auth/email/payment providers: authenticate, time out, minimize data, verify callbacks, retry safely.
4. Public storefront ↔ customer/admin surfaces: explicit authentication, role, and ownership checks.
5. Build/deploy pipeline ↔ public demo: protected secrets, reviewed migrations, immutable artifacts, auditable changes.

## Priority abuse cases

| ID | Abuse case | Control hypothesis | Evidence |
| --- | --- | --- | --- |
| SEC-01 | Attacker changes client price, discount, tax, or total | Recalculate from trusted catalog/promotion/address data; compare provider amount/currency | Unit + checkout integration + E2E tamper |
| SEC-02 | Customer accesses another user's address/order/list/cart | Ownership in query predicate and service authorization; opaque IDs | Table-driven integration/HTTP tests |
| SEC-03 | Attacker assigns admin role during registration | Auth adapter allowlist; role only changed by protected bootstrap/admin path | Registration payload test |
| SEC-04 | Credential stuffing or account discovery | Generic responses, normalized identity/IP rate limits, strong session handling, optional 2FA | HTTP/rate-limit tests and copy review |
| SEC-05 | Session theft/fixation | Library-generated random sessions, Secure/HttpOnly/SameSite cookies, rotation/revocation, TLS/HSTS | Cookie/header inspection; lifecycle tests |
| SEC-06 | Duplicate checkout/payment callback creates extra effects | Atomic caller idempotency key and unique provider event ID; state machine | Concurrent DB and signed event tests |
| SEC-07 | Forged/replayed webhook marks order paid | Raw-body signature verification, event uniqueness, order/amount/currency match | Signed/invalid/replay fixtures |
| SEC-08 | Inventory oversold through concurrency | Transactional reservation with locking/conditional update and non-negative constraints | Concurrent integration test |
| SEC-09 | XSS through catalog/review/admin content | React encoding, no arbitrary HTML; sanitize allowlisted rich text if later added; CSP | Rendering/security tests and header check |
| SEC-10 | CSRF/unsafe cross-origin mutation | SameSite cookie, Origin/Host validation, framework protections, no permissive CORS | Invalid-origin HTTP tests |
| SEC-11 | Secrets/PII leak through logs or client DTO | Server-only modules, DTO allowlists, logger redaction, analytics schema | Static checks and log inspection |
| SEC-12 | Search/review/cart abuse degrades service | Input bounds, pagination, simple deployment-appropriate limits, timeouts, host logs | Load/limit tests proportional to exposure |
| SEC-13 | Misconfiguration accidentally enables a real charge | Accept only Stripe test/sandbox credentials; reject live-mode events/objects; label demo checkout; use only test payment values | Environment validation + webhook fixture + deployed configuration inspection |

## Security requirements by slice

- Discovery/catalog: output encoding, query bounds, safe image domains, security headers.
- Auth/cart: session lifecycle, enumeration resistance, ownership, cart token security, rate limits.
- Checkout/order: server totals, address ownership, inventory concurrency, payment verification, idempotency.
- Admin/operations: role enforcement, audit log, state transitions, re-authentication for high-risk actions if warranted.

## Data minimization

- Do not store raw card data; payment provider owns card entry.
- Store address data only for required fulfillment/account behavior and snapshot orders deliberately.
- Never put tokens, full provider payloads, raw cookies, passwords, or unnecessary address/email fields in logs.
- Define retention/export/deletion before real personal data is accepted.
- Use fake identities and provider test data in demos/screenshots.

## Pre-public-deployment review

- Threat model reconciled with actual routes and data flows.
- Auth/session configuration and cookies inspected.
- Security headers enforcing, not merely documented.
- Rate limits work across the chosen deployment topology.
- Error pages/logs reveal no secrets or stack traces.
- Dependencies and secrets scanned; public-demo/test credentials separated from any future live credentials.
- Backup/restore and incident ownership documented before real orders.

## Primary guidance

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP Transaction Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html)
- [OWASP Third-Party Payment Gateway Integration](https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Payment_Gateway_Integration_Cheat_Sheet.html)
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication)
- [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests)
