import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Cookie, EyeOff, Heart, Moon, Sparkles, StickyNote as NoteIcon, Sun } from "lucide-react";
import { useLumen } from "@/lib/store";
import type { PawPrint } from "@/lib/types";
import { uid } from "@/lib/utils";
import { triggerThrowBall } from "./ball-toy";
import { PawTrail } from "./paw-trail";
import { PipFigure } from "./pip";
import { cn } from "@/lib/utils";

const SPEED = 55; // Pixels per second

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
  const hat = useLumen((s) => s.pip.hat || "none");
  const bodyItem = useLumen((s) => s.pip.bodyItem || "backpack");
  const carrying = useLumen((s) => s.pip.carrying);
  const startXPercent = useLumen((s) => s.pip.x);
  const startYPercent = useLumen((s) => s.pip.y);
  const layout = useLumen((s) => s.layout);
  const lang = useLumen((s) => s.lang);
  const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);
  const feedPip = useLumen((s) => s.feedPip);
  const petPip = useLumen((s) => s.petPip);
  const dancePip = useLumen((s) => s.dancePip);
  const setPip = useLumen((s) => s.setPip);
  const setPipEnabled = useLumen((s) => s.setPipEnabled);
  const activeAlarm = useLumen((s) => s.activeAlarm);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [facingDir, setFacingDir] = useState<1 | -1>(-1);
  const [stridePhase, setStridePhase] = useState(0);
  const [pawPrints, setPawPrints] = useState<PawPrint[]>([]);

  const elRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 400, y: 300 });
  const lastStepPos = useRef({ x: 400, y: 300 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const target = useRef({
    x: 400,
    y: 300,
    kind: "idle" as "idle" | "well" | "drop" | "nudge" | "dance" | "ball",
  });
  const waitUntil = useRef(0);
  const movingState = useRef(false);
  const facingState = useRef<1 | -1>(-1);
  const walkPhaseAcc = useRef(0);
  const speechRef = useLumen((s) => s.pip.speech);

  // Initialize pixel positions from window size
  useEffect(() => {
    if (typeof window === "undefined") return;
    const px = (window.innerWidth * startXPercent) / 100;
    const py = (window.innerHeight * startYPercent) / 100;
    pos.current = { x: px, y: py };
    target.current = { x: px, y: py, kind: "idle" };
    lastStepPos.current = { x: px, y: py };
    if (elRef.current) {
      elRef.current.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    }
  }, [startXPercent, startYPercent, enabled]);

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

  // Drag pet directly on screen
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button.action-btn")) return;
    isDragging.current = true;
    dragOffset.current = {
      dx: e.clientX - pos.current.x,
      dy: e.clientY - pos.current.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const x = clamp(e.clientX - dragOffset.current.dx, 10, window.innerWidth - 90);
    const y = clamp(e.clientY - dragOffset.current.dy, 10, window.innerHeight - 90);
    pos.current = { x, y };
    target.current = { x, y, kind: "idle" };
    if (elRef.current) {
      elRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  };

  const onPointerUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      const xPercent = (pos.current.x / window.innerWidth) * 100;
      const yPercent = (pos.current.y / window.innerHeight) * 100;
      setPip({ x: xPercent, y: yPercent, moving: false });
    }
  };

  // Pure 120 FPS GPU Transform Animation Loop
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = performance.now();
    let lastUiSync = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const state = useLumen.getState();
      const p = state.pip;

      if (!p.enabled || isDragging.current) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const scrW = window.innerWidth;
      const scrH = window.innerHeight;

      // Handle ball chasing
      if (p.mood === "chasing_ball") {
        const ballEl = document.querySelector(".animate-spin") as HTMLElement | null;
        if (ballEl) {
          const ballRect = ballEl.getBoundingClientRect();
          target.current = {
            x: ballRect.left,
            y: ballRect.top,
            kind: "ball",
          };
        }
      }

      // Select next wander destination
      if (
        p.mood === "wander" &&
        now > waitUntil.current &&
        target.current.kind === "idle" &&
        !menuOpen
      ) {
        target.current = {
          x: 60 + Math.random() * (scrW - 160),
          y: 60 + Math.random() * (scrH - 180),
          kind: "idle",
        };
        if (p.speech) state.setPip({ speech: null });
      }

      const t = target.current;
      const d = dist(pos.current.x, pos.current.y, t.x, t.y);
      const isMovingNow = d > 2 && p.mood !== "sleep" && p.mood !== "eating" && !menuOpen;
      const currentSpeed = p.mood === "chasing_ball" ? SPEED * 1.8 : SPEED;

      if (isMovingNow) {
        const step = currentSpeed * dt;
        const k = Math.min(1, step / d);
        const prevX = pos.current.x;
        const prevY = pos.current.y;
        pos.current.x += (t.x - pos.current.x) * k;
        pos.current.y += (t.y - pos.current.y) * k;
        const actualStep = dist(prevX, prevY, pos.current.x, pos.current.y);

        walkPhaseAcc.current += actualStep * 0.18;

        const nextFacing: 1 | -1 = t.x >= pos.current.x ? 1 : -1;

        if (elRef.current) {
          elRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
        }

        if (now - lastUiSync > 33) {
          lastUiSync = now;
          setStridePhase(walkPhaseAcc.current);
          if (!movingState.current) {
            movingState.current = true;
            setIsWalking(true);
          }
          if (facingState.current !== nextFacing) {
            facingState.current = nextFacing;
            setFacingDir(nextFacing);
          }
        }

        // Spawn Paw Prints Trail
        const stepDist = dist(pos.current.x, pos.current.y, lastStepPos.current.x, lastStepPos.current.y);
        if (stepDist > 36) {
          lastStepPos.current = { x: pos.current.x, y: pos.current.y };
          const rot = (Math.atan2(t.y - pos.current.y, t.x - pos.current.x) * 180) / Math.PI + 90;
          const xPct = (pos.current.x / scrW) * 100;
          const yPct = ((pos.current.y + 40) / scrH) * 100;
          setPawPrints((prev) => [
            ...prev.slice(-20),
            {
              id: uid(),
              x: xPct,
              y: yPct,
              rot,
              opacity: 0.65,
              createdAt: Date.now(),
            },
          ]);
        }
      } else {
        if (elRef.current) {
          elRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
        }

        if (movingState.current) {
          movingState.current = false;
          setIsWalking(false);
          setStridePhase(0);
        }

        if (p.mood === "fetch" && t.kind === "well") {
          target.current = {
            x: 80 + Math.random() * (scrW - 200),
            y: 80 + Math.random() * (scrH - 240),
            kind: "drop",
          };
          state.setPip({
            mood: "deliver",
            carrying: true,
            moving: true,
            speech: lang === "vi" ? "Pip lấy được giấy rồi! Đang mang đến..." : "Got one! Bringing it over...",
          });
        } else if (p.mood === "deliver" && t.kind === "drop") {
          const noteXPct = (pos.current.x / scrW) * 100;
          const noteYPct = (pos.current.y / scrH) * 100;
          state.addNote({
            x: clamp(noteXPct - 5, 4, 82),
            y: clamp(noteYPct - 5, 6, 78),
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
          });
        } else {
          if (!isMovingNow && waitUntil.current <= now) {
            waitUntil.current = now + 2000 + Math.random() * 3200;
            target.current = { x: pos.current.x, y: pos.current.y, kind: "idle" };
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, layout, menuOpen, lang]);

  if (!enabled) return null;

  return (
    <>
      <PawTrail prints={pawPrints} />

      <div
        ref={elRef}
        className="interactive-el group fixed top-0 left-0 z-50 p-0 select-none cursor-grab active:cursor-grabbing will-change-transform touch-none !transition-none"
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

        {/* Floating Pet Interaction Toolbar */}
        {menuOpen ? (
          <div className="animate-in fade-in zoom-in-95 absolute -top-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#1c1917]/95 p-1 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.45)] border border-[#44403c]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                petPip();
              }}
              title="Xoa đầu (Pet)"
              className="action-btn flex size-7 items-center justify-center rounded-full text-rose-400 hover:bg-white/10 hover:scale-110 active:scale-95 transition-all cursor-pointer"
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
              className="action-btn flex size-7 items-center justify-center rounded-full text-amber-400 hover:bg-white/10 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <Cookie className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerThrowBall();
                setMenuOpen(false);
              }}
              title="Ném bóng chơi (Throw Ball 🎾)"
              className="action-btn flex size-7 items-center justify-center rounded-full text-lime-400 hover:bg-white/10 hover:scale-110 active:scale-95 transition-all cursor-pointer text-xs"
            >
              🎾
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                requestNoteFromPip();
                setMenuOpen(false);
              }}
              title="Lấy giấy ghi chú (Fetch Note)"
              className="action-btn flex size-7 items-center justify-center rounded-full text-emerald-400 hover:bg-white/10 hover:scale-110 active:scale-95 transition-all cursor-pointer"
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
              className="action-btn flex size-7 items-center justify-center rounded-full text-indigo-400 hover:bg-white/10 hover:scale-110 active:scale-95 transition-all cursor-pointer"
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
              className="action-btn flex size-7 items-center justify-center rounded-full text-blue-400 hover:bg-white/10 hover:scale-110 active:scale-95 transition-all cursor-pointer"
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

        {/* Pet Avatar Component with Mathematical Stride & Accessories */}
        <button
          type="button"
          className={cn(
            "cursor-grab active:cursor-grabbing bg-transparent p-0 transition-transform active:scale-90 hover:scale-105 rounded-full",
            activeAlarm && "pip-timer-alarm ring-4 ring-[#F5A623] shadow-[0_0_25px_rgba(245,166,35,0.7)]",
          )}
          onClick={() => setMenuOpen(!menuOpen)}
          onDoubleClick={() => petPip()}
          aria-label="Pet companion"
        >
          <PipFigure
            walking={isWalking}
            walkPhase={stridePhase}
            carrying={carrying}
            facing={facingDir}
            mood={mood}
            petType={petType}
            skin={skin}
            hat={hat}
            bodyItem={bodyItem}
          />
        </button>
      </div>
    </>
  );
}
