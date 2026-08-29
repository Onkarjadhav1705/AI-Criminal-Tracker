import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("h-10 w-full rounded-md border border-border bg-[#0a1118] px-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-accent", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("min-h-28 w-full rounded-md border border-border bg-[#0a1118] px-3 py-2 text-sm text-text outline-none transition placeholder:text-muted focus:border-accent", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn("h-10 w-full rounded-md border border-border bg-[#0a1118] px-3 text-sm text-text outline-none transition focus:border-accent", className)} {...props} />
));
Select.displayName = "Select";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-xs font-medium text-muted">
      <span>{label}</span>
      {children}
    </label>
  );
}
