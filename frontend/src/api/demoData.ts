import type {
  AnalyticsOverview,
  AuditEvent,
  CaseSummary,
  Entity,
  EvidenceItem,
  GeoEvent,
  GraphProjection,
  Job,
  Notification,
  ProvenanceSpan,
  Relationship,
  Report,
  ReviewTask,
  SearchResult,
  SystemSetting,
  User
} from "../types/domain";

const now = new Date("2026-08-26T08:30:00.000Z");
const iso = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();

export const demoUser: User = {
  id: "usr_demo_investigator",
  name: "Demo Investigator",
  email: "investigator@example.test",
  roles: ["lead_investigator", "investigator", "analyst"]
};

export const demoCases: CaseSummary[] = [
  {
    id: "case_demo_001",
    title: "North Pier Communications Review",
    summary: "Synthetic case tracking communications, meetings, vehicles, and document references around a port district.",
    status: "active",
    sensitivity: "training-restricted",
    owner_user_id: demoUser.id,
    updated_at: iso(2),
    entity_count: 38,
    relationship_count: 71,
    evidence_count: 24,
    anomaly_count: 5,
    priority: "high"
  },
  {
    id: "case_demo_002",
    title: "Warehouse Access Pattern",
    summary: "Synthetic access logs, shipping manifests, and location events prepared for model and UI testing.",
    status: "review",
    sensitivity: "confidential",
    owner_user_id: demoUser.id,
    updated_at: iso(9),
    entity_count: 26,
    relationship_count: 49,
    evidence_count: 18,
    anomaly_count: 3,
    priority: "elevated"
  },
  {
    id: "case_demo_003",
    title: "Vehicle Movement Correlation",
    summary: "Training-only vehicle, toll, and sighting records with provenance-linked map and timeline events.",
    status: "active",
    sensitivity: "training-restricted",
    owner_user_id: demoUser.id,
    updated_at: iso(16),
    entity_count: 19,
    relationship_count: 33,
    evidence_count: 11,
    anomaly_count: 1,
    priority: "standard"
  }
];

export const demoProvenance: ProvenanceSpan[] = [
  {
    id: "prov_001",
    evidence_id: "ev_001",
    case_id: "case_demo_001",
    snippet: "Jordan Vale called Mira Stone near North Pier Terminal at 22:14.",
    line_start: 4,
    line_end: 4,
    extraction_method: "deterministic_demo_ner",
    confidence: 0.9
  },
  {
    id: "prov_002",
    evidence_id: "ev_002",
    case_id: "case_demo_001",
    snippet: "Blue van AX-417 was observed at Gate 3 shortly before the meeting.",
    page_number: 2,
    extraction_method: "pdf_text_parser",
    confidence: 0.84
  },
  {
    id: "prov_003",
    evidence_id: "ev_003",
    case_id: "case_demo_001",
    snippet: "Common contact: North Star Logistics dispatcher number +1-555-0142.",
    extraction_method: "csv_parser",
    confidence: 0.88
  }
];

export const demoEvidence: EvidenceItem[] = [
  {
    id: "ev_001",
    case_id: "case_demo_001",
    source_type: "txt",
    source_name: "Synthetic incident note",
    content_type: "text/plain",
    sha256: "demo-hash-001",
    created_at: iso(18),
    snippet: demoProvenance[0].snippet,
    provenance_span_ids: ["prov_001"]
  },
  {
    id: "ev_002",
    case_id: "case_demo_001",
    source_type: "pdf",
    source_name: "Training surveillance extract",
    content_type: "application/pdf",
    sha256: "demo-hash-002",
    created_at: iso(14),
    snippet: demoProvenance[1].snippet,
    provenance_span_ids: ["prov_002"]
  },
  {
    id: "ev_003",
    case_id: "case_demo_001",
    source_type: "csv",
    source_name: "Synthetic contact ledger",
    content_type: "text/csv",
    sha256: "demo-hash-003",
    created_at: iso(7),
    snippet: demoProvenance[2].snippet,
    provenance_span_ids: ["prov_003"]
  }
];

export const demoEntities: Entity[] = [
  {
    id: "ent_001",
    label: "Jordan Vale",
    entity_type: "person",
    aliases: ["J. Vale"],
    confidence: 0.91,
    verified: false,
    resolution_status: "needs_review",
    cases: ["case_demo_001"],
    phones: ["+1-555-0188"],
    vehicles: ["AX-417"],
    locations: ["North Pier Terminal"],
    organizations: ["North Star Logistics"],
    provenance_span_ids: ["prov_001", "prov_002"],
    notes: "High analytical priority due to bridge position in the synthetic graph."
  },
  {
    id: "ent_002",
    label: "Mira Stone",
    entity_type: "person",
    aliases: ["M. Stone"],
    confidence: 0.87,
    verified: true,
    resolution_status: "canonical",
    cases: ["case_demo_001"],
    phones: ["+1-555-0199"],
    locations: ["Pier 7 Office"],
    provenance_span_ids: ["prov_001"]
  },
  {
    id: "ent_003",
    label: "North Star Logistics",
    entity_type: "organization",
    aliases: ["NSL"],
    confidence: 0.82,
    verified: false,
    resolution_status: "needs_review",
    cases: ["case_demo_001", "case_demo_002"],
    phones: ["+1-555-0142"],
    locations: ["Warehouse C"],
    provenance_span_ids: ["prov_003"]
  },
  {
    id: "ent_004",
    label: "Blue van AX-417",
    entity_type: "vehicle",
    aliases: ["AX-417"],
    confidence: 0.8,
    verified: false,
    resolution_status: "needs_review",
    cases: ["case_demo_001"],
    vehicles: ["AX-417"],
    locations: ["Gate 3"],
    provenance_span_ids: ["prov_002"]
  },
  {
    id: "ent_005",
    label: "North Pier Terminal",
    entity_type: "location",
    aliases: ["NPT"],
    confidence: 0.95,
    verified: true,
    resolution_status: "canonical",
    cases: ["case_demo_001"],
    provenance_span_ids: ["prov_001", "prov_002"]
  },
  {
    id: "ent_006",
    label: "+1-555-0142",
    entity_type: "phone",
    aliases: ["dispatcher line"],
    confidence: 0.88,
    verified: false,
    resolution_status: "canonical",
    cases: ["case_demo_001"],
    organizations: ["North Star Logistics"],
    provenance_span_ids: ["prov_003"]
  }
];

export const demoRelationships: Relationship[] = [
  {
    id: "rel_001",
    source_entity_id: "ent_001",
    target_entity_id: "ent_002",
    relationship_type: "communicated_with",
    confidence: 0.78,
    verified: false,
    provenance_span_ids: ["prov_001"]
  },
  {
    id: "rel_002",
    source_entity_id: "ent_001",
    target_entity_id: "ent_004",
    relationship_type: "linked_to",
    confidence: 0.72,
    verified: false,
    provenance_span_ids: ["prov_002"]
  },
  {
    id: "rel_003",
    source_entity_id: "ent_001",
    target_entity_id: "ent_003",
    relationship_type: "associated_with",
    confidence: 0.69,
    verified: false,
    provenance_span_ids: ["prov_003"]
  },
  {
    id: "rel_004",
    source_entity_id: "ent_003",
    target_entity_id: "ent_006",
    relationship_type: "uses_contact",
    confidence: 0.88,
    verified: true,
    provenance_span_ids: ["prov_003"]
  },
  {
    id: "rel_005",
    source_entity_id: "ent_004",
    target_entity_id: "ent_005",
    relationship_type: "observed_at",
    confidence: 0.84,
    verified: false,
    provenance_span_ids: ["prov_002"]
  }
];

export const demoGraph: GraphProjection = {
  nodes: demoEntities.map((entity, index) => ({
    id: entity.id,
    label: entity.label,
    entity_type: entity.entity_type,
    type: entity.entity_type,
    confidence: entity.confidence,
    verified: entity.verified,
    community: index < 3 ? 1 : 2,
    analytical_priority: entity.id === "ent_001" ? 0.92 : entity.confidence - 0.1
  })),
  edges: demoRelationships.map((relationship) => ({
    id: relationship.id,
    source: relationship.source_entity_id,
    target: relationship.target_entity_id,
    type: relationship.relationship_type,
    confidence: relationship.confidence,
    provenance_span_ids: relationship.provenance_span_ids,
    verified: relationship.verified,
    suspicious: relationship.confidence < 0.75
  }))
};

export const demoTimeline = [
  {
    id: "evt_001",
    case_id: "case_demo_001",
    timestamp: iso(36),
    event_type: "document",
    title: "Contact ledger imported",
    description: "Synthetic contact ledger created common-contact evidence.",
    entity_ids: ["ent_003", "ent_006"],
    provenance_span_ids: ["prov_003"],
    confidence: 0.88
  },
  {
    id: "evt_002",
    case_id: "case_demo_001",
    timestamp: iso(20),
    event_type: "observation",
    title: "Vehicle observed near Gate 3",
    description: "Training surveillance extract placed AX-417 near the terminal.",
    entity_ids: ["ent_004", "ent_005"],
    provenance_span_ids: ["prov_002"],
    confidence: 0.84
  },
  {
    id: "evt_003",
    case_id: "case_demo_001",
    timestamp: iso(15),
    event_type: "communication",
    title: "Call between Jordan Vale and Mira Stone",
    description: "Incident note references a phone call near North Pier Terminal.",
    entity_ids: ["ent_001", "ent_002", "ent_005"],
    provenance_span_ids: ["prov_001"],
    confidence: 0.78
  }
];

export const demoGeoEvents: GeoEvent[] = [
  { ...demoTimeline[0], latitude: 40.706, longitude: -74.004, connected_entity_ids: ["ent_003", "ent_006"] },
  { ...demoTimeline[1], latitude: 40.712, longitude: -74.012, connected_entity_ids: ["ent_004", "ent_005"] },
  { ...demoTimeline[2], latitude: 40.716, longitude: -74.008, connected_entity_ids: ["ent_001", "ent_002", "ent_005"] }
];

export const demoJobs: Job[] = [
  { id: "job_001", case_id: "case_demo_001", job_type: "nlp_extraction", status: "running", progress: 0.62, created_at: iso(1) },
  { id: "job_002", case_id: "case_demo_001", job_type: "graph_sync", status: "completed", progress: 1, created_at: iso(5) },
  { id: "job_003", case_id: "case_demo_002", job_type: "ocr", status: "queued", progress: 0.08, created_at: iso(3) }
];

export const demoAnalytics: AnalyticsOverview = {
  run_id: "run_demo_001",
  graph_metrics: { nodes: 38, edges: 71, density: 0.11, communities: 4 },
  centrality: [
    { entity_id: "ent_001", label: "Jordan Vale", score: 0.92, explanation: "Connects person, vehicle, location, and organization clusters." },
    { entity_id: "ent_003", label: "North Star Logistics", score: 0.81, explanation: "Shared organization across two synthetic cases." },
    { entity_id: "ent_005", label: "North Pier Terminal", score: 0.76, explanation: "Common location for communications and observations." }
  ],
  communities: [
    { id: "com_1", label: "Communications", size: 14, cohesion: 0.72 },
    { id: "com_2", label: "Logistics", size: 11, cohesion: 0.65 },
    { id: "com_3", label: "Locations", size: 8, cohesion: 0.58 }
  ],
  anomalies: [
    { id: "anom_001", title: "Low-confidence bridge relationship", score: 0.79, status: "open", provenance_span_ids: ["prov_003"] },
    { id: "anom_002", title: "Vehicle-location timing cluster", score: 0.71, status: "review", provenance_span_ids: ["prov_002"] }
  ],
  suspicious_patterns: [
    { id: "pat_001", title: "Common contact across unrelated records", severity: "medium", evidence_count: 3 },
    { id: "pat_002", title: "Repeated meeting-location sequence", severity: "low", evidence_count: 2 }
  ],
  score_semantics: "Scores are analytical priority indicators for human review, not accusations or findings of guilt."
};

export const demoReviewTasks: ReviewTask[] = [
  {
    id: "task_001",
    case_id: "case_demo_001",
    subject_type: "relationship",
    subject_id: "rel_003",
    reason: "Moderate confidence association needs analyst verification.",
    status: "open",
    assigned_to: demoUser.id,
    created_at: iso(6)
  },
  {
    id: "task_002",
    case_id: "case_demo_001",
    subject_type: "entity_resolution",
    subject_id: "ent_001",
    reason: "Alias merge requires human confirmation.",
    status: "open",
    assigned_to: demoUser.id,
    created_at: iso(8)
  }
];

export const demoAuditEvents: AuditEvent[] = [
  { id: "aud_001", actor_user_id: demoUser.id, action: "case.read", resource_type: "case", resource_id: "case_demo_001", created_at: iso(1), metadata: { mode: "demo" } },
  { id: "aud_002", actor_user_id: demoUser.id, action: "assistant.query", resource_type: "case", resource_id: "case_demo_001", created_at: iso(2), metadata: { citations: 2 } },
  { id: "aud_003", action: "worker.graph_sync", resource_type: "job", resource_id: "job_002", created_at: iso(5), metadata: { status: "completed" } }
];

export const demoReports: Report[] = [
  { id: "rep_001", case_id: "case_demo_001", report_type: "investigation_summary", status: "completed", created_at: iso(22), artifact_uri: "s3://demo/reports/rep_001.pdf" },
  { id: "rep_002", case_id: "case_demo_001", report_type: "provenance_manifest", status: "running", created_at: iso(1) }
];

export const demoNotifications: Notification[] = [
  { id: "not_001", title: "Review task assigned", body: "Two extracted relationships need human verification.", notification_type: "review", created_at: iso(2), case_id: "case_demo_001" },
  { id: "not_002", title: "Analytics run completed", body: "Graph centrality and anomaly indicators are ready.", notification_type: "analytics", read_at: iso(1), created_at: iso(5), case_id: "case_demo_001" }
];

export const demoSettings: SystemSetting[] = [
  { key: "demo_mode", value: true, classification: "internal", updated_at: iso(48) },
  { key: "semantic_search_backend", value: "pgvector", classification: "internal", updated_at: iso(48) },
  { key: "max_upload_mb", value: 100, classification: "internal", updated_at: iso(48) }
];

export function searchDemo(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  const entityResults = demoEntities
    .filter((entity) => !q || entity.label.toLowerCase().includes(q) || entity.aliases.some((alias) => alias.toLowerCase().includes(q)))
    .map<SearchResult>((entity) => ({
      id: entity.id,
      type: entity.entity_type === "asset" ? "vehicle" : entity.entity_type,
      title: entity.label,
      summary: `${entity.entity_type} with ${Math.round(entity.confidence * 100)}% extraction confidence.`,
      confidence: entity.confidence,
      case_id: entity.cases[0],
      provenance_span_ids: entity.provenance_span_ids
    }));

  const caseResults = demoCases
    .filter((item) => !q || item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q))
    .map<SearchResult>((item) => ({
      id: item.id,
      type: "case",
      title: item.title,
      summary: item.summary,
      confidence: 1,
      case_id: item.id,
      provenance_span_ids: []
    }));

  const evidenceResults = demoEvidence
    .filter((item) => !q || item.source_name.toLowerCase().includes(q) || item.snippet.toLowerCase().includes(q))
    .map<SearchResult>((item) => ({
      id: item.id,
      type: "document",
      title: item.source_name,
      summary: item.snippet,
      confidence: 0.86,
      case_id: item.case_id,
      provenance_span_ids: item.provenance_span_ids
    }));

  return [...entityResults, ...caseResults, ...evidenceResults].slice(0, 20);
}
