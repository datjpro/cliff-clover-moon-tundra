import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  ALargeSmall,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Folder,
  FolderPlus,
  Lock,
  Minus,
  MoreHorizontal,
  Pin,
  Plus,
  RotateCcw,
  RotateCw,
  Scaling,
  Square,
  Trash2,
  Type,
  Unlock,
  X,
} from "lucide-react";
import { sounds } from "@/lib/audio";
import { focusDesktopWindow } from "@/lib/desktop-bridge";
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
  const toggleNoteLock = useLumen((s) => s.toggleNoteLock);
  const highlightNoteId = useLumen((s) => s.highlightNoteId);
  const createEventFromNote = useLumen((s) => s.createEventFromNote);
  const drag = useRef<{
    dx: number;
    dy: number;
    parentLeft: number;
    parentTop: number;
    parentWidth: number;
    parentHeight: number;
    cardWidth: number;
    cardHeight: number;
  } | null>(null);
  const rotateDrag = useRef<{
    lastAngle: number;
    accumulatedRot: number;
    centerX: number;
    centerY: number;
    rafId: number | null;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const colorPickerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const allNotes = useLumen((s) => s.notes);
  const existingClusters = Array.from(
    new Set(allNotes.map((n) => n.cluster).filter((c): c is string => Boolean(c))),
  );

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [schedulePickerOpen, setSchedulePickerOpen] = useState(false);
  const [dueDateInput, setDueDateInput] = useState(note.dueDate || "");
  const [dueTimeInput, setDueTimeInput] = useState(note.dueTime || "09:00");
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clusterPickerOpen, setClusterPickerOpen] = useState(false);
  const [customClusterInput, setCustomClusterInput] = useState("");
  const [newCheckText, setNewCheckText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const resizeDrag = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Resize Handlers (Dragging bottom-left corner)
  const onResizePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    bringNote(note.id);
    const card = (e.currentTarget.closest("article") as HTMLElement) || null;
    const rect = card ? card.getBoundingClientRect() : { width: 280, height: 220 };
    resizeDrag.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
    };
    setIsResizing(true);
    sounds.playPop(560);
  };

  const onResizePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isResizing || !resizeDrag.current) return;
    const deltaX = e.clientX - resizeDrag.current.startX;
    const deltaY = e.clientY - resizeDrag.current.startY;
    const newW = Math.min(600, Math.max(220, Math.round(resizeDrag.current.startW + deltaX)));
    const newH = Math.min(800, Math.max(160, Math.round(resizeDrag.current.startH + deltaY)));
    updateNote(note.id, { width: newW, height: newH });
  };

  const onResizePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isResizing) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    resizeDrag.current = null;
    setIsResizing(false);
    sounds.playPop(620);
  };

  const onResetSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNote(note.id, { width: undefined, height: undefined });
    sounds.playChime();
  };

  const handleCopyNote = () => {
    let content = note.body.trim();
    if (note.checkItems && note.checkItems.length > 0) {
      if (content) content += "\n\n";
      content += note.checkItems.map((i) => `${i.done ? "[x]" : "[ ]"} ${i.text}`).join("\n");
    }
    if (content) {
      void navigator.clipboard.writeText(content);
      sounds.playPop(700);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
    setMenuOpen(false);
  };

  // Close menus when clicking outside (using click event so button clicks inside menu finish first)
  useEffect(() => {
    if (!menuOpen && !colorPickerOpen && !clusterPickerOpen) return;
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
      document.addEventListener("click", handleOutsideClick);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [menuOpen, colorPickerOpen, clusterPickerOpen]);

  // Teardown pending rAF animation frames on unmount
  useEffect(() => {
    return () => {
      if (rotateDrag.current?.rafId) {
        cancelAnimationFrame(rotateDrag.current.rafId);
      }
    };
  }, []);

  // High-Performance Position Drag Handlers (Attached to Header Only)
  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (stacked || note.pinned || note.locked) return;
    if ((e.target as HTMLElement).closest("button,input,textarea,form,.no-drag")) return;
    bringNote(note.id);
    sounds.playPop(540);
    const cardEl = (e.currentTarget.closest("article") || e.currentTarget) as HTMLElement;
    const parent = (cardEl.parentElement || document.body).getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();
    drag.current = {
      parentLeft: parent.left,
      parentTop: parent.top,
      parentWidth: parent.width || window.innerWidth,
      parentHeight: parent.height || window.innerHeight,
      cardWidth: cardRect.width,
      cardHeight: cardRect.height,
      dx: ((e.clientX - parent.left) / (parent.width || window.innerWidth)) * 100 - note.x,
      dy: ((e.clientY - parent.top) / (parent.height || window.innerHeight)) * 100 - note.y,
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!drag.current) return;
    const { parentLeft, parentTop, parentWidth, parentHeight, cardWidth, cardHeight, dx, dy } = drag.current;

    // Exact flush edge bounds (0% to exact right/bottom border)
    const flushMaxX = Math.max(0, ((parentWidth - cardWidth) / parentWidth) * 100);
    const flushMaxY = Math.max(0, ((parentHeight - cardHeight) / parentHeight) * 100);

    // Keep header reachable (never lost off-screen)
    const absoluteMinX = 0;
    const absoluteMinY = 0;
    const absoluteMaxX = Math.max(flushMaxX, ((parentWidth - 48) / parentWidth) * 100);
    const absoluteMaxY = Math.max(flushMaxY, ((parentHeight - 38) / parentHeight) * 100);

    let rawX = ((e.clientX - parentLeft) / parentWidth) * 100 - dx;
    let rawY = ((e.clientY - parentTop) / parentHeight) * 100 - dy;

    let x = Math.max(absoluteMinX, Math.min(absoluteMaxX, rawX));
    let y = Math.max(absoluteMinY, Math.min(absoluteMaxY, rawY));

    // Smart Magnetic Snapping (Snaps cleanly to 0% and exact Flush Right/Bottom Bezels)
    const SNAP_THRESH = 1.2;

    // Flush Left Screen Edge Snap (0%)
    if (Math.abs(x - 0) < SNAP_THRESH) {
      x = 0;
    }
    // Flush Right Screen Edge Snap (flushMaxX)
    else if (Math.abs(x - flushMaxX) < SNAP_THRESH) {
      x = flushMaxX;
    }

    // Flush Top Screen Edge Snap (0%)
    if (Math.abs(y - 0) < SNAP_THRESH) {
      y = 0;
    }
    // Flush Bottom Screen Edge Snap (flushMaxY)
    else if (Math.abs(y - flushMaxY) < SNAP_THRESH) {
      y = flushMaxY;
    }

    // Sibling Alignment Snapping (Align with other notes on canvas)
    for (const other of allNotes) {
      if (other.id === note.id || other.collapsed) continue;
      if (Math.abs(x - other.x) < SNAP_THRESH) {
        x = other.x;
        break;
      }
      if (Math.abs(y - other.y) < SNAP_THRESH) {
        y = other.y;
        break;
      }
    }

    updateNote(note.id, { x, y });
  };

  const onPointerUp = (e?: PointerEvent<HTMLElement>) => {
    if (e) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
    drag.current = null;
    setIsDragging(false);
  };

  // High-Performance Smooth Interactive Rotation Handlers (Continuous Angle Tracking & Magnetic Snap)
  const onRotatePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    bringNote(note.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const card = (e.currentTarget.closest("article") as HTMLElement) || null;
    const rect = card ? card.getBoundingClientRect() : { left: 0, top: 0, width: 280, height: 220 };
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    rotateDrag.current = {
      lastAngle: startAngle,
      accumulatedRot: note.rot || 0,
      centerX,
      centerY,
      rafId: null,
    };
    setIsRotating(true);
    sounds.playPop(560);
  };

  const onRotatePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isRotating || !rotateDrag.current) return;
    const { centerX, centerY, lastAngle, accumulatedRot } = rotateDrag.current;
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    // Calculate shortest angular difference (smoothly bridges across the ±180° atan2 discontinuity)
    let diff = currentAngle - lastAngle;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    const newAccumulated = accumulatedRot + diff;
    rotateDrag.current.lastAngle = currentAngle;
    rotateDrag.current.accumulatedRot = newAccumulated;

    // Smoothly clamp within ±60° range for natural desktop sticky note tilt
    let clampedRot = Math.max(-60, Math.min(60, newAccumulated));

    // Magnetic snap to exactly 0° when within ±1.5°
    if (Math.abs(clampedRot) < 1.5) {
      clampedRot = 0;
    }

    const finalRot = Math.round(clampedRot * 10) / 10;

    // Throttle rendering to rAF for 60/120 FPS sub-16ms budget
    if (rotateDrag.current.rafId) {
      cancelAnimationFrame(rotateDrag.current.rafId);
    }
    rotateDrag.current.rafId = requestAnimationFrame(() => {
      updateNote(note.id, { rot: finalRot });
    });
  };

  const onRotatePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isRotating) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    if (rotateDrag.current?.rafId) {
      cancelAnimationFrame(rotateDrag.current.rafId);
    }
    rotateDrag.current = null;
    setIsRotating(false);
    sounds.playPop(620);
  };

  const onResetRotation = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNote(note.id, { rot: 0 });
    sounds.playChime();
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

  const isElevated = menuOpen || colorPickerOpen || showDeleteConfirm || showOptions || clusterPickerOpen;

  const style = stacked
    ? undefined
    : {
        left: `${note.x}%`,
        top: `${note.y}%`,
        transform: `rotate(${note.rot}deg)`,
        zIndex: (note.pinned ? 90 : 10) + note.z + (isElevated ? 250 : 0),
        opacity: note.opacity ?? 1,
        width: note.width ? `${note.width}px` : undefined,
        minHeight: note.height ? `${note.height}px` : undefined,
        transition: isTransformActive || isResizing ? "none" : undefined,
      };

  const pillStyle = stacked
    ? undefined
    : {
        left: `${note.x}%`,
        top: `${note.y}%`,
        zIndex: (note.pinned ? 90 : 10) + note.z,
        opacity: note.opacity ?? 1,
        transition: isDragging ? "none" : undefined,
      };

  // Minimized Capsule Pill Mode
  if (note.collapsed && !stacked) {
    return (
      <div
        className={cn(
          "interactive-el absolute flex items-center gap-2 rounded-full px-3 py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.35)] border border-white/15 select-none bg-[#1D2029]/95 text-white backdrop-blur-md touch-none",
          isDragging
            ? "!transition-none cursor-grabbing ring-2 ring-[#F5A623] shadow-[0_12px_28px_rgba(0,0,0,0.5)] z-[100]"
            : "transition-all duration-140 cursor-grab hover:scale-105 hover:border-white/30 hover:bg-[#262A35]/95",
          note.pinned && "ring-1 ring-[#F5A623]/60",
        )}
        style={pillStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => toggleNoteCollapse(note.id)}
        title={note.pinned ? "Ghi chú đang ghim (Nhấp đúp để mở rộng)" : "Kéo để di chuyển • Nhấp đúp để mở rộng ghi chú"}
      >
        <span className="size-2 rounded-full shadow-xs shrink-0" style={{ backgroundColor: currentPalette.dot }} />
        {note.cluster && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#F5A623] font-semibold tracking-wide shrink-0">
            {note.cluster}
          </span>
        )}
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
          className="flex size-5 items-center justify-center rounded-full hover:bg-white/20 text-[#8B90A0] hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <ChevronDown className="size-3" />
        </button>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "interactive-el pointer-events-auto relative rounded-2xl flex flex-col overflow-visible group",
        "shadow-[0_1px_2px_rgba(0,0,0,0.08),0_6px_20px_rgba(0,0,0,0.16)] border border-black/10",
        isTransformActive
          ? "!transition-none shadow-[0_6px_14px_rgba(0,0,0,0.15),0_20px_45px_rgba(0,0,0,0.3)] ring-2 ring-[#F5A623] will-change-transform"
          : "transition-shadow transition-colors duration-150",
        stacked ? "relative w-full" : "absolute w-64 sm:w-72",
        `note-${note.tint}`,
        note.pinned && "ring-2 ring-[#F5A623] shadow-xl",
        highlightNoteId === note.id && "ring-4 ring-[#F5A623] shadow-[0_0_35px_rgba(245,166,35,0.75)] animate-pulse",
      )}
      style={style}
      onMouseDown={() => bringNote(note.id)}
    >
      {/* Dark Integrated Header Bar (~34px height) - acts as smooth drag handle & double click to minimize */}
      <header
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest("button,input,form,.no-drag")) return;
          e.stopPropagation();
          sounds.playPop(580);
          toggleNoteCollapse(note.id);
        }}
        className={cn(
          "relative z-30 h-8.5 px-3 flex items-center justify-between bg-[#1D2029]/95 text-white backdrop-blur-md border-b border-white/5 shrink-0 select-none touch-none rounded-t-2xl",
          note.locked ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        )}
      >
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

        {/* Center: Cluster Pill Badge, Due Date Pill & Lock Indicator */}
        <div className="flex items-center gap-1.5 min-w-0">
          {note.cluster && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                bringNote(note.id);
                setClusterPickerOpen(true);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[#F5A623] text-[10px] font-semibold border border-white/10 transition-colors cursor-pointer truncate"
              title="Nhóm / Cụm ghi chú (Click để đổi)"
            >
              <Folder className="size-2.5 shrink-0" />
              <span className="max-w-[75px] truncate">{note.cluster}</span>
            </button>
          )}

          {note.dueDate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                bringNote(note.id);
                setSchedulePickerOpen(true);
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 transition-colors cursor-pointer shrink-0"
              title={`Hạn chót: ${note.dueDate} ${note.dueTime || ""}`}
            >
              <Calendar className="size-2.5" />
              <span>{note.dueDate.substring(5)}</span>
            </button>
          )}

          {note.locked && (
            <span
              className="flex items-center gap-1 text-[10px] text-[#F5A623] bg-[#F5A623]/15 px-1.5 py-0.5 rounded-md border border-[#F5A623]/30 shrink-0 select-none"
              title="Vị trí ghi chú đã được khóa cố định"
            >
              <Lock className="size-2.5" />
              <span>Khóa</span>
            </span>
          )}
        </div>

        {/* Right Header Actions: Minimize + Lock + Pin + Direct Trash (Delete) + Kebab (…) */}
        <div className="flex items-center gap-0.5 no-drag">
          {/* Direct Minimize / Collapse Quick Button */}
          <button
            type="button"
            title="Thu nhỏ ghi chú (Nhấp đúp thanh tiêu đề cũng được)"
            onClick={(e) => {
              e.stopPropagation();
              sounds.playPop(580);
              toggleNoteCollapse(note.id);
            }}
            className="flex size-6 items-center justify-center rounded-md text-[#8B90A0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Minus className="size-3" />
          </button>

          {/* Lock / Unlock Quick Button */}
          <button
            type="button"
            title={note.locked ? "Mở khóa vị trí" : "Khóa vị trí ghi chú"}
            onClick={(e) => {
              e.stopPropagation();
              bringNote(note.id);
              toggleNoteLock(note.id);
            }}
            className={cn(
              "flex size-6 items-center justify-center rounded-md transition-colors cursor-pointer",
              note.locked
                ? "bg-[#F5A623]/20 text-[#F5A623]"
                : "text-[#8B90A0] hover:text-white hover:bg-white/10",
            )}
          >
            {note.locked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
          </button>

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
              title="Tùy chọn khác (Thu gọn, Khóa, Góc xoay, Sao chép, Xóa)"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                bringNote(note.id);
                setMenuOpen(!menuOpen);
                setColorPickerOpen(false);
                setClusterPickerOpen(false);
              }}
              className={cn(
                "flex size-6 items-center justify-center rounded-md transition-colors cursor-pointer",
                menuOpen ? "bg-white/15 text-white" : "text-[#8B90A0] hover:text-white hover:bg-white/10",
              )}
            >
              <MoreHorizontal className="size-3.5" />
            </button>

            {/* Kebab Popover Menu */}
            {menuOpen && (
              <div
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 z-[80] w-52 flex flex-col p-1.5 rounded-2xl bg-[#1D2029]/98 text-[#F4F5F7] border border-white/15 shadow-[0_20px_45px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-xs animate-in fade-in zoom-in-95 duration-120 font-medium select-none pointer-events-auto"
              >
                {/* 1. Collapse / Expand */}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playPop(580);
                    toggleNoteCollapse(note.id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[#F4F5F7] hover:bg-[#262A35] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <ChevronUp className="size-3.5 text-[#8B90A0]" />
                  <span>Thu gọn ghi chú</span>
                </button>

                {/* 2. Lock / Unlock Position */}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNoteLock(note.id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[#F4F5F7] hover:bg-[#262A35] hover:text-white transition-colors text-left cursor-pointer"
                >
                  {note.locked ? (
                    <>
                      <Unlock className="size-3.5 text-[#F5A623]" />
                      <span>Mở khóa vị trí</span>
                    </>
                  ) : (
                    <>
                      <Lock className="size-3.5 text-[#F5A623]" />
                      <span>Khóa vị trí ghi chú</span>
                    </>
                  )}
                </button>

                {/* 3. Schedule / Due Date */}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playPop(580);
                    setSchedulePickerOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[#F4F5F7] hover:bg-[#262A35] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <Calendar className="size-3.5 text-[#F5A623]" />
                  <span>{note.dueDate ? "Đổi Hạn chót / Lịch" : "Gắn Hạn chót / Lịch"}</span>
                </button>

                {/* 4. Change Cluster / Group */}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playPop(580);
                    setClusterPickerOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[#F4F5F7] hover:bg-[#262A35] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <FolderPlus className="size-3.5 text-[#F5A623]" />
                  <span>Đổi Cụm / Nhóm</span>
                </button>

                {/* 5. Rotation & Font Options */}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playPop(580);
                    setShowOptions(!showOptions);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[#F4F5F7] hover:bg-[#262A35] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <ALargeSmall className="size-3.5 text-[#F5A623]" />
                  <span>Cỡ chữ & Phông chữ</span>
                </button>

                {/* 5. Copy Content */}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyNote();
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[#F4F5F7] hover:bg-[#262A35] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <Copy className="size-3.5 text-[#3FAE6C]" />
                  <span>{copied ? "Đã sao chép! ✓" : "Sao chép nội dung"}</span>
                </button>

                <div className="h-px bg-white/10 my-1" />

                {/* 6. Delete Note */}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick();
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[#EF4444] hover:bg-red-500/15 transition-colors text-left cursor-pointer font-semibold"
                >
                  <Trash2 className="size-3.5 text-[#EF4444]" />
                  <span>Xóa ghi chú</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Cluster Assignment Popover / Dialog */}
      {clusterPickerOpen && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="interactive-el no-drag absolute inset-x-2 top-10 z-[90] p-3 rounded-2xl bg-[#1D2029]/98 text-[#F4F5F7] border border-white/15 shadow-[0_20px_45px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-xs animate-in zoom-in-95 fade-in duration-120 select-none pointer-events-auto"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-2">
            <span className="font-bold text-[11px] text-[#F5A623] uppercase flex items-center gap-1">
              <Folder className="size-3" />
              Chọn Cụm Ghi Chú
            </span>
            <button
              type="button"
              onClick={() => setClusterPickerOpen(false)}
              className="p-1 rounded hover:bg-white/10 text-[#8B90A0] hover:text-white cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1 mb-2 max-h-24 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                updateNote(note.id, { cluster: undefined });
                setClusterPickerOpen(false);
                sounds.playPop(560);
              }}
              className={cn(
                "px-2 py-1 rounded-lg text-[11px] font-medium border cursor-pointer transition-colors",
                !note.cluster ? "bg-[#F5A623] text-[#14161D] border-[#F5A623]" : "bg-white/5 border-white/10 text-[#8B90A0] hover:bg-white/10",
              )}
            >
              Chung (Không nhóm)
            </button>
            {existingClusters.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  updateNote(note.id, { cluster: c });
                  setClusterPickerOpen(false);
                  sounds.playPop(560);
                }}
                className={cn(
                  "px-2 py-1 rounded-lg text-[11px] font-medium border cursor-pointer transition-colors flex items-center gap-1",
                  note.cluster === c ? "bg-[#F5A623] text-[#14161D] border-[#F5A623]" : "bg-white/5 border-white/10 text-[#F4F5F7] hover:bg-white/10",
                )}
              >
                <Folder className="size-2.5" />
                <span>{c}</span>
              </button>
            ))}
          </div>

          {/* Create new cluster input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = customClusterInput.trim();
              if (trimmed) {
                updateNote(note.id, { cluster: trimmed });
                setCustomClusterInput("");
                setClusterPickerOpen(false);
                sounds.playPop(620);
              }
            }}
            className="flex items-center gap-1.5 pt-1 border-t border-white/5"
          >
            <input
              type="text"
              value={customClusterInput}
              onChange={(e) => setCustomClusterInput(e.target.value)}
              placeholder="+ Cụm mới (VD: Dự án A)..."
              className="flex-1 bg-black/30 px-2.5 py-1 rounded-lg text-xs text-[#F4F5F7] outline-none border border-white/10 focus:border-[#F5A623]"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] font-bold text-xs cursor-pointer transition-colors"
            >
              Lưu
            </button>
          </form>
        </div>
      )}

      {/* Schedule / Due Date Popover */}
      {schedulePickerOpen && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="interactive-el no-drag absolute inset-x-2 top-10 z-[90] p-3 rounded-2xl bg-[#1D2029]/98 text-[#F4F5F7] border border-white/15 shadow-[0_20px_45px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-xs space-y-2.5 animate-in zoom-in-95 fade-in duration-120 select-none pointer-events-auto"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="font-bold text-[11px] text-[#F5A623] uppercase flex items-center gap-1">
              <Calendar className="size-3" />
              <span>Hạn chót & Lịch trình</span>
            </span>
            <button
              type="button"
              onClick={() => setSchedulePickerOpen(false)}
              className="size-5 rounded-md hover:bg-white/10 flex items-center justify-center text-[#8B90A0] hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-[#8B90A0] font-semibold">Ngày hạn chót</label>
            <input
              type="date"
              value={dueDateInput}
              onChange={(e) => setDueDateInput(e.target.value)}
              className="w-full bg-black/30 px-2 py-1 rounded-lg text-xs text-[#F4F5F7] outline-none border border-white/10 focus:border-[#F5A623]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-[#8B90A0] font-semibold">Giờ đến hạn</label>
            <input
              type="time"
              value={dueTimeInput}
              onChange={(e) => setDueTimeInput(e.target.value)}
              className="w-full bg-black/30 px-2 py-1 rounded-lg text-xs text-[#F4F5F7] outline-none border border-white/10 focus:border-[#F5A623]"
            />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            {note.dueDate ? (
              <button
                type="button"
                onClick={() => {
                  updateNote(note.id, { dueDate: undefined, dueTime: undefined });
                  setDueDateInput("");
                  setSchedulePickerOpen(false);
                  sounds.playPop(420);
                }}
                className="text-[10px] text-red-400 hover:underline cursor-pointer"
              >
                Gỡ hạn chót
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={() => {
                if (dueDateInput) {
                  createEventFromNote(note.id, dueDateInput, dueTimeInput);
                }
                setSchedulePickerOpen(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] font-bold text-xs cursor-pointer transition-colors"
            >
              Lưu vào Lịch
            </button>
          </div>
        </div>
      )}

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

      {/* Note Body Area (Pastel Background + #23262F Text) - relative z-0 keeps content below header popovers */}
      <div
        className="no-drag relative z-0 p-3.5 pb-6 flex flex-1 flex-col text-[#23262F] rounded-b-2xl cursor-text select-text min-h-0 pointer-events-auto"
        onClick={(e) => {
          const tag = (e.target as HTMLElement).tagName;
          if (tag !== "TEXTAREA" && tag !== "INPUT" && tag !== "BUTTON" && !(e.target as HTMLElement).closest("button,input,form")) {
            // Ensure the Electron window is focused first so the text cursor (caret) becomes visible
            void focusDesktopWindow();
            textareaRef.current?.focus();
          }
        }}
      >
        {/* Note Customization Drawer (Rotation, Opacity, Font) */}
        {showOptions && !showDeleteConfirm && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="no-drag mb-2.5 flex flex-col gap-2 rounded-xl bg-black/5 p-2.5 text-xs border border-black/5 animate-in fade-in zoom-in-95 duration-120 shrink-0"
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-1 mb-0.5">
              <span className="font-bold text-[10px] uppercase text-[#23262F]/85 tracking-wider flex items-center gap-1.5">
                <ALargeSmall className="size-3 text-[#F5A623]" />
                Tùy chỉnh cỡ chữ & phông
              </span>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(false);
                }}
                className="size-4.5 flex items-center justify-center rounded-md hover:bg-black/10 text-[#23262F]/60 hover:text-[#23262F] transition-colors cursor-pointer"
                title="Đóng bảng tùy chỉnh"
              >
                <X className="size-3" />
              </button>
            </div>
            {/* Font Family Control */}
            <div className="flex items-center justify-between pb-1.5 border-b border-black/5">
              <span className="font-semibold text-[10px] uppercase opacity-75">Phông chữ</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => updateNote(note.id, { fontFamily: "sans" })}
                  className={cn("px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors", note.fontFamily === "sans" ? "bg-black/15 font-bold shadow-xs" : "opacity-60 hover:opacity-100 hover:bg-black/5")}
                >
                  Sans
                </button>
                <button
                  type="button"
                  onClick={() => updateNote(note.id, { fontFamily: "handwriting" })}
                  className={cn("px-2 py-0.5 rounded text-[10px] font-handwriting cursor-pointer transition-colors", note.fontFamily === "handwriting" ? "bg-black/15 font-bold shadow-xs" : "opacity-60 hover:opacity-100 hover:bg-black/5")}
                >
                  Script
                </button>
                <button
                  type="button"
                  onClick={() => updateNote(note.id, { fontFamily: "mono" })}
                  className={cn("px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors", note.fontFamily === "mono" ? "bg-black/15 font-bold shadow-xs" : "opacity-60 hover:opacity-100 hover:bg-black/5")}
                >
                  Mono
                </button>
              </div>
            </div>

            {/* Word Standard Font Size Control (10, 11, 12, 14, 16, 18, 24) */}
            <div className="space-y-1 pb-1.5 border-b border-black/5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[10px] uppercase opacity-75">Cỡ chữ (Chuẩn Word)</span>
                <span className="font-mono text-[10px] tabular-nums font-bold opacity-85 text-[#F5A623]">
                  {typeof note.fontSize === "number" ? `${note.fontSize} pt` : "12 pt"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[10, 11, 12, 14, 16, 18, 24].map((pt) => {
                  const currentPt = typeof note.fontSize === "number" ? note.fontSize : 12;
                  const isSelected = currentPt === pt;
                  return (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => updateNote(note.id, { fontSize: pt })}
                      className={cn(
                        "flex-1 py-0.5 rounded text-[9.5px] font-mono font-medium cursor-pointer transition-all text-center",
                        isSelected
                          ? "bg-black/25 font-bold text-[#23262F] shadow-xs ring-1 ring-black/10"
                          : "opacity-60 hover:opacity-100 hover:bg-black/5",
                      )}
                      title={`Cỡ chữ ${pt}pt`}
                    >
                      {pt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Opacity Control */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-[10px] uppercase opacity-75">Độ trong suốt</span>
                <span className="font-mono text-[10px] tabular-nums opacity-60">
                  {Math.round((note.opacity ?? 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.05"
                value={note.opacity ?? 1}
                onChange={(e) => updateNote(note.id, { opacity: parseFloat(e.target.value) })}
                className="w-24 h-1.5 bg-black/20 rounded cursor-pointer accent-[#F5A623]"
              />
            </div>
          </div>
        )}

        {/* Main Textarea: Expands flex-1 to fill the note when resized */}
        <textarea
          ref={textareaRef}
          value={note.body}
          onChange={(e) => updateNote(note.id, { body: e.target.value })}
          onFocus={() => {
            bringNote(note.id);
            // Ensure the Electron window is focused so the blinking text cursor (caret) is visible
            void focusDesktopWindow();
          }}
          placeholder="Viết ghi chú của bạn..."
          suppressHydrationWarning
          style={{
            fontSize: typeof note.fontSize === "number" ? `${note.fontSize}px` : note.fontSize === "sm" ? "11px" : note.fontSize === "lg" ? "16px" : "13.5px",
            caretColor: note.tint === "dark" ? "#F5A623" : "#000000",
          }}
          className={cn(
            "no-drag w-full flex-1 min-h-[64px] resize-none bg-transparent font-normal leading-relaxed text-[#23262F] outline-none placeholder:text-[#23262F]/40 select-text cursor-text touch-auto sticky-note-textarea pointer-events-auto !caret-[#000000] focus:!caret-[#000000] selection:bg-[#F5A623]/30 selection:text-[#000000] note-scrollbar",
            note.fontFamily === "handwriting" && "font-handwriting leading-snug",
            note.fontFamily === "mono" && "font-mono leading-normal",
          )}
        />

        {/* Checklist / Todo Items: Anchored at bottom with scrollable area if long */}
        {note.checkItems && note.checkItems.length > 0 && (
          <div className="no-drag mt-auto pt-2.5 space-y-1 border-t border-black/10 shrink-0 max-h-40 overflow-y-auto note-scrollbar pr-1">
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

        {/* Add Checkbox Item Form: Offset with clearance from bottom-right corner actions */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addCheckItem();
          }}
          className="no-drag mt-2 flex items-center gap-1 opacity-65 hover:opacity-100 transition-opacity shrink-0 mr-14"
        >
          <input
            type="text"
            value={newCheckText}
            onChange={(e) => setNewCheckText(e.target.value)}
            placeholder="+ Thêm mục việc (todo)..."
            className="flex-1 bg-black/5 px-2.5 py-1 rounded-lg text-xs text-[#23262F] outline-none placeholder:text-[#23262F]/40 focus:bg-black/10 transition-colors select-text cursor-text touch-auto caret-[#000000]"
          />
          {newCheckText.trim() && (
            <button
              type="submit"
              className="p-1 rounded-lg bg-black/10 hover:bg-black/20 text-[#23262F] cursor-pointer transition-colors shrink-0"
            >
              <Plus className="size-3" />
            </button>
          )}
        </form>

        {/* Ergonomic Bottom-Right Corner Controls: Smooth Rotation Handle + Corner Resize Handle */}
        {!stacked && (
          <div className="no-drag absolute bottom-1 right-1 flex items-center gap-0.5 z-20">
            {/* Real-time Angle Feedback Badge during Rotation */}
            {isRotating && (
              <div className="flex items-center gap-0.5 rounded-md bg-[#1D2029] text-[#F5A623] px-1.5 py-0.5 text-[10px] font-mono font-bold shadow-lg border border-[#F5A623]/40 animate-in zoom-in-95 pointer-events-none select-none mr-0.5">
                <span>{Math.round(note.rot || 0)}°</span>
              </div>
            )}

            {/* Smooth Rotation Handle (Next to Resize Handle) */}
            <div
              onPointerDown={onRotatePointerDown}
              onPointerMove={onRotatePointerMove}
              onPointerUp={onRotatePointerUp}
              onPointerCancel={onRotatePointerUp}
              onDoubleClick={onResetRotation}
              className={cn(
                "size-5 flex items-center justify-center rounded-lg transition-all cursor-grab active:cursor-grabbing touch-none select-none",
                isRotating
                  ? "bg-[#F5A623] text-[#14161D] shadow-lg scale-110 opacity-100 ring-2 ring-[#1D2029]"
                  : "text-[#23262F]/30 hover:text-[#23262F] hover:bg-black/10 opacity-0 group-hover:opacity-100 hover:scale-110",
              )}
              title="Kéo để xoay nghiêng ghi chú (Nhấp đúp để đặt lại 0°)"
            >
              <RotateCw className="size-3" />
            </div>

            {/* Corner Resize Handle */}
            <div
              onPointerDown={onResizePointerDown}
              onPointerMove={onResizePointerMove}
              onPointerUp={onResizePointerUp}
              onPointerCancel={onResizePointerUp}
              onDoubleClick={onResetSize}
              className={cn(
                "size-5 flex items-center justify-center rounded-lg transition-all cursor-se-resize touch-none select-none",
                isResizing
                  ? "bg-[#F5A623] text-[#14161D] shadow-lg scale-110 opacity-100 ring-2 ring-[#1D2029]"
                  : "text-[#23262F]/30 hover:text-[#23262F] hover:bg-black/10 opacity-0 group-hover:opacity-100 hover:scale-110",
              )}
              title="Kéo góc này để co giãn kích thước ghi chú (Nhấp đúp để tự động vừa vặn)"
            >
              <Scaling className="size-3" />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
