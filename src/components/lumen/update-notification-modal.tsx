import { useState, useEffect } from "react";
import {
  Rocket,
  Sparkles,
  Download,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { sounds } from "@/lib/audio";
import { useLumen } from "@/lib/store";
import type { AppUpdateInfo } from "@/lib/types";
import { CURRENT_APP_VERSION } from "@/lib/updater";
import { APP_RELEASES, type ReleaseHighlight } from "@/lib/changelog-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UpdateNotificationModalProps {
  updateInfo: AppUpdateInfo | null;
  open: boolean;
  onClose: () => void;
  onSkipVersion?: (version: string) => void;
}

export function UpdateNotificationModal({
  updateInfo,
  open,
  onClose,
  onSkipVersion,
}: UpdateNotificationModalProps) {
  const lang = useLumen((s) => s.lang);
  const isVi = lang === "vi";

  if (!open || !updateInfo) return null;

  // Find matching release metadata from APP_RELEASES or fallback to the latest
  const releaseMeta =
    APP_RELEASES.find((r) => r.version === updateInfo.version) ||
    APP_RELEASES[0];

  const highlights = releaseMeta?.highlights || [];

  const handleOpenDownload = () => {
    sounds.playChime();
    const url =
      updateInfo.downloadUrl ||
      updateInfo.htmlUrl ||
      `https://github.com/datjpro/cliff-clover-moon-tundra/releases/tag/v${updateInfo.version}`;
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleSkip = () => {
    sounds.playPop(400);
    if (onSkipVersion) {
      onSkipVersion(updateInfo.version);
    }
    onClose();
  };

  const getBadgeStyle = (badgeType?: string) => {
    switch (badgeType) {
      case "feat":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "pro":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "ui":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "perf":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "fix":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      default:
        return "bg-white/10 text-[#F4F5F7] border-white/20";
    }
  };

  const getBadgeLabel = (badgeType?: string) => {
    if (isVi) {
      switch (badgeType) {
        case "feat":
          return "MỚI";
        case "pro":
          return "PRO";
        case "ui":
          return "GIAO DIỆN";
        case "perf":
          return "TỐI ƯU";
        case "fix":
          return "SỬA LỖI";
        default:
          return "CẬP NHẬT";
      }
    } else {
      switch (badgeType) {
        case "feat":
          return "NEW";
        case "pro":
          return "PRO";
        case "ui":
          return "UI";
        case "perf":
          return "PERF";
        case "fix":
          return "FIX";
        default:
          return "UPDATE";
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in duration-150"
      onClick={() => {
        sounds.playPop(400);
        onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="interactive-el relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#F5A623]/40 bg-[#161822]/98 text-[#F4F5F7] shadow-[0_30px_90px_rgba(0,0,0,0.95)] animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Glow Radial Highlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-44 rounded-full bg-gradient-to-b from-[#F5A623]/30 via-orange-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/8 bg-[#14161F]/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-[#14161D] flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <Rocket className="size-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isVi ? "Đã Có Bản Cập Nhật Mới!" : "New Update Available!"}
                </h3>
                <span className="rounded-full bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#F5A623] px-2 py-0.2 text-[10px] font-mono font-bold shadow-xs">
                  v{updateInfo.version}
                </span>
              </div>
              <p className="text-[11px] text-[#8B90A0] truncate mt-0.5">
                {isVi
                  ? `Đang chạy: v${CURRENT_APP_VERSION} ➔ Mới nhất: v${updateInfo.version}`
                  : `Currently running: v${CURRENT_APP_VERSION} ➔ Latest: v${updateInfo.version}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playPop(400);
              onClose();
            }}
            className="size-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-[#8B90A0] hover:text-white transition-colors cursor-pointer shrink-0"
            title="Đóng (Escape)"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body: Scrollable highlights */}
        <div className="p-5 space-y-3.5 text-xs overflow-y-auto custom-scrollbar flex-1">
          {/* Release Highlights List */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#F5A623] font-bold text-xs">
              <Sparkles className="size-4 shrink-0" />
              <span>
                {isVi
                  ? `Nội dung cập nhật trong phiên bản v${updateInfo.version}:`
                  : `What's new in release v${updateInfo.version}:`}
              </span>
            </div>

            <div className="space-y-2">
              {highlights.map((h, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#14161D]/80 border border-white/6 hover:border-white/15 transition-all duration-120 flex items-start gap-3 shadow-xs"
                >
                  <span className="text-lg shrink-0 mt-0.5">{h.icon}</span>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs">
                        {isVi ? h.titleVi : h.titleEn}
                      </span>
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded-md border text-[9px] font-bold uppercase tracking-wider font-mono",
                          getBadgeStyle(h.badge),
                        )}
                      >
                        {getBadgeLabel(h.badge)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A0A5B5] leading-relaxed">
                      {isVi ? h.descriptionVi : h.descriptionEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Changelog from GitHub (if extra notes exist) */}
          {updateInfo.body && updateInfo.body.length > 30 && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-semibold text-[#8B90A0] tracking-wider">
                {isVi ? "Ghi chú phát hành từ GitHub:" : "GitHub Release Notes:"}
              </p>
              <div className="max-h-28 overflow-y-auto custom-scrollbar p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10px] text-[#8B90A0] font-mono whitespace-pre-wrap">
                {updateInfo.body}
              </div>
            </div>
          )}

          {/* Safety & Local-First Guarantee */}
          <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-2xl">
            <ShieldCheck className="size-4 shrink-0 text-emerald-400" />
            <span>
              {isVi
                ? "Bản cập nhật hoàn toàn an toàn và tương thích ngược. Toàn bộ ghi chú, lịch trình và dữ liệu của bạn được bảo toàn 100%."
                : "Safe verified update. 100% of your current notes, calendar agenda, and settings are securely preserved."}
            </span>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/8 bg-[#14161F]/90 shrink-0">
          <button
            type="button"
            onClick={handleSkip}
            className="text-[11px] text-[#8B90A0] hover:text-amber-400 transition-colors cursor-pointer underline-offset-4 hover:underline"
          >
            {isVi ? "Bỏ qua phiên bản này" : "Skip this version"}
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                sounds.playPop(400);
                onClose();
              }}
              className="h-8.5 text-xs text-[#8B90A0] hover:text-white px-3.5 rounded-xl cursor-pointer hover:bg-white/10"
            >
              {isVi ? "Nhắc tôi sau" : "Remind Later"}
            </Button>

            <Button
              type="button"
              onClick={handleOpenDownload}
              className="h-8.5 text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-[#14161D] rounded-xl px-4 cursor-pointer shadow-lg shadow-amber-500/20 gap-1.5 transition-transform active:scale-98"
            >
              <Download className="size-3.5 stroke-[2.5]" />
              <span>{isVi ? "Cập nhật ngay" : "Update Now"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
