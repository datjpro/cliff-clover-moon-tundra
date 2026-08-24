import { useRef, type PointerEvent } from "react";
import { ChevronDown, ChevronUp, Pin, Trash2 } from "lucide-react";
import { sounds } from "@/lib/audio";
import { DICTIONARY } from "@/lib/i18n";
import { NOTE_TINTS, useLumen } from "@/lib/store";
import type { Note } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  note: Note;
  stacked?: boolean;
};

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
    const maxX = parent.width < 640 ? 48 : 84;
    const maxY = parent.height < 700 ? 58 : 82;
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

  // Compact Minimized Pill View (Floating Corner Badge)
  if (note.collapsed && !stacked) {
    return (
      <div
        className={cn(
          "absolute flex items-center gap-2 rounded-full px-3 py-1.5 shadow-[var(--shadow-float)] ring-1 ring-border/30 cursor-grab active:cursor-grabbing select-none transition-all duration-200 hover:scale-105",
          `note-${note.tint}`,
        )}
        style={style}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => toggleNoteCollapse(note.id)}
      >
        <span className="size-2 rounded-full bg-fg/40" />
        <span className="max-w-[120px] sm:max-w-[160px] truncate text-xs font-medium">
          {note.body.trim() || dict.writePlaceholder}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleNoteCollapse(note.id);
          }}
          title={dict.expand}
          className="flex size-5 items-center justify-center rounded-full bg-fg/10 hover:bg-fg/20 transition-colors"
        >
          <ChevronDown className="size-3" />
        </button>
      </div>
    );
  }

  // Full Expanded Sticky Note View
  return (
    <article
      className={cn(
        "rounded-lg p-3 shadow-[var(--shadow-float)] transition-all duration-200 select-none",
        stacked
          ? "relative w-full"
          : "absolute w-44 sm:w-56 cursor-grab active:cursor-grabbing",
        `note-${note.tint}`,
        note.pinned && "ring-2 ring-accent/60 shadow-xl",
      )}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <header className="mb-2 flex items-center justify-between gap-1.5">
        {/* Color Tints */}
        <div className="flex gap-0.5">
          {NOTE_TINTS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-label={t.label}
              onClick={() => {
                sounds.playPop(620);
                updateNote(note.id, { tint: t.id });
              }}
              className="relative flex size-6 items-center justify-center cursor-pointer"
            >
              <span
                className={cn(
                  "size-2.5 rounded-full shadow-[var(--shadow-border)] transition-transform hover:scale-125",
                  `note-${t.id}`,
                  note.tint === t.id ? "ring-1 ring-fg/30 scale-110" : "opacity-70",
                )}
              />
            </button>
          ))}
        </div>

        {/* Action Controls: Pin, Collapse / Minimize, Delete */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title={dict.pin}
            onClick={() => toggleNotePin(note.id)}
            className={cn(
              "flex size-6 items-center justify-center rounded-sm transition-opacity cursor-pointer",
              note.pinned ? "text-accent opacity-100 font-bold" : "opacity-40 hover:opacity-100",
            )}
          >
            <Pin className="size-3" />
          </button>
          <button
            type="button"
            title={dict.minimize}
            onClick={() => toggleNoteCollapse(note.id)}
            className="flex size-6 items-center justify-center rounded-sm opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronUp className="size-3.5" />
          </button>
          <button
            type="button"
            title={dict.delete}
            onClick={() => removeNote(note.id)}
            className="flex size-6 items-center justify-center rounded-sm opacity-50 hover:opacity-100 hover:text-red-600 transition-opacity cursor-pointer"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </header>

      <textarea
        value={note.body}
        onChange={(e) => updateNote(note.id, { body: e.target.value })}
        onFocus={() => bringNote(note.id)}
        placeholder={dict.writePlaceholder}
        rows={5}
        suppressHydrationWarning
        className="w-full resize-none bg-transparent text-sm leading-snug text-inherit outline-none placeholder:opacity-40 select-text"
      />
    </article>
  );
}
