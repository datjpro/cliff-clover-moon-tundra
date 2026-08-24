import { useEffect, useRef, useState } from "react";
import { sounds } from "@/lib/audio";
import { useLumen } from "@/lib/store";

export function BallToy() {
  const pip = useLumen((s) => s.pip);
  const setPip = useLumen((s) => s.setPip);
  const [active, setActive] = useState(false);
  const [ballPos, setBallPos] = useState({ x: 500, y: 300 });

  const ballRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    bounces: number;
    settled: boolean;
  }>({
    x: 500,
    y: 300,
    vx: 0,
    vy: 0,
    bounces: 0,
    settled: false,
  });

  // Listen for ball throw trigger event
  useEffect(() => {
    const handleThrowBall = (e: CustomEvent<{ x: number; y: number }>) => {
      const startX = e.detail?.x || window.innerWidth / 2;
      const startY = e.detail?.y || window.innerHeight / 3;
      const vx = (Math.random() - 0.5) * 16 + 6;
      const vy = -12 - Math.random() * 6;

      ballRef.current = {
        x: startX,
        y: startY,
        vx,
        vy,
        bounces: 0,
        settled: false,
      };
      setBallPos({ x: startX, y: startY });
      setActive(true);
      sounds.playPop(700);

      // Alert pet
      if (pip.enabled) {
        setPip({
          mood: "chasing_ball",
          speech: "Bóng kìa! Pip bắt đây! 🎾",
        });
      }
    };

    window.addEventListener("throw-ball" as unknown as keyof WindowEventMap, handleThrowBall as EventListener);
    return () => window.removeEventListener("throw-ball" as unknown as keyof WindowEventMap, handleThrowBall as EventListener);
  }, [pip.enabled, setPip]);

  // Ball physics loop (Gravity + Bouncing)
  useEffect(() => {
    if (!active) return;
    let raf = 0;

    const tick = () => {
      const b = ballRef.current;
      if (!b.settled) {
        b.vy += 0.8; // Gravity
        b.x += b.vx;
        b.y += b.vy;

        // Ground bounce
        const floorY = window.innerHeight - 60;
        if (b.y >= floorY) {
          b.y = floorY;
          b.vy = -b.vy * 0.65;
          b.vx *= 0.85;
          b.bounces += 1;
          sounds.playPop(300 + b.bounces * 80);
          if (Math.abs(b.vy) < 1.5 && b.bounces > 4) {
            b.settled = true;
          }
        }

        // Wall bounce
        if (b.x <= 30 || b.x >= window.innerWidth - 30) {
          b.vx = -b.vx * 0.7;
          b.x = Math.max(30, Math.min(window.innerWidth - 30, b.x));
        }

        setBallPos({ x: b.x, y: b.y });
      }

      // Check if pet caught the ball
      const pipEl = document.querySelector(".group.fixed") as HTMLElement | null;
      if (pipEl && b.settled) {
        const rect = pipEl.getBoundingClientRect();
        const distToPet = Math.hypot(rect.left + rect.width / 2 - b.x, rect.top + rect.height / 2 - b.y);
        if (distToPet < 60) {
          sounds.playChime();
          useLumen.setState((state) => ({
            pip: {
              ...state.pip,
              mood: "dance",
              happiness: 100,
              speech: "Pip bắt được bóng rồi! Hoan hô! 🎉🎾",
            },
          }));
          setActive(false);
          return;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="interactive-el fixed z-40 size-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-lg animate-spin"
      style={{ left: `${ballPos.x}px`, top: `${ballPos.y}px` }}
    >
      <svg viewBox="0 0 32 32" className="size-full">
        <circle cx="16" cy="16" r="14" fill="#a3e635" stroke="#4d7c0f" strokeWidth="2" />
        <path d="M 6 10 Q 16 16 6 22" fill="none" stroke="#ffffff" strokeWidth="2.5" />
        <path d="M 26 10 Q 16 16 26 22" fill="none" stroke="#ffffff" strokeWidth="2.5" />
      </svg>
    </div>
  );
}

export function triggerThrowBall() {
  window.dispatchEvent(
    new CustomEvent("throw-ball", {
      detail: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 4,
      },
    }),
  );
}
