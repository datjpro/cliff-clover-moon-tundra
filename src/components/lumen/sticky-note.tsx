import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Download,
  MoreHorizontal,
  Pin,
  Plus,
  RotateCcw,
  RotateCw,
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
  const drag = useRef<{
    dx: number;
    dy: number;
    parentLeft: number;
    parentTop: number;
    parentWidth: number;
    parentHeight: number;
  } | null>(null);
  const rotateDrag = useRef<{ startAngle: number; initRot: number; centerX: number; centerY: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const colorPickerRef = useRef<HTMLDivElement | null>(null);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newCheckText, setNewCheckText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // Close menus when clicking outside (using click event so button clicks inside menu finish first)
  useEffect(() => {
    if (!menuOpen && !colorPickerOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (menuOpen && menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
      if (colorPickerOpen && colorPickerRef.current && !colorPickerRef.current.contains(target)) {
        setColorPickerOpen(false);
      }
    };
    const timer = setTimeout(() => {
      window.addEventListener("click", handleOutsideClick);
    }, 10);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [menuOpen, colorPickerOpen]);

  // High-Performance Position Drag Handlers (Cached Parent Bounds, Zero Layout Reflow)
  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (stacked || note.pinned) return;
    if ((e.target as HTMLElement).closest("textarea,input,button,.no-drag")) return;
    bringNote(note.id);
    sounds.playPop(540);
    const parent = ((e.currentTarget.parentElement as HTMLElement) || document.body).getBoundingClientRect();
    drag.current = {
      parentLeft: parent.left,
      parentTop: parent.top,
      parentWidth: parent.width || window.innerWidth,
      parentHeight: parent.height || window.innerHeight,
      dx: ((e.clientX - parent.left) / (parent.width || window.innerWidth)) * 100 - note.x,
      dy: ((e.clientY - parent.top) / (parent.height || window.innerHeight)) * 100 - note.y,
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!drag.current) return;
    const { parentLeft, parentTop, parentWidth, parentHeight, dx, dy } = drag.current;
    const maxX = parentWidth < 640 ? 48 : 90;
    const maxY = parentHeight < 700 ? 58 : 88;
    const x = Math.max(1, Math.min(maxX, ((e.clientX - parentLeft) / parentWidth) * 100 - dx));
    const y = Math.max(2, Math.min(maxY, ((e.clientY - parentTop) / parentHeight) * 100 - dy));
    updateNote(note.id, { x, y });
  };

  const onPointerUp = () => {
    drag.current = null;
    setIsDragging(false);
  };

  // High-Performance Interactive Rotation Drag Handlers (Direct Angle Tracking)
  const onRotatePointerDown = (e: PointerEvent<HTMLElement>) => {
    e.stopPropagation();
    const targetEl = e.currentTarget.closest("article") as HTMLElement;
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    rotateDrag.current = {
      startAngle,
      initRot: note.rot || 0,
      centerX,
      centerY,
    };
    setIsRotating(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onRotatePointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!rotateDrag.current) return;
    const currentAngle =
      Math.atan2(
        e.clientY - rotateDrag.current.centerY,
        e.clientX - rotateDrag.current.centerX,
      ) *
      (180 / Math.PI);
    const deltaAngle = currentAngle - rotateDrag.current.startAngle;
    let newRot = Math.round((rotateDrag.current.initRot + deltaAngle) * 10) / 10;
    newRot = Math.max(-60, Math.min(60, newRot));
    updateNote(note.id, { rot: newRot });
  };

  const onRotatePointerUp = () => {
    rotateDrag.current = null;
    setIsRotating(false);
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
    bringNote(note.id);
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

  const isTransformActive = isDragging || isRotating;

  const isElevated = menuOpen || colorPickerOpen || showDeleteConfirm || showOptions;

  const style = stacked
    ? undefined
    : {
        left: `${note.x}%`,
        top: `${note.y}%`,
        transform: note.collapsed ? "none" : `rotate(${note.rot}deg)`,
        zIndex: (note.pinned ? 90 : 10) + note.z + (isElevated ? 250 : 0),
        opacity: note.opacity ?? 1,
        transition: isTransformActive ? "none" : undefined,
      };

  // Minimized Capsule Pill Mode
  if (note.collapsed && !stacked) {
    return (
      <div
        className={cn(
          "absolute flex items-center gap-2 rounded-full px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-white/10 select-none bg-[#1D2029]/95 text-white backdrop-blur-md touch-none",
          isDragging
            ? "!transition-none cursor-grabbing ring-2 ring-[#F5A623] scale-105"
            : "transition-transform duration-140 cursor-grab hover:scale-105",
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
        "relative rounded-2xl select-none flex flex-col overflow-visible group touch-none",
        "shadow-[0_1px_2px_rgba(0,0,0,0.08),0_6px_20px_rgba(0,0,0,0.16)] border border-black/10",
        isTransformActive
          ? "!transition-none shadow-[0_6px_14px_rgba(0,0,0,0.15),0_20px_45px_rgba(0,0,0,0.3)] ring-2 ring-[#F5A623] cursor-grabbing will-change-transform scale-[1.02]"
          : "transition-shadow transition-colors duration-150",
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
      <header className="h-8.5 px-3 flex items-center justify-between bg-[#1D2029]/95 text-white backdrop-blur-md border-b border-white/5 shrink-0 select-none rounded-t-2xl">
        {/* Color Dot Button (Opens 4-color popover) */}
        <div className="relative no-drag" ref={colorPickerRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              bringNote(note.id);
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
            <div className="absolute left-0 top-8 z-50 flex items-center gap-1.5 p-1.5 rounded-xl bg-[#262A35] border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-120">
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

        {/* Right Header Actions: Pin + Direct Trash (Delete) + Kebab (…) */}
        <div className="flex items-center gap-0.5 no-drag">
          {/* Pin Button */}
          <button
            type="button"
            title={note.pinned ? "Bỏ ghim" : "Ghim lên trên"}
            onClick={(e) => {
              e.stopPropagation();
              bringNote(note.id);
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

          {/* Direct Delete Note Button */}
          <button
            type="button"
            title="Xóa ghi chú này"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
            className="flex size-6 items-center justify-center rounded-md text-[#8B90A0] hover:text-[#EF4444] hover:bg-red-500/15 transition-colors cursor-pointer"
          >
            <Trash2 className="size-3" />
          </button>

          {/* Kebab Menu Button */}
          <div className="relative no-drag" ref={menuRef}>
            <button
              type="button"
              title="Tùy chọn khác"
              onClick={(e) => {
                e.stopPropagation();
                bringNote(note.id);
                setMenuOpen(!menuOpen);
                setColorPickerOpen(false);
              }}
              className="flex size-6 items-center justify-center rounded-md text-[#8B90A0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="size-3.5" />
            </button>

            {/* Kebab Popover Menu */}
            {menuOpen && (
              <div
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 z-50 w-48 flex flex-col p-1 rounded-xl bg-[#262A35] border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl text-xs animate-in fade-in zoom-in-95 duration-120 font-medium"
              >
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
                  <RotateCw className="size-3.5 text-[#8B90A0]" />
                  <span>Độ xoay & Phông chữ</span>
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

      {/* Full-Card Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="interactive-el no-drag absolute inset-0 z-50 rounded-2xl bg-[#1D2029]/98 text-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.85)] border border-white/15 backdrop-blur-2xl flex flex-col justify-between animate-in fade-in zoom-in-95 duration-150 select-none pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => {
            e.stopPropagation();
            bringNote(note.id);
          }}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#F5A623] uppercase tracking-wider">
                <Trash2 className="size-3.5 text-[#EF4444]" />
                Xác nhận xóa
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="size-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
                title="Hủy xóa"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <p className="text-xs text-[#F4F5F7] font-medium leading-snug">
              Bạn có muốn lưu ghi chú này thành file văn bản trước khi xóa?
            </p>
            <p className="text-[10px] text-[#8B90A0] leading-tight">
              Hành động xóa không thể hoàn tác nếu chưa lưu.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleExportTxtAndDelete();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>Lưu file .txt & Xóa</span>
            </button>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNote(note.id);
                }}
                className="flex-1 py-1.5 px-2 rounded-xl bg-[#EF4444] hover:bg-red-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
              >
                Xóa luôn
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#F4F5F7] text-xs font-medium transition-colors cursor-pointer text-center"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Body Area (Pastel Background + #23262F Text) */}
      <div className="p-3.5 flex flex-col text-[#23262F] relative rounded-b-2xl">
        {/* Note Customization Drawer (Rotation, Opacity, Font) */}
        {showOptions && !showDeleteConfirm && (
          <div className="no-drag mb-2 flex flex-col gap-2 rounded-xl bg-black/5 p-2.5 text-xs border border-black/5">
            {/* Rotation Control */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[10px] uppercase opacity-75">Góc nghiêng (Xoay)</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={note.rot || 0}
                    onChange={(e) => updateNote(note.id, { rot: parseFloat(e.target.value) })}
                    className="w-20 h-1 bg-black/20 rounded cursor-pointer accent-[#F5A623]"
                  />
                  <span className="font-mono text-[10px] w-7 text-right tabular-nums">
                    {Math.round(note.rot || 0)}°
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 pt-0.5">
                {[-5, 0, 5].map((ang) => (
                  <button
                    key={ang}
                    type="button"
                    onClick={() => updateNote(note.id, { rot: ang })}
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-colors",
                      Math.round(note.rot || 0) === ang ? "bg-black/20 font-bold" : "opacity-60 hover:opacity-100",
                    )}
                  >
                    {ang > 0 ? `+${ang}°` : `${ang}°`}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => updateNote(note.id, { rot: Math.round((Math.random() - 0.5) * 8 * 10) / 10 })}
                  className="px-1.5 py-0.5 rounded text-[9px] opacity-60 hover:opacity-100 cursor-pointer"
                  title="Góc ngẫu nhiên tự nhiên"
                >
                  🎲 Ngẫu nhiên
                </button>
              </div>
            </div>

            {/* Opacity Control */}
            <div className="flex items-center justify-between pt-1 border-t border-black/5">
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

            {/* Font Control */}
            <div className="flex items-center justify-between pt-1 border-t border-black/5">
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

        {/* Real-time Angle Feedback Bubble during Rotation */}
        {isRotating && (
          <div className="no-drag absolute top-2 right-2 z-30 flex items-center gap-1 rounded-full bg-[#1D2029] text-[#F5A623] px-2 py-0.5 text-[11px] font-mono font-bold shadow-xl border border-[#F5A623]/40 animate-in zoom-in-95 pointer-events-none">
            <span>{Math.round(note.rot || 0)}°</span>
          </div>
        )}

        {/* Subtle Interactive Corner Rotate Handle (Bottom-Right) */}
        {!stacked && !note.pinned && (
          <div
            onPointerDown={onRotatePointerDown}
            onPointerMove={onRotatePointerMove}
            onPointerUp={onRotatePointerUp}
            onPointerCancel={onRotatePointerUp}
            className={cn(
              "no-drag absolute bottom-1.5 right-1.5 size-6 flex items-center justify-center rounded-full transition-all cursor-grab active:cursor-grabbing z-20 touch-none select-none",
              isRotating
                ? "bg-[#F5A623] text-[#14161D] shadow-lg scale-110 opacity-100 ring-2 ring-[#1D2029]"
                : "bg-black/10 hover:bg-black/25 text-[#23262F]/70 hover:text-[#23262F] opacity-0 group-hover:opacity-100 hover:scale-110",
            )}
            title="Kéo chuột để xoay góc nghiêng ghi chú"
          >
            <RotateCw className="size-3.5" />
          </div>
        )}
      </div>
    </article>
  );
}
