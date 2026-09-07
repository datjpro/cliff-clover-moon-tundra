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
} from "lucide-react";
import { sounds } from "@/lib/audio";
import { useLumen } from "@/lib/store";
import type { AppUpdateInfo } from "@/lib/types";
import { CURRENT_APP_VERSION } from "@/lib/updater";
import { Button } from "@/components/ui/button";

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm select-none animate-in fade-in duration-150"
      onClick={() => {
        sounds.playPop(400);
        onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="interactive-el relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#F5A623]/40 bg-[#161822]/98 text-[#F4F5F7] shadow-[0_30px_90px_rgba(0,0,0,0.95)] animate-in zoom-in-95 duration-150"
      >
        {/* Glow Radial Highlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-44 rounded-full bg-gradient-to-b from-[#F5A623]/30 via-orange-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/8 bg-[#14161F]/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-[#14161D] flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <Rocket className="size-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isVi ? "Đã Có Bản Cập Nhật Mới!" : "New Update Available!"}
                </h3>
                <span className="rounded-full bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#F5A623] px-2 py-0.2 text-[10px] font-mono font-bold">
                  v{updateInfo.version}
                </span>
              </div>
              <p className="text-[11px] text-[#8B90A0] truncate">
                {isVi
                  ? `Phiên bản hiện tại: v${CURRENT_APP_VERSION} ➔ Mới nhất: v${updateInfo.version}`
                  : `Current: v${CURRENT_APP_VERSION} ➔ Latest: v${updateInfo.version}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playPop(400);
              onClose();
            }}
            className="size-7 rounded-xl hover:bg-white/10 flex items-center justify-center text-[#8B90A0] hover:text-white transition-colors cursor-pointer shrink-0"
            title="Đóng (Escape)"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3.5 text-xs">
          {/* Highlights Banner */}
          <div className="p-3 rounded-2xl bg-[#14161D]/70 border border-white/6 space-y-2">
            <div className="flex items-center gap-2 text-[#F5A623] font-bold text-xs">
              <Sparkles className="size-4 shrink-0" />
              <span>{isVi ? "Những cải tiến nổi bật trong phiên bản này:" : "Highlights in this release:"}</span>
            </div>

            <ul className="space-y-1.5 text-[11px] text-stone-300 pl-1">
              <li className="flex items-start gap-1.5">
                <span className="text-[#F5A623] font-bold">📅</span>
                <span>
                  {isVi
                    ? "Module Lịch Không Gian (Spatial Calendar) độc lập & Widget gắn góc thông minh."
                    : "Dedicated Standalone Spatial Calendar & Corner-Docked Agenda Widget."}
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#F5A623] font-bold">🎯</span>
                <span>
                  {isVi
                    ? "Bộ chọn giờ xoay 24H dạng ống ngắm (Scope Rotary Time Picker) có âm thanh click cơ học."
                    : "Tactical 24H Barrel-Wheel Scope Time Picker with mechanical audio clicks."}
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#F5A623] font-bold">🎁</span>
                <span>
                  {isVi
                    ? "Mã dùng thử Pro 3 ngày: LUMENTRIAL3DAY (Trải nghiệm toàn bộ tính năng 0đ)."
                    : "3-Day Pro Trial pass with code: LUMENTRIAL3DAY."}
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#F5A623] font-bold">🛡️</span>
                <span>
                  {isVi
                    ? "Form thêm việc nhúng in-place chống mất dữ liệu và dọn dẹp sạch sẽ dữ liệu mẫu."
                    : "In-place embedded form preventing data loss & clean empty state."}
                </span>
              </li>
            </ul>
          </div>

          {updateInfo.body && updateInfo.body.length > 30 && (
            <div className="max-h-28 overflow-y-auto custom-scrollbar p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10px] text-[#8B90A0] font-mono whitespace-pre-wrap">
              {updateInfo.body}
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="size-3.5 shrink-0" />
            <span>
              {isVi
                ? "Bản cài đặt an toàn, bảo toàn 100% toàn bộ ghi chú và dữ liệu hiện tại."
                : "Safe verified build. 100% of your current notes and data are preserved."}
            </span>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/8 bg-[#14161F]/90">
          <button
            type="button"
            onClick={handleSkip}
            className="text-[11px] text-[#8B90A0] hover:text-white underline cursor-pointer"
          >
            {isVi ? "Bỏ qua bản này" : "Skip this version"}
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                sounds.playPop(400);
                onClose();
              }}
              className="h-8 text-xs text-[#8B90A0] hover:text-white px-3.5 rounded-xl cursor-pointer"
            >
              {isVi ? "Để sau" : "Later"}
            </Button>

            <Button
              type="button"
              onClick={handleOpenDownload}
              className="h-8 text-xs font-bold bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] rounded-xl px-4 cursor-pointer shadow-md gap-1.5 transition-transform active:scale-98"
            >
              <Download className="size-3.5" />
              <span>{isVi ? "Tải bản cập nhật" : "Download Update"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
