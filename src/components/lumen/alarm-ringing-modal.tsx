import { Bell, Check, Clock, Sparkles, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLumen } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AlarmRingingModal() {
  const activeAlarm = useLumen((s) => s.activeAlarm);
  const dismissActiveAlarm = useLumen((s) => s.dismissActiveAlarm);
  const snoozeReminder = useLumen((s) => s.snoozeReminder);
  const lang = useLumen((s) => s.lang);

  if (!activeAlarm) return null;

  const isVi = lang === "vi";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
      {/* Flashing dark background */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md animate-pulse" />

      {/* Alarm Alert Card */}
      <div
        className={cn(
          "interactive-el relative z-10 w-full max-w-lg rounded-3xl bg-[#1c1917] p-7 text-white shadow-[0_30px_90px_rgba(239,68,68,0.5)] border-2 border-red-500",
          "animate-in zoom-in-95 fade-in duration-200 flex flex-col items-center text-center space-y-4",
        )}
      >
        {/* Animated Shaking Ringing Bell */}
        <div className="relative flex size-20 items-center justify-center rounded-full bg-red-500/20 text-red-500 ring-4 ring-red-500/40 animate-bounce">
          <Bell className="size-10 fill-red-500 animate-wiggle" />
          <span className="absolute -top-1 -right-1 flex size-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-5 bg-amber-500" />
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <p className="text-xs uppercase font-extrabold tracking-widest text-red-400">
            {isVi ? "🔔 THÔNG BÁO HẾT GIỜ" : "🔔 TIME EXPIRED"}
          </p>
          <h2 className="text-2xl font-black text-white leading-tight">
            {activeAlarm.title}
          </h2>
          <p className="text-xs text-[#a8a29e] pt-1">
            {isVi
              ? "Chuông đang kêu lặp lại liên tục. Nhấn nút bên dưới để tắt chuông."
              : "Alarm is ringing continuously. Click below to dismiss."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col sm:flex-row gap-2.5 pt-2">
          {/* Dismiss Button */}
          <Button
            type="button"
            onClick={dismissActiveAlarm}
            className="flex-1 h-12 bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="size-5" />
            <span>{isVi ? "TẮT CHUÔNG NGAY" : "DISMISS ALARM"}</span>
          </Button>

          {/* Snooze 5 Minutes */}
          <Button
            type="button"
            variant="outline"
            onClick={() => snoozeReminder(activeAlarm.id, 5)}
            className="h-12 border-[#57534e] hover:bg-white/10 text-[#d6d3d1] font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 px-4"
          >
            <Clock className="size-4 text-amber-400" />
            <span>{isVi ? "Báo lại 5 phút" : "Snooze 5m"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
