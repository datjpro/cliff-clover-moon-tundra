import type { PetBodyItem, PetHat, PetSkin, PetType, PipMood } from "@/lib/types";
import { cn } from "@/lib/utils";

type PipProps = {
  walking?: boolean;
  walkPhase?: number;
  carrying?: boolean;
  facing?: 1 | -1;
  mood?: PipMood;
  petType?: PetType;
  skin?: PetSkin;
  hat?: PetHat;
  bodyItem?: PetBodyItem;
  className?: string;
};

export function PipFigure({
  walking = false,
  walkPhase = 0,
  carrying = false,
  facing = 1,
  mood = "idle",
  petType = "fox",
  hat = "none",
  bodyItem = "backpack",
  className,
}: PipProps) {
  const isDancing = mood === "dance";
  const isSleeping = mood === "sleep";
  const isEating = mood === "eating";

  // Mathematical procedural limb angles (0% jitter, pure 120 FPS GPU rendering)
  const legLRot = walking ? Math.sin(walkPhase) * 22 : 0;
  const legRRot = walking ? -Math.sin(walkPhase) * 22 : 0;
  const bodyBobY = walking ? Math.abs(Math.sin(walkPhase)) * -3.5 : 0;
  const tailRot = walking ? Math.sin(walkPhase * 0.8) * 18 : 0;

  return (
    <div
      className={cn(
        "relative h-20 w-20 sm:h-24 sm:w-24 select-none will-change-transform",
        isDancing && "animate-bounce",
        className,
      )}
      style={{
        transform: `scaleX(${facing}) ${isDancing ? "scale(1.15) rotate(6deg)" : ""}`,
      }}
    >
      <svg viewBox="0 0 90 90" className="h-full w-full overflow-visible" aria-hidden>
        {/* Soft Drop Shadow */}
        <ellipse cx="45" cy="80" rx="22" ry="5" fill="currentColor" className="text-black/25" />

        <g
          className={!walking && !isSleeping ? "pip-bob" : undefined}
          style={{ transform: `translateY(${bodyBobY}px)` }}
        >
          {/* BODY ITEMS / ACCESSORIES (Back Layer) */}
          {bodyItem === "cape" && (
            <path
              d="M26 44 Q 10 52 14 74 Q 28 66 34 50 Z"
              fill="#dc2626"
              className={walking ? "animate-pulse" : undefined}
            />
          )}
          {bodyItem === "wings" && (
            <g transform="translate(14, 34)">
              <path d="M 0 10 Q 12 -8 24 4 Q 12 18 0 10 Z" fill="#93c5fd" opacity="0.8" />
              <path d="M 4 14 Q 14 4 22 12 Q 14 22 4 14 Z" fill="#c4b5fd" opacity="0.65" />
            </g>
          )}

          {/* PET TYPE 1: ADVENTURER FOX (Default matching reference design) */}
          {petType === "fox" && (
            <>
              {/* Bushy Fox Tail with White Tip */}
              <g
                style={{
                  transformOrigin: "24px 58px",
                  transform: `rotate(${tailRot}deg)`,
                }}
                className={!walking ? "pip-tail" : undefined}
              >
                <path d="M24 58 C 8 52, 2 34, 12 24 C 20 16, 32 26, 26 50 Z" fill="#d97706" />
                <path d="M12 24 C 15 20, 24 20, 20 28 C 16 34, 10 30, 12 24 Z" fill="#fffbeb" />
              </g>

              {/* Tiny Adventurer Leather Backpack */}
              {bodyItem === "backpack" && (
                <g transform="translate(18, 42) rotate(-8)">
                  <rect x="0" y="0" width="16" height="18" rx="4" fill="#78350f" />
                  <rect x="2" y="3" width="12" height="6" rx="2" fill="#92400e" />
                  <circle cx="8" cy="11" r="2" fill="#fbbf24" />
                </g>
              )}

              {/* Back Legs */}
              <ellipse cx="32" cy="72" rx="5" ry="6" fill="#b45309" />
              <ellipse cx="58" cy="72" rx="5" ry="6" fill="#b45309" />

              {/* Main Body */}
              <ellipse cx="44" cy="54" rx="19" ry="17" fill="#d97706" />
              <ellipse cx="50" cy="56" rx="11" ry="12" fill="#fffbeb" />

              {/* Pointy Fox Ears */}
              <path d="M30 32 L 22 10 L 40 22 Z" fill="#d97706" />
              <path d="M22 10 L 26 8 L 30 16 Z" fill="#451a03" />
              <path d="M28 26 L 24 16 L 34 22 Z" fill="#fbcfe8" opacity="0.85" />

              <path d="M52 24 L 66 12 L 60 34 Z" fill="#d97706" />
              <path d="M66 12 L 70 14 L 64 20 Z" fill="#451a03" />
              <path d="M56 25 L 63 17 L 59 30 Z" fill="#fbcfe8" opacity="0.85" />

              {/* Fox Head */}
              <circle cx="46" cy="34" r="18" fill="#d97706" />
              <path
                d="M34 38 C 30 46, 38 52, 48 52 C 58 52, 64 46, 60 38 C 54 36, 40 36, 34 38 Z"
                fill="#fffbeb"
              />
              <circle cx="34" cy="43" r="3.5" fill="#fb7185" opacity="0.55" />
              <circle cx="58" cy="43" r="3.5" fill="#fb7185" opacity="0.55" />
              <path d="M36 46 L 42 62" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}

          {/* PET TYPE 2: COZY CAT */}
          {petType === "cat" && (
            <>
              <g
                style={{
                  transformOrigin: "24px 58px",
                  transform: `rotate(${tailRot}deg)`,
                }}
                className={!walking ? "pip-tail" : undefined}
              >
                <path d="M24 58 Q 12 40 16 28 Q 20 20 22 28" fill="none" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" />
              </g>
              {bodyItem === "backpack" && (
                <g transform="translate(18, 42) rotate(-8)">
                  <rect x="0" y="0" width="14" height="16" rx="4" fill="#78350f" />
                </g>
              )}
              <ellipse cx="44" cy="54" rx="18" ry="16" fill="#fef3c7" />
              <ellipse cx="38" cy="50" rx="8" ry="8" fill="#ea580c" opacity="0.85" />
              <polygon points="26,26 20,8 36,18" fill="#ea580c" />
              <polygon points="54,20 68,10 62,28" fill="#1c1917" />
              <circle cx="46" cy="34" r="17" fill="#fef3c7" />
              <ellipse cx="38" cy="30" rx="6" ry="6" fill="#ea580c" opacity="0.8" />
              <line x1="26" y1="42" x2="16" y2="40" stroke="#78716c" strokeWidth="1.2" />
              <line x1="26" y1="45" x2="16" y2="46" stroke="#78716c" strokeWidth="1.2" />
              <line x1="64" y1="42" x2="74" y2="40" stroke="#78716c" strokeWidth="1.2" />
              <line x1="64" y1="45" x2="74" y2="46" stroke="#78716c" strokeWidth="1.2" />
            </>
          )}

          {/* PET TYPE 3: SHIBA INU */}
          {petType === "shiba" && (
            <>
              <g
                style={{
                  transformOrigin: "24px 56px",
                  transform: `rotate(${tailRot * 0.5}deg)`,
                }}
              >
                <circle cx="20" cy="46" r="8" fill="#ca8a04" />
                <circle cx="22" cy="46" r="4" fill="#ffffff" />
              </g>
              <ellipse cx="44" cy="54" rx="19" ry="17" fill="#ca8a04" />
              <ellipse cx="48" cy="56" rx="12" ry="12" fill="#ffffff" />
              <polygon points="34,46 54,46 44,58" fill="#dc2626" />
              <circle cx="44" cy="48" r="2" fill="#fef08a" />
              <circle cx="46" cy="34" r="18" fill="#ca8a04" />
              <ellipse cx="46" cy="42" rx="12" ry="8" fill="#ffffff" />
              <circle cx="38" cy="26" r="2.5" fill="#ffffff" />
              <circle cx="54" cy="26" r="2.5" fill="#ffffff" />
              <polygon points="28,26 24,10 38,20" fill="#ca8a04" />
              <polygon points="52,20 66,10 62,26" fill="#ca8a04" />
            </>
          )}

          {/* PET TYPE 4: BABY DRAGON */}
          {petType === "dragon" && (
            <>
              <g transform="translate(18, 36) rotate(-12)">
                <path d="M 0 10 Q 10 -4 20 6 Q 10 16 0 10 Z" fill="#86efac" stroke="#16a34a" strokeWidth="1.5" />
              </g>
              <ellipse cx="44" cy="54" rx="18" ry="16" fill="#22c55e" />
              <ellipse cx="48" cy="56" rx="10" ry="11" fill="#bbf7d0" />
              <polygon points="30,24 24,8 36,18" fill="#fbbf24" />
              <polygon points="54,18 66,8 60,24" fill="#fbbf24" />
              <circle cx="46" cy="34" r="17" fill="#22c55e" />
              <circle cx="34" cy="43" r="3" fill="#ec4899" opacity="0.45" />
              <circle cx="58" cy="43" r="3" fill="#ec4899" opacity="0.45" />
            </>
          )}

          {/* PET TYPE 5: CYBER BOT */}
          {petType === "cyber" && (
            <>
              <line x1="46" y1="18" x2="46" y2="8" stroke="#00ffcc" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="46" cy="6" r="3.5" fill="#ffe600" />
              <rect x="26" y="38" width="36" height="32" rx="8" fill="#1e1b4b" stroke="#00ffcc" strokeWidth="2" />
              <rect x="32" y="44" width="24" height="14" rx="4" fill="#000000" />
              <circle cx="38" cy="51" r="2" fill="#00ffcc" />
              <circle cx="50" cy="51" r="2" fill="#00ffcc" />
              <rect x="28" y="16" width="36" height="26" rx="6" fill="#1e1b4b" stroke="#00ffcc" strokeWidth="2" />
              <rect x="33" y="22" width="26" height="14" rx="4" fill="#00ffcc" opacity="0.85" />
            </>
          )}

          {/* SCARF (Front Body Item) */}
          {bodyItem === "scarf" && (
            <g transform="translate(34, 44)">
              <rect x="0" y="0" width="26" height="6" rx="3" fill="#e11d48" />
              <path d="M 6 6 L 8 16 L 14 16 L 12 6 Z" fill="#be123c" />
            </g>
          )}

          {/* EYES */}
          {petType !== "cyber" && (
            <>
              {isSleeping ? (
                <g>
                  <path d="M36 34 Q 40 38 44 34" fill="none" stroke="#292524" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M50 34 Q 54 38 58 34" fill="none" stroke="#292524" strokeWidth="2.4" strokeLinecap="round" />
                  <text x="64" y="20" fill="var(--fg)" fontSize="11" fontWeight="bold" opacity="0.8">z</text>
                  <text x="72" y="12" fill="var(--fg)" fontSize="13" fontWeight="bold" opacity="0.95">Z</text>
                </g>
              ) : isDancing ? (
                <g>
                  <path d="M36 35 Q 40 30 44 35" fill="none" stroke="#292524" strokeWidth="2.6" strokeLinecap="round" />
                  <path d="M50 35 Q 54 30 58 35" fill="none" stroke="#292524" strokeWidth="2.6" strokeLinecap="round" />
                </g>
              ) : (
                <g className="pip-blink">
                  <ellipse cx="40" cy="34" rx="3.2" ry="3.8" fill="#1c1917" />
                  <circle cx="41.2" cy="32.8" r="1.4" fill="#ffffff" />
                  <circle cx="39.2" cy="35.5" r="0.7" fill="#ffffff" />
                  <ellipse cx="54" cy="34" rx="3.2" ry="3.8" fill="#1c1917" />
                  <circle cx="55.2" cy="32.8" r="1.4" fill="#ffffff" />
                  <circle cx="53.2" cy="35.5" r="0.7" fill="#ffffff" />
                </g>
              )}

              {/* Nose & Mouth */}
              <ellipse cx="47" cy="42" rx="2.4" ry="1.8" fill="#1c1917" />
              {isEating ? (
                <ellipse cx="47" cy="46" rx="2.5" ry="3" fill="#1c1917" />
              ) : (
                <path d="M44.5 44 Q 47 46.5 49.5 44" fill="none" stroke="#1c1917" strokeWidth="1.4" strokeLinecap="round" />
              )}

              {/* Front Paws with Procedural Walking Rotation */}
              <g style={{ transformOrigin: "38px 65px", transform: `rotate(${legLRot}deg)` }}>
                <ellipse cx="38" cy="74" rx="4.5" ry="5.5" fill="#fffbeb" stroke="#b45309" strokeWidth="1.2" />
              </g>
              <g style={{ transformOrigin: "54px 65px", transform: `rotate(${legRRot}deg)` }}>
                <ellipse cx="54" cy="74" rx="4.5" ry="5.5" fill="#fffbeb" stroke="#b45309" strokeWidth="1.2" />
              </g>
            </>
          )}

          {/* HATS & HEAD ACCESSORIES */}
          {hat === "sunglasses" && (
            <g transform="translate(32, 28)">
              <rect x="0" y="0" width="13" height="9" rx="3" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
              <rect x="15" y="0" width="13" height="9" rx="3" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
              <line x1="13" y1="3" x2="15" y2="3" stroke="#18181b" strokeWidth="2" />
              <line x1="0" y1="3" x2="-4" y2="1" stroke="#18181b" strokeWidth="1.5" />
              <line x1="28" y1="3" x2="32" y2="1" stroke="#18181b" strokeWidth="1.5" />
            </g>
          )}

          {hat === "explorer_hat" && (
            <g transform="translate(26, 12)">
              <ellipse cx="20" cy="12" rx="20" ry="4" fill="#a16207" />
              <rect x="8" y="2" width="24" height="10" rx="3" fill="#ca8a04" />
              <rect x="8" y="9" width="24" height="3" fill="#713f12" />
            </g>
          )}

          {hat === "wizard_hat" && (
            <g transform="translate(30, 2)">
              <polygon points="16,0 4,20 28,20" fill="#6d28d9" />
              <ellipse cx="16" cy="20" rx="16" ry="3.5" fill="#4c1d95" />
              <circle cx="16" cy="10" r="1.5" fill="#facc15" />
            </g>
          )}

          {hat === "party_hat" && (
            <g transform="translate(34, 4)">
              <polygon points="12,0 2,18 22,18" fill="#f43f5e" />
              <circle cx="12" cy="0" r="2.5" fill="#facc15" />
              <line x1="4" y1="12" x2="20" y2="12" stroke="#38bdf8" strokeWidth="2" />
            </g>
          )}

          {hat === "sleep_cap" && (
            <g transform="translate(30, 6)">
              <path d="M 8 18 Q 4 0 26 4 Q 28 14 18 18 Z" fill="#1e3a8a" />
              <ellipse cx="13" cy="18" rx="10" ry="3" fill="#ffffff" />
              <circle cx="28" cy="5" r="3" fill="#ffffff" />
            </g>
          )}
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
