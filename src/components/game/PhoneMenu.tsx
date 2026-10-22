import { useEffect, useState } from "react";
import { ArrowLeft, X, MessageCircle, Lock, RotateCcw, LogOut, MapPin, Send, Search, Phone, Video, MoreVertical, CheckCheck } from "lucide-react";
import { BUILDINGS, CAMPUS_SPORTS, FRIENDS, ITEMS, JOBS, LOVE_GARDENS, MAP_LAYOUT, OBJECTIVES, OUTFITS, START_POS, deptOf } from "@/game/data";
import { acceptJob, buyApplicationItem, chatFriend, checkAdmissionResult, completeJob, consumeItem, formatNaira, levelOf, setGame, useGame } from "@/game/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MENU, Minimap, type PanelId } from "./Hud";
import { doorOf, findWalkRoute, livePos } from "./CampusScene";
import { Avatar } from "./Avatar";
import { notify } from "./LocationPanel";
import { SettingsPanel } from "./panels/SettingsPanel";
import { Credits } from "./TitleScreen";

function MapPanel({ nearby }: { nearby: string | null }) {
  const [fromId, setFromId] = useState(() => { try { return sessionStorage.getItem("oopoly-map-from") || "current"; } catch { return "current"; } });
  const [toId, setToId] = useState(() => { try { return sessionStorage.getItem("oopoly-map-to") || ""; } catch { return ""; } });
  const [arrivedAt, setArrivedAt] = useState(() => { try { return sessionStorage.getItem("oopoly-map-arrived") || ""; } catch { return ""; } });
  useEffect(() => {
    try {
      sessionStorage.setItem("oopoly-map-from", fromId);
      sessionStorage.setItem("oopoly-map-to", toId);
      sessionStorage.setItem("oopoly-map-arrived", arrivedAt);
    } catch { /* Navigation can still be used if browser storage is unavailable. */ }
  }, [fromId, toId, arrivedAt]);
  const places = [
    ...BUILDINGS.map((building) => ({ id: building.id, name: building.name, point: doorOf(building) })),
    ...LOVE_GARDENS.map((garden) => ({ id: garden.id, name: garden.name, point: { x: garden.x + garden.w / 2, y: garden.y + garden.h / 2 } })),
    ...CAMPUS_SPORTS.map((area) => ({ id: area.id, name: area.name, point: area.entrance })),
  ];
  const currentPosition = { x: livePos.x || START_POS.x, y: livePos.y || START_POS.y };
  const origin = fromId === "current" ? currentPosition : places.find((place) => place.id === fromId)?.point ?? currentPosition;
  const destination = places.find((place) => place.id === toId);
  const route = destination ? findWalkRoute(origin, destination.point) : [];
  const routePoints = destination ? [origin, ...route] : [];
  const arrived = !!destination && nearby === destination.id;
  const directions = routePoints.length > 1 ? routePoints.slice(1).filter((_, index) => index === 0 || index % 7 === 0 || index === routePoints.length - 2).map((point, index, points) => {
    const previous = index === 0 ? origin : points[index - 1];
    const dx = point.x - previous.x, dy = point.y - previous.y;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "east" : "west") : (dy > 0 ? "south" : "north");
  }).filter((direction, index, all) => direction !== all[index - 1]) : [];
  const landmarks = destination ? places.filter((place) => place.id !== fromId && place.id !== toId).map((place) => {
    let bestDistance = Infinity, routeIndex = 0;
    routePoints.forEach((point, index) => {
      const distance = Math.hypot(point.x - place.point.x, point.y - place.point.y);
      if (distance < bestDistance) { bestDistance = distance; routeIndex = index; }
    });
    return { ...place, bestDistance, routeIndex };
  }).filter((place) => place.bestDistance < 180).sort((a, b) => a.routeIndex - b.routeIndex).slice(0, 3) : [];
  const finishArrival = () => {
    if (!destination || !arrived) return;
    setFromId(destination.id);
    setArrivedAt(destination.id);
    setToId("");
  };
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border-2 border-maroon bg-grass shadow-sm"><Minimap nearby={nearby} size={300} route={routePoints} destination={destination?.point} origin={fromId !== "current" ? origin : null} /></div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 text-[10px] font-semibold text-muted-foreground"><span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full border-2 border-white bg-[#27a4db] shadow" />You are here</span><span className="inline-flex items-center gap-1"><i className="h-1 w-4 rounded bg-[#ffbf47]" />Walking route</span><span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-t-full rounded-br-full bg-maroon ring-1 ring-gold" />Destination</span></div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">Choose your starting point and destination. Follow the highlighted campus roads and the map pin. Close the phone to walk, then reopen Map to update your route. Locations are approximate.</p>
      <label className="block space-y-1 text-xs font-bold">Starting from
        <select value={fromId} onChange={(event) => { setFromId(event.target.value); setArrivedAt(""); }} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold text-foreground">
          <option value="current">My current position{nearby ? ` · ${places.find((place) => place.id === nearby)?.name ?? "on campus"}` : ""}</option>
          {places.map((place) => <option key={place.id} value={place.id}>{place.name}{nearby === place.id ? " · You are here" : ""}</option>)}
        </select>
      </label>
      <label className="block space-y-1 text-xs font-bold">Going to
        <select value={toId} onChange={(event) => { setToId(event.target.value); setArrivedAt(""); }} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold text-foreground">
          <option value="">Choose a place</option>
          {places.filter((place) => place.id !== fromId).map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}
        </select>
      </label>
      {destination && <div className="space-y-2 rounded-2xl border border-accent bg-secondary p-3">
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" /><p className="text-sm font-bold">Route to {destination.name}</p></div>
        {route.length === 0 ? <p className="text-xs text-muted-foreground">No walkable road route was found from this starting point.</p> : <>
          <ol className="space-y-1.5 text-xs leading-relaxed text-foreground">
            {(directions.length ? directions : ["ahead"]).slice(0, 5).map((direction, index) => <li key={`${direction}-${index}`}><span className="mr-1 font-bold text-primary">{index + 1}.</span> Follow the campus road {direction}{index < landmarks.length ? `, past ${landmarks[index].name}` : ""}{index === Math.min(directions.length, 5) - 1 ? ` to ${destination.name}.` : "."}</li>)}
          </ol>
          {!arrived && <p className="rounded-xl border border-accent/60 bg-card/70 p-2.5 text-[11px] leading-relaxed text-muted-foreground"><strong className="text-foreground">For the visual guide, look at the map above.</strong> Follow its moving highlighted route and animated pin. Check the map again as you pass each landmark to see the next part of your route.</p>}
          {arrived && <p role="status" className="text-xs font-bold text-emerald-800">You’ve arrived at {destination.name}.</p>}
        </>}
        {arrived && <Button className="w-full" onClick={finishArrival}>Done · choose next destination</Button>}
      </div>}
      {arrivedAt && !toId && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-900">Trip complete. Choose where to go next; {places.find((place) => place.id === arrivedAt)?.name} is set as your starting point.</p>}
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
        <p>• Attend class at SLT (8 AM–5 PM)</p>
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
              ) : st === "done" ? (
                <Button size="sm" variant="outline" className="w-full" disabled>Completed ✓</Button>
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

type ChatMessage = { from: "admin" | "student"; text: string; time: string };
const ANNOUNCEMENTS: ChatMessage[] = [
  { from: "admin", text: "Good morning, OOPOLY! Welcome to a new campus day. Check your department board for today's class venues.", time: "7:15 AM" },
  { from: "admin", text: "📢 Students: the inter-department football registration is open at the Student Centre until 4 PM.", time: "8:02 AM" },
  { from: "admin", text: "Library study rooms are open. Please keep the space tidy and remember your student ID.", time: "9:30 AM" },
  { from: "admin", text: "🎉 Campus games night starts at the Student Centre by 6 PM. Bring your friends!", time: "10:45 AM" },
];

function WhatsAppPanel() {
  const [inGroup, setInGroup] = useState(false);
  const [messages, setMessages] = useState(ANNOUNCEMENTS);
  const [draft, setDraft] = useState("");
  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { from: "student", text, time: "Now" }]);
    setDraft("");
  };
  if (!inGroup) return <div className="-m-4 min-h-full bg-[#f5f2ec]">
    <div className="bg-[#075e54] px-4 pb-3 pt-4 text-white"><div className="flex items-center justify-between"><p className="text-xl font-bold">WhatsApp</p><div className="flex gap-4"><Search size={19} /><MoreVertical size={19} /></div></div><div className="mt-4 flex gap-6 text-xs font-bold uppercase tracking-wide text-white/70"><span className="border-b-2 border-white pb-2 text-white">Chats</span><span className="pb-2">Updates</span><span className="pb-2">Calls</span></div></div>
    <button type="button" onClick={() => setInGroup(true)} className="flex w-full items-center gap-3 border-b border-black/5 bg-white p-4 text-left active:bg-gray-100">
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-xl text-white">🎓<span className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white bg-green-500 p-1" /></div>
      <div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><span className="font-bold text-gray-900">OOPOLY Students · Official</span><span className="text-[10px] text-gray-500">10:45 AM</span></div><p className="truncate text-sm text-gray-600">Admin: 🎉 Campus games night starts at 6 PM...</p><p className="mt-1 text-[10px] text-gray-400">248 members · 3 admins</p></div>
    </button>
    <div className="p-4 text-center text-xs text-gray-500">Your campus conversations</div>
  </div>;
  return <div className="-m-4 flex min-h-full flex-col bg-[#efeae2]">
    <div className="flex items-center gap-2 bg-[#075e54] px-2 py-3 text-white"><button type="button" onClick={() => setInGroup(false)} aria-label="Back to chats"><ArrowLeft size={20} /></button><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#128c7e]">🎓</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">OOPOLY Students</p><p className="text-[10px] text-white/75">248 members · 3 admins</p></div><Video size={19} /><Phone size={17} /><MoreVertical size={18} /></div>
    <div className="border-b border-amber-200 bg-[#fff4c8] px-3 py-2 text-center text-[10px] text-gray-600">🔒 Messages in this campus group stay in your game.</div>
    <div className="phone-scrollbar-hidden flex-1 space-y-2 overflow-y-auto p-3">
      <div className="mx-auto mb-3 w-fit rounded-lg bg-[#fff4c8] px-2 py-1 text-[10px] text-gray-600 shadow-sm">Today</div>
      {messages.map((message, i) => <div key={`${i}-${message.time}`} className={`max-w-[88%] rounded-lg px-2.5 py-2 shadow-sm ${message.from === "student" ? "ml-auto bg-[#d9fdd3]" : "bg-white"}`}>
        {message.from === "admin" && <p className="mb-1 text-[10px] font-bold text-[#075e54]">OOPOLY Admin ✓</p>}
        <p className="whitespace-pre-wrap text-xs leading-relaxed text-gray-800">{message.text}</p>
        <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-gray-500">{message.time}{message.from === "student" && <CheckCheck size={12} className="text-sky-600" />}</div>
      </div>)}
    </div>
    <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2 bg-[#f7f5f0] p-2"><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message the group" className="min-w-0 flex-1 rounded-full bg-white px-4 py-2.5 text-xs text-gray-900 outline-none" /><button type="submit" aria-label="Send message" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-white"><Send size={16} /></button></form>
  </div>;
}

function InventoryPanel() {
  const s = useGame();
  const entries = Object.entries(s.inventory).filter(([, n]) => n > 0);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-charcoal p-3 text-cream">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">Earned game money</p>
          <p className="mt-1 font-display text-lg font-bold text-gold">{formatNaira(s.cash)}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-white/70">Earned from campus jobs, objectives and activities.</p>
        </div>
        <div className="rounded-2xl border border-accent/50 bg-secondary p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Campus Credits</p>
          <p className="mt-1 font-display text-lg font-bold text-primary">{s.campusCredits.toLocaleString("en-NG")}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">Separate, non-withdrawable entertainment credits. They never become game money.</p>
        </div>
      </div>
      <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
        <p className="font-bold text-foreground">Credit top-ups aren’t connected yet</p>
        <p className="mt-1">No payment will be taken here. Campus Credits will only be added after a secure payment service is connected.</p>
      </div>
      {entries.length === 0 && <p className="rounded-xl bg-secondary p-4 text-center text-sm text-muted-foreground">Your bag is empty. Check GH or the unlabelled service structures.</p>}
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

function AdmissionsPanel() {
  const s = useGame();
  const status = {
    "not-started": "Start by speaking with the admissions guide at the Big gate.",
    "form-needed": "Buy your application form here using earned game money.",
    "scratch-needed": "Your form is ready. Buy a scratch card here to continue.",
    "portal-ready": "Your application is ready to check.",
    admitted: "Admission offer received! Visit the service point to collect your student ID.",
  }[s.admissionStage];
  return <div className="space-y-3">
    <div className="rounded-2xl bg-title p-4 text-primary-foreground"><p className="text-[10px] font-bold uppercase tracking-widest text-gold">OOPOLY · Admissions</p><h2 className="mt-1 font-display text-xl font-bold">Student Portal</h2><p className="mt-2 text-xs leading-relaxed opacity-80">A fictional story feature. Application steps and results are simulated and use earned game money only.</p></div>
    <div className="rounded-2xl bg-secondary p-4"><p className="text-sm font-bold">Application status</p><p className="mt-1 text-sm text-muted-foreground">{status}</p>
      <p className="mt-3 text-xs text-muted-foreground">Fictional purchases use earned game money only.</p>
      {s.admissionStage === "form-needed" && <Button className="mt-3 w-full" disabled={s.cash < 2500} onClick={() => notify(buyApplicationItem("form"))}>Buy application form · {formatNaira(2500)}</Button>}
      {s.admissionStage === "scratch-needed" && <Button className="mt-3 w-full" disabled={s.cash < 700} onClick={() => notify(buyApplicationItem("scratch"))}>Buy scratch card · {formatNaira(700)}</Button>}
      {s.applicationCode && <p className="mt-3 rounded-xl bg-card p-3 text-xs">Application code <strong className="ml-1">{s.applicationCode}</strong></p>}
      {s.admissionStage === "portal-ready" && <Button className="mt-3 w-full" onClick={() => notify(checkAdmissionResult())}>Check admission result</Button>}
      {s.admissionStage === "admitted" && <div className="mt-3 rounded-xl border border-emerald-700/20 bg-emerald-100 p-3 text-sm font-bold text-emerald-950">🎉 Congratulations, your simulated admission is successful!</div>}
    </div>
    <p className="text-[10px] leading-relaxed text-muted-foreground">This game does not submit information to the institution or process real payments.</p>
  </div>;
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
      <div className="space-y-2 rounded-2xl bg-secondary p-3">
        <div><p className="text-sm font-bold">Wardrobe</p><p className="text-xs text-muted-foreground">Choose an everyday outfit for campus.</p></div>
        <div className="grid grid-cols-2 gap-2">
          {OUTFITS.map((outfit) => (
            <button key={outfit.id} type="button" aria-pressed={p.outfit === outfit.id}
              onClick={() => setGame((g) => g.player ? { ...g, player: { ...g.player, outfit: outfit.id } } : g)}
              className={`rounded-xl border p-2 text-left text-xs font-semibold transition hover:border-primary ${p.outfit === outfit.id ? "border-primary bg-card text-primary" : "border-border bg-card/70"}`}>
              <span className="mb-1 block h-4 w-full rounded" style={{ background: `linear-gradient(${outfit.top} 55%, ${outfit.bottom} 55%)` }} />
              {outfit.label}
            </button>
          ))}
        </div>
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

type PhoneApp = PanelId | "whatsapp";
const SOCIAL_APPS = [
  { id: "whatsapp" as const, label: "WhatsApp", color: "bg-[#25d366]" },
];

function SocialAppMark({ id }: { id: (typeof SOCIAL_APPS)[number]["id"] }) {
  return <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8"><path fill="white" d="M16 3.2A12.4 12.4 0 0 0 5.4 22l-1.6 6 6.2-1.6A12.4 12.4 0 1 0 16 3.2Zm0 22.5c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-3.2.8.9-3.1-.3-.5A10 10 0 1 1 16 25.7Zm5.5-7.5c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2c-.2.3-.8 1-1 1.2s-.4.2-.7.1a8.1 8.1 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.8 1.2 3.2 1.4 3.4a13.5 13.5 0 0 0 5.1 4.5c.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5s-.2-.3-.5-.4Z" /></svg>;
}

export function PhoneMenu({ initial, nearby, onClose, onReset, onQuit }: { initial: PanelId | null; nearby: string | null; onClose: () => void; onReset: () => void; onQuit: () => void }) {
  const [panel, setPanel] = useState<PhoneApp | null>(initial);
  const [confirm, setConfirm] = useState(false);
  const cur = MENU.find((m) => m.id === panel);
  const title = (cur?.label === "Inventory" ? "Wallet" : cur?.label) ?? SOCIAL_APPS.find((app) => app.id === panel)?.label ?? "CampusPhone";
  return (
    <div className="fixed inset-0 z-[9500] flex items-center justify-center bg-charcoal/65 p-4 animate-in fade-in" onClick={onClose}>
      <div className="relative flex h-[min(88dvh,820px)] w-[min(88vw,350px)] flex-col pt-12 animate-in slide-in-from-bottom-8" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-label="Phone">
      <Button variant="ghostLight" className="absolute right-0 top-0 z-10 h-9 rounded-full border border-white/30 bg-[#292321] px-3 text-white shadow-lg hover:bg-[#403735]" onClick={onClose} aria-label="Close phone"><X />Close</Button>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2.4rem] border-[7px] border-[#111] bg-card shadow-[0_0_0_2px_#8d7851,0_20px_70px_rgba(0,0,0,.55)] sm:rounded-[2.8rem]" style={!panel ? { backgroundImage: "linear-gradient(180deg, rgba(20,12,20,.3), rgba(20,12,20,.46)), url('/iphone-campus-wallpaper.webp')", backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
        <div className={`relative flex h-11 shrink-0 items-center justify-between px-5 pt-1 text-[10px] font-semibold ${panel ? "bg-[#17120f] text-white" : "bg-transparent text-black"}`}>
          <span>4:26</span><span className="absolute left-1/2 top-1.5 h-5 w-24 -translate-x-1/2 rounded-full bg-black shadow-inner" /><span>SOS&nbsp; ◔ ▰</span>
        </div>
        {panel && <div className="flex items-center gap-2 bg-charcoal px-4 py-2.5 text-cream">
          <Button variant="ghostLight" size="icon" className="h-8 w-8" onClick={() => setPanel(null)} aria-label="Back"><ArrowLeft /></Button>
          <p className="flex-1 text-center font-display font-bold">{title}</p>
          <span className="w-8" />
        </div>}
        <div className={`phone-scrollbar-hidden flex-1 overflow-y-auto ${panel ? "bg-card p-4" : "bg-transparent p-0"}`}>
          {!panel && (
            <div className="relative flex min-h-full flex-col overflow-hidden px-3 pb-3 pt-3 text-white">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
              <div className="relative grid grid-cols-2 gap-2.5">
                <div className="flex h-[98px] flex-col justify-between rounded-[22px] border border-white/35 bg-gradient-to-br from-[#163f75]/85 to-[#161f55]/80 p-3 shadow-lg backdrop-blur-md">
                  <div><p className="text-[10px] font-semibold text-white/80">OOPOLY · CAMPUS</p><p className="text-[27px] font-light leading-tight">28° <span className="text-xl">☀️</span></p></div>
                  <p className="text-[10px] text-white/80">Sunny · A good day for campus</p>
                </div>
                <div className="flex h-[98px] flex-col rounded-[22px] border border-white/40 bg-white/80 p-3 text-[#30252b] shadow-lg backdrop-blur-md">
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wide text-[#a52d44]"><span>Campus planner</span><span>Today</span></div>
                  <p className="mt-1 text-[25px] font-light leading-none">Day 1</p>
                  <p className="mt-auto text-[10px] text-[#5e535b]">Classes, friends & events</p>
                </div>
              </div>
              <div className="relative mt-4 grid grid-cols-4 gap-x-1 gap-y-3">
                {MENU.map(({ id, label, Icon }, index) => (
                  <button key={id} onClick={() => setPanel(id)} className="flex flex-col items-center gap-1 rounded-2xl py-1 text-[9px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.9)] transition hover:bg-white/10 active:scale-95">
                    <span className={`flex h-[46px] w-[46px] items-center justify-center rounded-[14px] border border-white/30 text-white shadow-[0_5px_12px_rgba(10,5,24,.35)] ${["bg-gradient-to-br from-emerald-400 to-emerald-700", "bg-gradient-to-br from-blue-400 to-indigo-700", "bg-gradient-to-br from-amber-300 to-orange-600", "bg-gradient-to-br from-violet-400 to-purple-700", "bg-gradient-to-br from-sky-400 to-blue-700", "bg-gradient-to-br from-rose-400 to-pink-700", "bg-gradient-to-br from-slate-500 to-slate-800"][index]}`}><Icon className="h-5 w-5" /></span>{label === "Inventory" ? "Wallet" : label}
                  </button>
                ))}
                {SOCIAL_APPS.map((app) => (
                  <button key={app.id} onClick={() => setPanel(app.id)} className="flex flex-col items-center gap-1 rounded-2xl py-1 text-[9px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.9)] transition hover:bg-white/10 active:scale-95">
                    <span className={`flex h-[46px] w-[46px] items-center justify-center rounded-[14px] shadow-[0_5px_12px_rgba(10,5,24,.35)] ring-1 ring-white/25 ${app.color}`}><SocialAppMark id={app.id} /></span>{app.label}
                  </button>
                ))}
              </div>
              <div className="relative mt-auto pt-3">
                <div className="mx-auto mb-3 flex h-7 w-28 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-black/25 text-[10px] text-white/80 backdrop-blur-md"><Search size={12} /> Search</div>
                <div className="grid grid-cols-4 gap-2 rounded-[24px] border border-white/30 bg-white/20 px-2 py-2 backdrop-blur-xl">
                  {[
                    { id: "map" as const, label: "Map", Icon: MENU.find((item) => item.id === "map")!.Icon, color: "bg-gradient-to-br from-emerald-400 to-blue-600" },
                    { id: "whatsapp" as const, label: "WhatsApp", Icon: null, color: "bg-[#25d366]" },
                    { id: "social" as const, label: "Social", Icon: MENU.find((item) => item.id === "social")!.Icon, color: "bg-gradient-to-br from-pink-400 to-rose-700" },
                    { id: "inventory" as const, label: "Wallet", Icon: MENU.find((item) => item.id === "inventory")!.Icon, color: "bg-gradient-to-br from-orange-300 to-amber-600" },
                  ].map((app) => <button key={app.id} aria-label={app.label} onClick={() => setPanel(app.id)} className={`flex h-[46px] items-center justify-center rounded-[14px] shadow-md ${app.color}`}>{app.id === "whatsapp" ? <SocialAppMark id="whatsapp" /> : app.Icon && <app.Icon className="h-5 w-5 text-white" />}</button>)}
                </div>
              </div>
            </div>
          )}
          {panel === "map" && <MapPanel nearby={nearby} />}
          {panel === "academics" && <AcademicsPanel />}
          {panel === "hustles" && <HustlesPanel nearby={nearby} />}
          {panel === "social" && <SocialPanel />}
          {panel === "whatsapp" && <WhatsAppPanel />}
          {panel === "inventory" && <InventoryPanel />}
          {panel === "admissions" && <AdmissionsPanel />}
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
        <div className={`flex h-5 shrink-0 items-center justify-center ${panel ? "bg-[#111]" : "bg-transparent"}`} onClick={onClose}><div className={`h-1 w-24 rounded-full ${panel ? "bg-white/90" : "bg-black/90"}`} /></div>
      </div>
      </div>
    </div>
  );
}
