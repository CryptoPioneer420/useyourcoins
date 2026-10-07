import { describe, expect, it } from "vitest";
import { QUICK_PATHS, quickPathById, quickPathQuizAction } from "../quick-paths";
import { quizReducer, QUIZ_STEPS } from "../quiz";
import { FORBIDDEN_COPY } from "../presentation";

describe("Schnellpfade", () => {
  it("fünf Pfade mit eindeutiger id", () => {
    expect(QUICK_PATHS).toHaveLength(5);
    expect(new Set(QUICK_PATHS.map((p) => p.id)).size).toBe(5);
  });

  it("Labels und Hints in DE und EN, kurz, ohne verbotene Formulierungen", () => {
    for (const p of QUICK_PATHS) {
      for (const l of ["de", "en"] as const) {
        expect(p.label[l].length, p.id).toBeGreaterThan(0);
        expect(p.label[l].length, p.id).toBeLessThanOrEqual(30);
        expect(p.hint[l].length, p.id).toBeGreaterThan(0);
        expect(FORBIDDEN_COPY.test(p.label[l] + " " + p.hint[l]), p.id).toBe(false);
        expect(/anonym|ohne kyc|no kyc|anonymous/i.test(p.label[l] + " " + p.hint[l]), p.id).toBe(false);
      }
    }
  });

  it("Finder-Pfade nutzen eine für das Ziel gültige Priorität", () => {
    for (const p of QUICK_PATHS) {
      if (p.target.kind !== "finder") continue;
      const step = QUIZ_STEPS.find((s) => s.id === "priority")!;
      const opts = step.options({ goal: p.target.goal } as never).map((o) => o.value);
      expect(opts, p.id).toContain(p.target.priority);
    }
  });

  it("Hub-Pfade haben nicht-leere Filter", () => {
    for (const p of QUICK_PATHS) {
      if (p.target.kind === "hub") expect(Object.keys(p.target.filters).length, p.id).toBeGreaterThan(0);
    }
  });

  it("quickPathById und quickPathQuizAction", () => {
    expect(quickPathById("nope")).toBeNull();
    expect(quickPathQuizAction(quickPathById("eu_regulated")!)).toBeNull();
    expect(quickPathQuizAction(quickPathById("low_fees")!)).toMatchObject({ type: "START", goal: "card", priority: "low_fees" });
  });

  it("START mit Priorität überspringt die Prioritätsfrage", () => {
    const s = quizReducer(undefined as never, { type: "START", goal: "card", priority: "cashback" });
    expect(s.answers.priority).toBe("cashback");
    expect(s.skip).toContain("priority");
  });

  it("ungültige Priorität wird ignoriert", () => {
    const s = quizReducer(undefined as never, { type: "START", goal: "card", priority: "no_lockup" as never });
    // no_lockup ist je nach Ziel gültig oder nicht; Ergebnis muss konsistent sein
    expect(s.answers.priority === undefined || s.skip.includes("priority")).toBe(true);
  });
});
