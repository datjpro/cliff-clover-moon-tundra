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

      {/* Solid Opaque Dialog */}
      <form
        className="interactive-el relative z-10 w-full max-w-md rounded-2xl bg-[#1c1917] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-[#44403c] text-white animate-in zoom-in-95 fade-in duration-150"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#38332e] mb-3">
          <p className="font-display text-sm font-bold text-amber-400 flex items-center gap-1.5">
            <Sparkles className="size-4" />
            <span>{dict.quickNote} (Ctrl + Shift + N)</span>
          </p>
          <button
            type="button"
            onClick={() => setCaptureOpen(false)}
            className="p-1 rounded hover:bg-white/10 text-[#a8a29e] hover:text-white cursor-pointer"
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
          className="w-full resize-none rounded-xl bg-[#292524] p-3 text-sm text-white outline-none placeholder:text-[#78716c] border border-[#57534e] focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        />

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[11px] text-[#a8a29e]">Shift + Enter để xuống dòng</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="cursor-pointer text-[#d6d3d1] hover:bg-white/10"
              onClick={() => setCaptureOpen(false)}
            >
              {dict.cancel}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="cursor-pointer bg-amber-500 text-black hover:bg-amber-400 font-bold px-4"
            >
              {dict.save}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
