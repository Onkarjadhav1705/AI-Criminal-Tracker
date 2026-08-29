import type { ReactNode } from "react";

export function PageHeader({ title, eyebrow, description, actions }: { title: string; eyebrow?: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <div className="text-xs font-semibold uppercase text-accent">{eyebrow}</div> : null}
        <h1 className="mt-1 text-2xl font-semibold text-text">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
