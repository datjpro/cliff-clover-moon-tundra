import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useLumen } from "@/lib/store";
import { sounds } from "@/lib/audio";
import { cn } from "@/lib/utils";

export function AppStartupLoading() {
  const [visible, setVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Đang khởi tạo không gian làm việc...");

  const lang = useLumen((s) => s.lang);
  const introVideoEnabled = useLumen((s) => s.introVideoEnabled ?? true);
  const setAppLoaded = useLumen((s) => s.setAppLoaded);
  const isVi = lang === "vi";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isDismissedRef = useRef(false);

  // Smooth Dismiss & Transition to Workspace
  const handleDismiss = () => {
    if (isDismissedRef.current) return;
    isDismissedRef.current = true;
    sounds.playPop(520);
    setIsClosing(true);
    setAppLoaded(true);
    setVisible(false); // Immediately unmount so zero backdrop exists

    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
      } catch {}
    }
  };

  useEffect(() => {
    if (!introVideoEnabled) {
      setAppLoaded(true);
      setVisible(false);
      return;
    }

    // Space, Enter, Escape dismisses the intro cleanly without e.preventDefault()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        window.removeEventListener("keydown", handleKeyDown);
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Natural 6.5s intro showcase before auto-transition
    const autoDismissTimer = setTimeout(() => {
      handleDismiss();
    }, 6500);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(autoDismissTimer);
    };
  }, [introVideoEnabled]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 6.0;
    const pct = Math.min(100, Math.round((current / duration) * 100));
    setProgress(pct);

    if (pct < 30) {
      setStatusText(isVi ? "Đang chuẩn bị không gian làm việc..." : "Preparing spatial workspace...");
    } else if (pct < 70) {
      setStatusText(isVi ? "Đang đánh thức người bạn Pip ✨" : "Waking up Pip companion ✨");
    } else {
      setStatusText(isVi ? "Sẵn sàng làm việc 🚀" : "Ready for productivity 🚀");
    }
  };

  if (!visible || !introVideoEnabled) return null;

  return (
    <div
      className={cn(
        "interactive-el fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0C0D12]/94 backdrop-blur-2xl transition-all duration-400 pointer-events-auto select-none overflow-hidden cursor-pointer",
        isClosing && "opacity-0 scale-105 pointer-events-none blur-sm",
      )}
      onClick={handleDismiss}
      title="Nhấp chuột hoặc bấm phím bất kỳ để vào màn hình làm việc"
    >
      {/* 1. Ambient Background Luminescence Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(245,166,35,0.16),rgba(20,22,29,0.92)_60%,#0C0D12_95%)] pointer-events-none" />

      {/* 2. Main Cinematic Full-Frame Presentation (Fully Visible, High-Res, No Cropped Anatomy) */}
      <div className="relative flex flex-col items-center max-w-[94vw] pointer-events-none">
        {/* Soft Golden Ambient Light behind Mascot */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#F5A623]/20 blur-3xl pointer-events-none" />

        {/* Crisp, Rounded Cinematic Video Display (No Video Controls, Seamless Glass Border) */}
        <div className="relative w-[720px] max-w-[92vw] aspect-video rounded-3xl overflow-hidden bg-[#14161D] shadow-[0_25px_80px_rgba(0,0,0,0.9)] border border-white/10 ring-1 ring-white/5">
          <video
            ref={videoRef}
            src="/intro.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleDismiss}
            className="size-full object-contain bg-[#171922] select-none pointer-events-none will-change-transform"
          />

          {/* Subtle Corner Vignette to harmonize with desktop lighting */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>

        {/* 3. Sleek Typography & Progress Bar Below Video */}
        <div className="mt-5 flex flex-col items-center text-center space-y-2.5 w-full max-w-[720px] px-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wider text-white">LUMEN</span>
              <span className="rounded-full bg-[#F5A623]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#F5A623] border border-[#F5A623]/30">
                DESKTOP
              </span>
            </div>

            <p className="text-xs text-[#8B90A0] font-medium flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[#F5A623]" />
              <span>{statusText}</span>
            </p>
          </div>

          {/* Minimalist Golden Progress Line */}
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#F5A623] to-[#FFD166] shadow-[0_0_10px_rgba(245,166,35,0.75)] transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Natural Interaction Hint at Bottom */}
      <div className="absolute bottom-6 flex items-center gap-2 text-[11px] text-[#8B90A0]/60 font-mono tracking-wider uppercase pointer-events-none">
        <span className="size-1.5 rounded-full bg-[#F5A623] animate-ping" />
        <span>{isVi ? "Nhấp chuột hoặc bấm phím bất kỳ để vào không gian làm việc" : "Click or press any key to enter workspace"}</span>
      </div>
    </div>
  );
}
