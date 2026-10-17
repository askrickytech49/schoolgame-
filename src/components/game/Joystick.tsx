import { useRef, useState } from "react";
import type { InputState } from "./CampusScene";

const R = 50;

export function Joystick({ input }: { input: React.RefObject<InputState> }) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef<number | null>(null);

  const update = (e: React.PointerEvent) => {
    const r = base.current!.getBoundingClientRect();
    let x = e.clientX - (r.left + r.width / 2);
    let y = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(x, y);
    if (d > R) { x = (x / d) * R; y = (y / d) * R; }
    setKnob({ x, y });
    if (input.current) input.current.joy = { x: x / R, y: y / R };
  };
  const end = () => {
    active.current = null;
    setKnob({ x: 0, y: 0 });
    if (input.current) input.current.joy = { x: 0, y: 0 };
  };

  return (
    <div
      ref={base}
      className="no-select relative h-32 w-32 rounded-full border-4 border-cream/60 bg-charcoal/40 backdrop-blur"
      role="application"
      aria-label="Movement joystick"
      onPointerDown={(e) => { active.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); update(e); }}
      onPointerMove={(e) => active.current === e.pointerId && update(e)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full bg-gold-gradient shadow-hud" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
    </div>
  );
}
