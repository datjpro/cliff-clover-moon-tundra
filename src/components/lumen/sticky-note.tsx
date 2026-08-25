import { useRef, useState, type PointerEvent } from "react";
import {
  Check,
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
import { useLumen } from "@/lib/store";
import type { Note, NoteTint } from "@/lib/types";
import { cn, uid } from "@/lib/utils";

type Props = {
  note: Note;
  stacked?: boolean;
};

const NOTE_PALETTE: { id: NoteTint; name: string; bg: string; dot: string }[] = [
  { id: "cream", name: "Hổ phách (Amber)", bg: "#FCEFD3", dot: "#F5A623" },
  { id: "sage", name: "Bạc hà (Mint)", bg: "#E4F5EA", dot: "#3FAE6C" },
  { id: "blush", name: "Hoa hồng (Rose)", bg: "#F8E1E7", dot: "#E8779A" },
  { id: "mist", name: "Cáo lửa (Fox)", bg: "#F3DCC7", dot: "#C9793B" },
];

export function StickyNote({ note, stacked }: Props) {
  const lang = useLumen((s) => s.lang);
  const dict = DICTIONARY[lang];
  const updateNote = useLumen((s) => s.updateNote);
  const removeNote = useLumen((s) => s.removeNote);
  const bringNote = useLumen((s) => s.bringNote);
  const toggleNoteCollapse = useLumen((s) => s.toggleNoteCollapse);
  const toggleNotePin = useLumen((s) => s.toggleNotePin);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newCheckText, setNewCheckText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

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
    setIsDragging(true);
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
    setIsDragging(false);
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
    setMenuOpen(false);
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
    a.download = `lumen-note-${new Date().toISOString().slice(0, 10)}-${note.id.slice(0, 5)}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    removeNote(note.id);
  };

  const currentPalette = NOTE_PALETTE.find((p) => p.id === note.tint) || NOTE_PALETTE[0];

  const style = stacked
    ? undefined
    : {
        left: `${note.x}%`,
        top: `${note.y}%`,
        transform: note.collapsed ? "none" : `rotate(${note.rot}deg)`,
        zIndex: (note.pinned ? 90 : 10) + note.z,
        opacity: note.opacity ?? 1,
      };

  // Minimized Capsule Pill Mode
  if (note.collapsed && !stacked) {
    return (
      <div
        className={cn(
          "absolute flex items-center gap-2 rounded-full px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-white/10 cursor-grab active:cursor-grabbing select-none transition-all duration-160 hover:scale-105 bg-[#1D2029]/95 text-white backdrop-blur-md",
        )}
        style={style}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => toggleNoteCollapse(note.id)}
      >
        <span className="size-2 rounded-full shadow-xs" style={{ backgroundColor: currentPalette.dot }} />
        <span className="max-w-[150px] sm:max-w-[200px] truncate text-xs font-medium text-[#F4F5F7]">
          {note.body.trim() || note.checkItems?.[0]?.text || "Ghi chú đã thu gọn"}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleNoteCollapse(note.id);
          }}
          title="Mở rộng ghi chú"
          className="flex size-5 items-center justify-center rounded-full hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
        >
          <ChevronDown className="size-3" />
        </button>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "relative rounded-2xl transition-all duration-180 select-none flex flex-col overflow-hidden",
        "shadow-[0_1px_2px_rgba(0,0,0,0.08),0_6px_20px_rgba(0,0,0,0.16)] border border-black/10",
        isDragging && "shadow-[0_4px_8px_rgba(0,0,0,0.12),0_16px_40px_rgba(0,0,0,0.28)] scale-[1.02]",
        stacked ? "relative w-full" : "absolute w-64 sm:w-72 cursor-grab active:cursor-grabbing",
        `note-${note.tint}`,
        note.pinned && "ring-2 ring-[#F5A623] shadow-xl",
      )}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Dark Integrated Header Bar (~34px height) */}
      <header className="h-8.5 px-3 flex items-center justify-between bg-[#1D2029]/95 text-white backdrop-blur-md border-b border-white/5 shrink-0 select-none">
        {/* Color Dot Button (Opens 4-color popover) */}
        <div className="relative no-drag">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setColorPickerOpen(!colorPickerOpen);
              setMenuOpen(false);
            }}
            title="Đổi màu ghi chú"
            className="flex items-center gap-1.5 p-1 rounded-md hover:bg-white/10 cursor-pointer transition-colors"
          >
            <span
              className="size-3 rounded-full shadow-xs border border-white/20 transition-transform hover:scale-110"
              style={{ backgroundColor: currentPalette.dot }}
            />
            <ChevronDown className="size-2.5 text-[#8B90A0]" />
          </button>

          {/* Color Picker Popover */}
          {colorPickerOpen && (
            <div className="absolute left-0 top-7.5 z-30 flex items-center gap-1.5 p-1.5 rounded-xl bg-[#262A35] border border-white/10 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-120">
              {NOTE_PALETTE.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playPop(620);
                    updateNote(note.id, { tint: p.id });
                    setColorPickerOpen(false);
                  }}
                  title={p.name}
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full transition-transform hover:scale-110 cursor-pointer",
                    note.tint === p.id && "ring-1.5 ring-white shadow-xs",
                  )}
                  style={{ backgroundColor: p.dot }}
                >
                  {note.tint === p.id && <Check className="size-2.5 text-white" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Header Actions: Pin + Kebab (…) */}
        <div className="flex items-center gap-0.5 no-drag">
          {/* Pin Button */}
          <button
            type="button"
            title={note.pinned ? "Bỏ ghim" : "Ghim lên trên"}
            onClick={(e) => {
              e.stopPropagation();
              toggleNotePin(note.id);
            }}
            className={cn(
              "flex size-6 items-center justify-center rounded-md transition-colors cursor-pointer",
              note.pinned
                ? "bg-[#F5A623]/20 text-[#F5A623]"
                : "text-[#8B90A0] hover:text-white hover:bg-white/10",
            )}
          >
            <Pin className={cn("size-3", note.pinned && "fill-current")} />
          </button>

          {/* Kebab Menu Button */}
          <div className="relative">
            <button
              type="button"
              title="Tùy chọn khác"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
                setColorPickerOpen(false);
              }}
              className="flex size-6 items-center justify-center rounded-md text-[#8B90A0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="size-3.5" />
            </button>

            {/* Kebab Popover Menu */}
            {menuOpen && (
              <div className="absolute right-0 top-7.5 z-30 w-44 flex flex-col p-1 rounded-xl bg-[#262A35] border border-white/10 shadow-2xl backdrop-blur-md text-xs animate-in fade-in zoom-in-95 duration-120 font-medium">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNoteCollapse(note.id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#F4F5F7] hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <ChevronUp className="size-3.5 text-[#8B90A0]" />
                  <span>Thu gọn ghi chú</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#F4F5F7] hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <span className="text-xs">⚙️</span>
                  <span>Độ mờ & Phông chữ</span>
                </button>
                <div className="h-px bg-white/5 my-0.5" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick();
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#EF4444] hover:bg-red-500/15 transition-colors text-left cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>Xóa ghi chú</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Note Body Area (Pastel Background + #23262F Text) */}
      <div className="p-3.5 flex flex-col text-[#23262F]">
        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="no-drag mb-2 flex flex-col gap-2 rounded-xl bg-[#1D2029] text-white p-2.5 text-xs shadow-2xl border border-white/10 animate-in zoom-in-95 duration-120">
            <p className="font-semibold text-[#F5A623] leading-tight">
              Xác nhận xóa ghi chú này?
            </p>
            <p className="text-[11px] text-[#8B90A0]">
              Lưu nội dung thành file .txt trước khi xóa?
            </p>
            <div className="flex flex-col gap-1 pt-1">
              <button
                type="button"
                onClick={handleExportTxtAndDelete}
                className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] font-bold text-[11px] cursor-pointer transition-colors"
              >
                <Download className="size-3" />
                <span>Lưu .txt & Xóa</span>
              </button>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => removeNote(note.id)}
                  className="flex-1 py-1 px-2 rounded-lg bg-[#EF4444]/80 hover:bg-[#EF4444] text-white text-[11px] font-semibold cursor-pointer transition-colors"
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

        {/* Note Customization Drawer (Opacity & Font) */}
        {showOptions && !showDeleteConfirm && (
          <div className="no-drag mb-2 flex flex-col gap-1.5 rounded-xl bg-black/5 p-2 text-xs border border-black/5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[10px] uppercase opacity-75">Độ trong suốt</span>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.05"
                value={note.opacity ?? 1}
                onChange={(e) => updateNote(note.id, { opacity: parseFloat(e.target.value) })}
                className="w-20 h-1 bg-black/20 rounded cursor-pointer accent-[#F5A623]"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-[10px] uppercase opacity-75">Phông chữ</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => updateNote(note.id, { fontFamily: "sans" })}
                  className={cn("px-1.5 py-0.5 rounded text-[10px] cursor-pointer", note.fontFamily === "sans" ? "bg-black/15 font-bold" : "opacity-60 hover:opacity-100")}
                >
                  Sans
                </button>
                <button
                  type="button"
                  onClick={() => updateNote(note.id, { fontFamily: "handwriting" })}
                  className={cn("px-1.5 py-0.5 rounded text-[10px] font-handwriting cursor-pointer", note.fontFamily === "handwriting" ? "bg-black/15 font-bold" : "opacity-60 hover:opacity-100")}
                >
                  Script
                </button>
                <button
                  type="button"
                  onClick={() => updateNote(note.id, { fontFamily: "mono" })}
                  className={cn("px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer", note.fontFamily === "mono" ? "bg-black/15 font-bold" : "opacity-60 hover:opacity-100")}
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
          placeholder="Viết ghi chú của bạn..."
          rows={note.checkItems?.length ? 2 : 4}
          suppressHydrationWarning
          className={cn(
            "w-full resize-none bg-transparent text-[13px] font-normal leading-relaxed text-[#23262F] outline-none placeholder:text-[#23262F]/40 select-text note-scrollbar",
            note.fontFamily === "handwriting" && "font-handwriting text-base leading-snug",
            note.fontFamily === "mono" && "font-mono text-xs leading-normal",
          )}
        />

        {/* Checklist / Todo Items */}
        {note.checkItems && note.checkItems.length > 0 && (
          <div className="no-drag mt-2 space-y-1 border-t border-black/10 pt-2">
            {note.checkItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-1 text-xs group/todo">
                <button
                  type="button"
                  onClick={() => toggleCheckItem(item.id)}
                  className="flex items-center gap-1.5 text-left cursor-pointer flex-1 min-w-0"
                >
                  {item.done ? (
                    <CheckSquare className="size-3.5 text-[#3FAE6C] shrink-0" />
                  ) : (
                    <Square className="size-3.5 text-[#23262F]/50 shrink-0" />
                  )}
                  <span className={cn("leading-tight truncate text-xs text-[#23262F]", item.done && "line-through opacity-45")}>
                    {item.text}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => removeCheckItem(item.id)}
                  className="opacity-0 group-hover/todo:opacity-100 text-[#EF4444] px-1 cursor-pointer transition-opacity text-xs"
                  title="Xóa mục việc"
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
            className="flex-1 bg-black/5 px-2.5 py-1 rounded-lg text-xs text-[#23262F] outline-none placeholder:text-[#23262F]/40 focus:bg-black/10 transition-colors"
          />
          {newCheckText.trim() && (
            <button
              type="submit"
              className="p-1 rounded-lg bg-black/10 hover:bg-black/20 text-[#23262F] cursor-pointer transition-colors"
            >
              <Plus className="size-3" />
            </button>
          )}
        </form>
      </div>
    </article>
  );
}
