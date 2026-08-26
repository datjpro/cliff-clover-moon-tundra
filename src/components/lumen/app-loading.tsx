import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useLumen } from "@/lib/store";
import { sounds } from "@/lib/audio";
import { cn } from "@/lib/utils";

export function AppStartupLoading() {
  const [visible, setVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [statusText, setStatusText] = useState("Đang đánh thức người bạn Pip...");

  const lang = useLumen((s) => s.lang);
  const introVideoEnabled = useLumen((s) => s.introVideoEnabled ?? true);
  const setAppLoaded = useLumen((s) => s.setAppLoaded);
  const isVi = lang === "vi";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isDismissedRef = useRef(false);

  // Smooth Organic Dismiss & Transition to Workspace
  const handleDismiss = () => {
    if (isDismissedRef.current) return;
    isDismissedRef.current = true;
    sounds.playPop(520);
    setIsClosing(true);
    setAppLoaded(true);

    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
      } catch {}
    }

    setTimeout(() => {
      setVisible(false);
    }, 450);
  };

  useEffect(() => {
    if (!introVideoEnabled) {
      setAppLoaded(true);
      setVisible(false);
      return;
    }

    // Any key (Space, Enter, Escape, etc.) dismisses instantly
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      handleDismiss();
    };

    window.addEventListener("keydown", handleKeyDown);

    // Natural duration: 5.5s intro showcase before smooth transition
    const autoDismissTimer = setTimeout(() => {
      handleDismiss();
    }, 5500);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(autoDismissTimer);
    };
  }, [introVideoEnabled]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 5.0;
    const pct = Math.min(100, Math.round((current / duration) * 100));

    if (pct < 35) {
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
        "interactive-el fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0C0D12]/92 backdrop-blur-2xl transition-all duration-500 pointer-events-auto select-none overflow-hidden cursor-pointer",
        isClosing && "opacity-0 scale-105 pointer-events-none blur-sm",
      )}
      onClick={handleDismiss}
      title="Nhấp chuột hoặc bấm phím bất kỳ để vào màn hình làm việc"
    >
      {/* 1. Deep Ambient Radial Atmosphere Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(245,166,35,0.18),rgba(20,22,29,0.95)_65%,#0C0D12_95%)] pointer-events-none" />

      {/* 2. Organic Luminous Centerpiece Portal (Feathered Radial Mask - Zero Video Box Borders) */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Amber Halo Glow behind Mascot */}
        <div className="absolute -top-6 size-80 rounded-full bg-[#F5A623]/25 blur-3xl pointer-events-none animate-pulse" />

        {/* Seamless Masked Video Portal */}
        <div
          className="relative size-72 sm:size-80 md:size-96 overflow-hidden flex items-center justify-center pointer-events-none"
          style={{
            maskImage: "radial-gradient(ellipse 65% 70% at 50% 48%, black 45%, rgba(0,0,0,0.85) 60%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse 65% 70% at 50% 48%, black 45%, rgba(0,0,0,0.85) 60%, transparent 85%)",
          }}
        >
          <video
            ref={videoRef}
            src="/intro.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleDismiss}
            className="size-full object-cover scale-[1.12] select-none pointer-events-none will-change-transform drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* 3. Sleek Organic Branding Typography */}
        <div className="relative z-10 -mt-4 flex flex-col items-center text-center space-y-1.5 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider bg-gradient-to-r from-[#F4F5F7] via-[#FFD166] to-[#F5A623] bg-clip-text text-transparent drop-shadow-md">
              LUMEN
            </h1>
            <span className="rounded-full bg-[#F5A623]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#F5A623] border border-[#F5A623]/30">
              DESK
            </span>
          </div>

          <p className="text-xs text-[#8B90A0] font-medium flex items-center gap-1.5 tracking-wide">
            <Sparkles className="size-3.5 text-[#F5A623] animate-spin" style={{ animationDuration: "3s" }} />
            <span>{statusText}</span>
          </p>
        </div>
      </div>

      {/* 4. Minimalist Natural Interaction Hint at Bottom */}
      <div className="absolute bottom-8 flex items-center gap-2 text-[11px] text-[#8B90A0]/70 font-mono tracking-wider uppercase pointer-events-none">
        <span className="size-1.5 rounded-full bg-[#F5A623] animate-ping" />
        <span>{isVi ? "Nhấp chuột hoặc bấm phím bất kỳ để bắt đầu" : "Click or press any key to enter"}</span>
      </div>
    </div>
  );
}
