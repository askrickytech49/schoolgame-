export type Level = "ND I" | "ND II" | "HND I" | "HND II";
export type HairStyle = "short" | "afro" | "braids" | "cap" | "long-braids" | "bun";
export type Accessory = "none" | "glasses" | "earrings";
export type Gender = "male" | "female";

export interface Player {
  name: string;
  skin: string;
  hair: HairStyle;
  outfit: string;
  level: Level;
  dept: string;
  gender?: Gender;
  accessory?: Accessory;
}

export interface CourseProgress {
  attended: number;
  studied: number;
}

export type JobStatus = "open" | "active" | "done";

export interface GameState {
  version: 1;
  mapRevision: number;
  travelRevision: number;
  player: Player | null;
  /** Earned, non-redeemable game money used by campus activities. */
  cash: number;
  /** Purchased credits; never changed by game actions or chance activities. */
  campusCredits: number;
  admissionStage: "not-started" | "form-needed" | "scratch-needed" | "portal-ready" | "admitted";
  admissionGuideAnswered: boolean;
  applicationCode: string | null;
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
  settings: { reducedMotion: boolean; showLabels: boolean; audioEnabled: boolean; audioVolume: number };
}

export interface Deltas {
  cash?: number;
  energy?: number;
  hunger?: number;
  mood?: number;
  xp?: number;
  minutes?: number;
}
