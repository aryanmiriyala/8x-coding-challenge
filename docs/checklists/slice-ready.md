# Slice-Ready Prompt

Use judgment. “No” means discuss or reduce scope; it does not automatically ban progress.

- [ ] The user outcome is one sentence and observable.
- [ ] Linked requirement and use-case IDs are current.
- [ ] Affected API/use-case contracts and database tables/constraints are identified without adding unused future schema.
- [ ] Success, empty, invalid, unauthorized, conflict, and dependency-failure examples are considered where relevant.
- [ ] Out-of-scope behavior is explicit enough to avoid accidental expansion.
- [ ] Only decisions required by this slice are resolved or placed in a bounded trial.
- [ ] The slice has small, single-purpose commit boundaries, including where tests and documentation land.
- [ ] Trust boundaries, personal data, and abuse cases are understood.
- [ ] Database/provider migrations have a safe forward and rollback/compatibility story.
- [ ] Environment variables, callback URLs, secrets, and deployed-domain behavior needed by the slice are identified.
- [ ] Any new service account or credential has an owner, minimum scope, storage location, and rotation path.
- [ ] Preview/public-demo isolation and post-deployment smoke evidence are planned when the slice is externally reachable.
- [ ] The verification plan addresses the highest consequence and uncertainty.
- [ ] Seed/fixture state makes the slice reproducible.
- [ ] No claim depends on an untested future component.
