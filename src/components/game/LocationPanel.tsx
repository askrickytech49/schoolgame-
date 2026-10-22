import * as Icons from "lucide-react";
import { toast } from "sonner";
import { BUILDINGS, CAMPUS_SPORTS, GARDEN_ACTIONS, JOBS, LOVE_GARDENS } from "@/game/data";
import { blockReason, completeJob, formatNaira, runAction, setGame, useGame, type Result } from "@/game/store";
import { Button } from "@/components/ui/button";
import { Avatar } from "./Avatar";
import type { PanelId } from "./Hud";

export function notify(r: Result) {
  if (r.ok) toast.success(r.msg); else toast.error(r.msg);
  if (r.bonus) toast(r.bonus, { icon: "🎯" });
}

export function LocationPanel({ id, onClose, onOpenPanel, mandatory = false }: { id: string; onClose: () => void; onOpenPanel: (p: PanelId) => void; mandatory?: boolean }) {
  const s = useGame();
  const b = BUILDINGS.find((x) => x.id === id);
  const garden = LOVE_GARDENS.find((x) => x.id === id);
  const sport = CAMPUS_SPORTS.find((x) => x.id === id);
  if (!b && garden) return <GardenPanel garden={garden} onClose={onClose} />;
  if (!b && sport) return <SportsPanel sport={sport} onClose={onClose} />;
  if (!b) return null;
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[b.icon] ?? Icons.Building2;
  const jobHere = JOBS.find((j) => j.location === id && s.jobs[j.id] === "active");
  const guideResponse = s.admissionStage === "form-needed"
    ? "Great! Your next steps are in the Student Portal app on your phone. Buy your application form there for ₦2,500 using earned game money, then return to the app for your scratch card."
    : s.admissionStage === "scratch-needed"
      ? "Your form is ready. Open Student Portal on your phone to buy the application scratch card."
      : s.admissionStage === "portal-ready"
        ? "You have your form and scratch card. Open Student Portal on your phone to check your application result."
        : s.admissionStage === "admitted"
          ? "Congratulations! Your next task is to collect your student ID at the Student Service Point. Open the phone Map, choose Student Service Point as your destination, and follow the highlighted route. When you arrive, tap Enter and choose Collect student ID card."
          : null;
  const acknowledgeGuide = () => {
    // Persist the acknowledgement so an old or partially migrated save cannot
    // reopen the gate guide after the student has chosen to follow its directions.
    setGame((game) => game.admissionGuideAnswered ? game : { ...game, admissionGuideAnswered: true });
    onClose();
  };
  return (
    <>
    {mandatory && <div className="fixed inset-0 z-[8900] bg-charcoal/30 backdrop-blur-[1px]" aria-hidden="true" onPointerDown={(event) => event.stopPropagation()} />}
    <div className="fixed inset-x-0 bottom-0 z-[9000] p-2 md:inset-x-auto md:bottom-6 md:right-6 md:w-[400px] md:p-0 animate-in slide-in-from-bottom-6 fade-in duration-300" role="dialog" aria-label={b.name}>
      <div className="overflow-hidden rounded-3xl bg-card shadow-hud">
        <div className="bg-title flex items-start gap-3 p-4 text-primary-foreground">
          <div className="rounded-xl bg-gold-gradient p-2.5 text-accent-foreground"><Icon className="h-6 w-6" /></div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold">{b.name}</h2>
            <p className="text-xs opacity-80">{b.blurb}</p>
          </div>
          {!mandatory && <Button variant="ghostLight" size="icon" onClick={onClose} aria-label="Close"><Icons.X /></Button>}
        </div>
        <div className="max-h-[50dvh] space-y-2 overflow-y-auto p-3">
          {b.actions.length === 0 && <p className="rounded-xl bg-secondary p-3 text-sm text-muted-foreground">This landmark is marked on your campus map. Activities will be added when its role is confirmed.</p>}
          {b.id === "gate" && (
            <div className="rounded-2xl border border-accent/50 bg-secondary p-4">
              <div className="flex items-center gap-3"><Avatar player={{ skin: "s2", hair: "short", outfit: "green-polo", gender: "female", accessory: "none" }} size={34} /><div><p className="text-sm font-bold">Admissions guide · Amara</p><p className="text-[10px] text-muted-foreground">Campus welcome team</p></div></div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{guideResponse ?? "“Welcome to OOPOLY! What brings you to campus?” Choose your first task to begin the application journey."}</p>
              {guideResponse ? <>
                {s.admissionStage === "admitted" && <Button className="mt-3 w-full" onClick={() => onOpenPanel("map")}>Open Map for directions</Button>}
                <Button className={`${s.admissionStage === "admitted" ? "mt-2" : "mt-3"} w-full`} variant={s.admissionStage === "admitted" ? "outline" : "default"} onClick={acknowledgeGuide}>Got it — I’ll follow the directions</Button>
              </> : <>
                <Button className="mt-3 w-full" onClick={() => notify(runAction(b.actions.find((a) => a.id === "checkin")!))}>Yes, I want to apply</Button>
                {mandatory && <Button variant="outline" className="w-full" onClick={() => { setGame((game) => ({ ...game, admissionGuideAnswered: true })); onClose(); }}>Not now, I’m just exploring</Button>}
              </>}
            </div>
          )}
          {jobHere && (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-accent bg-secondary p-3">
              <Icons.Briefcase className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold">Hustle: {jobHere.title}</p>
                <p className="text-xs text-muted-foreground">+₦{jobHere.pay.toLocaleString()} · −{jobHere.energy} energy</p>
              </div>
              <Button variant="gold" size="sm" disabled={s.energy < jobHere.energy} onClick={() => notify(completeJob(jobHere.id, id))}>Do it</Button>
            </div>
          )}
          {b.actions.filter((a) => !(b.id === "gate" && a.id === "checkin")).map((a) => {
            const why = a.openPanel ? null : blockReason(s, a.d, a.hours, a.requires);
            return (
              <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-secondary p-3 transition hover:bg-muted">
                <div className="flex-1">
                  <p className="text-sm font-bold">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                  {why && <p className="mt-0.5 text-xs font-semibold text-destructive">{why}</p>}
                </div>
                <Button size="sm" disabled={!!why} onClick={() => (a.openPanel ? onOpenPanel(a.openPanel) : notify(runAction(a)))}>
                  {a.openPanel ? "Open" : "Go"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}

function SportsPanel({ sport, onClose }: { sport: (typeof CAMPUS_SPORTS)[number]; onClose: () => void }) {
  const icons = { football: "⚽", basketball: "🏀", volleyball: "🏐" };
  return <div className="fixed inset-x-0 bottom-0 z-[9000] p-2 md:inset-x-auto md:bottom-6 md:right-6 md:w-[400px] md:p-0 animate-in slide-in-from-bottom-6 fade-in duration-300" role="dialog" aria-label={sport.name}>
    <div className="overflow-hidden rounded-3xl bg-card shadow-hud">
      <div className="flex items-start gap-3 bg-emerald-900 p-4 text-white">
        <div className="rounded-xl bg-white/15 p-2.5 text-2xl">{icons[sport.sport]}</div>
        <div className="flex-1"><h2 className="font-display text-xl font-bold">{sport.name}</h2><p className="text-xs text-white/80">{sport.blurb}</p></div>
        <Button variant="ghostLight" size="icon" onClick={onClose} aria-label="Close"><Icons.X /></Button>
      </div>
      <div className="space-y-2 p-3">
        {sport.activities.map((activity) => <SportAction key={activity.id} activity={activity} />)}
        <p className="px-1 text-[10px] text-muted-foreground">Campus games reward experience and mood. Energy and time are used in-game.</p>
      </div>
    </div>
  </div>;
}

function SportAction({ activity }: { activity: (typeof CAMPUS_SPORTS)[number]["activities"][number] }) {
  const s = useGame();
  const why = blockReason(s, activity.d);
  return <div className="flex items-center gap-3 rounded-2xl bg-secondary p-3"><div className="min-w-0 flex-1"><p className="text-sm font-bold">{activity.label}</p><p className="text-xs text-muted-foreground">{activity.desc}</p>{why && <p className="mt-1 text-xs font-semibold text-destructive">{why}</p>}</div><Button size="sm" disabled={!!why} onClick={() => notify(runAction(activity))}>Play</Button></div>;
}

function GardenPanel({ garden, onClose }: { garden: (typeof LOVE_GARDENS)[number]; onClose: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[9000] p-2 md:inset-x-auto md:bottom-6 md:right-6 md:w-[400px] md:p-0 animate-in slide-in-from-bottom-6 fade-in duration-300" role="dialog" aria-label={garden.name}>
      <div className="overflow-hidden rounded-3xl bg-card shadow-hud">
        <div className="flex items-start gap-3 bg-emerald-800 p-4 text-white">
          <div className="rounded-xl bg-white/15 p-2.5 text-2xl">🌿</div>
          <div className="flex-1"><h2 className="font-display text-xl font-bold">{garden.name}</h2><p className="text-xs text-white/80">{garden.blurb}</p></div>
          <Button variant="ghostLight" size="icon" onClick={onClose} aria-label="Close"><Icons.X /></Button>
        </div>
        <div className="space-y-2 p-3">
          {GARDEN_ACTIONS.map((action) => <Button key={action.id} variant="outline" className="h-auto w-full justify-between gap-3 whitespace-normal p-3 text-left" onClick={() => notify(runAction(action))}>
            <span><span className="block font-bold">{action.label}</span><span className="block text-xs font-normal text-muted-foreground">{action.desc}</span></span>
            <Icons.ArrowRight className="h-4 w-4 shrink-0" />
          </Button>)}
        </div>
      </div>
    </div>
  );
}
