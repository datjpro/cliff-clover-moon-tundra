import { useEffect, useState, type PointerEvent } from "react";
import { Clock, Eye, EyeOff, LayoutGrid, Plus, Settings, Sparkles, X } from "lucide-react";
import { sounds } from "@/lib/audio";
import {
  closeOrQuitDesktopApp,
  isDesktopApp,
  sendDesktopNotification,
  setIgnoreMouseEvents,
} from "@/lib/desktop-bridge";
import { useLumen } from "@/lib/store";
import { AlarmRingingModal } from "./alarm-ringing-modal";
import { BallToy } from "./ball-toy";
import { Companion } from "./companion";
import { FloatingTimers } from "./floating-timers";
import { Hub } from "./hub";
import { Onboarding } from "./onboarding";
import { QuickCapture } from "./quick-capture";
import { QuickTimer, triggerOpenQuickTimer } from "./quick-timer";
import { StickyNote } from "./sticky-note";
import { ToastStack } from "./toasts";

function PaperWell() {
  const request = useLumen((s) => s.requestNoteFromPip);
  const addNote = useLumen((s) => s.addNote);
  const enabled = useLumen((s) => s.pip.enabled);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playPop(620);
    // 1. Immediately spawn a new sticky note
    addNote({
      x: Math.max(10, Math.min(80, 50 + (Math.random() - 0.5) * 30)),
      y: Math.max(10, Math.min(75, 40 + (Math.random() - 0.5) * 25)),
      body: "",
      tint: "cream",
    });
    // 2. If Pip is enabled, ask Pip to deliver
    if (enabled) {
      request();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="interactive-el fixed right-[4%] bottom-20 z-[20] w-16 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
      aria-label="Paper stack — Lấy giấy ghi chú"
      title="Nhấp để lấy giấy ghi chú mới"
    >
      <span className="relative block h-20">
        <span className="absolute inset-x-1 top-3 h-14 rotate-[-8deg] rounded-sm bg-[#bae6fd] shadow-md" />
        <span className="absolute inset-x-0.5 top-2 h-14 rotate-[4deg] rounded-sm bg-[#bbf7d0] shadow-md" />
        <span className="absolute inset-x-0 top-0 h-14 rounded-sm bg-[#fef08a] shadow-lg border border-amber-300" />
      </span>
      <span className="mt-1 block text-center text-[10px] font-bold tracking-wide text-white uppercase bg-black/60 rounded px-1">
        📝 Paper
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
        <div className="animate-in fade-in slide-in-from-bottom-2 w-52 rounded-2xl bg-[#1c1917]/95 text-[#f5f5f4] p-2 shadow-[0_20px_45px_rgba(0,0,0,0.6)] border border-[#44403c] backdrop-blur-xl">
          <div className="flex flex-col gap-1 text-xs font-semibold">
            {/* + New Note */}
            <button
              type="button"
              onClick={() => {
                addNote({ body: "", tint: "cream" });
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <Plus className="size-4 text-amber-500" />
              <span>{isVi ? "+ Ghi chú mới" : "+ New Note"}</span>
            </button>

            {/* + Quick Timer */}
            <button
              type="button"
              onClick={() => {
                triggerOpenQuickTimer();
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <Clock className="size-4 text-amber-400" />
              <span>{isVi ? "⏰ + Đặt giờ nhanh" : "⏰ + Quick Timer"}</span>
            </button>

            {/* Toggle Pet Hide/Show */}
            <button
              type="button"
              onClick={() => {
                setPipEnabled(!pipEnabled);
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <Sparkles className="size-4 text-amber-500" />
              <span>{pipEnabled ? (isVi ? "Ẩn Thú cưng 🐾" : "Hide Pet 🐾") : (isVi ? "Hiện Thú cưng 🐾" : "Show Pet 🐾")}</span>
            </button>

            {/* Hide All / Show All Notes */}
            <button
              type="button"
              onClick={() => setLayout(layout === "tray" ? "stickies" : "tray")}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer"
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
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer"
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
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-red-500/20 text-red-400 transition-colors text-left cursor-pointer text-[11px]"
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
        className="flex size-10 items-center justify-center rounded-2xl bg-[#1c1917]/90 hover:bg-[#1c1917] text-white shadow-2xl border border-[#44403c] backdrop-blur-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
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
  const setCaptureOpen = useLumen((s) => s.setCaptureOpen);
  const setHubOpen = useLumen((s) => s.setHubOpen);
  const fireReminder = useLumen((s) => s.fireReminder);

  useEffect(() => {
    void Promise.resolve(useLumen.persist.rehydrate()).then(() => markHydrated());
  }, [markHydrated]);

  // Click-Through Mouse Event Controller (100% transparent click-through for desktop background & apps)
  useEffect(() => {
    if (!isDesktopApp()) return;

    setIgnoreMouseEvents(true);
    let currentIgnore = true;

    const handlePointerMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive = Boolean(
        target.closest(
          "article, .interactive-el, section[role='dialog'], form, button, input, textarea, .group, [role='dialog'], [tabindex]",
        ),
      );
      const shouldIgnore = !isInteractive;
      if (shouldIgnore !== currentIgnore) {
        currentIgnore = shouldIgnore;
        setIgnoreMouseEvents(shouldIgnore);
      }
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, []);

  // Global Shortcuts & System Tray Native IPC Listeners
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

    let unlistenCapture: (() => void) | null = null;
    let unlistenTimer: (() => void) | null = null;
    let unlistenAdd: (() => void) | null = null;
    let unlistenArrange: (() => void) | null = null;
    let unlistenToggle: (() => void) | null = null;
    let unlistenTogglePet: (() => void) | null = null;
    let unlistenPet: (() => void) | null = null;
    let unlistenApp: (() => void) | null = null;

    if (isDesktopApp()) {
      import("@tauri-apps/api/event").then(({ listen }) => {
        listen("open-quick-capture", () => setCaptureOpen(true)).then((un) => {
          unlistenCapture = un;
        });
        listen("open-quick-timer", () => triggerOpenQuickTimer()).then((un) => {
          unlistenTimer = un;
        });
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
      if (unlistenCapture) unlistenCapture();
      if (unlistenTimer) unlistenTimer();
      if (unlistenAdd) unlistenAdd();
      if (unlistenArrange) unlistenArrange();
      if (unlistenToggle) unlistenToggle();
      if (unlistenTogglePet) unlistenTogglePet();
      if (unlistenPet) unlistenPet();
      if (unlistenApp) unlistenApp();
    };
  }, [setCaptureOpen, setHubOpen, addNote, tidyNotes, setLayout, setPipEnabled]);

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
      className="fixed inset-0 h-screen w-screen bg-transparent text-fg select-none overflow-hidden pointer-events-none"
    >
      <PaperWell />
      {visibleNotes.map((n) => (
        <StickyNote key={n.id} note={n} />
      ))}
      <FloatingTimers />
      <BallToy />
      <Companion />
      <ToastStack />
      <AlarmRingingModal />
      <QuickCapture />
      <QuickTimer />
      <Hub />
      <Onboarding />
      <FloatingTrayMenu />
    </div>
  );
}
