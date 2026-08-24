import { useEffect, useState, type PointerEvent } from "react";
import { Eye, EyeOff, LayoutGrid, Plus, Settings, Sparkles, X } from "lucide-react";
import {
  closeOrQuitDesktopApp,
  isDesktopApp,
  sendDesktopNotification,
  setIgnoreMouseEvents,
} from "@/lib/desktop-bridge";
import { useLumen } from "@/lib/store";
import { Companion } from "./companion";
import { FloatingTimers } from "./floating-timers";
import { Hub } from "./hub";
import { Onboarding } from "./onboarding";
import { StickyNote } from "./sticky-note";
import { ToastStack } from "./toasts";

function PaperWell() {
  const request = useLumen((s) => s.requestNoteFromPip);
  const enabled = useLumen((s) => s.pip.enabled);
  return (
    <button
      type="button"
      onClick={request}
      className="interactive-el absolute right-[4%] bottom-20 z-[15] hidden w-16 sm:block cursor-pointer hover:scale-110 transition-transform"
      aria-label="Paper stack — ask Pip to fetch"
      disabled={!enabled}
    >
      <span className="relative block h-20">
        <span className="absolute inset-x-1 top-3 h-14 rotate-[-8deg] rounded-sm bg-[#bae6fd] shadow-md" />
        <span className="absolute inset-x-0.5 top-2 h-14 rotate-[4deg] rounded-sm bg-[#bbf7d0] shadow-md" />
        <span className="absolute inset-x-0 top-0 h-14 rounded-sm bg-[#fef08a] shadow-lg" />
      </span>
      <span className="mt-1 block text-center text-[10px] font-bold tracking-wide text-fg/80 uppercase">
        Paper
      </span>
    </button>
  );
}

// Floating Quick Tray Menu (Matching Gemini Reference Image)
function FloatingTrayMenu() {
  const [open, setOpen] = useState(false);
  const lang = useLumen((s) => s.lang);
  const layout = useLumen((s) => s.layout);
  const setLayout = useLumen((s) => s.setLayout);
  const addNote = useLumen((s) => s.addNote);
  const setHubOpen = useLumen((s) => s.setHubOpen);
  const tidyNotes = useLumen((s) => s.tidyNotes);
  const pipEnabled = useLumen((s) => s.pip.enabled);
  const setPipEnabled = useLumen((s) => s.setPipEnabled);

  const isVi = lang === "vi";

  return (
    <div className="interactive-el fixed right-6 bottom-5 z-[85] flex flex-col items-end gap-2 select-none">
      {open ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 w-52 rounded-2xl bg-surface/95 text-fg p-2 shadow-[0_20px_45px_rgba(0,0,0,0.45)] border border-border backdrop-blur-xl">
          <div className="flex flex-col gap-1 text-xs font-semibold">
            {/* + New Note */}
            <button
              type="button"
              onClick={() => {
                addNote({ body: "", tint: "cream" });
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-elevated transition-colors text-left cursor-pointer"
            >
              <Plus className="size-4 text-amber-500" />
              <span>{isVi ? "+ Ghi chú mới" : "+ New Note"}</span>
            </button>

            {/* Toggle Pet Hide/Show */}
            <button
              type="button"
              onClick={() => {
                setPipEnabled(!pipEnabled);
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-elevated transition-colors text-left cursor-pointer"
            >
              <Sparkles className="size-4 text-amber-500" />
              <span>{pipEnabled ? (isVi ? "Ẩn Thú cưng 🐾" : "Hide Pet 🐾") : (isVi ? "Hiện Thú cưng 🐾" : "Show Pet 🐾")}</span>
            </button>

            {/* Hide All / Show All Notes */}
            <button
              type="button"
              onClick={() => setLayout(layout === "tray" ? "stickies" : "tray")}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-elevated transition-colors text-left cursor-pointer"
            >
              {layout === "tray" ? (
                <>
                  <Eye className="size-4 text-muted" />
                  <span>{isVi ? "Hiện tất cả note" : "Show All Notes"}</span>
                </>
              ) : (
                <>
                  <EyeOff className="size-4 text-muted" />
                  <span>{isVi ? "Ẩn tất cả note" : "Hide All Notes"}</span>
                </>
              )}
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => {
                setHubOpen(true);
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-elevated transition-colors text-left cursor-pointer"
            >
              <Settings className="size-4 text-muted" />
              <span>{isVi ? "Cài đặt" : "Settings"}</span>
            </button>

            {/* Arrange Notes Highlighted Button */}
            <button
              type="button"
              onClick={() => {
                tidyNotes();
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all active:scale-95 text-left cursor-pointer mt-0.5"
            >
              <LayoutGrid className="size-4" />
              <span>{isVi ? "Sắp xếp ghi chú" : "Arrange Notes"}</span>
            </button>

            {/* Quit */}
            <button
              type="button"
              onClick={() => void closeOrQuitDesktopApp()}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-red-500/20 text-red-500 transition-colors text-left cursor-pointer text-[11px]"
            >
              <X className="size-3.5" />
              <span>{isVi ? "Thoát ứng dụng" : "Quit"}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Tiny Custom Pet Icon Trigger at Corner of Desktop */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex size-10 items-center justify-center rounded-2xl bg-surface/90 hover:bg-surface text-fg shadow-xl border border-border backdrop-blur-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
        title="Lumen Overlay Menu"
      >
        <span className="text-xl">🦊</span>
      </button>
    </div>
  );
}

export function DesktopScene() {
  const theme = useLumen((s) => s.theme);
  const layout = useLumen((s) => s.layout);
  const setLayout = useLumen((s) => s.setLayout);
  const notes = useLumen((s) => s.notes);
  const addNote = useLumen((s) => s.addNote);
  const tidyNotes = useLumen((s) => s.tidyNotes);
  const setPipEnabled = useLumen((s) => s.setPipEnabled);
  const markHydrated = useLumen((s) => s.markHydrated);
  const setHubOpen = useLumen((s) => s.setHubOpen);
  const fireReminder = useLumen((s) => s.fireReminder);

  useEffect(() => {
    void Promise.resolve(useLumen.persist.rehydrate()).then(() => markHydrated());
  }, [markHydrated]);

  // Click-Through Mouse Event Controller
  useEffect(() => {
    if (!isDesktopApp()) return;

    const handlePointerMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive = Boolean(
        target.closest(
          "article, .interactive-el, section[role='dialog'], form, button, input, textarea, .group, [role='dialog']",
        ),
      );
      setIgnoreMouseEvents(!isInteractive);
    };

    window.addEventListener("mousemove", handlePointerMove);
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, []);

  // Global Shortcuts & System Tray Native IPC Listeners
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        addNote({ body: "", tint: "cream" });
      }
      if (e.key === "Escape") {
        setHubOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);

    let unlistenAdd: (() => void) | null = null;
    let unlistenArrange: (() => void) | null = null;
    let unlistenToggle: (() => void) | null = null;
    let unlistenTogglePet: (() => void) | null = null;
    let unlistenPet: (() => void) | null = null;
    let unlistenApp: (() => void) | null = null;

    if (isDesktopApp()) {
      import("@tauri-apps/api/event").then(({ listen }) => {
        listen("add-new-note", () => addNote({ body: "", tint: "cream" })).then((un) => {
          unlistenAdd = un;
        });
        listen("arrange-notes", () => tidyNotes()).then((un) => {
          unlistenArrange = un;
        });
        listen("toggle-show-hide-all", () => {
          setLayout(useLumen.getState().layout === "tray" ? "stickies" : "tray");
        }).then((un) => {
          unlistenToggle = un;
        });
        listen("toggle-pet", () => {
          setPipEnabled(!useLumen.getState().pip.enabled);
        }).then((un) => {
          unlistenTogglePet = un;
        });
        listen("open-pet-settings", () => setHubOpen(true)).then((un) => {
          unlistenPet = un;
        });
        listen("open-app-settings", () => setHubOpen(true)).then((un) => {
          unlistenApp = un;
        });
      });
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      if (unlistenAdd) unlistenAdd();
      if (unlistenArrange) unlistenArrange();
      if (unlistenToggle) unlistenToggle();
      if (unlistenTogglePet) unlistenTogglePet();
      if (unlistenPet) unlistenPet();
      if (unlistenApp) unlistenApp();
    };
  }, [setHubOpen, addNote, tidyNotes, setLayout, setPipEnabled]);

  // Reminder scheduler
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

  // Double click anywhere on desktop creates a new sticky note
  const onDoubleClickBackground = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("article, .interactive-el, section[role='dialog'], form, .group")) return;
    const parent = document.body.getBoundingClientRect();
    const x = Math.max(4, Math.min(84, (e.clientX / parent.width) * 100));
    const y = Math.max(6, Math.min(82, (e.clientY / parent.height) * 100));
    addNote({ x, y, body: "", tint: "cream" });
  };

  const visibleNotes = layout === "tray" ? [] : notes;

  return (
    <div
      data-theme={theme}
      data-transparent="true"
      className="fixed inset-0 h-screen w-screen bg-transparent text-fg select-none overflow-hidden"
      onDoubleClick={onDoubleClickBackground}
    >
      <PaperWell />
      {visibleNotes.map((n) => (
        <StickyNote key={n.id} note={n} />
      ))}
      <FloatingTimers />
      <Companion />
      <ToastStack />
      <Hub />
      <Onboarding />
      <FloatingTrayMenu />
    </div>
  );
}
