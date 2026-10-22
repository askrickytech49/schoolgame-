import { useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { CAMPUS_SPORTS, FILLED_AREA, LOVE_GARDENS, MAP_LAYOUT, START_POS, WORLD, type Building } from "@/game/data";
import { getGame, setGame } from "@/game/store";
import type { Player } from "@/game/types";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { playFootstep } from "@/game/audio";

export interface InputState {
  keys: Set<string>;
  joy: { x: number; y: number };
}

/** Live avatar position shared with the minimap without re-rendering React every frame. */
export const livePos = { x: 0, y: 0 };

const SPEED = 230;
export const doorOf = (b: Building) => (b.walkthrough ? { x: b.x + b.w / 2, y: b.y + b.d / 2 } : { x: b.x + b.w / 2, y: b.y + b.d + 28 });
const BIG_GATE = MAP_LAYOUT.buildings.find((b) => b.id === "gate")!;
const SMALL_GATE = MAP_LAYOUT.buildings.find((b) => b.id === "small-gate")!;
const BIG_GATE_TOP = BIG_GATE.y - BIG_GATE.h;
const SECURITY_POST = { x: BIG_GATE.x + BIG_GATE.w / 2 - 38, y: BIG_GATE_TOP + 66, w: 76, h: 82 };
const SMALL_SECURITY_POST = { x: SMALL_GATE.x + 42, y: SMALL_GATE.y - SMALL_GATE.h + 52, w: 74, h: 72 };
const ELEPHANT_PLINTH = { x: BIG_GATE.x + BIG_GATE.w / 2 - 20, y: BIG_GATE.y + BIG_GATE.d + 8, w: 40, h: 34 };
const CAMPUS_FENCE = [
  { x1: 55, y1: 280, x2: 2385, y2: 280 },
  { x1: 55, y1: 280, x2: 55, y2: 2372 },
  { x1: 2385, y1: 280, x2: 2385, y2: 2372 },
  { x1: 55, y1: 2372, x2: 255, y2: 2372 },
  { x1: 675, y1: 2372, x2: 1685, y2: 2372 },
  { x1: 2285, y1: 2372, x2: 2385, y2: 2372 },
];

const SOLIDS = [
  ...MAP_LAYOUT.buildings.filter((b) => !b.walkthrough).map((b) => ({ x: b.x - 8, y: b.y - 6, w: b.w + 16, h: b.d + 12 })),
  { x: 55, y: 272, w: 2330, h: 16 },
  { x: 47, y: 280, w: 16, h: 2092 },
  { x: 2377, y: 280, w: 16, h: 2092 },
  { x: 55, y: 2364, w: 200, h: 16 },
  { x: 675, y: 2364, w: 1010, h: 16 },
  { x: 2285, y: 2364, w: 100, h: 16 },
  SECURITY_POST, // security post between the gate lanes
  SMALL_SECURITY_POST, // small security booth beside the Small Gate entrance
  ELEPHANT_PLINTH, // elephant sculpture plinth in the forecourt
];
function blocked(x: number, y: number) {
  if (x < 40 || x > WORLD.w - 40 || y < 80 || y > WORLD.h - 20) return true;
  return SOLIDS.some((r) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h);
}

function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}
function inRect(x: number, y: number, r: { x: number; y: number; w: number; h: number }, pad = 0) {
  return x > r.x - pad && x < r.x + r.w + pad && y > r.y - pad && y < r.y + r.h + pad;
}

function distanceToRoad(x: number, y: number) {
  let nearest = Number.POSITIVE_INFINITY;
  for (const route of MAP_LAYOUT.roads) for (let i = 1; i < route.length; i++) {
    const a = route[i - 1], b = route[i], dx = b.x - a.x, dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy)));
    nearest = Math.min(nearest, Math.hypot(x - (a.x + t * dx), y - (a.y + t * dy)));
  }
  return nearest;
}

function nearRoad(x: number, y: number, width = 120) {
  return distanceToRoad(x, y) < width / 2;
}

function canWalkTo(x: number, y: number) {
  if (blocked(x, y)) return false;
  // Student movement stays on the drawn roads and access paths.
  return distanceToRoad(x, y) < 44;
}

function crossesBigGate(fromX: number, fromY: number, toX: number, toY: number) {
  const thresholdY = 2372;
  const crossesLine = (fromY >= thresholdY && toY < thresholdY) || (fromY < thresholdY && toY >= thresholdY);
  const minX = Math.min(fromX, toX), maxX = Math.max(fromX, toX);
  const insideGateOpening = minX === maxX
    ? minX >= BIG_GATE.x && minX <= BIG_GATE.x + BIG_GATE.w
    : maxX >= BIG_GATE.x && minX <= BIG_GATE.x + BIG_GATE.w;
  return crossesLine && insideGateOpening;
}

type WalkTarget = { x: number; y: number; id: string; route: { x: number; y: number }[]; step: number };
export function findWalkRoute(from: { x: number; y: number }, to: { x: number; y: number }) {
  const cell = 40, cols = Math.ceil(WORLD.w / cell), rows = Math.ceil(WORLD.h / cell), total = cols * rows;
  const indexAt = (x: number, y: number) => Math.max(0, Math.min(rows - 1, Math.floor(y / cell))) * cols + Math.max(0, Math.min(cols - 1, Math.floor(x / cell)));
  const pointAt = (index: number) => ({ x: (index % cols) * cell + cell / 2, y: Math.floor(index / cols) * cell + cell / 2 });
  const start = indexAt(from.x, from.y), end = indexAt(to.x, to.y);
  const walkable = (index: number) => {
    const p = pointAt(index);
    return !blocked(p.x, p.y) && nearRoad(p.x, p.y, 100);
  };
  if (!walkable(end)) return [];
  const g = new Float64Array(total); g.fill(Infinity); g[start] = 0;
  const parent = new Int32Array(total); parent.fill(-1);
  const closed = new Uint8Array(total), open = [start];
  const h = (a: number, b: number) => {
    const ax = a % cols, ay = Math.floor(a / cols), bx = b % cols, by = Math.floor(b / cols);
    const dx = Math.abs(ax - bx), dy = Math.abs(ay - by);
    return 10 * Math.max(dx, dy) + 4 * Math.min(dx, dy);
  };
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  let found = false;
  while (open.length) {
    let best = 0;
    for (let i = 1; i < open.length; i++) if (g[open[i]] + h(open[i], end) < g[open[best]] + h(open[best], end)) best = i;
    const current = open.splice(best, 1)[0];
    if (current === end) { found = true; break; }
    if (closed[current]) continue;
    closed[current] = 1;
    const cx = current % cols, cy = Math.floor(current / cols);
    for (const [dx, dy] of directions) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
      const next = ny * cols + nx;
      if (closed[next] || !walkable(next)) continue;
      if (dx && dy && (blocked(cx * cell + cell / 2 + dx * cell, cy * cell + cell / 2) || blocked(cx * cell + cell / 2, cy * cell + cell / 2 + dy * cell))) continue;
      const p = pointAt(next), diagonal = dx !== 0 && dy !== 0;
      const cost = (diagonal ? 14 : 10) * (nearRoad(p.x, p.y, 115) ? 1 : 1.45);
      const candidate = g[current] + cost;
      if (candidate < g[next]) { g[next] = candidate; parent[next] = current; open.push(next); }
    }
  }
  if (!found) return [];
  const route: { x: number; y: number }[] = [];
  for (let at = end; at !== start && at >= 0; at = parent[at]) route.push(pointAt(at));
  route.reverse();
  route.push(to);
  return route;
}

function walkTarget(id: string, to: { x: number; y: number }): WalkTarget {
  return { ...to, id, route: findWalkRoute(livePos, to), step: 0 };
}

const ROOF_CLASS = { roof: "bg-roof", "roof-alt": "bg-roof-alt", "roof-zinc": "bg-roof-zinc" } as const;

const CAMPUS_HUBS = [
  { name: "Library", path: [{ x: 250, y: 1035 }, { x: 250, y: 1020 }] },
  { name: "GH", path: [{ x: 400, y: 1485 }] },
  { name: "SLT", path: [{ x: 625, y: 1485 }, { x: 625, y: 1536 }] },
  { name: "Statistics block", path: [{ x: 1070, y: 1485 }, { x: 1070, y: 1476 }] },
  { name: "ABC block", path: [{ x: 1150, y: 2100 }] },
  { name: "SUG", path: [{ x: 1855, y: 829 }] },
  { name: "Rector Office", path: [{ x: 2065, y: 1715 }, { x: 2175, y: 1548 }] },
  { name: "Love Garden", path: [{ x: 1330, y: 2100 }, { x: 1330, y: 1740 }] },
  { name: "Big gate", path: [{ x: 1855, y: 2205 }, { x: 1900, y: 2240 }, { x: 1900, y: 2414 }] },
];
const STUDENT_COUNT = 20;
const STUDENT_HANDLES = [
  "@ada_codes", "@tolu_sketch", "@boma_baller", "@kamsi_vibes", "@chioma_joy", "@emeka_dev",
  "@zara_reads", "@ifeanyi_tee", "@nene_sings", "@david_kicks", "@amara_gist", "@chidi_cooks",
  "@somto_plays", "@ugo_builds", "@lola_dances", "@favour_art", "@dami_dribbles", "@obi_studies",
  "@precious_fx", "@kelly_codes",
];
const CROWD_COLORS = ["#d97535", "#287a62", "#4267a5", "#8c4f8a", "#c7a23c", "#e8e0cf", "#9c493f", "#367f98"];
const SKIN_COLORS = ["#4a2c1d", "#6b3f26", "#8a5a3b", "#a8744f", "#c69373"];

function destinationFor(minutes: number, id: number, round: number) {
  const hour = Math.floor(minutes / 60) % 24;
  let options: number[];
  if (hour >= 6 && hour < 9) options = [0, 1, 2, 3, 5];
  else if (hour < 12) options = [1, 2, 2, 3, 5];
  else if (hour < 14) options = [4, 4, 6, 6, 2];
  else if (hour < 17) options = [1, 2, 3, 5, 7];
  else if (hour < 21) options = [4, 6, 7, 0, 8];
  else options = [0, 0, 4, 8];
  return options[(id * 7 + round * 3) % options.length];
}

function StudentCrowd({ timeMinutes }: { timeMinutes: number }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const timeRef = useRef(timeMinutes);
  timeRef.current = timeMinutes;

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const agents = Array.from({ length: STUDENT_COUNT }, (_, i) => {
      const home = i % CAMPUS_HUBS.length;
      const hub = CAMPUS_HUBS[home];
      const goal = hub.path[hub.path.length - 1];
      const angle = i * 2.399;
      const radius = 6 + (i % 3) * 5;
      const round = 0;
      const target = destinationFor(timeRef.current, i, round);
      let start = { x: goal.x + Math.cos(angle) * radius, y: goal.y + Math.sin(angle) * radius };
      if (distanceToRoad(start.x, start.y) > 38) start = { ...goal };
      const destination = CAMPUS_HUBS[target].path.at(-1)!;
      const route = target === home ? [] : findWalkRoute(start, destination);
      return {
        x: start.x, y: start.y,
        hub: home, target, route, step: 0, wait: (i % 30) * 0.65, round,
        speed: 28 + (i % 5) * 6, face: 1,
      };
    });
    let simulatedSeconds = 0;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      simulatedSeconds += dt;
      agents.forEach((p, i) => {
        const el = refs.current[i];
        if (!el) return;
        el.title = `Student travelling to ${CAMPUS_HUBS[p.target].name}`;
        if (p.wait > 0) p.wait -= dt;
        else if (p.step < p.route.length) {
          const point = p.route[p.step];
          const dx = point.x - p.x, dy = point.y - p.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 5) p.step++;
          else {
            const travel = Math.min(distance, p.speed * dt);
            p.x += dx / distance * travel;
            p.y += dy / distance * travel;
            if (Math.abs(dx) > 1) p.face = dx < 0 ? -1 : 1;
          }
        } else {
          p.hub = p.target;
          p.round++;
          p.target = destinationFor(timeRef.current, i, p.round);
          if (p.target === p.hub) p.target = (p.hub + 1 + i % (CAMPUS_HUBS.length - 1)) % CAMPUS_HUBS.length;
          const hub = CAMPUS_HUBS[p.hub];
          p.route = findWalkRoute(p, CAMPUS_HUBS[p.target].path.at(-1)!);
          p.step = 0;
          p.wait = 3 + (i % 9) * 1.5;
        }
        el.style.transform = `translate3d(${p.x - 8}px, ${p.y - 30}px, 0)`;
        el.style.zIndex = String(Math.round(p.y));
        const sprite = el.querySelector(".student-sprite") as HTMLElement | null;
        if (sprite) sprite.style.transform = `scaleX(${p.face})`;
        const legs = el.querySelector(".student-legs") as HTMLElement | null;
        if (legs) legs.style.transform = p.wait <= 0 && p.step < p.route.length && Math.floor(simulatedSeconds * 5 + i) % 2 ? "translateY(-2px)" : "translateY(0)";
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <>
    {Array.from({ length: STUDENT_COUNT }, (_, i) => <div key={`student-${i}`} ref={(el) => { refs.current[i] = el; }} className="pointer-events-none absolute left-0 top-0 h-8 w-4">
      <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/70 bg-maroon px-1.5 py-0.5 text-[7px] font-bold leading-none text-cream shadow">{STUDENT_HANDLES[i]}</span>
      <span className="student-sprite absolute inset-0 origin-center">
        <span className="absolute left-0 top-0 h-2 w-2 rounded-full border border-charcoal/30" style={{ backgroundColor: SKIN_COLORS[i % SKIN_COLORS.length] }} />
        <span className="absolute left-0.5 top-2 h-3 w-3 rounded-sm border border-charcoal/20" style={{ backgroundColor: CROWD_COLORS[(i * 3) % CROWD_COLORS.length] }} />
        <span className="absolute -left-1 top-2 h-2 w-1 rounded bg-charcoal/35" />
        <span className="student-legs absolute inset-0"><span className="absolute left-0.5 top-5 h-2 w-1 rounded bg-charcoal" /><span className="absolute left-2 top-5 h-2 w-1 rounded bg-charcoal" /></span>
        <span className="absolute left-2.5 top-2 h-2 w-1 rounded bg-amber-900/80" />
      </span>
    </div>)}
  </>;
}

function BuildingView({ b, near, showLabel, onClick, highlight = false }: { b: Building; near: boolean; showLabel: boolean; onClick: () => void; highlight?: boolean }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[b.icon] ?? Icons.Building2;
  if (b.id === "gate") return <BigGateView b={b} near={near} onClick={onClick} />;
  if (b.id === "small-gate") return <SmallGateView b={b} near={near} showLabel={showLabel} onClick={onClick} />;
  if (b.walkthrough) {
    return (
      <button type="button" onClick={onClick} aria-label={`Go to ${b.name}`} className="group absolute cursor-pointer" style={{ left: b.x, top: b.y - b.h, width: b.w, height: b.h + b.d, zIndex: b.y + b.d + 40 }}>
        <div className="absolute bottom-0 left-0 h-full w-7 rounded-t-md bg-wall shadow-building ring-2 ring-maroon" />
        <div className="absolute bottom-0 right-0 h-full w-7 rounded-t-md bg-wall shadow-building ring-2 ring-maroon" />
        <div className="kente absolute inset-x-0 top-0 h-6 rounded-sm" />
        <div className="absolute inset-x-6 top-6 flex h-7 items-center justify-center bg-maroon font-display text-xs font-bold tracking-widest text-gold">{b.name.toUpperCase()}</div>
        {showLabel && <Label name={b.name} near={near} Icon={Icon} />}
      </button>
    );
  }
  const windows = Math.max(3, Math.floor(b.w / 48));
  return (
    <button type="button" onClick={onClick} aria-label={`Go to ${b.name}`}
      className={cn("group absolute cursor-pointer text-left transition-[filter] hover:brightness-110", near && "brightness-110")}
      style={{ left: b.x, top: b.y - b.h, width: b.w, height: b.d + b.h, zIndex: b.y + b.d }}>
      <div className="absolute -bottom-3 left-3 right-[-14px] h-6 rounded-full bg-charcoal/25 blur-md" />
      {/* roof */}
      <div className={cn("absolute right-[-13px] top-0 border-b-4 border-charcoal/25 brightness-75", ROOF_CLASS[b.roof])} style={{ width: 14, height: b.d, transform: "skewY(-22deg)", transformOrigin: "top left" }} />
      <div className={cn("absolute inset-x-0 top-0 rounded-t-lg border-b-4 border-charcoal/20", ROOF_CLASS[b.roof])} style={{ height: b.d }}>
        <div className="absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 rounded bg-charcoal/15" />
        <div className="absolute inset-0 rounded-t-lg opacity-30" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 10px, var(--charcoal) 10px 11px)" }} />
      </div>
      {/* front wall */}
      <div className="absolute right-[-13px] bg-wall-shade" style={{ top: b.d, width: 14, height: b.h, transform: "skewY(-18deg)", transformOrigin: "top left" }} />
      <div className="absolute inset-x-0 bottom-0 overflow-hidden rounded-b-md bg-wall shadow-building" style={{ height: b.h }}>
        <div className="absolute inset-x-0 top-0 h-2 bg-wall-shade" />
        <div className="absolute inset-x-0 bottom-0 h-3 bg-maroon/80" />
        <div className="absolute inset-x-3 top-5 flex justify-between">
          {Array.from({ length: windows }).map((_, i) => (
            <div key={i} className="h-7 w-7 rounded-sm border-2 border-wall-shade bg-window" />
          ))}
        </div>
        {b.h > 110 && (
          <div className="absolute inset-x-3 top-16 flex justify-between">
            {Array.from({ length: windows }).map((_, i) => <div key={i} className="h-6 w-7 rounded-sm border-2 border-wall-shade bg-window" />)}
          </div>
        )}
        <div className="absolute left-1/2 top-1 max-w-[85%] -translate-x-1/2 truncate rounded-sm bg-maroon px-2 py-0.5 text-[8px] font-bold tracking-wide text-gold shadow">{b.name}</div>
        <div className="absolute bottom-3 left-1/2 h-11 w-12 -translate-x-1/2 rounded-t-md border-2 border-maroon bg-charcoal/80" />
        <div className="absolute -bottom-1 left-1/2 h-2 w-16 -translate-x-1/2 rounded-b bg-path shadow" />
      </div>
      {highlight && <div className="pointer-events-none absolute -top-9 left-1/2 z-[999] -translate-x-1/2 animate-bounce whitespace-nowrap rounded-full border-2 border-gold bg-maroon px-3 py-1 text-xs font-black text-white shadow-lg">📍 {b.name}</div>}
      {showLabel && <Label name={b.name} near={near} Icon={Icon} />}
    </button>
  );
}

function SmallGateView({ b, near, showLabel, onClick }: { b: Building; near: boolean; showLabel: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-label="Go to the Small Gate security checkpoint" className={cn("group absolute cursor-pointer", near && "brightness-110")} style={{ left: b.x, top: b.y - b.h, width: b.w, height: b.h + b.d, zIndex: b.y + b.d + 40 }}>
    <div className="absolute bottom-0 left-0 h-full w-7 rounded-t-md bg-wall shadow-building ring-2 ring-maroon" />
    <div className="absolute bottom-0 right-0 h-full w-7 rounded-t-md bg-wall shadow-building ring-2 ring-maroon" />
    <div className="kente absolute inset-x-0 top-0 h-6 rounded-sm" />
    <div className="absolute inset-x-6 top-6 flex h-7 items-center justify-center bg-maroon font-display text-xs font-bold tracking-widest text-gold">SMALL GATE</div>
    <div className="absolute top-[52px] h-[72px] w-[74px] rounded-t-lg border-[3px] border-maroon bg-wall shadow-building" style={{ left: 42 }}>
      <div className="h-5 rounded-t bg-roof text-center text-[8px] font-black leading-5 tracking-wider text-cream">SECURITY</div>
      <div className="flex h-7 items-center justify-center bg-charcoal text-gold"><Icons.Shield className="h-4 w-4" /></div>
      <div className="absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 rounded-t border border-maroon bg-charcoal" />
    </div>
    {showLabel && <Label name={b.name} near={near} Icon={Icons.DoorOpen} />}
  </button>;
}

function Label({ name, near, Icon }: { name: string; near: boolean; Icon: Icons.LucideIcon }) {
  return (
    <div className={cn("pointer-events-none absolute -top-9 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold shadow-hud transition-all",
      near ? "scale-110 bg-accent text-accent-foreground" : "bg-card text-card-foreground")}>
      <Icon className="h-3.5 w-3.5" /> {name}
    </div>
  );
}

function BigGateView({ b, near, onClick }: { b: Building; near: boolean; onClick: () => void }) {
  const lanes = [
    { title: "ENTRY TO CAMPUS", left: 120, color: "bg-emerald-900", arm: 20 },
    { title: "EXIT TO TOWN", left: 295, color: "bg-blue-950", arm: 160 },
  ];
  const portalWidth = 190;
  const portalHeight = b.h + b.d - 60;
  const sculptureTop = b.h + b.d + 8;
  return <button type="button" onClick={onClick} aria-label="Walk to the Big Gate checkpoint" className={cn("group absolute cursor-pointer text-left", near && "brightness-110")} style={{ left: b.x, top: b.y - b.h, width: b.w, height: sculptureTop + 62, zIndex: b.y + b.d + 55 }}>
    <div className="kente absolute inset-x-0 top-0 h-3 rounded-t-lg border-x-4 border-t-4 border-charcoal" />
    <div className="absolute inset-x-0 top-3 flex h-[54px] items-center justify-center border-x-4 border-charcoal bg-roof px-3 text-center font-display text-[21px] font-black tracking-[0.075em] text-gold shadow-building sm:text-[25px]">
      OGBONNAYA ONU POLYTECHNIC
    </div>
    {lanes.map((lane) => <div key={lane.title} className="absolute top-[60px]" style={{ left: lane.left, width: portalWidth, height: portalHeight }}>
      <div className={`absolute inset-x-0 top-0 flex h-10 items-center justify-center border-x-4 border-charcoal px-1 text-center font-display text-[11px] font-black tracking-[0.1em] text-white shadow ${lane.color}`}>{lane.title}</div>
      <div className="absolute bottom-0 left-0 w-6 border-x-4 border-maroon bg-wall shadow-building" style={{ height: portalHeight - 40 }} />
      <div className="absolute bottom-0 right-0 w-6 border-x-4 border-maroon bg-wall shadow-building" style={{ height: portalHeight - 40 }} />
      <div className="absolute bottom-2 h-3 w-3 rounded-sm border-2 border-charcoal bg-roof shadow-md" style={{ left: lane.arm }} />
      <div className="absolute bottom-4 h-[58px] w-2.5 rounded-t-sm border border-charcoal bg-[repeating-linear-gradient(0deg,#f4e4c5_0_10px,#8a1f2f_10px_20px)] shadow-md" style={{ left: lane.arm + 1 }} />
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-charcoal px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-gold">CHECKPOINT</span>
      <div className="absolute bottom-0 left-1/2 h-4 w-[156px] -translate-x-1/2 rounded-t border-x-2 border-t-2 border-maroon bg-roof" />
    </div>)}
    <div className="absolute top-[68px] h-[82px] rounded-t-xl border-4 border-maroon bg-wall shadow-building" style={{ left: b.w / 2 - 38, width: 76 }}>
      <div className="h-6 rounded-t-md bg-roof text-center text-[9px] font-black leading-6 tracking-wider text-cream">SECURITY</div>
      <div className="flex h-8 items-center justify-center bg-charcoal text-gold"><Icons.Shield className="h-5 w-5" /></div>
      <div className="absolute bottom-0 left-1/2 h-5 w-5 -translate-x-1/2 rounded-t border-2 border-maroon bg-charcoal" />
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-maroon px-1.5 py-0.5 text-[8px] font-black text-cream">CHECKPOINT</span>
    </div>
    <div className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center" style={{ top: sculptureTop }} aria-label="Elephant sculpture">
      <ElephantArt />
    </div>
    {near && <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2"><Label name="Big Gate" near Icon={Icons.DoorOpen} /></div>}
  </button>;
}

function ElephantArt() {
  return <>
    <svg width="68" height="54" viewBox="0 0 58 48" role="img" aria-label="Campus elephant sculpture">
      <ellipse cx="28" cy="43" rx="25" ry="4" fill="#342721" opacity=".35" />
      <path d="M9 31c0-11 7-19 19-19h7c8 0 13 6 13 14v8H11c-1 0-2-1-2-3Z" fill="#b38a45" stroke="#684c28" strokeWidth="2" />
      <circle cx="40" cy="19" r="11" fill="#c29a52" stroke="#684c28" strokeWidth="2" />
      <ellipse cx="33" cy="20" rx="9" ry="11" fill="#a77b3a" stroke="#684c28" strokeWidth="1.5" />
      <path d="M47 21c6 4 6 12 1 15-2 1-4 0-4-2 4-3 2-5 0-7" fill="none" stroke="#a77b3a" strokeWidth="5" strokeLinecap="round" />
      <path d="M22 30v9m13-9v9" stroke="#76552f" strokeWidth="4" strokeLinecap="round" />
      <path d="M46 22l4 1" stroke="#fff3d2" strokeWidth="2" strokeLinecap="round" />
      <circle cx="43" cy="17" r="1.2" fill="#211b17" />
    </svg>
    <span className="-mt-1 whitespace-nowrap rounded bg-gold px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-charcoal shadow">Campus Elephant</span>
  </>;
}

function SideCampusElephant() {
  const x = 2015, y = 1960;
  return <div className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center" style={{ left: x, top: y, zIndex: y + 70 }}>
    <ElephantArt />
  </div>;
}

function GardenView({ garden, near, showLabel, onClick }: { garden: (typeof LOVE_GARDENS)[number]; near: boolean; showLabel: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={`Visit ${garden.name}`} className="absolute rounded-[42%] border-4 border-emerald-900/40 bg-emerald-700/90 shadow-inner transition hover:brightness-110" style={{ left: garden.x, top: garden.y, width: garden.w, height: garden.h, zIndex: garden.y + 30 }}>
      <span className="absolute inset-2 rounded-[40%] border border-lime-100/45 bg-lime-300/20" />
      <span className="absolute left-[18%] top-[18%] h-7 w-7 rounded-full bg-emerald-950/75 shadow-[0_8px_0_-3px_#795548]" />
      <span className="absolute right-[18%] top-[28%] h-6 w-6 rounded-full bg-emerald-950/70 shadow-[0_8px_0_-3px_#795548]" />
      <span className="absolute bottom-[20%] left-1/2 h-2 w-12 -translate-x-1/2 rounded bg-amber-800 shadow-[0_4px_0_#4e342e]" />
      <span className="absolute bottom-[17%] left-[22%] h-2 w-1 rounded bg-amber-950" />
      <span className="absolute bottom-[17%] right-[22%] h-2 w-1 rounded bg-amber-950" />
      <span className="absolute left-[40%] top-[63%] text-sm">🌼</span>
      {showLabel && <span className={cn("absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold shadow-hud", near ? "bg-accent text-accent-foreground" : "bg-card text-card-foreground")}>{garden.name}</span>}
    </button>
  );
}

function SportsGroundView({ area, near, onClick }: { area: (typeof CAMPUS_SPORTS)[number]; near: boolean; onClick: () => void }) {
  const isFootball = area.sport === "football";
  const isBasketball = area.sport === "basketball";
  return <button type="button" onClick={onClick} aria-label={`Visit ${area.name}`} className={cn("absolute overflow-hidden border-[3px] shadow-lg transition hover:brightness-110", near ? "z-[700] border-gold ring-4 ring-gold/50" : "border-white/80", isFootball ? "rounded-[18%] bg-[#43844e]" : isBasketball ? "rounded-xl bg-[#bd7540]" : "rounded-xl bg-[#4a94ad]")} style={{ left: area.x, top: area.y, width: area.w, height: area.h, zIndex: area.y + 20 }}>
    {isFootball ? <>
      <span className="absolute inset-3 rounded-[16%] border-2 border-white/90" />
      <span className="absolute inset-y-3 left-1/2 border-l-2 border-white/85" />
      <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/85" />
      <span className="absolute left-3 top-[30%] h-[40%] w-[15%] border-2 border-l-white/85 border-y-white/85" />
      <span className="absolute right-3 top-[30%] h-[40%] w-[15%] border-2 border-r-white/85 border-y-white/85" />
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-md bg-maroon px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">Football Field</span>
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/35 px-2 py-0.5 text-[9px] font-bold text-white">⚽ Kickabout · drills · matches</span>
    </> : <>
      <span className="absolute inset-2 border-2 border-white/85" />
      <span className="absolute inset-y-2 left-1/2 border-l-2 border-white/85" />
      {isBasketball ? <>
        <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/85" />
        <span className="absolute left-2 top-[24%] h-[52%] w-[18%] border-2 border-l-white/85 border-y-white/85" />
        <span className="absolute right-2 top-[24%] h-[52%] w-[18%] border-2 border-r-white/85 border-y-white/85" />
        <span className="absolute left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-orange-100" />
        <span className="absolute right-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-orange-100" />
        <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-md bg-[#783c20] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">Basketball Court</span>
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-black/35 px-2 py-0.5 text-[9px] font-bold text-white">🏀 Shootaround · quick games</span>
      </> : <>
        <span className="absolute inset-y-2 left-1/2 border-l-2 border-dashed border-white/90" />
        <span className="absolute left-[28%] top-2 h-[calc(100%-1rem)] border-l-2 border-white/85" />
        <span className="absolute right-[28%] top-2 h-[calc(100%-1rem)] border-l-2 border-white/85" />
        <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-md bg-[#236779] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">Volleyball Court</span>
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-black/35 px-2 py-0.5 text-[9px] font-bold text-white">🏐 Practice · student matches</span>
        <span className="absolute left-1/2 top-2 h-[calc(100%-1rem)] border-l border-dashed border-white" />
      </>}
    </>}
  </button>;
}

function roadPath(route: (typeof MAP_LAYOUT.roads)[number]) {
  return route.map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export function CampusScene({ player, input, frozen, showLabels, timeMinutes, nearby, onNearby, onArrive, canEnterBigGate = true, onGateBlocked = () => {}, waypointId = null, preview = false, initialPosition }: {
  player: Player;
  input: React.RefObject<InputState>;
  frozen: boolean;
  showLabels: boolean;
  timeMinutes: number;
  nearby: string | null;
  onNearby: (id: string | null) => void;
  onArrive: (id: string) => void;
  canEnterBigGate?: boolean;
  onGateBlocked?: () => void;
  waypointId?: string | null;
  preview?: boolean;
  initialPosition?: { x: number; y: number };
}) {
  const viewRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const bobRef = useRef<HTMLDivElement>(null);
  const target = useRef<WalkTarget | null>(null);
  const previewPan = useRef({ x: 0, y: 0 });
  const activeDrag = useRef<{ pointerId: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const timeRef = useRef(timeMinutes);
  timeRef.current = timeMinutes;
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;
  const cb = useRef({ onNearby, onArrive, onGateBlocked });
  cb.current = { onNearby, onArrive, onGateBlocked };

  const trees = useMemo(() => {
    const out: { x: number; y: number; s: number; k: number }[] = [];
    for (let i = 0; i < 260 && out.length < 95; i++) {
      const x = 60 + hash(i + 1) * (WORLD.w - 120);
      const y = 160 + hash(i + 77) * (WORLD.h - 200);
      const bad = nearRoad(x, y, 120) || LOVE_GARDENS.some((g) => inRect(x, y, g, 35)) || inRect(x, y, FILLED_AREA) ||
        MAP_LAYOUT.buildings.some((b) => inRect(x, y, { x: b.x, y: b.y - b.h, w: b.w, h: b.d + b.h + 60 }, 30)) ||
        Math.hypot(x - START_POS.x, y - START_POS.y) < 140;
      if (!bad) out.push({ x, y, s: 0.8 + hash(i + 300) * 0.6, k: Math.floor(hash(i + 9) * 3) });
    }
    return out;
  }, []);

  useEffect(() => {
    const p = initialPosition ?? getGame().pos;
    let x = blocked(p.x, p.y) ? START_POS.x : p.x;
    let y = blocked(p.x, p.y) ? START_POS.y : p.y;
    let travelRevision = getGame().travelRevision;
    let last = performance.now();
    let raf = 0;
    let lastNear: string | null = null;
    let lastSave = 0;
    let face = 1;
    let camX = 0, camY = 0, cameraReady = false, lastFootstep = 0;
    let motionClass = "animate-idle";
    const size = { w: 800, h: 600 };
    const ro = new ResizeObserver(([e]) => {
      size.w = e.contentRect.width;
      size.h = e.contentRect.height;
    });
    if (viewRef.current) ro.observe(viewRef.current);

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      let dx = 0, dy = 0;
      const gameState = getGame();
      if (gameState.travelRevision !== travelRevision) {
        x = gameState.pos.x;
        y = gameState.pos.y;
        travelRevision = gameState.travelRevision;
        target.current = null;
      }
      if (!frozenRef.current) {
        const k = input.current?.keys ?? new Set<string>();
        if (k.has("left")) dx -= 1;
        if (k.has("right")) dx += 1;
        if (k.has("up")) dy -= 1;
        if (k.has("down")) dy += 1;
        const j = input.current?.joy;
        if (j && (Math.abs(j.x) > 0.1 || Math.abs(j.y) > 0.1)) { dx = j.x; dy = j.y; }
        if (dx || dy) target.current = null;
        else if (target.current) {
          if (!target.current.route.length) target.current = null;
          else {
          const destination = target.current.route[target.current.step] ?? target.current;
          const tx = destination.x - x, ty = destination.y - y;
          const dist = Math.hypot(tx, ty);
          if (dist < 10) {
            if (target.current.step < target.current.route.length - 1) target.current.step++;
            else {
              const id = target.current.id;
              target.current = null;
              cb.current.onArrive(id);
            }
          } else { dx = tx / dist; dy = ty / dist; }
          }
        }
      }
      const len = Math.hypot(dx, dy);
      if (len > 1) { dx /= len; dy /= len; }
      const moving = len > 0.05;
      const running = moving && (input.current?.keys.has("run") ?? false);
      if (moving) {
        const nx = x + dx * (running ? 340 : SPEED) * dt, ny = y + dy * (running ? 340 : SPEED) * dt;
        let moved = false;
        const crossesGateX = crossesBigGate(x, y, nx, y);
        if (canWalkTo(nx, y) && (canEnterBigGate || !crossesGateX)) { x = nx; moved = true; }
        else if (crossesGateX && !canEnterBigGate) cb.current.onGateBlocked();
        const crossesGateY = crossesBigGate(x, y, x, ny);
        if (canWalkTo(x, ny) && (canEnterBigGate || !crossesGateY)) { y = ny; moved = true; }
        else if (crossesGateY && !canEnterBigGate) cb.current.onGateBlocked();
        if (!moved && target.current) target.current = null; // stuck
        if (Math.abs(dx) > 0.2) face = dx < 0 ? -1 : 1;
      }
      livePos.x = x; livePos.y = y;

      const scale = size.w < 768 ? 0.72 : 1;
      const desiredCamX = Math.max(0, Math.min(WORLD.w * scale - size.w, x * scale - size.w / 2));
      const desiredCamY = Math.max(0, Math.min(WORLD.h * scale - size.h, y * scale - size.h / 2));
      if (!cameraReady) { camX = desiredCamX; camY = desiredCamY; cameraReady = true; }
      else {
        const ease = 1 - Math.exp(-dt * 5.5);
        camX += (desiredCamX - camX) * ease;
        camY += (desiredCamY - camY) * ease;
      }
      let translateX = -camX + (preview ? previewPan.current.x : 0);
      let translateY = -camY + (preview ? previewPan.current.y : 0);
      if (preview) {
        translateX = Math.max(size.w - WORLD.w * scale, Math.min(0, translateX));
        translateY = Math.max(size.h - WORLD.h * scale, Math.min(0, translateY));
        previewPan.current.x = translateX + camX;
        previewPan.current.y = translateY + camY;
      }
      if (worldRef.current) worldRef.current.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
      if (avatarRef.current) {
        avatarRef.current.style.transform = `translate3d(${x - 24}px, ${y - 74}px, 0)`;
        avatarRef.current.style.zIndex = String(Math.round(y));
      }
      if (bobRef.current) {
        bobRef.current.style.transform = `scaleX(${face})`;
        const nextMotionClass = moving ? running ? "animate-run" : "animate-walk" : "animate-idle";
        if (nextMotionClass !== motionClass) {
          const character = bobRef.current.firstElementChild;
          if (character) character.className = nextMotionClass;
          motionClass = nextMotionClass;
        }
        if (moving && now - lastFootstep > (running ? 250 : 380)) {
          lastFootstep = now;
          playFootstep(running);
        }
      }

      let near: string | null = null, best = 95;
      for (const b of MAP_LAYOUT.buildings) {
        const d = doorOf(b);
        const dist = Math.hypot(d.x - x, d.y - y);
        if (dist < best) { best = dist; near = b.id; }
      }
      for (const garden of LOVE_GARDENS) {
        const gx = garden.x + garden.w / 2, gy = garden.y + garden.h / 2;
        const dist = Math.hypot(gx - x, gy - y);
        if (dist < best) { best = dist; near = garden.id; }
      }
      for (const sport of CAMPUS_SPORTS) {
        const dist = Math.hypot(sport.entrance.x - x, sport.entrance.y - y);
        if (dist < best) { best = dist; near = sport.id; }
      }
      if (near !== lastNear) { lastNear = near; cb.current.onNearby(near); }
      if (!preview && now - lastSave > 2000) { lastSave = now; setGame((s) => ({ ...s, pos: { x: Math.round(x), y: Math.round(y) } })); }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); if (!preview) setGame((s) => ({ ...s, pos: { x: Math.round(x), y: Math.round(y) } })); };
  }, [input, initialPosition, preview]);

  return (
    <div ref={viewRef} className={cn("no-select absolute inset-0 overflow-hidden bg-grass-dark", preview && (isDragging ? "cursor-grabbing pointer-events-auto" : "cursor-grab pointer-events-auto"))} aria-label={preview ? "Drag to look around the OOPOLY campus" : "Campus map — click a building to walk there"}
      style={preview ? { touchAction: "none", userSelect: "none" } : undefined}
      onPointerDown={preview ? (event) => {
        if (event.button !== 0) return;
        activeDrag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsDragging(true);
      } : undefined}
      onPointerMove={preview ? (event) => {
        const drag = activeDrag.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
        previewPan.current.x += dx;
        previewPan.current.y += dy;
        drag.x = event.clientX;
        drag.y = event.clientY;
      } : undefined}
      onPointerUp={preview ? (event) => {
        const drag = activeDrag.current;
        if (drag?.pointerId !== event.pointerId) return;
        if (drag.moved) suppressClickUntil.current = performance.now() + 200;
        activeDrag.current = null;
        setIsDragging(false);
      } : undefined}
      onPointerCancel={preview ? () => { activeDrag.current = null; setIsDragging(false); } : undefined}
      onClickCapture={preview ? (event) => {
        if (performance.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); }
      } : undefined}>
      <div ref={worldRef} className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ width: WORLD.w, height: WORLD.h }}>
        {/* ground */}
        <div className="absolute inset-0 bg-grass" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, var(--grass-dark) 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, var(--grass-dark) 0 1.5px, transparent 2.5px)", backgroundSize: "60px 60px, 44px 44px" }} />
        <svg className="pointer-events-none absolute inset-0" width={WORLD.w} height={WORLD.h} viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} aria-hidden>
          <g fill="none" stroke="#454448" strokeWidth="82" strokeLinecap="round" strokeLinejoin="round">
            {MAP_LAYOUT.roads.map((route, i) => <path key={i} d={roadPath(route)} />)}
          </g>
          <g fill="none" stroke="#d7d0c3" strokeWidth="5" strokeDasharray="28 30" strokeLinecap="round" opacity="0.55">
            {MAP_LAYOUT.roads.slice(0, 6).map((route, i) => <path key={i} d={roadPath(route)} />)}
          </g>
        </svg>
        <div className="pointer-events-none absolute z-[610] -translate-x-1/2 rounded-full bg-maroon px-4 py-1.5 text-[11px] font-black tracking-[0.18em] text-gold shadow" style={{ left: FILLED_AREA.x + FILLED_AREA.w / 2, top: FILLED_AREA.y + 4 }}>{FILLED_AREA.label}</div>
        {/* trees */}
        {trees.map((t, i) => (
          <div key={i} className="pointer-events-none absolute" style={{ left: t.x - 22 * t.s, top: t.y - 60 * t.s, width: 44 * t.s, height: 64 * t.s, zIndex: Math.round(t.y) }}>
            <div className="absolute bottom-0 left-1/2 h-1/3 w-1/6 -translate-x-1/2 rounded bg-earth" />
            <div className={cn("absolute inset-x-0 top-0 h-3/4 rounded-full shadow-building", i % 3 === 0 && "tree-sway", t.k === 0 ? "bg-grass-dark" : t.k === 1 ? "bg-success" : "bg-grass-dark brightness-90")} style={{ animationDelay: `${(i % 7) * -0.7}s` }} />
          </div>
        ))}
        <svg className="pointer-events-none absolute inset-0" width={WORLD.w} height={WORLD.h} viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} style={{ zIndex: 2480 }} aria-label="Campus perimeter fence">
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {CAMPUS_FENCE.map((segment, i) => <g key={`fence-${i}`}>
              <line {...segment} stroke="#342b2c" strokeWidth="15" />
              <line {...segment} stroke="#cbb998" strokeWidth="9" />
              <line {...segment} stroke="#eee0c6" strokeWidth="2" strokeDasharray="2 14" />
            </g>)}
            {CAMPUS_FENCE.flatMap((segment, i) => {
              const dx = segment.x2 - segment.x1, dy = segment.y2 - segment.y1;
              const count = Math.ceil(Math.hypot(dx, dy) / 80);
              return Array.from({ length: count + 1 }, (_, j) => {
                const t = count ? j / count : 0, x = segment.x1 + dx * t, y = segment.y1 + dy * t;
                const vertical = Math.abs(dx) >= Math.abs(dy);
                return <line key={`fence-post-${i}-${j}`} x1={vertical ? x : x - 13} y1={vertical ? y - 16 : y} x2={vertical ? x : x + 13} y2={vertical ? y + 16 : y} stroke="#342b2c" strokeWidth="8" />;
              });
            })}
          </g>
        </svg>
        {LOVE_GARDENS.map((garden) => <GardenView key={garden.id} garden={garden} near={nearby === garden.id} showLabel={showLabels} onClick={() => { target.current = walkTarget(garden.id, { x: garden.x + garden.w / 2, y: garden.y + garden.h / 2 }); }} />)}
        {CAMPUS_SPORTS.map((area) => <SportsGroundView key={area.id} area={area} near={nearby === area.id} onClick={() => { target.current = walkTarget(area.id, area.entrance); }} />)}
        {MAP_LAYOUT.buildings.map((b) => (
          <BuildingView key={b.id} b={b} near={nearby === b.id} showLabel={showLabels} highlight={waypointId === b.id}
            onClick={() => { target.current = walkTarget(b.id, doorOf(b)); }} />
        ))}
        <SideCampusElephant />
        <StudentCrowd timeMinutes={timeRef.current} />
        {/* avatar */}
        <div ref={avatarRef} className="pointer-events-none absolute left-0 top-0">
          {nearby && <div className="absolute left-1/2 top-[62px] h-6 w-12 -translate-x-1/2 rounded-full border-2 border-gold animate-pulse-ring" />}
          <div ref={bobRef}><div className="animate-idle"><Avatar player={player} size={48} /></div></div>
        </div>
        {(() => {
          const sunlight = Math.max(0, Math.sin((timeRef.current / 1440) * Math.PI * 2 - 1.35));
          const warm = 0.08 * sunlight;
          return <>
            <div aria-hidden className="pointer-events-none absolute inset-0 transition-opacity duration-[2500ms]" style={{ zIndex: WORLD.h + 1000, background: "radial-gradient(ellipse at 76% 8%, rgba(255,220,151,.4), transparent 62%)", opacity: warm }} />
          </>;
        })()}
      </div>
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-charcoal/70 px-3 py-1 text-[10px] font-semibold text-cream md:bottom-3">
        Layout follows your hand-drawn map · positions are approximate
      </div>
    </div>
  );
}
