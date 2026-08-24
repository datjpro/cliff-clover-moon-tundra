import { Button } from "@/components/ui/button";
import { useLumen } from "@/lib/store";
import { X } from "lucide-react";

export function Onboarding() {
  const open = useLumen((s) => s.onboarding);
  const lang = useLumen((s) => s.lang);
  const dismiss = useLumen((s) => s.dismissOnboarding);
  const setPipEnabled = useLumen((s) => s.setPipEnabled);
  const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);

  if (!open) return null;

  const isVi = lang === "vi";

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 select-none">
      {/* Dimmed backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        aria-label="Đóng"
        onClick={dismiss}
      />

      {/* Solid Opaque Dialog Card (Nền đặc không trong suốt) */}
      <div className="interactive-el relative z-10 w-full max-w-md rounded-2xl bg-[#1c1917] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-[#44403c] text-[#f5f5f4] animate-in zoom-in-95 fade-in duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-[#38332e] mb-3">
          <p className="font-display text-base font-bold text-amber-400 flex items-center gap-1.5">
            <span>🦊</span>
            <span>Chào mừng đến với Lumen Desktop</span>
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="p-1 rounded hover:bg-white/10 text-[#a8a29e] hover:text-white cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-xs leading-relaxed text-[#d6d3d1]">
          {isVi
            ? "Lớp phủ màn hình trong suốt, tự do ghim giấy note 3D, đặt giờ thông minh (như xây nhà trong COC) và nuôi thú cưng dạo bước trên Desktop."
            : "A transparent desktop overlay workspace with 3D sticky notes, smart countdown timers, and roaming virtual pet companions."}
        </p>

        <ol className="mt-4 space-y-2.5 text-xs text-[#f5f5f4]">
          <li className="flex gap-2.5 items-start">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold">
              1
            </span>
            <span>
              {isVi
                ? "Nhấp đúp chuột vào màn hình (hoặc Ctrl+Shift+N) để tạo nhanh ghi chú dán."
                : "Double-click desktop wallpaper (or Ctrl+Shift+N) to spawn sticky notes."}
            </span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold">
              2
            </span>
            <span>
              {isVi
                ? "Đặt giờ thông minh: Bấm Ctrl+Shift+T (ví dụ: xây nhà trong COC : 2g14p) để đếm ngược nổi."
                : "Smart timers: Press Ctrl+Shift+T to start game countdown timers with alarm bell."}
            </span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold">
              3
            </span>
            <span>
              {isVi
                ? "Tương tác với Thú cưng: Nhấp vào chú Cáo để cho ăn, xoa đầu, đổi mũ hoặc ném bóng 🎾."
                : "Interact with Pip: Pet, feed snacks, customize hats, or throw a toy ball 🎾."}
            </span>
          </li>
        </ol>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1 cursor-pointer bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs"
            onClick={() => {
              setPipEnabled(true);
              dismiss();
              window.setTimeout(() => requestNoteFromPip(), 400);
            }}
          >
            {isVi ? "Bắt đầu cùng chú Cáo 🦊" : "Start with Pip"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 cursor-pointer border-[#57534e] text-xs text-[#d6d3d1] hover:bg-white/10"
            onClick={dismiss}
          >
            {isVi ? "Tôi tự khám phá ✨" : "I will explore"}
          </Button>
        </div>
      </div>
    </div>
  );
}
