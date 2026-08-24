import type { PawPrint } from "@/lib/types";

type Props = {
  prints: PawPrint[];
};

export function PawTrail({ prints }: Props) {
  if (!prints.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none">
      {prints.map((p) => (
        <div
          key={p.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
            opacity: p.opacity,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-amber-700/40">
            {/* Main Pad */}
            <ellipse cx="12" cy="15" rx="5" ry="4" fill="currentColor" />
            {/* 4 Toe Pads */}
            <ellipse cx="6" cy="9" rx="2" ry="2.5" fill="currentColor" />
            <ellipse cx="10" cy="6" rx="2" ry="2.5" fill="currentColor" />
            <ellipse cx="14" cy="6" rx="2" ry="2.5" fill="currentColor" />
            <ellipse cx="18" cy="9" rx="2" ry="2.5" fill="currentColor" />
          </svg>
        </div>
      ))}
    </div>
  );
}
