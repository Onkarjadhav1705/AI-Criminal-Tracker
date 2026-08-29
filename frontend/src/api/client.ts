import type {
  AnalyticsOverview,
  AssistantAnswer,
  AuditEvent,
  CaseSummary,
  Entity,
  EvidenceItem,
  GeoEvent,
  GraphProjection,
  Job,
  ListResponse,
  Notification,
  ProvenanceSpan,
  Relationship,
  Report,
  ReviewTask,
  SearchResult,
  SystemSetting,
  User
} from "../types/domain";
import {
  demoAnalytics,
  demoAuditEvents,
  demoCases,
  demoEntities,
  demoEvidence,
  demoGeoEvents,
  demoGraph,
  demoJobs,
  demoNotifications,
  demoProvenance,
  demoRelationships,
  demoReports,
  demoReviewTasks,
  demoSettings,
  demoUser,
  searchDemo
} from "./demoData";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
const DATA_MODE = import.meta.env.VITE_DATA_MODE ?? "demo";
export const apiMode = DATA_MODE === "http" ? "REAL BACKEND DATA" : "DEMO DATA";

type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export interface IntelligenceApi {
  login(username: string, password: string): Promise<LoginResponse>;
  me(): Promise<User>;
  listCases(): Promise<ListResponse<CaseSummary>>;
  getCase(caseId: string): Promise<CaseSummary>;
  listEvidence(caseId: string): Promise<ListResponse<EvidenceItem>>;
  getEvidence(caseId: string, evidenceId: string): Promise<EvidenceItem & { provenance: ProvenanceSpan[] }>;
  listEntities(caseId: string): Promise<ListResponse<Entity>>;
  listRelationships(caseId: string): Promise<ListResponse<Relationship>>;
  getGraph(caseId: string): Promise<GraphProjection>;
  getPaths(caseId: string, source: string, target: string): Promise<GraphProjection>;
  getAnalytics(caseId: string): Promise<AnalyticsOverview>;
  recomputeAnalytics(caseId: string): Promise<{ job_id: string; status: string }>;
  getTimeline(caseId: string): Promise<ListResponse<any>>;
  getGeoEvents(caseId: string): Promise<ListResponse<GeoEvent>>;
  getJobs(caseId?: string): Promise<ListResponse<Job>>;
  search(query: string, filters?: Record<string, string>): Promise<ListResponse<SearchResult>>;
  semanticSearch(caseId: string, query: string): Promise<ListResponse<SearchResult>>;
  assistantQuery(caseId: string, question: string): Promise<AssistantAnswer>;
  getReviewTasks(caseId: string): Promise<ListResponse<ReviewTask>>;
  updateReviewTask(taskId: string, status: string, rationale: string): Promise<ReviewTask>;
  getAuditEvents(): Promise<ListResponse<AuditEvent>>;
  getReports(caseId?: string): Promise<ListResponse<Report>>;
  createReport(caseId: string, reportType: string): Promise<{ report_id: string; status: string }>;
  getNotifications(unreadOnly?: boolean): Promise<ListResponse<Notification>>;
  markNotificationRead(notificationId: string): Promise<Notification>;
  getAdminUsers(): Promise<ListResponse<User>>;
  getSettings(): Promise<ListResponse<SystemSetting>>;
  updateSetting(key: string, value: unknown): Promise<SystemSetting>;
  ingestText(payload: { case_id: string; source_name: string; content_text: string; classification: string }): Promise<{ job_id: string; evidence_id: string; status: string }>;
}

function list<T>(items: T[]): ListResponse<T> {
  return { items, page: 1, page_size: items.length || 50, total: items.length };
}

function delay<T>(value: T) {
  return new Promise<T>((resolve) => window.setTimeout(() => resolve(value), 120));
}

const demoApi: IntelligenceApi = {
  login: async () => delay({ access_token: "demo-token", token_type: "bearer", user: demoUser }),
  me: async () => delay(demoUser),
  listCases: async () => delay(list(demoCases)),
  getCase: async (caseId) => delay(demoCases.find((item) => item.id === caseId) ?? demoCases[0]),
  listEvidence: async (caseId) => delay(list(demoEvidence.filter((item) => item.case_id === caseId))),
  getEvidence: async (_caseId, evidenceId) => {
    const evidence = demoEvidence.find((item) => item.id === evidenceId) ?? demoEvidence[0];
    return delay({ ...evidence, provenance: demoProvenance.filter((span) => evidence.provenance_span_ids.includes(span.id)) });
  },
  listEntities: async (caseId) => delay(list(demoEntities.filter((item) => item.cases.includes(caseId)))),
  listRelationships: async () => delay(list(demoRelationships)),
  getGraph: async () => delay(demoGraph),
  getPaths: async (_caseId, source, target) =>
    delay({
      nodes: demoGraph.nodes.filter((node) => [source, target, "ent_003"].includes(node.id)),
      edges: demoGraph.edges.filter((edge) => [source, target, "ent_003"].includes(edge.source) && [source, target, "ent_003"].includes(edge.target))
    }),
  getAnalytics: async () => delay(demoAnalytics),
  recomputeAnalytics: async () => delay({ job_id: "job_recompute_demo", status: "queued" }),
  getTimeline: async () =>
    delay(
      list(
        demoGeoEvents.map((event) => ({
          id: event.id,
          case_id: event.case_id,
          timestamp: event.timestamp,
          event_type: event.event_type,
          title: event.title,
          description: event.description,
          entity_ids: event.entity_ids,
          provenance_span_ids: event.provenance_span_ids,
          confidence: event.confidence
        }))
      )
    ),
  getGeoEvents: async (caseId) => delay(list(demoGeoEvents.filter((item) => item.case_id === caseId))),
  getJobs: async (caseId) => delay(list(caseId ? demoJobs.filter((item) => item.case_id === caseId) : demoJobs)),
  search: async (query) => delay(list(searchDemo(query))),
  semanticSearch: async (_caseId, query) => delay(list(searchDemo(query).map((item) => ({ ...item, summary: `Semantic match: ${item.summary}` })))),
  assistantQuery: async (_caseId, question) =>
    delay({
      answer: `The available synthetic evidence supports exploring "${question}" through cited graph relationships and source records. No unsupported factual conclusion is asserted.`,
      citations: demoProvenance.slice(0, 2).map((span) => ({
        provenance_span_id: span.id,
        evidence_id: span.evidence_id,
        label: demoEvidence.find((item) => item.id === span.evidence_id)?.source_name ?? "Evidence",
        snippet: span.snippet
      })),
      limitations: ["This is an investigative lead, not a finding of guilt.", "Demo mode uses synthetic records only."]
    }),
  getReviewTasks: async (caseId) => delay(list(demoReviewTasks.filter((item) => item.case_id === caseId))),
  updateReviewTask: async (taskId, status) => {
    const task = demoReviewTasks.find((item) => item.id === taskId) ?? demoReviewTasks[0];
    return delay({ ...task, status: status as ReviewTask["status"] });
  },
  getAuditEvents: async () => delay(list(demoAuditEvents)),
  getReports: async (caseId) => delay(list(caseId ? demoReports.filter((item) => item.case_id === caseId) : demoReports)),
  createReport: async () => delay({ report_id: "rep_new_demo", status: "queued" }),
  getNotifications: async (unreadOnly) => delay(list(unreadOnly ? demoNotifications.filter((item) => !item.read_at) : demoNotifications)),
  markNotificationRead: async (notificationId) => {
    const notification = demoNotifications.find((item) => item.id === notificationId) ?? demoNotifications[0];
    return delay({ ...notification, read_at: new Date().toISOString() });
  },
  getAdminUsers: async () => delay(list([demoUser, { id: "usr_auditor", name: "Demo Auditor", email: "auditor@example.test", roles: ["auditor"] }])),
  getSettings: async () => delay(list(demoSettings)),
  updateSetting: async (key, value) => delay({ key, value: String(value), classification: "internal", updated_at: new Date().toISOString() }),
  ingestText: async () => delay({ job_id: "job_ingest_demo", evidence_id: "ev_new_demo", status: "queued" })
};

class HttpClient implements IntelligenceApi {
  private token: string | null = localStorage.getItem("cni_token");

  private async request<T>(path: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...options.headers
      }
    });
    if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText}`);
    return (await response.json()) as T;
  }

  async login(username: string, password: string) {
    const result = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    this.token = result.access_token;
    localStorage.setItem("cni_token", result.access_token);
    return result;
  }

  me = () => this.request<User>("/users/me");
  listCases = () => this.request<ListResponse<CaseSummary>>("/cases");
  getCase = (caseId: string) => this.request<CaseSummary>(`/cases/${caseId}`);
  listEvidence = (caseId: string) => this.request<ListResponse<EvidenceItem>>(`/cases/${caseId}/evidence`);
  getEvidence = (caseId: string, evidenceId: string) => this.request<EvidenceItem & { provenance: ProvenanceSpan[] }>(`/cases/${caseId}/evidence/${evidenceId}`);
  listEntities = (caseId: string) => this.request<ListResponse<Entity>>(`/cases/${caseId}/entities`);
  listRelationships = (caseId: string) => this.request<ListResponse<Relationship>>(`/cases/${caseId}/relationships`);
  getGraph = (caseId: string) => this.request<GraphProjection>(`/graph?case_id=${encodeURIComponent(caseId)}`);
  getPaths = (caseId: string, source: string, target: string) => this.request<GraphProjection>(`/graph/paths?case_id=${encodeURIComponent(caseId)}&source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`);
  getAnalytics = (caseId: string) => this.request<AnalyticsOverview>(`/analytics/overview?case_id=${encodeURIComponent(caseId)}`);
  recomputeAnalytics = (caseId: string) => this.request<{ job_id: string; status: string }>("/analytics/recompute", { method: "POST", body: JSON.stringify({ case_id: caseId }) });
  getTimeline = (caseId: string) => this.request<ListResponse<any>>(`/timeline?case_id=${encodeURIComponent(caseId)}`);
  getGeoEvents = (caseId: string) => this.request<ListResponse<GeoEvent>>(`/geo/events?case_id=${encodeURIComponent(caseId)}`);
  getJobs = (caseId?: string) => this.request<ListResponse<Job>>(`/jobs${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ""}`);
  search = (query: string, filters: Record<string, string> = {}) => this.request<ListResponse<SearchResult>>(`/search?${new URLSearchParams({ q: query, ...filters }).toString()}`);
  semanticSearch = (caseId: string, query: string) => this.request<ListResponse<SearchResult>>("/search/semantic", { method: "POST", body: JSON.stringify({ case_id: caseId, q: query }) });
  assistantQuery = (caseId: string, question: string) => this.request<AssistantAnswer>("/assistant/query", { method: "POST", body: JSON.stringify({ case_id: caseId, question }) });
  getReviewTasks = (caseId: string) => this.request<ListResponse<ReviewTask>>(`/review/tasks?case_id=${encodeURIComponent(caseId)}`);
  updateReviewTask = (taskId: string, status: string, rationale: string) => this.request<ReviewTask>(`/review/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ status, rationale }) });
  getAuditEvents = () => this.request<ListResponse<AuditEvent>>("/audit/events");
  getReports = (caseId?: string) => this.request<ListResponse<Report>>(`/reports${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ""}`);
  createReport = (caseId: string, reportType: string) => this.request<{ report_id: string; status: string }>("/reports", { method: "POST", body: JSON.stringify({ case_id: caseId, report_type: reportType }) });
  getNotifications = (unreadOnly?: boolean) => this.request<ListResponse<Notification>>(`/notifications${unreadOnly ? "?unread_only=true" : ""}`);
  markNotificationRead = (notificationId: string) => this.request<Notification>(`/notifications/${notificationId}/read`, { method: "PATCH" });
  getAdminUsers = () => this.request<ListResponse<User>>("/admin/users");
  getSettings = () => this.request<ListResponse<SystemSetting>>("/admin/settings");
  updateSetting = (key: string, value: unknown) => this.request<SystemSetting>(`/admin/settings/${key}`, { method: "PATCH", body: JSON.stringify({ value }) });
  ingestText = (payload: { case_id: string; source_name: string; content_text: string; classification: string }) => this.request<{ job_id: string; evidence_id: string; status: string }>("/ingestion/text", { method: "POST", body: JSON.stringify(payload) });
}

export const api: IntelligenceApi = DATA_MODE === "http" ? new HttpClient() : demoApi;
