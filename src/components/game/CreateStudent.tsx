import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEPARTMENTS, HAIR_STYLES, LEVELS, OUTFITS, SKIN_TONES } from "@/game/data";
import type { Player } from "@/game/types";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

const STEPS = ["Name", "Look", "Outfit", "Level", "Department"];

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-xl border-2 p-3 text-left text-sm font-semibold transition-all hover:-translate-y-0.5",
        active ? "border-primary bg-primary text-primary-foreground shadow-hud" : "border-border bg-card hover:border-accent",
      )}
    >
      {children}
    </button>
  );
}

export function CreateStudent({ onDone, onBack }: { onDone: (p: Player) => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Player>({ name: "", skin: "s2", hair: "short", outfit: "tee-jeans", level: "ND I", dept: "cs" });
  const set = (patch: Partial<Player>) => setP((x) => ({ ...x, ...patch }));
  const canNext = step !== 0 || p.name.trim().length >= 2;
  const dept = DEPARTMENTS.find((d) => d.id === p.dept)!;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="kente h-1.5" />
      <div className="mx-auto grid w-full max-w-5xl flex-1 gap-6 p-4 md:grid-cols-[1fr_1.4fr] md:p-8">
        <div className="bg-title relative flex flex-col items-center justify-center rounded-3xl p-6 text-primary-foreground shadow-hud">
          <p className="font-display text-sm tracking-[0.3em] text-accent">NEW STUDENT</p>
          <div className="my-4 rounded-full bg-primary-foreground/10 p-6"><Avatar player={p} size={110} /></div>
          <p className="font-display text-2xl font-bold">{p.name.trim() || "Your name"}</p>
          <p className="text-sm opacity-80">{p.level} · {dept.name}</p>
          <p className="mt-1 text-xs opacity-70">{OUTFITS.find((o) => o.id === p.outfit)?.label}</p>
        </div>

        <div className="flex flex-col">
          <div className="mb-5 flex gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={cn("h-1.5 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-muted")} />
                <p className={cn("mt-1 hidden text-xs sm:block", i === step ? "font-bold text-primary" : "text-muted-foreground")}>{s}</p>
              </div>
            ))}
          </div>

          <div key={step} className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
            {step === 0 && (
              <div className="space-y-3">
                <h2 className="font-display text-3xl font-bold">What should we call you?</h2>
                <p className="text-sm text-muted-foreground">A nickname is fine — it stays on this device only.</p>
                <Input autoFocus maxLength={20} value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Ada, Emeka, Kelechi" className="h-12 text-lg"
                  onKeyDown={(e) => e.key === "Enter" && canNext && setStep(1)} />
              </div>
            )}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-3xl font-bold">Pick your look</h2>
                <div>
                  <p className="mb-2 text-sm font-semibold">Skin tone</p>
                  <div className="flex flex-wrap gap-3">
                    {SKIN_TONES.map((s) => (
                      <button key={s.id} type="button" aria-label={s.label} aria-pressed={p.skin === s.id} onClick={() => set({ skin: s.id })}
                        className={cn("h-12 w-12 rounded-full border-4 transition-transform hover:scale-110", p.skin === s.id ? "border-primary" : "border-card")}
                        style={{ backgroundColor: s.color }} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold">Hair / headwear</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {HAIR_STYLES.map((h) => <Choice key={h.id} active={p.hair === h.id} onClick={() => set({ hair: h.id })}>{h.label}</Choice>)}
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-3">
                <h2 className="font-display text-3xl font-bold">Everyday outfit</h2>
                <p className="text-sm text-muted-foreground">Casual wear is the default. The formal uniform is optional.</p>
                <div className="grid grid-cols-2 gap-2">
                  {OUTFITS.map((o) => (
                    <Choice key={o.id} active={p.outfit === o.id} onClick={() => set({ outfit: o.id })}>
                      <span className="flex items-center gap-2">
                        <span className="h-5 w-5 shrink-0 rounded-md border" style={{ background: `linear-gradient(${o.top} 55%, ${o.bottom} 55%)` }} />
                        {o.label}
                      </span>
                    </Choice>
                  ))}
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-3">
                <h2 className="font-display text-3xl font-bold">Your level</h2>
                <div className="grid grid-cols-2 gap-2">
                  {LEVELS.map((l) => <Choice key={l} active={p.level === l} onClick={() => set({ level: l })}><span className="font-display text-xl">{l}</span></Choice>)}
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-3">
                <h2 className="font-display text-3xl font-bold">Department</h2>
                <p className="rounded-lg border border-accent bg-secondary p-2.5 text-xs">Sample departments for this prototype — to be verified against official current OOPOLY offerings. Not a complete or official list.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DEPARTMENTS.map((d) => <Choice key={d.id} active={p.dept === d.id} onClick={() => set({ dept: d.id })}>{d.name}</Choice>)}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between gap-3">
            <Button variant="outline" size="lg" onClick={() => (step === 0 ? onBack() : setStep(step - 1))}><ArrowLeft /> Back</Button>
            {step < STEPS.length - 1 ? (
              <Button size="lg" disabled={!canNext} onClick={() => setStep(step + 1)}>Next <ArrowRight /></Button>
            ) : (
              <Button variant="gold" size="lg" onClick={() => onDone({ ...p, name: p.name.trim() })}><Check /> Enrol & start</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
