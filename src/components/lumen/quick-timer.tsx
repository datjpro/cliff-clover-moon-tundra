import { useEffect, useRef, useState } from "react";
import { Clock, Sparkles, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { sounds } from "@/lib/audio";
import { useLumen } from "@/lib/store";

function parseTimerInput(raw: string): { title: string; durationMs: number } {
  let title = raw.trim();
  let hours = 0;
  let mins = 0;
  let secs = 0;

  const parts = raw.split(/[:\-–—]/);
  let timeStr = "";
  if (parts.length >= 2) {
    title = parts[0].trim();
    timeStr = parts.slice(1).join(" ").trim();
  } else {
    timeStr = raw;
  }

  const hMatch = timeStr.match(/(\d+)\s*(?:g|h|giờ|hour|hours)/i);
  if (hMatch) hours = parseInt(hMatch[1], 10);

  const mMatch = timeStr.match(/(\d+)\s*(?:p|m|phút|min|mins|minute|minutes)/i);
  if (mMatch) mins = parseInt(mMatch[1], 10);

  const sMatch = timeStr.match(/(\d+)\s*(?:s|giây|sec|secs|second|seconds)/i);
  if (sMatch) secs = parseInt(sMatch[1], 10);

  if (parts.length === 1 && (hMatch || mMatch || sMatch)) {
    title =
      raw
        .replace(/(\d+)\s*(?:g|h|giờ|hour|hours)/gi, "")
        .replace(/(\d+)\s*(?:p|m|phút|min|mins|minute|minutes)/gi, "")
        .replace(/(\d+)\s*(?:s|giây|sec|secs|second|seconds)/gi, "")
        .trim() || "Hẹn giờ";
  }

  let totalMs = (hours * 3600 + mins * 60 + secs) * 1000;
  if (totalMs <= 0) {
    const numOnly = parseInt(timeStr.trim(), 10);
    if (!isNaN(numOnly) && numOnly > 0) {
      totalMs = numOnly * 60 * 1000;
    } else {
      totalMs = 5 * 60 * 1000;
    }
  }

  return { title: title || "Hẹn giờ mới", durationMs: totalMs };
}

export function QuickTimer() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("xây nhà trong COC : 2g14p");
  const [pinToDesktop, setPinToDesktop] = useState(true);
  const addReminder = useLumen((s) => s.addReminder);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut Ctrl+Shift+T and custom event listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    const handleOpenEvent = () => {
      setOpen(true);
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("open-quick-timer", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("open-quick-timer", handleOpenEvent);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      sounds.playPop(580);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const parsed = parseTimerInput(input);
    addReminder(parsed.title, parsed.durationMs, pinToDesktop);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        aria-label="Đóng"
        onClick={() => setOpen(false)}
      />

      {/* Solid Opaque Dialog */}
      <form
        onSubmit={handleSubmit}
        className="interactive-el relative z-10 w-full max-w-md rounded-2xl bg-[#1c1917] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-[#44403c] text-white animate-in zoom-in-95 fade-in duration-150 space-y-3"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#38332e]">
          <p className="font-display text-sm font-bold text-amber-400 flex items-center gap-1.5">
            <Clock className="size-4" />
            <span>Đặt Giờ Nhanh (Ctrl + Shift + T)</span>
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1 rounded hover:bg-white/10 text-[#a8a29e] hover:text-white cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <Input
            ref={inputRef}
            placeholder="Ví dụ: xây nhà trong COC : 2g14p hoặc nấu canh 15p..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-[#292524] border-[#57534e] text-sm text-white placeholder:text-[#78716c] focus:border-amber-400"
          />

          {/* Quick Preset Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: "COC: 2g14p", val: "xây nhà trong COC : 2g14p" },
              { label: "Pomodoro: 25p", val: "Tập trung làm việc : 25p" },
              { label: "Nghỉ: 5p", val: "Nghỉ ngơi giải lao : 5p" },
              { label: "Nấu ăn: 15p", val: "Nấu ăn canh súp : 15p" },
              { label: "1 Giờ", val: "Hẹn giờ : 1g" },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setInput(preset.val)}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#292524] hover:bg-amber-500/20 hover:text-amber-400 text-[#d6d3d1] border border-[#57534e] transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#38332e]">
          <span className="text-xs text-[#a8a29e]">Ghim đồng hồ đếm ngược nổi trên Desktop</span>
          <Switch checked={pinToDesktop} onCheckedChange={setPinToDesktop} />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-pointer text-[#d6d3d1] hover:bg-white/10 text-xs"
            onClick={() => setOpen(false)}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            size="sm"
            className="cursor-pointer bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs px-4"
          >
            Bắt đầu đếm giờ
          </Button>
        </div>
      </form>
    </div>
  );
}

export function triggerOpenQuickTimer() {
  window.dispatchEvent(new CustomEvent("open-quick-timer"));
}
