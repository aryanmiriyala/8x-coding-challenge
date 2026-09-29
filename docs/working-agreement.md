# Living Specification Working Agreement

## Purpose

Keep intent, implementation, and evidence aligned while allowing requirements and architecture to evolve quickly. This process borrows the useful shape of spec-driven development—specify, plan, task, implement, converge—without treating every phase as mandatory ceremony.

## Artifact roles

| Artifact | Answers | Change frequency |
| --- | --- | --- |
| `intent.md` | Why are we doing this and what outcomes matter? | Low to medium |
| `spec.md` | What behavior and qualities do we currently want? | Medium |
| `architecture.md` | How might we realize it and what invariants matter? | Medium |
| `docs/use-cases.md` | What concrete journeys/examples must work? | Medium to high |
| `docs/traceability.md` | Where is each important outcome specified and proven? | High during delivery |
| `docs/decisions/*` | Why did we make a significant choice? | Append/supersede |
| `docs/project-status.md` | What are we doing now and what blocks the next move? | Every checkpoint |
| Tests, logs, and manual evidence | What actually works? | With implementation |

No document is valuable merely because it exists. Remove duplication, link instead of copy, and update the source closest to the decision.

## Gate model

### Gate A — discovery sufficiency

Proceed when the target user, journey, boundary, top risks, and unknowns are visible. It is acceptable for vendor choices and later features to remain open.

Evidence examples:

- public product research;
- flow inventory and screenshots;
- use-case examples;
- explicit assumptions and unanswered questions.

### Gate B — slice ready

Proceed when one vertical slice has:

- one user outcome;
- bounded inputs and outputs;
- examples for success, empty, invalid, unauthorized, conflict, and dependency failure where relevant;
- a reversible technical approach or an accepted decision;
- a test/inspection plan;
- no hidden dependency on unbuilt future work.

Use `docs/checklists/slice-ready.md` as a prompt, not a compliance scorecard.

### Gate C — convergence

A slice is complete when evidence supports the behavior and the durable artifacts match reality. A test failure, UX observation, or implementation discovery may reopen the spec or architecture.

Use `docs/checklists/convergence.md`.

### Gate D — release confidence

Release when critical journeys have proportional automated and manual evidence, security/privacy risks are accepted or mitigated, operational recovery is understood, and known gaps are honest.

## Change protocol

Classify a proposed change:

- **Editorial:** clarity only; edit directly.
- **Behavioral:** user-visible behavior or acceptance changes; update spec/use case/traceability before or with code.
- **Architectural:** significant dependency, boundary, data model, security, or operational tradeoff; create or supersede an ADR.
- **Scope:** priority or release membership changes; update `spec.md`, delivery plan, risks, and status.
- **Emergency:** fix first when delay creates harm; reconcile artifacts immediately afterward.

## Commit protocol

Git history is part of the project documentation. Work should land as a sequence of small, comprehensible, single-purpose commits rather than one slice-sized dump.

A good commit:

- represents one coherent outcome that can be described in a short imperative message;
- includes the focused test and directly affected living documentation when they belong to that outcome;
- is created after the narrowest relevant check passes;
- stages only files belonging to that outcome after status and staged-diff review;
- leaves unrelated changes untouched;
- can be reviewed and, where technically possible, reverted without unwinding unrelated work.

Commit boundaries should usually follow observable progress: scaffold/configuration, one data invariant, one authorization rule, one UI state, one provider boundary, or one documentation decision. Mechanical formatting, generated output, and dependency changes remain separate from behavioral changes.

“Tiny” does not mean committing broken intermediate states or every edit. It means committing the smallest meaningful, verified increment. Failed or skipped checks are disclosed, and history is not rewritten without explicit agreement.

Decision record states:

- `proposed` — being explored; code must not depend on it without acknowledging the risk.
- `trial` — intentionally being tested in a bounded slice.
- `accepted` — current direction, still supersedable.
- `rejected` — considered and not selected in this context.
- `superseded` — replaced; link forward and do not rewrite history.

## Evidence ladder

Use the least expensive evidence that addresses the risk, then climb when consequence or uncertainty is higher:

1. Static reasoning and source review.
2. Executable example/unit test.
3. Integration test with a real dependency boundary.
4. Browser/E2E test.
5. Manual accessibility/visual/usability review.
6. Preview logs or controlled public-demo observation.

## AI-assisted engineering guardrails

- Agents must ground work in repository artifacts and current code, not memory alone.
- Prompts and plans should reference stable IDs and expected evidence.
- Large features are decomposed into vertical behavior, not frontend/backend/database silos.
- Generated code is reviewed through tests, types, linters, security checks, and diff inspection.
- Agent output is not evidence until independently verified by tools or human inspection.
- Avoid over-specifying distant implementation: it increases stale context and can prevent better local decisions.
- At the end of a slice, converge the docs so the next agent starts from reality.

## Sources informing this process

- [GitHub Spec Kit: spec-driven workflow](https://github.github.io/spec-kit/reference/agentic-sdd.html)
- [GitHub Spec Kit overview](https://github.com/github/spec-kit)
- [MADR decision records](https://adr.github.io/madr/)
- [Architecture Decision Records](https://martinfowler.com/bliki/ArchitectureDecisionRecord.html)
