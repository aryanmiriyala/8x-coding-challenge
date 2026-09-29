# Outcome Traceability

Status: Living index; expand only as implementation begins.

The purpose is to prevent important intent from disappearing between prose, code, and tests. It is not a demand that every sentence have an ID.

| Outcome / risk | Requirements | Use cases | Planned evidence | Current state |
| --- | --- | --- | --- | --- |
| Find and evaluate products | NAV-01..04, HOME-01..03, CAT-01, SEARCH-01..07, PDP-01..06 | UC-DISC-01, UC-DISC-02 | Search parser/query integration tests; responsive browser checks; keyboard/axe review | Specified |
| Maintain cart across auth | CART-01..06, AUTH-03 | UC-CART-01, UC-AUTH-01 | Cart constraint tests; merge transaction tests; guest/sign-in E2E | Specified |
| Secure identity lifecycle | AUTH-01..08, AUTHZ-01..02 | UC-AUTH-01 | Auth adapter/integration tests; enumeration/rate-limit/redirect tests; manual email flow | Specified |
| Correct one-time demo purchase | CHECK-01..09, ORDER-01..03 | UC-CHECK-01, UC-ORDER-01 | Money/state unit tests; concurrent real-DB checkout/rollback tests; no-money browser E2E and owned-order check | Specified |
| Prevent cross-user access | AUTHZ-01..02, ACCT-01..02, ORDER-01 | UC-AUTH-01, UC-ORDER-01 | Table-driven anonymous/owner/other/admin tests | Specified |
| Accessible core journey | Section 7; relevant NAV/SEARCH/PDP/CART/CHECK requirements | All active shopper use cases | axe plus manual keyboard, zoom, reduced-motion, screen-reader spot checks | Specified |
| Operable demo | ADMIN-01..04, observability section | UC-ADMIN-01 | Seed repeatability; role denial; state transition/audit tests; preview smoke | Specified |
| Repeatable deployment | DEPLOY-01..08; `docs/deployment-strategy.md` | All active P0 use cases | Clean CI build; migration/seed check; deployed health/security/smoke checks; rollback evidence | Specified |
| Controlled service access | `docs/service-access.md`; security section | All provider-dependent use cases | Environment-schema tests; secret scan; access/configuration review; rotation exercise | Specified |
| Stable application boundaries | `docs/api-contracts.md`; AUTHZ/CART/CHECK/ORDER requirements | All active P0 use cases | Schema/error contract tests; Server Action/Route Handler authorization and HTTP tests | Specified |
| Correct persistent state | `docs/database-design.md`; commerce/auth requirements | All active P0 use cases | Empty migration/seed; constraint, ownership, concurrency, snapshot, idempotency integration tests | Specified |
| Honest, original clone | `intent.md` principles and non-goals; UI system | UC-DISC-02 | Visual review; asset/license inventory; clear demo/test labels | Specified |

When a slice starts, add exact test names/paths and preview evidence. When a requirement moves or is removed, update this row in the same change.
