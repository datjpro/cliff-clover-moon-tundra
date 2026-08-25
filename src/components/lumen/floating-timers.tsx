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
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
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
    isDraggingRef.current = true;
    setIsDragging(true);
    dragOffset.current = {
      dx: e.clientX - pos.x,
      dy: e.clientY - pos.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    setPos({
      x: e.clientX - dragOffset.current.dx,
      y: e.clientY - dragOffset.current.dy,
    });
  };

  const onPointerUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const total = timer.durationMs || 1;
  const progress = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
  const isFinished = remaining <= 0;

  // 1. Minimal Transparent Pill Mode
  if (minimal) {
    return (
      <div
        className={cn(
          "interactive-el fixed z-[85] flex items-center gap-2 rounded-xl px-2.5 py-1.5 select-none touch-none",
          isDragging
            ? "!transition-none cursor-grabbing ring-1 ring-[#F5A623] scale-105 shadow-2xl"
            : "cursor-grab transition-all duration-140 shadow-lg",
          "bg-[#14161D]/80 hover:bg-[#14161D]/95 text-[#F4F5F7] border border-white/10 backdrop-blur-md group",
          isFinished && "bg-[#EF4444]/90 animate-pulse border-red-400",
        )}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transition: isDragging ? "none" : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Clock className={cn("size-3.5 shrink-0", isFinished ? "text-white" : "text-[#F5A623]")} />
        <span className="text-xs font-medium truncate max-w-[120px]">
          {timer.title}
        </span>
        <span className="font-mono text-xs font-bold tracking-wider text-[#F5A623] tabular-nums">
          {isFinished ? "00:00 🔔" : formatDuration(remaining)}
        </span>

        {/* Hover Action Controls */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          <button
            type="button"
            onClick={() => setMinimal(false)}
            title="Mở rộng đầy đủ"
            className="p-0.5 rounded hover:bg-white/20 text-[#8B90A0] hover:text-white cursor-pointer"
          >
            <Eye className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => removeReminder(timer.id)}
            title="Đóng / Xóa"
            className="p-0.5 rounded hover:bg-red-500/30 text-[#8B90A0] hover:text-red-400 cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Standard Floating Card Mode
  return (
    <div
      className={cn(
        "interactive-el fixed z-[85] flex flex-col gap-1.5 rounded-2xl p-3 select-none touch-none w-64 shadow-[0_20px_45px_rgba(0,0,0,0.6)] border backdrop-blur-2xl",
        isDragging
          ? "!transition-none cursor-grabbing ring-2 ring-[#F5A623] scale-[1.02]"
          : "cursor-grab transition-all duration-160",
        isFinished
          ? "bg-[#EF4444]/90 text-white border-red-400 animate-pulse ring-2 ring-red-400"
          : "bg-[#1D2029]/95 text-[#F4F5F7] border-white/10",
      )}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transition: isDragging ? "none" : undefined,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Title & Controls */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <Clock className={cn("size-3.5 shrink-0", isFinished ? "text-white" : "text-[#F5A623]")} />
          <p className="text-xs font-semibold truncate leading-tight">{timer.title}</p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setMinimal(true)}
            title="Thu gọn trong suốt"
            className="flex size-5 items-center justify-center rounded hover:bg-white/10 transition-colors cursor-pointer text-[#8B90A0] hover:text-white"
          >
            <EyeOff className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => togglePinReminder(timer.id)}
            title="Bỏ ghim màn hình"
            className="flex size-5 items-center justify-center rounded hover:bg-white/10 transition-colors cursor-pointer text-[#F5A623]"
          >
            <Pin className="size-3 fill-[#F5A623]" />
          </button>
          <button
            type="button"
            onClick={() => removeReminder(timer.id)}
            title="Xóa hẹn giờ"
            className="flex size-5 items-center justify-center rounded hover:bg-red-500/20 transition-colors cursor-pointer text-[#8B90A0] hover:text-[#EF4444]"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>

      {/* Big Digital Countdown */}
      <div className="flex items-baseline justify-between pt-0.5">
        <span className="font-mono text-xl font-bold tracking-wider text-[#F5A623] tabular-nums">
          {isFinished ? (lang === "vi" ? "ĐÃ HẾT GIỜ! 🔔" : "TIME UP! 🔔") : formatDuration(remaining)}
        </span>
        {isFinished ? (
          <button
            type="button"
            onClick={() => completeReminder(timer.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white text-[#14161D] font-bold text-xs shadow-md cursor-pointer hover:bg-slate-100 transition-colors"
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
            className="text-[10px] px-1.5 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer border border-white/5"
          >
            +5p
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={cn(
            "h-full transition-all duration-500 rounded-full",
            isFinished ? "bg-white" : "bg-[#F5A623]",
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
