import { useEffect, useRef } from "react";
import { Flame, Zap, Smile, Wallet, Clock, Target, Pause, Smartphone, Map, GraduationCap, Briefcase, Users, Backpack, UserRound, Settings } from "lucide-react";
import { BUILDINGS, OBJECTIVES, WORLD } from "@/game/data";
import { formatNaira, formatTime, levelOf, useGame } from "@/game/store";
import { livePos } from "./CampusScene";
import { Avatar } from "./Avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PanelId = "map" | "academics" | "hustles" | "social" | "inventory" | "profile" | "settings";
export const MENU: { id: PanelId; label: string; Icon: typeof Map }[] = [
  { id: "map", label: "Map", Icon: Map },
  { id: "academics", label: "Academics", Icon: GraduationCap },
  { id: "hustles", label: "Hustles", Icon: Briefcase },
  { id: "social", label: "Social", Icon: Users },
  { id: "inventory", label: "Inventory", Icon: Backpack },
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

export function Minimap({ nearby, size = 190 }: { nearby: string | null; size?: number }) {
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
    <div className="relative overflow-hidden rounded-xl border-2 border-maroon bg-grass" style={{ width: size, height: h }} aria-label="Minimap">
      <div className="absolute bg-road" style={{ left: 1180 * k, top: 260 * k, width: 140 * k, height: 1440 * k }} />
      <div className="absolute bg-road" style={{ left: 220 * k, top: 830 * k, width: 1980 * k, height: 110 * k }} />
      {BUILDINGS.map((b) => (
        <div key={b.id} title={b.name} className={cn("absolute rounded-sm", nearby === b.id ? "bg-accent" : "bg-maroon")} style={{ left: b.x * k, top: (b.y - b.h * 0.3) * k, width: b.w * k, height: Math.max(4, (b.d + b.h * 0.3) * k) }} />
      ))}
      <div ref={dot} className="absolute left-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-cream bg-accent shadow" />
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
        <span className="inline-flex items-center gap-2 text-sm"><Wallet className="h-4 w-4 text-gold" /> Wallet</span>
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
      <p className="mt-auto text-[11px] text-muted-foreground">WASD/arrows move · E interact · M phone · Esc pause</p>
    </aside>
  );
}

export function MobileTopBar({ nearby, onPause }: { nearby: string | null; onPause: () => void }) {
  const s = useGame();
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[5000] flex gap-2 p-2 md:hidden">
      <div className="hud-panel pointer-events-auto flex-1 space-y-1.5 rounded-2xl p-2.5">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-bold text-primary">{formatNaira(s.cash)}</span>
          <Clock_ compact />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPause} aria-label="Pause"><Pause /></Button>
        </div>
        <Stats compact />
        <p className="truncate text-[11px] font-semibold"><Target className="mr-1 inline h-3 w-3 text-primary" />{OBJECTIVES[s.objective]?.text ?? "Free roam"}</p>
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
