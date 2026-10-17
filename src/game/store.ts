import { useSyncExternalStore } from "react";
import { BUILDINGS, ITEMS, JOBS, OBJECTIVES, START_POS, type LocAction } from "./data";
import type { Deltas, GameState, Player } from "./types";

const KEY = "oopoly-campus-life-v1";

export function freshState(player: Player | null = null): GameState {
  return {
    version: 1,
    player,
    cash: 5000,
    hunger: 30,
    energy: 85,
    mood: 70,
    xp: 0,
    day: 1,
    minutes: 7 * 60 + 30,
    pos: { ...START_POS },
    inventory: {},
    jobs: Object.fromEntries(JOBS.map((j) => [j.id, "open" as const])),
    courses: {},
    friends: {},
    objective: 0,
    settings: { reducedMotion: false, showLabels: true },
  };
}

let state: GameState = freshState();
let loaded = false;
const listeners = new Set<() => void>();

export function loadGame() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...freshState(), ...JSON.parse(raw) };
  } catch {
    /* corrupted save — start fresh */
  }
  listeners.forEach((l) => l());
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function persist() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full / disabled */
    }
  }, 400);
}

export function getGame() {
  return state;
}
export function setGame(fn: (s: GameState) => GameState) {
  state = fn(state);
  persist();
  listeners.forEach((l) => l());
}
export function useGame() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}
export function resetGame() {
  state = freshState();
  localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));
export const levelOf = (xp: number) => Math.floor(xp / 100) + 1;
export const formatNaira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");
export function formatTime(min: number) {
  const h = Math.floor(min / 60) % 24;
  const m = Math.floor(min % 60);
  const ap = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${m.toString().padStart(2, "0")} ${ap}`;
}

export function applyDeltas(s: GameState, d: Deltas): GameState {
  let minutes = s.minutes + (d.minutes ?? 0);
  let day = s.day;
  while (minutes >= 24 * 60) {
    minutes -= 24 * 60;
    day++;
  }
  return {
    ...s,
    cash: s.cash + (d.cash ?? 0),
    energy: clamp(s.energy + (d.energy ?? 0)),
    hunger: clamp(s.hunger + (d.hunger ?? 0)),
    mood: clamp(s.mood + (d.mood ?? 0)),
    xp: Math.max(0, s.xp + (d.xp ?? 0)),
    minutes,
    day,
  };
}

/** Why an action can't run right now, or null if allowed. Pure. */
export function blockReason(s: GameState, d: Deltas, hours?: [number, number], requires?: (s: GameState) => string | null) {
  if (d.cash && d.cash < 0 && s.cash < -d.cash) return "Not enough cash";
  if (d.energy && d.energy < 0 && s.energy < -d.energy) return "Too tired — rest first";
  if (hours) {
    const h = s.minutes / 60;
    if (h < hours[0] || h >= hours[1]) return `Open ${hours[0]}:00–${hours[1]}:00`;
  }
  return requires?.(s) ?? null;
}

export interface Result {
  ok: boolean;
  msg: string;
  bonus?: string;
}

function advanceObjective(s: GameState, id: string | undefined): { s: GameState; bonus?: string } {
  if (!id || OBJECTIVES[s.objective]?.id !== id) return { s };
  const next = { ...s, objective: s.objective + 1, cash: s.cash + 500, xp: s.xp + 10 };
  return { s: next, bonus: `Objective complete: ${OBJECTIVES[s.objective].text} (+₦500, +10 XP)` };
}

export function runAction(action: LocAction): Result {
  const s = state;
  const why = blockReason(s, action.d, action.hours, action.requires);
  if (why) return { ok: false, msg: why };
  let next = applyDeltas(s, action.d);
  if (action.apply) next = { ...next, ...action.apply(next) };
  const adv = advanceObjective(next, action.objective);
  state = adv.s;
  persist();
  listeners.forEach((l) => l());
  return { ok: true, msg: `${action.label} ✓`, bonus: adv.bonus };
}

export function acceptJob(id: string): Result {
  const s = state;
  if (Object.values(s.jobs).includes("active")) return { ok: false, msg: "Finish your current hustle first" };
  let next: GameState = { ...s, jobs: { ...s.jobs, [id]: "active" } };
  const adv = advanceObjective(next, "job-accept");
  next = adv.s;
  setGame(() => next);
  const job = JOBS.find((j) => j.id === id)!;
  const loc = BUILDINGS.find((b) => b.id === job.location)!;
  return { ok: true, msg: `Hustle accepted — head to ${loc.name}`, bonus: adv.bonus };
}

export function completeJob(id: string, nearby: string | null): Result {
  const job = JOBS.find((j) => j.id === id)!;
  const s = state;
  if (s.jobs[id] !== "active") return { ok: false, msg: "Job not active" };
  if (nearby !== job.location) return { ok: false, msg: "Go to the job location first" };
  if (s.energy < job.energy) return { ok: false, msg: "Too tired — rest first" };
  let next = applyDeltas(s, { cash: job.pay, energy: -job.energy, hunger: 8, minutes: job.minutes, xp: 10 });
  next = { ...next, jobs: { ...next.jobs, [id]: "open" } };
  const adv = advanceObjective(next, "job-done");
  setGame(() => adv.s);
  return { ok: true, msg: `Earned ${formatNaira(job.pay)} from ${job.title}`, bonus: adv.bonus };
}

export function useItem(id: string): Result {
  const item = ITEMS[id];
  const s = state;
  if (!item?.use || !s.inventory[id]) return { ok: false, msg: "Can't use that" };
  const next = applyDeltas(s, item.use);
  const inv = { ...next.inventory, [id]: s.inventory[id] - 1 };
  if (inv[id] <= 0) delete inv[id];
  setGame(() => ({ ...next, inventory: inv }));
  return { ok: true, msg: `${item.useLabel} ${item.name} ✓` };
}

export function chatFriend(id: string): Result {
  const s = state;
  const f = s.friends[id] ?? { points: 0, lastDay: 0 };
  if (f.lastDay === s.day) return { ok: false, msg: "Already gisted today — try tomorrow" };
  const next = applyDeltas(s, { mood: 6, minutes: 15 });
  setGame(() => ({ ...next, friends: { ...s.friends, [id]: { points: f.points + 1, lastDay: s.day } } }));
  return { ok: true, msg: "Nice chat! +6 mood" };
}

/** Real-time tick: called once per real second while playing. */
export function tick() {
  setGame((s) => {
    const next = applyDeltas(s, { minutes: 4, hunger: 0.35, energy: -0.12 });
    if (next.hunger > 80) next.mood = clamp(next.mood - 0.3);
    return next;
  });
}
