import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Tabs({
  tabs,
  active,
  onChange
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-border bg-[#081017] p-1" role="tablist" aria-label="Panel tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          className={cn(
            "rounded px-3 py-1.5 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-accent",
            active === tab ? "bg-accent text-[#061018]" : "text-muted hover:bg-white/5 hover:text-text"
          )}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ children }: { children: ReactNode }) {
  return <div className="subtle-scrollbar max-h-[430px] overflow-y-auto pr-1">{children}</div>;
}
