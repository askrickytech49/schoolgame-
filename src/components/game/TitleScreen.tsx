import { useState } from "react";
import { Play, RotateCcw, Settings, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Emblem } from "./Emblem";
import { Avatar } from "./Avatar";
import { SettingsPanel } from "./panels/SettingsPanel";

export function Credits() {
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p><strong>Campus Life (OOPOLY Edition)</strong> is an original fan-made prototype about student life at Ogbonnaya Onu Polytechnic, Aba Campus.</p>
      <p className="rounded-lg border border-accent bg-secondary p-3"><strong>Prototype notice:</strong> the campus layout, buildings and names are <em>illustrative only</em> and not an accurate reconstruction. They will be revised once verified reference photos are supplied.</p>
      <p>Departments and courses shown are <em>sample options</em> and must be verified against official current OOPOLY offerings. This is not the complete or official list.</p>
      <p>Not affiliated with or endorsed by the institution. The emblem is an original design, not the school logo. Genre inspired at a high level by life-sim games; all UI, art and code are original.</p>
      <p>All money is virtual (₦ in-game only). No sign-in, no payments; progress is saved only in this browser.</p>
    </div>
  );
}

export function TitleScreen({ hasSave, onNew, onContinue }: { hasSave: boolean; onNew: () => void; onContinue: () => void }) {
  const [modal, setModal] = useState<null | "settings" | "credits">(null);
  return (
    <div className="bg-title relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-primary-foreground">
      <div className="kente absolute inset-x-0 top-0 h-2 opacity-90" />
      <div className="kente absolute inset-x-0 bottom-0 h-2 opacity-90" />
      {/* skyline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center gap-3 opacity-25">
        {[90, 140, 110, 180, 120, 160, 100, 130].map((h, i) => (
          <div key={i} className="w-16 rounded-t-md bg-maroon-deep sm:w-24" style={{ height: h }} />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-8 left-[8%] hidden animate-float-slow sm:block">
        <Avatar player={{ skin: "s2", hair: "braids", outfit: "hoodie" }} size={70} />
      </div>
      <div className="pointer-events-none absolute bottom-10 right-[10%] hidden animate-float-slow sm:block" style={{ animationDelay: "1.2s" }}>
        <Avatar player={{ skin: "s4", hair: "cap", outfit: "tee-jeans" }} size={64} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-700">
        <Emblem size={88} />
        <h1 className="font-display mt-5 text-6xl font-extrabold tracking-tight sm:text-8xl">Campus <span className="text-shimmer">Life</span></h1>
        <p className="font-display mt-2 text-lg font-semibold tracking-[0.35em] text-accent sm:text-xl">OOPOLY EDITION</p>
        <p className="mt-4 max-w-md text-sm opacity-80">Lectures, hustles, jollof and gist — live your student life on an illustrative Aba campus.</p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          {hasSave && (
            <Button variant="gold" size="lg" onClick={onContinue}><Play /> Continue</Button>
          )}
          <Button variant={hasSave ? "ghostLight" : "gold"} size="lg" onClick={onNew}>
            {hasSave ? <RotateCcw /> : <Play />} {hasSave ? "New student" : "Play"}
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghostLight" onClick={() => setModal("settings")}><Settings /> Settings</Button>
            <Button variant="ghostLight" onClick={() => setModal("credits")}><Info /> Credits</Button>
          </div>
        </div>
        <p className="mt-6 text-xs opacity-60">Prototype · campus layout illustrative · unofficial fan project</p>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4 animate-in fade-in" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 text-card-foreground shadow-hud" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">{modal === "settings" ? "Settings" : "Credits"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setModal(null)} aria-label="Close"><X /></Button>
            </div>
            {modal === "settings" ? <SettingsPanel /> : <Credits />}
          </div>
        </div>
      )}
    </div>
  );
}
