# Aster Market

An Amazon-inspired commerce product being developed through a research-first, spec-driven workflow.

The repository is currently in **discovery**. There is intentionally no application scaffold yet. The immediate goal is to understand the core shopping journey, document the smallest coherent release, test architectural assumptions, and then build in thin end-to-end slices.

## Start here

1. [`intent.md`](intent.md) — why this product exists, outcomes, boundaries, and principles.
2. [`spec.md`](spec.md) — living functional and quality requirements.
3. [`architecture.md`](architecture.md) — current technical hypotheses and system invariants.
4. [`docs/project-status.md`](docs/project-status.md) — current phase, active questions, and next checkpoint.
5. [`docs/use-cases.md`](docs/use-cases.md) — concrete journeys and examples.
6. [`docs/traceability.md`](docs/traceability.md) — links between outcomes, requirements, use cases, and evidence.

## Engineering system

- [`docs/working-agreement.md`](docs/working-agreement.md) defines the flexible gates and change process.
- [`docs/delivery-plan.md`](docs/delivery-plan.md) proposes learning-oriented vertical slices.
- [`docs/testing-strategy.md`](docs/testing-strategy.md) defines proportional verification.
- [`docs/deployment-strategy.md`](docs/deployment-strategy.md) defines the lightweight environment, release, migration, rollback, and smoke-test approach.
- [`docs/service-access.md`](docs/service-access.md) defines required accounts, least-privilege access, and where secrets may live.
- [`docs/pre-build-readiness.md`](docs/pre-build-readiness.md) is the flexible checklist between discovery and application scaffolding.
- [`docs/api-contracts.md`](docs/api-contracts.md) defines the typed use-case and minimal HTTP boundaries.
- [`docs/database-design.md`](docs/database-design.md) defines the P0 tables, constraints, indexes, and critical transactions.
- [`docs/security-model.md`](docs/security-model.md) captures trust boundaries and abuse cases.
- [`docs/risks.md`](docs/risks.md) tracks product, technical, delivery, and legal risks.
- [`docs/research/commerce-discovery.md`](docs/research/commerce-discovery.md) records public research and its implications.
- [`docs/decisions/`](docs/decisions/) stores proposed, accepted, and superseded decision records.
- [`AGENTS.md`](AGENTS.md) gives coding agents repository-specific working rules.

## Workflow

```text
discover -> specify the next slice -> record meaningful decisions -> implement
        -> verify with evidence -> reconcile docs -> choose the next slice
```

Documents are living artifacts. A gate means “enough confidence to learn safely,” not “all future details are frozen.”

## Current boundary

Do not scaffold or implement product code until the user reviews the discovery package or explicitly asks to start a slice. Research and documentation changes are in scope.

## Brand and asset note

“Aster Market” is a temporary distinct working name. Amazon screenshots and links in the research documents are references only. The shipped product must use original branding and licensed, generated, or otherwise approved imagery.
