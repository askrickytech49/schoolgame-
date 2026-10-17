/** Original fan-made emblem — not an official school logo. */
export function Emblem({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label="Campus Life emblem (unofficial)">
      <path d="M32 3 L58 12 V32 C58 47 46 57 32 61 C18 57 6 47 6 32 V12 Z" className="fill-maroon stroke-gold" strokeWidth="2.5" />
      <path d="M32 9 L52 16 V32 C52 43 43 51 32 55 C21 51 12 43 12 32 V16 Z" fill="none" className="stroke-gold" strokeWidth="1" opacity="0.6" />
      <path d="M18 26 L32 19 L46 26 L32 33 Z" className="fill-gold" />
      <path d="M24 30 V37 Q32 42 40 37 V30" className="fill-cream" opacity="0.9" />
      <path d="M44 27 V35" className="stroke-gold" strokeWidth="1.6" />
      <text x="32" y="51" textAnchor="middle" fontSize="7.5" fontWeight="800" className="fill-gold" style={{ fontFamily: "var(--font-display)", letterSpacing: "1px" }}>CL</text>
    </svg>
  );
}
