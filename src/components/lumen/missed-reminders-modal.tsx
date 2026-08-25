import { useEffect, useState } from "react";
import { BellRing, Check, Clock, RotateCcw, X } from "lucide-react";
import { sounds } from "@/lib/audio";
import { useLumen } from "@/lib/store";
import type { Reminder } from "@/lib/types";

export function MissedRemindersModal() {
  const reminders = useLumen((s) => s.reminders);
  const completeReminder = useLumen((s) => s.completeReminder);
  const snoozeReminder = useLumen((s) => s.snoozeReminder);
  const hydrated = useLumen((s) => s.hydrated);

  const [missed, setMissed] = useState<Reminder[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const now = Date.now();
    // Items that expired more than 5 seconds ago and were not yet marked done (i.e. during shutdown)
    const expiredWhileOffline = reminders.filter(
      (r) => !r.done && r.fireAt < now - 5000,
    );

    if (expiredWhileOffline.length > 0) {
      setMissed(expiredWhileOffline);
      setOpen(true);
      sounds.playChime();
    }
  }, [hydrated]);

  if (!open || missed.length === 0) return null;

  const handleAcknowledgeAll = () => {
    sounds.playPop(620);
    missed.forEach((r) => completeReminder(r.id));
    setOpen(false);
  };

  const handleSnooze = (id: string) => {
    snoozeReminder(id, 15);
    setMissed((prev) => prev.filter((m) => m.id !== id));
    if (missed.length <= 1) setOpen(false);
  };

  const handleDismissOne = (id: string) => {
    completeReminder(id);
    setMissed((prev) => prev.filter((m) => m.id !== id));
    if (missed.length <= 1) setOpen(false);
  };

  const formatElapsed = (fireAt: number) => {
    const elapsedMs = Math.max(0, Date.now() - fireAt);
    const mins = Math.floor(elapsedMs / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `Đã kết thúc cách đây ${hours}h ${mins % 60}p`;
    }
    if (mins > 0) {
      return `Đã kết thúc cách đây ${mins} phút`;
    }
    return "Vừa kết thúc";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none pointer-events-auto">
      {/* Dim backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        aria-label="Đóng"
        onClick={handleAcknowledgeAll}
      />

      {/* Card */}
      <div className="interactive-el relative z-10 w-full max-w-md rounded-2xl bg-[#1D2029]/98 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-[#F5A623]/30 text-[#F4F5F7] backdrop-blur-2xl animate-in zoom-in-95 fade-in duration-150">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2 text-[#F5A623]">
            <BellRing className="size-4.5 animate-bounce" />
            <span className="font-bold text-xs uppercase tracking-wider">
              Lịch Nhắc Hoàn Thành Khi Tắt Máy
            </span>
          </div>
          <button
            type="button"
            onClick={handleAcknowledgeAll}
            className="size-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
            title="Đóng thông báo"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-xs text-[#8B90A0] mb-3 leading-relaxed">
          Trong khoảng thời gian ứng dụng đóng hoặc máy tính tắt, các mốc hẹn giờ sau đây đã hết hạn:
        </p>

        {/* List of missed items */}
        <div className="max-h-56 overflow-y-auto space-y-2 pr-1 note-scrollbar">
          {missed.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#F5A623]/30 transition-colors"
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="font-semibold text-xs text-[#F4F5F7] truncate">
                  {item.title}
                </span>
                <span className="text-[10px] text-[#F5A623] flex items-center gap-1 font-mono">
                  <Clock className="size-2.5" />
                  {formatElapsed(item.fireAt)}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSnooze(item.id)}
                  title="Đặt lại thêm 15 phút"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-[#F5A623] hover:text-[#14161D] text-[11px] font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>+15p</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDismissOne(item.id)}
                  title="Đã biết"
                  className="p-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 text-[#8B90A0] transition-colors cursor-pointer"
                >
                  <Check className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#8B90A0]">
            {missed.length} lịch nhắc đã xong
          </span>
          <button
            type="button"
            onClick={handleAcknowledgeAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Check className="size-3.5" />
            <span>Đã biết tất cả</span>
          </button>
        </div>
      </div>
    </div>
  );
}
