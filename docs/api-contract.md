# API Contract

Base path: `/api/v1`

Unless otherwise stated, endpoints require an `Authorization: Bearer <token>` header. Endpoint
authorization also checks role and case membership. All case-data reads, writes, exports, assistant
queries, and administrative actions create audit events.

List endpoints use the common query parameters `page` (1-based), `page_size` (bounded by the
server), `sort`, and endpoint-specific filters. They return `{ "items": [], "page": 1,
"page_size": 50, "total": 0 }`. IDs are opaque PostgreSQL-backed identifiers.

## Authentication

### POST `/auth/login`

Accepts demo credentials and returns an access token.

Request:

```json
{
  "username": "investigator@example.test",
  "password": "demo-password"
}
```

Response:

```json
{
  "access_token": "jwt-or-dev-token",
  "token_type": "bearer",
  "user": {
    "id": "usr_demo_investigator",
    "name": "Demo Investigator",
    "roles": ["lead_investigator"]
  }
}
```

## Health

### GET `/health`

Returns service status and dependency mode.

### GET `/metrics`

Prometheus scrape endpoint. Available only inside the trusted network or through gateway controls.

## Cases

### GET `/cases`

Returns case summaries visible to the current user. Supports `status`, `sensitivity`, `owner_id`,
`q`, and `updated_from`/`updated_to` filters.

### GET `/cases/{case_id}`

Returns case detail, evidence counts, risk indicators, timeline coverage, and review status.

### POST `/cases`

Creates a case. Requires `lead_investigator` or `admin`.

### GET `/cases/{case_id}/evidence`

Returns evidence metadata and extracted text summaries for a case.

### GET `/cases/{case_id}/evidence/{evidence_id}`

Returns one evidence record, parsed content, provenance spans, and file metadata.

### GET `/cases/{case_id}/entities`

Returns extracted and canonical entities for a case, including verification state and provenance
links.

### GET `/cases/{case_id}/relationships`

Returns extracted relationships for a case. Every relationship includes source entity, target
entity, relationship type, confidence, verification state, and `provenance_span_ids`.

## Ingestion

### POST `/ingestion/text`

Ingests a small unstructured text item into a case. Development mode may process inline; production
mode returns a job.

Request:

```json
{
  "case_id": "case_demo_001",
  "source_name": "Synthetic incident note",
  "content_text": "Jordan Vale called Mira Stone near North Pier Terminal.",
  "classification": "training-restricted"
}
```

Response:

```json
{
  "job_id": "job_001",
  "evidence_id": "ev_001",
  "status": "queued",
  "inline_result": null
}
```

### POST `/ingestion/files`

Uploads CSV, JSON, TXT, PDF, DOCX, XLSX, image, or archive files. Creates an import manifest,
evidence records, and background parsing/OCR/NLP jobs.

### GET `/jobs/{job_id}`

Returns background job status, progress, errors, and output resource IDs.

### GET `/jobs`

Returns jobs visible to the current user. Supports `case_id`, `status`, and `job_type` filters.

## Search

### GET `/search?q={query}`

Runs full-text style search over cases, evidence, entities, relationships, documents, transactions,
and events. Supports `entity_type`, `case_id`, `source_type`, `date_from`, `date_to`, `exact`,
`page`, `page_size`, and `sort`.

### POST `/search/semantic`

Runs case-scoped semantic search over evidence chunks and indexed notes. Uses pgvector by default
and can be backed by a configurable vector database.

## Graph

### GET `/graph?case_id={case_id}`

Returns a UI graph projection.

Response:

```json
{
  "nodes": [
    {
      "id": "ent_001",
      "label": "Jordan Vale",
      "type": "person",
      "confidence": 0.91,
      "verified": false
    }
  ],
  "edges": [
    {
      "id": "rel_001",
      "source": "ent_001",
      "target": "ent_002",
      "type": "communicated_with",
      "confidence": 0.78,
      "provenance_span_ids": ["prov_001"],
      "verified": false
    }
  ]
}
```

### GET `/graph/paths?case_id={case_id}&source={entity_id}&target={entity_id}`

Returns evidence-linked shortest paths or constrained traversals from Neo4j.

## Analytics

### GET `/analytics/overview?case_id={case_id}`

Returns graph metrics, centrality, communities, anomalies, suspicious-pattern indicators, the
analytics run ID, score semantics, explanations, and provenance references. Scores are analytical
priorities or anomaly indicators, never guilt findings.

### POST `/analytics/recompute`

Queues analytics recomputation. Requires `analyst`, `lead_investigator`, or `admin`.

## Timeline

### GET `/timeline?case_id={case_id}`

Returns chronological evidence and relationship events.

## Geospatial

### GET `/geo/events?case_id={case_id}`

Returns evidence-linked map events with latitude, longitude, timestamp, event type, connected
canonical entity IDs, confidence, and `provenance_span_ids`.

## Review

### GET `/review/tasks?case_id={case_id}`

Returns human-in-the-loop review tasks for entity resolution, relationship verification, anomaly
review, and export approval.

### PATCH `/review/tasks/{task_id}`

Updates review status and records the human decision, rationale, reviewer, and timestamp.

## Assistant

### POST `/assistant/query`

Runs a retrieval-grounded assistant query against available case material.

Request:

```json
{
  "case_id": "case_demo_001",
  "question": "Which entities need human verification?"
}
```

Response:

```json
{
  "answer": "Several relationships have moderate confidence and should be reviewed.",
  "citations": [
    {
      "provenance_span_id": "prov_001",
      "evidence_id": "ev_001",
      "label": "Synthetic incident note",
      "snippet": "..."
    }
  ],
  "limitations": [
    "This is an investigative lead, not a finding of guilt."
  ]
}
```

The assistant first retrieves case-scoped evidence chunks, provenance spans, entities,
relationships, and notes. Any LLM response must cite retrieved records and include limitations.

Assistant citations must resolve to records the requesting user can read. The service rejects
uncited factual claims or returns a clearly labeled no-answer/insufficient-evidence response.

## Import and Export

### POST `/imports`

Creates an import manifest for batch data and queues processing jobs.

### POST `/exports`

Queues an export package with selected case records, provenance, graph data, and audit metadata.
Requires `lead_investigator` or `admin` and may require review approval for sensitive cases.

### GET `/exports/{export_id}`

Returns export status and signed download metadata when available.

## Audit

### GET `/audit/events`

Returns recent audit events for security monitoring. Auditors can filter by actor, action,
resource, case, and date range; ordinary investigators receive only permitted case-scoped events.

## Reports

### GET `/reports?case_id={case_id}`

Returns reports visible to the current user.

### POST `/reports`

Queues a provenance-preserving report for a case. Requires `lead_investigator` or `admin`.

### GET `/reports/{report_id}`

Returns report status, scope, provenance manifest, and signed download metadata when complete.

## Notifications

### GET `/notifications`

Returns the current user's notifications with optional `unread_only` filtering.

### PATCH `/notifications/{notification_id}/read`

Marks a permitted notification as read and emits an audit event.

## Administration

### GET `/users/me`

Returns the current user and effective roles.

### GET `/admin/users`

Administrative user listing. Requires `admin`.

### PATCH `/admin/users/{user_id}/roles`

Updates user role assignments. Requires `admin` and emits an audit event.

### GET `/admin/settings`

Returns allowlisted non-secret operational settings. Requires `admin`.

### PATCH `/admin/settings/{key}`

Updates one allowlisted setting. Secrets are rejected and must remain in environment or secret
manager configuration. Requires `admin` and emits an audit event.
