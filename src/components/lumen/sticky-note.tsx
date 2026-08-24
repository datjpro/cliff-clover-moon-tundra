import { useRef, type PointerEvent } from "react";
import { Trash2 } from "lucide-react";
import { sounds } from "@/lib/audio";
import { NOTE_TINTS, useLumen } from "@/lib/store";
import type { Note } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  note: Note;
  stacked?: boolean;
};

export function StickyNote({ note, stacked }: Props) {
  const updateNote = useLumen((s) => s.updateNote);
  const removeNote = useLumen((s) => s.removeNote);
  const bringNote = useLumen((s) => s.bringNote);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (stacked) return;
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
    const maxX = parent.width < 640 ? 48 : 78;
    const maxY = parent.height < 700 ? 58 : 70;
    const x = Math.max(2, Math.min(maxX, ((e.clientX - parent.left) / parent.width) * 100 - drag.current.dx));
    const y = Math.max(4, Math.min(maxY, ((e.clientY - parent.top) / parent.height) * 100 - drag.current.dy));
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
        transform: `rotate(${note.rot}deg)`,
        zIndex: note.z + 10,
      };

  return (
    <article
      className={cn(
        "rounded-lg p-3 shadow-[var(--shadow-float)] transition-shadow duration-200 select-none",
        stacked ? "relative w-full" : "absolute w-44 sm:w-56 cursor-grab active:cursor-grabbing",
        `note-${note.tint}`,
      )}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <header className="mb-2 flex items-center justify-between gap-2">
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
              className="relative flex size-7 items-center justify-center cursor-pointer"
            >
              <span
                className={cn(
                  "size-3 rounded-full shadow-[var(--shadow-border)] transition-transform hover:scale-125",
                  `note-${t.id}`,
                  note.tint === t.id ? "ring-1 ring-fg/30 scale-110" : "opacity-70",
                )}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Delete note"
          onClick={() => removeNote(note.id)}
          className="flex size-7 items-center justify-center rounded-sm opacity-50 hover:opacity-100 hover:text-red-600 transition-opacity cursor-pointer"
        >
          <Trash2 className="size-3.5" />
        </button>
      </header>
      <textarea
        value={note.body}
        onChange={(e) => updateNote(note.id, { body: e.target.value })}
        onFocus={() => bringNote(note.id)}
        placeholder="Write your note…"
        rows={5}
        suppressHydrationWarning
        className="w-full resize-none bg-transparent text-sm leading-snug text-inherit outline-none placeholder:opacity-40 select-text"
      />
    </article>
  );
}
