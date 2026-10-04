import { describe, expect, it } from "vitest";
import { matchCatalog, scoreProduct, passesHardFilters, relevantAuthorization } from "../matching";
import { allProfiles, COMMERCIAL_WEIGHT, FACTORS } from "../ranking-config";
import type { QuizAnswers } from "../quiz";
import type { Catalog, Offer } from "../types";
import { loadSeedCatalog, withProduct } from "./fixtures";

const TODAY = "2026-10-01";
const catalog = loadSeedCatalog();

const answers = (over: Partial<QuizAnswers> = {}): QuizAnswers => ({
  goal: "card",
  country: "DE",
  holding: "exchange",
  spendAsset: "euro_balance",
  priority: "low_fees",
  ...over,
});

const offer = (productSlug: string, over: Partial<Offer> = {}): Offer => ({
  slug: productSlug,
  productId: `prod:${productSlug}`,
  affiliateModel: "cpa",
  trackingType: "network",
  bonusText: null,
  bonusConditions: null,
  bonusVerifiedAt: null,
  userBonusValueEur: null,
  excludedCountries: [],
  ctaText: null,
  promoCode: null,
  badge: null,
  ...over,
});

describe("Gewichtung", () => {
  it("jedes Profil summiert auf 1 und hat den offengelegten Provisionsanteil", () => {
    for (const p of allProfiles()) {
      const sum = FACTORS.reduce((s, f) => s + p.weights[f], 0);
      expect(sum).toBeCloseTo(1, 10);
      expect(p.weights.commercial).toBe(COMMERCIAL_WEIGHT);
    }
  });
});

describe("Harte Filter", () => {
  it("schließt Bybit EU in Malta aus, nicht in Deutschland", () => {
    const bybit = catalog.products.find((p) => p.slug === "bybit-eu-card")!;
    expect(passesHardFilters(bybit, "card", "MT", TODAY)).toBe(false);
    expect(passesHardFilters(bybit, "card", "DE", TODAY)).toBe(true);
  });

  it("schließt Trade Republic in Zypern aus", () => {
    const out = matchCatalog(catalog, answers({ country: "CY" }), { today: TODAY, maxCards: 50 });
    expect(out.cards.map((c) => c.product.slug)).not.toContain("trade-republic-card");
  });

  it("zeigt Gnosis Pay vor dem Einstellungsdatum mit Warnung, danach nicht mehr", () => {
    const before = matchCatalog(catalog, answers({ holding: "own_wallet", spendAsset: "stablecoins" }), { today: TODAY, maxCards: 50 });
    const gp = before.cards.find((c) => c.product.slug === "gnosis-pay-card");
    expect(gp?.warnings).toContain("wind_down");
    const after = matchCatalog(catalog, answers({ holding: "own_wallet", spendAsset: "stablecoins" }), { today: "2026-12-20", maxCards: 50 });
    expect(after.cards.map((c) => c.product.slug)).not.toContain("gnosis-pay-card");
  });

  it("filtert eingestellte Produkte", () => {
    const c = withProduct(catalog, "revolut-card", (p) => ({ ...p, status: "discontinued" }));
    const out = matchCatalog(c, answers(), { today: TODAY, maxCards: 50 });
    expect(out.cards.map((r) => r.product.slug)).not.toContain("revolut-card");
  });
});

describe("Scoring", () => {
  it("eigene Wallet + Stablecoins bringt eine Self-Custody-Karte nach oben", () => {
    const out = matchCatalog(catalog, answers({ holding: "own_wallet", spendAsset: "stablecoins", priority: "no_lockup" }), { today: TODAY });
    expect(out.cards[0]!.product.custody).toBe("self_custody");
  });

  it("Börse + Euro-Guthaben + Regulierung bevorzugt EU-zugelassene, vorgeladene Fiat-Karten", () => {
    const out = matchCatalog(catalog, answers({ priority: "regulation_privacy" }), { today: TODAY });
    const top = out.cards[0]!;
    expect(top.product.fundingFlow).toBe("prefunded_fiat");
    expect(["casp_art63", "art60_notified", "bank"]).toContain(relevantAuthorization(top.provider, top.product));
  });

  it("Anbieter ohne EU-Zulassung bekommen Regulierungsnote 0 bei Datenverantwortlichem außerhalb des EWR", () => {
    const redot = catalog.products.find((p) => p.slug === "redotpay-card")!;
    const prov = catalog.providers.find((p) => p.id === redot.providerId)!;
    const r = scoreProduct(redot, prov, null, answers(), TODAY);
    expect(r.factors.regulation.value).toBe(0);
    expect(r.warnings).toContain("no_eu_authorisation_found");
  });

  it("Summe der Beiträge entspricht dem Score", () => {
    const out = matchCatalog(catalog, answers(), { today: TODAY });
    for (const r of out.cards) {
      const sum = FACTORS.reduce((s, f) => s + r.contributions[f], 0);
      expect(Math.abs(sum - r.score)).toBeLessThan(0.5);
    }
  });

  it("Partnerlink verschiebt den Score um höchstens COMMERCIAL_WEIGHT × 100 Punkte", () => {
    const product = catalog.products.find((p) => p.slug === "kraken-card")!;
    const provider = catalog.providers.find((p) => p.id === product.providerId)!;
    const without = scoreProduct(product, provider, null, answers(), TODAY);
    const withOffer = scoreProduct(product, provider, offer("kraken-card"), answers(), TODAY);
    expect(withOffer.score - without.score).toBeCloseTo(COMMERCIAL_WEIGHT * 100, 1);
  });

  it("Partnerlink entfällt für ausgeschlossene Länder", () => {
    const c: Catalog = { ...catalog, offers: [offer("kraken-card", { excludedCountries: ["DE"] })] };
    const out = matchCatalog(c, answers(), { today: TODAY, maxCards: 50 });
    const kraken = out.cards.find((r) => r.product.slug === "kraken-card")!;
    expect(kraken.offer).toBeNull();
    expect(kraken.warnings).toContain("link_unavailable_in_country");
  });

  it("unbekannte Gebühren zählen neutral und werden markiert", () => {
    const out = matchCatalog(catalog, answers(), { today: TODAY });
    for (const r of out.cards) {
      expect(r.factors.cost.unknown).toBe(true);
      expect(r.factors.cost.value).toBe(0.5);
      expect(r.warnings).toContain("fees_unknown");
    }
  });

  it("bekannte niedrige Gebühren schlagen unbekannte", () => {
    const c = withProduct(catalog, "kraken-card", (p) => ({
      ...p,
      fees: { ...p.fees, fxMarkupPct: 0, monthlyEur: 0, issuancePhysicalEur: 0 },
    }));
    const product = c.products.find((p) => p.slug === "kraken-card")!;
    const provider = c.providers.find((p) => p.id === product.providerId)!;
    const r = scoreProduct(product, provider, null, answers(), TODAY);
    expect(r.factors.cost.value).toBe(1);
    expect(r.reasons).toEqual(expect.arrayContaining(["no_monthly_fee", "low_fx_markup"]));
  });

  it("Self-Custody-Karte: Kartenherausgeber zählt, nicht die fehlende Krypto-Lizenz des Wallet-Anbieters", () => {
    const mm = catalog.products.find((p) => p.slug === "metamask-card")!;
    const prov = catalog.providers.find((p) => p.id === mm.providerId)!;
    expect(relevantAuthorization(prov, mm)).toBe("emi");
    const r = scoreProduct(mm, prov, null, answers({ holding: "own_wallet", spendAsset: "stablecoins" }), TODAY);
    expect(r.reasons).toContain("eu_card_issuer");
    expect(r.warnings).not.toContain("no_eu_authorisation_found");
  });

  it("verwahrte Karte: E-Geld-Kartenherausgeber hebt fehlende Krypto-Zulassung nicht auf", () => {
    const kast = catalog.products.find((p) => p.slug === "kast-card")!;
    const prov = catalog.providers.find((p) => p.id === kast.providerId)!;
    expect(relevantAuthorization(prov, kast)).toBe("none_found");
  });

  it("Lock-up-Ausschluss bestraft Staking-Pflicht", () => {
    const product = catalog.products.find((p) => p.slug === "crypto-com-card")!;
    const provider = catalog.providers.find((p) => p.id === product.providerId)!;
    const neutral = scoreProduct(product, provider, null, answers({ priority: "cashback" }), TODAY);
    const noLock = scoreProduct(product, provider, null, answers({ priority: "no_lockup" }), TODAY);
    expect(noLock.factors.fit.value).toBeLessThan(neutral.factors.fit.value);
    expect(noLock.warnings).toContain("staking_required");
  });

  it("Ergebnis ist deterministisch", () => {
    const a = matchCatalog(catalog, answers(), { today: TODAY });
    const b = matchCatalog(catalog, answers(), { today: TODAY });
    expect(a.cards.map((r) => r.product.slug)).toEqual(b.cards.map((r) => r.product.slug));
  });

  it("USDT-Hinweis bei Stablecoin-Wunsch", () => {
    const out = matchCatalog(catalog, answers({ holding: "own_wallet", spendAsset: "stablecoins" }), { today: TODAY, maxCards: 50 });
    const mm = out.cards.find((r) => r.product.slug === "metamask-card")!;
    expect(mm.warnings).toContain("usdt_not_mica_compliant");
  });

  it("Auto-Verkauf pro Zahlung erzeugt Steuerhinweis", () => {
    const out = matchCatalog(catalog, answers({ holding: "own_wallet", spendAsset: "stablecoins" }), { today: TODAY, maxCards: 50 });
    const mm = out.cards.find((r) => r.product.slug === "metamask-card")!;
    expect(mm.warnings).toContain("auto_sell_tax_event");
  });
});

describe("Ergebnis-Struktur", () => {
  it("goal=card liefert keine Börsenliste, aber Pairings", () => {
    const out = matchCatalog(catalog, answers(), { today: TODAY });
    expect(out.exchanges).toHaveLength(0);
    expect(out.cards.length).toBeGreaterThan(0);
    expect(out.cards[0]!.badges).toContain("best_match");
  });

  it("verwahrte Karte wird mit der Börse desselben Anbieters gepaart", () => {
    const out = matchCatalog(catalog, answers(), { today: TODAY, maxCards: 50 });
    const pair = out.pairs.find((p) => p.cardSlug === "bitpanda-card");
    expect(pair?.relation).toBe("same_provider");
    expect(pair?.exchange.product.slug).toBe("bitpanda-exchange");
  });

  it("Self-Custody-Karte mit USDC erhält eine On-Ramp-Börse mit USDC", () => {
    const out = matchCatalog(catalog, answers({ holding: "own_wallet", spendAsset: "stablecoins" }), { today: TODAY, maxCards: 50 });
    const pair = out.pairs.find((p) => p.cardSlug === "metamask-card");
    expect(pair?.relation).toBe("on_ramp");
    expect(pair?.exchange.product.stablecoins).toContain("USDC");
  });

  it("goal=exchange liefert nur Börsen", () => {
    const out = matchCatalog(catalog, { goal: "exchange", country: "DE", holding: null, spendAsset: null, priority: "regulation_privacy" }, { today: TODAY });
    expect(out.cards).toHaveLength(0);
    expect(out.exchanges.length).toBeGreaterThan(0);
    expect(out.exchanges.every((r) => r.product.type === "exchange")).toBe(true);
  });

  it("goal=both liefert beides", () => {
    const out = matchCatalog(catalog, answers({ goal: "both" }), { today: TODAY });
    expect(out.cards.length).toBeGreaterThan(0);
    expect(out.exchanges.length).toBeGreaterThan(0);
  });

  it("Widerspruch eigene Wallet + Euro-Guthaben erzeugt Hinweis", () => {
    const out = matchCatalog(catalog, answers({ holding: "own_wallet", spendAsset: "euro_balance" }), { today: TODAY });
    expect(out.notes).toContain("contradiction_wallet_euro");
  });

  it("kein Produkt → no_results", () => {
    const empty: Catalog = { ...catalog, products: [] };
    const out = matchCatalog(empty, answers(), { today: TODAY });
    expect(out.notes).toContain("no_results");
  });

  it("nur ein Produkt → single_result", () => {
    const one: Catalog = { ...catalog, products: catalog.products.filter((p) => p.slug === "revolut-card") };
    const out = matchCatalog(one, answers(), { today: TODAY });
    expect(out.notes).toContain("single_result");
  });
});
