import { useEffect } from "react";
import { Cookie, Heart, Maximize2, Minus, Minimize2, Pin, Sparkles, X } from "lucide-react";
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

// Top Window Titlebar with Native Window Controls (Minimize, Shrink to Screen Corner, Exit)
function WindowTitlebar() {
  const lang = useLumen((s) => s.lang);
  const setLang = useLumen((s) => s.setLang);
  const layout = useLumen((s) => s.layout);
  const setLayout = useLumen((s) => s.setLayout);
  const alwaysOnTop = useLumen((s) => s.alwaysOnTop);
  const setAlwaysOnTop = useLumen((s) => s.setAlwaysOnTop);
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
      className="absolute inset-x-0 top-0 z-[95] flex h-9 items-center justify-between px-3 bg-tray/80 backdrop-blur-md border-b border-white/5 text-tray-fg select-none"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Left: Brand + Language Toggle */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <span className="size-2 rounded-full bg-accent animate-pulse" />
        <span className="font-display text-xs font-semibold tracking-wide">{dict.appName}</span>

        {/* Quick Language Toggle */}
        <button
          type="button"
          onClick={() => setLang(lang === "vi" ? "en" : "vi")}
          className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-medium bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          title={dict.look.language}
        >
          {lang === "vi" ? "🇻🇳 VI" : "🇬🇧 EN"}
        </button>
      </div>

      {/* Right: Window Controls (Pin, Shrink to OS Corner, Minimize, Close/Exit) */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
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

// Dedicated Mini Corner Screen Widget (When shrunk to the bottom-right corner of computer screen)
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

  return (
    <div className="flex h-full flex-col pt-10 pb-2 px-3 justify-between select-none">
      {/* Pip Mini Garden */}
      <div className="relative flex flex-col items-center justify-center rounded-xl bg-surface/80 p-3 ring-1 ring-border shadow-[var(--shadow-float)]">
        {pip.speech ? (
          <span className="animate-in fade-in text-center mb-1 text-[11px] font-medium text-accent bg-elevated px-2 py-0.5 rounded-full ring-1 ring-border">
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
            className="flex size-7 items-center justify-center rounded-full bg-elevated hover:bg-surface text-rose-400 cursor-pointer shadow-sm"
          >
            <Heart className="size-3.5 fill-rose-400/30" />
          </button>
          <button
            type="button"
            onClick={feedPip}
            title={dict.pipStudio.feedSnack}
            className="flex size-7 items-center justify-center rounded-full bg-elevated hover:bg-surface text-amber-400 cursor-pointer shadow-sm"
          >
            <Cookie className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={dancePip}
            title={dict.pipStudio.danceParty}
            className="flex size-7 items-center justify-center rounded-full bg-elevated hover:bg-surface text-indigo-400 cursor-pointer shadow-sm"
          >
            <Sparkles className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={requestNoteFromPip}
            title={dict.pipStudio.fetchNote}
            className="flex size-7 items-center justify-center rounded-full bg-elevated hover:bg-surface text-emerald-400 cursor-pointer shadow-sm"
          >
            <span className="text-xs font-bold">+📝</span>
          </button>
        </div>
      </div>

      {/* Mini Active Sticky Note Pad */}
      <div className="rounded-xl bg-surface/90 p-2.5 ring-1 ring-border shadow-md">
        <div className="flex items-center justify-between pb-1.5 text-[11px] font-medium text-muted">
          <span>{dict.quickNote}</span>
          <button
            type="button"
            onClick={() => setHubOpen(true)}
            className="text-[10px] text-accent hover:underline cursor-pointer"
          >
            {dict.settings}
          </button>
        </div>
        {activeNote ? (
          <textarea
            value={activeNote.body}
            onChange={(e) => updateNote(activeNote.id, { body: e.target.value })}
            placeholder={dict.writePlaceholder}
            rows={3}
            className="w-full resize-none rounded-lg bg-elevated/70 p-2 text-xs text-fg outline-none placeholder:opacity-40 focus-visible:ring-1 focus-visible:ring-accent"
          />
        ) : (
          <button
            type="button"
            onClick={() => addNote({ body: "Ghi chú mới...", tint: "cream" })}
            className="w-full py-2 rounded-lg bg-elevated/50 text-xs text-muted hover:text-fg text-center cursor-pointer"
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
    <div data-theme={theme} className="h-dvh min-h-dvh bg-bg text-fg select-none overflow-hidden relative">
      {/* Top Window Titlebar with Native Window Controls (Minimize, Shrink to Screen Corner, Exit) */}
      <WindowTitlebar />

      <div className="wallpaper relative h-full overflow-hidden pt-9">
        {layout === "corner" ? (
          <CornerWidgetMode />
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
