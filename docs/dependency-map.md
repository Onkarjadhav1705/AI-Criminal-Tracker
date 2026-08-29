# Component and Service Dependency Map

## Frontend

- `App` depends on React Router and dashboard layout.
- `api/client.ts` centralizes authenticated HTTP access.
- `features/auth` depends on `/auth/login` and `/users/me`.
- `features/dashboard` depends on cases, analytics, graph, timeline, geo, review, job, and audit
  APIs.
- `features/cases` depends on `/cases`, `/cases/{case_id}`, `/cases/{case_id}/evidence`,
  `/cases/{case_id}/entities`, and `/cases/{case_id}/relationships`.
- `features/graph` depends on `/graph` and renders Cytoscape.js projections.
- `features/map` depends on `/geo/events` and renders Leaflet markers.
- `features/timeline` depends on `/timeline`.
- `features/ingestion` depends on `/ingestion/text`, `/ingestion/files`, `/imports`, and
  `/jobs/{job_id}`.
- `features/search` depends on `/search` and `/search/semantic`.
- `features/assistant` depends on `/assistant/query`.
- `features/review` depends on `/review/tasks` and `/review/tasks/{task_id}`.
- `features/export` depends on `/exports` and `/exports/{export_id}`.
- `features/admin` depends on `/admin/users` and `/admin/users/{user_id}/roles`.
- `features/monitoring` depends on `/health`, job status APIs, and gateway-protected metrics.

## Backend

- API routers depend on schemas, security dependencies, and service interfaces.
- Auth dependencies enforce JWT validation, RBAC, and case-membership checks before service calls.
- Services depend on repositories, policy checks, model/NLP adapters, and audit writers.
- Repositories depend on PostgreSQL sessions, Neo4j sessions, vector-store clients, Redis clients,
  object-storage clients, or demo adapters.
- Workers depend on services, repositories, model/OCR adapters, and Celery task contexts.
- Audit logging is called by API dependencies and sensitive service methods.

## Adapter Boundaries

- `NLPService` can use deterministic heuristics, spaCy, Hugging Face, or hosted models.
- `RelationshipExtractionService` can use rule-based extraction, transformer classifiers, or LLM
  assisted extraction with provenance constraints.
- `EntityResolutionService` can use normalization, fuzzy matching, embeddings, graph features, and
  human review tasks.
- `GraphService` can use in-memory NetworkX for tests or Neo4j for production. PostgreSQL remains
  authoritative and Neo4j can be rebuilt from PostgreSQL records.
- `SearchService` can use local lexical scoring, PostgreSQL full-text search, or OpenSearch.
- `SemanticSearchService` can use pgvector, Qdrant, Weaviate, OpenSearch, or another vector store
  through the same interface.
- `AssistantService` retrieves evidence chunks, provenance spans, entities, relationships, and case
  notes before using deterministic summaries or an LLM provider.
- `OCRService` is an interface placeholder for Tesseract, cloud OCR, or human transcription.
- `ExportService` produces evidence-linked JSON, CSV, graph exports, and report bundles.
- `ObjectStorageService` stores and retrieves immutable source/artifact objects by opaque URI;
  authorization and hash verification remain in the application service layer.

## Background Job Dependencies

- Ingestion jobs call parser adapters, OCR adapters, NLP services, repository writes, graph sync,
  semantic indexing, and audit logging.
- Analytics jobs call Neo4j/NetworkX analytics, anomaly detectors, PostgreSQL result persistence,
  and review-task creation.
- Export jobs call authorization policy checks, PostgreSQL retrieval, Neo4j projection export,
  file packaging, hashing, audit logging, and optional approval tasks.
- Monitoring reads API health, worker status, queue depth, job duration, error rate, and dependency
  availability.
