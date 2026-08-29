import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useSearch } from "../../api/hooks";
import { Button } from "../ui/button";
import { Input } from "../ui/forms";
import { Badge } from "../ui/badge";

function routeFor(type: string, id: string, caseId?: string) {
  if (type === "case") return `/cases/${id}`;
  if (type === "document") return `/documents/${caseId ?? "case_demo_001"}`;
  if (type === "location" || type === "event") return `/map/${caseId ?? "case_demo_001"}`;
  if (type === "relationship") return `/graph/${caseId ?? "case_demo_001"}`;
  return `/entities/${caseId ?? "case_demo_001"}?entity=${encodeURIComponent(id)}`;
}

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const results = useSearch(query);
  const grouped = useMemo(() => {
    const items = results.data?.items ?? [];
    return items.reduce<Record<string, typeof items>>((acc, item) => {
      const key = item.type === "case" ? "Cases" : item.type === "document" ? "Documents" : item.type === "location" ? "Locations" : item.type === "event" ? "Events" : "Entities";
      acc[key] = [...(acc[key] ?? []), item];
      return acc;
    }, {});
  }, [results.data?.items]);
  const flat = results.data?.items ?? [];

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => setActiveIndex(0), [query]);

  if (!open) {
    return (
      <Button variant="ghost" className="w-full justify-start text-muted" onClick={() => setOpen(true)}>
        <Search className="h-4 w-4" /> Command search <span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px]">Ctrl K</span>
      </Button>
    );
  }

  function go(index = activeIndex) {
    const item = flat[index];
    if (!item) return;
    navigate(routeFor(item.type, item.id, item.case_id));
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="Global command search">
      <div className="panel mx-auto mt-[8vh] max-w-2xl rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((value) => Math.min(value + 1, Math.max(flat.length - 1, 0)));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((value) => Math.max(value - 1, 0));
              }
              if (event.key === "Enter") go();
            }}
            placeholder="Search entities, cases, documents, locations, events"
          />
          <Button size="icon" variant="ghost" aria-label="Close command search" title="Close command search" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 max-h-[60vh] overflow-y-auto">
          {!query.trim() ? <p className="p-4 text-sm text-muted">Type to search across the documented `/search` API boundary.</p> : null}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-3">
              <div className="px-2 py-1 text-xs font-semibold uppercase text-muted">{group}</div>
              {items.map((item) => {
                const index = flat.findIndex((entry) => entry.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`w-full rounded-md p-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-accent ${index === activeIndex ? "bg-accent/12" : "hover:bg-white/5"}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(index)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-text">{item.title}</span>
                      <Badge>{item.type}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{item.summary}</p>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
