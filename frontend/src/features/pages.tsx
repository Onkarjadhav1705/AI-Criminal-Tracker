import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, CheckCircle2, Filter, Lock, Plus, Search as SearchIcon, Send, Upload } from "lucide-react";
import { api, apiMode } from "../api/client";
import {
  useAdminUsers,
  useAnalytics,
  useAssistantQuery,
  useAuditEvents,
  useCase,
  useCases,
  useCreateReport,
  useEntities,
  useEvidence,
  useGeoEvents,
  useGraph,
  useIngestText,
  useJobs,
  useNotifications,
  useRelationships,
  useReports,
  useReviewTasks,
  useSearch,
  useSettings,
  useTimeline,
  useUpdateSetting
} from "../api/hooks";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Field, Input, Select, Textarea } from "../components/ui/forms";
import { DataTable } from "../components/ui/table";
import { EmptyState, ErrorState, LoadingState, Skeleton } from "../components/ui/states";
import { ClassificationBadge, unavailable } from "../components/ui/classification";
import { Tabs, TabPanel } from "../components/ui/tabs";
import { useAuth } from "../lib/auth";
import { compactNumber, formatDate, pct } from "../lib/utils";
import type { CaseSummary, Entity, EvidenceItem, Relationship } from "../types/domain";
import { ActivityAreaChart, PriorityBarChart, TrendLineChart } from "./dashboard/Charts";
import { entityById, InvestigationGraph } from "./graph/InvestigationGraph";
import { IntelligenceMap } from "./map/IntelligenceMap";

function useCaseId() {
  return useParams().caseId ?? "case_demo_001";
}

function QueryFrame<T>({ query, children }: { query: { isLoading: boolean; isError: boolean; error: unknown; refetch: () => void; data?: T }; children: (data: T) => JSX.Element }) {
  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  if (!query.data) return <EmptyState title="No data" body="The API returned no payload for this view." />;
  return children(query.data);
}

function StatCard({ label, value, tone = "blue" }: { label: string; value: string | number; tone?: "blue" | "amber" | "green" | "red" }) {
  return (
    <Card>
      <div className={`text-xs font-semibold uppercase ${tone === "amber" ? "text-amber" : tone === "green" ? "text-success" : tone === "red" ? "text-danger" : "text-accent"}`}>{label}</div>
      <div className="mt-2 text-2xl font-semibold text-text">{value}</div>
    </Card>
  );
}

function SafetyNotice() {
  return (
    <div className="rounded-lg border border-amber/30 bg-amber/8 p-3 text-xs leading-5 text-muted">
      Analytical priority, anomaly, and pattern indicators are leads for human review. They are not declarations of guilt, culpability, or criminal status.
    </div>
  );
}

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("investigator@example.test");
  const [password, setPassword] = useState("demo-password");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await auth.login(username, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-accent/15 text-accent"><Lock className="h-5 w-5" /></div>
            <div>
              <h1 className="text-xl font-semibold text-text">Investigator Access</h1>
              <p className="text-sm text-muted">Authorized investigation-support workspace</p>
            </div>
          </div>
          <form className="grid gap-4" onSubmit={submit}>
            <Field label="Email"><Input value={username} onChange={(event) => setUsername(event.target.value)} /></Field>
            <Field label="Password"><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></Field>
            {error ? <div className="rounded-md border border-danger/40 bg-danger/10 p-2 text-sm text-danger">{error}</div> : null}
            <Button variant="primary" type="submit">Sign in</Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

export function DashboardPage() {
  const cases = useCases();
  const jobs = useJobs();
  const analytics = useAnalytics("case_demo_001");
  const audit = useAuditEvents();

  return (
    <>
      <PageTitle title="Command Dashboard" description="Operational view across investigations, processing jobs, graph indicators, and system health." />
      <QueryFrame query={cases}>
        {(caseData) => {
          const active = caseData.items.filter((item) => item.status === "active").length;
          const entities = caseData.items.reduce((sum, item) => sum + item.entity_count, 0);
          const rels = caseData.items.reduce((sum, item) => sum + item.relationship_count, 0);
          const anomalies = caseData.items.reduce((sum, item) => sum + item.anomaly_count, 0);
          return (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard label="Active investigations" value={active} />
                <StatCard label="Entities analyzed" value={compactNumber(entities)} tone="green" />
                <StatCard label="Relationships" value={compactNumber(rels)} />
                <StatCard label="Unresolved anomalies" value={anomalies} tone="amber" />
                <StatCard label="High-priority cases" value={caseData.items.filter((item) => item.priority === "high").length} tone="red" />
              </div>
              <IntelligencePriorities cases={caseData.items} />
              <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
                <Card>
                  <CardHeader><CardTitle>Activity and Pattern Trend</CardTitle></CardHeader>
                  <TrendLineChart data={[{ name: "Mon", relationships: 19, anomalies: 2 }, { name: "Tue", relationships: 28, anomalies: 3 }, { name: "Wed", relationships: 35, anomalies: 5 }, { name: "Thu", relationships: 31, anomalies: 4 }, { name: "Fri", relationships: 44, anomalies: 6 }]} />
                </Card>
                <Card>
                  <CardHeader><CardTitle>Processing Jobs</CardTitle></CardHeader>
                  <QueryFrame query={jobs}>
                    {(jobData) => <JobList jobs={jobData.items} />}
                  </QueryFrame>
                </Card>
              </div>
              <div className="grid gap-4 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                  <CardHeader><CardTitle>High Priority Cases</CardTitle></CardHeader>
                  <CaseCards cases={caseData.items} />
                </Card>
                <Card>
                  <CardHeader><CardTitle>System Health</CardTitle><Badge tone="green">demo adapter</Badge></CardHeader>
                  <div className="grid gap-3 text-sm">
                    {["API gateway", "PostgreSQL contract", "Neo4j projection", "Worker queue"].map((item) => (
                      <div key={item} className="flex items-center justify-between border-b border-border/60 pb-2"><span className="text-muted">{item}</span><Badge tone="green">available</Badge></div>
                    ))}
                  </div>
                </Card>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Graph Statistics</CardTitle></CardHeader>
                  <QueryFrame query={analytics}>{(data) => <PriorityBarChart data={[{ name: "Nodes", value: data.graph_metrics.nodes }, { name: "Edges", value: data.graph_metrics.edges }, { name: "Communities", value: data.graph_metrics.communities }, { name: "Anomalies", value: data.anomalies.length }]} />}</QueryFrame>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                  <QueryFrame query={audit}>{(data) => <ActivityList items={data.items.map((item) => `${item.action} on ${item.resource_type} at ${formatDate(item.created_at)}`)} />}</QueryFrame>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Recent Evidence Throughput</CardTitle></CardHeader>
                <ActivityAreaChart data={[{ name: "08:00", value: 4 }, { name: "10:00", value: 9 }, { name: "12:00", value: 7 }, { name: "14:00", value: 13 }, { name: "16:00", value: 11 }]} />
              </Card>
            </div>
          );
        }}
      </QueryFrame>
    </>
  );
}

function PageTitle({ title, description, actions }: { title: string; description?: string; actions?: JSX.Element }) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs font-semibold uppercase text-accent">Investigation Platform</div>
          <Badge tone={apiMode === "DEMO DATA" ? "amber" : "green"}>{apiMode}</Badge>
          {apiMode === "DEMO DATA" ? <span className="text-xs text-muted">Synthetic records only</span> : null}
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-text">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

function CaseCards({ cases }: { cases: CaseSummary[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {cases.map((item) => (
        <Link key={item.id} to={`/cases/${item.id}`} className="rounded-lg border border-border bg-white/[0.02] p-4 transition hover:border-accent/40">
          <div className="flex items-center justify-between gap-2"><h3 className="font-semibold text-text">{item.title}</h3><Badge tone={item.priority === "high" ? "red" : item.priority === "elevated" ? "amber" : "blue"}>{item.priority}</Badge></div>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{item.summary}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted">
            <span>{item.entity_count} entities</span><span>{item.relationship_count} links</span><span>{item.evidence_count} evidence</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function JobList({ jobs }: { jobs: Array<{ id: string; job_type: string; status: string; progress: number }> }) {
  return (
    <div className="grid gap-3">
      {jobs.map((job) => (
        <div key={job.id}>
          <div className="flex items-center justify-between text-sm"><span className="text-text">{job.job_type}</span><Badge tone={job.status === "completed" ? "green" : job.status === "failed" ? "red" : "amber"}>{job.status}</Badge></div>
          <div className="mt-2 h-2 rounded bg-white/8"><div className="h-full rounded bg-accent" style={{ width: pct(job.progress) }} /></div>
        </div>
      ))}
    </div>
  );
}

function ActivityList({ items }: { items: string[] }) {
  return <div className="grid gap-2">{items.map((item) => <div key={item} className="rounded-md border border-border/60 bg-white/[0.02] p-3 text-sm text-muted">{item}</div>)}</div>;
}

export function CasesPage() {
  const cases = useCases();
  return (
    <>
      <PageTitle title="Cases" description="Case inventory scoped by backend RBAC and case membership." actions={<Button variant="primary"><Plus className="h-4 w-4" /> New case</Button>} />
      <QueryFrame query={cases}>{(data) => <CaseCards cases={data.items} />}</QueryFrame>
    </>
  );
}

export function CaseDetailsPage() {
  const caseId = useCaseId();
  const caseQuery = useCase(caseId);
  const evidence = useEvidence(caseId);
  const entities = useEntities(caseId);
  const relationships = useRelationships(caseId);
  return (
    <QueryFrame query={caseQuery}>
      {(item) => (
        <>
          <PageTitle title={item.title} description={item.summary} actions={<Link to={`/workspace/${item.id}`}><Button variant="primary">Open workspace</Button></Link>} />
          <div className="grid gap-4 lg:grid-cols-4">
            <StatCard label="Evidence" value={item.evidence_count} />
            <StatCard label="Entities" value={item.entity_count} />
            <StatCard label="Relationships" value={item.relationship_count} />
            <StatCard label="Anomalies" value={item.anomaly_count} tone="amber" />
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <Card><CardHeader><CardTitle>Evidence</CardTitle></CardHeader><QueryFrame query={evidence}>{(data) => <EvidenceTable items={data.items} />}</QueryFrame></Card>
            <Card><CardHeader><CardTitle>Entities and Relationships</CardTitle></CardHeader><QueryFrame query={entities}>{(entityData) => <QueryFrame query={relationships}>{(relData) => <EntityRelationshipSummary entities={entityData.items} relationships={relData.items} />}</QueryFrame>}</QueryFrame></Card>
          </div>
        </>
      )}
    </QueryFrame>
  );
}

export function WorkspacePage() {
  const caseId = useCaseId();
  const graph = useGraph(caseId);
  const entities = useEntities(caseId);
  const relationships = useRelationships(caseId);
  const evidence = useEvidence(caseId);
  const timeline = useTimeline(caseId);
  const [selectedEntityId, setSelectedEntityId] = useState<string>("ent_001");
  const [confidence, setConfidence] = useState(65);

  return (
    <>
      <PageTitle title="Investigation Workspace" description="Primary graph-led analysis surface with case filters, entity details, timeline, and evidence." />
      <SafetyNotice />
      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_minmax(0,1fr)_380px]">
        <Card className="space-y-4">
          <CardHeader><CardTitle>Case Filters</CardTitle><Filter className="h-4 w-4 text-muted" /></CardHeader>
          <Field label="Case"><Select value={caseId} disabled><option>{caseId}</option></Select></Field>
          <Field label="Entity types"><Select><option>All entity types</option><option>Person</option><option>Organization</option><option>Location</option><option>Vehicle</option></Select></Field>
          <Field label="Relationship types"><Select><option>All relationships</option><option>communicated_with</option><option>associated_with</option><option>observed_at</option></Select></Field>
          <Field label="Date range"><Input type="date" /></Field>
          <Field label={`Confidence threshold ${confidence}%`}><input type="range" value={confidence} min={0} max={100} onChange={(event) => setConfidence(Number(event.target.value))} /></Field>
          <div className="grid grid-cols-2 gap-2"><Button size="sm">Shortest path</Button><Button size="sm">Expand degree</Button><Button size="sm">Neighborhood</Button><Button size="sm">Collapse</Button></div>
        </Card>
        <Card className="min-h-[700px]">
          <QueryFrame query={graph}>{(data) => <InvestigationGraph graph={data} selectedEntityId={selectedEntityId} onSelectEntity={setSelectedEntityId} height="680px" />}</QueryFrame>
        </Card>
        <Card className="space-y-4">
          <CardHeader><CardTitle>Entity Detail</CardTitle></CardHeader>
          <QueryFrame query={entities}>
            {(entityData) => (
              <QueryFrame query={relationships}>
                {(relationshipData) => (
                  <QueryFrame query={evidence}>
                    {(evidenceData) => (
                      <QueryFrame query={timeline}>
                        {(timelineData) => (
                          <SelectedEntityPanel
                            entity={entityById(entityData.items, selectedEntityId) ?? entityData.items[0]}
                            entities={entityData.items}
                            relationships={relationshipData.items}
                            evidence={evidenceData.items}
                            timeline={timelineData.items}
                          />
                        )}
                      </QueryFrame>
                    )}
                  </QueryFrame>
                )}
              </QueryFrame>
            )}
          </QueryFrame>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card><CardHeader><CardTitle>Timeline</CardTitle></CardHeader><QueryFrame query={timeline}>{(data) => <TimelineList items={data.items} />}</QueryFrame></Card>
        <Card><CardHeader><CardTitle>Evidence Panel</CardTitle></CardHeader><QueryFrame query={evidence}>{(data) => <EvidenceTable items={data.items} />}</QueryFrame></Card>
      </div>
    </>
  );
}

function IntelligencePriorities({ cases }: { cases: CaseSummary[] }) {
  const items = [
    {
      level: "HIGH",
      target: "Jordan Vale",
      caseId: "case_demo_001",
      reason: "Entity has significant network centrality and unresolved verification tasks.",
      signal: "Network Centrality",
      confidence: 0.92,
      evidenceCount: 2,
      timestamp: new Date().toISOString()
    },
    {
      level: "MEDIUM",
      target: "North Star Logistics",
      caseId: "case_demo_001",
      reason: "Newly discovered relationship cluster requires analyst review.",
      signal: "Investigative Lead",
      confidence: 0.81,
      evidenceCount: 3,
      timestamp: cases[0]?.updated_at ?? new Date().toISOString()
    },
    {
      level: "LOW",
      target: "Vehicle Movement Correlation",
      caseId: "case_demo_003",
      reason: "Movement sequence is available for follow-up when higher-priority reviews are cleared.",
      signal: "Analytical Finding",
      confidence: 0.71,
      evidenceCount: 1,
      timestamp: cases[2]?.updated_at ?? new Date().toISOString()
    }
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Intelligence Priorities</CardTitle><ClassificationBadge value="INVESTIGATIVE LEAD" /></CardHeader>
      <div className="grid gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <Link key={`${item.level}-${item.target}`} to={`/workspace/${item.caseId}`} className="rounded-lg border border-border bg-white/[0.02] p-3 outline-none transition hover:border-accent/50 focus-visible:ring-2 focus-visible:ring-accent">
            <div className="mb-2 flex items-center justify-between gap-2">
              <Badge tone={item.level === "HIGH" ? "red" : item.level === "MEDIUM" ? "amber" : "blue"}>{item.level}</Badge>
              <span className="text-xs text-muted">{formatDate(item.timestamp)}</span>
            </div>
            <div className="font-medium text-text">{item.target}</div>
            <p className="mt-1 text-xs leading-5 text-muted">{item.reason}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ClassificationBadge value={item.signal === "Investigative Lead" ? "INVESTIGATIVE LEAD" : "ANALYTICAL FINDING"} />
              <Badge tone="blue">{pct(item.confidence)}</Badge>
              <Badge>{item.evidenceCount} evidence</Badge>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function SelectedEntityPanel({
  entity,
  entities,
  relationships,
  evidence,
  timeline
}: {
  entity?: Entity;
  entities: Entity[];
  relationships: Relationship[];
  evidence: EvidenceItem[];
  timeline: any[];
}) {
  const [tab, setTab] = useState("Overview");
  if (!entity) return <EmptyState title="No entity selected" body="Select a graph node to inspect identity, provenance, and indicators." />;
  const relatedRelationships = relationships.filter((rel) => rel.source_entity_id === entity.id || rel.target_entity_id === entity.id);
  const relatedEvidence = evidence.filter((item) => item.provenance_span_ids.some((spanId) => entity.provenance_span_ids.includes(spanId)));
  const relatedTimeline = timeline.filter((item) => item.entity_ids?.includes(entity.id));
  const caseRecords = entity.cases.map((caseId) => ({ caseId, status: caseId === "case_demo_001" ? "active" : "Not available", priority: caseId === "case_demo_001" ? "high" : "Not available" }));

  return (
    <div className="grid gap-3 text-sm">
      <Tabs tabs={["Overview", "Relationships", "Evidence", "Timeline", "Cases", "Notes"]} active={tab} onChange={setTab} />
      <TabPanel>
        {tab === "Overview" ? (
          <div className="grid gap-3">
            <div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold text-text">{entity.label}</h3><p className="text-xs text-muted">{entity.entity_type}</p></div><Badge tone={entity.verified ? "green" : "amber"}>{entity.verified ? "verified" : "unverified"}</Badge></div>
            <div className="grid grid-cols-2 gap-2 text-xs"><span className="text-muted">Aliases</span><span className="text-right text-text">{entity.aliases.join(", ") || "Not available"}</span><span className="text-muted">Confidence</span><span className="text-right text-text">{pct(entity.confidence)}</span><span className="text-muted">Resolution</span><span className="text-right text-text">{entity.resolution_status}</span></div>
            <div className="rounded-md border border-border bg-white/[0.02] p-3">
              <div className="mb-2 flex items-center justify-between"><span className="font-medium text-text">Analytical Indicators</span><ClassificationBadge value="ANALYTICAL FINDING" /></div>
              <p className="text-xs leading-5 text-muted">Connectivity and review signals are investigative priorities only. They do not establish guilt or criminal status.</p>
            </div>
          </div>
        ) : null}
        {tab === "Relationships" ? <RelationshipList relationships={relatedRelationships} entities={entities} /> : null}
        {tab === "Evidence" ? <EvidenceMiniList items={relatedEvidence.length ? relatedEvidence : evidence.slice(0, 3)} /> : null}
        {tab === "Timeline" ? <TimelineList items={relatedTimeline} /> : null}
        {tab === "Cases" ? <div className="grid gap-2">{caseRecords.map((item) => <Link key={item.caseId} to={`/cases/${item.caseId}`} className="rounded-md border border-border p-3 text-xs text-muted hover:border-accent/50"><div className="font-medium text-text">{item.caseId}</div><div>Status: {item.status}</div><div>Priority: {item.priority}</div></Link>)}</div> : null}
        {tab === "Notes" ? <div className="rounded-md border border-border bg-white/[0.02] p-3 text-xs leading-5 text-muted"><ClassificationBadge value="FACT" /> <p className="mt-2">{entity.notes ?? "Not available"}</p><div className="mt-2">Author: Not available</div><div>Timestamp: Not available</div></div> : null}
      </TabPanel>
    </div>
  );
}

function RelationshipList({ relationships, entities = [] }: { relationships: Relationship[]; entities?: Entity[] }) {
  if (!relationships.length) return <EmptyState title="No relationships" body="No connected relationships were returned for this selection." />;
  return <div className="grid gap-2">{relationships.map((rel) => {
    const source = entities.find((entity) => entity.id === rel.source_entity_id)?.label ?? rel.source_entity_id;
    const target = entities.find((entity) => entity.id === rel.target_entity_id)?.label ?? rel.target_entity_id;
    return <Link key={rel.id} to={`/evidence/case_demo_001?relationship=${rel.id}`} className="rounded-md border border-border p-3 text-xs text-muted transition hover:border-accent/50"><div className="flex items-center justify-between gap-2"><div className="text-text">{source} {"->"} {target}</div><ClassificationBadge value={rel.verified ? "FACT" : "INVESTIGATIVE LEAD"} /></div><div className="mt-1">{rel.relationship_type} - {pct(rel.confidence)} confidence - {rel.provenance_span_ids.length} source references</div><div className="mt-1 font-mono">{rel.provenance_span_ids.join(", ")}</div></Link>;
  })}</div>;
}

function EvidenceMiniList({ items }: { items: EvidenceItem[] }) {
  if (!items.length) return <EmptyState title="No evidence" body="No evidence records are linked to this selection." />;
  return <div className="grid gap-2">{items.slice(0, 8).map((item) => <Link key={item.id} to={`/evidence/${item.case_id}?evidence=${item.id}`} className="rounded-md border border-border bg-white/[0.03] p-3 text-xs text-muted transition hover:border-accent/50"><div className="flex items-center justify-between gap-2"><div className="font-medium text-text">{item.source_name}</div><ClassificationBadge value="FACT" /></div><p className="mt-1 leading-5">{item.snippet}</p><div className="mt-2 font-mono">Spans: {item.provenance_span_ids.join(", ")}</div></Link>)}</div>;
}

function EvidenceTable({ items }: { items: EvidenceItem[] }) {
  return (
    <DataTable
      items={items}
      columns={[
        { key: "source", header: "Source", render: (item) => <Link to={`/evidence/${item.case_id}?evidence=${item.id}`} className="hover:text-accent"><div>{item.source_name}</div><div className="text-xs text-muted">{item.content_type}</div></Link> },
        { key: "snippet", header: "Snippet", render: (item) => <span className="text-muted">{item.snippet}</span> },
        { key: "hash", header: "Hash", render: (item) => <span className="font-mono text-xs text-muted">{item.sha256}</span> },
        { key: "prov", header: "Provenance", render: (item) => <div className="flex flex-wrap gap-1"><ClassificationBadge value="FACT" /><Badge tone="blue">{item.provenance_span_ids.length} spans</Badge></div> }
      ]}
    />
  );
}

function EntityRelationshipSummary({ entities, relationships }: { entities: Entity[]; relationships: Relationship[] }) {
  return (
    <div className="grid gap-4">
      <PriorityBarChart data={[{ name: "Person", value: entities.filter((item) => item.entity_type === "person").length }, { name: "Org", value: entities.filter((item) => item.entity_type === "organization").length }, { name: "Location", value: entities.filter((item) => item.entity_type === "location").length }, { name: "Links", value: relationships.length }]} />
      <DataTable items={entities} columns={[{ key: "name", header: "Entity", render: (item) => item.label }, { key: "type", header: "Type", render: (item) => <Badge>{item.entity_type}</Badge> }, { key: "conf", header: "Confidence", render: (item) => pct(item.confidence) }, { key: "review", header: "Review", render: (item) => <Badge tone={item.verified ? "green" : "amber"}>{item.verified ? "verified" : "review"}</Badge> }]} />
    </div>
  );
}

export function NetworkGraphPage() {
  const caseId = useCaseId();
  const graph = useGraph(caseId);
  return <><PageTitle title="Network Graph" description="Neo4j-backed graph projection rendered for exploration and path analysis." /><QueryFrame query={graph}>{(data) => <Card><InvestigationGraph graph={data} height="720px" /></Card>}</QueryFrame></>;
}

export function EntityExplorerPage() {
  const caseId = useCaseId();
  const entities = useEntities(caseId);
  return <><PageTitle title="Entity Explorer" description="Canonical and extracted entities with identity, aliases, confidence, and provenance." /><QueryFrame query={entities}>{(data) => <Card><DataTable items={data.items} columns={[{ key: "entity", header: "Entity", render: (item) => <div><div>{item.label}</div><div className="text-xs text-muted">{item.aliases.join(", ")}</div></div> }, { key: "type", header: "Type", render: (item) => <Badge>{item.entity_type}</Badge> }, { key: "connections", header: "Associated records", render: (item) => [...(item.phones ?? []), ...(item.vehicles ?? []), ...(item.locations ?? []), ...(item.organizations ?? [])].join(", ") || "none" }, { key: "confidence", header: "Confidence", render: (item) => pct(item.confidence) }, { key: "provenance", header: "Provenance", render: (item) => item.provenance_span_ids.join(", ") }]} /></Card>}</QueryFrame></>;
}

export function TimelinePage() {
  const caseId = useCaseId();
  const timeline = useTimeline(caseId);
  const [type, setType] = useState("all");
  return <><PageTitle title="Timeline" description="Evidence-linked events ordered for sequence analysis." /><Card className="mb-4"><div className="flex flex-wrap gap-2">{["all", "communication", "movement", "transaction", "meeting", "document", "observation"].map((item) => <Button key={item} size="sm" variant={type === item ? "primary" : "secondary"} onClick={() => setType(item)}>{item}</Button>)}</div></Card><Card><QueryFrame query={timeline}>{(data) => <TimelineList items={type === "all" ? data.items : data.items.filter((item) => item.event_type === type)} />}</QueryFrame></Card></>;
}

function TimelineList({ items }: { items: any[] }) {
  if (!items.length) return <EmptyState title="No timeline events" body="No events match the current filters." />;
  return <div className="grid gap-3">{items.map((item) => <Link key={item.id} to={`/evidence/${item.case_id}?event=${item.id}`} className="grid gap-1 border-l-2 border-accent/60 py-1 pl-4 outline-none transition hover:border-amber focus-visible:ring-2 focus-visible:ring-accent"><div className="flex flex-wrap items-center gap-2"><span className="font-medium text-text">{item.title}</span><Badge>{item.event_type}</Badge><ClassificationBadge value="FACT" /><span className="text-xs text-muted">{formatDate(item.timestamp)}</span></div><p className="text-sm text-muted">{item.description}</p><div className="grid gap-1 text-xs text-muted sm:grid-cols-3"><span>Entities: {item.entity_ids?.join(", ") || "Not available"}</span><span>Location: {unavailable(item.location)}</span><span>Confidence: {pct(item.confidence ?? 0)}</span></div><div className="text-xs text-muted">Evidence spans: {item.provenance_span_ids.join(", ")}</div></Link>)}</div>;
}

export function MapPage() {
  const caseId = useCaseId();
  const geo = useGeoEvents(caseId);
  return <><PageTitle title="Map Intelligence" description="Incident locations, entities, meetings, event sequences, and clusters with evidence popups." /><QueryFrame query={geo}>{(data) => <Card><IntelligenceMap events={data.items} /></Card>}</QueryFrame></>;
}

export function DocumentsPage() {
  const caseId = useCaseId();
  const evidence = useEvidence(caseId);
  return <><PageTitle title="Documents" description="Evidence metadata, parsed summaries, hashes, and extraction provenance." /><Card><QueryFrame query={evidence}>{(data) => <EvidenceTable items={data.items} />}</QueryFrame></Card></>;
}

export function IngestionPage() {
  const ingest = useIngestText();
  const [caseId, setCaseId] = useState("case_demo_001");
  const [sourceName, setSourceName] = useState("Synthetic incident note");
  const [content, setContent] = useState("");
  return (
    <>
      <PageTitle title="Data Ingestion" description="Submit text or files through documented ingestion endpoints and background job tracking." />
      <div className="grid gap-4 xl:grid-cols-[1fr_.8fr]">
        <Card>
          <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); ingest.mutate({ case_id: caseId, source_name: sourceName, content_text: content, classification: "training-restricted" }); }}>
            <Field label="Case ID"><Input value={caseId} onChange={(event) => setCaseId(event.target.value)} /></Field>
            <Field label="Source name"><Input value={sourceName} onChange={(event) => setSourceName(event.target.value)} /></Field>
            <Field label="Content text"><Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Paste synthetic case text for extraction" /></Field>
            <Button variant="primary" disabled={ingest.isPending}><Upload className="h-4 w-4" /> Queue ingestion</Button>
          </form>
        </Card>
        <Card><CardHeader><CardTitle>Upload Architecture</CardTitle></CardHeader><p className="text-sm leading-6 text-muted">File ingestion is wired to the documented `/ingestion/files` and `/imports` contract in the API client. The visible demo form uses `/ingestion/text` until backend file handling is implemented.</p>{ingest.data ? <Badge tone="green">Queued {ingest.data.job_id}</Badge> : null}</Card>
      </div>
    </>
  );
}

export function AnalyticsPage() {
  const caseId = useCaseId();
  const analytics = useAnalytics(caseId);
  return <><PageTitle title="Analytics" description="Centrality, communities, graph metrics, explanations, and provenance-backed indicators." /><SafetyNotice /><QueryFrame query={analytics}>{(data) => <div className="mt-4 grid gap-4 xl:grid-cols-2"><Card><CardHeader><CardTitle>Centrality</CardTitle></CardHeader><PriorityBarChart data={data.centrality.map((item) => ({ name: item.label, value: Math.round(item.score * 100) }))} /></Card><Card><CardHeader><CardTitle>Communities</CardTitle></CardHeader><DataTable items={data.communities} columns={[{ key: "label", header: "Community", render: (item) => item.label }, { key: "size", header: "Size", render: (item) => item.size }, { key: "cohesion", header: "Cohesion", render: (item) => pct(item.cohesion) }]} /></Card><Card className="xl:col-span-2"><p className="text-sm text-muted">{data.score_semantics}</p></Card></div>}</QueryFrame></>;
}

export function AnomalyPage() {
  const caseId = useCaseId();
  const analytics = useAnalytics(caseId);
  const review = useReviewTasks(caseId);
  return <><PageTitle title="Anomaly Detection" description="Unusual graph and event patterns queued as human-review indicators." /><SafetyNotice /><div className="mt-4 grid gap-4 xl:grid-cols-2"><Card><CardHeader><CardTitle>Anomalies</CardTitle></CardHeader><QueryFrame query={analytics}>{(data) => <DataTable items={data.anomalies} columns={[{ key: "title", header: "Indicator", render: (item) => item.title }, { key: "score", header: "Score", render: (item) => pct(item.score) }, { key: "status", header: "Status", render: (item) => <Badge tone="amber">{item.status}</Badge> }, { key: "prov", header: "Provenance", render: (item) => item.provenance_span_ids.join(", ") }]} />}</QueryFrame></Card><Card><CardHeader><CardTitle>Review Queue</CardTitle></CardHeader><QueryFrame query={review}>{(data) => <DataTable items={data.items} columns={[{ key: "reason", header: "Reason", render: (item) => item.reason }, { key: "subject", header: "Subject", render: (item) => `${item.subject_type}:${item.subject_id}` }, { key: "status", header: "Status", render: (item) => <Badge>{item.status}</Badge> }]} />}</QueryFrame></Card></div></>;
}

export function SearchPage() {
  const [query, setQuery] = useState("Jordan");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [type, setType] = useState("all");
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  const results = useSearch(debouncedQuery);
  const filtered = results.data ? { ...results.data, items: type === "all" ? results.data.items : results.data.items.filter((item) => item.type === type) } : undefined;
  return <><PageTitle title="Global Search" description="Exact, partial, and semantic-search-ready interface across cases, evidence, entities, transactions, and events." /><Card className="mb-4"><div className="grid gap-3 md:grid-cols-[1fr_180px_180px_120px]"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search person, phone, vehicle, organization, location, case, document, transaction, or event" /><Select value={type} onChange={(event) => setType(event.target.value)}><option value="all">All types</option><option value="person">person</option><option value="phone">phone</option><option value="vehicle">vehicle</option><option value="organization">organization</option><option value="location">location</option><option value="case">case</option><option value="document">document</option><option value="event">event</option></Select><Input type="date" /><Button variant="primary"><SearchIcon className="h-4 w-4" /> Search</Button></div><div className="mt-2 text-xs text-muted">Ctrl+K opens command search. Semantic search remains behind the documented `/search/semantic` API boundary.</div></Card><QueryFrame query={{ ...results, data: filtered }}>{(data) => <Card><DataTable items={data.items} columns={[{ key: "title", header: "Result", render: (item) => <Link to={item.type === "case" ? `/cases/${item.id}` : item.type === "document" ? `/evidence/${item.case_id ?? "case_demo_001"}?evidence=${item.id}` : `/entities/${item.case_id ?? "case_demo_001"}?entity=${item.id}`} className="hover:text-accent"><div>{item.title}</div><div className="text-xs text-muted">{item.summary}</div></Link> }, { key: "class", header: "Class", render: (item) => <ClassificationBadge value={item.provenance_span_ids.length ? "FACT" : "UNKNOWN"} /> }, { key: "type", header: "Type", render: (item) => <Badge>{item.type}</Badge> }, { key: "confidence", header: "Confidence", render: (item) => pct(item.confidence) }, { key: "prov", header: "Provenance", render: (item) => item.provenance_span_ids.join(", ") || "Not available" }]} /></Card>}</QueryFrame></>;
}

export function AssistantPage() {
  const caseId = useCaseId();
  const assistant = useAssistantQuery(caseId);
  const [question, setQuestion] = useState("Show connections of Jordan Vale.");
  const examples = ["Find common connections between Jordan Vale and North Star Logistics.", "Summarize this investigation.", "Show unusual activity in this case.", "Explain why Jordan Vale has a high analytical priority."];
  return <><PageTitle title="AI Investigation Assistant" description="Retrieval-grounded assistant that cites accessible evidence and refuses unsupported conclusions." /><SafetyNotice /><div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]"><Card className="space-y-4"><div className="min-h-56 rounded-lg border border-border bg-[#081017] p-4"><div className="mb-3 flex items-center gap-2 text-sm font-medium text-text"><Bot className="h-4 w-4 text-accent" /> Assistant response <ClassificationBadge value="MODEL INFERENCE" /></div>{assistant.isPending ? <Skeleton className="h-28" /> : assistant.data ? <div className="grid gap-4"><div className="rounded-md border border-border bg-white/[0.02] p-3"><div className="mb-2"><ClassificationBadge value="MODEL INFERENCE" /></div><p className="text-sm leading-6 text-muted">{assistant.data.answer}</p></div><div className="grid gap-2">{assistant.data.citations.map((citation) => <details key={citation.provenance_span_id} className="rounded-md border border-border p-3 text-xs text-muted"><summary className="cursor-pointer font-medium text-text">{citation.label} <ClassificationBadge value="FACT" /></summary><p className="mt-2 leading-5">{citation.snippet}</p><div className="mt-2 grid gap-1 font-mono"><span>Evidence: {citation.evidence_id}</span><span>Provenance: {citation.provenance_span_id}</span><span>Page: Not available</span><span>Line: Not available</span><span>Model version: Not available</span></div></details>)}</div><div className="grid gap-1">{assistant.data.limitations.map((item) => <Badge key={item} tone="amber">{item}</Badge>)}</div></div> : <EmptyState title="Ask a grounded question" body="Responses must cite source records and show limitations." />}</div><form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); assistant.mutate(question); }}><Input value={question} onChange={(event) => setQuestion(event.target.value)} /><Button variant="primary" size="icon" title="Send question" aria-label="Send question"><Send className="h-4 w-4" /></Button></form></Card><Card><CardHeader><CardTitle>Example Questions</CardTitle></CardHeader><div className="grid gap-2">{examples.map((item) => <Button key={item} variant="ghost" className="justify-start text-left" onClick={() => setQuestion(item)}>{item}</Button>)}</div></Card></div></>;
}

export function EvidenceProvenancePage() {
  const caseId = useCaseId();
  const evidence = useEvidence(caseId);
  return <><PageTitle title="Evidence and Provenance" description="Trace entities, relationships, assistant citations, and analytics back to immutable source records." /><div className="grid gap-4 xl:grid-cols-[1fr_360px]"><Card><QueryFrame query={evidence}>{(data) => <EvidenceTable items={data.items} />}</QueryFrame></Card><Card><CardHeader><CardTitle>Provenance Chain</CardTitle><ClassificationBadge value="FACT" /></CardHeader><QueryFrame query={evidence}>{(data) => <div className="grid gap-3">{data.items.map((item) => <div key={item.id} className="rounded-md border border-border bg-white/[0.02] p-3 text-xs text-muted"><div className="font-medium text-text">{item.source_name}</div><div className="mt-2 grid gap-1"><span>Evidence ID: {item.id}</span><span>Source record: {item.source_type}</span><span>Document hash: {item.sha256}</span><span>Page: Not available</span><span>Line: Not available</span><span>Text span: {item.snippet}</span><span>Coordinates: Not available</span><span>Extraction model: Not available</span><span>Model version: Not available</span><span>Extraction timestamp: {formatDate(item.created_at)}</span><span>Provenance spans: {item.provenance_span_ids.join(", ") || "Not available"}</span></div></div>)}</div>}</QueryFrame></Card></div></>;
}

export function ReportsPage() {
  const reports = useReports();
  const create = useCreateReport();
  return <><PageTitle title="Reports" description="Provenance-preserving report generation and export artifacts." actions={<Button variant="primary" onClick={() => create.mutate({ caseId: "case_demo_001", reportType: "investigation_summary" })}>Generate report</Button>} /><Card><QueryFrame query={reports}>{(data) => <DataTable items={data.items} columns={[{ key: "type", header: "Type", render: (item) => item.report_type }, { key: "case", header: "Case", render: (item) => item.case_id }, { key: "status", header: "Status", render: (item) => <Badge tone={item.status === "completed" ? "green" : "amber"}>{item.status}</Badge> }, { key: "artifact", header: "Artifact", render: (item) => item.artifact_uri ?? "pending" }]} />}</QueryFrame></Card></>;
}

export function NotificationsPage() {
  const notifications = useNotifications();
  return <><PageTitle title="Notifications" description="Review assignments, analytics updates, export status, and system alerts." /><Card><QueryFrame query={notifications}>{(data) => <DataTable items={data.items} columns={[{ key: "title", header: "Notification", render: (item) => <div><div>{item.title}</div><div className="text-xs text-muted">{item.body}</div></div> }, { key: "type", header: "Type", render: (item) => <Badge>{item.notification_type}</Badge> }, { key: "status", header: "Status", render: (item) => <Badge tone={item.read_at ? "green" : "amber"}>{item.read_at ? "read" : "unread"}</Badge> }, { key: "created", header: "Created", render: (item) => formatDate(item.created_at) }]} />}</QueryFrame></Card></>;
}

export function UserManagementPage() {
  const users = useAdminUsers();
  return <><PageTitle title="User Management" description="Administrative role assignments enforced by backend RBAC." /><Card><QueryFrame query={users}>{(data) => <DataTable items={data.items} columns={[{ key: "name", header: "User", render: (item) => <div><div>{item.name}</div><div className="text-xs text-muted">{item.email}</div></div> }, { key: "roles", header: "Roles", render: (item) => item.roles.map((role) => <Badge key={role} tone="blue" className="mr-1">{role}</Badge>) }, { key: "state", header: "State", render: () => <Badge tone="green">active</Badge> }]} />}</QueryFrame></Card></>;
}

export function AuditLogsPage() {
  const audit = useAuditEvents();
  return <><PageTitle title="Audit Logs" description="Immutable security and investigation activity events." /><Card><QueryFrame query={audit}>{(data) => <DataTable items={data.items} columns={[{ key: "action", header: "Action", render: (item) => item.action }, { key: "resource", header: "Resource", render: (item) => `${item.resource_type}:${item.resource_id}` }, { key: "actor", header: "Actor", render: (item) => item.actor_user_id ?? "system" }, { key: "created", header: "Created", render: (item) => formatDate(item.created_at) }]} />}</QueryFrame></Card></>;
}

export function SettingsPage() {
  const settings = useSettings();
  const update = useUpdateSetting();
  return <><PageTitle title="System Settings" description="Allowlisted non-secret operational settings. Secrets remain in environment or a secret manager." /><Card><QueryFrame query={settings}>{(data) => <DataTable items={data.items} columns={[{ key: "key", header: "Key", render: (item) => <span className="font-mono text-xs">{item.key}</span> }, { key: "value", header: "Value", render: (item) => String(item.value) }, { key: "classification", header: "Class", render: (item) => <Badge>{item.classification}</Badge> }, { key: "action", header: "Action", render: (item) => <Button size="sm" onClick={() => update.mutate({ key: item.key, value: item.value })}>Update</Button> }]} />}</QueryFrame></Card></>;
}

export function NotFoundPage() {
  return <EmptyState title="Route not found" body="The requested workspace route is not registered." />;
}

export function HealthCheckPage() {
  const health = useMemo(() => api.me(), []);
  void health;
  return (
    <Card>
      <div className="flex items-center gap-2 text-sm text-success"><CheckCircle2 className="h-4 w-4" /> Frontend runtime initialized</div>
    </Card>
  );
}
