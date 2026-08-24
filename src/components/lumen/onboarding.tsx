import { Button } from "@/components/ui/button";
import { useLumen } from "@/lib/store";

export function Onboarding() {
  const open = useLumen((s) => s.onboarding);
  const lang = useLumen((s) => s.lang);
  const dismiss = useLumen((s) => s.dismissOnboarding);
  const setPipEnabled = useLumen((s) => s.setPipEnabled);
  const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);

  if (!open) return null;

  const isVi = lang === "vi";

  return (
    <div className="absolute inset-0 z-[85] flex items-center justify-center bg-bg/50 px-4 select-none">
      <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-[var(--shadow-float)] ring-1 ring-border">
        <p className="font-display text-2xl font-medium tracking-tight text-fg">Lumen</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {isVi
            ? "Bàn làm việc không gian yên tĩnh. Ghi chú có thể ghim, thu nhỏ góc màn hình. Người bạn nhỏ Pip sẽ mang giấy đến mỗi khi bạn cần."
            : "A quiet desk. Notes you can pin and minimize. A small companion who will walk over with paper when you ask."}
        </p>
        <ol className="mt-5 space-y-3 text-sm text-fg">
          <li className="flex gap-3">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-elevated text-xs font-medium tabular-nums">
              1
            </span>
            {isVi
              ? "Kéo thả giấy ghi chú. Đổi màu hoặc bấm nút thu nhỏ để ghim góc màn hình."
              : "Drag a sticky note. Change tint or click minimize to pin in screen corner."}
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-elevated text-xs font-medium tabular-nums">
              2
            </span>
            {isVi
              ? "Mở Hub cài đặt: Đổi tiếng Việt / Tiếng Anh, bật Luôn trên cùng (Always on top), đổi 4 bộ giao diện."
              : "Open the hub from the tray: Switch languages, enable Always-on-top, customize themes."}
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-elevated text-xs font-medium tabular-nums">
              3
            </span>
            {isVi
              ? "Nhấp vào Pip: Cho ăn bánh dâu, xoa đầu và nhờ Pip lấy giấy note mới."
              : "Click Pip: Feed berries, pet, dance party, or ask Pip to fetch a fresh note."}
          </li>
        </ol>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1 cursor-pointer"
            onClick={() => {
              setPipEnabled(true);
              dismiss();
              window.setTimeout(() => requestNoteFromPip(), 400);
            }}
          >
            {isVi ? "Nhờ Pip mang giấy note" : "Let Pip bring a note"}
          </Button>
          <Button variant="secondary" className="flex-1 cursor-pointer" onClick={dismiss}>
            {isVi ? "Tôi tự khám phá" : "I will look around"}
          </Button>
        </div>
      </div>
    </div>
  );
}
