import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

export const qk = {
  cases: ["cases"],
  case: (caseId: string) => ["case", caseId],
  evidence: (caseId: string) => ["evidence", caseId],
  entities: (caseId: string) => ["entities", caseId],
  relationships: (caseId: string) => ["relationships", caseId],
  graph: (caseId: string) => ["graph", caseId],
  analytics: (caseId: string) => ["analytics", caseId],
  timeline: (caseId: string) => ["timeline", caseId],
  geo: (caseId: string) => ["geo", caseId],
  jobs: (caseId?: string) => ["jobs", caseId ?? "all"],
  search: (query: string) => ["search", query],
  review: (caseId: string) => ["review", caseId],
  audit: ["audit"],
  reports: (caseId?: string) => ["reports", caseId ?? "all"],
  notifications: ["notifications"],
  users: ["admin-users"],
  settings: ["settings"]
};

export const useCases = () => useQuery({ queryKey: qk.cases, queryFn: () => api.listCases() });
export const useCase = (caseId: string) => useQuery({ queryKey: qk.case(caseId), queryFn: () => api.getCase(caseId) });
export const useEvidence = (caseId: string) => useQuery({ queryKey: qk.evidence(caseId), queryFn: () => api.listEvidence(caseId) });
export const useEntities = (caseId: string) => useQuery({ queryKey: qk.entities(caseId), queryFn: () => api.listEntities(caseId) });
export const useRelationships = (caseId: string) => useQuery({ queryKey: qk.relationships(caseId), queryFn: () => api.listRelationships(caseId) });
export const useGraph = (caseId: string) => useQuery({ queryKey: qk.graph(caseId), queryFn: () => api.getGraph(caseId) });
export const useAnalytics = (caseId: string) => useQuery({ queryKey: qk.analytics(caseId), queryFn: () => api.getAnalytics(caseId) });
export const useTimeline = (caseId: string) => useQuery({ queryKey: qk.timeline(caseId), queryFn: () => api.getTimeline(caseId) });
export const useGeoEvents = (caseId: string) => useQuery({ queryKey: qk.geo(caseId), queryFn: () => api.getGeoEvents(caseId) });
export const useJobs = (caseId?: string) => useQuery({ queryKey: qk.jobs(caseId), queryFn: () => api.getJobs(caseId) });
export const useSearch = (query: string) => useQuery({ queryKey: qk.search(query), queryFn: () => api.search(query), enabled: query.trim().length > 0 });
export const useReviewTasks = (caseId: string) => useQuery({ queryKey: qk.review(caseId), queryFn: () => api.getReviewTasks(caseId) });
export const useAuditEvents = () => useQuery({ queryKey: qk.audit, queryFn: () => api.getAuditEvents() });
export const useReports = (caseId?: string) => useQuery({ queryKey: qk.reports(caseId), queryFn: () => api.getReports(caseId) });
export const useNotifications = () => useQuery({ queryKey: qk.notifications, queryFn: () => api.getNotifications() });
export const useAdminUsers = () => useQuery({ queryKey: qk.users, queryFn: () => api.getAdminUsers() });
export const useSettings = () => useQuery({ queryKey: qk.settings, queryFn: () => api.getSettings() });

export function useAssistantQuery(caseId: string) {
  return useMutation({ mutationFn: (question: string) => api.assistantQuery(caseId, question) });
}

export function useIngestText() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.ingestText,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: qk.jobs(variables.case_id) });
      void queryClient.invalidateQueries({ queryKey: qk.evidence(variables.case_id) });
    }
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, reportType }: { caseId: string; reportType: string }) => api.createReport(caseId, reportType),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: qk.reports() })
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => api.updateSetting(key, value),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: qk.settings })
  });
}
