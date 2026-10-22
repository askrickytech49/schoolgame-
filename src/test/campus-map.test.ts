import { describe, expect, it } from "vitest";
import { BUILDINGS, FILLED_AREA, LOVE_GARDENS, MAP_LAYOUT, WORLD } from "@/game/data";

const place = (id: string) => {
  const result = BUILDINGS.find((building) => building.id === id);
  if (!result) throw new Error(`Missing campus location: ${id}`);
  return result;
};

describe("OOPOLY campus map data", () => {
  it("keeps the named landmarks in the relative positions in the hand-drawn map", () => {
    const library = place("library");
    const gh = place("student");
    const wildering = place("wildering");
    const smallGate = place("small-gate");
    const bigGate = place("gate");
    const stats = place("statistics");
    const abc = place("abc");
    const bank = place("provious-bank");
    const sug = place("sug");
    const rector = place("rector-office");
    const auditorium = place("auditorium");
    const atm = place("atm");

    expect(gh.x).toBeGreaterThan(library.x);
    expect(wildering.y).toBeGreaterThan(gh.y);
    expect(smallGate.x).toBeLessThan(bigGate.x);
    expect(smallGate.y).toBeGreaterThan(atm.y);
    expect(stats.x).toBeLessThan(abc.x + abc.w);
    expect(bank.y).toBeLessThan(sug.y);
    expect(sug.y).toBeLessThan(rector.y);
    expect(rector.y).toBeLessThan(auditorium.y);
    expect(auditorium.y).toBeLessThan(atm.y);
    expect(FILLED_AREA.label).toBe("OOPOLY SPORTS GROUNDS");
  });

  it("represents the three marked gardens and shares world features with the minimap", () => {
    expect(LOVE_GARDENS).toHaveLength(3);
    expect(MAP_LAYOUT.buildings).toBe(BUILDINGS);
    expect(MAP_LAYOUT.gardens).toBe(LOVE_GARDENS);
    expect(MAP_LAYOUT.gates.map((gate) => gate.id).sort()).toEqual(["gate", "small-gate"]);
  });

  it("has cross-campus road corridors and keeps every route inside the playable world", () => {
    expect(MAP_LAYOUT.roads.some((route) => route[0].y === 1035 && route.at(-1)?.y === 1035)).toBe(true);
    expect(MAP_LAYOUT.roads.some((route) => route[0].y === 1485 && route.at(-1)?.y === 1485)).toBe(true);
    expect(MAP_LAYOUT.roads.some((route) => route[0].y === 2100 && route.at(-1)?.y === 2100)).toBe(true);
    for (const route of MAP_LAYOUT.roads) {
      expect(route.length).toBeGreaterThanOrEqual(2);
      for (const point of route) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(WORLD.w);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(WORLD.h);
      }
    }
  });
});
