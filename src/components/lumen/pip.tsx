import { cn } from "@/lib/utils";

type PipProps = {
  walking: boolean;
  carrying: boolean;
  facing: 1 | -1;
  className?: string;
};

export function PipFigure({ walking, carrying, facing, className }: PipProps) {
  return (
    <div
      className={cn("relative h-16 w-16 sm:h-20 sm:w-20", className)}
      style={{ transform: `scaleX(${facing})` }}
    >
      <svg viewBox="0 0 80 80" className="h-full w-full overflow-visible" aria-hidden>
        <ellipse cx="40" cy="72" rx="16" ry="4" fill="currentColor" className="text-fg/15" />
        <g className={walking ? "pip-walk-body" : "pip-bob"}>
          <g className="pip-tail">
            <ellipse cx="18" cy="46" rx="8" ry="6" fill="var(--pip-shade)" />
          </g>
          <ellipse cx="28" cy="22" rx="7" ry="9" fill="var(--pip-body)" />
          <ellipse cx="52" cy="22" rx="7" ry="9" fill="var(--pip-body)" />
          <ellipse cx="28" cy="22" rx="4" ry="5.5" fill="var(--pip-shade)" />
          <circle cx="40" cy="42" r="20" fill="var(--pip-body)" />
          <ellipse cx="40" cy="48" rx="13" ry="11" fill="var(--pip-shade)" opacity="0.55" />
          <g className="pip-blink">
            <circle cx="33" cy="40" r="2.2" fill="var(--pip-eye)" />
            <circle cx="47" cy="40" r="2.2" fill="var(--pip-eye)" />
            <circle cx="33.7" cy="39.3" r="0.7" fill="var(--pip-body)" />
            <circle cx="47.7" cy="39.3" r="0.7" fill="var(--pip-body)" />
          </g>
          <ellipse cx="40" cy="46.5" rx="2.2" ry="1.4" fill="var(--pip-eye)" opacity="0.55" />
        </g>
        <g className={walking ? "pip-leg-l" : undefined} style={{ transformOrigin: "32px 62px" }}>
          <rect x="29" y="60" width="5" height="10" rx="2.5" fill="var(--pip-shade)" />
        </g>
        <g className={walking ? "pip-leg-r" : undefined} style={{ transformOrigin: "48px 62px" }}>
          <rect x="46" y="60" width="5" height="10" rx="2.5" fill="var(--pip-shade)" />
        </g>
        {carrying ? (
          <g transform="translate(50 34) rotate(8)">
            <rect x="0" y="0" width="18" height="16" rx="2" fill="var(--note-cream)" />
            <rect x="0" y="0" width="18" height="16" rx="2" fill="none" stroke="var(--pip-eye)" strokeOpacity="0.12" />
            <path d="M3 5h12M3 8h9M3 11h11" stroke="var(--pip-eye)" strokeOpacity="0.35" strokeWidth="1" />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
