import { useEffect } from "react";
import { isDesktopApp, sendDesktopNotification } from "@/lib/desktop-bridge";
import { useLumen } from "@/lib/store";
import { Companion } from "./companion";
import { Hub } from "./hub";
import { Onboarding } from "./onboarding";
import { QuickCapture } from "./quick-capture";
import { StickyNote } from "./sticky-note";
import { ToastStack } from "./toasts";
import { Tray } from "./tray";

function PaperWell() {
  const request = useLumen((s) => s.requestNoteFromPip);
  const enabled = useLumen((s) => s.pip.enabled);
  return (
    <button
      type="button"
      onClick={request}
      className="absolute right-[6%] bottom-24 z-[5] hidden w-16 sm:block cursor-pointer hover:scale-105 transition-transform"
      aria-label="Paper stack — ask Pip to fetch"
      disabled={!enabled}
    >
      <span className="relative block h-20">
        <span className="absolute inset-x-1 top-3 h-14 rotate-[-8deg] rounded-sm bg-[var(--note-mist)] shadow-[var(--shadow-border)]" />
        <span className="absolute inset-x-0.5 top-2 h-14 rotate-[4deg] rounded-sm bg-[var(--note-sage)] shadow-[var(--shadow-border)]" />
        <span className="absolute inset-x-0 top-0 h-14 rounded-sm bg-[var(--note-cream)] shadow-[var(--shadow-float)]" />
      </span>
      <span className="mt-1 block text-center text-[10px] font-medium tracking-wide text-fg/50 uppercase">
        Paper
      </span>
    </button>
  );
}

export function DesktopScene() {
  const theme = useLumen((s) => s.theme);
  const layout = useLumen((s) => s.layout);
  const notes = useLumen((s) => s.notes);
  const markHydrated = useLumen((s) => s.markHydrated);
  const setCaptureOpen = useLumen((s) => s.setCaptureOpen);
  const setHubOpen = useLumen((s) => s.setHubOpen);
  const fireReminder = useLumen((s) => s.fireReminder);

  useEffect(() => {
    void Promise.resolve(useLumen.persist.rehydrate()).then(() => markHydrated());
  }, [markHydrated]);

  // Desktop Global Shortcuts & IPC Event Listeners
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setCaptureOpen(true);
      }
      if (e.key === "Escape") {
        setCaptureOpen(false);
        setHubOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);

    // Native Desktop Shell IPC listener
    let unlisten: (() => void) | null = null;
    if (isDesktopApp()) {
      import("@tauri-apps/api/event").then(({ listen }) => {
        listen("open-quick-capture", () => {
          setCaptureOpen(true);
        }).then((un: () => void) => {
          unlisten = un;
        });
      });
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      if (unlisten) unlisten();
    };
  }, [setCaptureOpen, setHubOpen]);

  // Reminder scheduler with Native OS Notification Bridge
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      for (const r of useLumen.getState().reminders) {
        if (!r.done && r.fireAt <= now) {
          fireReminder(r.id);
          void sendDesktopNotification("Lumen Reminder", r.title);
        }
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [fireReminder]);

  const visibleNotes = layout === "tray" ? [] : notes;

  return (
    <div data-theme={theme} className="h-dvh min-h-dvh bg-bg text-fg select-none overflow-hidden">
      <div className="wallpaper relative h-full overflow-hidden">
        <div className="pointer-events-none absolute inset-x-[12%] top-[8%] hidden h-[38%] rounded-sm bg-[var(--wall-glow)]/10 sm:block" />
        <PaperWell />
        {layout === "sidebar" ? (
          <div className="absolute top-4 right-3 bottom-16 z-20 flex w-56 max-w-[calc(100%-1.5rem)] flex-col gap-3 overflow-y-auto">
            {visibleNotes.map((n) => (
              <StickyNote key={n.id} note={n} stacked />
            ))}
          </div>
        ) : (
          visibleNotes.map((n) => <StickyNote key={n.id} note={n} />)
        )}
        <Companion />
        <ToastStack />
        <Hub />
        <QuickCapture />
        <Onboarding />
        <Tray />
      </div>
    </div>
  );
}
