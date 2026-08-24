import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Cookie, EyeOff, Heart, Moon, Sparkles, StickyNote as NoteIcon, Sun } from "lucide-react";
import { useLumen } from "@/lib/store";
import type { PawPrint } from "@/lib/types";
import { uid } from "@/lib/utils";
import { PawTrail } from "./paw-trail";
import { PipFigure } from "./pip";
import { cn } from "@/lib/utils";

const WELL = { x: 90, y: 70 };
const SPEED = 28; // Smooth, gentle walking speed

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function Companion() {
  const enabled = useLumen((s) => s.pip.enabled);
  const petType = useLumen((s) => s.pip.petType || "fox");
  const mood = useLumen((s) => s.pip.mood);
  const skin = useLumen((s) => s.pip.skin);
  const carrying = useLumen((s) => s.pip.carrying);
  const startX = useLumen((s) => s.pip.x);
  const startY = useLumen((s) => s.pip.y);
  const layout = useLumen((s) => s.layout);
  const lang = useLumen((s) => s.lang);
  const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);
  const feedPip = useLumen((s) => s.feedPip);
  const petPip = useLumen((s) => s.petPip);
  const dancePip = useLumen((s) => s.dancePip);
  const setPip = useLumen((s) => s.setPip);
  const setPipEnabled = useLumen((s) => s.setPipEnabled);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [facingDir, setFacingDir] = useState<1 | -1>(-1);
  const [pawPrints, setPawPrints] = useState<PawPrint[]>([]);

  const elRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: startX, y: startY });
  const lastStepPos = useRef({ x: startX, y: startY });
  const isDragging = useRef(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const target = useRef({
    x: startX,
    y: startY,
    kind: "idle" as "idle" | "well" | "drop" | "nudge" | "dance",
  });
  const waitUntil = useRef(0);
  const movingState = useRef(false);
  const facingState = useRef<1 | -1>(-1);
  const speechRef = useLumen((s) => s.pip.speech);

  useEffect(() => {
    pos.current = { x: startX, y: startY };
  }, [enabled, startX, startY]);

  // Paw prints fade timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setPawPrints((prev) =>
        prev
          .map((p) => ({
            ...p,
            opacity: Math.max(0, p.opacity - 0.08),
          }))
          .filter((p) => p.opacity > 0.05 && now - p.createdAt < 10000),
      );
    }, 600);
    return () => clearInterval(timer);
  }, []);

  // Click outside to dismiss pet menu
  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (elRef.current && !elRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("pointerdown", onClickOutside);
    return () => window.removeEventListener("pointerdown", onClickOutside);
  }, [menuOpen]);

  // Drag pet
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button.action-btn")) return;
    isDragging.current = true;
    const parent = document.body.getBoundingClientRect();
    dragOffset.current = {
      dx: (e.clientX / parent.width) * 100 - pos.current.x,
      dy: (e.clientY / parent.height) * 100 - pos.current.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const parent = document.body.getBoundingClientRect();
    const x = clamp((e.clientX / parent.width) * 100 - dragOffset.current.dx, 2, 96);
    const y = clamp((e.clientY / parent.height) * 100 - dragOffset.current.dy, 4, 92);
    pos.current = { x, y };
    target.current = { x, y, kind: "idle" };
    if (elRef.current) {
      elRef.current.style.left = `${x}%`;
      elRef.current.style.top = `${y}%`;
    }
  };

  const onPointerUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      setPip({ x: pos.current.x, y: pos.current.y, moving: false });
    }
  };

  // High-performance 60fps decoupled animation tick
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = performance.now();

    const applyDom = (x: number, y: number) => {
      const el = elRef.current;
      if (el) {
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const state = useLumen.getState();
      const p = state.pip;

      if (!p.enabled || isDragging.current) {
        raf = requestAnimationFrame(tick);
        return;
      }

      // Wander waypoint selection
      if (
        p.mood === "wander" &&
        now > waitUntil.current &&
        target.current.kind === "idle" &&
        !menuOpen
      ) {
        target.current = {
          x: 6 + Math.random() * 84,
          y: 10 + Math.random() * 74,
          kind: "idle",
        };
        if (p.speech) state.setPip({ speech: null });
      }

      const t = target.current;
      const d = dist(pos.current.x, pos.current.y, t.x, t.y);
      const isMovingNow = d > 0.8 && p.mood !== "sleep" && p.mood !== "eating" && !menuOpen;

      if (isMovingNow) {
        const step = SPEED * dt;
        const k = Math.min(1, step / d);
        pos.current.x += (t.x - pos.current.x) * k;
        pos.current.y += (t.y - pos.current.y) * k;
        const nextFacing: 1 | -1 = t.x >= pos.current.x ? 1 : -1;
        applyDom(pos.current.x, pos.current.y);

        if (!movingState.current) {
          movingState.current = true;
          setIsWalking(true);
        }
        if (facingState.current !== nextFacing) {
          facingState.current = nextFacing;
          setFacingDir(nextFacing);
        }

        // Leave Paw Prints Trail
        const stepDist = dist(pos.current.x, pos.current.y, lastStepPos.current.x, lastStepPos.current.y);
        if (stepDist > 3.2) {
          lastStepPos.current = { x: pos.current.x, y: pos.current.y };
          const rot = (Math.atan2(t.y - pos.current.y, t.x - pos.current.x) * 180) / Math.PI + 90;
          setPawPrints((prev) => [
            ...prev.slice(-24),
            {
              id: uid(),
              x: pos.current.x,
              y: pos.current.y + 3.8,
              rot,
              opacity: 0.65,
              createdAt: Date.now(),
            },
          ]);
        }
      } else {
        applyDom(pos.current.x, pos.current.y);

        if (movingState.current) {
          movingState.current = false;
          setIsWalking(false);
        }

        if (p.mood === "fetch" && t.kind === "well") {
          const drop = {
            x: layout === "sidebar" ? 58 : 12 + Math.random() * 68,
            y: 14 + Math.random() * 60,
          };
          target.current = { ...drop, kind: "drop" };
          state.setPip({
            mood: "deliver",
            carrying: true,
            moving: true,
            speech: lang === "vi" ? "Pip lấy được giấy rồi! Đang mang đến..." : "Got one! Bringing it over...",
            x: pos.current.x,
            y: pos.current.y,
          });
        } else if (p.mood === "deliver" && t.kind === "drop") {
          state.addNote({
            x: clamp(pos.current.x - 6, 4, 82),
            y: clamp(pos.current.y - 8, 6, 78),
            tint: "cream",
            rot: (Math.random() - 0.5) * 4,
            body: lang === "vi" ? "Từ Pip — ghi lại ý tưởng mới tại đây ✨" : "From Pip — write your next big idea here ✨",
          });
          waitUntil.current = now + 2400;
          target.current = { x: pos.current.x, y: pos.current.y, kind: "idle" };
          state.setPip({
            mood: "wander",
            carrying: false,
            moving: false,
            speech: lang === "vi" ? "Giấy của bạn đây! ✨" : "Here you go! ✨",
            x: pos.current.x,
            y: pos.current.y,
          });
        } else {
          if (!isMovingNow && waitUntil.current <= now) {
            waitUntil.current = now + 2000 + Math.random() * 3000;
            target.current = { x: pos.current.x, y: pos.current.y, kind: "idle" };
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    applyDom(pos.current.x, pos.current.y);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, layout, menuOpen, lang]);

  if (!enabled) return null;

  return (
    <>
      {/* Paw Prints Trail on Screen */}
      <PawTrail prints={pawPrints} />

      <div
        ref={elRef}
        className="interactive-el group absolute z-50 -translate-x-1/2 -translate-y-1/2 p-0 select-none cursor-grab active:cursor-grabbing will-change-transform"
        style={{ left: `${startX}%`, top: `${startY}%` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Speech Bubble */}
        {speechRef ? (
          <span
            className={cn(
              "animate-in fade-in zoom-in-90 absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-elevated/95 px-3.5 py-1 text-[11px] font-semibold text-fg shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-1 ring-border transition-all duration-200 pointer-events-none",
              menuOpen ? "-top-24" : "-top-11",
            )}
          >
            {speechRef}
            <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-elevated" />
          </span>
        ) : null}

        {/* Floating Pet Interaction Quick Toolbar */}
        {menuOpen ? (
          <div className="animate-in fade-in zoom-in-95 absolute -top-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-surface/95 p-1 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.35)] ring-1 ring-border">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                petPip();
              }}
              title="Xoa đầu (Pet)"
              className="action-btn flex size-7 items-center justify-center rounded-full text-rose-400 hover:bg-elevated hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <Heart className="size-3.5 fill-rose-400/30" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                feedPip();
              }}
              title="Cho ăn dâu (Feed)"
              className="action-btn flex size-7 items-center justify-center rounded-full text-amber-400 hover:bg-elevated hover:scale-110 active:scale-95 transition-all cursor-pointer"
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
              title="Lấy giấy ghi chú (Fetch Note)"
              className="action-btn flex size-7 items-center justify-center rounded-full text-emerald-400 hover:bg-elevated hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <NoteIcon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dancePip();
              }}
              title="Nhảy múa (Dance)"
              className="action-btn flex size-7 items-center justify-center rounded-full text-indigo-400 hover:bg-elevated hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPip({ mood: mood === "sleep" ? "wander" : "sleep" });
              }}
              title={mood === "sleep" ? "Đánh thức" : "Ngủ (Sleep)"}
              className="action-btn flex size-7 items-center justify-center rounded-full text-blue-400 hover:bg-elevated hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              {mood === "sleep" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>
            {/* Hide Pet Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPipEnabled(false);
              }}
              title="Ẩn thú cưng (Hide Pet)"
              className="action-btn flex size-7 items-center justify-center rounded-full text-muted hover:bg-red-500/20 hover:text-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <EyeOff className="size-3.5" />
            </button>
          </div>
        ) : null}

        {/* Pet Avatar Component */}
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing bg-transparent p-0 transition-transform active:scale-90 hover:scale-105"
          onClick={() => setMenuOpen(!menuOpen)}
          onDoubleClick={() => petPip()}
          aria-label="Pet companion"
        >
          <PipFigure
            walking={isWalking}
            carrying={carrying}
            facing={facingDir}
            mood={mood}
            petType={petType}
            skin={skin}
          />
        </button>
      </div>
    </>
  );
}
