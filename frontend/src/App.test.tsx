import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, beforeEach } from "vitest";
import { AuthProvider } from "./lib/auth";
import { ToastProvider } from "./components/ui/toast";
import { App } from "./App";

function renderApp() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe("App routing and auth", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, "", "/");
  });

  it("protects dashboard behind login", () => {
    renderApp();
    expect(screen.getByRole("heading", { name: /investigator access/i })).toBeInTheDocument();
  });

  it("logs in and renders the dashboard from the API adapter", async () => {
    renderApp();
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(screen.getByRole("heading", { name: /command dashboard/i })).toBeInTheDocument());
    expect(await screen.findByText(/active investigations/i)).toBeInTheDocument();
    expect(screen.getByText(/intelligence priorities/i)).toBeInTheDocument();
    expect(screen.getAllByText(/demo data/i)[0]).toBeInTheDocument();
  });

  it("keeps admin navigation role-aware for the demo investigator", async () => {
    renderApp();
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await screen.findByRole("heading", { name: /command dashboard/i });
    expect(screen.queryByText(/user management/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/audit logs/i)).not.toBeInTheDocument();
  });

  it("opens command search with Ctrl+K and navigates to a result", async () => {
    renderApp();
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await screen.findByRole("heading", { name: /command dashboard/i });
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("dialog", { name: /global command search/i })).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(/search entities/i), "Jordan");
    await userEvent.click(await screen.findByText("Jordan Vale"));
    await waitFor(() => expect(window.location.pathname).toBe("/entities/case_demo_001"));
  });

  it("renders assistant citation classifications", async () => {
    localStorage.setItem("cni_user", JSON.stringify({ id: "usr_demo_investigator", name: "Demo Investigator", roles: ["lead_investigator", "investigator", "analyst"] }));
    localStorage.setItem("cni_token", "demo-token");
    window.history.pushState({}, "", "/assistant/case_demo_001");
    renderApp();
    await userEvent.click(screen.getByRole("button", { name: /send question/i }));
    expect(await screen.findByText(/model inference/i)).toBeInTheDocument();
    expect(await screen.findByText(/Synthetic incident note/i)).toBeInTheDocument();
  });
});
