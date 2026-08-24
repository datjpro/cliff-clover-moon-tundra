import { Button } from "@/components/ui/button";
import { useLumen } from "@/lib/store";

export function Onboarding() {
  const open = useLumen((s) => s.onboarding);
  const dismiss = useLumen((s) => s.dismissOnboarding);
  const setPipEnabled = useLumen((s) => s.setPipEnabled);
  const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[85] flex items-center justify-center bg-bg/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-[var(--shadow-float)]">
        <p className="font-display text-2xl font-medium tracking-tight text-fg">Lumen</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A quiet desk. Notes you can pin. A small companion who will walk over with paper
          when you ask.
        </p>
        <ol className="mt-5 space-y-3 text-sm text-fg">
          <li className="flex gap-3">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-elevated text-xs font-medium tabular-nums">
              1
            </span>
            Drag a sticky. Change its tint.
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-elevated text-xs font-medium tabular-nums">
              2
            </span>
            Open the hub from the tray — four looks, three layouts.
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-elevated text-xs font-medium tabular-nums">
              3
            </span>
            Click Pip. He fetches a note and brings it to you.
          </li>
        </ol>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1"
            onClick={() => {
              setPipEnabled(true);
              dismiss();
              window.setTimeout(() => requestNoteFromPip(), 400);
            }}
          >
            Let Pip bring a note
          </Button>
          <Button variant="secondary" className="flex-1" onClick={dismiss}>
            I will look around
          </Button>
        </div>
      </div>
    </div>
  );
}
