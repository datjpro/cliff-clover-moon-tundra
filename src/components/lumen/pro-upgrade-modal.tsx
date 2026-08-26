import { useState } from "react";
import { Check, Crown, KeyRound, Sparkles, X, Zap, Shield, Palette, Layers, BellRing } from "lucide-react";
import { sounds } from "@/lib/audio";
import { useLumen } from "@/lib/store";
import type { ProFeatureId } from "@/lib/types";

const PRO_FEATURES = [
  {
    id: "unlimited_notes",
    icon: Layers,
    titleVi: "Ghi chú không giới hạn",
    titleEn: "Unlimited Sticky Notes",
    descVi: "Tạo hàng trăm ghi chú dán & phân cụm dự án tự do trên màn hình (Bản Free tối đa 5 note).",
    descEn: "Create hundreds of spatial notes & project clusters freely (Free limit: 5 notes).",
  },
  {
    id: "multi_timers",
    icon: BellRing,
    titleVi: "Hẹn giờ đa luồng (Multi-Timer)",
    titleEn: "Multi-Timer System",
    descVi: "Chạy cùng lúc nhiều đồng hồ đếm ngược (nâng cấp nhà game COC, Pomodoro, nấu ăn).",
    descEn: "Run multiple concurrent countdowns (COC builder tracking, Pomodoro, cooking).",
  },
  {
    id: "pro_themes",
    icon: Palette,
    titleVi: "Mở khóa toàn bộ chủ đề cao cấp",
    titleEn: "All Premium Themes",
    descVi: "Chủ đề Kính mờ Mạ vàng (Glassmorphism Gold), Cyberpunk Neon, và Giấy cổ điển Ink.",
    descEn: "Glassmorphism Gold, Cyberpunk Neon, and Classic Ink themes.",
  },
  {
    id: "exclusive_skins",
    icon: Crown,
    titleVi: "Tủ đồ & Skin Cáo độc quyền",
    titleEn: "Exclusive Companion Skins",
    descVi: "Trang phục Cáo Tuyết (Snow Fox), Obsidian Black, và Mũ pháp sư Wizard Hat.",
    descEn: "Snow Fox, Obsidian Black skins, and magical Wizard Hats.",
  },
  {
    id: "ai_cluster",
    icon: Sparkles,
    titleVi: "Tự động phân loại ghi chú thông minh",
    titleEn: "Smart AI Auto-Clustering",
    descVi: "Tự động gom nhóm các ghi chú theo dự án, màu sắc và mức độ ưu tiên chỉ với 1 click.",
    descEn: "Automatically organize and cluster notes by project, color, and priority.",
  },
  {
    id: "pin_lock",
    icon: Shield,
    titleVi: "Khóa bảo mật ghi chú riêng tư",
    titleEn: "Privacy Security PIN Lock",
    descVi: "Đặt mã PIN bảo vệ các ghi chú chứa thông tin nhạy cảm, mật khẩu hoặc ý tưởng bí mật.",
    descEn: "Set PIN code to protect private notes, passwords, and confidential ideas.",
  },
];

export function ProUpgradeModal() {
  const open = useLumen((s) => s.proModalOpen);
  const feature = useLumen((s) => s.proModalFeature);
  const setOpen = useLumen((s) => s.setProModalOpen);
  const pro = useLumen((s) => s.pro);
  const activatePro = useLumen((s) => s.activatePro);
  const deactivatePro = useLumen((s) => s.deactivatePro);
  const lang = useLumen((s) => s.lang);
  const pushToast = useLumen((s) => s.pushToast);

  const [licenseKeyInput, setLicenseKeyInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const isVi = lang === "vi";

  if (!open) return null;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) {
      setErrorMsg(isVi ? "Vui lòng nhập mã bản quyền" : "Please enter a license key");
      return;
    }

    const result = activatePro(licenseKeyInput.trim());
    if (result.success) {
      setErrorMsg("");
      pushToast(
        isVi ? "🎉 Chúc mừng bạn đã nâng cấp Lumen Pro!" : "🎉 Welcome to Lumen Pro!",
        isVi ? "Mở khóa toàn bộ tính năng không giới hạn." : "All premium features unlocked.",
      );
      setOpen(false);
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleQuickDemoActivate = () => {
    const result = activatePro("LUMEN-PRO-LIFETIME-2026");
    if (result.success) {
      pushToast(
        isVi ? "✨ Đã kích hoạt bản quyền Pro Trọn Đời!" : "✨ Lifetime Pro License Activated!",
        isVi ? "Đã gỡ bỏ toàn bộ giới hạn ghi chú & hẹn giờ." : "All limits removed.",
      );
      setOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none animate-in fade-in duration-200">
      <div
        className="interactive-el pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-500/30 bg-[#15171e]/95 text-stone-100 shadow-2xl shadow-amber-500/10 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-yellow-500/30 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playPop(400);
            setOpen(false);
          }}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-stone-800/60 text-stone-400 hover:bg-stone-700 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/30">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">Lumen Pro</h2>
                <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  {pro.isPro ? (isVi ? "Đã Kích Hoạt" : "Active") : isVi ? "Cao Cấp" : "Premium"}
                </span>
              </div>
              <p className="text-sm text-stone-400">
                {isVi
                  ? "Mở rộng giới hạn, trải nghiệm không gian làm việc chuyên nghiệp tối thượng."
                  : "Expand limits and experience the ultimate desktop spatial companion."}
              </p>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {PRO_FEATURES.map((item) => {
              const Icon = item.icon;
              const isTarget = feature === item.id;
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                    isTarget
                      ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40"
                      : "border-stone-800/80 bg-stone-900/50 hover:border-stone-700"
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-200">{isVi ? item.titleVi : item.titleEn}</h4>
                    <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{isVi ? item.descVi : item.descEn}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activation & Pricing Section */}
          <div className="mt-6 pt-5 border-t border-stone-800/80">
            {pro.isPro ? (
              <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">
                      {isVi ? "Bản quyền Pro đang hoạt động" : "Pro License Active"}
                    </p>
                    <p className="text-xs text-emerald-400/80 font-mono">Key: {pro.licenseKey ?? "LIFETIME-PRO"}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    deactivatePro();
                    pushToast(isVi ? "Đã chuyển về gói Free" : "Switched to Free tier", "");
                  }}
                  className="text-xs text-stone-400 hover:text-rose-400 underline transition-colors"
                >
                  {isVi ? "Hủy bản quyền" : "Deactivate"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* License Input */}
                <form onSubmit={handleActivate} className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                    <input
                      type="text"
                      value={licenseKeyInput}
                      onChange={(e) => {
                        setLicenseKeyInput(e.target.value);
                        setErrorMsg("");
                      }}
                      placeholder={isVi ? "Nhập mã kích hoạt (VD: LUMEN-PRO-XXXX)..." : "Enter License Key (e.g. LUMEN-PRO-XXXX)..."}
                      className="w-full rounded-xl border border-stone-700 bg-stone-900/90 pl-10 pr-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-stone-950 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-amber-500/20"
                  >
                    <Zap className="h-4 w-4" />
                    {isVi ? "Kích Hoạt" : "Activate"}
                  </button>
                </form>

                {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}

                {/* Quick 1-Click Demo Unlock */}
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>{isVi ? "Bạn đang dùng thử nghiệm?" : "Testing mode?"}</span>
                  <button
                    type="button"
                    onClick={handleQuickDemoActivate}
                    className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isVi ? "Mở khóa Pro tức thì (Miễn phí 1-Click)" : "Instant 1-Click Pro Unlock"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
