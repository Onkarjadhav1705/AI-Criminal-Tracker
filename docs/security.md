# Security Architecture

## Roles

- `admin`: user and system administration.
- `lead_investigator`: case ownership, evidence upload, export approval, review decisions.
- `investigator`: case work, search, graph exploration, notes.
- `analyst`: analytics and review support.
- `auditor`: read-only access to audit and compliance reports.

## Controls

- All endpoints require authentication except health checks and login.
- RBAC is enforced through dependency injection and service-level checks.
- Case membership and sensitivity policies are enforced before returning case evidence, graph,
  search, assistant, analytics, or export results.
- All user actions that touch case data produce audit events.
- Secrets are supplied through environment variables or a secret manager.
- Passwords are hashed with Argon2/bcrypt.
- Tokens use short expiration and refresh-token rotation in production mode.
- Sensitive exports should require explicit permission and generate audit events.
- Rate limiting uses Redis-backed counters at the gateway/API layer.
- Input validation uses Pydantic schemas, parser sandboxes, file type allowlists, size limits, and
  malware-scanning integration points.
- TLS is terminated at the gateway in development and at ingress/API gateway in production.
- Encryption at rest is provided through managed disk/database encryption, backup encryption, and
  optional application-level field encryption for highly sensitive attributes.
- Administrative role changes, failed logins, evidence reads, assistant queries, graph exports, and
  review decisions are auditable.

## Endpoint Authorization Baseline

- `public`: `/health`, login, gateway readiness probes.
- `authenticated`: case list scoped to membership, search scoped to membership, current user.
- `investigator`: evidence upload, notes, graph exploration, assistant queries on assigned cases.
- `analyst`: analytics recompute, anomaly review, semantic indexing operations on assigned cases.
- `lead_investigator`: case creation, export requests, assignment, final review decisions.
- `auditor`: audit event reads and compliance reports, without evidence modification.
- `admin`: users, roles, global configuration, and system administration.

## Investigation Safety

- AI outputs are labeled as extracted, inferred, or computed.
- Confidence scores and provenance are displayed with every relationship.
- Unverified entities and relationships remain marked until a human reviews them.
- The assistant is retrieval-grounded and must cite source evidence.
- The system should block language that states model-based guilt or criminality as fact.
- Model prompts, model versions, feature sets, confidence thresholds, and generated explanations are
  tracked through model-run metadata.
- Low-confidence relationships, entity-resolution merges, unusual graph patterns, and sensitive
  exports create review tasks rather than silently changing verified case state.

## Background Processing Security

- Workers use service credentials with least-privilege database access.
- Job payloads store references to evidence and manifests, not secret material.
- Worker outputs are validated before becoming investigator-visible.
- Failed tasks retain error metadata without leaking secrets.
- Queue operations, retries, and export package generation emit audit events.
