import { useEffect } from "react";
import { X } from "lucide-react";
import { useLumen } from "@/lib/store";

export function ToastStack() {
  const toasts = useLumen((s) => s.toasts);
  const dismissToast = useLumen((s) => s.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const last = toasts[toasts.length - 1];
    const id = window.setTimeout(() => dismissToast(last.id), 5200);
    return () => window.clearTimeout(id);
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none absolute top-4 right-3 z-[65] flex w-[min(320px,calc(100%-1.5rem))] flex-col gap-2">
      {toasts.map((t) => (
        <aside
          key={t.id}
          className="pointer-events-auto rounded-lg bg-elevated px-3 py-3 shadow-[var(--shadow-float)]"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">{t.title}</p>
              <p className="mt-0.5 text-sm text-fg">{t.body}</p>
            </div>
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-sm text-muted hover:text-fg"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </aside>
      ))}
    </div>
  );
}
