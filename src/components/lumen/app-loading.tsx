import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useLumen } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AppStartupLoading() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Đang khởi tạo không gian làm việc...");
  const [isClosing, setIsClosing] = useState(false);
  const lang = useLumen((s) => s.lang);
  const setAppLoaded = useLumen((s) => s.setAppLoaded);
  const isVi = lang === "vi";

  useEffect(() => {
    // Stage 1: Fast initial jump (0 -> 35%)
    const t1 = setTimeout(() => {
      setProgress(35);
      setStatusText(isVi ? "Đang tải ghi chú và lịch nhắc..." : "Loading notes & reminders...");
    }, 150);

    // Stage 2: Second step (35 -> 75%)
    const t2 = setTimeout(() => {
      setProgress(75);
      setStatusText(isVi ? "Đang đánh thức người bạn Pip..." : "Waking up Pip companion...");
    }, 550);

    // Stage 3: Ready state (75 -> 100%)
    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText(isVi ? "Sẵn sàng làm việc ✨" : "Ready for workspace ✨");
    }, 950);

    // Stage 4: Trigger smooth fade-out exit & reveal notes
    const t4 = setTimeout(() => {
      setIsClosing(true);
      setAppLoaded(true);
    }, 1300);

    // Stage 5: Unmount component completely
    const t5 = setTimeout(() => {
      setVisible(false);
    }, 1650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isVi, setAppLoaded]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "interactive-el fixed inset-0 z-[120] flex items-center justify-center bg-[#14161D]/75 backdrop-blur-xl transition-opacity duration-300 pointer-events-auto select-none",
        isClosing && "opacity-0 pointer-events-none",
      )}
    >
      <div
        className={cn(
          "relative w-[340px] max-w-[90vw] rounded-3xl bg-[#1D2029]/95 text-[#F4F5F7] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.85)] border border-white/10 backdrop-blur-2xl flex flex-col items-center text-center transition-all duration-300 animate-in fade-in zoom-in-95",
          isClosing && "scale-95 translate-y-2 opacity-0",
        )}
      >
        {/* Glow backdrop behind mascot */}
        <div className="absolute -top-12 size-36 rounded-full bg-[#F5A623]/15 blur-2xl pointer-events-none" />

        {/* Mascot Avatar with gentle bounce */}
        <div className="relative mb-3 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-b from-[#262A35] to-[#1D2029] border border-white/10 shadow-xl">
          <span className="text-3xl animate-bounce">🦊</span>
          <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#F5A623] text-[#14161D] shadow-md">
            <Sparkles className="size-3" />
          </div>
        </div>

        {/* App Title & Tagline */}
        <div className="flex items-center gap-1.5 mb-1">
          <h1 className="text-base font-bold tracking-tight text-white">Lumen Desktop</h1>
          <span className="rounded-full bg-[#F5A623]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#F5A623] border border-[#F5A623]/30">
            v2.0
          </span>
        </div>
        <p className="text-xs text-[#8B90A0] mb-4 min-h-[18px] transition-all duration-200">
          {statusText}
        </p>

        {/* Smooth Animated Progress Bar */}
        <div className="w-full bg-[#14161D] h-2 rounded-full overflow-hidden border border-white/5 p-0.5 mb-3.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#F5A623] to-[#FFD166] shadow-[0_0_12px_rgba(245,166,35,0.6)] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Helpful Shortcut Tip Footer */}
        <div className="w-full pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-[#8B90A0]">
          <span>{isVi ? "Phím tắt nhanh:" : "Shortcut:"}</span>
          <div className="flex gap-1.5 font-mono text-[#F4F5F7]">
            <span className="bg-[#262A35] px-1.5 py-0.5 rounded border border-white/5">Alt+N</span>
            <span className="bg-[#262A35] px-1.5 py-0.5 rounded border border-white/5">Alt+T</span>
            <span className="bg-[#262A35] px-1.5 py-0.5 rounded border border-white/5">Alt+P</span>
          </div>
        </div>
      </div>
    </div>
  );
}
