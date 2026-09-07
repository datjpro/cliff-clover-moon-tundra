import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import { Check, ChevronDown, ChevronUp, Crosshair, Target, X, RotateCcw } from "lucide-react";
import { sounds } from "@/lib/audio";
import { cn } from "@/lib/utils";

interface ScopeRotaryTimePickerProps {
  value: string; // "HH:mm" (24h format)
  onChange: (val: string) => void;
  minTime?: string; // Optional "HH:mm" minimum allowed time (e.g. if today)
  isPastDisabled?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  className?: string;
}

const QUICK_PRESETS = [
  { label: "🎯 Bây giờ", action: "now" },
  { label: "🌅 09:00", val: "09:00" },
  { label: "☀️ 14:00", val: "14:00" },
  { label: "🌙 20:00", val: "20:00" },
  { label: "+15p", addMins: 15 },
  { label: "+30p", addMins: 30 },
  { label: "+1g", addMins: 60 },
];

export function ScopeRotaryTimePicker({
  value = "09:00",
  onChange,
  minTime,
  isPastDisabled = false,
  onClose,
  onCancel,
  className,
}: ScopeRotaryTimePickerProps) {
  const [hourStr, minStr] = (value || "09:00").split(":");
  const currentHour = parseInt(hourStr || "9", 10);
  const currentMin = parseInt(minStr || "0", 10);

  // Isolated Draft Working State (allows cancel/revert with zero side effects)
  const [draftHour, setDraftHour] = useState(isNaN(currentHour) ? 9 : Math.max(0, Math.min(23, currentHour)));
  const [draftMin, setDraftMin] = useState(isNaN(currentMin) ? 0 : Math.max(0, Math.min(59, currentMin)));

  // Drag state for rotary barrel wheels
  const hourDragRef = useRef<{ startY: number; initVal: number } | null>(null);
  const minDragRef = useRef<{ startY: number; initVal: number } | null>(null);

  // Sync draft state if prop value changes externally
  useEffect(() => {
    const [h, m] = (value || "09:00").split(":");
    const parsedH = parseInt(h, 10);
    const parsedM = parseInt(m, 10);
    if (!isNaN(parsedH)) setDraftHour(parsedH);
    if (!isNaN(parsedM)) setDraftMin(parsedM);
  }, [value]);

  const updateDraft = (h: number, m: number) => {
    const clampedH = Math.max(0, Math.min(23, h));
    const clampedM = Math.max(0, Math.min(59, m));
    setDraftHour(clampedH);
    setDraftMin(clampedM);
  };

  const handleHourStep = (delta: number) => {
    let nextH = (draftHour + delta) % 24;
    if (nextH < 0) nextH += 24;

    // Past time validation check
    if (isPastDisabled && minTime) {
      const [minH, minM] = minTime.split(":").map(Number);
      if (nextH < minH || (nextH === minH && draftMin < minM)) {
        sounds.playMechanicalClick(0.7);
        return;
      }
    }

    sounds.playMechanicalClick(delta > 0 ? 1.05 : 0.95);
    updateDraft(nextH, draftMin);
  };

  const handleMinStep = (delta: number) => {
    let nextM = (draftMin + delta) % 60;
    if (nextM < 0) nextM += 60;

    if (isPastDisabled && minTime) {
      const [minH, minM] = minTime.split(":").map(Number);
      if (draftHour === minH && nextM < minM) {
        sounds.playMechanicalClick(0.7);
        return;
      }
    }

    sounds.playMechanicalClick(delta > 0 ? 1.15 : 0.9);
    updateDraft(draftHour, nextM);
  };

  // Wheel Scroll Handlers with Ratchet Audio Feedback
  const handleHourWheel = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 1 : -1;
    handleHourStep(delta);
  };

  const handleMinWheel = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 1 : -1;
    handleMinStep(delta);
  };

  // Pointer Drag on Barrel Wheels
  const handleHourPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    hourDragRef.current = { startY: e.clientY, initVal: draftHour };
  };

  const handleHourPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!hourDragRef.current) return;
    const dy = e.clientY - hourDragRef.current.startY;
    const stepDiff = Math.round(-dy / 22);
    if (stepDiff !== 0) {
      let targetH = (hourDragRef.current.initVal + stepDiff) % 24;
      if (targetH < 0) targetH += 24;
      if (targetH !== draftHour) {
        sounds.playMechanicalClick(stepDiff > 0 ? 1.08 : 0.92);
        updateDraft(targetH, draftMin);
      }
    }
  };

  const handleHourPointerUp = () => {
    hourDragRef.current = null;
  };

  const handleMinPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    minDragRef.current = { startY: e.clientY, initVal: draftMin };
  };

  const handleMinPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!minDragRef.current) return;
    const dy = e.clientY - minDragRef.current.startY;
    const stepDiff = Math.round(-dy / 18);
    if (stepDiff !== 0) {
      let targetM = (minDragRef.current.initVal + stepDiff) % 60;
      if (targetM < 0) targetM += 60;
      if (targetM !== draftMin) {
        sounds.playMechanicalClick(stepDiff > 0 ? 1.12 : 0.88);
        updateDraft(draftHour, targetM);
      }
    }
  };

  const handleMinPointerUp = () => {
    minDragRef.current = null;
  };

  const handlePresetClick = (preset: (typeof QUICK_PRESETS)[number]) => {
    if (preset.action === "now") {
      const now = new Date();
      const h = now.getHours();
      const m = Math.ceil(now.getMinutes() / 5) * 5 % 60;
      sounds.playScopeLock();
      updateDraft(h, m);
    } else if (preset.val) {
      const [h, m] = preset.val.split(":").map(Number);
      sounds.playScopeLock();
      updateDraft(h, m);
    } else if (preset.addMins) {
      let totalM = draftHour * 60 + draftMin + preset.addMins;
      let newH = Math.floor(totalM / 60) % 24;
      let newM = totalM % 60;
      sounds.playMechanicalClick(1.2);
      updateDraft(newH, newM);
    }
  };

  // Explicit Confirm & Apply Action Flow
  const handleConfirm = () => {
    const formatted = `${String(draftHour).padStart(2, "0")}:${String(draftMin).padStart(2, "0")}`;
    sounds.playScopeLock();
    onChange(formatted);
    onClose?.();
  };

  // Explicit Cancel & Abort Flow (discards draft changes completely)
  const handleCancel = () => {
    sounds.playPop(420);
    // Reset draft back to initial value
    const [h, m] = (value || "09:00").split(":");
    setDraftHour(parseInt(h, 10) || 9);
    setDraftMin(parseInt(m, 10) || 0);
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  // Visible slots for 3D barrel view
  const getVisibleSlots = (current: number, max: number) => {
    const slots = [-2, -1, 0, 1, 2];
    return slots.map((offset) => {
      let val = (current + offset) % max;
      if (val < 0) val += max;
      return { val, offset };
    });
  };

  const visibleHours = getVisibleSlots(draftHour, 24);
  const visibleMins = getVisibleSlots(draftMin, 60);

  return (
    <div
      className={cn(
        "rounded-2xl bg-[#14161D]/98 border border-[#F5A623]/40 p-3.5 text-[#F4F5F7] shadow-[0_25px_60px_rgba(0,0,0,0.9)] select-none backdrop-blur-2xl relative overflow-hidden ring-1 ring-[#F5A623]/20",
        className,
      )}
    >
      {/* Background Reticle Grid & Aperture HUD Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F5A623] to-transparent" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-[#F5A623] to-transparent" />
        <div className="absolute top-3 left-3 size-4 border-t-2 border-l-2 border-[#F5A623]" />
        <div className="absolute top-3 right-3 size-4 border-t-2 border-r-2 border-[#F5A623]" />
        <div className="absolute bottom-3 left-3 size-4 border-b-2 border-l-2 border-[#F5A623]" />
        <div className="absolute bottom-3 right-3 size-4 border-b-2 border-r-2 border-[#F5A623]" />
      </div>

      {/* Tactical Scope Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/8 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-[#F5A623]">
          <Crosshair className="size-3.5 animate-spin-slow text-[#F5A623]" />
          <span>SCOPE ROTARY // {String(draftHour).padStart(2, "0")}:{String(draftMin).padStart(2, "0")}</span>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="size-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
          title="Hủy cấu hình giờ (Escape / Cancel)"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Dual Barrel-Wheel Rotary Housing */}
      <div className="relative flex items-center justify-center gap-3 py-2 px-1">
        {/* Optical Center Scope Target Box */}
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-10 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/50 pointer-events-none shadow-[0_0_15px_rgba(245,166,35,0.15)] flex items-center justify-between px-3">
          <div className="size-2 border-t-2 border-l-2 border-[#F5A623]" />
          <div className="size-2 border-t-2 border-r-2 border-[#F5A623]" />
        </div>

        {/* 1. HOURS BARREL WHEEL */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => handleHourStep(-1)}
            className="p-1 rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-[#F5A623] transition-colors cursor-pointer"
            title="Tăng 1 giờ (Lăn chuột lên)"
          >
            <ChevronUp className="size-3.5" />
          </button>

          <div
            onWheel={handleHourWheel}
            onPointerDown={handleHourPointerDown}
            onPointerMove={handleHourPointerMove}
            onPointerUp={handleHourPointerUp}
            onPointerCancel={handleHourPointerUp}
            className="relative w-18 h-32 flex flex-col items-center justify-center overflow-hidden cursor-ns-resize touch-none select-none rounded-xl bg-[#1D2029]/80 border border-white/6 shadow-inner"
            title="Lăn chuột hoặc kéo thả để xoay nấc giờ"
          >
            {/* Top / Bottom Gradient Fade */}
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#14161D] to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#14161D] to-transparent pointer-events-none z-10" />

            {visibleHours.map(({ val, offset }) => {
              const isCenter = offset === 0;
              const scale = isCenter ? "scale-115 font-bold text-[#F5A623]" : Math.abs(offset) === 1 ? "scale-90 text-[#8B90A0] opacity-60" : "scale-75 text-[#8B90A0] opacity-25";
              return (
                <div
                  key={`${val}-${offset}`}
                  className={cn(
                    "h-6 flex items-center justify-center font-mono text-sm transition-all duration-75 tabular-nums",
                    scale,
                  )}
                >
                  {String(val).padStart(2, "0")}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleHourStep(1)}
            className="p-1 rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-[#F5A623] transition-colors cursor-pointer"
            title="Giảm 1 giờ (Lăn chuột xuống)"
          >
            <ChevronDown className="size-3.5" />
          </button>
          <span className="text-[10px] font-mono text-[#8B90A0] uppercase mt-0.5">Giờ (Hour)</span>
        </div>

        {/* Separator Colon */}
        <div className="flex flex-col items-center gap-1 text-[#F5A623] font-mono text-xl font-black shrink-0 px-0.5">
          <span className="animate-pulse">:</span>
        </div>

        {/* 2. MINUTES BARREL WHEEL */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => handleMinStep(-1)}
            className="p-1 rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-[#F5A623] transition-colors cursor-pointer"
            title="Tăng 1 phút (Lăn chuột lên)"
          >
            <ChevronUp className="size-3.5" />
          </button>

          <div
            onWheel={handleMinWheel}
            onPointerDown={handleMinPointerDown}
            onPointerMove={handleMinPointerMove}
            onPointerUp={handleMinPointerUp}
            onPointerCancel={handleMinPointerUp}
            className="relative w-18 h-32 flex flex-col items-center justify-center overflow-hidden cursor-ns-resize touch-none select-none rounded-xl bg-[#1D2029]/80 border border-white/6 shadow-inner"
            title="Lăn chuột hoặc kéo thả để xoay nấc phút"
          >
            {/* Top / Bottom Gradient Fade */}
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#14161D] to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#14161D] to-transparent pointer-events-none z-10" />

            {visibleMins.map(({ val, offset }) => {
              const isCenter = offset === 0;
              const scale = isCenter ? "scale-115 font-bold text-[#F5A623]" : Math.abs(offset) === 1 ? "scale-90 text-[#8B90A0] opacity-60" : "scale-75 text-[#8B90A0] opacity-25";
              return (
                <div
                  key={`${val}-${offset}`}
                  className={cn(
                    "h-6 flex items-center justify-center font-mono text-sm transition-all duration-75 tabular-nums",
                    scale,
                  )}
                >
                  {String(val).padStart(2, "0")}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleMinStep(1)}
            className="p-1 rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-[#F5A623] transition-colors cursor-pointer"
            title="Giảm 1 phút (Lăn chuột xuống)"
          >
            <ChevronDown className="size-3.5" />
          </button>
          <span className="text-[10px] font-mono text-[#8B90A0] uppercase mt-0.5">Phút (Min)</span>
        </div>
      </div>

      {/* Quick Tactical Preset Chips */}
      <div className="flex flex-wrap items-center justify-center gap-1 pt-2 border-t border-white/6">
        {QUICK_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => handlePresetClick(p)}
            className="text-[10px] px-2 py-0.5 rounded-lg bg-[#262A35]/60 hover:bg-[#F5A623]/20 hover:text-[#F5A623] text-[#8B90A0] border border-white/5 hover:border-[#F5A623]/30 transition-all duration-120 cursor-pointer font-mono"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Dual Explicit Action Buttons: Confirm vs Cancel */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/6 mt-2">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B90A0] hover:text-white text-xs font-semibold border border-white/5 cursor-pointer transition-colors"
        >
          <X className="size-3.5" />
          <span>Hủy bỏ (Exit)</span>
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-98"
        >
          <Target className="size-3.5" />
          <span>Khóa & Áp dụng</span>
        </button>
      </div>
    </div>
  );
}
