import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEPARTMENTS, HAIR_STYLES, LEVELS, OUTFITS, SKIN_TONES } from "@/game/data";
import type { Gender, Player } from "@/game/types";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

const STEPS = ["Name", "Gender", "Look", "Outfit", "Level", "Department", "Account"];
const HAIR_BY_GENDER: Record<Gender, string[]> = {
  male: ["short", "afro", "braids", "cap"],
  female: ["afro", "braids", "long-braids", "bun"],
};

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative min-h-12 rounded-xl border-2 p-3 pr-10 text-left text-sm font-semibold transition-all hover:-translate-y-0.5 active:scale-[0.98]",
        active ? "border-primary bg-primary text-primary-foreground shadow-hud" : "border-border bg-card hover:border-accent",
      )}
    >
      {children}
      {active && <Check aria-hidden className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />}
    </button>
  );
}

export function CreateStudent({ onDone, onBack }: { onDone: (p: Player) => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Player>({ name: "", skin: "s2", hair: "short", outfit: "tee-jeans", level: "ND I", dept: "", accessory: "none" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const set = (patch: Partial<Player>) => setP((x) => ({ ...x, ...patch }));
  const canNext = step === 0 ? p.name.trim().length >= 2 : step === 1 ? !!p.gender : step === 5 ? !!p.dept : step === 6 ? emailLooksValid && password.length >= 8 : true;
  const dept = DEPARTMENTS.find((d) => d.id === p.dept);
  const hairChoices = HAIR_STYLES.filter((style) => p.gender && HAIR_BY_GENDER[p.gender].includes(style.id));
  const outfitChoices = OUTFITS.filter((o) => !o.presentation || o.presentation === "all" || (p.gender === "male" && o.presentation === "masculine") || (p.gender === "female" && o.presentation === "feminine"));
  const chooseGender = (gender: Gender) => {
    const fits = (id: string) => OUTFITS.some((o) => o.id === id && (!o.presentation || o.presentation === "all" || (gender === "male" && o.presentation === "masculine") || (gender === "female" && o.presentation === "feminine")));
    const hairFits = HAIR_BY_GENDER[gender].includes(p.hair);
    const recommendedOutfit = gender === "female" ? "pattern-skirt" : "tee-jeans";
    set({ gender, ...(!hairFits ? { hair: HAIR_BY_GENDER[gender][0] as Player["hair"] } : {}), ...(p.gender !== gender || !fits(p.outfit) ? { outfit: recommendedOutfit } : {}) });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="kente h-1.5" />
      <div className="mx-auto grid w-full max-w-5xl flex-1 gap-6 p-4 md:grid-cols-[1fr_1.4fr] md:p-8">
        <div className="bg-title relative flex min-h-[330px] flex-col items-center justify-center overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-hud md:sticky md:top-8 md:h-[calc(100dvh-4rem)]">
          <div aria-hidden className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-gold/20" />
          <div aria-hidden className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full border border-gold/15" />
          <p className="relative font-display text-xs font-bold tracking-[0.3em] text-accent">YOUR CAMPUS STORY</p>
          <div className="relative my-5 rounded-[4rem] border border-white/15 bg-white/10 px-8 py-4 shadow-inner transition-transform duration-300 hover:scale-[1.03]">
            <div aria-hidden className="student-preview-glow absolute inset-3 rounded-[3.5rem]" />
            <Sparkles aria-hidden className="student-sparkle absolute -left-5 top-8 h-5 w-5 text-gold" />
            <Sparkles aria-hidden className="student-sparkle student-sparkle-delay absolute -right-5 top-16 h-4 w-4 text-cream" />
            <Sparkles aria-hidden className="student-sparkle student-sparkle-slow absolute -left-3 bottom-8 h-3.5 w-3.5 text-gold" />
            <div className="relative animate-float-slow"><Avatar player={p} size={110} /></div>
          </div>
          <p className="font-display relative max-w-full truncate text-2xl font-bold">{p.name.trim() || "Your name"}</p>
          <p className="relative text-sm opacity-80">{p.level}{dept ? ` · ${dept.name}` : ""}</p>
          <p className="relative mt-1 text-xs opacity-70">{OUTFITS.find((o) => o.id === p.outfit)?.label}</p>
          <div className="relative mt-5 rounded-full border border-gold/30 bg-black/15 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-gold">OOPOLY STUDENT</div>
        </div>

        <div className="flex flex-col">
          <nav className="mb-6" aria-label="Student creation progress">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground"><span>Step {step + 1} of {STEPS.length}</span><span className="text-primary">{STEPS[step]}</span></div>
            <div className="flex gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <button key={s} type="button" disabled={i > step} aria-label={`Go to ${s} step`} aria-current={i === step ? "step" : undefined} onClick={() => setStep(i)} className="group flex-1 cursor-pointer disabled:cursor-default">
                <span className={cn("block h-2 rounded-full transition-all duration-300 group-hover:brightness-90", i <= step ? "bg-primary" : "bg-muted")} />
              </button>
            ))}
            </div>
          </nav>

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
              <div className="space-y-4">
                <h2 className="font-display text-3xl font-bold">Choose your gender</h2>
                <p className="text-sm text-muted-foreground">We’ll tailor the hairstyle and outfit options to your selection.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([ ["male", "Male", "Shirts, jeans & campus fits"], ["female", "Female", "Skirts, dresses & campus fits"] ] as const).map(([gender, label, desc]) => (
                    <Choice key={gender} active={p.gender === gender} onClick={() => chooseGender(gender)}><span className="block"><span className="block font-display text-lg">{label}</span><span className={cn("mt-1 block text-xs font-normal", p.gender === gender ? "text-primary-foreground/75" : "text-muted-foreground")}>{desc}</span></span></Choice>
                  ))}
                </div>
              </div>
            )}
            {step === 2 && (
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
                    {hairChoices.map((h) => <Choice key={h.id} active={p.hair === h.id} onClick={() => set({ hair: h.id })}>{h.label}</Choice>)}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold">Accessory</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["none", "glasses", "earrings"] as const).map((accessory) => (
                      <Choice key={accessory} active={(p.accessory ?? "none") === accessory} onClick={() => set({ accessory })}>{accessory === "none" ? "None" : accessory === "glasses" ? "Glasses" : "Earrings"}</Choice>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-3">
                <h2 className="font-display text-3xl font-bold">Everyday outfit</h2>
                <p className="text-sm text-muted-foreground">Casual wear is the default. The formal uniform is optional.</p>
                <div className="grid grid-cols-2 gap-2">
                  {outfitChoices.map((o) => (
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
            {step === 4 && (
              <div className="space-y-3">
                <h2 className="font-display text-3xl font-bold">Your level</h2>
                <div className="grid grid-cols-2 gap-2">
                  {LEVELS.map((l) => <Choice key={l} active={p.level === l} onClick={() => set({ level: l })}><span className="font-display text-xl">{l}</span></Choice>)}
                </div>
              </div>
            )}
            {step === 5 && (
              <div className="space-y-3">
                <h2 className="font-display text-3xl font-bold">Department</h2>
                <p className="rounded-lg border border-accent bg-secondary p-2.5 text-xs">Choose a department to personalize your campus story. Department options will be updated as the game grows.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DEPARTMENTS.map((d) => <Choice key={d.id} active={p.dept === d.id} onClick={() => set({ dept: d.id })}>{d.name}</Choice>)}
                </div>
              </div>
            )}
            {step === 6 && (
              <div className="space-y-4">
                <h2 className="font-display text-3xl font-bold">Create your account</h2>
                <p className="text-sm text-muted-foreground">Add an email and password for your student profile.</p>
                <label className="block space-y-1.5 text-sm font-semibold">Email address
                  <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12" />
                </label>
                <label className="block space-y-1.5 text-sm font-semibold">Password
                  <Input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="h-12" />
                </label>
                <p className="rounded-xl border border-accent bg-secondary p-3 text-xs leading-relaxed text-muted-foreground">Online sign-in and cross-device saves are not connected yet. For now, game progress stays in this browser. Your password is not saved.</p>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 mt-6 flex justify-between gap-3 bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <Button variant="outline" className="h-12 min-w-28 rounded-xl" onClick={() => (step === 0 ? onBack() : setStep(step - 1))}><ArrowLeft /> Back</Button>
            {step < STEPS.length - 1 ? (
              <Button variant="gold" className="h-12 min-w-36 rounded-xl" disabled={!canNext} onClick={() => setStep(step + 1)}>Next <ArrowRight /></Button>
            ) : (
              <Button variant="gold" className="h-12 min-w-40 rounded-xl" disabled={!dept || !emailLooksValid || password.length < 8} onClick={() => onDone({ ...p, name: p.name.trim() })}><Check /> Enrol & start</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
