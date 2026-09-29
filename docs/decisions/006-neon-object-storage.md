# ADR-006: Use Neon Object Storage for runtime-managed files

Status: accepted for runtime-managed files; provisioning deferred
Date: 2026-09-29
Decision confirmed by owner: 2026-09-29

## Context and problem

The storefront needs product imagery, and future slices may add admin-managed images or other unstructured files. The project already uses Neon for PostgreSQL and Managed Auth. We want a small stack and isolated preview data without putting file bytes in relational tables.

## Decision outcome

Keep the initial curated catalog images as approved static assets served with the Next.js app. Neon Object Storage is the chosen store for files created or changed at runtime; it provides an S3-compatible API and branch-scoped buckets/objects alongside Neon database branches.

Do not provision a bucket until that runtime file use case is accepted into a slice. At that point, select access per content: public-read plus a CDN for public catalog media; private bucket and short-lived authorized presigned URLs for private files. Store object keys and metadata in PostgreSQL, not file bytes or expiring URLs.

## Validation criteria

- Project region supports Neon Object Storage.
- Required bucket access modes match the data classification.
- A preview branch inherits a consistent media snapshot and writes/deletes stay isolated from the parent.
- Server-side validation enforces allowed content types, size limits, safe generated keys, ownership, and cache policy.
- S3 credentials remain server-side and are injected per Neon branch; no credential is committed or sent to the browser.
- Public media has an explicit CDN/cache plan; private media is never placed in a public-read bucket.
- Current Neon Object Storage pricing and limits are reviewed before enabling it for a public demo.

## Revisit triggers

Choose a different storage provider if Neon region, cost, lifecycle, CDN, access-control, or operational constraints fail a measured requirement. Static bundled assets alone do not trigger bucket provisioning.

## Consequences

- P0 seed imagery adds no storage service setup or upload surface.
- Runtime files can share Neon branch workflows and standard S3 tooling when needed.
- Public assets need a CDN for hot browser delivery; private assets need server authorization and expiring signed access.
- Neon-issued S3 credentials may use conventional `AWS_*` environment names even before a bucket exists. The names do not imply an AWS S3 account or bucket; clients must target the Neon branch endpoint explicitly.

## Links

- `architecture.md`
- `docs/database-design.md`
- `docs/service-access.md`
- `docs/pre-build-readiness.md`
- [Neon Object Storage](https://neon.com/docs/storage/overview)
- [Neon S3 compatibility](https://neon.com/docs/storage/s3-compatibility)
- [Neon Object Storage launch and branching model](https://neon.com/blog/building-neon-object-storage)
