import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { setGame, useGame } from "@/game/store";

export function SettingsPanel({ children }: { children?: React.ReactNode }) {
  const s = useGame();
  const toggle = (k: "reducedMotion" | "showLabels") => setGame((g) => ({ ...g, settings: { ...g.settings, [k]: !g.settings[k] } }));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-secondary p-3">
        <Label htmlFor="labels">Show building labels</Label>
        <Switch id="labels" checked={s.settings.showLabels} onCheckedChange={() => toggle("showLabels")} />
      </div>
      <div className="flex items-center justify-between rounded-xl bg-secondary p-3">
        <Label htmlFor="motion">Reduce motion</Label>
        <Switch id="motion" checked={s.settings.reducedMotion} onCheckedChange={() => toggle("reducedMotion")} />
      </div>
      <div className="rounded-xl border border-accent bg-card p-3 text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Prototype: campus layout illustrative.</strong> Buildings and positions are stylized and not an accurate map of the Aba campus. Departments/courses are samples pending verification. Unofficial fan project — not endorsed by the institution.
      </div>
      {children}
    </div>
  );
}
