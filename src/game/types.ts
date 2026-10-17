export type Level = "ND I" | "ND II" | "HND I" | "HND II";
export type HairStyle = "short" | "afro" | "braids" | "cap";

export interface Player {
  name: string;
  skin: string;
  hair: HairStyle;
  outfit: string;
  level: Level;
  dept: string;
}

export interface CourseProgress {
  attended: number;
  studied: number;
}

export type JobStatus = "open" | "active" | "done";

export interface GameState {
  version: 1;
  player: Player | null;
  cash: number;
  hunger: number; // 0 = full, 100 = starving
  energy: number; // 0..100
  mood: number; // 0..100
  xp: number;
  day: number;
  minutes: number; // minutes into the day
  pos: { x: number; y: number };
  inventory: Record<string, number>;
  jobs: Record<string, JobStatus>;
  courses: Record<string, CourseProgress>;
  friends: Record<string, { points: number; lastDay: number }>;
  objective: number;
  settings: { reducedMotion: boolean; showLabels: boolean };
}

export interface Deltas {
  cash?: number;
  energy?: number;
  hunger?: number;
  mood?: number;
  xp?: number;
  minutes?: number;
}
