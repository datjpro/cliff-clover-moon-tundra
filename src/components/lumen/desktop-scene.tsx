import { useEffect } from "react";
import { Cookie, Eye, EyeOff, Heart, LayoutGrid, Maximize2, Minus, Minimize2, Pin, Sparkles, X } from "lucide-react";
import {
  closeOrQuitDesktopApp,
  isDesktopApp,
  minimizeDesktopWindow,
  sendDesktopNotification,
  switchToCornerWidgetMode,
  switchToFullDesktopMode,
  toggleAlwaysOnTop,
} from "@/lib/desktop-bridge";
import { DICTIONARY } from "@/lib/i18n";
import { useLumen } from "@/lib/store";
import { Companion } from "./companion";
import { Hub } from "./hub";
import { Onboarding } from "./onboarding";
import { PipFigure } from "./pip";
import { QuickCapture } from "./quick-capture";
import { StickyNote } from "./sticky-note";
import { ToastStack } from "./toasts";
import { Tray } from "./tray";
import { cn } from "@/lib/utils";

function PaperWell() {
  const request = useLumen((s) => s.requestNoteFromPip);
  const enabled = useLumen((s) => s.pip.enabled);
  return (
    <button
      type="button"
      onClick={request}
      className="absolute right-[5%] bottom-20 z-[5] hidden w-16 sm:block cursor-pointer hover:scale-110 transition-transform"
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

// Top Window Titlebar with Native Window Controls
function WindowTitlebar() {
  const lang = useLumen((s) => s.lang);
  const setLang = useLumen((s) => s.setLang);
  const layout = useLumen((s) => s.layout);
  const setLayout = useLumen((s) => s.setLayout);
  const alwaysOnTop = useLumen((s) => s.alwaysOnTop);
  const setAlwaysOnTop = useLumen((s) => s.setAlwaysOnTop);
  const transparentOverlay = useLumen((s) => s.transparentOverlay);
  const setTransparentOverlay = useLumen((s) => s.setTransparentOverlay);
  const tidyNotes = useLumen((s) => s.tidyNotes);
  const dict = DICTIONARY[lang];

  const handleToggleCorner = () => {
    if (layout === "corner") {
      setLayout("stickies");
      void switchToFullDesktopMode();
    } else {
      setLayout("corner");
      void switchToCornerWidgetMode();
    }
  };

  const handleAlwaysOnTop = () => {
    const next = !alwaysOnTop;
    setAlwaysOnTop(next);
    void toggleAlwaysOnTop(next);
  };

  return (
    <header
      className="absolute inset-x-0 top-0 z-[95] flex h-9 items-center justify-between px-3 bg-tray/85 backdrop-blur-md border-b border-white/5 text-tray-fg select-none"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Left: Brand + Language Toggle + Tidy Notes */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <span className="size-2 rounded-full bg-accent animate-pulse" />
        <span className="font-display text-xs font-semibold tracking-wide">{dict.appName}</span>

        {/* Quick Language Toggle */}
        <button
          type="button"
          onClick={() => setLang(lang === "vi" ? "en" : "vi")}
          className="ml-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          title={dict.look.language}
        >
          {lang === "vi" ? "🇻🇳 VI" : "🇬🇧 EN"}
        </button>

        {/* Tidy / Organize Notes Button */}
        <button
          type="button"
          onClick={tidyNotes}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium bg-accent/15 hover:bg-accent/25 text-accent transition-colors cursor-pointer"
          title={lang === "vi" ? "Sắp xếp lại ghi chú ngay ngắn" : "Tidy and arrange all notes"}
        >
          <LayoutGrid className="size-3" />
          <span className="hidden sm:inline">{lang === "vi" ? "Sắp xếp ghi chú" : "Tidy Notes"}</span>
        </button>
      </div>

      {/* Right: Window Controls (Transparent overlay toggle, Pin, Shrink to Corner, Minimize, Close/Exit) */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        {/* Toggle Transparent Screen Overlay Mode */}
        <button
          type="button"
          onClick={() => setTransparentOverlay(!transparentOverlay)}
          title={
            transparentOverlay
              ? lang === "vi"
                ? "Đang ở chế độ trong suốt phủ màn hình máy tính"
                : "Transparent desktop overlay active"
              : lang === "vi"
                ? "Bật chế độ trong suốt phủ màn hình máy tính"
                : "Enable transparent desktop overlay"
          }
          className={cn(
            "flex size-6 items-center justify-center rounded hover:bg-white/15 transition-colors cursor-pointer",
            transparentOverlay ? "text-accent" : "opacity-40",
          )}
        >
          {transparentOverlay ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
        </button>

        {/* Always on top toggle */}
        <button
          type="button"
          onClick={handleAlwaysOnTop}
          title={dict.look.alwaysOnTop}
          className={cn(
            "flex size-6 items-center justify-center rounded hover:bg-white/15 transition-colors cursor-pointer",
            alwaysOnTop ? "text-accent" : "opacity-40",
          )}
        >
          <Pin className="size-3.5" />
        </button>

        {/* Shrink to Screen Corner Widget Mode */}
        <button
          type="button"
          onClick={handleToggleCorner}
          title={layout === "corner" ? dict.windowControls.fullMode : dict.windowControls.cornerMode}
          className={cn(
            "flex size-6 items-center justify-center rounded hover:bg-white/15 transition-colors cursor-pointer",
            layout === "corner" ? "text-accent font-bold" : "opacity-70 hover:opacity-100",
          )}
        >
          {layout === "corner" ? <Maximize2 className="size-3.5" /> : <Minimize2 className="size-3.5" />}
        </button>

        {/* Minimize to Taskbar */}
        <button
          type="button"
          onClick={() => void minimizeDesktopWindow()}
          title={dict.windowControls.minimize}
          className="flex size-6 items-center justify-center rounded hover:bg-white/15 transition-colors cursor-pointer opacity-70 hover:opacity-100"
        >
          <Minus className="size-3.5" />
        </button>

        {/* Close / Quit Application */}
        <button
          type="button"
          onClick={() => void closeOrQuitDesktopApp()}
          title={dict.windowControls.quit}
          className="flex size-6 items-center justify-center rounded hover:bg-red-500/80 hover:text-white transition-colors cursor-pointer opacity-70 hover:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </header>
  );
}

// Dedicated Mini Corner Screen Widget
function CornerWidgetMode() {
  const lang = useLumen((s) => s.lang);
  const dict = DICTIONARY[lang];
  const pip = useLumen((s) => s.pip);
  const feedPip = useLumen((s) => s.feedPip);
  const petPip = useLumen((s) => s.petPip);
  const dancePip = useLumen((s) => s.dancePip);
  const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);
  const notes = useLumen((s) => s.notes);
  const updateNote = useLumen((s) => s.updateNote);
  const addNote = useLumen((s) => s.addNote);
  const setHubOpen = useLumen((s) => s.setHubOpen);

  const activeNote = notes[0];

  const handleCreateNote = () => {
    const id = addNote({
      body: lang === "vi" ? "Ghi chú mới từ góc màn hình ✨" : "New note from corner widget ✨",
      tint: "cream",
    });
    if (activeNote) updateNote(id, { body: "" });
  };

  return (
    <div className="flex h-full flex-col pt-10 pb-2 px-3 justify-between select-none bg-surface/90 backdrop-blur-lg">
      {/* Pip Mini Garden */}
      <div className="relative flex flex-col items-center justify-center rounded-xl bg-elevated/70 p-3 ring-1 ring-border shadow-[var(--shadow-float)]">
        {pip.speech ? (
          <span className="animate-in fade-in text-center mb-1 text-[11px] font-medium text-accent bg-surface px-2.5 py-0.5 rounded-full ring-1 ring-border">
            {pip.speech}
          </span>
        ) : null}
        <button
          type="button"
          onClick={petPip}
          onDoubleClick={feedPip}
          className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title={dict.pipStudio.petPip}
        >
          <PipFigure
            walking={pip.moving}
            carrying={pip.carrying}
            facing={pip.facing}
            mood={pip.mood}
            skin={pip.skin}
            className="scale-90"
          />
        </button>

        {/* Mini Action Toolbar */}
        <div className="mt-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={petPip}
            title={dict.pipStudio.petPip}
            className="flex size-7 items-center justify-center rounded-full bg-surface hover:bg-elevated text-rose-400 cursor-pointer shadow-sm"
          >
            <Heart className="size-3.5 fill-rose-400/30" />
          </button>
          <button
            type="button"
            onClick={feedPip}
            title={dict.pipStudio.feedSnack}
            className="flex size-7 items-center justify-center rounded-full bg-surface hover:bg-elevated text-amber-400 cursor-pointer shadow-sm"
          >
            <Cookie className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={dancePip}
            title={dict.pipStudio.danceParty}
            className="flex size-7 items-center justify-center rounded-full bg-surface hover:bg-elevated text-indigo-400 cursor-pointer shadow-sm"
          >
            <Sparkles className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              requestNoteFromPip();
              handleCreateNote();
            }}
            title={dict.pipStudio.fetchNote}
            className="flex size-7 items-center justify-center rounded-full bg-surface hover:bg-elevated text-emerald-400 cursor-pointer shadow-sm"
          >
            <span className="text-xs font-bold">+📝</span>
          </button>
        </div>
      </div>

      {/* Mini Active Sticky Note Pad */}
      <div className="rounded-xl bg-elevated/90 p-2.5 ring-1 ring-border shadow-md">
        <div className="flex items-center justify-between pb-1.5 text-[11px] font-medium text-muted">
          <span>{dict.quickNote}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreateNote}
              className="text-[10px] text-accent hover:underline cursor-pointer font-bold"
            >
              + {lang === "vi" ? "Tạo note" : "New"}
            </button>
            <button
              type="button"
              onClick={() => setHubOpen(true)}
              className="text-[10px] text-muted hover:text-fg cursor-pointer"
            >
              {dict.settings}
            </button>
          </div>
        </div>
        {activeNote ? (
          <textarea
            value={activeNote.body}
            onChange={(e) => updateNote(activeNote.id, { body: e.target.value })}
            placeholder={dict.writePlaceholder}
            rows={3}
            className="w-full resize-none rounded-lg bg-surface/80 p-2 text-xs text-fg outline-none placeholder:opacity-40 focus-visible:ring-1 focus-visible:ring-accent"
          />
        ) : (
          <button
            type="button"
            onClick={handleCreateNote}
            className="w-full py-2 rounded-lg bg-surface/50 text-xs text-muted hover:text-fg text-center cursor-pointer"
          >
            + {dict.quickNote}
          </button>
        )}
      </div>
    </div>
  );
}

export function DesktopScene() {
  const theme = useLumen((s) => s.theme);
  const layout = useLumen((s) => s.layout);
  const transparentOverlay = useLumen((s) => s.transparentOverlay);
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

  const visibleNotes = layout === "tray" || layout === "corner" ? [] : notes;

  return (
    <div
      data-theme={theme}
      data-transparent={transparentOverlay ? "true" : "false"}
      className="h-dvh min-h-dvh bg-bg text-fg select-none overflow-hidden relative"
    >
      {/* Top Window Titlebar with Native Window Controls */}
      <WindowTitlebar />

      <div className="wallpaper relative h-full overflow-hidden pt-9">
        {layout === "corner" ? (
          <CornerWidgetMode />
        ) : (
          <>
            {!transparentOverlay && (
              <div className="pointer-events-none absolute inset-x-[12%] top-[8%] hidden h-[38%] rounded-sm bg-[var(--wall-glow)]/10 sm:block" />
            )}
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
          </>
        )}
      </div>
    </div>
  );
}
