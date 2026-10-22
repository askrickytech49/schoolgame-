export interface AudioPreferences {
  audioEnabled: boolean;
  audioVolume: number;
}

const MUSIC_SRC = "/audio/campus-life-cultural-flow.mp3";
const SEGMENT_SECONDS = 150; // Play each soundtrack section for 2:30.
const INTRO_END_SECONDS = SEGMENT_SECONDS;
const INTRO_KEY = "oopoly-cultural-flow-intro-played-v1";

let context: AudioContext | null = null;
let effectsBus: GainNode | null = null;
let musicAudio: HTMLAudioElement | null = null;
let unlocked = false;
let preferences: AudioPreferences = { audioEnabled: true, audioVolume: 0.3 };
let musicPositionInitialized = false;
let introIsPlaying = false;
let lastShuffleMinute = -1;
let nextShuffleAt = Number.POSITIVE_INFINITY;
let stepAt = 0;

function audioContext() {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor = window.AudioContext;
    if (!Ctor) return null;
    context = new Ctor();
    effectsBus = context.createGain();
    effectsBus.connect(context.destination);
    syncGains();
  }
  return context;
}

function desiredMusicVolume() {
  // Give the soundtrack a little presence while keeping the settings slider in control.
  return Math.min(1, preferences.audioVolume * 1.35);
}

function syncGains() {
  const enabled = preferences.audioEnabled;
  if (context && effectsBus) {
    effectsBus.gain.setTargetAtTime(enabled ? preferences.audioVolume * 0.9 : 0, context.currentTime, 0.08);
  }
  if (musicAudio) musicAudio.volume = enabled ? desiredMusicVolume() : 0;
}

function hasPlayedIntro() {
  try { return localStorage.getItem(INTRO_KEY) === "yes"; }
  catch { return false; }
}

function markIntroPlayed() {
  try { localStorage.setItem(INTRO_KEY, "yes"); }
  catch { /* Continue in this visit if browser storage is unavailable. */ }
}

function chooseRandomMinute(audio: HTMLAudioElement) {
  const lastMinute = Math.max(3, Math.floor((audio.duration - 12) / 60));
  if (!Number.isFinite(lastMinute) || lastMinute < 3) return 0;
  let minute = 3 + Math.floor(Math.random() * (lastMinute - 2));
  if (lastMinute > 3 && minute === lastShuffleMinute) minute = minute === lastMinute ? minute - 1 : minute + 1;
  lastShuffleMinute = minute;
  return minute * 60 + Math.random() * 50;
}

function jumpToShuffledSection(audio: HTMLAudioElement) {
  if (!Number.isFinite(audio.duration) || audio.duration <= INTRO_END_SECONDS + 12) return false;
  audio.currentTime = chooseRandomMinute(audio);
  nextShuffleAt = audio.currentTime + SEGMENT_SECONDS;
  return true;
}

function initializeMusicPosition(audio: HTMLAudioElement) {
  if (musicPositionInitialized || !Number.isFinite(audio.duration)) return;
  musicPositionInitialized = true;
  introIsPlaying = !hasPlayedIntro() && audio.duration > INTRO_END_SECONDS;
  if (introIsPlaying) {
    audio.currentTime = 0;
    nextShuffleAt = INTRO_END_SECONDS;
  }
  else jumpToShuffledSection(audio);
}

function createMusicAudio() {
  if (typeof window === "undefined") return null;
  if (!musicAudio) {
    const audio = new Audio(MUSIC_SRC);
    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", () => {
      initializeMusicPosition(audio);
      // startMusic() calls play() directly from the user's gesture. Avoid relying
      // on a later metadata event to obtain autoplay permission.
    });
    audio.addEventListener("timeupdate", () => {
      if (introIsPlaying && audio.currentTime >= INTRO_END_SECONDS) {
        introIsPlaying = false;
        markIntroPlayed();
        if (!jumpToShuffledSection(audio)) nextShuffleAt = Number.POSITIVE_INFINITY;
        return;
      }
      if (!introIsPlaying && audio.currentTime >= nextShuffleAt) {
        if (!jumpToShuffledSection(audio)) nextShuffleAt = Number.POSITIVE_INFINITY;
      }
    });
    audio.addEventListener("ended", () => {
      introIsPlaying = false;
      markIntroPlayed();
      if (!jumpToShuffledSection(audio)) return;
      if (unlocked && preferences.audioEnabled) void audio.play().catch(() => {});
    });
    musicAudio = audio;
  }
  return musicAudio;
}

function startMusic() {
  if (!unlocked || !preferences.audioEnabled) return;
  const audio = createMusicAudio();
  if (!audio) return;
  syncGains();
  if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) initializeMusicPosition(audio);
  // Keep play() in the original pointer/key gesture. Waiting for metadata here
  // loses the browser's transient autoplay permission.
  void audio.play().catch(() => {
    // Browsers may still require another user gesture before allowing playback.
  });
}

function stopMusic() {
  musicAudio?.pause();
}

export function configureAudio(next: AudioPreferences) {
  preferences = { audioEnabled: next.audioEnabled, audioVolume: Math.max(0, Math.min(1, next.audioVolume)) };
  syncGains();
  if (!preferences.audioEnabled) stopMusic();
  else if (unlocked) startMusic();
}

/** Start sound from a browser gesture so autoplay policies allow the soundtrack. */
export function unlockAudio() {
  unlocked = true;
  const ctx = audioContext();
  if (ctx?.state === "suspended") void ctx.resume();
  syncGains();
  if (preferences.audioEnabled) startMusic();
}

/** Move to a fresh soundtrack section after entering a saved or newly created story. */
export function shuffleMusicSection() {
  const audio = musicAudio;
  if (!audio || audio.paused || !Number.isFinite(audio.duration)) return;
  introIsPlaying = false;
  markIntroPlayed();
  if (!jumpToShuffledSection(audio)) nextShuffleAt = Number.POSITIVE_INFINITY;
}

function playTone(frequency: number, duration: number, type: OscillatorType, volume: number, bus: GainNode, detune = 0) {
  const ctx = audioContext();
  if (!ctx || !unlocked || !preferences.audioEnabled) return;
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  const start = ctx.currentTime;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.detune.setValueAtTime(detune, start);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), start + 0.025);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope).connect(bus);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
  oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
}

export function playUiSound() {
  if (!effectsBus) return;
  playTone(560, 0.08, "triangle", 0.13, effectsBus);
  window.setTimeout(() => { if (effectsBus) playTone(760, 0.09, "sine", 0.09, effectsBus); }, 28);
}

/** Short, brighter confirmation cue for the main start-screen actions. */
export function playStartSound() {
  if (!effectsBus) return;
  playTone(660, 0.11, "triangle", 0.14, effectsBus);
  window.setTimeout(() => { if (effectsBus) playTone(880, 0.14, "sine", 0.12, effectsBus); }, 75);
}

export function playDoorSound() {
  if (!effectsBus) return;
  playTone(330, 0.18, "triangle", 0.14, effectsBus);
  window.setTimeout(() => { if (effectsBus) playTone(440, 0.2, "triangle", 0.11, effectsBus); }, 75);
}

/** Short descending plop used whenever a toast notification drops in. */
export function playNotificationSound() {
  const ctx = audioContext();
  if (!ctx || !effectsBus || !unlocked || !preferences.audioEnabled) return;
  const start = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(760, start);
  oscillator.frequency.exponentialRampToValueAtTime(250, start + 0.2);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(0.2, start + 0.018);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
  oscillator.connect(envelope).connect(effectsBus);
  oscillator.start(start);
  oscillator.stop(start + 0.3);
  oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };

  const thump = ctx.createOscillator();
  const thumpEnvelope = ctx.createGain();
  thump.type = "triangle";
  thump.frequency.setValueAtTime(150, start + 0.035);
  thump.frequency.exponentialRampToValueAtTime(80, start + 0.17);
  thumpEnvelope.gain.setValueAtTime(0.0001, start + 0.035);
  thumpEnvelope.gain.exponentialRampToValueAtTime(0.15, start + 0.055);
  thumpEnvelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.19);
  thump.connect(thumpEnvelope).connect(effectsBus);
  thump.start(start + 0.035);
  thump.stop(start + 0.21);
  thump.onended = () => { thump.disconnect(); thumpEnvelope.disconnect(); };
}

export function playFootstep(running = false) {
  if (!effectsBus || !unlocked || !preferences.audioEnabled) return;
  const now = performance.now();
  const gap = running ? 250 : 380;
  if (now - stepAt < gap) return;
  stepAt = now;
  playTone(running ? 92 : 78, 0.09, "triangle", running ? 0.12 : 0.08, effectsBus);
}

export function disposeAudio() {
  stopMusic();
  musicAudio = null;
  musicPositionInitialized = false;
  introIsPlaying = false;
  nextShuffleAt = Number.POSITIVE_INFINITY;
  if (context) void context.close();
  context = null;
  effectsBus = null;
  unlocked = false;
}
