import { useEffect, useRef, useState } from "react";
import { Cookie, Heart, Sparkles, StickyNote as NoteIcon } from "lucide-react";
import { useLumen } from "@/lib/store";
import { PipFigure } from "./pip";

const WELL = { x: 86, y: 62 };
const SPEED = 38;

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function Companion() {
  const enabled = useLumen((s) => s.pip.enabled);
  const mood = useLumen((s) => s.pip.mood);
  const skin = useLumen((s) => s.pip.skin);
  const carrying = useLumen((s) => s.pip.carrying);
  const facing = useLumen((s) => s.pip.facing);
  const moving = useLumen((s) => s.pip.moving);
  const speech = useLumen((s) => s.pip.speech);
  const startX = useLumen((s) => s.pip.x);
  const startY = useLumen((s) => s.pip.y);
  const layout = useLumen((s) => s.layout);
  const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);
  const feedPip = useLumen((s) => s.feedPip);
  const petPip = useLumen((s) => s.petPip);
  const dancePip = useLumen((s) => s.dancePip);

  const [menuOpen, setMenuOpen] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: startX, y: startY });
  const target = useRef({
    x: startX,
    y: startY,
    kind: "idle" as "idle" | "well" | "drop" | "nudge" | "dance",
  });
  const waitUntil = useRef(0);
  const lastMood = useRef(mood);

  useEffect(() => {
    pos.current = { x: startX, y: startY };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const applyDom = (x: number, y: number) => {
      const el = elRef.current;
      if (el) {
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const state = useLumen.getState();
      const p = state.pip;
      if (!p.enabled) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (p.mood !== lastMood.current) {
        lastMood.current = p.mood;
        if (p.mood === "fetch") target.current = { ...WELL, kind: "well" };
        if (p.mood === "nudge") target.current = { x: 78, y: 14, kind: "nudge" };
        if (p.mood === "dance" || p.mood === "eating") {
          waitUntil.current = now + 3000;
          setTimeout(() => {
            if (useLumen.getState().pip.mood === p.mood) {
              useLumen.getState().setPip({ mood: "wander", speech: null });
            }
          }, 3200);
        }
      }

      if (reduced) {
        if (p.mood === "fetch" || p.mood === "deliver") {
          state.addNote({
            x: clamp(pos.current.x - 8, 6, 70),
            y: clamp(pos.current.y - 10, 8, 55),
            tint: "cream",
            rot: (Math.random() - 0.5) * 3,
            body: "From Pip — write here.",
          });
          state.setPip({
            mood: "idle",
            carrying: false,
            moving: false,
            speech: "Here.",
            x: pos.current.x,
            y: pos.current.y,
          });
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      if (
        p.mood === "wander" &&
        now > waitUntil.current &&
        target.current.kind === "idle" &&
        !menuOpen
      ) {
        target.current = {
          x: 8 + Math.random() * 70,
          y: 18 + Math.random() * 48,
          kind: "idle",
        };
        if (p.speech) state.setPip({ speech: null });
      }

      const t = target.current;
      const d = dist(pos.current.x, pos.current.y, t.x, t.y);
      const isMoving = d > 1.15 && p.mood !== "sleep" && p.mood !== "eating" && !menuOpen;

      if (isMoving) {
        const step = SPEED * dt;
        const k = Math.min(1, step / d);
        pos.current.x += (t.x - pos.current.x) * k;
        pos.current.y += (t.y - pos.current.y) * k;
        const nextFacing: 1 | -1 = t.x >= pos.current.x ? 1 : -1;
        applyDom(pos.current.x, pos.current.y);
        if (!p.moving || p.facing !== nextFacing) {
          state.setPip({ moving: true, facing: nextFacing });
        }
      } else {
        applyDom(pos.current.x, pos.current.y);
        if (p.mood === "fetch" && t.kind === "well") {
          const drop = {
            x: layout === "sidebar" ? 58 : 18 + Math.random() * 40,
            y: 16 + Math.random() * 28,
          };
          target.current = { ...drop, kind: "drop" };
          state.setPip({
            mood: "deliver",
            carrying: true,
            moving: true,
            speech: "Got one! Bringing it over...",
            x: pos.current.x,
            y: pos.current.y,
          });
        } else if (p.mood === "deliver" && t.kind === "drop") {
          state.addNote({
            x: clamp(pos.current.x - 6, 4, 72),
            y: clamp(pos.current.y - 8, 6, 52),
            tint: "cream",
            rot: (Math.random() - 0.5) * 4,
            body: "From Pip — write your next big idea here ✨",
          });
          waitUntil.current = now + 2400;
          target.current = { x: pos.current.x, y: pos.current.y, kind: "idle" };
          state.setPip({
            mood: "wander",
            carrying: false,
            moving: false,
            speech: "Here you go! ✨",
            x: pos.current.x,
            y: pos.current.y,
          });
        } else if (p.mood === "nudge" && t.kind === "nudge") {
          waitUntil.current = now + 2200;
          target.current = { x: pos.current.x, y: pos.current.y, kind: "idle" };
          state.setPip({
            mood: "wander",
            moving: false,
            speech: null,
            x: pos.current.x,
            y: pos.current.y,
          });
        } else {
          if (p.moving) {
            waitUntil.current = now + 1600 + Math.random() * 2600;
            target.current = { x: pos.current.x, y: pos.current.y, kind: "idle" };
            state.setPip({ moving: false, x: pos.current.x, y: pos.current.y });
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    applyDom(pos.current.x, pos.current.y);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, layout, menuOpen]);

  if (!enabled) return null;

  return (
    <div
      ref={elRef}
      className="group absolute z-50 -translate-x-1/2 -translate-y-1/2 p-0 select-none"
      style={{ left: `${startX}%`, top: `${startY}%` }}
    >
      {/* Speech Bubble */}
      {speech ? (
        <span className="animate-in fade-in zoom-in-90 absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-elevated/95 px-3 py-1 text-[11px] font-medium text-fg shadow-[var(--shadow-float)] ring-1 ring-fg/10">
          {speech}
        </span>
      ) : null}

      {/* Floating Pet Interaction Quick Toolbar */}
      {menuOpen ? (
        <div className="animate-in fade-in zoom-in-95 absolute -top-12 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-surface/90 p-1 backdrop-blur-md shadow-[var(--shadow-float)] ring-1 ring-border">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              petPip();
            }}
            title="Pet Pip"
            className="flex size-7 items-center justify-center rounded-full text-rose-400 hover:bg-elevated hover:scale-110 active:scale-95 transition-all"
          >
            <Heart className="size-3.5 fill-rose-400/30" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              feedPip();
            }}
            title="Feed Berry Snack"
            className="flex size-7 items-center justify-center rounded-full text-amber-400 hover:bg-elevated hover:scale-110 active:scale-95 transition-all"
          >
            <Cookie className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              requestNoteFromPip();
              setMenuOpen(false);
            }}
            title="Ask Pip for Note"
            className="flex size-7 items-center justify-center rounded-full text-emerald-400 hover:bg-elevated hover:scale-110 active:scale-95 transition-all"
          >
            <NoteIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dancePip();
            }}
            title="Dance Party"
            className="flex size-7 items-center justify-center rounded-full text-indigo-400 hover:bg-elevated hover:scale-110 active:scale-95 transition-all"
          >
            <Sparkles className="size-3.5" />
          </button>
        </div>
      ) : null}

      {/* Pip Main Interactive Trigger */}
      <button
        type="button"
        className="cursor-pointer bg-transparent p-0 transition-transform active:scale-90 hover:scale-105"
        onClick={() => setMenuOpen(!menuOpen)}
        onDoubleClick={() => petPip()}
        aria-label="Pip companion, click to interact or double click to pet"
      >
        <PipFigure
          walking={moving}
          carrying={carrying}
          facing={facing}
          mood={mood}
          skin={skin}
        />
      </button>
    </div>
  );
}
