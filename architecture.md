# Criminal Network Intelligence Platform Architecture

## Purpose and Safety Boundary

This platform supports authorized investigation workflows. It stores evidence, provenance,
confidence scores, extracted entities, graph relationships, and analytical indicators. It must
never automatically declare that a person is guilty, criminal, or culpable because of an AI model
or graph score. All high-impact findings are presented as leads for human review.

## System Context

Investigators interact with a React dashboard backed by a FastAPI service layer. The backend
coordinates case management, ingestion, search, entity extraction, entity resolution, graph
projection, analytics, audit logging, and assistant responses. PostgreSQL is the system of record,
Neo4j stores the operational knowledge graph, Redis supports background jobs and caching, and a
vector store interface enables semantic search. Source evidence and extracted intelligence always
retain provenance pointers back to immutable evidence records and text spans.

## Technology Baseline

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui-compatible primitives, TanStack Query,
  React Router, Cytoscape.js, Leaflet, Recharts, and Framer Motion.
- Backend: Python, FastAPI, Pydantic, SQLAlchemy, Alembic, Celery, Redis, centralized exception
  handling, dependency injection, and structured logging.
- AI/NLP: spaCy, Hugging Face Transformers, Sentence Transformers, scikit-learn, configurable model
  adapters, and an OCR interface initially backed by pluggable providers such as Tesseract or a
  managed OCR service.
- Datastores: PostgreSQL for transactional data and full-text search, optional pgvector for local
  semantic retrieval, Neo4j for the knowledge graph, Redis for jobs/cache/rate-limit state, and an
  S3-compatible object-storage adapter for immutable source files and generated artifacts.
- Graph analytics: Neo4j Graph Data Science where available, NetworkX for tests and local fallback.
- Infrastructure: Docker Compose for development, Kubernetes-ready service boundaries, Nginx/API
  gateway, Prometheus, Grafana, and environment-driven secrets.

## Logical Services

- API Gateway and Auth: OAuth2/JWT, RBAC checks, request validation, rate limiting, audit context.
- Case Service: cases, evidence packages, notes, assignments, review state.
- Ingestion Service: CSV, JSON, TXT, PDF, DOCX, XLSX parsing, normalization, deduplication, import
  manifests, and export packages.
- OCR Service: image/PDF OCR abstraction that can run synchronously for small files or as Celery
  tasks for larger batches.
- NLP Service: entity extraction, relationship extraction, confidence scoring, explainability.
- Entity Resolution Service: canonical entity matching with human verification queues.
- Graph Service: Neo4j persistence, graph export for UI, path search, graph analytics, and graph
  synchronization from PostgreSQL events.
- Search Service: PostgreSQL full-text and semantic-search abstraction.
- Analytics Service: centrality, communities, suspicious patterns, anomalies, timelines, maps.
- Assistant Service: retrieval-grounded investigation assistant with source citations from evidence
  chunks, provenance spans, entities, relationships, and case notes.
- Audit Service: immutable security and investigation activity events.
- Worker Service: Celery tasks for parsing, OCR, NLP, entity resolution, graph sync, analytics,
  semantic indexing, enrichment, imports, exports, and report generation.
- Monitoring Service: metrics, traces/log correlation, health checks, job status, and operational
  alerts.

## Data Flow

1. Investigator uploads synthetic or approved case material.
2. Ingestion Service stores the raw evidence object, source hash, access policy, and import job.
3. Parser extracts text and structured rows.
4. OCR Service extracts text from image-based evidence when needed.
5. NLP Service extracts entities and relationships with model metadata, text spans, confidence,
   and explainability details.
6. Entity Resolution Service proposes canonical entities and queues uncertain matches.
7. PostgreSQL stores evidence, chunks, provenance spans, extracted entities, relationships, review
   tasks, case notes, analytics artifacts, reports, notifications, exports, and audit events as the
   authoritative record.
8. Graph Service projects eligible entities and relationships into Neo4j while preserving
   PostgreSQL IDs on graph nodes/edges.
9. Analytics Service computes indicators and stores explanations linked to graph/evidence IDs.
10. Search Service indexes text, metadata, graph labels, and embeddings for retrieval.
11. UI presents evidence-linked findings for investigator review.

## Storage Responsibilities

- PostgreSQL is authoritative for users, RBAC assignments, cases, evidence metadata, extracted text,
  extracted entities, extracted relationships, provenance spans, review decisions, notes, jobs,
  exports, audit events, model-run metadata, and API-visible state.
- Neo4j is authoritative only for graph traversal/projection workloads. Neo4j nodes and edges carry
  PostgreSQL IDs and provenance references; if records disagree, PostgreSQL wins and Neo4j is
  re-synchronized.
- Vector storage holds evidence chunks and embeddings for semantic retrieval. PostgreSQL `pgvector`
  is the default local option; the same repository contract can target Qdrant, Weaviate, OpenSearch,
  or managed vector stores.
- Object storage holds immutable source binaries and generated report/export artifacts; PostgreSQL
  stores their URI, hash, content metadata, access policy, and lifecycle state.
- Redis stores transient cache, Celery broker/result data, distributed locks, and rate-limit state.

## Deployment Topology

- `frontend`: Vite/React static app served by Nginx.
- `backend`: FastAPI application.
- `worker`: Celery worker using the same backend codebase.
- `postgres`: transactional data, full-text search, optional pgvector.
- `neo4j`: knowledge graph and graph analytics integration.
- `redis`: cache and job broker.
- `nginx`: local API gateway / static frontend entry.
- `prometheus`: metrics collection.
- `grafana`: dashboards.

## Background Processing

Large or long-running work is submitted as jobs. API endpoints create job records in PostgreSQL,
enqueue Celery tasks in Redis, and return a job ID. Workers update job status, emit audit events,
write extraction/model-run outputs to PostgreSQL, synchronize Neo4j projections, and update search
indexes. Job creation uses an idempotency key and a transactional outbox so a committed database
record cannot be lost between PostgreSQL and Redis. Retries are bounded, failed jobs are retained
with redacted diagnostics, and dead-letter handling is observable. Small text ingestion can run
inline in development, but production ingestion, OCR, NLP, analytics, imports, exports, and
semantic indexing must use the worker path.

## Security Controls

- JWT-based API authentication with role claims.
- RBAC policy checks at endpoint and service layers.
- Case-level access checks enforce membership/assignment before returning evidence, graph,
  assistant, export, or analytics data.
- Password hashing via Argon2/bcrypt.
- Structured audit events for case reads, uploads, exports, auth events, and assistant queries.
- Environment-driven secrets only; no hardcoded credentials.
- Validation through Pydantic schemas.
- Rate-limit middleware ready for Redis-backed distributed limits.
- TLS termination ready at gateway level.
- Encryption-at-rest architecture documented for PostgreSQL volume, object store, backups, and
  application-level field encryption for sensitive attributes.

## AI Governance

- Every extracted entity and relationship stores source document, text span, model version,
  confidence, and extraction method.
- Assistant responses must include provenance and uncertainty.
- Assistant retrieval must query case-scoped PostgreSQL records, provenance spans, evidence chunks,
  and semantic index results before calling any LLM adapter.
- Suspicious-pattern and anomaly outputs are indicators, not accusations.
- Low-confidence entity resolution creates review tasks instead of silently merging records.
- Model and prompt changes are versioned and auditable.
- Report generation, notification delivery, and system-setting changes are also persisted and
  auditable; UI pages must not invent state that has no API-backed record.

## Requirement Coverage

The architecture covers ingestion, parsing, PDF/document extraction, OCR readiness, normalization,
NER, entity resolution, relationship extraction, knowledge graph construction, graph visualization,
centrality/community/path analytics, suspicious-pattern and anomaly indicators, timeline and
geospatial analysis, case management, dashboard workflows, advanced search, provenance, assistant
retrieval, RBAC, audit logging, encryption architecture, secure APIs, explainability,
human-in-the-loop verification, import/export, monitoring, automated tests, Docker deployment, and
production-ready service boundaries.

## Initial Implementation Scope

The first vertical slice in this repository uses synthetic demo data and deterministic local
heuristics so the platform runs without proprietary data or paid services. The code is structured
so production adapters for PostgreSQL, Neo4j, Redis, embeddings, and OCR can replace the demo
repository without changing API contracts.
