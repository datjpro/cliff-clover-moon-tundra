import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Clock, Crown, Eye, EyeOff, Folder, LayoutGrid, Plus, Search, Settings, Sparkles, X } from "lucide-react";
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
import { AppStartupLoading } from "./app-loading";
import { BallToy } from "./ball-toy";
import { Companion } from "./companion";
import { FloatingTimers } from "./floating-timers";
import { Hub } from "./hub";
import { MissedRemindersModal } from "./missed-reminders-modal";
import { Onboarding } from "./onboarding";
import { ProUpgradeModal } from "./pro-upgrade-modal";
import { QuickCapture } from "./quick-capture";
import { QuickTimer, triggerOpenQuickTimer } from "./quick-timer";
import { SpotlightSearch } from "./spotlight-search";
import { StickyNote } from "./sticky-note";
import { ToastStack } from "./toasts";
import { cn } from "@/lib/utils";

// Floating Quick Tray Menu & Hover-Revealed Paper Well Dock (Supports Direct Drag to Canvas)
function FloatingTrayMenu() {
  const [open, setOpen] = useState(false);
  const [paperVisible, setPaperVisible] = useState(false);
  const [isDraggingPaper, setIsDraggingPaper] = useState(false);
  const [dragCursorPos, setDragCursorPos] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const lang = useLumen((s) => s.lang);
  const layout = useLumen((s) => s.layout);
  const setLayout = useLumen((s) => s.setLayout);
  const addNote = useLumen((s) => s.addNote);
  const setCaptureOpen = useLumen((s) => s.setCaptureOpen);
  const setQuickTimerOpen = useLumen((s) => s.setQuickTimerOpen);
  const setHubOpen = useLumen((s) => s.setHubOpen);
  const setSearchOpen = useLumen((s) => s.setSearchOpen);
  const tidyNotes = useLumen((s) => s.tidyNotes);
  const pipEnabled = useLumen((s) => s.pip.enabled);
  const setPipEnabled = useLumen((s) => s.setPipEnabled);
  const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);
  const pro = useLumen((s) => s.pro);
  const setProModalOpen = useLumen((s) => s.setProModalOpen);

  const isVi = lang === "vi";

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setPaperVisible(true);
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) return;
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    // 500ms delay hysteresis so user has ample time to move cursor to the paper stack
    leaveTimerRef.current = setTimeout(() => {
      setPaperVisible(false);
    }, 500);
  };

  const handlePaperPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setDragCursorPos({ x: e.clientX, y: e.clientY });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePaperPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    if (Math.hypot(dx, dy) > 8) {
      setIsDraggingPaper(true);
      setDragCursorPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePaperPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const distMoved = Math.hypot(dx, dy);

    if (distMoved > 25) {
      // User dragged to a location on the screen -> spawn note directly at dropped coordinates!
      const screenW = window.innerWidth || 1920;
      const screenH = window.innerHeight || 1080;
      const dropX = Math.max(4, Math.min(82, ((e.clientX - 120) / screenW) * 100));
      const dropY = Math.max(4, Math.min(76, ((e.clientY - 40) / screenH) * 100));

      sounds.playPop(640);
      addNote({
        x: dropX,
        y: dropY,
        body: "",
        tint: "cream",
      });
    } else {
      // Quick click on paper stack
      sounds.playPop(620);
      if (pipEnabled) {
        requestNoteFromPip();
      } else {
        addNote({
          x: Math.max(10, Math.min(80, 50 + (Math.random() - 0.5) * 30)),
          y: Math.max(10, Math.min(75, 40 + (Math.random() - 0.5) * 25)),
          body: "",
          tint: "cream",
        });
      }
    }

    setIsDraggingPaper(false);
  };

  return (
    <div
      className="interactive-el fixed right-6 bottom-5 z-[85] flex flex-col items-end gap-2 select-none"
      onPointerEnter={handleMouseEnter}
      onPointerLeave={handleMouseLeave}
    >
      {/* 1. Full Glassmorphism Tray Menu */}
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
                setCaptureOpen(true);
                setOpen(false);
              }}
              className="flex items-center justify-between px-2.5 h-9 rounded-xl hover:bg-[#262A35] transition-colors duration-120 text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="size-4.5 text-[#F5A623] group-hover:scale-110 transition-transform duration-120" />
                <span className="font-medium text-[#F4F5F7]">{isVi ? "Ghi chú mới" : "New Note"}</span>
              </div>
              <span className="text-[10px] text-[#8B90A0] font-mono">Alt+N</span>
            </button>

            {/* + Quick Timer */}
            <button
              type="button"
              onClick={() => {
                setQuickTimerOpen(true);
                setOpen(false);
              }}
              className="flex items-center justify-between px-2.5 h-9 rounded-xl hover:bg-[#262A35] transition-colors duration-120 text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="size-4.5 text-[#F5A623] group-hover:scale-110 transition-transform duration-120" />
                <span className="font-medium text-[#F4F5F7]">{isVi ? "Đặt giờ nhanh" : "Quick Timer"}</span>
              </div>
              <span className="text-[10px] text-[#8B90A0] font-mono">Alt+T</span>
            </button>

            {/* Spotlight Search */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setOpen(false);
              }}
              className="flex items-center justify-between px-2.5 h-9 rounded-xl hover:bg-[#262A35] transition-colors duration-120 text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Search className="size-4.5 text-[#F5A623] group-hover:scale-110 transition-transform duration-120" />
                <span className="font-medium text-[#F4F5F7]">{isVi ? "Tìm kiếm nhanh" : "Spotlight"}</span>
              </div>
              <span className="text-[10px] text-[#8B90A0] font-mono">Alt+F</span>
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
              <span className="text-[10px] text-[#8B90A0] font-mono">Alt+P</span>
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
              <span className="text-[10px] text-[#8B90A0] font-mono">Alt+O</span>
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
              <span className="text-[10px] text-[#8B90A0] font-mono">Alt+S</span>
            </button>

            {/* Lumen Pro Upgrade / Status */}
            <button
              type="button"
              onClick={() => {
                setProModalOpen(true);
                setOpen(false);
              }}
              className="flex items-center justify-between px-2.5 h-9 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 hover:border-amber-400 text-amber-300 font-medium transition-colors duration-120 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Crown className="size-4.5 text-amber-400" />
                <span>{pro.isPro ? (isVi ? "Lumen Pro (Đã Kích Hoạt)" : "Lumen Pro Active") : (isVi ? "Nâng cấp Lumen Pro" : "Upgrade Pro")}</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-mono font-semibold">
                PRO
              </span>
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
                Alt+A
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

      {/* 2. Hover-Revealed Paper Stack (Hidden by default, pops out on hover with 500ms leave delay buffer) */}
      {!open && paperVisible ? (
        <div
          className="animate-in fade-in slide-in-from-bottom-3 zoom-in-95 duration-200 mb-1 flex flex-col items-center cursor-grab active:cursor-grabbing group touch-none select-none"
          onPointerEnter={handleMouseEnter}
          onPointerLeave={handleMouseLeave}
          onPointerDown={handlePaperPointerDown}
          onPointerMove={handlePaperPointerMove}
          onPointerUp={handlePaperPointerUp}
          onPointerCancel={handlePaperPointerUp}
          title={isVi ? "Kéo để đặt ghi chú vào vị trí mong muốn • Hoặc nhấp để lấy nhanh" : "Drag to place note anywhere • Or click for quick note"}
          aria-label="Lấy giấy ghi chú"
        >
          <div className="relative h-16 w-14 hover:scale-110 active:scale-95 transition-transform duration-150">
            <span className="absolute inset-x-1 top-2.5 h-11 rotate-[-8deg] rounded-md bg-[#bae6fd] shadow-md border border-sky-300/40" />
            <span className="absolute inset-x-0.5 top-1.5 h-11 rotate-[4deg] rounded-md bg-[#bbf7d0] shadow-md border border-emerald-300/40" />
            <span className="absolute inset-x-0 top-0 h-11 rounded-md bg-[#fef08a] shadow-xl border border-amber-300 flex items-center justify-center">
              <span className="text-xs font-bold text-amber-900">📝</span>
            </span>
          </div>
          <span className="mt-1 rounded-full bg-[#1D2029]/95 px-2 py-0.5 text-[9px] font-bold text-[#F5A623] shadow-md border border-white/10 tracking-wide uppercase">
            {isVi ? "Kéo / Lấy giấy" : "Drag / Take"}
          </span>
        </div>
      ) : null}

      {/* 3. Dragged Paper Note Ghost Preview */}
      {isDraggingPaper ? (
        <div
          className="pointer-events-none fixed z-[99999] w-64 rounded-2xl bg-[#fef08a] p-4 text-stone-800 shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-amber-300 ring-2 ring-[#F5A623] rotate-[-2deg] opacity-90 backdrop-blur-sm animate-in zoom-in-95 duration-100"
          style={{
            left: `${dragCursorPos.x - 120}px`,
            top: `${dragCursorPos.y - 40}px`,
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b border-amber-400/40 text-amber-900/70 text-[11px] font-semibold">
            <span>📝 {isVi ? "Thả để dán ghi chú" : "Drop to stick note"}</span>
            <span className="text-[10px] uppercase font-mono">Lumen</span>
          </div>
          <p className="mt-2 text-xs text-amber-900/60 italic">
            {isVi ? "Kéo đến vị trí bạn muốn đặt ghi chú..." : "Drag to your desired note position..."}
          </p>
        </div>
      ) : null}

      {/* 4. Tiny Custom Pet Icon Trigger at Corner of Desktop */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex size-10 items-center justify-center rounded-2xl bg-[#1D2029]/95 hover:bg-[#1D2029] text-white shadow-2xl border border-white/10 backdrop-blur-xl hover:scale-110 active:scale-95 transition-transform duration-140 cursor-pointer"
        title="Lumen Overlay Menu (Chỉ chuột để hiện khay giấy)"
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
  const appLoaded = useLumen((s) => s.appLoaded);
  const captureOpen = useLumen((s) => s.captureOpen);
  const setCaptureOpen = useLumen((s) => s.setCaptureOpen);
  const quickTimerOpen = useLumen((s) => s.quickTimerOpen);
  const setQuickTimerOpen = useLumen((s) => s.setQuickTimerOpen);
  const hubOpen = useLumen((s) => s.hubOpen);
  const setHubOpen = useLumen((s) => s.setHubOpen);
  const searchOpen = useLumen((s) => s.searchOpen);
  const setSearchOpen = useLumen((s) => s.setSearchOpen);
  const undoDeleteNote = useLumen((s) => s.undoDeleteNote);
  const fireReminder = useLumen((s) => s.fireReminder);

  useEffect(() => {
    void Promise.resolve(useLumen.persist.rehydrate()).then(() => markHydrated());
  }, [markHydrated]);

  const isAnyModalOpen = captureOpen || quickTimerOpen || hubOpen || searchOpen;

  // High-Precision Desktop Click-Through Controller:
  // - Interactive Elements (Notes, Inputs, Textarea, Modals, Buttons) receive mouse clicks, focus, and caret
  // - Empty canvas passes through directly to background desktop/apps
  // - State transition filtering: Only sends IPC when boundary between interactive/transparent is crossed
  useEffect(() => {
    if (!isDesktopApp()) return;

    setIgnoreMouseEvents(true);
    let currentIgnore = true;

    const handlePointerMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isAtScreenBottomEdge = e.clientY >= window.innerHeight - 4;

      const isInteractive = Boolean(
        !isAtScreenBottomEdge &&
        target.closest(
          "article, .interactive-el, section[role='dialog'], form, button, input, textarea, .group, [role='dialog'], [tabindex], .modal-content",
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

  // Global & In-App Keyboard Shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const targetTag = (document.activeElement?.tagName || "").toLowerCase();
      const isTyping = targetTag === "input" || targetTag === "textarea";

      // Undo Delete Note: Ctrl+Z / Cmd+Z (when not typing in textarea)
      if ((e.ctrlKey || e.metaKey) && key === "z" && !e.shiftKey && !isTyping) {
        e.preventDefault();
        undoDeleteNote();
        return;
      }

      // Spotlight Search: Alt+F, Ctrl+F (when not typing)
      if (e.altKey && key === "f") {
        e.preventDefault();
        setSearchOpen(!useLumen.getState().searchOpen);
        return;
      }

      // Quick Note: Alt+N, Alt+Q (Zero collision with Chrome/Edge Incognito)
      if ((e.altKey && key === "n") || (e.altKey && key === "q")) {
        e.preventDefault();
        setCaptureOpen(!useLumen.getState().captureOpen);
      }
      // Quick Timer: Alt+T (Zero collision with Browser Reopen Tab)
      if (e.altKey && key === "t") {
        e.preventDefault();
        setQuickTimerOpen(!useLumen.getState().quickTimerOpen);
      }
      // Settings Hub: Alt+S, Alt+H
      if ((e.altKey && key === "s") || (e.altKey && key === "h")) {
        e.preventDefault();
        setHubOpen(!useLumen.getState().hubOpen);
      }
      // Arrange Notes: Alt+A
      if (e.altKey && key === "a") {
        e.preventDefault();
        tidyNotes();
      }
      // Toggle Show/Hide All: Alt+O
      if (e.altKey && key === "o") {
        e.preventDefault();
        setLayout(useLumen.getState().layout === "tray" ? "stickies" : "tray");
      }
      // Toggle Pet: Alt+P
      if (e.altKey && key === "p") {
        e.preventDefault();
        setPipEnabled(!useLumen.getState().pip.enabled);
      }
      if (e.key === "Escape") {
        setCaptureOpen(false);
        setQuickTimerOpen(false);
        setHubOpen(false);
        setSearchOpen(false);
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
          setQuickTimerOpen(true);
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
  }, [setCaptureOpen, setQuickTimerOpen, setHubOpen, addNote, tidyNotes, setLayout, setPipEnabled]);

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

  const selectedCluster = useLumen((s) => s.selectedCluster);
  const setSelectedCluster = useLumen((s) => s.setSelectedCluster);
  const pushToast = useLumen((s) => s.pushToast);

  const [isDragOverFile, setIsDragOverFile] = useState(false);

  // Drag and drop text files (.txt, .md, .csv, .log) directly to spawn sticky notes
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOverFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverFile(false);

    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = (reader.result as string) || "";
        const title = file.name.replace(/\.[^/.]+$/, "");
        const parent = document.body.getBoundingClientRect();
        const dropX = Math.max(6, Math.min(75, ((e.clientX + index * 25) / parent.width) * 100));
        const dropY = Math.max(8, Math.min(70, ((e.clientY + index * 25) / parent.height) * 100));

        addNote({
          title,
          body: text,
          x: dropX,
          y: dropY,
          tint: index % 2 === 0 ? "cream" : "sage",
          cluster: selectedCluster || undefined,
        });

        sounds.playPop(700);
        pushToast("Đã tạo ghi chú từ file", `📄 ${file.name}`);
      };
      reader.readAsText(file);
    });
  };

  const availableClusters = Array.from(
    new Set(notes.map((n) => n.cluster).filter((c): c is string => Boolean(c))),
  );

  // Filter notes by active cluster if selected
  const visibleNotes =
    layout === "tray"
      ? []
      : selectedCluster
      ? notes.filter((n) => n.cluster === selectedCluster)
      : notes;

  return (
    <div
      data-theme={theme}
      data-transparent="true"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="fixed inset-0 h-screen w-screen bg-transparent text-fg select-none overflow-hidden pointer-events-none"
    >
      {/* Interactive Cluster Switcher Dock (Top Center) */}
      {availableClusters.length > 0 && (
        <div className="interactive-el absolute top-3 left-1/2 -translate-x-1/2 z-[85] flex items-center gap-1 p-1 rounded-2xl bg-[#1D2029]/95 text-[#F4F5F7] border border-white/10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 pointer-events-auto max-w-[90vw] overflow-x-auto note-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCluster(null)}
            className={cn(
              "px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
              !selectedCluster
                ? "bg-[#F5A623] text-[#14161D] shadow-xs"
                : "text-[#8B90A0] hover:text-white hover:bg-white/10",
            )}
          >
            <span>Tất cả</span>
            <span className="text-[10px] opacity-75 font-mono">({notes.length})</span>
          </button>
          {availableClusters.map((clusterName) => {
            const count = notes.filter((n) => n.cluster === clusterName).length;
            const isActive = selectedCluster === clusterName;
            return (
              <button
                key={clusterName}
                type="button"
                onClick={() => setSelectedCluster(isActive ? null : clusterName)}
                className={cn(
                  "px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                  isActive
                    ? "bg-[#F5A623] text-[#14161D] shadow-xs"
                    : "text-[#8B90A0] hover:text-white hover:bg-white/10",
                )}
              >
                <Folder className="size-3" />
                <span className="max-w-[120px] truncate">{clusterName}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Drag-and-drop file drop target indicator */}
      {isDragOverFile && (
        <div className="fixed inset-4 z-[95] rounded-3xl border-2 border-dashed border-[#F5A623] bg-[#1D2029]/85 backdrop-blur-md flex flex-col items-center justify-center text-[#F4F5F7] animate-in fade-in zoom-in-95 pointer-events-none shadow-2xl">
          <div className="size-16 rounded-2xl bg-[#F5A623]/20 flex items-center justify-center text-[#F5A623] mb-3 animate-bounce">
            <Folder className="size-8" />
          </div>
          <p className="font-bold text-base text-[#F5A623]">
            Thả file .txt / .md vào đây để tạo ghi chú dán tức thì
          </p>
          <p className="text-xs text-[#8B90A0] mt-1">
            Hỗ trợ tự động đọc văn bản từ các tệp .txt, .md, .csv, .log
          </p>
        </div>
      )}

      {appLoaded &&
        visibleNotes.map((n) => (
          <StickyNote key={n.id} note={n} />
        ))}
      {appLoaded && <FloatingTimers />}
      {appLoaded && <BallToy />}
      {appLoaded && <Companion />}
      <ToastStack />
      <AlarmRingingModal />
      <MissedRemindersModal />
      <QuickCapture />
      <QuickTimer />
      <SpotlightSearch />
      <Hub />
      <ProUpgradeModal />
      {appLoaded && <Onboarding />}
      {appLoaded && <FloatingTrayMenu />}
      <AppStartupLoading />
    </div>
  );
}
