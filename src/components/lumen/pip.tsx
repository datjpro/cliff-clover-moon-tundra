import { PET_SKINS } from "@/lib/store";
import type { PetSkin, PipMood } from "@/lib/types";
import { cn } from "@/lib/utils";

type PipProps = {
  walking: boolean;
  carrying: boolean;
  facing: 1 | -1;
  mood?: PipMood;
  skin?: PetSkin;
  className?: string;
};

export function PipFigure({
  walking,
  carrying,
  facing,
  mood = "idle",
  skin = "classic",
  className,
}: PipProps) {
  const currentSkin = PET_SKINS.find((s) => s.id === skin) || PET_SKINS[0];
  const isDancing = mood === "dance";
  const isSleeping = mood === "sleep";
  const isEating = mood === "eating";

  return (
    <div
      className={cn(
        "relative h-16 w-16 sm:h-20 sm:w-20 transition-transform duration-300",
        isDancing && "animate-bounce",
        className,
      )}
      style={{
        transform: `scaleX(${facing}) ${isDancing ? "scale(1.15) rotate(5deg)" : ""}`,
      }}
    >
      <svg viewBox="0 0 80 80" className="h-full w-full overflow-visible" aria-hidden>
        {/* Soft Ground Shadow */}
        <ellipse cx="40" cy="72" rx="16" ry="4" fill="currentColor" className="text-fg/15" />

        {/* Pet Animated Body */}
        <g className={walking ? "pip-walk-body" : isSleeping ? undefined : "pip-bob"}>
          {/* Tail */}
          <g className="pip-tail">
            <ellipse cx="18" cy="46" rx="8" ry="6" fill={currentSkin.shadeColor} />
          </g>

          {/* Ears */}
          <ellipse cx="28" cy="22" rx="7" ry="9" fill={currentSkin.bodyColor} />
          <ellipse cx="52" cy="22" rx="7" ry="9" fill={currentSkin.bodyColor} />
          <ellipse cx="28" cy="22" rx="4" ry="5.5" fill={currentSkin.shadeColor} />
          <ellipse cx="52" cy="22" rx="4" ry="5.5" fill={currentSkin.shadeColor} />

          {/* Main Body */}
          <circle cx="40" cy="42" r="20" fill={currentSkin.bodyColor} />
          <ellipse cx="40" cy="48" rx="13" ry="11" fill={currentSkin.shadeColor} opacity="0.55" />

          {/* Cheerful Blush / Cheeks */}
          <ellipse cx="30" cy="46" rx="3" ry="2" fill="#ff7f7f" opacity="0.45" />
          <ellipse cx="50" cy="46" rx="3" ry="2" fill="#ff7f7f" opacity="0.45" />

          {/* Eyes / Face */}
          {isSleeping ? (
            <g>
              <path
                d="M30 41 Q33 44 36 41"
                fill="none"
                stroke={currentSkin.eyeColor}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M44 41 Q47 44 50 41"
                fill="none"
                stroke={currentSkin.eyeColor}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* ZZZ floating */}
              <text x="56" y="28" fill="var(--fg)" fontSize="10" fontWeight="bold" opacity="0.7">
                z
              </text>
              <text x="62" y="20" fill="var(--fg)" fontSize="12" fontWeight="bold" opacity="0.85">
                Z
              </text>
            </g>
          ) : isDancing ? (
            <g>
              {/* Joyful curved eyes */}
              <path
                d="M30 42 Q33 37 36 42"
                fill="none"
                stroke={currentSkin.eyeColor}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M44 42 Q47 37 50 42"
                fill="none"
                stroke={currentSkin.eyeColor}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>
          ) : (
            <g className="pip-blink">
              <circle cx="33" cy="40" r="2.2" fill={currentSkin.eyeColor} />
              <circle cx="47" cy="40" r="2.2" fill={currentSkin.eyeColor} />
              <circle cx="33.7" cy="39.3" r="0.7" fill={currentSkin.bodyColor} />
              <circle cx="47.7" cy="39.3" r="0.7" fill={currentSkin.bodyColor} />
            </g>
          )}

          {/* Snout / Mouth */}
          {isEating ? (
            <circle cx="40" cy="47" r="2.5" fill={currentSkin.eyeColor} opacity="0.7" />
          ) : (
            <ellipse cx="40" cy="46.5" rx="2.2" ry="1.4" fill={currentSkin.eyeColor} opacity="0.55" />
          )}
        </g>

        {/* Legs */}
        <g className={walking ? "pip-leg-l" : undefined} style={{ transformOrigin: "32px 62px" }}>
          <rect x="29" y="60" width="5" height="10" rx="2.5" fill={currentSkin.shadeColor} />
        </g>
        <g className={walking ? "pip-leg-r" : undefined} style={{ transformOrigin: "48px 62px" }}>
          <rect x="46" y="60" width="5" height="10" rx="2.5" fill={currentSkin.shadeColor} />
        </g>

        {/* Carrying Sticky Note */}
        {carrying ? (
          <g transform="translate(50 34) rotate(8)">
            <rect x="0" y="0" width="18" height="16" rx="2" fill="var(--note-cream)" />
            <rect
              x="0"
              y="0"
              width="18"
              height="16"
              rx="2"
              fill="none"
              stroke={currentSkin.eyeColor}
              strokeOpacity="0.12"
            />
            <path
              d="M3 5h12M3 8h9M3 11h11"
              stroke={currentSkin.eyeColor}
              strokeOpacity="0.35"
              strokeWidth="1"
            />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
