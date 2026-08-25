import { useEffect, useState } from "react";
import { Bell, PenLine, Settings2 } from "lucide-react";
import { DICTIONARY } from "@/lib/i18n";
import { useLumen } from "@/lib/store";
import { PipFigure } from "./pip";

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) {
    return <span className="tabular-nums text-xs font-medium text-[#8B90A0]">--:--</span>;
  }
  return (
    <time className="tabular-nums text-xs font-mono font-medium text-[#8B90A0]" dateTime={now.toISOString()}>
      {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </time>
  );
}

export function Tray() {
  const lang = useLumen((s) => s.lang);
  const dict = DICTIONARY[lang];
  const setHubOpen = useLumen((s) => s.setHubOpen);
  const hubOpen = useLumen((s) => s.hubOpen);
  const setCaptureOpen = useLumen((s) => s.setCaptureOpen);
  const pipEnabled = useLumen((s) => s.pip.enabled);
  const petType = useLumen((s) => s.pip.petType);
  const pipSkin = useLumen((s) => s.pip.skin);
  const setPipEnabled = useLumen((s) => s.setPipEnabled);
  const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);
  const pending = useLumen((s) => s.reminders.filter((r) => !r.done).length);

  return (
    <footer className="interactive-el absolute inset-x-0 bottom-0 z-[80] flex h-12 items-center justify-between gap-2 border-t border-white/6 bg-[#1D2029]/85 backdrop-blur-md px-3 text-[#F4F5F7] select-none">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setHubOpen(!hubOpen)}
          className="flex h-9 items-center gap-2 rounded-xl px-2.5 hover:bg-white/10 transition-colors cursor-pointer"
          aria-pressed={hubOpen}
        >
          <span className="grid size-6 place-items-center rounded-lg bg-[#F5A623]/20 border border-[#F5A623]/30">
            <span className="block size-2 rounded-full bg-[#F5A623]" />
          </span>
          <span className="hidden font-semibold text-sm sm:inline">{dict.appName}</span>
        </button>
        <button
          type="button"
          onClick={() => setCaptureOpen(true)}
          className="flex size-9 items-center justify-center rounded-xl hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
          aria-label={dict.quickNote}
          title={dict.quickNote}
        >
          <PenLine className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setHubOpen(true)}
          className="relative flex size-9 items-center justify-center rounded-xl hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
          aria-label={dict.reminders}
          title={dict.reminders}
        >
          <Bell className="size-4" />
          {pending > 0 ? (
            <span className="absolute top-2 right-2 size-2 rounded-full bg-[#F5A623] animate-pulse" />
          ) : null}
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => (pipEnabled ? requestNoteFromPip() : setPipEnabled(true))}
          className="hidden h-9 items-center gap-1 rounded-xl px-1.5 hover:bg-white/10 sm:flex cursor-pointer transition-colors"
          aria-label={pipEnabled ? dict.pipStudio.fetchNote : dict.pipStudio.enableCompanion}
          title={pipEnabled ? dict.pipStudio.fetchNote : dict.pipStudio.enableCompanion}
        >
          <span className="block h-8 w-8 scale-75">
            <PipFigure walking={false} carrying={false} facing={-1} petType={petType} skin={pipSkin} />
          </span>
        </button>
        <button
          type="button"
          onClick={() => setHubOpen(true)}
          className="flex size-9 items-center justify-center rounded-xl hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
          aria-label={dict.settings}
          title={dict.settings}
        >
          <Settings2 className="size-4" />
        </button>
        <Clock />
      </div>
    </footer>
  );
}
