const STROKE = "#e7b35d";
const BG = "#06182e";

export default function PitchSvg() {
  return (
    <svg
      viewBox="0 0 750 1000"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
    >
      <defs>
        <radialGradient id="pitchBg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#0b2242" />
          <stop offset="100%" stopColor={BG} />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="750" height="1000" fill="url(#pitchBg)" />

      {/* Outer boundary */}
      <rect
        x="24"
        y="24"
        width="702"
        height="952"
        rx="3"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Halfway line */}
      <line
        x1="24"
        y1="500"
        x2="726"
        y2="500"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Center circle */}
      <circle
        cx="375"
        cy="500"
        r="90"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Center spot */}
      <circle cx="375" cy="500" r="5" fill={STROKE} />

      {/* ─── Top half (attacking top) ───────────────────────────── */}

      {/* Top penalty area */}
      <rect
        x="187"
        y="24"
        width="376"
        height="200"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Top goal area (6-yard box) */}
      <rect
        x="290"
        y="24"
        width="170"
        height="80"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Top penalty spot */}
      <circle cx="375" cy="150" r="5" fill={STROKE} />

      {/* Top penalty arc (outside the box) */}
      <path
        d="M290 224 A85 85 0 0 0 460 224"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Top goal */}
      <rect
        x="325"
        y="4"
        width="100"
        height="20"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* ─── Bottom half (defending bottom) ─────────────────────── */}

      {/* Bottom penalty area */}
      <rect
        x="187"
        y="776"
        width="376"
        height="200"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Bottom goal area (6-yard box) */}
      <rect
        x="290"
        y="896"
        width="170"
        height="80"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Bottom penalty spot */}
      <circle cx="375" cy="850" r="5" fill={STROKE} />

      {/* Bottom penalty arc (outside the box) */}
      <path
        d="M290 776 A85 85 0 0 1 460 776"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Bottom goal */}
      <rect
        x="325"
        y="976"
        width="100"
        height="20"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* ─── Corner arcs ─────────────────────────────────────────── */}

      {/* Top-left */}
      <path
        d="M24 58 A34 34 0 0 1 58 24"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />
      {/* Top-right */}
      <path
        d="M692 24 A34 34 0 0 1 726 58"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />
      {/* Bottom-left */}
      <path
        d="M24 942 A34 34 0 0 0 58 976"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />
      {/* Bottom-right */}
      <path
        d="M692 976 A34 34 0 0 0 726 942"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Logo */}
      <image
        href="/logo.svg"
        x="580"
        y="830"
        width="150"
        height="150"
        opacity="0.6"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}
