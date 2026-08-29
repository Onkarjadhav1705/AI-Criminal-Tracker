import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const tones = {
  blue: "border-accent/40 bg-accent/10 text-accent",
  amber: "border-amber/40 bg-amber/10 text-amber",
  red: "border-danger/40 bg-danger/10 text-danger",
  green: "border-success/40 bg-success/10 text-success",
  gray: "border-border bg-white/5 text-muted"
};

export function Badge({ className, tone = "gray", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium", tones[tone], className)} {...props} />;
}
