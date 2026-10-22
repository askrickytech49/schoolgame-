import { useEffect, useRef, useState } from "react";
import { Check, Cookie, Info, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Player } from "@/game/types";
import { CampusScene, type InputState } from "./CampusScene";
import { Emblem } from "./Emblem";
import { SettingsPanel } from "./panels/SettingsPanel";

const NOTICE_KEY = "oopoly-onboarding-notice-v1";
const CENTER = { x: 1200, y: 900 };
const PREVIEW_PLAYER: Player = { name: "", skin: "s2", hair: "short", outfit: "tee-jeans", level: "ND I", dept: "cs" };
const NOOP_NEARBY = (_id: string | null) => {};
const NOOP_ARRIVE = (_id: string) => {};

export function Credits() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <section className="space-y-1.5">
        <h3 className="font-bold text-primary">What is Campus Life?</h3>
        <p><strong>Campus Life (OOPOLY Edition)</strong> is a game about everyday student life. You create a student, explore a campus, meet people and choose what to do next. The story is set at a stylized Ogbonnaya Onu Polytechnic Aba Campus.</p>
      </section>

      <section className="space-y-1.5">
        <h3 className="font-bold text-primary">Find your way around</h3>
        <p>Choose where you are and where you want to go. The map highlights a walking route to help you find campus buildings, offices, classes and other spots. Visit places to get food or buy small items. You can also check your department and sample courses on your phone.</p>
      </section>

      <section className="space-y-1.5">
        <h3 className="font-bold text-primary">Meet people and chat</h3>
        <p>Campus is about people too. Chat with student characters, build friendships and join a campus group conversation. These chats happen inside the game; they don’t connect you to real students.</p>
      </section>

      <section className="space-y-1.5">
        <h3 className="font-bold text-primary">How can it help students?</h3>
        <p>Starting school can feel like a lot: there are new places to find, people to meet and routines to learn. Campus Life gives students a relaxed way to explore those experiences. It encourages players to find their way, plan their day, make choices and feel more at home on campus—all through play.</p>
      </section>

      <p className="rounded-lg border border-accent bg-secondary p-3"><strong>There’s room to grow:</strong> with input from students and the school, Campus Life could add more helpful campus information and activities. For now, it’s a creative project, not an official school guide.</p>

      <section className="space-y-1.5">
        <h3 className="font-bold text-primary">A quick note</h3>
        <p>This is an independent fan-made game. The school map, buildings, courses and admission tasks are examples created for the game; they are not official or fully accurate. The game does not process real applications or payments. All ₦ amounts are fictional game money with no cash value. Your progress is saved in this browser.</p>
      </section>
    </div>
  );
}

export function TitleScreen({ hasSave, player, timeMinutes, onNew, onContinue }: {
  hasSave: boolean;
  player: Player | null;
  timeMinutes: number;
  onNew: () => void;
  onContinue: () => void;
}) {
  const [modal, setModal] = useState<null | "settings" | "credits" | "login">(null);
  const [loginMessage, setLoginMessage] = useState("");
  const [showNotice, setShowNotice] = useState(false);
  const previewInput = useRef<InputState>({ keys: new Set(), joy: { x: 0, y: 0 } });

  useEffect(() => {
    try { setShowNotice(!localStorage.getItem(NOTICE_KEY)); } catch { setShowNotice(true); }
  }, []);

  const dismissNotice = () => {
    setShowNotice(false);
    try { localStorage.setItem(NOTICE_KEY, "seen"); } catch { /* Storage may be disabled. */ }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-charcoal text-primary-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <CampusScene player={player ?? PREVIEW_PLAYER} input={previewInput} frozen showLabels={false} timeMinutes={timeMinutes}
          nearby={null} onNearby={NOOP_NEARBY} onArrive={NOOP_ARRIVE} preview initialPosition={CENTER} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/5 to-charcoal/90" />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4 sm:p-6">
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-charcoal/70 px-3 py-2 shadow-hud backdrop-blur-md sm:px-4">
          <Emblem size={38} />
          <div>
            <p className="font-display text-lg font-extrabold leading-tight">Campus Life</p>
            <p className="text-[10px] font-bold tracking-[0.16em] text-gold">OOPOLY EDITION</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-charcoal/65 px-3 py-2 text-xs text-white/80 backdrop-blur sm:inline">OOPOLY campus</span>
          <Button variant="ghostLight" size="icon" onClick={() => setModal("settings")} aria-label="Settings"><Settings /></Button>
          <Button variant="ghostLight" size="icon" onClick={() => { setLoginMessage(""); setModal("credits"); }} aria-label="About this game"><Info /></Button>
        </div>
      </header>

      <section className="absolute inset-x-0 bottom-0 z-[2] flex justify-center px-4 pb-6 pt-28 sm:px-8 sm:pb-10">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/20 bg-charcoal/75 p-5 shadow-hud backdrop-blur-xl sm:p-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">Your OOPOLY story</p>
          <h1 className="font-display max-w-xl text-3xl font-extrabold leading-tight sm:text-5xl">Campus life is yours to shape.</h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">Make a student, find your rhythm, show up for class, build friendships, join clubs and make a little virtual money along the way.</p>

          <div className={`mt-5 flex flex-col gap-3 ${hasSave ? "" : "sm:flex-row"}`}>
            <Button data-ui-sound="start" variant="gold" className="h-14 flex-1 rounded-2xl px-6 text-base" onClick={hasSave ? onContinue : onNew}>{hasSave ? `Continue ${player?.name ? `${player.name}'s story` : "your story"}` : "Create your student"}</Button>
            {!hasSave && <Button data-ui-sound="start" variant="ghostLight" className="h-14 flex-1 rounded-2xl border-2 border-white/45 bg-white/15 px-6 text-base hover:bg-white/25" onClick={() => { setLoginMessage(""); setModal("login"); }}>Log in</Button>}
          </div>
          {hasSave && <button className="mt-3 w-full text-center text-xs font-semibold text-white/75 underline underline-offset-2 hover:text-white" onClick={onNew}>Create a new student</button>}
          <p className="mt-4 text-center text-xs text-white/65">Your progress saves in this browser</p>
        </div>
      </section>

      {showNotice && (
        <aside className="fixed inset-x-3 top-20 z-20 mx-auto max-w-lg rounded-2xl border border-white/70 bg-card p-4 text-card-foreground shadow-hud sm:top-24 sm:p-5" aria-label="Cookie and save information">
          <div className="flex gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><Cookie className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Essential storage keeps your campus story saved.</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">We use browser storage (like essential cookies) to remember your student and settings. No advertising cookies or trackers.</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setModal("credits")}>Cookie details</Button>
                <Button variant="gold" size="sm" className="flex-1" onClick={dismissNotice}><Check /> Got it</Button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/75 p-4 animate-in fade-in" onClick={() => { setModal(null); setLoginMessage(""); }}>
          <div className="flex max-h-[90dvh] w-full max-w-md flex-col rounded-2xl bg-card p-6 text-card-foreground shadow-hud" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <h2 className="font-display text-2xl font-bold">{modal === "settings" ? "Settings" : modal === "login" ? "Log in" : "About Campus Life"}</h2>
              <Button variant="ghost" size="icon" onClick={() => { setModal(null); setLoginMessage(""); }} aria-label="Close"><X /></Button>
            </div>
            {modal === "settings" ? <SettingsPanel /> : modal === "login" ? <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setLoginMessage("Email sign-in is not connected yet. Your game currently saves in this browser only."); }}>
              <label className="block space-y-1.5 text-sm font-semibold">Email address<Input required type="email" autoComplete="email" placeholder="you@example.com" /></label>
              <label className="block space-y-1.5 text-sm font-semibold">Password<Input required type="password" autoComplete="current-password" placeholder="Your password" /></label>
              {loginMessage && <p role="status" className="rounded-xl bg-secondary p-3 text-xs leading-relaxed text-muted-foreground">{loginMessage}</p>}
              <Button type="submit" variant="gold" className="w-full">Log in</Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => { setModal(null); setLoginMessage(""); onNew(); }}>Create your student</Button>
              <p className="text-center text-xs text-muted-foreground">Cross-device accounts will be available when online account sync is connected.</p>
            </form> : <div className={modal === "credits" ? "min-h-0 overflow-y-auto pr-1" : ""}>{modal === "credits" ? <Credits /> : null}</div>}
          </div>
        </div>
      )}
    </main>
  );
}
