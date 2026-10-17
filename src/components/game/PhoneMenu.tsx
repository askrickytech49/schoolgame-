import { useState } from "react";
import { ArrowLeft, X, MessageCircle, Lock, RotateCcw, LogOut, MapPin } from "lucide-react";
import { BUILDINGS, FRIENDS, ITEMS, JOBS, OBJECTIVES, OUTFITS, deptOf } from "@/game/data";
import { acceptJob, chatFriend, completeJob, consumeItem, formatNaira, levelOf, useGame } from "@/game/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MENU, Minimap, type PanelId } from "./Hud";
import { Avatar } from "./Avatar";
import { notify } from "./LocationPanel";
import { SettingsPanel } from "./panels/SettingsPanel";
import { Credits } from "./TitleScreen";

function MapPanel({ nearby }: { nearby: string | null }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-center"><Minimap nearby={nearby} size={300} /></div>
      <p className="text-xs text-muted-foreground">Illustrative layout only. Tap a building in the world to walk there.</p>
      <ul className="space-y-1.5">
        {BUILDINGS.map((b) => (
          <li key={b.id} className="flex items-center gap-2 rounded-xl bg-secondary p-2.5 text-sm">
            <MapPin className="h-4 w-4 text-primary" /><span className="flex-1 font-semibold">{b.name}</span>
            {nearby === b.id && <Badge>You are here</Badge>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AcademicsPanel() {
  const s = useGame();
  const d = deptOf(s);
  return (
    <div className="space-y-3">
      <div>
        <p className="font-display text-lg font-bold">{d.name}</p>
        <p className="text-xs text-muted-foreground">{s.player?.level} · Sample/demo courses — not official curriculum.</p>
      </div>
      {d.courses.map((c) => {
        const p = s.courses[c.code] ?? { attended: 0, studied: 0 };
        const pct = Math.min(100, p.attended * 15 + p.studied * 10);
        return (
          <div key={c.code} className="rounded-2xl bg-secondary p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">{c.code} · {c.title}</p>
              <Badge variant="outline">SAMPLE</Badge>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground"><span>Attended: <b className="text-foreground">{p.attended}</b></span><span>Study sessions: <b className="text-foreground">{p.studied}</b></span></div>
            <Progress value={pct} className="mt-2 h-2" aria-label={`${c.code} readiness`} />
          </div>
        );
      })}
      <div className="rounded-xl border border-accent p-3 text-xs">
        <p className="font-bold">Tasks</p>
        <p>• Attend class at the Lecture Hall (8 AM–5 PM)</p>
        <p>• Study at the Library (needs student ID)</p>
        <p>• Workshop practicals give the most XP</p>
      </div>
    </div>
  );
}

function HustlesPanel({ nearby }: { nearby: string | null }) {
  const s = useGame();
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Virtual ₦ only. One active hustle at a time — accept, then go to the location.</p>
      {JOBS.map((j) => {
        const st = s.jobs[j.id];
        const loc = BUILDINGS.find((b) => b.id === j.location)!;
        return (
          <div key={j.id} className="rounded-2xl bg-secondary p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold">{j.title}</p>
                <p className="text-xs text-muted-foreground">{j.desc}</p>
                <p className="mt-1 text-xs"><b className="text-primary">{formatNaira(j.pay)}</b> · −{j.energy} energy · {j.minutes / 60}h · {loc.name}</p>
              </div>
              {st === "active" && <Badge className="bg-accent text-accent-foreground">Active</Badge>}
            </div>
            <div className="mt-2">
              {st === "active" ? (
                <Button size="sm" variant="gold" className="w-full" disabled={nearby !== j.location || s.energy < j.energy} onClick={() => notify(completeJob(j.id, nearby))}>
                  {nearby !== j.location ? `Go to ${loc.name} to complete` : s.energy < j.energy ? "Too tired" : "Complete now"}
                </Button>
              ) : (
                <Button size="sm" className="w-full" disabled={Object.values(s.jobs).includes("active")} onClick={() => notify(acceptJob(j.id))}>Accept</Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SocialPanel() {
  const s = useGame();
  return (
    <div className="space-y-2">
      {FRIENDS.map((f) => {
        const fr = s.friends[f.id] ?? { points: 0, lastDay: 0 };
        return (
          <div key={f.id} className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon font-display font-bold text-gold">{f.name[0]}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{f.name} <span className="font-normal text-muted-foreground">· {f.role}</span></p>
              <p className="truncate text-xs italic">“{f.line}”</p>
              <p className="text-[11px] text-muted-foreground">Friendship ♥ {fr.points}</p>
            </div>
            <Button size="sm" variant="outline" disabled={fr.lastDay === s.day} onClick={() => notify(chatFriend(f.id))}><MessageCircle /> Chat</Button>
          </div>
        );
      })}
      <p className="text-[11px] text-muted-foreground">Fictional characters. One chat per friend per day.</p>
    </div>
  );
}

function InventoryPanel() {
  const s = useGame();
  const entries = Object.entries(s.inventory).filter(([, n]) => n > 0);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-2xl bg-charcoal p-3 text-cream"><span className="text-sm">Wallet (virtual)</span><span className="font-display text-xl font-bold text-gold">{formatNaira(s.cash)}</span></div>
      {entries.length === 0 && <p className="rounded-xl bg-secondary p-4 text-center text-sm text-muted-foreground">Your bag is empty. Try the Cafeteria or Student Centre.</p>}
      {entries.map(([id, n]) => {
        const it = ITEMS[id];
        return (
          <div key={id} className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
            <div className="flex-1"><p className="text-sm font-bold">{it.name} ×{n}</p><p className="text-xs text-muted-foreground">{it.desc}</p></div>
            {it.use && <Button size="sm" onClick={() => notify(consumeItem(id))}>{it.useLabel}</Button>}
          </div>
        );
      })}
    </div>
  );
}

function ProfilePanel() {
  const s = useGame();
  const p = s.player!;
  const lvl = levelOf(s.xp);
  return (
    <div className="space-y-3">
      <div className="bg-title flex items-center gap-4 rounded-2xl p-4 text-primary-foreground">
        <Avatar player={p} size={56} />
        <div>
          <p className="font-display text-2xl font-bold">{p.name}</p>
          <p className="text-sm opacity-80">{p.level} · {deptOf(s).name}</p>
          <p className="text-xs opacity-70">{OUTFITS.find((o) => o.id === p.outfit)?.label}</p>
        </div>
      </div>
      <div className="rounded-2xl bg-secondary p-3">
        <div className="flex justify-between text-sm font-bold"><span>Level {lvl}</span><span>{s.xp % 100}/100 XP</span></div>
        <Progress value={s.xp % 100} className="mt-2 h-2.5" aria-label="XP progress" />
        <p className="mt-1 text-xs text-muted-foreground">Total XP {s.xp}</p>
      </div>
      <div className="rounded-2xl bg-secondary p-3">
        <p className="mb-2 text-sm font-bold">Objectives</p>
        {OBJECTIVES.map((o, i) => (
          <p key={o.id} className={i < s.objective ? "text-xs text-success line-through" : i === s.objective ? "text-xs font-bold" : "text-xs text-muted-foreground"}>
            {i < s.objective ? "✓" : i === s.objective ? "→" : <Lock className="inline h-3 w-3" />} {o.text}
          </p>
        ))}
      </div>
    </div>
  );
}

export function PhoneMenu({ initial, nearby, onClose, onReset, onQuit }: { initial: PanelId | null; nearby: string | null; onClose: () => void; onReset: () => void; onQuit: () => void }) {
  const [panel, setPanel] = useState<PanelId | null>(initial);
  const [confirm, setConfirm] = useState(false);
  const cur = MENU.find((m) => m.id === panel);
  return (
    <div className="fixed inset-0 z-[9500] flex items-end justify-center bg-charcoal/50 p-0 animate-in fade-in sm:items-center sm:p-4" onClick={onClose}>
      <div className="flex h-[88dvh] w-full max-w-sm flex-col overflow-hidden rounded-t-[2rem] border-[6px] border-charcoal bg-card shadow-hud animate-in slide-in-from-bottom-8 sm:h-[720px] sm:max-h-[92dvh] sm:rounded-[2.5rem]"
        onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-label="Phone">
        <div className="flex items-center gap-2 bg-charcoal px-4 py-2.5 text-cream">
          {panel ? <Button variant="ghostLight" size="icon" className="h-8 w-8" onClick={() => setPanel(null)} aria-label="Back"><ArrowLeft /></Button> : <span className="w-8" />}
          <p className="flex-1 text-center font-display font-bold">{cur?.label ?? "CampusPhone"}</p>
          <Button variant="ghostLight" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Close phone"><X /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!panel && (
            <div className="grid grid-cols-3 gap-3">
              {MENU.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setPanel(id)} className="flex flex-col items-center gap-2 rounded-2xl p-2 text-xs font-semibold transition hover:bg-secondary active:scale-95">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-title text-gold shadow-hud"><Icon className="h-6 w-6" /></span>{label}
                </button>
              ))}
            </div>
          )}
          {panel === "map" && <MapPanel nearby={nearby} />}
          {panel === "academics" && <AcademicsPanel />}
          {panel === "hustles" && <HustlesPanel nearby={nearby} />}
          {panel === "social" && <SocialPanel />}
          {panel === "inventory" && <InventoryPanel />}
          {panel === "profile" && <ProfilePanel />}
          {panel === "settings" && (
            <SettingsPanel>
              <div className="grid gap-2">
                <Button variant="outline" onClick={onQuit}><LogOut /> Save & return to title</Button>
                {confirm ? (
                  <div className="flex gap-2"><Button variant="destructive" className="flex-1" onClick={onReset}>Yes, erase save</Button><Button variant="outline" onClick={() => setConfirm(false)}>Cancel</Button></div>
                ) : (
                  <Button variant="destructive" onClick={() => setConfirm(true)}><RotateCcw /> Reset / new game</Button>
                )}
              </div>
              <details className="rounded-xl bg-secondary p-3 text-xs"><summary className="cursor-pointer font-bold">Credits</summary><div className="mt-2"><Credits /></div></details>
            </SettingsPanel>
          )}
        </div>
        <div className="mx-auto mb-2 h-1 w-24 rounded-full bg-charcoal/30" />
      </div>
    </div>
  );
}
