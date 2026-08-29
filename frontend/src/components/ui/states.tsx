import { AlertTriangle, Database, Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/8", className)} />;
}

export function LoadingState({ label = "Loading intelligence records" }: { label?: string }) {
  return (
    <div className="flex min-h-36 items-center justify-center gap-2 text-sm text-muted">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-center">
      <Database className="h-7 w-7 text-muted" />
      <div className="text-sm font-medium text-text">{title}</div>
      <p className="max-w-md text-xs text-muted">{body}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border border-danger/30 bg-danger/5 p-6 text-center">
      <AlertTriangle className="h-7 w-7 text-danger" />
      <div className="text-sm font-medium text-text">Unable to load this view</div>
      <p className="max-w-md text-xs text-muted">{error instanceof Error ? error.message : "The service returned an unexpected error."}</p>
      {onRetry ? <Button size="sm" onClick={onRetry}>Retry</Button> : null}
    </div>
  );
}
