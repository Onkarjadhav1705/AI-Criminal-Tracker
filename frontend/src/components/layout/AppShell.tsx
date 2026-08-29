import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Activity,
  Bell,
  Bot,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileArchive,
  FileText,
  Gauge,
  GitFork,
  Home,
  LockKeyhole,
  LogOut,
  Map,
  Network,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  Users
} from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../lib/auth";
import { cn } from "../../lib/utils";
import { CommandSearch } from "../command/CommandSearch";

const navGroups = [
  {
    label: "Investigate",
    items: [
      { to: "/", label: "Dashboard", icon: Home },
      { to: "/cases", label: "Cases", icon: Briefcase },
      { to: "/workspace/case_demo_001", label: "Workspace", icon: Network },
      { to: "/search", label: "Search", icon: Search }
    ]
  },
  {
    label: "Network",
    items: [
      { to: "/graph/case_demo_001", label: "Network Graph", icon: GitFork },
      { to: "/entities/case_demo_001", label: "Entity Explorer", icon: Users },
      { to: "/timeline/case_demo_001", label: "Timeline", icon: Activity },
      { to: "/map/case_demo_001", label: "Map Intelligence", icon: Map }
    ]
  },
  {
    label: "Data",
    items: [
      { to: "/documents/case_demo_001", label: "Documents", icon: FileText },
      { to: "/ingestion", label: "Data Ingestion", icon: Upload }
    ]
  },
  {
    label: "Analysis",
    items: [
      { to: "/analytics/case_demo_001", label: "Analytics", icon: Gauge },
      { to: "/anomalies/case_demo_001", label: "Anomalies", icon: Radar }
    ]
  },
  {
    label: "Intelligence",
    items: [
      { to: "/assistant/case_demo_001", label: "AI Assistant", icon: Bot },
      { to: "/evidence/case_demo_001", label: "Evidence / Provenance", icon: ShieldCheck },
      { to: "/reports", label: "Reports", icon: FileArchive }
    ]
  },
  {
    label: "Administration",
    items: [
      { to: "/notifications", label: "Notifications", icon: Bell },
      { to: "/admin/users", label: "User Management", icon: LockKeyhole, roles: ["admin"] },
      { to: "/audit", label: "Audit Logs", icon: ClipboardList, roles: ["admin", "auditor"] },
      { to: "/settings", label: "System Settings", icon: Settings, roles: ["admin"] }
    ]
  }
];

export function AppShell() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn("min-h-screen lg:grid", collapsed ? "lg:grid-cols-[84px_1fr]" : "lg:grid-cols-[280px_1fr]")}>
      <aside className="border-b border-border bg-[#070b10]/95 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-semibold uppercase text-accent">CNIP</div>
                {!collapsed ? <h1 className="mt-1 text-lg font-semibold text-text">Network Intelligence</h1> : null}
              </div>
              <Button className="hidden lg:inline-flex" variant="ghost" size="icon" aria-label="Toggle sidebar" title="Toggle sidebar" onClick={() => setCollapsed((value) => !value)}>
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
            {!collapsed ? <p className="mt-2 text-xs leading-5 text-muted">Evidence-grounded investigation support for authorized analysts.</p> : null}
          </div>
          {!collapsed ? <div className="border-b border-border p-3"><CommandSearch /></div> : null}
          <nav className="subtle-scrollbar grid max-h-[50vh] gap-1 overflow-y-auto p-3 lg:max-h-none lg:flex-1">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-2">
                {!collapsed ? <div className="px-3 py-1.5 text-[10px] font-semibold uppercase text-muted">{group.label}</div> : null}
                <div className="grid gap-1">
                  {group.items.filter((item) => auth.hasRole(item.roles as any)).map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/"}
                      title={item.label}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-accent",
                          collapsed && "justify-center px-2",
                          isActive ? "bg-accent/12 text-accent" : "text-muted hover:bg-white/5 hover:text-text"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed ? <span>{item.label}</span> : null}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t border-border p-4">
            {!collapsed ? <div className="text-sm font-medium text-text">{auth.user?.name}</div> : null}
            {!collapsed ? <div className="mt-1 text-xs text-muted">{auth.user?.roles.join(", ")}</div> : null}
            <Button
              className={cn("mt-3 w-full", collapsed ? "px-0" : "justify-start")}
              variant="ghost"
              aria-label="Sign out"
              title="Sign out"
              onClick={() => {
                auth.logout();
                navigate("/login");
              }}
            >
              <LogOut className="h-4 w-4" /> {!collapsed ? "Sign out" : null}
            </Button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}
