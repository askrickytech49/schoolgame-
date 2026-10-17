import type { Deltas, GameState, HairStyle, Level } from "./types";

export const WORLD = { w: 2400, h: 1700 };
export const START_POS = { x: 1250, y: 1470 };

export const SKIN_TONES = [
  { id: "s1", label: "Deep", color: "#4a2c1d" },
  { id: "s2", label: "Rich brown", color: "#6b3f26" },
  { id: "s3", label: "Brown", color: "#8a5a3b" },
  { id: "s4", label: "Caramel", color: "#a8744f" },
  { id: "s5", label: "Light brown", color: "#c69373" },
];

export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: "short", label: "Low cut" },
  { id: "afro", label: "Afro puff" },
  { id: "braids", label: "Braids" },
  { id: "cap", label: "Face cap" },
];

export interface Outfit {
  id: string;
  label: string;
  kind: "tee" | "hoodie" | "shirt";
  top: string;
  bottom: string;
  shoe: string;
  bag: string;
  formal?: boolean;
}

export const OUTFITS: Outfit[] = [
  { id: "tee-jeans", label: "Gold tee & jeans", kind: "tee", top: "#e2a93b", bottom: "#2f4a7a", shoe: "#f4f1ea", bag: "#3a2a2a" },
  { id: "hoodie", label: "Maroon hoodie & joggers", kind: "hoodie", top: "#7a1f2b", bottom: "#2b2b2e", shoe: "#ffffff", bag: "#c9a14a" },
  { id: "ankara", label: "Ankara shirt & chinos", kind: "shirt", top: "#d9622b", bottom: "#c8b48a", shoe: "#5a3b22", bag: "#222222" },
  { id: "white-cargo", label: "White tee & cargo pants", kind: "tee", top: "#f3efe6", bottom: "#5b6142", shoe: "#1f1f1f", bag: "#7a1f2b" },
  { id: "green-polo", label: "Green shirt & denim", kind: "shirt", top: "#2f7a52", bottom: "#3b4f7d", shoe: "#e9e4d8", bag: "#4b3a2a" },
  { id: "formal", label: "Formal uniform (optional)", kind: "shirt", top: "#a9cdef", bottom: "#1b1b1f", shoe: "#111111", bag: "#2a2a2a", formal: true },
];

export const LEVELS: Level[] = ["ND I", "ND II", "HND I", "HND II"];

export interface Course {
  code: string;
  title: string;
}

export const DEPARTMENTS: { id: string; name: string; short: string; courses: Course[] }[] = [
  { id: "cs", name: "Computer Science", short: "CSC", courses: [
    { code: "COM 111", title: "Introduction to Computing" },
    { code: "COM 112", title: "Introduction to Programming" },
    { code: "COM 113", title: "Digital Logic Basics" },
  ] },
  { id: "eee", name: "Electrical/Electronic Engineering", short: "EEE", courses: [
    { code: "EEC 111", title: "Electrical Engineering Science" },
    { code: "EEC 112", title: "Electronics I" },
    { code: "EEC 113", title: "Workshop Practice" },
  ] },
  { id: "me", name: "Mechanical Engineering", short: "MEC", courses: [
    { code: "MEC 111", title: "Engineering Drawing" },
    { code: "MEC 112", title: "Workshop Technology" },
    { code: "MEC 113", title: "Basic Thermodynamics" },
  ] },
  { id: "ce", name: "Civil Engineering", short: "CEC", courses: [
    { code: "CEC 111", title: "Surveying I" },
    { code: "CEC 112", title: "Construction Materials" },
    { code: "CEC 113", title: "Technical Drawing" },
  ] },
  { id: "ba", name: "Business Administration", short: "BAM", courses: [
    { code: "BAM 111", title: "Principles of Management" },
    { code: "BAM 112", title: "Business Communication" },
    { code: "BAM 113", title: "Introduction to Economics" },
  ] },
  { id: "acc", name: "Accountancy", short: "ACC", courses: [
    { code: "ACC 111", title: "Principles of Accounts" },
    { code: "ACC 112", title: "Cost Accounting I" },
    { code: "ACC 113", title: "Business Mathematics" },
  ] },
  { id: "mac", name: "Mass Communication", short: "MAC", courses: [
    { code: "MAC 111", title: "Intro to Mass Communication" },
    { code: "MAC 112", title: "News Writing" },
    { code: "MAC 113", title: "Basic Photojournalism" },
  ] },
];

export const ITEMS: Record<string, { name: string; desc: string; use?: Deltas; useLabel?: string }> = {
  idcard: { name: "Student ID card", desc: "Prototype ID. Unlocks library access." },
  textbook: { name: "Borrowed textbook", desc: "+5 bonus XP whenever you study." },
  gala: { name: "Gala sausage roll", desc: "Quick snack on the go.", use: { hunger: -12, mood: 2 }, useLabel: "Eat" },
  data: { name: "Data bundle (1GB)", desc: "Scroll, stream, chill.", use: { mood: 10, minutes: 30 }, useLabel: "Use" },
  zobo: { name: "Chilled zobo", desc: "Refreshing hibiscus drink.", use: { hunger: -5, energy: 5, mood: 4 }, useLabel: "Drink" },
};

export interface Job {
  id: string;
  title: string;
  pay: number;
  energy: number;
  minutes: number;
  location: string;
  desc: string;
}

export const JOBS: Job[] = [
  { id: "typing", title: "Typing & printing for classmates", pay: 2000, energy: 12, minutes: 90, location: "student", desc: "Type up handouts at the business centre." },
  { id: "shelving", title: "Library book shelving", pay: 1500, energy: 15, minutes: 60, location: "library", desc: "Help sort returned books." },
  { id: "dishes", title: "Cafeteria rush-hour helper", pay: 1200, energy: 18, minutes: 60, location: "cafeteria", desc: "Serve and clean during lunch rush." },
  { id: "lab", title: "Assist workshop technician", pay: 2500, energy: 22, minutes: 120, location: "workshops", desc: "Sort tools and log equipment." },
];

export const FRIENDS = [
  { id: "chidi", name: "Chidi", role: "Course rep", line: "Abeg, don't forget tomorrow's class o!" },
  { id: "amaka", name: "Amaka", role: "Roommate", line: "I saved you some puff-puff 😄" },
  { id: "tobe", name: "Tobe", role: "Hustle plug", line: "Check the jobs board, new gigs dey." },
  { id: "ngozi", name: "Ngozi", role: "Study partner", line: "Library by 4? We go cover past questions." },
];

export const OBJECTIVES: { id: string; text: string }[] = [
  { id: "gate", text: "Check in at the Main Gate" },
  { id: "admin", text: "Collect your student ID at the Administration Block" },
  { id: "lecture", text: "Attend your first lecture at the Lecture Hall" },
  { id: "meal", text: "Grab a meal at the Cafeteria" },
  { id: "job-accept", text: "Accept a hustle from the Student Centre jobs board" },
  { id: "job-done", text: "Complete your first hustle" },
  { id: "rest", text: "Rest at the Hostel" },
];

export interface LocAction {
  id: string;
  label: string;
  desc: string;
  d: Deltas;
  objective?: string;
  hours?: [number, number];
  requires?: (s: GameState) => string | null;
  apply?: (s: GameState) => Partial<GameState>;
  openPanel?: "hustles" | "academics";
}

export interface Building {
  id: string;
  name: string;
  blurb: string;
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  roof: "roof" | "roof-alt" | "roof-zinc";
  icon: string;
  actions: LocAction[];
  walkthrough?: boolean;
}

const needId = (s: GameState) => (s.inventory.idcard ? null : "Needs student ID (Admin Block)");
const addItem = (s: GameState, id: string, n = 1) => ({ inventory: { ...s.inventory, [id]: (s.inventory[id] ?? 0) + n } });

export function deptOf(s: GameState) {
  return DEPARTMENTS.find((d) => d.id === s.player?.dept) ?? DEPARTMENTS[0];
}

function nextCourse(s: GameState, key: "attended" | "studied") {
  const courses = deptOf(s).courses;
  return [...courses].sort((a, b) => (s.courses[a.code]?.[key] ?? 0) - (s.courses[b.code]?.[key] ?? 0))[0];
}

function bump(s: GameState, key: "attended" | "studied"): Partial<GameState> {
  const c = nextCourse(s, key);
  const cur = s.courses[c.code] ?? { attended: 0, studied: 0 };
  return { courses: { ...s.courses, [c.code]: { ...cur, [key]: cur[key] + 1 } } };
}

export const BUILDINGS: Building[] = [
  {
    id: "gate", name: "Main Gate", blurb: "Where every campus day starts. Security post, keke park and gist.",
    x: 1110, y: 1540, w: 280, d: 30, h: 90, roof: "roof", icon: "DoorOpen", walkthrough: true,
    actions: [
      { id: "checkin", label: "Check in with security", desc: "+2 mood · 5 min", d: { mood: 2, minutes: 5 }, objective: "gate" },
      { id: "keke", label: "Take a keke to town", desc: "₦300 · +8 mood · −5 energy · 1h", d: { cash: -300, mood: 8, energy: -5, minutes: 60 } },
    ],
  },
  {
    id: "admin", name: "Administration Block", blurb: "Registry, bursary and student affairs (illustrative).",
    x: 860, y: 1110, w: 230, d: 120, h: 120, roof: "roof", icon: "Landmark",
    actions: [
      { id: "id", label: "Collect student ID card", desc: "Free · 30 min", d: { minutes: 30, xp: 5 }, objective: "admin", hours: [8, 16],
        requires: (s) => (s.inventory.idcard ? "Already collected" : null), apply: (s) => addItem(s, "idcard") },
      { id: "reg", label: "Check course registration", desc: "+5 XP · 20 min", d: { xp: 5, minutes: 20 }, hours: [8, 16] },
    ],
  },
  {
    id: "lecture", name: "Lecture Hall", blurb: "Big hall, ceiling fans, and a lecturer who loves pop quizzes.",
    x: 1420, y: 520, w: 320, d: 140, h: 130, roof: "roof-zinc", icon: "Presentation",
    actions: [
      { id: "attend", label: "Attend class", desc: "+20 XP · −15 energy · 2h", d: { xp: 20, energy: -15, hunger: 8, minutes: 120 }, objective: "lecture", hours: [8, 17], apply: (s) => bump(s, "attended") },
      { id: "acad", label: "View sample courses", desc: "Open Academics", d: {}, openPanel: "academics" },
    ],
  },
  {
    id: "library", name: "Library", blurb: "Quiet reading rooms. The AC works… sometimes.",
    x: 800, y: 470, w: 270, d: 140, h: 120, roof: "roof-alt", icon: "BookOpen",
    actions: [
      { id: "study", label: "Study session", desc: "+15 XP · −12 energy · 1.5h", d: { xp: 15, energy: -12, hunger: 6, minutes: 90 }, hours: [8, 21], requires: needId,
        apply: (s) => ({ ...bump(s, "studied"), xp: s.xp + (s.inventory.textbook ? 5 : 0) }) },
      { id: "borrow", label: "Borrow a textbook", desc: "Free · bonus XP when studying", d: { minutes: 10 }, hours: [8, 21],
        requires: (s) => needId(s) ?? (s.inventory.textbook ? "You already have one" : null), apply: (s) => addItem(s, "textbook") },
    ],
  },
  {
    id: "cafeteria", name: "Cafeteria", blurb: "Mama's pot is ready. Rice, stew and the best zobo on campus.",
    x: 1480, y: 1100, w: 230, d: 110, h: 85, roof: "roof", icon: "UtensilsCrossed",
    actions: [
      { id: "rice", label: "Rice & stew", desc: "₦800 · −40 hunger", d: { cash: -800, hunger: -40, energy: 5, minutes: 20 }, objective: "meal" },
      { id: "jollof", label: "Jollof & chicken", desc: "₦1,500 · −55 hunger · +8 mood", d: { cash: -1500, hunger: -55, mood: 8, energy: 6, minutes: 25 }, objective: "meal" },
      { id: "gala", label: "Buy Gala (to go)", desc: "₦200 · adds to inventory", d: { cash: -200 }, apply: (s) => addItem(s, "gala") },
      { id: "zobo", label: "Buy chilled zobo", desc: "₦250 · adds to inventory", d: { cash: -250 }, apply: (s) => addItem(s, "zobo") },
    ],
  },
  {
    id: "workshops", name: "Workshops", blurb: "Lathes, benches and the smell of machine oil.",
    x: 1850, y: 520, w: 300, d: 140, h: 100, roof: "roof-zinc", icon: "Wrench",
    actions: [
      { id: "practical", label: "Practical session", desc: "+25 XP · −20 energy · 2h", d: { xp: 25, energy: -20, hunger: 10, minutes: 120 }, hours: [8, 16] },
    ],
  },
  {
    id: "student", name: "Student Centre", blurb: "Business centre, jobs board, music and plenty gist.",
    x: 390, y: 1070, w: 270, d: 120, h: 90, roof: "roof-alt", icon: "Users",
    actions: [
      { id: "board", label: "Open jobs board", desc: "Find a starter hustle", d: {}, openPanel: "hustles" },
      { id: "hang", label: "Hang out with friends", desc: "+15 mood · −5 energy · 1h", d: { mood: 15, energy: -5, minutes: 60 } },
      { id: "data", label: "Buy data bundle", desc: "₦500 · adds to inventory", d: { cash: -500 }, apply: (s) => addItem(s, "data") },
    ],
  },
  {
    id: "hostel", name: "Hostel", blurb: "Your room, your roommate, your small gas cooker.",
    x: 340, y: 420, w: 310, d: 150, h: 150, roof: "roof", icon: "BedDouble",
    actions: [
      { id: "nap", label: "Take a nap", desc: "+35 energy · 2h", d: { energy: 35, minutes: 120 }, objective: "rest" },
      { id: "sleep", label: "Sleep till morning", desc: "Full energy · next day 7:00", d: {}, objective: "rest",
        apply: (s) => ({ energy: 100, day: s.day + 1, minutes: 7 * 60, hunger: Math.min(100, s.hunger + 15), mood: Math.min(100, s.mood + 5) }) },
    ],
  },
];

export const ROADS = [
  { x: 1180, y: 260, w: 140, h: 1440 }, // main N-S road
  { x: 220, y: 830, w: 1980, h: 110 }, // E-W road
];
export const PATHS = [
  { x: 950, y: 610, w: 30, h: 230 },
  { x: 1560, y: 660, w: 30, h: 180 },
  { x: 1985, y: 660, w: 30, h: 180 },
  { x: 470, y: 570, w: 30, h: 270 },
  { x: 510, y: 940, w: 30, h: 140 },
  { x: 960, y: 940, w: 30, h: 180 },
  { x: 1580, y: 940, w: 30, h: 170 },
];
export const FIELD = { x: 1860, y: 1080, w: 380, h: 240 };
