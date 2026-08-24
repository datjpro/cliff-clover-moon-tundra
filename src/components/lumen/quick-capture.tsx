import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLumen } from "@/lib/store";

export function QuickCapture() {
  const open = useLumen((s) => s.captureOpen);
  const setCaptureOpen = useLumen((s) => s.setCaptureOpen);
  const addNote = useLumen((s) => s.addNote);
  const [body, setBody] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setBody("");
      const t = window.setTimeout(() => ref.current?.focus(), 40);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  const save = () => {
    const text = body.trim();
    if (text) addNote({ body: text, x: 30 + Math.random() * 20, y: 24, tint: "cream" });
    setCaptureOpen(false);
  };

  return (
    <div className="absolute inset-0 z-[75] flex items-start justify-center px-4 pt-[18vh] sm:pt-[22vh]">
      <button
        type="button"
        className="absolute inset-0 bg-bg/40"
        aria-label="Dismiss capture"
        onClick={() => setCaptureOpen(false)}
      />
      <form
        className="relative w-full max-w-md rounded-xl bg-surface p-4 shadow-[var(--shadow-float)]"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <p className="mb-2 font-display text-base font-medium">Quick note</p>
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
          placeholder="Type and press Enter"
          className="w-full resize-none rounded-md bg-elevated px-3 py-2 text-sm text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-accent/60"
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[11px] text-subtle">Shift + Enter for a new line</p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setCaptureOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
