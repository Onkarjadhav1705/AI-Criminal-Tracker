import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import {
  AnalyticsPage,
  AnomalyPage,
  AssistantPage,
  AuditLogsPage,
  CaseDetailsPage,
  CasesPage,
  DashboardPage,
  DocumentsPage,
  EntityExplorerPage,
  EvidenceProvenancePage,
  HealthCheckPage,
  IngestionPage,
  LoginPage,
  MapPage,
  NetworkGraphPage,
  NotFoundPage,
  NotificationsPage,
  ReportsPage,
  SearchPage,
  SettingsPage,
  TimelinePage,
  UserManagementPage,
  WorkspacePage
} from "./features/pages";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="cases" element={<CasesPage />} />
            <Route path="cases/:caseId" element={<CaseDetailsPage />} />
            <Route path="workspace/:caseId" element={<WorkspacePage />} />
            <Route path="graph/:caseId" element={<NetworkGraphPage />} />
            <Route path="entities/:caseId" element={<EntityExplorerPage />} />
            <Route path="timeline/:caseId" element={<TimelinePage />} />
            <Route path="map/:caseId" element={<MapPage />} />
            <Route path="documents/:caseId" element={<DocumentsPage />} />
            <Route path="ingestion" element={<IngestionPage />} />
            <Route path="analytics/:caseId" element={<AnalyticsPage />} />
            <Route path="anomalies/:caseId" element={<AnomalyPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="assistant/:caseId" element={<AssistantPage />} />
            <Route path="evidence/:caseId" element={<EvidenceProvenancePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="admin/users" element={<UserManagementPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={["admin", "auditor"]} />}>
              <Route path="audit" element={<AuditLogsPage />} />
            </Route>
            <Route path="health" element={<HealthCheckPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
