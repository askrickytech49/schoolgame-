import { OUTFITS, SKIN_TONES } from "@/game/data";
import type { Player } from "@/game/types";

export function Avatar({ player, size = 48, walking = false }: { player: Pick<Player, "skin" | "hair" | "outfit" | "accessory" | "gender">; size?: number; walking?: boolean }) {
  const skin = SKIN_TONES.find((s) => s.id === player.skin)?.color ?? SKIN_TONES[2].color;
  const o = OUTFITS.find((x) => x.id === player.outfit) ?? OUTFITS[0];
  const hair = "#1a1210";
  const feminine = player.gender === "female";
  return (
    <svg viewBox="0 0 40 64" width={size} height={size * 1.6} aria-hidden className={walking ? "animate-walk" : ""}>
      <ellipse cx="20" cy="61" rx="11" ry="3" fill="rgba(0,0,0,0.25)" />
      {/* bag */}
      <rect x="7" y="25" width="26" height="17" rx="4" fill={o.bag} />
      {/* legs */}
      <rect x={feminine ? 14 : 13} y="40" width={feminine ? 5 : 6} height="17" rx="2" fill={o.bottom} />
      <rect x={feminine ? 21 : 21} y="40" width={feminine ? 5 : 6} height="17" rx="2" fill={o.bottom} />
      {o.kind === "skirt" && <path d="M12 36 L28 36 L26.5 47 L13.5 47Z" fill={o.bottom} stroke="rgba(0,0,0,0.22)" strokeWidth="0.8" />}
      <rect x="11.5" y="55" width="8" height="4" rx="2" fill={o.shoe} />
      <rect x="20.5" y="55" width="8" height="4" rx="2" fill={o.shoe} />
      {/* arms */}
      <rect x={feminine ? 8 : 7} y="25" width={feminine ? 4 : 5} height="15" rx="2.5" fill={o.kind === "tee" ? skin : o.top} />
      <rect x={feminine ? 28 : 28} y="25" width={feminine ? 4 : 5} height="15" rx="2.5" fill={o.kind === "tee" ? skin : o.top} />
      <rect x="7" y="24" width="5" height="6" rx="2" fill={o.top} />
      <rect x="28" y="24" width="5" height="6" rx="2" fill={o.top} />
      {/* torso */}
      {feminine
        ? <path d="M13 23 Q20 20 27 23 L26 33 Q26.5 37 30 42 L10 42 Q13.5 37 14 33Z" fill={o.top} />
        : <rect x="11" y="23" width="18" height="19" rx="4" fill={o.top} />}
      {o.kind === "shirt" && <path d="M20 23 L20 42" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />}
      {o.kind === "shirt" && <path d="M16 23 L20 27 L24 23" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />}
      {o.kind === "hoodie" && <path d="M14 23 Q20 29 26 23" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />}
      {o.id === "ankara" && (
        <g fill="#f2c14e" opacity="0.8">
          <circle cx="15" cy="30" r="1.4" /><circle cx="25" cy="30" r="1.4" /><circle cx="20" cy="35" r="1.4" /><circle cx="15" cy="39" r="1.2" /><circle cx="25" cy="39" r="1.2" />
        </g>
      )}
      {/* bag strap */}
      <path d="M13 23 L27 41" stroke={o.bag} strokeWidth="2" opacity="0.85" />
      {/* neck + head */}
      <rect x="17.5" y="19" width="5" height="5" fill={skin} />
      <circle cx="20" cy="12.5" r="8" fill={skin} />
      <circle cx="17" cy="13" r="0.9" fill="#1a1210" />
      <circle cx="23" cy="13" r="0.9" fill="#1a1210" />
      <path d="M17.5 16.5 Q20 18 22.5 16.5" stroke="#1a1210" strokeWidth="0.8" fill="none" />
      {player.hair === "short" && <path d="M12 11 Q12 3.5 20 3.5 Q28 3.5 28 11 Q24 7 20 7 Q16 7 12 11Z" fill={hair} />}
      {player.hair === "afro" && <circle cx="20" cy="5" r="6" fill={hair} />}
      {player.hair === "afro" && <path d="M12 11 Q12 5 20 5 Q28 5 28 11 Q24 8 20 8 Q16 8 12 11Z" fill={hair} />}
      {player.hair === "braids" && (
        <g fill={hair}>
          <path d="M11.5 12 Q11 3 20 3 Q29 3 28.5 12 Q24 7.5 20 7.5 Q16 7.5 11.5 12Z" />
          <rect x="10.5" y="10" width="2.4" height="13" rx="1.2" /><rect x="27.1" y="10" width="2.4" height="13" rx="1.2" />
          <rect x="13" y="12" width="2" height="11" rx="1" /><rect x="25" y="12" width="2" height="11" rx="1" />
        </g>
      )}
      {player.hair === "long-braids" && (
        <g fill={hair}>
          <path d="M11.5 12 Q11 3 20 3 Q29 3 28.5 12 Q24 7.5 20 7.5 Q16 7.5 11.5 12Z" />
          <rect x="10" y="10" width="3" height="24" rx="1.5" /><rect x="27" y="10" width="3" height="24" rx="1.5" />
          <path d="M10 14h3M10 19h3M10 24h3M10 29h3M27 14h3M27 19h3M27 24h3M27 29h3" stroke="#76503c" strokeWidth="1" />
        </g>
      )}
      {player.hair === "bun" && (
        <g fill={hair}>
          <path d="M12 12 Q12 5 20 5 Q28 5 28 12 Q24 8 20 8 Q16 8 12 12Z" />
          <circle cx="20" cy="3.5" r="5.5" />
          <path d="M14 10 Q20 7 26 10" fill="none" stroke="#51372c" strokeWidth="1" />
        </g>
      )}
      {player.hair === "cap" && (
        <g>
          <path d="M11.5 10 Q12 3 20 3 Q28 3 28.5 10Z" fill={o.formal ? "#1b1b1f" : "#7a1f2b"} />
          <rect x="18" y="8.5" width="13" height="2.6" rx="1.3" fill={o.formal ? "#1b1b1f" : "#7a1f2b"} />
          <circle cx="20" cy="5.5" r="1.3" fill="#e2a93b" />
        </g>
      )}
      {player.accessory === "glasses" && <g fill="none" stroke="#241a17" strokeWidth="1.15"><rect x="12.5" y="11" width="6.2" height="4.6" rx="1.4" /><rect x="21.3" y="11" width="6.2" height="4.6" rx="1.4" /><path d="M18.7 12.8h2.6M12.5 12l-1.2-.7M27.5 12l1.2-.7" /></g>}
      {player.accessory === "earrings" && <g fill="#e2a93b" stroke="#8a5520" strokeWidth="0.4"><circle cx="11.8" cy="17" r="1.5" /><circle cx="28.2" cy="17" r="1.5" /></g>}
    </svg>
  );
}
