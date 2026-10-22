import { useEffect, useId, useRef } from "react";
import { Flame, Zap, Smile, Wallet, Clock, Target, Pause, Smartphone, Map, GraduationCap, Briefcase, Users, UserRound, Settings, FileCheck2 } from "lucide-react";
import { CAMPUS_SPORTS, LOVE_GARDENS, MAP_LAYOUT, OBJECTIVES, WORLD, type MapPoint } from "@/game/data";
import { formatNaira, formatTime, levelOf, useGame } from "@/game/store";
import { livePos } from "./CampusScene";
import { Avatar } from "./Avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PanelId = "map" | "academics" | "hustles" | "social" | "inventory" | "profile" | "settings" | "admissions";
export const MENU: { id: PanelId; label: string; Icon: typeof Map }[] = [
  { id: "map", label: "Map", Icon: Map },
  { id: "academics", label: "Academics", Icon: GraduationCap },
  { id: "hustles", label: "Hustles", Icon: Briefcase },
  { id: "social", label: "Social", Icon: Users },
  { id: "inventory", label: "Wallet", Icon: Wallet },
  { id: "admissions", label: "Student Portal", Icon: FileCheck2 },
  { id: "profile", label: "Profile", Icon: UserRound },
  { id: "settings", label: "Settings", Icon: Settings },
];

export function StatBar({ label, value, color, Icon, invert, compact }: { label: string; value: number; color: string; Icon: typeof Flame; invert?: boolean; compact?: boolean }) {
  const danger = invert ? value > 75 : value < 25;
  return (
    <div className={cn("flex items-center gap-2", danger && "animate-pulse")} title={`${label}: ${Math.round(value)}`}>
      <Icon className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
      <div className="flex-1">
        {!compact && <div className="mb-0.5 flex justify-between text-[11px] font-semibold"><span>{label}</span><span>{Math.round(value)}</span></div>}
        <div className={cn("overflow-hidden rounded-full bg-muted", compact ? "h-1.5" : "h-2.5")} role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
          <div className={cn("h-full rounded-full transition-[width] duration-500", color)} style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );
}

export function Stats({ compact }: { compact?: boolean }) {
  const s = useGame();
  return (
    <div className={cn("grid", compact ? "grid-cols-3 gap-2" : "gap-2.5")}>
      <StatBar label="Hunger" value={s.hunger} color="bg-stat-hunger" Icon={Flame} invert compact={compact} />
      <StatBar label="Energy" value={s.energy} color="bg-stat-energy" Icon={Zap} compact={compact} />
      <StatBar label="Mood" value={s.mood} color="bg-stat-mood" Icon={Smile} compact={compact} />
    </div>
  );
}

export function Minimap({ nearby, size = 190, route, destination, origin }: { nearby: string | null; size?: number; route?: MapPoint[]; destination?: MapPoint | null; origin?: MapPoint | null }) {
  const mapId = useId().replaceAll(":", "");
  const dot = useRef<HTMLDivElement>(null);
  const h = (size * WORLD.h) / WORLD.w;
  const k = size / WORLD.w;
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (dot.current) dot.current.style.transform = `translate(${livePos.x * k - 5}px, ${livePos.y * k - 5}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [k]);
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-[#77303a] bg-[#dfe9d4] shadow-[inset_0_0_0_4px_rgba(255,255,255,.38)]" style={{ width: size, height: h }} aria-label="Illustrated campus map">
      <svg className="absolute inset-0" width={size} height={h} viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} aria-hidden>
        <defs>
          <pattern id={`campus-map-grain-${mapId}`} width="88" height="88" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="18" r="5" fill="#8da77a" opacity=".27" /><circle cx="62" cy="50" r="3.5" fill="#6f8f67" opacity=".23" />
          </pattern>
          <filter id={`campus-map-shadow-${mapId}`} x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#324332" floodOpacity=".24" /></filter>
        </defs>
        <rect width={WORLD.w} height={WORLD.h} fill="#dfe9d4" />
        <rect width={WORLD.w} height={WORLD.h} fill={`url(#campus-map-grain-${mapId})`} />
        {LOVE_GARDENS.map((garden) => <g key={garden.id}>
          <rect x={garden.x} y={garden.y} width={garden.w} height={garden.h} rx="44" fill="#b8d0a1" stroke="#8ba97d" strokeWidth="8" />
          <circle cx={garden.x + garden.w * .35} cy={garden.y + garden.h * .42} r="23" fill="#43885f" /><circle cx={garden.x + garden.w * .68} cy={garden.y + garden.h * .62} r="17" fill="#5a996a" />
        </g>)}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {MAP_LAYOUT.roads.map((road, i) => <path key={`edge-${i}`} d={road.map((point, j) => `${j ? "L" : "M"} ${point.x} ${point.y}`).join(" ")} stroke="#aab39f" strokeWidth="112" />)}
          {MAP_LAYOUT.roads.map((road, i) => <path key={`road-${i}`} d={road.map((point, j) => `${j ? "L" : "M"} ${point.x} ${point.y}`).join(" ")} stroke="#555b59" strokeWidth="88" />)}
          {MAP_LAYOUT.roads.map((road, i) => <path key={`lane-${i}`} d={road.map((point, j) => `${j ? "L" : "M"} ${point.x} ${point.y}`).join(" ")} stroke="#eee5ca" strokeWidth="5" strokeDasharray="34 42" opacity=".8" />)}
        </g>
        {CAMPUS_SPORTS.map((area) => <g key={area.id} filter={`url(#campus-map-shadow-${mapId})`}>
          <rect x={area.x} y={area.y} width={area.w} height={area.h} rx="38" fill={area.sport === "football" ? "#26734f" : area.sport === "basketball" ? "#bd6c3d" : "#397d91"} stroke="#f7f0dd" strokeWidth="13" />
          <rect x={area.x + 26} y={area.y + 26} width={area.w - 52} height={area.h - 52} rx="24" fill="none" stroke="#dce7d9" strokeWidth="5" opacity=".86" />
          {area.sport === "football" ? <><path d={`M ${area.x + area.w / 2} ${area.y + 28} v ${area.h - 56}`} stroke="#dce7d9" strokeWidth="5" /><circle cx={area.x + area.w / 2} cy={area.y + area.h / 2} r="50" fill="none" stroke="#dce7d9" strokeWidth="5" /></> : <path d={`M ${area.x + area.w / 2} ${area.y + 28} v ${area.h - 56}`} stroke="#dce7d9" strokeWidth="5" />}
        </g>)}
        {MAP_LAYOUT.buildings.map((building) => {
          const top = building.y - building.h * .3, height = Math.max(30, building.d + building.h * .3);
          const gate = building.id === "gate" || building.id === "small-gate";
          const color = gate ? "#782a39" : building.id === "atm" ? "#d99a48" : "#f3ead6";
          return <g key={building.id} filter={`url(#campus-map-shadow-${mapId})`}>
            <rect x={building.x} y={top} width={building.w} height={height} rx="18" fill={color} stroke={nearby === building.id ? "#ffca59" : "#70434a"} strokeWidth={nearby === building.id ? "16" : "8"} />
            <rect x={building.x + 12} y={top + 10} width={Math.max(12, building.w - 24)} height={Math.max(8, Math.min(22, height * .22))} rx="8" fill={gate ? "#e3a843" : "#c8a984"} opacity=".92" />
            {building.w > 230 && <path d={`M ${building.x + 26} ${top + height * .65} h ${building.w - 52}`} stroke={gate ? "#e3a843" : "#9b8871"} strokeWidth="8" strokeLinecap="round" />}
          </g>;
        })}
      </svg>
      <div className="pointer-events-none absolute right-2 top-2 flex h-8 w-8 flex-col items-center justify-center rounded-full border border-white/80 bg-[#fffaf0]/90 text-[8px] font-black leading-none text-[#414743] shadow-sm"><span className="text-[11px] text-[#782a39]">↑</span>N</div>
      {(route || destination || origin) && <svg className="pointer-events-none absolute inset-0 overflow-visible" width={size} height={h} viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} aria-hidden>
        {route && route.length > 1 && <polyline className="campus-route-flow" points={route.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#ffbf47" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="38 22" />}
        {origin && <circle cx={origin.x} cy={origin.y} r="38" fill="#27a4db" stroke="white" strokeWidth="12" />}
        {destination && <>
          <circle className="campus-destination-pulse" cx={destination.x} cy={destination.y} r="66" fill="#ffd36b" />
          <g transform={`translate(${destination.x} ${destination.y})`}>
            <g className="campus-destination-bob">
              <path d="M 0 0 C -15 -22 -52 -55 -52 -94 A 52 52 0 1 1 52 -94 C 52 -55 15 -22 0 0 Z" fill="#7b1727" stroke="#ffd36b" strokeWidth="9" />
              <circle cx="0" cy="-94" r="21" fill="#fff4dc" stroke="#ffd36b" strokeWidth="5" />
            </g>
          </g>
        </>}
      </svg>}
      <div ref={dot} className="absolute left-0 top-0 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-[#27a4db] shadow-[0_1px_5px_rgba(25,34,35,.8)]" />
    </div>
  );
}

export function Clock_({ compact }: { compact?: boolean }) {
  const s = useGame();
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-semibold", compact ? "text-xs" : "text-sm")}>
      <Clock className="h-3.5 w-3.5" /> Day {s.day} · {formatTime(s.minutes)}
    </span>
  );
}

export function Objective() {
  const s = useGame();
  const o = OBJECTIVES[s.objective];
  return (
    <div className="flex items-start gap-2 rounded-xl bg-maroon p-3 text-primary-foreground">
      <Target className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gold">Objective {Math.min(s.objective + 1, OBJECTIVES.length)}/{OBJECTIVES.length}</p>
        <p className="text-sm font-semibold leading-snug">{o ? o.text : "Free roam — keep your grades and wallet healthy!"}</p>
      </div>
    </div>
  );
}

export function DesktopSidebar({ nearby, onMenu, onPause }: { nearby: string | null; onMenu: (p: PanelId) => void; onPause: () => void }) {
  const s = useGame();
  const lvl = levelOf(s.xp);
  return (
    <aside className="hud-panel relative z-20 hidden w-80 shrink-0 flex-col gap-3 overflow-y-auto border-y-0 border-l-0 p-4 md:flex">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-secondary px-1 pt-1"><Avatar player={s.player!} size={34} /></div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold leading-tight">{s.player!.name}</p>
          <p className="text-xs text-muted-foreground">{s.player!.level} · Lvl {lvl}</p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-stat-xp" style={{ width: `${s.xp % 100}%` }} /></div>
        </div>
        <Button variant="outline" size="icon" onClick={onPause} aria-label="Pause (Esc)"><Pause /></Button>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-charcoal p-3 text-cream">
        <span className="inline-flex items-center gap-2 text-sm"><Wallet className="h-4 w-4 text-gold" /> Game money</span>
        <span className="font-display text-xl font-bold text-gold">{formatNaira(s.cash)}</span>
      </div>
      <Clock_ />
      <Stats />
      <Objective />
      <Minimap nearby={nearby} size={286} />
      <nav className="grid grid-cols-4 gap-1.5" aria-label="Phone menu">
        {MENU.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => onMenu(id)} className="flex flex-col items-center gap-1 rounded-xl p-2 text-[11px] font-semibold transition hover:bg-secondary hover:text-primary">
            <Icon className="h-5 w-5" />{label}
          </button>
        ))}
      </nav>
      <p className="mt-auto text-[11px] text-muted-foreground">WASD/arrows move · Shift run · E interact · M phone · Esc pause</p>
    </aside>
  );
}

export function MobileTopBar({ nearby, onPause, onOpenTask }: { nearby: string | null; onPause: () => void; onOpenTask: (panel: PanelId) => void }) {
  const s = useGame();
  const taskGuide = {
    "not-started": "Speak with the admissions guide at the Big Gate.",
    "form-needed": "Open Phone → Student Portal and buy the application form for ₦2,500.",
    "scratch-needed": "Open Student Portal and buy the scratch card for ₦700.",
    "portal-ready": "Open Student Portal to check your admission result.",
    admitted: OBJECTIVES[s.objective]?.text ?? "Collect your student ID at the Student Service Point.",
  }[s.admissionStage];
  const portalActionAvailable = s.admissionStage === "form-needed" || s.admissionStage === "scratch-needed" || s.admissionStage === "portal-ready";
  const servicePointActionAvailable = s.admissionStage === "admitted" && OBJECTIVES[s.objective]?.id === "admin";
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[5000] flex gap-2 p-2 md:hidden">
      <div className="hud-panel pointer-events-auto flex-1 space-y-1.5 rounded-2xl p-2.5">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-bold text-primary">Game {formatNaira(s.cash)}</span>
          <Clock_ compact />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPause} aria-label="Pause"><Pause /></Button>
        </div>
        <Stats compact />
        <div className="flex items-center gap-2 rounded-xl border border-accent/50 bg-card/90 p-2">
          <Target className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1"><p className="text-[9px] font-extrabold uppercase tracking-wider text-primary">Current task</p><p className="text-[10px] font-semibold leading-snug text-foreground">{taskGuide}</p></div>
          {(portalActionAvailable || servicePointActionAvailable) && <button type="button" onClick={() => onOpenTask(servicePointActionAvailable ? "map" : "admissions")} className="shrink-0 rounded-lg bg-maroon px-2.5 py-2 text-[10px] font-bold text-white">{servicePointActionAvailable ? "Open Map" : "Open Portal"}</button>}
        </div>
      </div>
      <div className="pointer-events-auto hidden min-[420px]:block"><Minimap nearby={nearby} size={96} /></div>
    </div>
  );
}

export function PhoneButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Open phone menu" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-charcoal text-gold shadow-hud active:scale-95">
      <Smartphone className="h-6 w-6" />
    </button>
  );
}
