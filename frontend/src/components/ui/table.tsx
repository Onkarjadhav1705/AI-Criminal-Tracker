import type { ReactNode } from "react";
import { EmptyState } from "./states";

export function DataTable<T>({
  items,
  columns,
  empty
}: {
  items: T[];
  columns: Array<{ key: string; header: string; render: (item: T) => ReactNode }>;
  empty?: { title: string; body: string };
}) {
  if (!items.length) {
    return <EmptyState title={empty?.title ?? "No records"} body={empty?.body ?? "No matching records were returned by the service."} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="border-b border-border px-3 py-2 text-xs font-semibold uppercase text-muted">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-white/[0.03]">
              {columns.map((column) => (
                <td key={column.key} className="border-b border-border/60 px-3 py-3 align-top text-text">
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
