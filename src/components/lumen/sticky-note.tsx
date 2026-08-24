import { useRef, useState, type PointerEvent } from "react";
import { CheckSquare, ChevronDown, ChevronUp, MoreHorizontal, Pin, Plus, Square, Trash2, Type } from "lucide-react";
import { sounds } from "@/lib/audio";
import { DICTIONARY } from "@/lib/i18n";
import { NOTE_TINTS, useLumen } from "@/lib/store";
import type { Note, NoteTint } from "@/lib/types";
import { cn, uid } from "@/lib/utils";

type Props = {
  note: Note;
  stacked?: boolean;
};

function Pushpin({ tint }: { tint: NoteTint }) {
  const pinColors: Record<NoteTint, string> = {
    cream: "#d97706",
    mist: "#0284c7",
    sage: "#16a34a",
    blush: "#e11d48",
    neon: "#06b6d4",
    dark: "#71717a",
    glass: "#64748b",
  };
  const color = pinColors[tint] || "#d97706";

  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-md">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <line x1="12" y1="12" x2="12" y2="20" stroke="#52525b" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="9" r="6.5" fill={color} />
        <circle cx="12" cy="9" r="4.5" fill={color} stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" />
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

  const [showOptions, setShowOptions] = useState(false);
  const [newCheckText, setNewCheckText] = useState("");

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (stacked || note.pinned) return;
    if ((e.target as HTMLElement).closest("textarea,input,button,.no-drag")) return;
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
    const maxX = parent.width < 640 ? 48 : 90;
    const maxY = parent.height < 700 ? 58 : 88;
    const x = Math.max(1, Math.min(maxX, ((e.clientX - parent.left) / parent.width) * 100 - drag.current.dx));
    const y = Math.max(2, Math.min(maxY, ((e.clientY - parent.top) / parent.height) * 100 - drag.current.dy));
    updateNote(note.id, { x, y });
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const addCheckItem = () => {
    if (!newCheckText.trim()) return;
    const items = note.checkItems || [];
    updateNote(note.id, {
      checkItems: [...items, { id: uid(), text: newCheckText.trim(), done: false }],
    });
    setNewCheckText("");
  };

  const toggleCheckItem = (itemId: string) => {
    sounds.playPop(600);
    const items = (note.checkItems || []).map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item,
    );
    updateNote(note.id, { checkItems: items });
  };

  const removeCheckItem = (itemId: string) => {
    const items = (note.checkItems || []).filter((item) => item.id !== itemId);
    updateNote(note.id, { checkItems: items });
  };

  const style = stacked
    ? undefined
    : {
        left: `${note.x}%`,
        top: `${note.y}%`,
        transform: note.collapsed ? "none" : `rotate(${note.rot}deg)`,
        zIndex: (note.pinned ? 90 : 10) + note.z,
        opacity: note.opacity ?? 1,
      };

  // Compact Minimized Pill View
  if (note.collapsed && !stacked) {
    return (
      <div
        className={cn(
          "absolute flex items-center gap-2 rounded-full px-3 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.3)] ring-1 ring-black/10 cursor-grab active:cursor-grabbing select-none transition-all duration-200 hover:scale-105",
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
        <span className="max-w-[140px] sm:max-w-[180px] truncate text-xs font-semibold">
          {note.body.trim() || note.checkItems?.[0]?.text || dict.writePlaceholder}
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
        "relative rounded-md p-3.5 pt-4 transition-all duration-200 select-none group flex flex-col",
        "shadow-[0_14px_32px_rgba(0,0,0,0.25),0_2px_8px_rgba(0,0,0,0.12)] border border-black/5 backdrop-blur-sm",
        stacked ? "relative w-full" : "absolute w-52 sm:w-64 cursor-grab active:cursor-grabbing",
        `note-${note.tint}`,
        note.pinned && "ring-2 ring-amber-500 shadow-2xl",
      )}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* 3D Thumbtack on Top Center */}
      <Pushpin tint={note.tint} />

      {/* Header Controls */}
      <header className="mb-2 flex items-center justify-between gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
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
              className="relative flex size-4.5 items-center justify-center cursor-pointer"
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

        {/* Action Controls */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title="Tùy chỉnh font & opacity"
            onClick={() => setShowOptions(!showOptions)}
            className="flex size-5 items-center justify-center rounded opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <MoreHorizontal className="size-3.5" />
          </button>
          <button
            type="button"
            title={dict.pin}
            onClick={() => toggleNotePin(note.id)}
            className={cn(
              "flex size-5 items-center justify-center rounded transition-opacity cursor-pointer",
              note.pinned ? "text-amber-700 opacity-100 font-bold" : "opacity-40 hover:opacity-100",
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

      {/* Note Customization Drawer */}
      {showOptions && (
        <div className="no-drag mb-2 flex flex-col gap-1.5 rounded-lg bg-black/10 p-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[10px] uppercase opacity-70">Độ mờ (Opacity)</span>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={note.opacity ?? 1}
              onChange={(e) => updateNote(note.id, { opacity: parseFloat(e.target.value) })}
              className="w-24 h-1 bg-black/20 rounded cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold text-[10px] uppercase opacity-70">Phông chữ</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => updateNote(note.id, { fontFamily: "sans" })}
                className={cn("px-1.5 py-0.5 rounded text-[10px]", note.fontFamily === "sans" ? "bg-black/20 font-bold" : "opacity-60")}
              >
                Sans
              </button>
              <button
                type="button"
                onClick={() => updateNote(note.id, { fontFamily: "handwriting" })}
                className={cn("px-1.5 py-0.5 rounded text-[10px] font-handwriting", note.fontFamily === "handwriting" ? "bg-black/20 font-bold" : "opacity-60")}
              >
                Script
              </button>
              <button
                type="button"
                onClick={() => updateNote(note.id, { fontFamily: "mono" })}
                className={cn("px-1.5 py-0.5 rounded text-[10px] font-mono", note.fontFamily === "mono" ? "bg-black/20 font-bold" : "opacity-60")}
              >
                Mono
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Textarea */}
      <textarea
        value={note.body}
        onChange={(e) => updateNote(note.id, { body: e.target.value })}
        onFocus={() => bringNote(note.id)}
        placeholder={dict.writePlaceholder}
        rows={note.checkItems?.length ? 2 : 4}
        suppressHydrationWarning
        className={cn(
          "w-full resize-none bg-transparent text-[13px] sm:text-sm font-medium leading-relaxed text-inherit outline-none placeholder:opacity-40 select-text",
          note.fontFamily === "handwriting" && "font-handwriting text-base",
          note.fontFamily === "mono" && "font-mono text-xs",
        )}
      />

      {/* Checklist / Todo Items */}
      {note.checkItems && note.checkItems.length > 0 && (
        <div className="no-drag mt-1.5 space-y-1 border-t border-black/10 pt-1.5">
          {note.checkItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-1 text-xs">
              <button
                type="button"
                onClick={() => toggleCheckItem(item.id)}
                className="flex items-center gap-1.5 text-left cursor-pointer flex-1"
              >
                {item.done ? (
                  <CheckSquare className="size-3.5 text-green-700 shrink-0" />
                ) : (
                  <Square className="size-3.5 opacity-50 shrink-0" />
                )}
                <span className={cn("leading-tight", item.done && "line-through opacity-50")}>
                  {item.text}
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeCheckItem(item.id)}
                className="opacity-30 hover:opacity-100 text-red-600 px-1 cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Checkbox Item Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addCheckItem();
        }}
        className="no-drag mt-2 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
      >
        <input
          type="text"
          value={newCheckText}
          onChange={(e) => setNewCheckText(e.target.value)}
          placeholder="+ Thêm mục việc (todo)..."
          className="flex-1 bg-black/5 px-2 py-1 rounded text-xs text-inherit outline-none placeholder:opacity-40"
        />
        {newCheckText.trim() && (
          <button type="submit" className="p-1 rounded bg-black/10 hover:bg-black/20 cursor-pointer">
            <Plus className="size-3" />
          </button>
        )}
      </form>
    </article>
  );
}
