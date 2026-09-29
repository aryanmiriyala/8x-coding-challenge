# Security and Abuse Model

Status: Living threat model; review per slice

## Assets to protect

- User identity, credentials, sessions, verification/reset tokens.
- Addresses, order history, email, and other personal data.
- Catalog integrity, price, discount, inventory, and seller identity.
- Cart/order/payment/fulfillment state and audit history.
- Auth/storage provider keys, database credentials, and deployment controls.
- Service availability and trustworthy, redacted logs.

## Trust boundaries

1. Browser ↔ application: every value is untrusted, including hidden fields and Server Function arguments.
2. Application ↔ PostgreSQL: use least privilege, constraints, parameterization, and transaction boundaries.
3. Application ↔ auth/email/storage providers: authenticate, time out, minimize data, verify applicable callbacks, retry safely.
4. Public storefront ↔ customer/admin surfaces: explicit authentication, role, and ownership checks.
5. Build/deploy pipeline ↔ public demo: protected secrets, reviewed migrations, immutable artifacts, auditable changes.

## Priority abuse cases

| ID | Abuse case | Control hypothesis | Evidence |
| --- | --- | --- | --- |
| SEC-01 | Attacker changes client price, discount, tax, or total | Recalculate from trusted catalog/promotion/address data; persist server-derived amount/currency | Unit + checkout integration + E2E tamper |
| SEC-02 | Customer accesses another user's address/order/list/cart | Ownership in query predicate and service authorization; opaque IDs | Table-driven integration/HTTP tests |
| SEC-03 | Attacker assigns admin role during registration | Auth adapter allowlist; role only changed by protected bootstrap/admin path | Registration payload test |
| SEC-04 | Credential stuffing or account discovery | Generic responses, normalized identity/IP rate limits, strong session handling, optional 2FA | HTTP/rate-limit tests and copy review |
| SEC-05 | Session theft/fixation | Library-generated random sessions, Secure/HttpOnly/SameSite cookies, rotation/revocation, TLS/HSTS | Cookie/header inspection; lifecycle tests |
| SEC-06 | Duplicate checkout creates extra effects | Customer-scoped idempotency key, request-intent binding, and one atomic transaction | Concurrent DB retry/conflict tests |
| SEC-07 | Forged browser success claim marks an order placed | Confirmation reads only committed owned order; no client payment-status input | Forged URL/payload and cross-user tests |
| SEC-08 | Inventory oversold through concurrency | Transactional conditional decrement and non-negative constraints | Concurrent integration test |
| SEC-09 | XSS through catalog/review/admin content | React encoding, no arbitrary HTML; sanitize allowlisted rich text if later added; CSP | Rendering/security tests and header check |
| SEC-10 | CSRF/unsafe cross-origin mutation | SameSite cookie, Origin/Host validation, framework protections, no permissive CORS | Invalid-origin HTTP tests |
| SEC-11 | Secrets/PII leak through logs or client DTO | Server-only modules, DTO allowlists, logger redaction, analytics schema | Static checks and log inspection |
| SEC-12 | Search/review/cart abuse degrades service | Input bounds, pagination, simple deployment-appropriate limits, timeouts, host logs | Load/limit tests proportional to exposure |
| SEC-13 | Demo checkout is mistaken for a real charge or a payment path appears | No provider SDK, card field, payment credential, or webhook in P0; label checkout/orders as demo | Dependency/route/config inspection + browser copy check |
| SEC-14 | Malicious or oversized file is uploaded, served from the wrong visibility class, or used to exhaust storage | Defer uploads until an active slice; allowlist detected content types, enforce byte/pixel limits, use random immutable keys, scan/process only when justified, keep private files in private buckets, authorize before signing URLs, set cache controls, and monitor usage | Upload boundary tests, cross-user access checks, storage-usage review |

## Security requirements by slice

- Discovery/catalog: output encoding, query bounds, safe image domains, security headers.
- Auth/cart: session lifecycle, enumeration resistance, ownership, cart token security, rate limits.
- Checkout/order: server totals, address ownership, inventory concurrency, atomic simulated status, idempotency.
- Admin/operations: role enforcement, audit log, state transitions, re-authentication for high-risk actions if warranted.
- Runtime file storage, if activated: server-side upload authorization, content/size validation, private/public bucket separation, signed URL expiry, cache behavior, and storage usage controls.

## Data minimization

- Do not solicit or store card data; P0 has no card-entry path or payment provider.
- Store address data only for required fulfillment/account behavior and snapshot orders deliberately.
- Never put tokens, full provider payloads, raw cookies, passwords, or unnecessary address/email fields in logs.
- Define retention/export/deletion before real personal data is accepted.
- Use fake identities and addresses in demos/screenshots; no payment details are needed.

## Pre-public-deployment review

- Threat model reconciled with actual routes and data flows.
- Auth/session configuration and cookies inspected.
- Security headers enforcing, not merely documented.
- Rate limits work across the chosen deployment topology.
- Error pages/logs reveal no secrets or stack traces.
- Dependencies and secrets scanned; public-demo/test credentials isolated.
- Backup/restore and incident ownership documented before real orders.

## Primary guidance

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP Transaction Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html)
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
