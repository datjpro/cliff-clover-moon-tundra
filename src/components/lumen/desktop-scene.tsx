import { useEffect, useState, type PointerEvent } from "react";
import { Clock, Eye, EyeOff, LayoutGrid, Plus, Settings, Sparkles, X } from "lucide-react";
import { sounds } from "@/lib/audio";
import {
  closeOrQuitDesktopApp,
  isDesktopApp,
  listenToDesktopEvent,
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

// Floating Quick Tray Menu (Modern Glassmorphism & Tokenized System)
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
        <div className="animate-in fade-in slide-in-from-bottom-2 w-64 rounded-2xl bg-[#1D2029]/90 text-[#F4F5F7] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.65)] border border-white/6 backdrop-blur-2xl">
          <div className="flex flex-col gap-1 text-xs font-medium">
            {/* Header label */}
            <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-semibold text-[#8B90A0] uppercase tracking-wider border-b border-white/5 mb-0.5">
              <span>Lumen Desk</span>
              <span className="text-[#F5A623]">Overlay</span>
            </div>

            {/* + New Note */}
            <button
              type="button"
              onClick={() => {
                addNote({ body: "", tint: "cream" });
                setOpen(false);
              }}
              className="flex items-center justify-between px-2.5 h-9 rounded-xl hover:bg-[#262A35] transition-colors duration-120 text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="size-4.5 text-[#F5A623] group-hover:scale-110 transition-transform duration-120" />
                <span className="font-medium text-[#F4F5F7]">{isVi ? "Ghi chú mới" : "New Note"}</span>
              </div>
              <span className="text-[10px] text-[#8B90A0] font-mono">Ctrl+Shift+N</span>
            </button>

            {/* + Quick Timer */}
            <button
              type="button"
              onClick={() => {
                triggerOpenQuickTimer();
                setOpen(false);
              }}
              className="flex items-center justify-between px-2.5 h-9 rounded-xl hover:bg-[#262A35] transition-colors duration-120 text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="size-4.5 text-[#F5A623] group-hover:scale-110 transition-transform duration-120" />
                <span className="font-medium text-[#F4F5F7]">{isVi ? "Đặt giờ nhanh" : "Quick Timer"}</span>
              </div>
              <span className="text-[10px] text-[#8B90A0] font-mono">Ctrl+Shift+T</span>
            </button>

            {/* Toggle Pet Hide/Show */}
            <button
              type="button"
              onClick={() => {
                setPipEnabled(!pipEnabled);
                setOpen(false);
              }}
              className="flex items-center justify-between px-2.5 h-9 rounded-xl hover:bg-[#262A35] transition-colors duration-120 text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-4.5 text-[#F5A623] group-hover:scale-110 transition-transform duration-120" />
                <span className="font-medium text-[#F4F5F7]">
                  {pipEnabled ? (isVi ? "Ẩn Thú cưng" : "Hide Pet") : (isVi ? "Hiện Thú cưng" : "Show Pet")}
                </span>
              </div>
              <span className="text-xs">🐾</span>
            </button>

            {/* Hide All / Show All Notes */}
            <button
              type="button"
              onClick={() => setLayout(layout === "tray" ? "stickies" : "tray")}
              className="flex items-center justify-between px-2.5 h-9 rounded-xl hover:bg-[#262A35] transition-colors duration-120 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {layout === "tray" ? (
                  <>
                    <Eye className="size-4.5 text-[#8B90A0]" />
                    <span className="font-medium text-[#F4F5F7]">{isVi ? "Hiện tất cả note" : "Show All Notes"}</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="size-4.5 text-[#8B90A0]" />
                    <span className="font-medium text-[#F4F5F7]">{isVi ? "Ẩn tất cả note" : "Hide All Notes"}</span>
                  </>
                )}
              </div>
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => {
                setHubOpen(true);
                setOpen(false);
              }}
              className="flex items-center justify-between px-2.5 h-9 rounded-xl hover:bg-[#262A35] transition-colors duration-120 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="size-4.5 text-[#8B90A0]" />
                <span className="font-medium text-[#F4F5F7]">{isVi ? "Cài đặt hệ thống" : "Settings"}</span>
              </div>
              <span className="text-[10px] text-[#8B90A0] font-mono">Hub</span>
            </button>

            {/* Arrange Notes (Highlighted with Left Accent Bar + Surface Elevated) */}
            <button
              type="button"
              onClick={() => {
                tidyNotes();
                setOpen(false);
              }}
              className="flex items-center justify-between pl-3 pr-2.5 h-9 rounded-xl bg-[#262A35] border-l-2 border-[#F5A623] hover:bg-[#2e3340] text-[#F4F5F7] font-medium shadow-xs transition-all duration-120 active:scale-98 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="size-4.5 text-[#F5A623]" />
                <span>{isVi ? "Sắp xếp ghi chú" : "Arrange Notes"}</span>
              </div>
              <span className="text-[10px] bg-[#F5A623]/20 text-[#F5A623] px-1.5 py-0.2 rounded font-mono font-semibold">
                Auto
              </span>
            </button>

            {/* Hairline Divider & Quit Button */}
            <div className="h-px bg-white/5 my-1" />
            <button
              type="button"
              onClick={() => void closeOrQuitDesktopApp()}
              className="flex items-center gap-2.5 px-2.5 h-8.5 rounded-xl hover:bg-red-500/15 text-[#EF4444] transition-colors duration-120 text-left cursor-pointer text-xs font-medium"
            >
              <X className="size-4 text-[#EF4444]" />
              <span>{isVi ? "Thoát ứng dụng" : "Quit"}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Tiny Custom Pet Icon Trigger at Corner of Desktop */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex size-10 items-center justify-center rounded-2xl bg-[#1D2029]/95 hover:bg-[#1D2029] text-white shadow-2xl border border-white/10 backdrop-blur-xl hover:scale-110 active:scale-95 transition-transform duration-140 cursor-pointer"
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
      const key = e.key.toLowerCase();
      // Quick Note: Ctrl+Shift+N or Alt+N
      if ((meta && e.shiftKey && key === "n") || (e.altKey && key === "n")) {
        e.preventDefault();
        setCaptureOpen(true);
      }
      // Quick Timer: Ctrl+Shift+T or Alt+T
      if ((meta && e.shiftKey && key === "t") || (e.altKey && key === "t")) {
        e.preventDefault();
        triggerOpenQuickTimer();
      }
      // Settings Hub: Ctrl+Shift+H or Alt+S
      if ((meta && e.shiftKey && key === "h") || (e.altKey && key === "s")) {
        e.preventDefault();
        setHubOpen(true);
      }
      // Arrange Notes: Ctrl+Shift+A or Alt+A
      if ((meta && e.shiftKey && key === "a") || (e.altKey && key === "a")) {
        e.preventDefault();
        tidyNotes();
      }
      if (e.key === "Escape") {
        setCaptureOpen(false);
        setHubOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);

    const unlisteners: (() => void)[] = [];

    if (isDesktopApp()) {
      unlisteners.push(
        listenToDesktopEvent("open-quick-capture", () => {
          setCaptureOpen(true);
        }),
      );
      unlisteners.push(
        listenToDesktopEvent("open-quick-timer", () => {
          triggerOpenQuickTimer();
        }),
      );
      unlisteners.push(
        listenToDesktopEvent("add-new-note", () => {
          addNote({ body: "", tint: "cream" });
        }),
      );
      unlisteners.push(
        listenToDesktopEvent("arrange-notes", () => {
          tidyNotes();
        }),
      );
      unlisteners.push(
        listenToDesktopEvent("toggle-show-hide-all", () => {
          setLayout(useLumen.getState().layout === "tray" ? "stickies" : "tray");
        }),
      );
      unlisteners.push(
        listenToDesktopEvent("toggle-pet", () => {
          setPipEnabled(!useLumen.getState().pip.enabled);
        }),
      );
      unlisteners.push(
        listenToDesktopEvent("open-pet-settings", () => {
          setHubOpen(true);
        }),
      );
      unlisteners.push(
        listenToDesktopEvent("open-app-settings", () => {
          setHubOpen(true);
        }),
      );
      unlisteners.push(
        listenToDesktopEvent("restore-window", () => {
          // Window restored
        }),
      );
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      for (const unlisten of unlisteners) {
        try {
          unlisten();
        } catch (err) {
          console.debug("[DesktopScene] unlisten error:", err);
        }
      }
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
