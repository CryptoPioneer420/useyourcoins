import { describe, expect, it } from "vitest";
import {
  TAX_BOX_TEXT,
  TAX_TOOLS,
  TAX_TOOL_CRITERIA,
  shouldShowTaxToolBox,
  sortedTaxTools,
  type TaxTool,
} from "../../content/tax-tools";
import { FORBIDDEN_COPY } from "../presentation";

const BANNED = /sicher|garantiert|steuerfrei|steuerneutral|mica-konform|testsieger|testbericht|rendite|best tool|testsieger/i;

function tool(name: string, verifiedAt: string): TaxTool {
  return {
    id: name.toLowerCase(),
    name,
    url: "https://example.com",
    verifiedAt,
    criteria: {
      import_sources: null,
      transfer_matching: null,
      country_coverage: null,
      export_and_method: null,
      data_handling_pricing: null,
    },
    affiliateUrl: null,
  };
}

describe("Steuer-Tool-Box", () => {
  it("fünf Kriterien mit eindeutiger id und DE/EN", () => {
    expect(TAX_TOOL_CRITERIA).toHaveLength(5);
    expect(new Set(TAX_TOOL_CRITERIA.map((c) => c.id)).size).toBe(5);
    for (const c of TAX_TOOL_CRITERIA) {
      for (const l of ["de", "en"] as const) {
        expect(c.label[l].length).toBeGreaterThan(0);
        expect(c.question[l].length).toBeGreaterThan(0);
      }
    }
  });

  it("Texte ohne verbotene Formulierungen und ohne Steueraussage", () => {
    const all = [
      ...TAX_TOOL_CRITERIA.flatMap((c) => [c.label.de, c.label.en, c.question.de, c.question.en]),
      ...Object.values(TAX_BOX_TEXT).flatMap((t) => [t.de, t.en]),
    ];
    for (const t of all) {
      expect(FORBIDDEN_COPY.test(t), t).toBe(false);
      expect(BANNED.test(t), t).toBe(false);
    }
  });

  it("Box bleibt versteckt ohne Tools und mit weniger als drei aktuellen Tools", () => {
    expect(shouldShowTaxToolBox(TAX_TOOLS, "2026-10-08")).toBe(false);
    expect(shouldShowTaxToolBox([tool("A", "2026-10-01"), tool("B", "2026-10-01")], "2026-10-08")).toBe(false);
    expect(shouldShowTaxToolBox([tool("A", "2026-10-01"), tool("B", "2026-10-01"), tool("C", "2025-01-01")], "2026-10-08")).toBe(false);
  });

  it("Box erscheint ab drei aktuell geprüften Tools", () => {
    expect(shouldShowTaxToolBox([tool("A", "2026-10-01"), tool("B", "2026-09-01"), tool("C", "2026-08-01")], "2026-10-08")).toBe(true);
  });

  it("Sortierung alphabetisch, Eingabe bleibt unverändert", () => {
    const input = [tool("Zeta", "2026-10-01"), tool("alpha", "2026-10-01"), tool("Mid", "2026-10-01")];
    expect(sortedTaxTools(input).map((t) => t.name)).toEqual(["alpha", "Mid", "Zeta"]);
    expect(input[0]?.name).toBe("Zeta");
  });
});
