import { useRef, useState, type PointerEvent } from "react";
import {
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Download,
  MoreHorizontal,
  Pin,
  Plus,
  Square,
  Trash2,
  X,
} from "lucide-react";
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
  const pinColors: Record<NoteTint, { pin: string; head: string }> = {
    cream: { pin: "#d97706", head: "#f59e0b" },
    mist: { pin: "#0284c7", head: "#38bdf8" },
    sage: { pin: "#16a34a", head: "#4ade80" },
    blush: { pin: "#e11d48", head: "#fb7185" },
    neon: { pin: "#0891b2", head: "#22d3ee" },
    dark: { pin: "#52525b", head: "#a1a1aa" },
    glass: { pin: "#475569", head: "#94a3b8" },
  };
  const color = pinColors[tint] || pinColors.cream;

  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-md">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <line x1="12" y1="12" x2="12" y2="21" stroke="#3f3f46" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="12" cy="8" rx="6" ry="6" fill={color.pin} />
        <ellipse cx="12" cy="7.5" rx="4.5" ry="4.5" fill={color.head} />
        <ellipse cx="10" cy="5.8" rx="1.8" ry="1.2" fill="#ffffff" opacity="0.8" />
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const handleDeleteClick = () => {
    const hasContent = note.body.trim().length > 0 || (note.checkItems && note.checkItems.length > 0);
    if (!hasContent) {
      removeNote(note.id);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleExportTxtAndDelete = () => {
    let content = `=== GHI CHÚ LUMEN ===\nNgày tạo: ${new Date(note.createdAt).toLocaleString()}\n\n`;
    if (note.body.trim()) {
      content += `Nội dung:\n${note.body.trim()}\n\n`;
    }
    if (note.checkItems && note.checkItems.length > 0) {
      content += "Danh sách công việc (Checklist):\n";
      note.checkItems.forEach((item) => {
        content += `${item.done ? "[x]" : "[ ]"} ${item.text}\n`;
      });
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ghichu-${new Date().toISOString().slice(0, 10)}-${note.id.slice(0, 5)}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    removeNote(note.id);
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
          "absolute flex items-center gap-2 rounded-full px-3 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.1)] ring-1 ring-black/10 cursor-grab active:cursor-grabbing select-none transition-all duration-200 hover:scale-105 backdrop-blur-md",
          `note-${note.tint}`,
        )}
        style={style}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => toggleNoteCollapse(note.id)}
      >
        <span className="size-2 rounded-full bg-black/40" />
        <span className="max-w-[140px] sm:max-w-[180px] truncate text-xs font-semibold tracking-tight">
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

  return (
    <article
      className={cn(
        "relative rounded-xl p-3.5 pt-3.5 transition-all duration-200 select-none group flex flex-col",
        "shadow-[0_12px_28px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.24),0_4px_10px_rgba(0,0,0,0.08)] border border-black/10 backdrop-blur-md",
        stacked ? "relative w-full" : "absolute w-56 sm:w-64 cursor-grab active:cursor-grabbing",
        `note-${note.tint}`,
        note.pinned && "ring-2 ring-amber-500 shadow-2xl",
      )}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* 3D Pushpin on Top Center */}
      <Pushpin tint={note.tint} />

      {/* Floating Hover Toolbar */}
      <header className="mb-2 flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Color Tints */}
        <div className="flex items-center gap-1 bg-black/10 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
          {NOTE_TINTS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-label={t.label}
              onClick={() => {
                sounds.playPop(620);
                updateNote(note.id, { tint: t.id });
              }}
              className="relative flex size-3.5 items-center justify-center cursor-pointer"
            >
              <span
                className={cn(
                  "size-2 rounded-full shadow-xs transition-transform hover:scale-125 border border-black/20",
                  `note-${t.id}`,
                  note.tint === t.id ? "ring-1.5 ring-black/60 scale-110" : "opacity-75",
                )}
              />
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-0.5 bg-black/10 px-1 py-0.5 rounded-lg backdrop-blur-sm">
          <button
            type="button"
            title="Tùy chỉnh độ mờ & phông chữ"
            onClick={() => setShowOptions(!showOptions)}
            className="flex size-5 items-center justify-center rounded hover:bg-black/15 transition-colors cursor-pointer text-inherit opacity-70 hover:opacity-100"
          >
            <MoreHorizontal className="size-3" />
          </button>
          <button
            type="button"
            title={note.pinned ? "Bỏ ghim" : dict.pin}
            onClick={() => toggleNotePin(note.id)}
            className={cn(
              "flex size-5 items-center justify-center rounded transition-colors cursor-pointer text-inherit",
              note.pinned ? "text-amber-800 opacity-100 bg-amber-500/20" : "opacity-70 hover:opacity-100 hover:bg-black/15",
            )}
          >
            <Pin className={cn("size-3", note.pinned && "fill-current")} />
          </button>
          <button
            type="button"
            title={dict.minimize}
            onClick={() => toggleNoteCollapse(note.id)}
            className="flex size-5 items-center justify-center rounded hover:bg-black/15 transition-colors cursor-pointer text-inherit opacity-70 hover:opacity-100"
          >
            <ChevronUp className="size-3" />
          </button>
          <button
            type="button"
            title={dict.delete}
            onClick={handleDeleteClick}
            className="flex size-5 items-center justify-center rounded hover:bg-red-500/20 hover:text-red-700 transition-colors cursor-pointer text-inherit opacity-70 hover:opacity-100"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </header>

      {/* Delete Confirmation Card with .txt Export Option */}
      {showDeleteConfirm && (
        <div className="no-drag mb-2 flex flex-col gap-2 rounded-xl bg-slate-900/95 text-slate-100 p-2.5 text-xs shadow-2xl border border-white/10 backdrop-blur-xl animate-in zoom-in-95 duration-150">
          <p className="font-bold text-amber-400 leading-tight">
            Xác nhận xóa ghi chú?
          </p>
          <p className="text-[11px] text-slate-300">
            Lưu nội dung thành file .txt trước khi xóa?
          </p>
          <div className="flex flex-col gap-1 pt-1">
            <button
              type="button"
              onClick={handleExportTxtAndDelete}
              className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer transition-colors"
            >
              <Download className="size-3" />
              <span>Lưu .txt & Xóa</span>
            </button>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => removeNote(note.id)}
                className="flex-1 py-1 px-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-[11px] font-semibold cursor-pointer transition-colors"
              >
                Xóa luôn
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-1 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] cursor-pointer transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Customization Drawer */}
      {showOptions && !showDeleteConfirm && (
        <div className="no-drag mb-2 flex flex-col gap-1.5 rounded-lg bg-black/10 p-2 text-xs backdrop-blur-sm border border-black/5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[10px] uppercase opacity-75">Độ trong suốt</span>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={note.opacity ?? 1}
              onChange={(e) => updateNote(note.id, { opacity: parseFloat(e.target.value) })}
              className="w-20 h-1 bg-black/20 rounded cursor-pointer accent-amber-600"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold text-[10px] uppercase opacity-75">Phông chữ</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => updateNote(note.id, { fontFamily: "sans" })}
                className={cn("px-1.5 py-0.5 rounded text-[10px] cursor-pointer", note.fontFamily === "sans" ? "bg-black/20 font-bold" : "opacity-60 hover:opacity-100")}
              >
                Sans
              </button>
              <button
                type="button"
                onClick={() => updateNote(note.id, { fontFamily: "handwriting" })}
                className={cn("px-1.5 py-0.5 rounded text-[10px] font-handwriting cursor-pointer", note.fontFamily === "handwriting" ? "bg-black/20 font-bold" : "opacity-60 hover:opacity-100")}
              >
                Script
              </button>
              <button
                type="button"
                onClick={() => updateNote(note.id, { fontFamily: "mono" })}
                className={cn("px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer", note.fontFamily === "mono" ? "bg-black/20 font-bold" : "opacity-60 hover:opacity-100")}
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
          "w-full resize-none bg-transparent text-[13px] sm:text-sm font-medium leading-relaxed text-inherit outline-none placeholder:opacity-40 select-text note-scrollbar",
          note.fontFamily === "handwriting" && "font-handwriting text-base leading-snug",
          note.fontFamily === "mono" && "font-mono text-xs leading-normal",
        )}
      />

      {/* Checklist / Todo Items */}
      {note.checkItems && note.checkItems.length > 0 && (
        <div className="no-drag mt-1.5 space-y-1 border-t border-black/10 pt-1.5">
          {note.checkItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-1 text-xs group/todo">
              <button
                type="button"
                onClick={() => toggleCheckItem(item.id)}
                className="flex items-center gap-1.5 text-left cursor-pointer flex-1 min-w-0"
              >
                {item.done ? (
                  <CheckSquare className="size-3.5 text-emerald-700 shrink-0" />
                ) : (
                  <Square className="size-3.5 opacity-60 shrink-0" />
                )}
                <span className={cn("leading-tight truncate text-xs", item.done && "line-through opacity-50")}>
                  {item.text}
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeCheckItem(item.id)}
                className="opacity-0 group-hover/todo:opacity-100 hover:text-red-700 px-1 cursor-pointer transition-opacity text-xs"
                title="Xóa mục"
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
          className="flex-1 bg-black/5 px-2 py-1 rounded-md text-xs text-inherit outline-none placeholder:opacity-40 focus:bg-black/10 transition-colors"
        />
        {newCheckText.trim() && (
          <button
            type="submit"
            className="p-1 rounded-md bg-black/10 hover:bg-black/20 cursor-pointer transition-colors"
          >
            <Plus className="size-3" />
          </button>
        )}
      </form>
    </article>
  );
}
