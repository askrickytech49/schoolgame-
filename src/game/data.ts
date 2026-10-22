import type { Deltas, GameState, HairStyle, Level } from "./types";

export const WORLD = { w: 2440, h: 3000 };
export const MAP_LAYOUT_REVISION = 5;
// Students arrive on the approach road, with a clear plaza between them and the gate.
export const START_POS = { x: 1900, y: 2720 };

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
  { id: "long-braids", label: "Long braids" },
  { id: "bun", label: "Natural bun" },
];

export interface Outfit {
  id: string;
  label: string;
  kind: "tee" | "hoodie" | "shirt" | "skirt";
  top: string;
  bottom: string;
  shoe: string;
  bag: string;
  formal?: boolean;
  presentation?: "masculine" | "feminine" | "all";
}

export const OUTFITS: Outfit[] = [
  { id: "tee-jeans", label: "Gold tee & jeans", kind: "tee", top: "#e2a93b", bottom: "#2f4a7a", shoe: "#f4f1ea", bag: "#3a2a2a", presentation: "all" },
  { id: "hoodie", label: "Maroon hoodie & joggers", kind: "hoodie", top: "#7a1f2b", bottom: "#2b2b2e", shoe: "#ffffff", bag: "#c9a14a", presentation: "all" },
  { id: "ankara", label: "Ankara shirt & chinos", kind: "shirt", top: "#d9622b", bottom: "#c8b48a", shoe: "#5a3b22", bag: "#222222", presentation: "masculine" },
  { id: "white-cargo", label: "White tee & cargo pants", kind: "tee", top: "#f3efe6", bottom: "#5b6142", shoe: "#1f1f1f", bag: "#7a1f2b", presentation: "masculine" },
  { id: "green-polo", label: "Green shirt & denim", kind: "shirt", top: "#2f7a52", bottom: "#3b4f7d", shoe: "#e9e4d8", bag: "#4b3a2a", presentation: "all" },
  { id: "pattern-skirt", label: "Patterned top & skirt", kind: "skirt", top: "#d9622b", bottom: "#612f4c", shoe: "#f4e4c5", bag: "#3a2a2a", presentation: "feminine" },
  { id: "formal", label: "Formal shirt & trousers", kind: "shirt", top: "#a9cdef", bottom: "#1b1b1f", shoe: "#111111", bag: "#2a2a2a", formal: true, presentation: "masculine" },
  { id: "formal-skirt", label: "Formal blouse & skirt", kind: "skirt", top: "#a9cdef", bottom: "#1b1b1f", shoe: "#111111", bag: "#2a2a2a", formal: true, presentation: "feminine" },
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
  idcard: { name: "Student ID card", desc: "Campus ID. Unlocks library access." },
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
  { id: "dishes", title: "Campus meal-service helper", pay: 1200, energy: 18, minutes: 60, location: "cafeteria", desc: "Help prepare and serve meals during a busy hour." },
  { id: "lab", title: "Assist workshop technician", pay: 2500, energy: 22, minutes: 120, location: "workshops", desc: "Sort tools and log equipment." },
];

export const FRIENDS = [
  { id: "chidi", name: "Chidi", role: "Course rep", line: "Abeg, don't forget tomorrow's class o!" },
  { id: "amaka", name: "Amaka", role: "Roommate", line: "I saved you some puff-puff 😄" },
  { id: "tobe", name: "Tobe", role: "Hustle plug", line: "Check the jobs board, new gigs dey." },
  { id: "ngozi", name: "Ngozi", role: "Study partner", line: "Library by 4? We go cover past questions." },
];

export const OBJECTIVES: { id: string; text: string }[] = [
  { id: "gate", text: "Talk with the admissions guide at the Big gate" },
  { id: "form", text: "Buy an application form in Student Portal" },
  { id: "scratch", text: "Buy an application scratch card in Student Portal" },
  { id: "admission", text: "Check your result in the Student Portal" },
  { id: "admin", text: "Collect your student ID at the Student Service Point" },
  { id: "lecture", text: "Attend a class at SLT" },
  { id: "meal", text: "Find food at an unlabelled campus structure" },
  { id: "job-accept", text: "Accept a hustle from the jobs board at GH" },
  { id: "job-done", text: "Complete your first hustle" },
  { id: "rest", text: "Rest at an unlabelled campus structure" },
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
    id: "gate", name: "Big gate", blurb: "Pass through the grand Ogbonnaya Onu Polytechnic entrance and check in with campus security.",
    x: 1685, y: 2390, w: 600, d: 60, h: 150, roof: "roof", icon: "DoorOpen", walkthrough: true,
    actions: [
      { id: "checkin", label: "Talk with the admissions guide", desc: "Get your first campus task · 5 min", d: { mood: 2, minutes: 5 }, objective: "gate", apply: () => ({ admissionStage: "form-needed", admissionGuideAnswered: true }) },
    ],
  },
  {
    id: "admin", name: "Student Service Point", blurb: "Collect your student ID and check course registration here. Its map position is approximate.",
    x: 405, y: 2020, w: 115, d: 52, h: 300, roof: "roof", icon: "Landmark",
    actions: [
      { id: "id", label: "Collect student ID card", desc: "Free · 30 min", d: { minutes: 30, xp: 5 }, objective: "admin", hours: [8, 16],
        requires: (s) => (s.inventory.idcard ? "Already collected" : null), apply: (s) => addItem(s, "idcard") },
      { id: "reg", label: "Check course registration", desc: "+5 XP · 20 min", d: { xp: 5, minutes: 20 }, hours: [8, 16] },
    ],
  },
  {
    id: "lecture", name: "SLT", blurb: "SLT, labelled in the supplied campus map. Class activities here are illustrative.",
    x: 565, y: 1450, w: 150, d: 58, h: 165, roof: "roof-zinc", icon: "Presentation",
    actions: [
      { id: "attend", label: "Attend class", desc: "+20 XP · −15 energy · 2h", d: { xp: 20, energy: -15, hunger: 8, minutes: 120 }, objective: "lecture", hours: [8, 17], apply: (s) => bump(s, "attended") },
      { id: "acad", label: "View sample courses", desc: "Open Academics", d: {}, openPanel: "academics" },
    ],
  },
  {
    id: "library", name: "Library", blurb: "Quiet reading rooms. The AC works… sometimes.",
    x: 105, y: 935, w: 305, d: 70, h: 255, roof: "roof-alt", icon: "BookOpen",
    actions: [
      { id: "study", label: "Study session", desc: "+15 XP · −12 energy · 1.5h", d: { xp: 15, energy: -12, hunger: 6, minutes: 90 }, hours: [8, 21], requires: needId,
        apply: (s) => ({ ...bump(s, "studied"), xp: s.xp + (s.inventory.textbook ? 5 : 0) }) },
      { id: "borrow", label: "Borrow a textbook", desc: "Free · bonus XP when studying", d: { minutes: 10 }, hours: [8, 21],
        requires: (s) => needId(s) ?? (s.inventory.textbook ? "You already have one" : null), apply: (s) => addItem(s, "textbook") },
    ],
  },
  {
    id: "cafeteria", name: "Unnamed structure A", blurb: "An unlabelled building in the map. The food stall is a provisional game feature, not a confirmed campus location.",
    x: 685, y: 2025, w: 190, d: 58, h: 230, roof: "roof", icon: "UtensilsCrossed",
    actions: [
      { id: "rice", label: "Rice & stew", desc: "₦800 · −40 hunger", d: { cash: -800, hunger: -40, energy: 5, minutes: 20 }, objective: "meal" },
      { id: "jollof", label: "Jollof & chicken", desc: "₦1,500 · −55 hunger · +8 mood", d: { cash: -1500, hunger: -55, mood: 8, energy: 6, minutes: 25 }, objective: "meal" },
      { id: "gala", label: "Buy Gala (to go)", desc: "₦200 · adds to inventory", d: { cash: -200 }, apply: (s) => addItem(s, "gala") },
      { id: "zobo", label: "Buy chilled zobo", desc: "₦250 · adds to inventory", d: { cash: -250 }, apply: (s) => addItem(s, "zobo") },
    ],
  },
  {
    id: "workshops", name: "Unnamed structure B", blurb: "An unlabelled building in the map. Practical-work content is a provisional game feature.",
    x: 1355, y: 1365, w: 225, d: 60, h: 180, roof: "roof-zinc", icon: "Wrench",
    actions: [
      { id: "practical", label: "Practical session", desc: "+25 XP · −20 energy · 2h", d: { xp: 25, energy: -20, hunger: 10, minutes: 120 }, hours: [8, 16] },
    ],
  },
  {
    id: "student", name: "GH", blurb: "GH, labelled in the supplied campus map. Social and hustle actions are illustrative.",
    x: 175, y: 1500, w: 250, d: 62, h: 250, roof: "roof-alt", icon: "Users",
    actions: [
      { id: "board", label: "Open jobs board", desc: "Find a starter hustle", d: {}, openPanel: "hustles" },
      { id: "hang", label: "Hang out with friends", desc: "+15 mood · −5 energy · 1h", d: { mood: 15, energy: -5, minutes: 60 } },
      { id: "data", label: "Buy data bundle", desc: "₦500 · adds to inventory", d: { cash: -500 }, apply: (s) => addItem(s, "data") },
    ],
  },
  {
    id: "hostel", name: "Unnamed structure C", blurb: "An unlabelled building in the map. Rest and sleep actions are provisional game features.",
    x: 525, y: 2025, w: 150, d: 52, h: 280, roof: "roof", icon: "BedDouble",
    actions: [
      { id: "nap", label: "Take a nap", desc: "+35 energy · 2h", d: { energy: 35, minutes: 120 }, objective: "rest" },
      { id: "sleep", label: "Sleep till morning", desc: "Full energy · next day 7:00", d: {}, objective: "rest",
        apply: (s) => ({ energy: 100, day: s.day + 1, minutes: 7 * 60, hunger: Math.min(100, s.hunger + 15), mood: Math.min(100, s.mood + 5) }) },
    ],
  },
  { id: "statistics", name: "Statistics block", blurb: "Statistics block, named in the supplied campus drawing.", x: 895, y: 1390, w: 365, d: 58, h: 215, roof: "roof-zinc", icon: "BarChart3", actions: [] },
  { id: "abc", name: "ABC block", blurb: "ABC block, shown in the lower middle-right of the supplied campus drawing.", x: 970, y: 1945, w: 305, d: 75, h: 375, roof: "roof", icon: "Building2", actions: [] },
  { id: "provious-bank", name: "Provious bank", blurb: "Provious bank, as labelled in the supplied campus drawing.", x: 1830, y: 340, w: 295, d: 75, h: 250, roof: "roof-zinc", icon: "Landmark", actions: [] },
  { id: "sug", name: "SUG", blurb: "SUG, as labelled in the supplied campus drawing.", x: 1895, y: 736, w: 145, d: 65, h: 320, roof: "roof-alt", icon: "Users", actions: [] },
  { id: "rector-office", name: "Rector Office", blurb: "Rector Office, on the right-hand side of the supplied campus drawing.", x: 2050, y: 1450, w: 250, d: 70, h: 220, roof: "roof", icon: "Landmark", actions: [] },
  { id: "auditorium", name: "Auditorium", blurb: "Auditorium, toward the lower-right of the supplied campus drawing.", x: 2130, y: 1920, w: 165, d: 60, h: 235, roof: "roof-zinc", icon: "AudioLines", actions: [] },
  { id: "atm", name: "Access Bank ATM", blurb: "Access Bank ATM beside the Big Gate exit, with a walkway from the exit lane.", x: 2140, y: 2080, w: 130, d: 42, h: 72, roof: "roof-alt", icon: "Wallet", actions: [] },
  { id: "wildering", name: "Wildering", blurb: "Wildering, as labelled in the supplied campus drawing.", x: 170, y: 2025, w: 115, d: 55, h: 250, roof: "roof-alt", icon: "Trees", actions: [] },
  { id: "small-gate", name: "Small Gate", blurb: "The Small Gate is shown near the lower-left/central edge of the supplied campus map.", x: 255, y: 2390, w: 420, d: 42, h: 95, roof: "roof", icon: "DoorOpen", walkthrough: true, actions: [
    { id: "small-gate-checkin", label: "Check in at the Small Gate", desc: "+1 mood · 5 min", d: { mood: 1, minutes: 5 } },
  ] },
];

export interface MapPoint { x: number; y: number }
export interface CampusGarden { id: string; name: string; x: number; y: number; w: number; h: number; blurb: string }

// The three yellow marks in the reference sketch, translated approximately.
export const LOVE_GARDENS: CampusGarden[] = [
  { id: "love-garden-north", name: "Love Garden (north)", x: 120, y: 335, w: 155, h: 175, blurb: "A shaded place to pause, sit and meet other students." },
  { id: "love-garden-west", name: "Love Garden (west)", x: 560, y: 1805, w: 155, h: 175, blurb: "A small green rest area marked in the campus drawing." },
  { id: "love-garden-abc", name: "Love Garden", x: 1280, y: 1565, w: 155, h: 190, blurb: "The Love Garden beside ABC block, marked in the campus drawing." },
];

export const GARDEN_ACTIONS: LocAction[] = [
  { id: "garden-rest", label: "Sit and rest", desc: "+18 energy · +6 mood · 30 min", d: { energy: 18, mood: 6, minutes: 30 } },
  { id: "garden-chat", label: "Talk with nearby students", desc: "+10 mood · 20 min", d: { mood: 10, minutes: 20 } },
];

// The outlined plot is dedicated to separate, walk-up campus sports spaces.
export const FILLED_AREA = { x: 615, y: 385, w: 1165, h: 530, label: "OOPOLY SPORTS GROUNDS" };
export interface CampusSportsArea {
  id: string;
  name: string;
  sport: "football" | "basketball" | "volleyball";
  x: number;
  y: number;
  w: number;
  h: number;
  blurb: string;
  entrance: MapPoint;
  activities: LocAction[];
}
export const CAMPUS_SPORTS: CampusSportsArea[] = [
  { id: "football-field", name: "Football Field", sport: "football", x: 635, y: 410, w: 650, h: 450, blurb: "A full campus pitch for casual kickabouts, drills and inter-department matches.", entrance: { x: 960, y: 885 }, activities: [
    { id: "football-kickabout", label: "Join a kickabout", desc: "+12 mood · +12 XP · −14 energy · 30 min", d: { mood: 12, xp: 12, energy: -14, hunger: 5, minutes: 30 } },
    { id: "football-drills", label: "Practice football drills", desc: "+16 XP · −18 energy · 40 min", d: { xp: 16, energy: -18, hunger: 7, minutes: 40 } },
  ] },
  { id: "basketball-court", name: "Basketball Court", sport: "basketball", x: 1310, y: 410, w: 435, h: 210, blurb: "A dedicated outdoor court for shooting practice and quick games.", entrance: { x: 1528, y: 645 }, activities: [
    { id: "basketball-shootaround", label: "Shoot hoops", desc: "+10 mood · +10 XP · −10 energy · 25 min", d: { mood: 10, xp: 10, energy: -10, hunger: 4, minutes: 25 } },
    { id: "basketball-game", label: "Play a quick game", desc: "+15 XP · −16 energy · 35 min", d: { xp: 15, energy: -16, hunger: 6, minutes: 35 } },
  ] },
  { id: "volleyball-court", name: "Volleyball Court", sport: "volleyball", x: 1310, y: 655, w: 435, h: 205, blurb: "A separate court for volleyball practice and student matches.", entrance: { x: 1528, y: 885 }, activities: [
    { id: "volleyball-practice", label: "Practice volleyball", desc: "+12 mood · +12 XP · −12 energy · 30 min", d: { mood: 12, xp: 12, energy: -12, hunger: 5, minutes: 30 } },
    { id: "volleyball-match", label: "Join a quick match", desc: "+16 XP · −18 energy · 40 min", d: { xp: 16, energy: -18, hunger: 7, minutes: 40 } },
  ] },
];

// Road centerlines traced from the provided sketch, in shared world coordinates.
export const ROAD_ROUTES: MapPoint[][] = [
  [{ x: 170, y: 570 }, { x: 485, y: 570 }, { x: 485, y: 1485 }],
  [{ x: 140, y: 1035 }, { x: 1855, y: 1035 }],
  [{ x: 1855, y: 330 }, { x: 1855, y: 2125 }],
  [{ x: 400, y: 1485 }, { x: 1930, y: 1485 }],
  [{ x: 410, y: 2100 }, { x: 1935, y: 2100 }],
  [{ x: 140, y: 1035 }, { x: 140, y: 2020 }],
  [{ x: 425, y: 1485 }, { x: 545, y: 1535 }, { x: 650, y: 1580 }, { x: 620, y: 1790 }, { x: 500, y: 1970 }],
  [{ x: 545, y: 1535 }, { x: 545, y: 1940 }],
  [{ x: 700, y: 1485 }, { x: 720, y: 1755 }, { x: 690, y: 2100 }],
  [{ x: 950, y: 1485 }, { x: 950, y: 1660 }, { x: 925, y: 1790 }],
  [{ x: 1330, y: 1485 }, { x: 1330, y: 1830 }, { x: 1330, y: 2100 }, { x: 1760, y: 2100 }],
  [{ x: 1855, y: 1035 }, { x: 1855, y: 1485 }, { x: 1990, y: 1510 }, { x: 2030, y: 1500 }],
  [{ x: 1855, y: 1680 }, { x: 2020, y: 1680 }, { x: 2065, y: 1715 }],
  [{ x: 1855, y: 443 }, { x: 1977, y: 443 }], // Provious Bank entrance
  [{ x: 1855, y: 829 }, { x: 1967, y: 829 }], // SUG entrance
  [{ x: 1855, y: 645 }, { x: 1528, y: 645 }], // Basketball Court entrance
  [{ x: 1855, y: 885 }, { x: 1528, y: 885 }], // Volleyball Court entrance
  [{ x: 960, y: 1035 }, { x: 960, y: 885 }], // Football Field entrance
  // Short access roads connect the right-side buildings to the main campus road.
  [{ x: 1935, y: 2100 }, { x: 2212, y: 2008 }], // Auditorium entrance
  [{ x: 1935, y: 2100 }, { x: 2205, y: 2150 }], // Access Bank ATM approach from campus road
  [{ x: 2075, y: 2240 }, { x: 2230, y: 2200 }, { x: 2205, y: 2150 }], // Exit lane walkway to Access Bank ATM
  [{ x: 2065, y: 1715 }, { x: 2175, y: 1548 }], // Rector Office
  [{ x: 1855, y: 2100 }, { x: 1855, y: 2205 }],
  [{ x: 1900, y: 2414 }, { x: 1985, y: 2420 }], // Big Gate security check-in
  [{ x: 410, y: 2100 }, { x: 227, y: 2108 }], // Wildering entrance
  [{ x: 465, y: 2411 }, { x: 465, y: 2520 }, { x: 1900, y: 2520 }, { x: 2075, y: 2520 }], // Outside walkway joining both gate approaches
  [{ x: 140, y: 1640 }, { x: 140, y: 1590 }, { x: 300, y: 1590 }], // GH entrance
  [{ x: 650, y: 2290 }, { x: 465, y: 2411 }], // Small Gate
  [{ x: 200, y: 570 }, { x: 200, y: 423 }], // North Love Garden
  [{ x: 545, y: 1940 }, { x: 638, y: 1893 }], // West Love Garden
  [{ x: 650, y: 2100 }, { x: 650, y: 2290 }],
  [{ x: 700, y: 1035 }, { x: 700, y: 1440 }],
  [{ x: 1855, y: 2205 }, { x: 1900, y: 2240 }, { x: 1900, y: 2790 }],
  [{ x: 1855, y: 2205 }, { x: 2075, y: 2240 }, { x: 2075, y: 2790 }],
];

export const MAP_LAYOUT = {
  width: WORLD.w,
  height: WORLD.h,
  buildings: BUILDINGS,
  roads: ROAD_ROUTES,
  gardens: LOVE_GARDENS,
  sports: CAMPUS_SPORTS,
  gates: BUILDINGS.filter((b) => b.id === "gate" || b.id === "small-gate"),
  filledArea: FILLED_AREA,
};
