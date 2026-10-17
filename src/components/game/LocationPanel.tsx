import * as Icons from "lucide-react";
import { toast } from "sonner";
import { BUILDINGS, JOBS } from "@/game/data";
import { blockReason, completeJob, runAction, useGame, type Result } from "@/game/store";
import { Button } from "@/components/ui/button";
import type { PanelId } from "./Hud";

export function notify(r: Result) {
  if (r.ok) toast.success(r.msg); else toast.error(r.msg);
  if (r.bonus) toast(r.bonus, { icon: "🎯" });
}

export function LocationPanel({ id, onClose, onOpenPanel }: { id: string; onClose: () => void; onOpenPanel: (p: PanelId) => void }) {
  const s = useGame();
  const b = BUILDINGS.find((x) => x.id === id)!;
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[b.icon] ?? Icons.Building2;
  const jobHere = JOBS.find((j) => j.location === id && s.jobs[j.id] === "active");
  return (
    <div className="fixed inset-x-0 bottom-0 z-[9000] p-2 md:inset-x-auto md:bottom-6 md:right-6 md:w-[400px] md:p-0 animate-in slide-in-from-bottom-6 fade-in duration-300" role="dialog" aria-label={b.name}>
      <div className="overflow-hidden rounded-3xl bg-card shadow-hud">
        <div className="bg-title flex items-start gap-3 p-4 text-primary-foreground">
          <div className="rounded-xl bg-gold-gradient p-2.5 text-accent-foreground"><Icon className="h-6 w-6" /></div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold">{b.name}</h2>
            <p className="text-xs opacity-80">{b.blurb}</p>
          </div>
          <Button variant="ghostLight" size="icon" onClick={onClose} aria-label="Close"><Icons.X /></Button>
        </div>
        <div className="max-h-[50dvh] space-y-2 overflow-y-auto p-3">
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
          {b.actions.map((a) => {
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
  );
}
