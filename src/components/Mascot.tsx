import React from 'react';

interface MascotProps {
  size?: number;
  mood?: 'normal' | 'cheer' | 'celebrating' | 'thinking' | 'walking';
  className?: string;
  animate?: boolean;
}

export const Mascot: React.FC<MascotProps> = ({
  size = 140,
  mood = 'normal',
  className = '',
  animate = true,
}) => {
  return (
    <div
      className={`inline-block relative select-none ${className} ${animate ? 'transition-transform duration-300 hover:scale-105' : ''}`}
      style={{ width: size, height: size * 1.15 }}
      role="img"
      aria-label="StepEarn friendly panda mascot"
    >
      <svg
        viewBox="0 0 160 185"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="pandaCheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFA6A6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFA6A6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="shirtGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF7A1F" />
            <stop offset="100%" stopColor="#FF5500" />
          </linearGradient>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Ears */}
        {/* Left Ear */}
        <circle cx="42" cy="46" r="22" fill="#1C1E24" />
        <circle cx="44" cy="44" r="14" fill="#2E333D" />

        {/* Right Ear */}
        <circle cx="118" cy="46" r="22" fill="#1C1E24" />
        <circle cx="116" cy="44" r="14" fill="#2E333D" />

        {/* Head Base */}
        <ellipse cx="80" cy="74" rx="52" ry="46" fill="#FFFFFF" filter="url(#softShadow)" />

        {/* Eye Patches (classic Panda angled dark patches) */}
        <ellipse
          cx="58"
          cy="68"
          rx="17"
          ry="20"
          transform="rotate(-15 58 68)"
          fill="#1C1E24"
        />
        <ellipse
          cx="102"
          cy="68"
          rx="17"
          ry="20"
          transform="rotate(15 102 68)"
          fill="#1C1E24"
        />

        {/* Eyes (Joyful white reflections) */}
        {/* Left Eye */}
        <ellipse cx="60" cy="67" rx="8" ry="10" fill="#FFFFFF" />
        <circle cx="61" cy="67" r="6" fill="#111827" />
        <circle cx="63" cy="65" r="2.8" fill="#FFFFFF" />
        <circle cx="59" cy="70" r="1.4" fill="#FFFFFF" />

        {/* Right Eye */}
        <ellipse cx="100" cy="67" rx="8" ry="10" fill="#FFFFFF" />
        <circle cx="99" cy="67" r="6" fill="#111827" />
        <circle cx="97" cy="65" r="2.8" fill="#FFFFFF" />
        <circle cx="101" cy="70" r="1.4" fill="#FFFFFF" />

        {/* Cheeks */}
        <circle cx="42" cy="85" r="9" fill="url(#pandaCheek)" />
        <circle cx="118" cy="85" r="9" fill="url(#pandaCheek)" />

        {/* Nose */}
        <ellipse cx="80" cy="76" rx="5" ry="3.5" fill="#1F2430" />

        {/* Mouth (Big joyful open mouth) */}
        {mood === 'thinking' ? (
          <path
            d="M74 88 Q80 91 86 87"
            stroke="#1F2430"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ) : (
          <g>
            <path
              d="M66 84 Q80 84 94 84 Q89 104 80 104 Q71 104 66 84 Z"
              fill="#1F2430"
            />
            {/* Pink tongue */}
            <path
              d="M71 96 Q80 92 89 96 Q80 104 71 96 Z"
              fill="#FF6E7F"
            />
            {/* Smile outline upper lip */}
            <path
              d="M66 84 Q80 88 94 84"
              stroke="#1F2430"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Body & Shirt */}
        {/* Legs / Feet */}
        <ellipse cx="64" cy="164" rx="11" ry="8" fill="#1C1E24" />
        <ellipse cx="96" cy="164" rx="11" ry="8" fill="#1C1E24" />
        {/* White sneaker toes */}
        <ellipse cx="64" cy="167" rx="9" ry="4" fill="#F1F5F9" />
        <ellipse cx="96" cy="167" rx="9" ry="4" fill="#F1F5F9" />

        {/* Athletic Orange T-shirt Body */}
        <path
          d="M54 114 Q48 152 60 156 L100 156 Q112 152 106 114 Z"
          fill="url(#shirtGrad)"
        />

        {/* Chest Emblem: White circle with heart & runner motif */}
        <circle cx="80" cy="133" r="11" fill="#FFFFFF" />
        <path
          d="M80 138 C75 133 73 130 75 128 C77 126 80 128 80 128 C80 128 83 126 85 128 C87 130 85 133 80 138 Z"
          fill="#FF5500"
        />

        {/* Paws / Arms */}
        {mood === 'cheer' || mood === 'celebrating' ? (
          <g>
            {/* Left Arm Raised */}
            <path
              d="M52 118 Q36 98 42 88 Q50 86 58 106 Z"
              fill="#1C1E24"
            />
            {/* Right Arm Raised */}
            <path
              d="M108 118 Q124 98 118 88 Q110 86 102 106 Z"
              fill="#1C1E24"
            />
          </g>
        ) : (
          <g>
            {/* Arms Resting / Runner pose */}
            <ellipse cx="46" cy="130" rx="9" ry="14" transform="rotate(20 46 130)" fill="#1C1E24" />
            <ellipse cx="114" cy="130" rx="9" ry="14" transform="rotate(-20 114 130)" fill="#1C1E24" />
          </g>
        )}
      </svg>
    </div>
  );
};
