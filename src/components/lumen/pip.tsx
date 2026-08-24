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
  className,
}: PipProps) {
  const isDancing = mood === "dance";
  const isSleeping = mood === "sleep";
  const isEating = mood === "eating";

  // Palette matching the adventurer fox in the reference artwork
  const primaryFur = "#d97706"; // Warm amber fox fur
  const shadeFur = "#b45309";
  const whiteFur = "#fffbeb";
  const earTip = "#451a03";
  const eyeColor = "#292524";
  const backpackColor = "#78350f";
  const backpackStrap = "#92400e";
  const buckleColor = "#fbbf24";

  return (
    <div
      className={cn(
        "relative h-18 w-18 sm:h-22 sm:w-22 transition-transform duration-300 select-none",
        isDancing && "animate-bounce",
        className,
      )}
      style={{
        transform: `scaleX(${facing}) ${isDancing ? "scale(1.15) rotate(6deg)" : ""}`,
      }}
    >
      <svg viewBox="0 0 90 90" className="h-full w-full overflow-visible" aria-hidden>
        {/* Soft Ground Drop Shadow */}
        <ellipse cx="45" cy="80" rx="22" ry="5" fill="currentColor" className="text-black/25" />

        {/* Pet Animated Character */}
        <g className={walking ? "pip-walk-body" : isSleeping ? undefined : "pip-bob"}>
          {/* Fluffy Bushy Fox Tail with White Tip */}
          <g className="pip-tail" style={{ transformOrigin: "22px 58px" }}>
            <path
              d="M24 58 C 8 52, 2 34, 12 24 C 20 16, 32 26, 26 50 Z"
              fill={primaryFur}
            />
            {/* White Tail Tip */}
            <path
              d="M12 24 C 15 20, 24 20, 20 28 C 16 34, 10 30, 12 24 Z"
              fill={whiteFur}
            />
          </g>

          {/* Tiny Adventurer Leather Backpack */}
          <g transform="translate(18, 42) rotate(-8)">
            <rect x="0" y="0" width="16" height="18" rx="4" fill={backpackColor} />
            <rect x="2" y="3" width="12" height="6" rx="2" fill={backpackStrap} />
            {/* Golden Buckle */}
            <circle cx="8" cy="11" r="2" fill={buckleColor} />
          </g>

          {/* Back Left Leg */}
          <ellipse cx="32" cy="72" rx="5" ry="6" fill={shadeFur} />
          {/* Back Right Leg */}
          <ellipse cx="58" cy="72" rx="5" ry="6" fill={shadeFur} />

          {/* Main Body */}
          <ellipse cx="44" cy="54" rx="19" ry="17" fill={primaryFur} />
          {/* Fluffy White Chest / Belly */}
          <ellipse cx="50" cy="56" rx="11" ry="12" fill={whiteFur} />

          {/* Pointy Fox Ears */}
          {/* Left Ear */}
          <path d="M30 32 L 22 10 L 40 22 Z" fill={primaryFur} />
          <path d="M22 10 L 26 8 L 30 16 Z" fill={earTip} />
          <path d="M28 26 L 24 16 L 34 22 Z" fill="#fbcfe8" opacity="0.85" />

          {/* Right Ear */}
          <path d="M52 24 L 66 12 L 60 34 Z" fill={primaryFur} />
          <path d="M66 12 L 70 14 L 64 20 Z" fill={earTip} />
          <path d="M56 25 L 63 17 L 59 30 Z" fill="#fbcfe8" opacity="0.85" />

          {/* Fox Head */}
          <circle cx="46" cy="34" r="18" fill={primaryFur} />

          {/* White Cheeks / Muzzle Mask */}
          <path
            d="M34 38 C 30 46, 38 52, 48 52 C 58 52, 64 46, 60 38 C 54 36, 40 36, 34 38 Z"
            fill={whiteFur}
          />
          <ellipse cx="34" cy="40" rx="6" ry="7" fill={whiteFur} />
          <ellipse cx="58" cy="40" rx="6" ry="7" fill={whiteFur} />

          {/* Cute Rosy Cheeks */}
          <circle cx="34" cy="43" r="3.5" fill="#fb7185" opacity="0.55" />
          <circle cx="58" cy="43" r="3.5" fill="#fb7185" opacity="0.55" />

          {/* Backpack Front Strap */}
          <path d="M36 46 L 42 62" stroke={backpackStrap} strokeWidth="2.5" strokeLinecap="round" />

          {/* Eyes */}
          {isSleeping ? (
            <g>
              <path
                d="M36 34 Q 40 38 44 34"
                fill="none"
                stroke={eyeColor}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path
                d="M50 34 Q 54 38 58 34"
                fill="none"
                stroke={eyeColor}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              {/* ZZZ */}
              <text x="64" y="20" fill="var(--fg)" fontSize="11" fontWeight="bold" opacity="0.8">
                z
              </text>
              <text x="72" y="12" fill="var(--fg)" fontSize="13" fontWeight="bold" opacity="0.95">
                Z
              </text>
            </g>
          ) : isDancing ? (
            <g>
              <path
                d="M36 35 Q 40 30 44 35"
                fill="none"
                stroke={eyeColor}
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                d="M50 35 Q 54 30 58 35"
                fill="none"
                stroke={eyeColor}
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            </g>
          ) : (
            <g className="pip-blink">
              {/* Left Eye with Sparkling Catchlight */}
              <ellipse cx="40" cy="34" rx="3.2" ry="3.8" fill={eyeColor} />
              <circle cx="41.2" cy="32.8" r="1.4" fill="#ffffff" />
              <circle cx="39.2" cy="35.5" r="0.7" fill="#ffffff" />

              {/* Right Eye with Sparkling Catchlight */}
              <ellipse cx="54" cy="34" rx="3.2" ry="3.8" fill={eyeColor} />
              <circle cx="55.2" cy="32.8" r="1.4" fill="#ffffff" />
              <circle cx="53.2" cy="35.5" r="0.7" fill="#ffffff" />
            </g>
          )}

          {/* Tiny Black Nose & Mouth */}
          <ellipse cx="47" cy="42" rx="2.4" ry="1.8" fill="#1c1917" />
          {isEating ? (
            <ellipse cx="47" cy="46" rx="2.5" ry="3" fill="#1c1917" />
          ) : (
            <path
              d="M44.5 44 Q 47 46.5 49.5 44"
              fill="none"
              stroke="#1c1917"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          )}

          {/* Front Paws */}
          <g className={walking ? "pip-leg-l" : undefined} style={{ transformOrigin: "38px 65px" }}>
            <ellipse cx="38" cy="74" rx="4.5" ry="5.5" fill={whiteFur} stroke={primaryFur} strokeWidth="1.2" />
          </g>
          <g className={walking ? "pip-leg-r" : undefined} style={{ transformOrigin: "54px 65px" }}>
            <ellipse cx="54" cy="74" rx="4.5" ry="5.5" fill={whiteFur} stroke={primaryFur} strokeWidth="1.2" />
          </g>
        </g>

        {/* Carrying Sticky Note */}
        {carrying ? (
          <g transform="translate(56 36) rotate(10)">
            <rect x="0" y="0" width="22" height="20" rx="3" fill="#fef08a" />
            <circle cx="11" cy="4" r="2" fill="#d97706" />
            <path d="M4 8 h14 M4 12 h10 M4 16 h12" stroke="#78350f" strokeOpacity="0.4" strokeWidth="1.2" />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
