const STROKE = "#e7b35d";
const BG = "#06182e";

export default function PitchSvgDesktop() {
  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
    >
      <defs>
        <radialGradient id="pitchDesktopBg" cx="50%" cy="45%">
          <stop offset="0%" stopColor="#0b2242" />
          <stop offset="100%" stopColor={BG} />
        </radialGradient>
      </defs>

      <rect width="1000" height="1000" fill="url(#pitchDesktopBg)" />

      <rect
        x="12"
        y="12"
        width="976"
        height="976"
        rx="2"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      <circle
        cx="500"
        cy="12"
        r="120"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      <rect
        x="250"
        y="750"
        width="500"
        height="238"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      <rect
        x="385"
        y="890"
        width="230"
        height="98"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      <rect
        x="470"
        y="988"
        width="110"
        height="35"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      <circle cx="500" cy="820" r="4" fill={STROKE} />

      <path
        d="M410 750 A90 90 0 0 1 590 750"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      <path
        d="M12 940 A48 48 0 0 1 60 988"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      <image
        href="/logo.svg"
        x="820"
        y="825"
        width="190"
        height="150"
        opacity="0.8"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}
