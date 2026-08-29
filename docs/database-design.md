# Database Design

## PostgreSQL Transactional Schema

PostgreSQL is the source of truth for all API-visible state. Neo4j and vector indexes are derived
from PostgreSQL records and can be rebuilt.

### users

- `id` UUID primary key
- `email` unique, indexed
- `display_name`
- `password_hash`
- `mfa_enabled`
- `created_at`, `updated_at`

### user_roles

- `user_id` foreign key, part of composite primary key
- `role`
- `created_at`

Roles are stored as rows because the API and policy layer support multiple effective roles. A
legacy single-role deployment may expose one row, but must not add a conflicting `users.role`
column.

### case_memberships

- `id` UUID primary key
- `case_id` foreign key
- `user_id` foreign key
- `role`
- `created_at`

### cases

- `id` UUID primary key
- `title`
- `summary`
- `status`
- `sensitivity`
- `owner_user_id`
- `created_at`, `updated_at`

### case_notes

- `id` UUID primary key
- `case_id` foreign key
- `author_user_id` foreign key
- `body`
- `visibility`
- `created_at`, `updated_at`

### evidence_items

- `id` UUID primary key
- `case_id` foreign key
- `source_type`
- `source_name`
- `sha256`
- `artifact_uri` nullable object-storage reference
- `content_type`
- `byte_size`
- `content_text`
- `metadata` JSONB
- `created_by`
- `created_at`

### outbox_events

- `id` UUID primary key
- `aggregate_type`, `aggregate_id`
- `event_type`
- `payload` JSONB
- `published_at` nullable
- `attempt_count`, `last_error`
- `created_at`

### evidence_chunks

- `id` UUID primary key
- `evidence_item_id` foreign key
- `case_id` foreign key
- `chunk_index`
- `content`
- `token_count`
- `metadata` JSONB
- `created_at`

### canonical_entities

- `id` UUID primary key
- `case_id` foreign key
- `entity_type`
- `label`
- `normalized_label`
- `resolution_status`
- `verified`
- `created_at`, `updated_at`

### extracted_entities

- `id` UUID primary key
- `case_id` foreign key
- `canonical_entity_id` nullable
- `entity_type`
- `label`
- `normalized_label`
- `confidence`
- `verified`
- `model_name`
- `model_version`
- `provenance_span_ids` JSONB
- `explainability` JSONB
- `created_at`

### extracted_relationships

- `id` UUID primary key
- `case_id` foreign key
- `source_entity_id`
- `target_entity_id`
- `relationship_type`
- `confidence`
- `verified`
- `provenance_span_ids` JSONB
- `model_name`
- `model_version`
- `explainability` JSONB
- `created_at`

### provenance_spans

- `id` UUID primary key
- `evidence_item_id` foreign key
- `case_id` foreign key
- `start_char`
- `end_char`
- `snippet`
- `page_number` nullable
- `line_start`, `line_end` nullable
- `bbox` JSONB nullable for OCR coordinates
- `extraction_method`
- `confidence`
- `model_run_id` nullable foreign key

### model_runs

- `id` UUID primary key
- `case_id` foreign key
- `evidence_item_id` nullable foreign key
- `task_type`
- `model_name`
- `model_version`
- `parameters` JSONB
- `started_at`, `completed_at`
- `status`

### review_tasks

- `id` UUID primary key
- `case_id` foreign key
- `subject_type`
- `subject_id`
- `reason`
- `status`
- `assigned_to`
- `created_at`, `resolved_at`

### ingestion_jobs

- `id` UUID primary key
- `case_id` foreign key
- `job_type`
- `status`
- `progress`
- `input_manifest` JSONB
- `output_resource_ids` JSONB
- `error_message`
- `created_by`
- `created_at`, `updated_at`, `completed_at`

### import_manifests

- `id` UUID primary key
- `case_id` foreign key
- `source_name`
- `source_type`
- `file_count`
- `metadata` JSONB
- `created_by`
- `created_at`

### export_packages

- `id` UUID primary key
- `case_id` foreign key
- `requested_by`
- `status`
- `scope` JSONB
- `approval_task_id` nullable foreign key
- `artifact_uri`
- `sha256`
- `created_at`, `completed_at`

### audit_events

- `id` UUID primary key
- `actor_user_id` nullable for system/worker events
- `action`
- `resource_type`
- `resource_id`
- `ip_address`
- `user_agent`
- `metadata` JSONB
- `created_at`

### vector_chunks

Used when pgvector is selected as the vector store.

- `chunk_id` foreign key to `evidence_chunks`
- `case_id` foreign key
- `embedding` vector
- `embedding_model`
- `metadata` JSONB
- `created_at`

### analytics_runs

- `id` UUID primary key
- `case_id` foreign key
- `run_type`
- `status`
- `parameters` JSONB
- `model_version` nullable
- `created_by` nullable foreign key
- `created_at`, `completed_at`

### analytics_results

- `id` UUID primary key
- `analytics_run_id` foreign key
- `case_id` foreign key
- `result_type` (metric, community, anomaly, pattern, timeline, geo)
- `subject_id` nullable
- `value` JSONB
- `explanation` JSONB
- `provenance_span_ids` JSONB
- `created_at`

### reports

- `id` UUID primary key
- `case_id` foreign key
- `requested_by` foreign key
- `report_type`
- `status`
- `scope` JSONB
- `artifact_uri`, `sha256` nullable
- `created_at`, `completed_at`

### notifications

- `id` UUID primary key
- `user_id` foreign key
- `case_id` nullable foreign key
- `notification_type`
- `title`, `body`
- `resource_type`, `resource_id` nullable
- `read_at` nullable
- `created_at`

### system_settings

- `key` primary key
- `value` JSONB
- `classification`
- `updated_by` foreign key
- `updated_at`

Only allowlisted, non-secret operational settings are exposed through the API. Secrets remain in
the environment or an external secret manager.

## Neo4j Graph Model

Neo4j stores the graph projection used for traversal, visualization, and graph analytics. Graph
records include PostgreSQL identifiers but are not the source of truth.

### Nodes

- `(:Person {pg_id, canonical_entity_id, label, normalized_label, confidence, verified})`
- `(:Organization {pg_id, canonical_entity_id, label, normalized_label, confidence, verified})`
- `(:Location {pg_id, canonical_entity_id, label, normalized_label, confidence, verified})`
- `(:Asset {pg_id, canonical_entity_id, label, normalized_label, confidence, verified})`
- `(:Communication {pg_id, label, timestamp, channel})`
- `(:Case {pg_id, title})`
- `(:Evidence {pg_id, source_name, sha256})`

### Relationships

- `(:Case)-[:CONTAINS]->(:Evidence)`
- `(:Evidence)-[:MENTIONS {extracted_entity_pg_id, provenance_span_ids, confidence}]->(:Person|Organization|Location|Asset)`
- `(:Person)-[:COMMUNICATED_WITH {relationship_pg_id, confidence, provenance_span_ids, timestamp}]->(:Person)`
- `(:Person)-[:ASSOCIATED_WITH {relationship_pg_id, confidence, provenance_span_ids}]->(:Organization)`
- `(:Person)-[:OBSERVED_AT {relationship_pg_id, confidence, provenance_span_ids, timestamp}]->(:Location)`
- `(:Asset)-[:LINKED_TO {relationship_pg_id, confidence, provenance_span_ids}]->(:Person|Organization)`
- `(:Person|Organization|Location|Asset)-[:SAME_AS {resolution_score, review_task_id}]->(:Person|Organization|Location|Asset)`

## Vector Store

Initial local contract supports embeddings attached to evidence chunks:

- `chunk_id`
- `case_id`
- `evidence_item_id`
- `content`
- `embedding`
- `metadata`

The first implementation can use PostgreSQL `pgvector`; the repository interface also supports
Qdrant, Weaviate, OpenSearch, or managed vector stores later.

## API Mapping

- `/cases`, `/cases/{case_id}` map to `cases`, `case_memberships`, evidence/entity/relationship
  counts, and review task counts.
- `/cases/{case_id}/evidence` maps to `evidence_items`, `evidence_chunks`, and `provenance_spans`.
- `/cases/{case_id}/entities` maps to `canonical_entities`, `extracted_entities`, and
  `provenance_spans`.
- `/cases/{case_id}/relationships` maps to `extracted_relationships`, entities, and
  `provenance_spans`.
- `/ingestion/*`, `/imports`, and `/jobs/{job_id}` map to `import_manifests`, `evidence_items`,
  `ingestion_jobs`, `model_runs`, and worker outputs.
- `/graph*` reads Neo4j projections that carry PostgreSQL IDs and provenance span IDs. UI node IDs
  are canonical entity IDs; graph relationship IDs map to `extracted_relationships.id`.
- `/search*` reads PostgreSQL full-text indexes and vector chunk indexes.
- `/assistant/query` retrieves from `evidence_chunks`, `provenance_spans`, `case_notes`, entities,
  relationships, and vector search before generating an answer.
- `/review/tasks*` maps to `review_tasks` and updates affected entities/relationships.
- `/exports*` maps to `export_packages` and may create `review_tasks`.
- `/audit/events` maps to `audit_events`.
- `/analytics/overview` maps to `analytics_runs` and `analytics_results`; fresh recomputation
  creates a new run rather than overwriting prior results.
- `/reports*` maps to `reports` and may reference `export_packages`.
- `/notifications*` maps to `notifications`.
- `/admin/settings` maps to allowlisted `system_settings` values and emits `audit_events`.
