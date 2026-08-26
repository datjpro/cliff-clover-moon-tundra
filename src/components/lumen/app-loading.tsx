import { useEffect, useRef, useState } from "react";
import { Play, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { useLumen } from "@/lib/store";
import { sounds } from "@/lib/audio";
import { cn } from "@/lib/utils";

export function AppStartupLoading() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Đang khởi tạo không gian làm việc...");
  const [isClosing, setIsClosing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const lang = useLumen((s) => s.lang);
  const introVideoEnabled = useLumen((s) => s.introVideoEnabled ?? true);
  const setAppLoaded = useLumen((s) => s.setAppLoaded);
  const isVi = lang === "vi";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isDismissedRef = useRef(false);

  // Smooth Dismiss function
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
    }, 350);
  };

  useEffect(() => {
    if (!introVideoEnabled) {
      setAppLoaded(true);
      setVisible(false);
      return;
    }

    // Keyboard shortcuts to skip (Space, Enter, Escape)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Fallback safety timer: in case video doesn't play or takes too long, auto-dismiss after 6s
    const fallbackTimer = setTimeout(() => {
      handleDismiss();
    }, 6500);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(fallbackTimer);
    };
  }, [introVideoEnabled]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 4.5;
    const pct = Math.min(100, Math.round((current / duration) * 100));
    setProgress(pct);

    if (pct < 35) {
      setStatusText(isVi ? "Đang khởi tạo không gian làm việc..." : "Initializing spatial workspace...");
    } else if (pct < 75) {
      setStatusText(isVi ? "Đang tải ghi chú & người bạn Pip..." : "Loading notes & companion...");
    } else {
      setStatusText(isVi ? "Sẵn sàng làm việc ✨" : "Ready for workspace ✨");
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!visible || !introVideoEnabled) return null;

  return (
    <div
      className={cn(
        "interactive-el fixed inset-0 z-[99999] flex items-center justify-center bg-[#0C0D12]/90 backdrop-blur-3xl transition-opacity duration-300 pointer-events-auto select-none overflow-hidden",
        isClosing && "opacity-0 pointer-events-none",
      )}
      onClick={handleDismiss}
    >
      {/* Ambient background glow matching Lumen amber theme */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,166,35,0.12),transparent_70%)] pointer-events-none" />

      {/* Main Cinematic Video Presentation Card */}
      <div
        className={cn(
          "relative w-[620px] max-w-[94vw] aspect-video rounded-3xl bg-[#14161D] text-[#F4F5F7] shadow-[0_30px_90px_rgba(0,0,0,0.95)] border border-white/10 overflow-hidden flex flex-col justify-between transition-all duration-300 animate-in fade-in zoom-in-95",
          isClosing && "scale-95 translate-y-2 opacity-0",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Video Element (with scale-104 crop to eliminate edge artifacts) */}
        {!videoError ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src="/intro.mp4"
              autoPlay
              muted={isMuted}
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleDismiss}
              onError={() => setVideoError(true)}
              className="size-full object-cover scale-[1.04] select-none pointer-events-none will-change-transform"
            />
          </div>
        ) : (
          /* Fallback Animated Mascot if video file fails */
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1D2029] to-[#14161D]">
            <img src="/icon.png" alt="Lumen Logo" className="size-20 object-contain animate-bounce mb-3" />
            <h2 className="text-lg font-bold text-white tracking-tight">Lumen Desktop</h2>
          </div>
        )}

        {/* 2. Top Header Overlay (Conceals top watermarks & branding) */}
        <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Top-Left: Lumen Branding Badge */}
          <div className="flex items-center gap-2.5 rounded-full bg-[#14161D]/85 px-3 py-1 border border-white/10 backdrop-blur-md shadow-lg">
            <img src="/icon.png" alt="Lumen Logo" className="size-4.5 object-contain" />
            <span className="text-xs font-semibold text-white tracking-wide">Lumen</span>
            <span className="text-[10px] font-mono text-[#F5A623] font-bold px-1.5 py-0.2 rounded-full bg-[#F5A623]/20">
              v2.0
            </span>
          </div>

          {/* Top-Right: Sound Toggle & Skip Button (Conceals top-right watermark) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="flex size-7.5 items-center justify-center rounded-full bg-[#14161D]/80 hover:bg-[#262A35] text-[#8B90A0] hover:text-white border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5 text-[#F5A623]" />}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="flex items-center gap-1.5 rounded-full bg-[#14161D]/85 hover:bg-[#262A35] px-3 py-1 text-xs font-medium text-[#F4F5F7] border border-white/10 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg group"
              title="Bỏ qua (Phím Space hoặc Esc)"
              aria-label="Skip Intro"
            >
              <span>{isVi ? "Bỏ qua" : "Skip"}</span>
              <span className="text-[10px] font-mono text-[#8B90A0] group-hover:text-white transition-colors">
                [Space]
              </span>
            </button>
          </div>
        </div>

        {/* 3. Bottom Corner Mask & Cinematic Vignette (Conceals bottom watermarks) */}
        <div className="relative z-20 flex flex-col p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="flex items-center justify-between text-xs text-[#8B90A0] mb-2 font-medium">
            <span className="text-[#F4F5F7] flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[#F5A623]" />
              {statusText}
            </span>
            <span className="font-mono text-[11px] text-[#F5A623] font-semibold">{progress}%</span>
          </div>

          {/* Cinematic Amber Glowing Progress Bar */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#F5A623] to-[#FFD166] shadow-[0_0_12px_rgba(245,166,35,0.75)] transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
