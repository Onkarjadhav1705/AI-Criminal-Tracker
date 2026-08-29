export type Role = "admin" | "lead_investigator" | "investigator" | "analyst" | "auditor";

export type User = {
  id: string;
  name: string;
  email?: string;
  roles: Role[];
};

export type ListResponse<T> = {
  items: T[];
  page: number;
  page_size: number;
  total: number;
};

export type CaseSummary = {
  id: string;
  title: string;
  summary: string;
  status: "active" | "review" | "closed" | "archived";
  sensitivity: "training-restricted" | "confidential" | "sensitive";
  owner_user_id: string;
  updated_at: string;
  entity_count: number;
  relationship_count: number;
  evidence_count: number;
  anomaly_count: number;
  priority: "standard" | "elevated" | "high";
};

export type EvidenceItem = {
  id: string;
  case_id: string;
  source_type: string;
  source_name: string;
  content_type: string;
  sha256: string;
  created_at: string;
  snippet: string;
  provenance_span_ids: string[];
};

export type ProvenanceSpan = {
  id: string;
  evidence_id: string;
  case_id: string;
  snippet: string;
  page_number?: number;
  line_start?: number;
  line_end?: number;
  extraction_method: string;
  confidence: number;
};

export type Entity = {
  id: string;
  label: string;
  entity_type: "person" | "organization" | "location" | "asset" | "phone" | "vehicle" | "event";
  aliases: string[];
  confidence: number;
  verified: boolean;
  resolution_status: "canonical" | "needs_review" | "merged";
  cases: string[];
  phones?: string[];
  vehicles?: string[];
  locations?: string[];
  organizations?: string[];
  provenance_span_ids: string[];
  notes?: string;
};

export type Relationship = {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: string;
  confidence: number;
  verified: boolean;
  provenance_span_ids: string[];
};

export type GraphNode = Pick<Entity, "id" | "label" | "entity_type" | "confidence" | "verified"> & {
  type?: Entity["entity_type"];
  community?: number;
  analytical_priority?: number;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  confidence: number;
  provenance_span_ids: string[];
  verified: boolean;
  suspicious?: boolean;
};

export type GraphProjection = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type TimelineEvent = {
  id: string;
  case_id: string;
  timestamp: string;
  event_type: string;
  title: string;
  description: string;
  entity_ids: string[];
  provenance_span_ids: string[];
  confidence: number;
};

export type GeoEvent = TimelineEvent & {
  latitude: number;
  longitude: number;
  connected_entity_ids: string[];
};

export type Job = {
  id: string;
  case_id?: string;
  job_type: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  created_at: string;
  error_message?: string;
};

export type AnalyticsOverview = {
  run_id: string;
  graph_metrics: { nodes: number; edges: number; density: number; communities: number };
  centrality: Array<{ entity_id: string; label: string; score: number; explanation: string }>;
  communities: Array<{ id: string; label: string; size: number; cohesion: number }>;
  anomalies: Array<{ id: string; title: string; score: number; status: string; provenance_span_ids: string[] }>;
  suspicious_patterns: Array<{ id: string; title: string; severity: "low" | "medium" | "high"; evidence_count: number }>;
  score_semantics: string;
};

export type SearchResult = {
  id: string;
  type: "person" | "phone" | "vehicle" | "organization" | "location" | "case" | "document" | "transaction" | "event";
  title: string;
  summary: string;
  confidence: number;
  case_id?: string;
  provenance_span_ids: string[];
};

export type AssistantAnswer = {
  answer: string;
  citations: Array<{ provenance_span_id: string; evidence_id: string; label: string; snippet: string }>;
  limitations: string[];
};

export type ReviewTask = {
  id: string;
  case_id: string;
  subject_type: string;
  subject_id: string;
  reason: string;
  status: "open" | "accepted" | "rejected" | "resolved";
  assigned_to?: string;
  created_at: string;
};

export type AuditEvent = {
  id: string;
  actor_user_id?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
  metadata: Record<string, unknown>;
};

export type Report = {
  id: string;
  case_id: string;
  report_type: string;
  status: "queued" | "running" | "completed" | "failed";
  created_at: string;
  artifact_uri?: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  notification_type: string;
  read_at?: string;
  created_at: string;
  case_id?: string;
};

export type SystemSetting = {
  key: string;
  value: string | number | boolean;
  classification: "public" | "internal";
  updated_at: string;
};
