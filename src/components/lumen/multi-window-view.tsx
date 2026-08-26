import { useEffect, useState } from "react";
import { useLumen } from "@/lib/store";
import { StickyNote } from "./sticky-note";
import { Companion } from "./companion";
import { Hub } from "./hub";
import { ProUpgradeModal } from "./pro-upgrade-modal";
import { QuickCapture } from "./quick-capture";
import { QuickTimer } from "./quick-timer";
import { ToastStack } from "./toasts";
import { DesktopScene } from "./desktop-scene";

export function MultiWindowRouter() {
  const [view, setView] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const notes = useLumen((s) => s.notes);
  const markHydrated = useLumen((s) => s.markHydrated);

  useEffect(() => {
    void Promise.resolve(useLumen.persist.rehydrate()).then(() => markHydrated());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("view");
      const id = params.get("id");
      setView(v);
      setNoteId(id);
    }
  }, [markHydrated]);

  // 1. Single Note Window View
  if (view === "note" && noteId) {
    const targetNote = notes.find((n) => n.id === noteId);
    if (!targetNote) {
      return (
        <div className="flex h-screen w-screen items-center justify-center p-4 text-xs text-stone-400 bg-transparent select-none">
          <span>Ghi chú đã bị xoá</span>
        </div>
      );
    }

    return (
      <div className="h-screen w-screen bg-transparent p-2 select-none overflow-hidden flex items-center justify-center">
        {/* Render note with fixed relative placement inside its window */}
        <div className="relative w-full h-full">
          <StickyNote note={{ ...targetNote, x: 0, y: 0, rot: 0 }} />
        </div>
        <ToastStack />
      </div>
    );
  }

  // 2. Pip Companion Mini Window View
  if (view === "pip") {
    return (
      <div className="h-screen w-screen bg-transparent p-1 select-none overflow-hidden flex items-center justify-center pointer-events-auto">
        <Companion />
        <ToastStack />
      </div>
    );
  }

  // 3. Settings / Hub Standalone Window View
  if (view === "hub") {
    return (
      <div className="h-screen w-screen bg-[#14161D] text-stone-100 p-4 select-none overflow-auto">
        <Hub />
        <ToastStack />
      </div>
    );
  }

  // 4. Pro Upgrade Standalone Window View
  if (view === "pro") {
    return (
      <div className="h-screen w-screen bg-[#14161D] text-stone-100 p-4 select-none overflow-auto">
        <ProUpgradeModal />
        <ToastStack />
      </div>
    );
  }

  // 5. Quick Capture Window View
  if (view === "quick-capture") {
    return (
      <div className="h-screen w-screen bg-transparent p-4 flex items-center justify-center">
        <QuickCapture />
      </div>
    );
  }

  // 6. Quick Timer Window View
  if (view === "quick-timer") {
    return (
      <div className="h-screen w-screen bg-transparent p-4 flex items-center justify-center">
        <QuickTimer />
      </div>
    );
  }

  // Default: Full Spatial Desktop Scene
  return <DesktopScene />;
}
