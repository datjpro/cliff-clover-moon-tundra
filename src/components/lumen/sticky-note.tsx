import { useRef, type PointerEvent } from "react";
import { ChevronDown, ChevronUp, Pin, Trash2 } from "lucide-react";
import { sounds } from "@/lib/audio";
import { DICTIONARY } from "@/lib/i18n";
import { NOTE_TINTS, useLumen } from "@/lib/store";
import type { Note, NoteTint } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  note: Note;
  stacked?: boolean;
};

// 3D Metallic Pushpin / Thumbtack matching the reference artwork
function Pushpin({ tint }: { tint: NoteTint }) {
  const pinColors: Record<NoteTint, string> = {
    cream: "#d97706", // Amber pin
    mist: "#0284c7",  // Ocean blue pin
    sage: "#16a34a",  // Emerald green pin
    blush: "#e11d48", // Crimson rose pin
  };
  const color = pinColors[tint] || "#d97706";

  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-md">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        {/* Needle */}
        <line x1="12" y1="12" x2="12" y2="20" stroke="#52525b" strokeWidth="2.2" strokeLinecap="round" />
        {/* Pin Round Head */}
        <circle cx="12" cy="9" r="6.5" fill={color} />
        {/* Inner ring */}
        <circle cx="12" cy="9" r="4.5" fill={color} stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" />
        {/* 3D Specular Highlight */}
        <circle cx="9.8" cy="6.8" r="2" fill="#ffffff" opacity="0.85" />
      </svg>
    </div>
  );
}

export function StickyNote({ note, stacked }: Props) {
  const lang = useLumen((s) => s.lang);
  const dict = DICTIONARY[lang];
  const updateNote = useLumen((s) => s.updateNote);
  const removeNote = useLumen((s) => s.removeNote);
  const bringNote = useLumen((s) => s.bringNote);
  const toggleNoteCollapse = useLumen((s) => s.toggleNoteCollapse);
  const toggleNotePin = useLumen((s) => s.toggleNotePin);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (stacked || note.pinned) return;
    if ((e.target as HTMLElement).closest("textarea,button")) return;
    bringNote(note.id);
    sounds.playPop(540);
    const parent = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    drag.current = {
      dx: ((e.clientX - parent.left) / parent.width) * 100 - note.x,
      dy: ((e.clientY - parent.top) / parent.height) * 100 - note.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!drag.current) return;
    const parent = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const maxX = parent.width < 640 ? 48 : 88;
    const maxY = parent.height < 700 ? 58 : 86;
    const x = Math.max(1, Math.min(maxX, ((e.clientX - parent.left) / parent.width) * 100 - drag.current.dx));
    const y = Math.max(2, Math.min(maxY, ((e.clientY - parent.top) / parent.height) * 100 - drag.current.dy));
    updateNote(note.id, { x, y });
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const style = stacked
    ? undefined
    : {
        left: `${note.x}%`,
        top: `${note.y}%`,
        transform: note.collapsed ? "none" : `rotate(${note.rot}deg)`,
        zIndex: (note.pinned ? 90 : 10) + note.z,
      };

  // Compact Minimized Pill View
  if (note.collapsed && !stacked) {
    return (
      <div
        className={cn(
          "absolute flex items-center gap-2 rounded-full px-3 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.25)] ring-1 ring-black/10 cursor-grab active:cursor-grabbing select-none transition-all duration-200 hover:scale-105",
          `note-${note.tint}`,
        )}
        style={style}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => toggleNoteCollapse(note.id)}
      >
        <span className="size-2.5 rounded-full bg-black/30" />
        <span className="max-w-[130px] sm:max-w-[170px] truncate text-xs font-semibold">
          {note.body.trim() || dict.writePlaceholder}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleNoteCollapse(note.id);
          }}
          title={dict.expand}
          className="flex size-5 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors cursor-pointer"
        >
          <ChevronDown className="size-3" />
        </button>
      </div>
    );
  }

  // Full Expanded Realistic Sticky Note (matching reference image)
  return (
    <article
      className={cn(
        "relative rounded-md p-3.5 pt-4 transition-all duration-200 select-none group",
        "shadow-[0_12px_28px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.12)] border border-black/5",
        stacked ? "relative w-full" : "absolute w-48 sm:w-60 cursor-grab active:cursor-grabbing",
        `note-${note.tint}`,
        note.pinned && "ring-2 ring-amber-500 shadow-2xl",
      )}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* 3D Thumbtack / Pushpin on Top Center */}
      <Pushpin tint={note.tint} />

      {/* Header Controls (appear on hover / active) */}
      <header className="mb-2 flex items-center justify-between gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
        {/* Color Tints */}
        <div className="flex gap-1">
          {NOTE_TINTS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-label={t.label}
              onClick={() => {
                sounds.playPop(620);
                updateNote(note.id, { tint: t.id });
              }}
              className="relative flex size-5 items-center justify-center cursor-pointer"
            >
              <span
                className={cn(
                  "size-2.5 rounded-full shadow-sm transition-transform hover:scale-125 border border-black/15",
                  `note-${t.id}`,
                  note.tint === t.id ? "ring-1.5 ring-black/40 scale-110" : "opacity-80",
                )}
              />
            </button>
          ))}
        </div>

        {/* Action Controls: Pin, Collapse, Delete */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title={dict.pin}
            onClick={() => toggleNotePin(note.id)}
            className={cn(
              "flex size-5 items-center justify-center rounded transition-opacity cursor-pointer",
              note.pinned ? "text-amber-600 opacity-100 font-bold" : "opacity-40 hover:opacity-100",
            )}
          >
            <Pin className="size-3" />
          </button>
          <button
            type="button"
            title={dict.minimize}
            onClick={() => toggleNoteCollapse(note.id)}
            className="flex size-5 items-center justify-center rounded opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronUp className="size-3.5" />
          </button>
          <button
            type="button"
            title={dict.delete}
            onClick={() => removeNote(note.id)}
            className="flex size-5 items-center justify-center rounded opacity-40 hover:opacity-100 hover:text-red-600 transition-opacity cursor-pointer"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </header>

      {/* Note Body Textarea */}
      <textarea
        value={note.body}
        onChange={(e) => updateNote(note.id, { body: e.target.value })}
        onFocus={() => bringNote(note.id)}
        placeholder={dict.writePlaceholder}
        rows={5}
        suppressHydrationWarning
        className="w-full resize-none bg-transparent text-[13px] sm:text-sm font-medium leading-snug text-inherit outline-none placeholder:opacity-40 select-text"
      />
    </article>
  );
}
