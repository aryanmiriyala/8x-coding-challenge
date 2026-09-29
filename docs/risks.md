# Risk Register

Status: Living; review at each checkpoint

Scales: likelihood and impact are `low`, `medium`, or `high`. Owners are roles until people are assigned.

| ID | Risk | Likelihood | Impact | Current response | Trigger / next evidence | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | Scope expands toward “all of Amazon” and core journey remains incomplete | High | High | One Amazon.com-style physical-goods storefront; separate Amazon services excluded; thin P0 journey and vertical slices | Any standalone service or unrelated feature proposed before checkout/order evidence | Product |
| R-002 | Specs become rigid/stale and agents follow obsolete detail | Medium | High | Living-spec agreement, ADR supersession, convergence gate | Code/doc mismatch or repeated exceptions | Product + Eng |
| R-003 | Architecture is overbuilt for a 24-hour challenge | Medium | High | One app + PostgreSQL baseline; no microservices/queues/Redis/search cluster; use only feature-required providers | Any infrastructure that does not enable an active use case | Eng |
| R-004 | Custom commerce code repeats avoidable platform complexity | Medium | Medium | Keep headless platforms as domain references; reconsider only if required P0 breadth changes materially | Cart/inventory/order workflow estimate grows | Eng |
| R-005 | ORM cannot express safe inventory locking ergonomically | Medium | High | Time-boxed transaction/locking spike; allow safe raw SQL or query-layer change | Before checkout schema is accepted | Eng |
| R-006 | Auth provider/library integration delays the core flow | Medium | High | Thin auth spike; small server-only integration; keep social/passkey/2FA out of initial path | Verification/reset/session revocation blocked | Eng |
| R-007 | Payment redirect/webhook races create false success or duplicates | Medium | High | Pending order, signed events, unique event IDs, idempotency, processing UI | Checkout slice | Eng + Security |
| R-008 | Inventory oversells under concurrent checkout | Medium | High | Reservation and concurrent DB tests; simplify to explicit stock rules | Checkout slice | Eng |
| R-009 | Amazon-inspired UI infringes branding/assets or looks deceptive | Medium | High | Distinct name/brand, approved imagery, clear challenge/demo labeling | Visual lock/public deployment | Product + Legal |
| R-010 | Public research differs by locale, experiment, or signed-in state | High | Medium | Mark observations, validate manually with dated captures, avoid assuming hidden behavior | Before visual lock | Design/Product |
| R-011 | Accessibility is postponed as polish | Medium | High | Semantic primitives, acceptance requirements, per-slice keyboard/axe/manual checks | Every UI slice | Eng + Design |
| R-012 | Seed/catalog data is unrealistic or legally unclear | Medium | Medium | Curated deterministic licensed/generated data; asset inventory | Before seeded UI is published | Product |
| R-013 | Provider configuration prevents reproducible local/preview demos | Medium | Medium | Captured email, test payments, deterministic fakes, startup validation | First external provider | Eng |
| R-014 | Logs/analytics leak PII or secrets | Medium | High | Structured allowlisted events, redaction, test fixtures, log inspection | Auth/checkout slices | Security |
| R-015 | Screenshot requirement remains unmet | High | Medium | Manual capture matrix and public references; schedule real browser pass | Before visual acceptance | Design/Product |
| R-016 | Deployment is delayed until the end or differs from local behavior | Medium | High | Select provider in Slice 0; deploy early; isolate environments; automate controlled migrations and smoke checks | First preview and every public-demo release | Eng |

Retire a risk only when evidence shows it no longer applies. If accepted, record who accepted it, until when, and what monitoring/revisit trigger remains.
