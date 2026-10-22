import { useSyncExternalStore } from "react";
import { BUILDINGS, DEPARTMENTS, HAIR_STYLES, ITEMS, JOBS, MAP_LAYOUT_REVISION, OBJECTIVES, OUTFITS, SKIN_TONES, START_POS, WORLD, type LocAction } from "./data";
import type { Accessory, Deltas, GameState, Gender, HairStyle, Level, Player } from "./types";

const KEY = "oopoly-campus-life-v1";

export function freshState(player: Player | null = null): GameState {
  return {
    version: 1,
    mapRevision: MAP_LAYOUT_REVISION,
    travelRevision: 0,
    player,
    cash: 5000,
    campusCredits: 0,
    admissionStage: "not-started",
    admissionGuideAnswered: false,
    applicationCode: null,
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
    settings: { reducedMotion: false, showLabels: true, audioEnabled: true, audioVolume: 0.3 },
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
    if (raw) state = restoreState(JSON.parse(raw));
  } catch {
    state = freshState();
    try { localStorage.removeItem(KEY); } catch { /* storage is unavailable */ }
  }
  listeners.forEach((l) => l());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function boundedNumber(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function restoreState(value: unknown): GameState {
  const base = freshState();
  if (!isRecord(value) || value.version !== 1) return base;
  const raw = value;
  const rawSettings = isRecord(raw.settings) ? raw.settings : {};
  const rawPos = isRecord(raw.pos) ? raw.pos : {};
  const rawJobs = isRecord(raw.jobs) ? raw.jobs : {};
  const rawInventory = isRecord(raw.inventory) ? raw.inventory : {};
  const rawCourses = isRecord(raw.courses) ? raw.courses : {};
  const rawFriends = isRecord(raw.friends) ? raw.friends : {};
  const admissionStages = ["not-started", "form-needed", "scratch-needed", "portal-ready", "admitted"] as const;
  const departments = new Set(DEPARTMENTS.map((department) => department.id));
  const validLevels: Level[] = ["ND I", "ND II", "HND I", "HND II"];
  const hairStyles: HairStyle[] = HAIR_STYLES.map((style) => style.id);
  const accessories: Accessory[] = ["none", "glasses", "earrings"];
  const genders: Gender[] = ["male", "female"];
  const candidate = isRecord(raw.player) ? raw.player : null;
  const player: Player | null = candidate &&
    typeof candidate.name === "string" && candidate.name.trim().length >= 2 && candidate.name.length <= 20 &&
    SKIN_TONES.some((tone) => tone.id === candidate.skin) && hairStyles.includes(candidate.hair as HairStyle) &&
    OUTFITS.some((outfit) => outfit.id === candidate.outfit) && validLevels.includes(candidate.level as Level) &&
    departments.has(String(candidate.dept))
    ? { name: candidate.name.trim(), skin: String(candidate.skin), hair: candidate.hair as HairStyle, outfit: String(candidate.outfit), level: candidate.level as Level, dept: String(candidate.dept), ...(genders.includes(candidate.gender as Gender) ? { gender: candidate.gender as Gender } : {}), accessory: accessories.includes(candidate.accessory as Accessory) ? candidate.accessory as Accessory : "none" }
    : null;
  const jobs = Object.fromEntries(JOBS.map((job) => {
    const status = rawJobs[job.id];
    return [job.id, status === "active" || status === "done" ? status : "open"];
  })) as GameState["jobs"];
  const inventory = Object.fromEntries(Object.keys(ITEMS).flatMap((id) => {
    const count = Math.floor(boundedNumber(rawInventory[id], 0, 0, 999));
    return count > 0 ? [[id, count]] : [];
  }));
  const courseCodes = new Set(DEPARTMENTS.flatMap((department) => department.courses.map((course) => course.code)));
  const courses = Object.fromEntries(Object.entries(rawCourses).flatMap(([code, progress]) => {
    if (!courseCodes.has(code) || !isRecord(progress)) return [];
    return [[code, { attended: Math.floor(boundedNumber(progress.attended, 0, 0, 999)), studied: Math.floor(boundedNumber(progress.studied, 0, 0, 999)) }]];
  }));
  const friendIds = new Set(["chidi", "amaka", "tobe", "ngozi"]);
  const friends = Object.fromEntries(Object.entries(rawFriends).flatMap(([id, record]) => {
    if (!friendIds.has(id) || !isRecord(record)) return [];
    return [[id, { points: Math.floor(boundedNumber(record.points, 0, 0, 999)), lastDay: Math.floor(boundedNumber(record.lastDay, 0, 0, 1_000_000)) }]];
  }));
  return {
    ...base,
    player,
    cash: boundedNumber(raw.cash, base.cash, 0, 1_000_000_000),
    // Paid credits are a separate balance. Gameplay deltas cannot add or spend them.
    campusCredits: boundedNumber(raw.campusCredits, 0, 0, 1_000_000_000),
    admissionStage: admissionStages.includes(raw.admissionStage as (typeof admissionStages)[number])
      ? raw.admissionStage as GameState["admissionStage"]
      : (boundedNumber(raw.objective, 0, 0, OBJECTIVES.length) > 0 ? "form-needed" : "not-started"),
    admissionGuideAnswered: typeof raw.admissionGuideAnswered === "boolean" ? raw.admissionGuideAnswered : boundedNumber(raw.objective, 0, 0, OBJECTIVES.length) > 0,
    applicationCode: typeof raw.applicationCode === "string" && /^[A-Z0-9-]{5,20}$/.test(raw.applicationCode) ? raw.applicationCode : null,
    hunger: boundedNumber(raw.hunger, base.hunger, 0, 100),
    energy: boundedNumber(raw.energy, base.energy, 0, 100),
    mood: boundedNumber(raw.mood, base.mood, 0, 100),
    xp: Math.floor(boundedNumber(raw.xp, 0, 0, 100_000_000)),
    day: Math.floor(boundedNumber(raw.day, 1, 1, 1_000_000)),
    minutes: boundedNumber(raw.minutes, base.minutes, 0, 1439),
    // Keep saved progress and spawn it at the revised campus entrance once.
    // Old coordinates belonged to the previous fictional road layout.
    mapRevision: MAP_LAYOUT_REVISION,
    travelRevision: Math.floor(boundedNumber(raw.travelRevision, 0, 0, 1_000_000_000)),
    pos: raw.mapRevision === MAP_LAYOUT_REVISION
      ? { x: boundedNumber(rawPos.x, START_POS.x, 40, WORLD.w - 40), y: boundedNumber(rawPos.y, START_POS.y, 80, WORLD.h - 20) }
      : { ...START_POS },
    inventory,
    jobs,
    courses,
    friends,
    objective: Math.floor(boundedNumber(raw.objective, 0, 0, OBJECTIVES.length)),
    settings: {
      reducedMotion: typeof rawSettings.reducedMotion === "boolean" ? rawSettings.reducedMotion : base.settings.reducedMotion,
      showLabels: typeof rawSettings.showLabels === "boolean" ? rawSettings.showLabels : base.settings.showLabels,
      audioEnabled: typeof rawSettings.audioEnabled === "boolean" ? rawSettings.audioEnabled : base.settings.audioEnabled,
      audioVolume: boundedNumber(rawSettings.audioVolume, base.settings.audioVolume, 0, 1),
    },
  };
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
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
  state = freshState();
  try { localStorage.removeItem(KEY); } catch { /* storage is unavailable */ }
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

export function buyApplicationItem(kind: "form" | "scratch"): Result {
  const s = state;
  const expected = kind === "form" ? "form-needed" : "scratch-needed";
  if (kind === "form" && s.admissionStage !== expected) return { ok: false, msg: s.admissionStage === "not-started" ? "Speak with the guide at the Big gate first" : "You already have your application form" };
  if (kind === "scratch" && s.admissionStage !== expected) return { ok: false, msg: s.admissionStage === "form-needed" ? "Buy the application form first" : "You already have your scratch card" };
  const cost = kind === "form" ? 2500 : 700;
  if (s.cash < cost) return { ok: false, msg: `You need ${formatNaira(cost)} earned game money` };
  const code = kind === "form" ? `OP-${Math.random().toString(36).slice(2, 7).toUpperCase()}` : s.applicationCode;
  const next = {
    ...s,
    cash: s.cash - cost,
    minutes: (s.minutes + 15) % 1440,
    day: s.day + (s.minutes + 15 >= 1440 ? 1 : 0),
    admissionStage: kind === "form" ? "scratch-needed" as const : "portal-ready" as const,
    applicationCode: code,
    objective: s.objective + (OBJECTIVES[s.objective]?.id === kind ? 1 : 0),
  };
  setGame(() => next);
  return { ok: true, msg: kind === "form" ? `Application form bought · code ${code}` : "Scratch card bought · Student Portal is ready" };
}

export function checkAdmissionResult(): Result {
  const s = state;
  if (s.admissionStage !== "portal-ready" || !s.applicationCode) return { ok: false, msg: "You need the form and scratch card before checking" };
  const next = { ...s, admissionStage: "admitted" as const, objective: s.objective + (OBJECTIVES[s.objective]?.id === "admission" ? 1 : 0), xp: s.xp + 25, mood: clamp(s.mood + 12) };
  setGame(() => next);
  return { ok: true, msg: "Congratulations! Your simulated admission offer is ready. Collect your student ID at the service point." };
}

export function acceptJob(id: string): Result {
  const s = state;
  const job = JOBS.find((j) => j.id === id);
  if (!job) return { ok: false, msg: "Hustle not found" };
  if (s.jobs[id] === "done") return { ok: false, msg: "You already completed this hustle" };
  if (Object.values(s.jobs).includes("active")) return { ok: false, msg: "Finish your current hustle first" };
  let next: GameState = { ...s, jobs: { ...s.jobs, [id]: "active" } };
  const adv = advanceObjective(next, "job-accept");
  next = adv.s;
  setGame(() => next);
  const loc = BUILDINGS.find((b) => b.id === job.location)!;
  return { ok: true, msg: `Hustle accepted — head to ${loc.name}`, bonus: adv.bonus };
}

export function completeJob(id: string, nearby: string | null): Result {
  const job = JOBS.find((j) => j.id === id);
  if (!job) return { ok: false, msg: "Hustle not found" };
  const s = state;
  if (s.jobs[id] !== "active") return { ok: false, msg: "Job not active" };
  if (nearby !== job.location) return { ok: false, msg: "Go to the job location first" };
  if (s.energy < job.energy) return { ok: false, msg: "Too tired — rest first" };
  let next = applyDeltas(s, { cash: job.pay, energy: -job.energy, hunger: 8, minutes: job.minutes, xp: 10 });
  next = { ...next, jobs: { ...next.jobs, [id]: "done" } };
  const adv = advanceObjective(next, "job-done");
  setGame(() => adv.s);
  return { ok: true, msg: `Earned ${formatNaira(job.pay)} from ${job.title}`, bonus: adv.bonus };
}

export function consumeItem(id: string): Result {
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
