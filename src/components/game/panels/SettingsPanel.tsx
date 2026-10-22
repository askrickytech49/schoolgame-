import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { setGame, useGame } from "@/game/store";
import { configureAudio } from "@/game/audio";

export function SettingsPanel({ children }: { children?: React.ReactNode }) {
  const s = useGame();
  const toggle = (k: "reducedMotion" | "showLabels") => setGame((g) => ({ ...g, settings: { ...g.settings, [k]: !g.settings[k] } }));
  const toggleAudio = () => setGame((g) => {
    const audioEnabled = !g.settings.audioEnabled;
    configureAudio({ audioEnabled, audioVolume: g.settings.audioVolume });
    return { ...g, settings: { ...g.settings, audioEnabled } };
  });
  const setVolume = (value: number[]) => setGame((g) => {
    const audioVolume = value[0] ?? g.settings.audioVolume;
    configureAudio({ audioEnabled: g.settings.audioEnabled, audioVolume });
    return { ...g, settings: { ...g.settings, audioVolume } };
  });
  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl bg-secondary p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5"><Label htmlFor="game-audio">Campus soundtrack & sounds</Label><p className="text-xs text-muted-foreground">Cultural Flow soundtrack, clicks, notifications and movement sounds.</p></div>
          <Switch id="game-audio" checked={s.settings.audioEnabled} onCheckedChange={toggleAudio} />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground"><Label htmlFor="audio-volume">Volume</Label><span>{Math.round(s.settings.audioVolume * 100)}%</span></div>
        <Slider id="audio-volume" aria-label="Game audio volume" min={0} max={1} step={0.05} value={[s.settings.audioVolume]} onValueChange={setVolume} disabled={!s.settings.audioEnabled} />
      </div>
      <div className="flex items-center justify-between rounded-xl bg-secondary p-3">
        <Label htmlFor="labels">Show building labels</Label>
        <Switch id="labels" checked={s.settings.showLabels} onCheckedChange={() => toggle("showLabels")} />
      </div>
      <div className="flex items-center justify-between rounded-xl bg-secondary p-3">
        <Label htmlFor="motion">Reduce motion</Label>
        <Switch id="motion" checked={s.settings.reducedMotion} onCheckedChange={() => toggle("reducedMotion")} />
      </div>
      <div className="rounded-xl border border-accent bg-card p-3 text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Campus information.</strong> Buildings and positions are stylized and are not an accurate map of the Aba campus. Department and course options are starter selections. This fan-made game is not endorsed by the institution.
      </div>
      {children}
    </div>
  );
}
