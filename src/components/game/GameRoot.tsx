import { useCallback, useEffect, useRef, useState } from "react";
import { Hand, Play, Smartphone, LogOut } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { BUILDINGS } from "@/game/data";
import { freshState, getGame, loadGame, resetGame, setGame, tick, useGame } from "@/game/store";
import type { Player } from "@/game/types";
import { CampusScene, type InputState } from "./CampusScene";
import { DesktopSidebar, MobileTopBar, PhoneButton, type PanelId } from "./Hud";
import { Joystick } from "./Joystick";
import { LocationPanel } from "./LocationPanel";
import { PhoneMenu } from "./PhoneMenu";
import { TitleScreen } from "./TitleScreen";
import { CreateStudent } from "./CreateStudent";
import { Emblem } from "./Emblem";
import { cn } from "@/lib/utils";

type Screen = "loading" | "title" | "create" | "play";

const KEYMAP: Record<string, string> = {
  KeyW: "up", ArrowUp: "up", KeyS: "down", ArrowDown: "down", KeyA: "left", ArrowLeft: "left", KeyD: "right", ArrowRight: "right",
};

export function GameRoot() {
  const s = useGame();
  const [screen, setScreen] = useState<Screen>("loading");
  const [nearby, setNearby] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [phone, setPhone] = useState<{ open: boolean; panel: PanelId | null }>({ open: false, panel: null });
  const [paused, setPaused] = useState(false);
  const input = useRef<InputState>({ keys: new Set(), joy: { x: 0, y: 0 } });

  useEffect(() => {
    loadGame();
    const t = setTimeout(() => setScreen("title"), 700);
    return () => clearTimeout(t);
  }, []);

  const overlay = paused || phone.open;
  const playing = screen === "play";

  // Game clock
  useEffect(() => {
    if (!playing || paused) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [playing, paused]);

  const interact = useCallback(() => {
    if (nearby) setLocation(nearby);
  }, [nearby]);

  // Keyboard
  useEffect(() => {
    if (!playing) return;
    const keys = input.current.keys;
    const down = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const dir = KEYMAP[e.code];
      if (dir) {
        if (!overlay) { keys.add(dir); e.preventDefault(); }
        return;
      }
      if (e.code === "Escape") {
        e.preventDefault();
        if (phone.open) setPhone({ open: false, panel: null });
        else if (location) setLocation(null);
        else setPaused((p) => !p);
      } else if ((e.code === "KeyE" || e.code === "Enter") && !overlay && !location) {
        if (t?.tagName === "BUTTON" && e.code === "Enter") return;
        interact();
      } else if (e.code === "KeyM" && !paused) {
        setPhone((p) => ({ open: !p.open, panel: null }));
      }
    };
    const up = (e: KeyboardEvent) => { const dir = KEYMAP[e.code]; if (dir) keys.delete(dir); };
    const blur = () => keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, [playing, overlay, phone.open, location, paused, interact]);

  useEffect(() => { if (overlay) input.current.keys.clear(); }, [overlay]);
  // Close location panel when walking away
  useEffect(() => { if (location && nearby !== location) setLocation(null); }, [nearby, location]);

  const startNew = (p: Player) => {
    setGame(() => freshState(p));
    setScreen("play");
  };
  const quit = () => { setPhone({ open: false, panel: null }); setPaused(false); setLocation(null); setScreen("title"); };

  const rm = s.settings.reducedMotion;
  const nearName = BUILDINGS.find((b) => b.id === nearby)?.name;

  return (
    <div className={cn("min-h-dvh", rm && "[&_*]:!animate-none")}>
      <Toaster position="top-center" richColors />
      {screen === "loading" && (
        <div className="bg-title flex min-h-dvh flex-col items-center justify-center gap-4 text-primary-foreground">
          <div className="animate-pulse"><Emblem size={72} /></div>
          <p className="font-display tracking-[0.3em] text-accent">LOADING CAMPUS…</p>
        </div>
      )}
      {screen === "title" && (
        <TitleScreen hasSave={!!getGame().player} onNew={() => setScreen("create")} onContinue={() => setScreen("play")} />
      )}
      {screen === "create" && <CreateStudent onBack={() => setScreen("title")} onDone={startNew} />}
      {playing && s.player && (
        <div className="fixed inset-0 flex animate-in fade-in duration-500">
          <DesktopSidebar nearby={nearby} onMenu={(p) => setPhone({ open: true, panel: p })} onPause={() => setPaused(true)} />
          <main className="relative flex-1 overflow-hidden">
            <CampusScene player={s.player} input={input} frozen={overlay} showLabels={s.settings.showLabels} nearby={nearby} onNearby={setNearby} onArrive={(id) => setLocation(id)} />
            <MobileTopBar nearby={nearby} onPause={() => setPaused(true)} />

            {nearby && !location && !overlay && (
              <div className="absolute inset-x-0 top-32 z-[6000] flex justify-center md:top-6">
                <button onClick={interact} className="hud-panel flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                  <kbd className="hidden rounded bg-charcoal px-1.5 py-0.5 text-xs text-gold md:inline">E</kbd>
                  <Hand className="h-4 w-4 text-primary md:hidden" /> Enter {nearName}
                </button>
              </div>
            )}

            {/* touch controls */}
            {!overlay && !location && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[6000] flex items-end justify-between p-4 pb-8 md:hidden">
                <div className="pointer-events-auto"><Joystick input={input} /></div>
                <div className="pointer-events-auto flex flex-col items-end gap-3">
                  <PhoneButton onClick={() => setPhone({ open: true, panel: null })} />
                  <button onClick={interact} disabled={!nearby} aria-label="Interact"
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-gradient font-display text-lg font-bold text-accent-foreground shadow-hud active:scale-95 disabled:opacity-40">
                    Enter
                  </button>
                </div>
              </div>
            )}
          </main>

          {location && !overlay && (
            <LocationPanel id={location} onClose={() => setLocation(null)} onOpenPanel={(p) => setPhone({ open: true, panel: p })} />
          )}
          {phone.open && (
            <PhoneMenu initial={phone.panel} nearby={nearby} onClose={() => setPhone({ open: false, panel: null })}
              onQuit={quit} onReset={() => { resetGame(); quit(); }} />
          )}
          {paused && (
            <div className="fixed inset-0 z-[9800] flex items-center justify-center bg-charcoal/70 p-4 animate-in fade-in" role="dialog" aria-modal aria-label="Paused">
              <div className="w-full max-w-xs rounded-3xl bg-card p-6 text-center shadow-hud animate-in zoom-in-95">
                <Emblem size={56} />
                <h2 className="font-display mt-2 text-3xl font-bold">Paused</h2>
                <p className="mb-5 text-xs text-muted-foreground">Time is frozen. Progress auto-saves.</p>
                <div className="grid gap-2">
                  <Button variant="gold" size="lg" autoFocus onClick={() => setPaused(false)}><Play /> Resume</Button>
                  <Button variant="outline" onClick={() => { setPaused(false); setPhone({ open: true, panel: "settings" }); }}><Smartphone /> Settings & reset</Button>
                  <Button variant="outline" onClick={quit}><LogOut /> Save & quit to title</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
