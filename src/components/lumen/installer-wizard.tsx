import { useState, useEffect, useRef } from "react";
import {
  Check,
  ChevronRight,
  Clock,
  Folder,
  FolderOpen,
  HardDrive,
  Heart,
  Layers,
  Play,
  RotateCcw,
  Settings,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useLumen } from "@/lib/store";
import { sounds } from "@/lib/audio";
import { cn } from "@/lib/utils";

export function SetupWizardModal() {
  const mode = useLumen((s) => s.setupWizardMode);
  const setMode = useLumen((s) => s.setSetupWizardMode);
  const lang = useLumen((s) => s.lang);
  const isVi = lang === "vi";

  // Step Machine for Install Mode: 0=Welcome, 1=CustomOptions, 2=Installing, 3=Complete
  // Step Machine for Uninstall Mode: 0=Confirm, 1=Uninstalling, 2=Complete
  const [step, setStep] = useState(0);

  // Custom Options State
  const [installPath, setInstallPath] = useState("C:\\Program Files\\Lumen Desktop");
  const [createShortcut, setCreateShortcut] = useState(true);
  const [autoStart, setAutoStart] = useState(true);
  const [registerShortcuts, setRegisterShortcuts] = useState(true);
  const [installPip, setInstallPip] = useState(true);
  const [launchAfterInstall, setLaunchAfterInstall] = useState(true);

  // Uninstall State
  const [keepUserData, setKeepUserData] = useState(true);

  // Progress State
  const [progress, setProgress] = useState(0);
  const [currentActionText, setCurrentActionText] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  // Reset steps on mode change
  useEffect(() => {
    setStep(0);
    setProgress(0);
  }, [mode]);

  // Feature slides during install
  const slides = [
    {
      icon: "📝",
      title: isVi ? "Ghi chú Spatial & Kéo Thả Khay Giấy" : "Spatial Sticky Notes & Paper Well",
      desc: isVi
        ? "Tự do dán, kéo từ khay giấy ra màn hình, xoay góc 360° với phím tắt Alt+N."
        : "Freely stick notes, drag from paper well dock, 360° rotation with Alt+N.",
    },
    {
      icon: "🦊",
      title: isVi ? "Người bạn Thú Cưng Pip Thông Minh" : "Intelligent Pip Pet Companion",
      desc: isVi
        ? "Cáo nhỏ tự động chạy giao note, ném bóng chơi cùng và nhắc nhở công việc."
        : "Companion delivers notes, plays fetch with ball, and reminds tasks.",
    },
    {
      icon: "⏱️",
      title: isVi ? "Hẹn Giờ Bằng Ngôn Ngữ Tự Nhiên" : "Natural Language Timers & Alarms",
      desc: isVi
        ? "Gõ trực tiếp 'nấu canh 15p', 'xây nhà 2h14p' — Lumen tự tính và báo chuông."
        : "Type 'cook soup 15m' or 'study 1h' — Lumen parses and alerts smoothly.",
    },
  ];

  // Installation Progress Runner
  useEffect(() => {
    if (mode === "install" && step === 2) {
      setProgress(0);
      const startTime = Date.now();
      const totalDuration = 3600; // 3.6s simulated install

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
        setProgress(pct);

        if (pct < 25) {
          setCurrentActionText(isVi ? "Đang giải nén tài nguyên lõi & Engine âm thanh..." : "Unpacking core assets & audio engine...");
          setActiveSlide(0);
        } else if (pct < 60) {
          setCurrentActionText(isVi ? "Đang cài đặt thư viện hoạt hình Pip & Hệ thống phím tắt..." : "Installing Pip animation library & global shortcuts...");
          setActiveSlide(1);
        } else if (pct < 85) {
          setCurrentActionText(isVi ? "Đang cấu hình bộ nhớ Local-First & Tối ưu GPU..." : "Configuring Local-First database & GPU pipeline...");
          setActiveSlide(2);
        } else {
          setCurrentActionText(isVi ? "Đang hoàn tất biểu tượng Desktop và đăng ký Registry..." : "Finalizing Desktop shortcuts & Registry keys...");
        }

        if (pct >= 100) {
          clearInterval(interval);
          sounds.playPop(700);
          setTimeout(() => {
            setStep(3); // Complete
          }, 400);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [mode, step, isVi]);

  // Uninstallation Progress Runner
  useEffect(() => {
    if (mode === "uninstall" && step === 1) {
      setProgress(0);
      const startTime = Date.now();
      const totalDuration = 2800;

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
        setProgress(pct);

        if (pct < 35) {
          setCurrentActionText(isVi ? "Đang hủy đăng ký các phím tắt hệ thống Alt+N, Alt+T..." : "Unregistering global system hotkeys...");
        } else if (pct < 75) {
          setCurrentActionText(isVi ? "Đang dọn dẹp các tệp nhị phân và cache ứng dụng..." : "Cleaning application binaries and runtime caches...");
        } else {
          setCurrentActionText(
            keepUserData
              ? isVi
                ? "Đang bảo lưu dữ liệu ghi chú cá nhân của bạn..."
                : "Preserving your personal notes and database..."
              : isVi
              ? "Đang dọn dẹp toàn bộ dữ liệu người dùng..."
              : "Cleaning all user data...",
          );
        }

        if (pct >= 100) {
          clearInterval(interval);
          sounds.playPop(500);
          setTimeout(() => {
            setStep(2); // Uninstall Complete
          }, 300);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [mode, step, isVi, keepUserData]);

  if (!mode) return null;

  const handleClose = () => {
    sounds.playPop(400);
    setMode(null);
  };

  const handleBrowseFolder = () => {
    sounds.playPop(520);
    const mockDrives = [
      "C:\\Program Files\\Lumen Desktop",
      "D:\\Apps\\Lumen Desktop",
      "D:\\Games\\Lumen Workspace",
      "C:\\Users\\LumenDesk",
    ];
    const nextPath = mockDrives[(mockDrives.indexOf(installPath) + 1) % mockDrives.length] || mockDrives[0];
    setInstallPath(nextPath);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div
        className="interactive-el relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#15171E]/98 text-[#F4F5F7] shadow-[0_30px_90px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Glow Bar */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full bg-gradient-to-r from-[#F5A623]/25 via-amber-500/20 to-[#FFD166]/25 blur-3xl pointer-events-none" />

        {/* Modal Window Titlebar with Fast Mode Switcher */}
        <div className="relative flex items-center justify-between border-b border-white/6 px-5 py-3 bg-black/20">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="Lumen Logo" className="size-5 object-contain" />
            {/* Quick Switcher Buttons */}
            <div className="flex items-center rounded-xl bg-black/40 p-0.5 border border-white/5">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop(520);
                  setMode("install");
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                  mode === "install"
                    ? "bg-[#F5A623] text-[#14161D] shadow-sm"
                    : "text-[#8B90A0] hover:text-white",
                )}
              >
                <Zap className="size-3" />
                <span>{isVi ? "1. Trình Cài Đặt (Setup)" : "1. Setup Wizard"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop(420);
                  setMode("uninstall");
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                  mode === "uninstall"
                    ? "bg-red-500 text-white shadow-sm"
                    : "text-[#8B90A0] hover:text-white",
                )}
              >
                <Trash2 className="size-3" />
                <span>{isVi ? "2. Trình Gỡ Cài Đặt (Uninstall)" : "2. Uninstaller"}</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex size-7 items-center justify-center rounded-full hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MODE 1: INSTALL WIZARD SCREENS                                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {mode === "install" && (
          <div className="p-6">
            {/* SCREEN 0: WELCOME & 1-CLICK HERO */}
            {step === 0 && (
              <div className="flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
                {/* 3D Fox Mascot Hero Avatar */}
                <div className="relative flex size-20 items-center justify-center rounded-3xl bg-gradient-to-b from-[#262A35] to-[#1D2029] border border-white/15 shadow-2xl p-2">
                  <img src="/icon.png" alt="Lumen Logo" className="size-16 object-contain" />
                  <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-[#F5A623] text-[#14161D] shadow-md font-bold text-xs">
                    ✨
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {isVi ? "Chào mừng đến với Lumen Desktop" : "Welcome to Lumen Desktop"}
                  </h2>
                  <p className="text-xs text-[#8B90A0] max-w-md mx-auto leading-relaxed">
                    {isVi
                      ? "Không gian làm việc không gian ảo, ghi chú dán siêu nhẹ & người bạn Pip đồng hành trên màn hình Desktop của bạn."
                      : "Artisanal spatial desktop workspace with lightweight sticky notes and Pip companion."}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="w-full space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop(620);
                      setStep(2); // Start installation immediately
                    }}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#F5A623] to-[#FFD166] text-[#14161D] font-bold text-sm shadow-[0_8px_25px_rgba(245,166,35,0.4)] hover:shadow-[0_10px_30px_rgba(245,166,35,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="size-4.5 fill-current" />
                    <span>{isVi ? "⚡ Cài đặt nhanh 1-Click (Khuyên dùng)" : "⚡ Quick 1-Click Install"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop(500);
                      setStep(1); // Go to custom options
                    }}
                    className="w-full h-10 rounded-2xl bg-[#262A35]/60 hover:bg-[#262A35] text-[#F4F5F7] text-xs font-semibold border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Settings className="size-3.5 text-[#8B90A0]" />
                    <span>{isVi ? "Tùy chỉnh nâng cao (Thư mục & Tùy chọn)" : "Custom Install (Folder & Options)"}</span>
                  </button>
                </div>

                <p className="text-[10px] text-[#8B90A0]/60">
                  {isVi
                    ? "Bằng cách tiếp tục, bạn đồng ý với Điều khoản và Quyền riêng tư cục bộ (Local-First)."
                    : "By proceeding, you agree to Local-First private offline storage terms."}
                </p>
              </div>
            )}

            {/* SCREEN 1: CUSTOM DIRECTORY & OPTIONS */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isVi ? "Tùy chọn Cài đặt & Thư mục" : "Install Directory & Options"}
                  </h3>
                  <p className="text-xs text-[#8B90A0] mt-0.5">
                    {isVi ? "Chọn vị trí cài đặt và các tính năng tích hợp hệ thống" : "Choose location and system integration options"}
                  </p>
                </div>

                {/* Directory Selector Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#F4F5F7] flex items-center gap-1.5">
                    <Folder className="size-3.5 text-[#F5A623]" />
                    <span>{isVi ? "Thư mục cài đặt ứng dụng" : "Destination Folder"}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 rounded-xl bg-[#0F1015] border border-white/10 px-3 py-2 text-xs font-mono text-[#F4F5F7]">
                      <HardDrive className="size-3.5 text-[#8B90A0] shrink-0" />
                      <input
                        type="text"
                        value={installPath}
                        onChange={(e) => setInstallPath(e.target.value)}
                        className="bg-transparent outline-none w-full text-xs font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleBrowseFolder}
                      className="px-3.5 py-2 rounded-xl bg-[#262A35] hover:bg-[#323746] text-xs font-medium text-white border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <FolderOpen className="size-3.5 text-[#F5A623]" />
                      <span>{isVi ? "Duyệt..." : "Browse..."}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8B90A0] px-1">
                    <span>{isVi ? "Dung lượng yêu cầu: ~120 MB" : "Required space: ~120 MB"}</span>
                    <span className="text-[#3FAE6C] font-medium">{isVi ? "Ổ đĩa còn trống: 184 GB" : "Free space: 184 GB"}</span>
                  </div>
                </div>

                {/* Checkbox Options Grid */}
                <div className="space-y-2 rounded-2xl bg-[#0F1015]/60 p-3 border border-white/5">
                  <label className="flex items-center gap-2.5 text-xs text-[#F4F5F7] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createShortcut}
                      onChange={(e) => setCreateShortcut(e.target.checked)}
                      className="size-4 rounded accent-[#F5A623] cursor-pointer"
                    />
                    <span>{isVi ? "Tạo biểu tượng ngoài màn hình Desktop (Desktop Shortcut)" : "Create Desktop Shortcut"}</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-[#F4F5F7] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoStart}
                      onChange={(e) => setAutoStart(e.target.checked)}
                      className="size-4 rounded accent-[#F5A623] cursor-pointer"
                    />
                    <span>{isVi ? "Tự động khởi động cùng Windows khi bật máy" : "Start automatically when Windows starts"}</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-[#F4F5F7] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={registerShortcuts}
                      onChange={(e) => setRegisterShortcuts(e.target.checked)}
                      className="size-4 rounded accent-[#F5A623] cursor-pointer"
                    />
                    <span>{isVi ? "Đăng ký phím tắt nhanh toàn hệ thống (Alt+N, Alt+T, Alt+S)" : "Register global system shortcuts (Alt+N, Alt+T, Alt+S)"}</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-[#F4F5F7] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={installPip}
                      onChange={(e) => setInstallPip(e.target.checked)}
                      className="size-4 rounded accent-[#F5A623] cursor-pointer"
                    />
                    <span>{isVi ? "Cài đặt gói Thú Cưng Hoạt Hình Pip & Tủ Đồ Phụ Kiện" : "Install Pip Animated Pet Companion & Wardrobe pack"}</span>
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop(400);
                      setStep(0);
                    }}
                    className="px-4 py-2 rounded-xl hover:bg-white/10 text-xs font-medium text-[#8B90A0] transition-colors cursor-pointer"
                  >
                    {isVi ? "← Quay lại" : "← Back"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop(620);
                      setStep(2); // Start install
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#FFD166] text-[#14161D] font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{isVi ? "Tiến hành Cài đặt 🚀" : "Start Installation 🚀"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 2: PROGRESS & FEATURE SHOWCASE */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                    <Sparkles className="size-4 text-[#F5A623] animate-spin" style={{ animationDuration: "3s" }} />
                    <span>{isVi ? "Đang cài đặt Lumen Desktop..." : "Installing Lumen Desktop..."}</span>
                  </h3>
                  <p className="text-xs text-[#8B90A0] font-mono min-h-[18px]">{currentActionText}</p>
                </div>

                {/* Main Amber Glowing Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-[#0F1015] h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#F5A623] via-[#FFD166] to-[#3FAE6C] shadow-[0_0_15px_rgba(245,166,35,0.8)] transition-all duration-75 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8B90A0]">
                    <span>{progress < 100 ? (isVi ? "Vui lòng chờ trong giây lát..." : "Please wait...") : (isVi ? "Hoàn tất!" : "Complete!")}</span>
                    <span className="font-bold text-[#F5A623]">{progress}%</span>
                  </div>
                </div>

                {/* Dynamic Feature Slide Carousel during Installation */}
                <div className="rounded-2xl bg-[#0F1015]/80 p-4 border border-white/10 flex items-center gap-3.5 transition-all duration-300">
                  <span className="text-3xl shrink-0 p-2.5 rounded-2xl bg-[#262A35]/50 border border-white/5">
                    {slides[activeSlide]?.icon}
                  </span>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-[#F4F5F7] truncate">{slides[activeSlide]?.title}</p>
                    <p className="text-[11px] text-[#8B90A0] leading-relaxed line-clamp-2">{slides[activeSlide]?.desc}</p>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 3: INSTALLATION COMPLETE */}
            {step === 3 && (
              <div className="flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
                {/* Big Animated Success Checkmark */}
                <div className="flex size-18 items-center justify-center rounded-full bg-gradient-to-b from-[#3FAE6C]/30 to-[#3FAE6C]/10 border border-[#3FAE6C]/40 text-[#3FAE6C] shadow-[0_0_30px_rgba(63,174,108,0.4)] animate-bounce">
                  <Check className="size-9 stroke-[3]" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {isVi ? "Cài đặt thành công! 🎉" : "Installation Complete! 🎉"}
                  </h2>
                  <p className="text-xs text-[#8B90A0] max-w-sm mx-auto">
                    {isVi
                      ? "Lumen Desktop đã sẵn sàng biến màn hình làm việc của bạn thành không gian sáng tạo đỉnh cao."
                      : "Lumen Desktop is installed and ready to elevate your spatial workspace."}
                  </p>
                </div>

                <label className="flex items-center gap-2.5 text-xs text-[#F4F5F7] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={launchAfterInstall}
                    onChange={(e) => setLaunchAfterInstall(e.target.checked)}
                    className="size-4 rounded accent-[#F5A623] cursor-pointer"
                  />
                  <span>{isVi ? "Mở Lumen Desktop ngay bây giờ ✨" : "Launch Lumen Desktop now ✨"}</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop(700);
                    handleClose();
                  }}
                  className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#F5A623] to-[#FFD166] text-[#14161D] font-bold text-sm shadow-[0_8px_25px_rgba(245,166,35,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="size-4 fill-current" />
                  <span>{isVi ? "Bắt đầu Trải nghiệm" : "Finish & Explore"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MODE 2: UNINSTALL WIZARD SCREENS                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {mode === "uninstall" && (
          <div className="p-6">
            {/* SCREEN 0: CONFIRMATION & USER DATA RETENTION */}
            {step === 0 && (
              <div className="flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="relative flex size-20 items-center justify-center rounded-3xl bg-red-500/10 border border-red-500/30 text-red-400 shadow-xl p-2">
                  <span className="text-4xl">🥺</span>
                  <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md font-bold text-xs">
                    <Trash2 className="size-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {isVi ? "Gỡ cài đặt Lumen Desktop?" : "Uninstall Lumen Desktop?"}
                  </h2>
                  <p className="text-xs text-[#8B90A0] max-w-md mx-auto leading-relaxed">
                    {isVi
                      ? "Bạn có chắc chắn muốn chia tay Lumen và người bạn Pip không? Mọi tiện ích trên màn hình sẽ bị gỡ bỏ."
                      : "Are you sure you want to uninstall Lumen and say goodbye to Pip companion?"}
                  </p>
                </div>

                {/* User Data Retention Checkbox */}
                <div className="w-full rounded-2xl bg-[#0F1015] p-3.5 border border-white/10 text-left">
                  <label className="flex items-start gap-3 text-xs text-[#F4F5F7] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={keepUserData}
                      onChange={(e) => setKeepUserData(e.target.checked)}
                      className="size-4 rounded accent-[#3FAE6C] cursor-pointer mt-0.5"
                    />
                    <div>
                      <p className="font-semibold text-white">
                        {isVi ? "Giữ lại ghi chú và dữ liệu lịch nhắc cá nhân (Khuyên dùng)" : "Keep my personal notes and timer database"}
                      </p>
                      <p className="text-[11px] text-[#8B90A0] mt-0.5">
                        {isVi
                          ? "Dữ liệu sẽ được bảo lưu an toàn để bạn không bị mất việc nếu cài đặt lại sau này."
                          : "Your data stays safe locally if you reinstall Lumen in the future."}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="w-full grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="h-11 rounded-xl bg-[#262A35] hover:bg-[#323746] text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                  >
                    {isVi ? "Hủy bỏ (Giữ lại Lumen)" : "Cancel (Keep Lumen)"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop(400);
                      setStep(1); // Start uninstall progress
                    }}
                    className="h-11 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold border border-red-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>{isVi ? "Xác nhận Gỡ cài đặt" : "Confirm Uninstall"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 1: UNINSTALLING PROGRESS */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                    <Trash2 className="size-4 text-red-400 animate-pulse" />
                    <span>{isVi ? "Đang tiến hành gỡ cài đặt..." : "Uninstalling Lumen..."}</span>
                  </h3>
                  <p className="text-xs text-[#8B90A0] font-mono min-h-[18px]">{currentActionText}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full bg-[#0F1015] h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 shadow-[0_0_15px_rgba(239,68,68,0.8)] transition-all duration-75 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8B90A0]">
                    <span>{isVi ? "Vui lòng chờ trong giây lát..." : "Please wait..."}</span>
                    <span className="font-bold text-red-400">{progress}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: UNINSTALL COMPLETE */}
            {step === 2 && (
              <div className="flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/10 text-white text-3xl">
                  👋
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {isVi ? "Đã gỡ cài đặt hoàn tất" : "Uninstalled Successfully"}
                  </h2>
                  <p className="text-xs text-[#8B90A0] max-w-sm mx-auto">
                    {isVi
                      ? "Cảm ơn bạn đã đồng hành cùng Lumen. Chúc bạn luôn có những ngày làm việc thật hiệu quả!"
                      : "Thank you for using Lumen. We hope to see you again soon!"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full h-10 rounded-xl bg-[#262A35] hover:bg-[#323746] text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                >
                  {isVi ? "Đóng cửa sổ" : "Close"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
