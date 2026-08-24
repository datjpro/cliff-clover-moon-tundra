import { useEffect, useState, useRef, type PointerEvent } from "react";
import { Check, Clock, Eye, EyeOff, Pin, Plus, X } from "lucide-react";
import { useLumen } from "@/lib/store";
import type { Reminder } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatDuration(ms: number) {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) {
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

function FloatingTimerCard({ timer }: { timer: Reminder }) {
  const completeReminder = useLumen((s) => s.completeReminder);
  const removeReminder = useLumen((s) => s.removeReminder);
  const togglePinReminder = useLumen((s) => s.togglePinReminder);
  const lang = useLumen((s) => s.lang);

  const [remaining, setRemaining] = useState(Math.max(0, timer.fireAt - Date.now()));
  const [minimal, setMinimal] = useState(false);
  const [pos, setPos] = useState({ x: 24, y: 80 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });

  useEffect(() => {
    const id = setInterval(() => {
      const rem = Math.max(0, timer.fireAt - Date.now());
      setRemaining(rem);
    }, 500);
    return () => clearInterval(id);
  }, [timer.fireAt]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    isDragging.current = true;
    dragOffset.current = {
      dx: e.clientX - pos.x,
      dy: e.clientY - pos.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    setPos({
      x: e.clientX - dragOffset.current.dx,
      y: e.clientY - dragOffset.current.dy,
    });
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  const total = timer.durationMs || 1;
  const progress = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
  const isFinished = remaining <= 0;

  // 1. MINIMAL TRANSPARENT MODE (Chỉ hiện nội dung + Time, nền trong suốt)
  if (minimal) {
    return (
      <div
        className={cn(
          "interactive-el fixed z-[85] flex items-center gap-2 rounded-xl px-2.5 py-1.5 select-none cursor-grab active:cursor-grabbing",
          "bg-black/35 hover:bg-black/60 text-white backdrop-blur-[2px] transition-all duration-150 group",
          isFinished && "bg-red-500/80 animate-pulse",
        )}
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Clock className={cn("size-3.5 shrink-0 drop-shadow", isFinished ? "text-white" : "text-amber-400")} />
        <span className="text-xs font-bold truncate max-w-[120px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {timer.title}
        </span>
        <span className="font-mono text-sm font-extrabold tracking-wider text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          {isFinished ? "00:00 🔔" : formatDuration(remaining)}
        </span>

        {/* Hover Action Controls */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          <button
            type="button"
            onClick={() => setMinimal(false)}
            title="Mở rộng đầy đủ"
            className="p-0.5 rounded hover:bg-white/20 text-white/80 cursor-pointer"
          >
            <Eye className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => removeReminder(timer.id)}
            title="Đóng / Xóa"
            className="p-0.5 rounded hover:bg-red-500/30 text-white/80 cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>
    );
  }

  // 2. STANDARD FLOATING CARD MODE (Đầy đủ điều khiển)
  return (
    <div
      className={cn(
        "interactive-el fixed z-[85] flex flex-col gap-1.5 rounded-2xl p-3 select-none cursor-grab active:cursor-grabbing shadow-[0_16px_36px_rgba(0,0,0,0.55)] border backdrop-blur-xl transition-all duration-200 w-64",
        isFinished
          ? "bg-red-500/90 text-white border-red-400 animate-pulse ring-2 ring-red-400"
          : "bg-[#1c1917]/95 text-[#f5f5f4] border-[#44403c]",
      )}
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Title & Controls */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <Clock className={cn("size-3.5 shrink-0", isFinished ? "text-white" : "text-amber-400")} />
          <p className="text-xs font-bold truncate leading-tight">{timer.title}</p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Toggle Minimal Transparent Mode */}
          <button
            type="button"
            onClick={() => setMinimal(true)}
            title="Thu gọn trong suốt (Chỉ hiện chữ & giờ)"
            className="flex size-5 items-center justify-center rounded hover:bg-white/20 transition-colors cursor-pointer opacity-75 hover:opacity-100"
          >
            <EyeOff className="size-3 text-[#d6d3d1]" />
          </button>
          <button
            type="button"
            onClick={() => togglePinReminder(timer.id)}
            title="Bỏ ghim màn hình"
            className="flex size-5 items-center justify-center rounded hover:bg-white/20 transition-colors cursor-pointer opacity-75 hover:opacity-100"
          >
            <Pin className="size-3 fill-amber-400 text-amber-400" />
          </button>
          <button
            type="button"
            onClick={() => removeReminder(timer.id)}
            title="Xóa hẹn giờ"
            className="flex size-5 items-center justify-center rounded hover:bg-red-500/30 transition-colors cursor-pointer opacity-75 hover:opacity-100 text-red-400"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>

      {/* Big Digital Countdown */}
      <div className="flex items-baseline justify-between pt-0.5">
        <span className="font-mono text-xl font-extrabold tracking-wider text-amber-400">
          {isFinished ? (lang === "vi" ? "ĐÃ HẾT GIỜ! 🔔" : "TIME UP! 🔔") : formatDuration(remaining)}
        </span>
        {isFinished ? (
          <button
            type="button"
            onClick={() => completeReminder(timer.id)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white text-black font-bold text-xs shadow-md cursor-pointer hover:bg-slate-100"
          >
            <Check className="size-3" />
            <span>Tắt chuông</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              const newFireAt = timer.fireAt + 5 * 60 * 1000;
              useLumen.setState({
                reminders: useLumen.getState().reminders.map((r) =>
                  r.id === timer.id ? { ...r, fireAt: newFireAt, durationMs: (r.durationMs || 0) + 5 * 60 * 1000 } : r,
                ),
              });
            }}
            className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-muted"
          >
            +5p
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full transition-all duration-500",
            isFinished ? "bg-white" : "bg-amber-400",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function FloatingTimers() {
  const reminders = useLumen((s) => s.reminders);
  const pinnedTimers = reminders.filter((r) => !r.done && r.pinToScreen);

  if (pinnedTimers.length === 0) return null;

  return (
    <>
      {pinnedTimers.map((timer) => (
        <FloatingTimerCard key={timer.id} timer={timer} />
      ))}
    </>
  );
}
