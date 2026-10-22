import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { configureAudio, disposeAudio, unlockAudio } from "@/game/audio";
import { getGame, loadGame } from "@/game/store";

const REPLAY_INTERVAL_MS = 60 * 1000;

export const Route = createFileRoute("/loop")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Campus Life — Welcome Screen" },
      { name: "description", content: "Campus Life OOPOLY Edition welcome screen." },
    ],
  }),
  component: WelcomeLoopPage,
});

function WelcomeLoopPage() {
  const [replay, setReplay] = useState(0);
  const [startedByGesture, setStartedByGesture] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setReplay((current) => current + 1), REPLAY_INTERVAL_MS);
    loadGame();
    configureAudio(getGame().settings);
    unlockAudio();

    const unlock = () => {
      setStartedByGesture(true);
      unlockAudio();
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      disposeAudio();
    };
  }, []);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-primary px-6 text-center text-primary-foreground">
      <div key={replay} className="loop-welcome-cycle" aria-live="polite">
        <p className="splash-welcome mb-3 text-[10px] font-bold uppercase tracking-[0.32em] text-accent sm:text-xs">Welcome to</p>
        <h1 className="splash-title font-display text-5xl font-extrabold tracking-tight sm:text-7xl">Campus Life</h1>
        <p className="splash-edition mt-4 text-[9px] font-bold tracking-[0.3em] text-accent sm:text-[11px]">OOPOLY EDITION</p>
      </div>
      {!startedByGesture && <p className="absolute bottom-6 px-4 text-xs text-primary-foreground/60">If music doesn’t start automatically, tap or press a key to enable it.</p>}
    </main>
  );
}
