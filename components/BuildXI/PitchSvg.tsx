const STROKE = "#e7b35d";
const BG = "#06182e";

export default function PitchSvg() {
  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
    >
      {/* Background */}
      <defs>
        <radialGradient id="pitchBg" cx="50%" cy="45%">
          <stop offset="0%" stopColor="#0b2242" />
          <stop offset="100%" stopColor={BG} />
        </radialGradient>
      </defs>

      <rect width="1000" height="1000" fill="url(#pitchBg)" />

      {/* Outer Border */}
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

      {/* Top Half Centre Circle */}
      <circle
        cx="500"
        cy="12"
        r="120"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Bottom Penalty Area */}
      <rect
        x="250"
        y="750"
        width="500"
        height="238"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Six Yard Box */}
      <rect
        x="385"
        y="890"
        width="230"
        height="98"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Goal */}
      <rect
        x="470"
        y="988"
        width="110"
        height="35"
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Penalty Spot */}
      <circle cx="500" cy="820" r="4" fill={STROKE} />

      {/* Penalty Arc */}
      <path
        d="
        M410 750
        A90 90 0 0 1
        590 750
      "
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />

      {/* Bottom Left Corner Arc */}
      <path
        d="
        M12 940
        A48 48 0 0 1
        60 988
      "
        fill="none"
        stroke={STROKE}
        strokeWidth="4"
      />
    </svg>
  );
}
