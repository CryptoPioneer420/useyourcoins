import { describe, expect, it } from "vitest";
import { calculateCost, DEFAULT_SCENARIO } from "../calculator";
import { buildComparison } from "../compare";
import { CATEGORIES, categoryBySlug } from "../categories";
import { applyFilters } from "../filters";
import { catalogSourceFromEnv, loadCatalog } from "../catalog-source";
import { exchangeCells } from "../presentation";
import type { Catalog, Product, Provider } from "../types";
import { loadSeedCatalog, withProduct } from "./fixtures";

const catalog = loadSeedCatalog();
const prod = (c: Catalog, slug: string): Product => c.products.find((p) => p.slug === slug)!;
const prov = (c: Catalog, p: Product): Provider => c.providers.find((x) => x.id === p.providerId)!;
const DE = catalog.countries.find((c) => c.code === "DE")!;

describe("Datenquelle", () => {
  it("Default ist Seed, 'supabase' nur explizit", () => {
    expect(catalogSourceFromEnv(undefined)).toBe("seed");
    expect(catalogSourceFromEnv("SUPABASE")).toBe("seed");
    expect(catalogSourceFromEnv("supabase")).toBe("supabase");
  });

  it("Seed-Katalog: 8 Länder mit Werbelabel, 23 Produkte, keine Partnerlinks", async () => {
    const c = await loadCatalog("seed");
    expect(c.countries.map((x) => x.code)).toEqual(["DE", "AT", "FR", "ES", "IT", "NL", "MT", "CY"]);
    expect(c.countries.find((x) => x.code === "FR")!.adLabel).toBe("Publicité");
    expect(c.products).toHaveLength(23);
    expect(c.offers).toHaveLength(0);
  });

  it("Supabase ohne Client wirft", async () => {
    await expect(loadCatalog("supabase")).rejects.toThrow("Supabase-Client fehlt");
  });
});

describe("Kostenrechner", () => {
  const full = withProduct(catalog, "kraken-card", (p) => ({
    ...p,
    fees: { ...p.fees, issuancePhysicalEur: 10, issuanceVirtualEur: 0, monthlyEur: 1, fxMarkupPct: 2, atmFreeLimitEurPerMonth: 200, atmFeePctOverLimit: 2 },
    rewards: { ...p.rewards, baseCashbackPct: 1, maxCashbackPct: 1, staking: { required: false, token: null, minEur: null, lockupDays: null } },
  }));

  it("rechnet nachvollziehbar: Cashback minus Gebühren", () => {
    const r = calculateCost(prod(full, "kraken-card"), { ...DEFAULT_SCENARIO, atmWithdrawalEurPerMonth: 300 });
    const by = Object.fromEntries(r.lines.map((l) => [l.key, l.amountEur]));
    expect(by.cashback).toBe(60); // 500 × 12 × 1 %
    expect(by.issuance).toBe(-10);
    expect(by.monthly).toBe(-12);
    expect(by.fx).toBe(-12); // 50 × 2 % × 12
    expect(by.atm).toBe(-24); // 100 über Freigrenze × 2 % × 12
    expect(r.netEur).toBe(2);
    expect(r.missing).toEqual([]);
    expect(r.notes).toContain("example_only");
  });

  it("fehlende Konditionen: kein Nettowert, fehlende Zeilen benannt", () => {
    const r = calculateCost(prod(catalog, "bitpanda-card"), DEFAULT_SCENARIO);
    expect(r.netEur).toBeNull();
    expect(r.missing).toEqual(expect.arrayContaining(["cashback", "issuance", "monthly", "fx", "atm"]));
  });

  it("nicht genutzte Posten zählen 0 statt 'fehlt'", () => {
    const r = calculateCost(prod(catalog, "bitpanda-card"), { ...DEFAULT_SCENARIO, foreignSharePct: 0, atmWithdrawalEurPerMonth: 0 });
    expect(r.missing).not.toContain("fx");
    expect(r.missing).not.toContain("atm");
  });

  it("Staking-Stufe nur auf Wunsch, mit Hinweis zu gesperrtem Kapital und Token", () => {
    const c = withProduct(catalog, "crypto-com-card", (p) => ({ ...p, rewards: { ...p.rewards, baseCashbackPct: 0, maxCashbackPct: 5 } }));
    const p = prod(c, "crypto-com-card");
    const without = calculateCost(p, { ...DEFAULT_SCENARIO, foreignSharePct: 0, atmWithdrawalEurPerMonth: 0 });
    const withTier = calculateCost(p, { ...DEFAULT_SCENARIO, foreignSharePct: 0, atmWithdrawalEurPerMonth: 0, useStakingTier: true });
    expect(without.lines.find((l) => l.key === "cashback")!.amountEur).toBe(0);
    expect(withTier.lines.find((l) => l.key === "cashback")!.amountEur).toBe(300);
    expect(withTier.notes).toEqual(expect.arrayContaining(["staking_capital_locked", "cashback_in_token"]));
  });

  it("ungültige Eingaben werden abgelehnt", () => {
    expect(() => calculateCost(prod(catalog, "kraken-card"), { ...DEFAULT_SCENARIO, foreignSharePct: 120 })).toThrow(RangeError);
    expect(() => calculateCost(prod(catalog, "kraken-card"), { ...DEFAULT_SCENARIO, monthlySpendEur: Number.NaN })).toThrow(RangeError);
    expect(() => calculateCost(prod(catalog, "kraken-exchange"), DEFAULT_SCENARIO)).toThrow();
  });
});

describe("Direktvergleich", () => {
  it("Karten: Zeilen vollständig, bester Wert nur bei ≥ 2 geprüften Werten", () => {
    const c = withProduct(
      withProduct(catalog, "kraken-card", (p) => ({ ...p, fees: { ...p.fees, fxMarkupPct: 1 } })),
      "okx-card",
      (p) => ({ ...p, fees: { ...p.fees, fxMarkupPct: 0.5 } }),
    );
    const items = ["kraken-card", "okx-card", "bitpanda-card"].map((s) => ({ product: prod(c, s), provider: prov(c, prod(c, s)) }));
    const cmp = buildComparison(items, DE, "de");
    expect(cmp.headers).toEqual(["Kraken Card", "OKX Card", "Bitpanda Card"]);
    const fx = cmp.rows.find((r) => r.key === "fx")!;
    expect(fx.values).toEqual(["1 %", "0,5 %", "–"]);
    expect(fx.best).toEqual([1]);
    expect(cmp.rows.find((r) => r.key === "monthly")!.best).toEqual([]);
    expect(cmp.rows.find((r) => r.key === "authorisation")!.best).toEqual([]);
  });

  it("Börsen haben eigene Zeilen; gemischte Typen und falsche Anzahl werden abgelehnt", () => {
    const ex = ["kraken-exchange", "revolut-crypto"].map((s) => ({ product: prod(catalog, s), provider: prov(catalog, prod(catalog, s)) }));
    const cmp = buildComparison(ex, DE, "en");
    expect(cmp.rows.map((r) => r.key)).toEqual(expect.arrayContaining(["spot_maker", "spot_taker", "deposit", "assets"]));
    expect(cmp.rows.find((r) => r.key === "deposit")!.values).toEqual(["–", "SEPA"]);
    const mixed = [ex[0]!, { product: prod(catalog, "kraken-card"), provider: prov(catalog, prod(catalog, "kraken-card")) }];
    expect(() => buildComparison(mixed, DE, "de")).toThrow();
    expect(() => buildComparison([ex[0]!], DE, "de")).toThrow(RangeError);
  });
});

describe("Kategorien", () => {
  it("eindeutige Slugs je Sprache und auffindbar", () => {
    for (const lang of ["de", "en"] as const) {
      const slugs = CATEGORIES.map((c) => c.slug[lang]);
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const c of CATEGORIES) expect(categoryBySlug(lang, c.slug[lang])?.id).toBe(c.id);
    }
  });

  it("keine Test-/Testsieger-Begriffe", () => {
    expect(JSON.stringify(CATEGORIES)).not.toMatch(/testsieger|testbericht|im test|tested|test winner/i);
  });

  it("jede Kategorie liefert mit dem Seed mindestens ein Produkt des richtigen Typs", () => {
    for (const c of CATEGORIES) {
      const res = applyFilters(catalog, c.filters);
      expect(res.length, c.id).toBeGreaterThan(0);
      expect(res.every((r) => r.product.type === c.type), c.id).toBe(true);
    }
  });

  it("Self-Custody-Kategorie enthält genau die Self-Custody-Karten", () => {
    const slugs = applyFilters(catalog, CATEGORIES.find((c) => c.id === "self-custody-cards")!.filters).map((r) => r.product.slug).sort();
    expect(slugs).toEqual(["ether-fi-cash-card", "gnosis-pay-card", "metamask-card"]);
  });
});

describe("Börsen-Raster", () => {
  it("vier Zellen, unbekannt markiert, SEPA aus Einzahlungswegen", () => {
    const cells = exchangeCells(prod(catalog, "revolut-crypto"), "de");
    expect(cells.map((c) => c.key)).toEqual(["maker", "taker", "deposit", "assets"]);
    expect(cells.find((c) => c.key === "deposit")!.value).toBe("SEPA");
    expect(cells.find((c) => c.key === "maker")!.unknown).toBe(true);
  });
});

describe("Trust-Layer auf Produktseite", () => {
  it("rendert mit einem einzelnen Produkt ohne MatchResult", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { createElement } = await import("react");
    const { CountryRegulationAccordion } = await import("../../components/results");
    const p = prod(catalog, "trade-republic-card");
    const html = renderToStaticMarkup(createElement(CountryRegulationAccordion, { results: [{ product: p, provider: prov(catalog, p) }], country: DE, lang: "de", defaultOpen: true }));
    expect(html).toContain("Trade Republic Bank GmbH");
    expect(html).toContain("in Deutschland selbst");
  });
});
