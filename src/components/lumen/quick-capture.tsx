import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DICTIONARY } from "@/lib/i18n";
import { useLumen } from "@/lib/store";
import { sounds } from "@/lib/audio";
import { Sparkles, X } from "lucide-react";

export function QuickCapture() {
  const lang = useLumen((s) => s.lang);
  const dict = DICTIONARY[lang];
  const open = useLumen((s) => s.captureOpen);
  const setCaptureOpen = useLumen((s) => s.setCaptureOpen);
  const addNote = useLumen((s) => s.addNote);
  const [body, setBody] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setBody("");
      sounds.playPop(620);
      const t = window.setTimeout(() => ref.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  const save = () => {
    const text = body.trim();
    if (text) {
      addNote({
        body: text,
        x: 35 + Math.random() * 15,
        y: 28 + Math.random() * 15,
        tint: "cream",
      });
    }
    setCaptureOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        aria-label={dict.close}
        onClick={() => setCaptureOpen(false)}
      />

      {/* Frosted Dialog */}
      <form
        className="interactive-el relative z-10 w-full max-w-md rounded-2xl bg-[#1D2029]/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.8)] border border-white/10 text-[#F4F5F7] backdrop-blur-2xl animate-in zoom-in-95 fade-in duration-140"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-white/6 mb-3">
          <p className="font-semibold text-xs text-[#F5A623] flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="size-3.5" />
            <span>Ghi chú nhanh (Alt + N)</span>
          </p>
          <button
            type="button"
            onClick={() => setCaptureOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <textarea
          ref={ref}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              save();
            }
          }}
          rows={4}
          placeholder="Nhập nội dung ghi chú nhanh... (Bấm Enter để lưu)"
          className="w-full resize-none rounded-xl bg-[#14161D] p-3 text-xs text-[#F4F5F7] outline-none placeholder:text-[#8B90A0]/50 border border-white/6 focus:border-[#F5A623]/50 focus:ring-1 focus:ring-[#F5A623]/50 transition-all duration-120 cursor-text select-text touch-auto caret-[#F5A623]"
        />

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[11px] text-[#8B90A0]">Shift + Enter để xuống dòng</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="cursor-pointer text-[#8B90A0] hover:text-white hover:bg-white/10 text-xs rounded-xl"
              onClick={() => setCaptureOpen(false)}
            >
              {dict.cancel}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="cursor-pointer bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] font-bold px-4 text-xs rounded-xl shadow-xs transition-colors"
            >
              {dict.save}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
