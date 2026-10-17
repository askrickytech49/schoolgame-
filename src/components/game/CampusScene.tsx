import { useEffect, useMemo, useRef } from "react";
import * as Icons from "lucide-react";
import { BUILDINGS, FIELD, PATHS, ROADS, WORLD, type Building } from "@/game/data";
import { getGame, setGame } from "@/game/store";
import type { Player } from "@/game/types";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

export interface InputState {
  keys: Set<string>;
  joy: { x: number; y: number };
}

/** Live avatar position shared with the minimap without re-rendering React every frame. */
export const livePos = { x: 0, y: 0 };

const SPEED = 230;
const FENCE_Y = 1575;
const GATE = BUILDINGS.find((b) => b.id === "gate")!;

export const doorOf = (b: Building) => (b.walkthrough ? { x: b.x + b.w / 2, y: b.y + b.d / 2 } : { x: b.x + b.w / 2, y: b.y + b.d + 28 });

const SOLIDS = [
  ...BUILDINGS.filter((b) => !b.walkthrough).map((b) => ({ x: b.x - 8, y: b.y - 6, w: b.w + 16, h: b.d + 12 })),
  { x: 0, y: FENCE_Y - 6, w: GATE.x + 20, h: 14 },
  { x: GATE.x + GATE.w - 20, y: FENCE_Y - 6, w: WORLD.w, h: 14 },
];
function blocked(x: number, y: number) {
  if (x < 40 || x > WORLD.w - 40 || y < 120 || y > WORLD.h - 20) return true;
  return SOLIDS.some((r) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h);
}

function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}
function inRect(x: number, y: number, r: { x: number; y: number; w: number; h: number }, pad = 0) {
  return x > r.x - pad && x < r.x + r.w + pad && y > r.y - pad && y < r.y + r.h + pad;
}

const ROOF_CLASS = { roof: "bg-roof", "roof-alt": "bg-roof-alt", "roof-zinc": "bg-roof-zinc" } as const;

function BuildingView({ b, near, showLabel, onClick }: { b: Building; near: boolean; showLabel: boolean; onClick: () => void }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[b.icon] ?? Icons.Building2;
  if (b.walkthrough) {
    return (
      <button type="button" onClick={onClick} aria-label={`Go to ${b.name}`} className="group absolute cursor-pointer" style={{ left: b.x, top: b.y - b.h, width: b.w, height: b.h + b.d, zIndex: b.y + b.d + 40 }}>
        <div className="absolute bottom-0 left-0 h-full w-7 rounded-t-md bg-wall shadow-building ring-2 ring-maroon" />
        <div className="absolute bottom-0 right-0 h-full w-7 rounded-t-md bg-wall shadow-building ring-2 ring-maroon" />
        <div className="kente absolute inset-x-0 top-0 h-6 rounded-sm" />
        <div className="absolute inset-x-6 top-6 flex h-7 items-center justify-center bg-maroon font-display text-xs font-bold tracking-widest text-gold">CAMPUS GATE</div>
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
      <div className={cn("absolute inset-x-0 top-0 rounded-t-lg border-b-4 border-charcoal/20", ROOF_CLASS[b.roof])} style={{ height: b.d }}>
        <div className="absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 rounded bg-charcoal/15" />
        <div className="absolute inset-0 rounded-t-lg opacity-30" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 10px, var(--charcoal) 10px 11px)" }} />
      </div>
      {/* front wall */}
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
        <div className="absolute bottom-3 left-1/2 h-11 w-12 -translate-x-1/2 rounded-t-md border-2 border-maroon bg-charcoal/80" />
      </div>
      {showLabel && <Label name={b.name} near={near} Icon={Icon} />}
    </button>
  );
}

function Label({ name, near, Icon }: { name: string; near: boolean; Icon: Icons.LucideIcon }) {
  return (
    <div className={cn("pointer-events-none absolute -top-9 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold shadow-hud transition-all",
      near ? "scale-110 bg-accent text-accent-foreground" : "bg-card text-card-foreground")}>
      <Icon className="h-3.5 w-3.5" /> {name}
    </div>
  );
}

export function CampusScene({ player, input, frozen, showLabels, nearby, onNearby, onArrive }: {
  player: Player;
  input: React.RefObject<InputState>;
  frozen: boolean;
  showLabels: boolean;
  nearby: string | null;
  onNearby: (id: string | null) => void;
  onArrive: (id: string) => void;
}) {
  const viewRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const bobRef = useRef<HTMLDivElement>(null);
  const target = useRef<{ x: number; y: number; id: string } | null>(null);
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;
  const cb = useRef({ onNearby, onArrive });
  cb.current = { onNearby, onArrive };

  const trees = useMemo(() => {
    const out: { x: number; y: number; s: number; k: number }[] = [];
    for (let i = 0; i < 260 && out.length < 95; i++) {
      const x = 60 + hash(i + 1) * (WORLD.w - 120);
      const y = 160 + hash(i + 77) * (WORLD.h - 200);
      const bad = [...ROADS, ...PATHS, FIELD].some((r) => inRect(x, y, r, 30)) ||
        BUILDINGS.some((b) => inRect(x, y, { x: b.x, y: b.y - b.h, w: b.w, h: b.d + b.h + 60 }, 30)) ||
        Math.abs(y - FENCE_Y) < 40 || Math.hypot(x - 1250, y - 1470) < 140;
      if (!bad) out.push({ x, y, s: 0.8 + hash(i + 300) * 0.6, k: Math.floor(hash(i + 9) * 3) });
    }
    return out;
  }, []);

  useEffect(() => {
    const p = getGame().pos;
    let x = blocked(p.x, p.y) ? 1250 : p.x;
    let y = blocked(p.x, p.y) ? 1470 : p.y;
    let last = performance.now();
    let raf = 0;
    let lastNear: string | null = null;
    let lastSave = 0;
    let walking = false;
    let face = 1;
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
          const tx = target.current.x - x, ty = target.current.y - y;
          const dist = Math.hypot(tx, ty);
          if (dist < 10) {
            const id = target.current.id;
            target.current = null;
            cb.current.onArrive(id);
          } else { dx = tx / dist; dy = ty / dist; }
        }
      }
      const len = Math.hypot(dx, dy);
      if (len > 1) { dx /= len; dy /= len; }
      const moving = len > 0.05;
      if (moving) {
        const nx = x + dx * SPEED * dt, ny = y + dy * SPEED * dt;
        let moved = false;
        if (!blocked(nx, y)) { x = nx; moved = true; }
        if (!blocked(x, ny)) { y = ny; moved = true; }
        if (!moved && target.current) target.current = null; // stuck
        if (Math.abs(dx) > 0.2) face = dx < 0 ? -1 : 1;
      }
      livePos.x = x; livePos.y = y;

      const scale = size.w < 768 ? 0.72 : 1;
      const camX = Math.max(0, Math.min(WORLD.w * scale - size.w, x * scale - size.w / 2));
      const camY = Math.max(0, Math.min(WORLD.h * scale - size.h, y * scale - size.h / 2));
      if (worldRef.current) worldRef.current.style.transform = `translate3d(${-camX}px, ${-camY}px, 0) scale(${scale})`;
      if (avatarRef.current) {
        avatarRef.current.style.transform = `translate3d(${x - 24}px, ${y - 74}px, 0)`;
        avatarRef.current.style.zIndex = String(Math.round(y));
      }
      if (bobRef.current) {
        bobRef.current.style.transform = `scaleX(${face})`;
        if (moving !== walking) { walking = moving; bobRef.current.firstElementChild?.classList.toggle("animate-walk", moving); }
      }

      let near: string | null = null, best = 95;
      for (const b of BUILDINGS) {
        const d = doorOf(b);
        const dist = Math.hypot(d.x - x, d.y - y);
        if (dist < best) { best = dist; near = b.id; }
      }
      if (near !== lastNear) { lastNear = near; cb.current.onNearby(near); }
      if (now - lastSave > 2000) { lastSave = now; setGame((s) => ({ ...s, pos: { x: Math.round(x), y: Math.round(y) } })); }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); setGame((s) => ({ ...s, pos: { x: Math.round(x), y: Math.round(y) } })); };
  }, [input]);

  return (
    <div ref={viewRef} className="no-select absolute inset-0 overflow-hidden bg-grass-dark" aria-label="Campus map — click a building to walk there">
      <div ref={worldRef} className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ width: WORLD.w, height: WORLD.h }}>
        {/* ground */}
        <div className="absolute inset-0 bg-grass" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, var(--grass-dark) 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, var(--grass-dark) 0 1.5px, transparent 2.5px)", backgroundSize: "60px 60px, 44px 44px" }} />
        <div className="absolute inset-x-0 bg-earth/70" style={{ top: FENCE_Y + 10, bottom: 0 }} />
        {/* roads */}
        {ROADS.map((r, i) => (
          <div key={i} className="absolute rounded-lg bg-road shadow-inner" style={{ left: r.x, top: r.y, width: r.w, height: r.h }}>
            <div className={cn("absolute border-dashed border-cream/70", r.w > r.h ? "inset-x-4 top-1/2 border-t-4" : "inset-y-4 left-1/2 border-l-4")} />
          </div>
        ))}
        {PATHS.map((r, i) => <div key={i} className="absolute rounded bg-path" style={{ left: r.x, top: r.y, width: r.w, height: r.h }} />)}
        {/* sports field */}
        <div className="absolute rounded-xl border-4 border-cream/80 bg-grass-dark" style={{ left: FIELD.x, top: FIELD.y, width: FIELD.w, height: FIELD.h }}>
          <div className="absolute inset-y-0 left-1/2 border-l-4 border-cream/80" />
          <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-cream/80" />
          <span className="absolute -top-7 left-2 rounded-full bg-card px-2 py-0.5 text-xs font-bold">Sports field</span>
        </div>
        {/* fence */}
        <div className="absolute h-3 rounded bg-maroon" style={{ left: 0, top: FENCE_Y, width: GATE.x + 20, zIndex: FENCE_Y }} />
        <div className="absolute h-3 rounded bg-maroon" style={{ left: GATE.x + GATE.w - 20, top: FENCE_Y, right: 0, zIndex: FENCE_Y }} />
        {/* trees */}
        {trees.map((t, i) => (
          <div key={i} className="pointer-events-none absolute" style={{ left: t.x - 22 * t.s, top: t.y - 60 * t.s, width: 44 * t.s, height: 64 * t.s, zIndex: Math.round(t.y) }}>
            <div className="absolute bottom-0 left-1/2 h-1/3 w-1/6 -translate-x-1/2 rounded bg-earth" />
            <div className={cn("absolute inset-x-0 top-0 h-3/4 rounded-full shadow-building", t.k === 0 ? "bg-grass-dark" : t.k === 1 ? "bg-success" : "bg-grass-dark brightness-90")} />
          </div>
        ))}
        {BUILDINGS.map((b) => (
          <BuildingView key={b.id} b={b} near={nearby === b.id} showLabel={showLabels}
            onClick={() => { const d = doorOf(b); target.current = { ...d, id: b.id }; }} />
        ))}
        {/* avatar */}
        <div ref={avatarRef} className="pointer-events-none absolute left-0 top-0">
          {nearby && <div className="absolute left-1/2 top-[62px] h-6 w-12 -translate-x-1/2 rounded-full border-2 border-gold animate-pulse-ring" />}
          <div ref={bobRef}><div><Avatar player={player} size={48} /></div></div>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-charcoal/60 px-3 py-1 text-[10px] font-semibold text-cream md:bottom-3">
        Illustrative prototype layout — not an accurate campus map
      </div>
    </div>
  );
}
