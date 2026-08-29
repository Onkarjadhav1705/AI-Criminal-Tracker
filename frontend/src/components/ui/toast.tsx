import { createContext, useContext, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

type Toast = { id: number; title: string; body?: string };
type ToastContextValue = { push: (toast: Omit<Toast, "id">) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const value = useMemo(
    () => ({
      push(toast: Omit<Toast, "id">) {
        const id = Date.now();
        setToasts((current) => [...current, { ...toast, id }]);
        window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4000);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 grid w-80 gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="panel rounded-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-text">{toast.title}</div>
                {toast.body ? <div className="mt-1 text-xs text-muted">{toast.body}</div> : null}
              </div>
              <Button aria-label="Dismiss notification" title="Dismiss notification" variant="ghost" size="icon" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
