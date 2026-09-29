# Decision Log

Use decision records for choices that are significant, contested, hard to reverse, security-sensitive, or likely to be questioned later. Do not create an ADR for every library import.

## States

- `proposed`
- `trial`
- `accepted`
- `rejected`
- `superseded by ADR-NNN`

Accepted does not mean permanent. When a decision changes, add a new record and mark the old one superseded; do not rewrite the original rationale.

## Index

| ID | Title | State |
| --- | --- | --- |
| 001 | Start with a lightweight modular monolith | Accepted |
| 002 | Separate product, variant, offer, and inventory | Accepted |
| 003 | Use typed use cases and a minimal HTTP surface | Accepted |
| 004 | Trial Vercel with directly owned Neon PostgreSQL | Trial |
| 005 | Use Neon Auth for P0 identity | Trial |
| 006 | Use Neon Object Storage for runtime-managed files | Accepted; provisioning deferred |

Copy `000-template.md` for new records. Keep records short and evidence-oriented.
