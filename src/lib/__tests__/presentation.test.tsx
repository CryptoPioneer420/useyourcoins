import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { matchCatalog, type MatchResult } from "../matching";
import {
  cashbackSummary,
  feeCells,
  productPills,
  regulationFacts,
  resolveCta,
  FORBIDDEN_COPY,
} from "../presentation";
import type { Catalog, Country, Offer, Product, Provider, RewardStructure } from "../types";
import type { QuizAnswers } from "../quiz";
import { PAYMENT_TAX, FUNDING_FLOW_TAX_NOTE } from "../../content/payment-tax";
import { CardRecommendationCard, ResultsTrustLayer } from "../../components/results";
import { loadSeedCatalog, withProduct } from "./fixtures";

const TODAY = "2026-10-01";
const catalog = loadSeedCatalog();
const prod = (c: Catalog, slug: string): Product => c.products.find((p) => p.slug === slug)!;
const prov = (c: Catalog, p: Product): Provider => c.providers.find((x) => x.id === p.providerId)!;
const country = (code: Country["code"], adLabel = "Werbung"): Country => ({ ...catalog.countries.find((c) => c.code === code)!, adLabel });

const offer = (slug: string, over: Partial<Offer> = {}): Offer => ({
  slug,
  productId: `prod:${slug}`,
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

const answers: QuizAnswers = { goal: "card", country: "DE", holding: "exchange", spendAsset: "stablecoins", priority: "low_fees" };

describe("Pills", () => {
  it("Bybit EU: MiCA-Zulassung als Fakt, nie 'MiCA Ready'", () => {
    const p = prod(catalog, "bybit-eu-card");
    const pills = productPills(p, prov(catalog, p), "de");
    expect(pills.map((x) => x.code)).toContain("mica_casp");
    expect(pills.map((x) => x.label).join(" ")).not.toMatch(/ready|konform/i);
  });

  it("RedotPay: Warn-Pill zuerst", () => {
    const p = prod(catalog, "redotpay-card");
    const pills = productPills(p, prov(catalog, p), "de");
    expect(pills[0]).toMatchObject({ code: "no_eu_authorisation", tone: "warning" });
  });

  it("MetaMask: EU-E-Geld-Herausgeber und Self-Custody", () => {
    const p = prod(catalog, "metamask-card");
    const codes = productPills(p, prov(catalog, p), "en").map((x) => x.code);
    expect(codes).toEqual(expect.arrayContaining(["eu_emi_issuer", "self_custody"]));
  });

  it("0 % FX, Wallets und virtuelle Karte nur bei geprüften Werten", () => {
    const p0 = prod(catalog, "kraken-card");
    expect(productPills(p0, prov(catalog, p0), "de").map((x) => x.code)).not.toContain("zero_fx");
    const c = withProduct(catalog, "kraken-card", (p) => ({
      ...p,
      fees: { ...p.fees, fxMarkupPct: 0 },
      card: { ...p.card!, forms: ["virtual", "physical"], mobileWallets: ["apple_pay"] },
    }));
    const p1 = prod(c, "kraken-card");
    expect(productPills(p1, prov(c, p1), "de", 10).map((x) => x.code)).toEqual(
      expect.arrayContaining(["zero_fx", "virtual_card", "apple_pay"]),
    );
    expect(productPills(p1, prov(c, p1), "de", 10).map((x) => x.code)).not.toContain("google_pay");
  });
});

describe("Gebührenraster", () => {
  it("unbekannte Werte: Strich + 'nicht geprüft', nie 0", () => {
    const cells = feeCells(prod(catalog, "bitpanda-card").fees, "de");
    expect(cells).toHaveLength(4);
    for (const c of cells) {
      expect(c.unknown).toBe(true);
      expect(c.value).toBe("–");
      expect(c.detail).toBe("nicht geprüft");
    }
  });

  it("formatiert virtuell/physisch, FX und ATM-Freigrenze", () => {
    const cells = feeCells(
      { issuanceVirtualEur: 0, issuancePhysicalEur: 10, monthlyEur: 0, fxMarkupPct: 1.5, atmFreeLimitEurPerMonth: 0, atmFeePctOverLimit: null, inactivityEur: null, spotMakerPct: null, spotTakerPct: null, atmNote: null, note: null },
      "de",
    );
    const byKey = Object.fromEntries(cells.map((c) => [c.key, c]));
    expect(byKey.issuance!.value).toMatch(/0\s€ \/ 10\s€/);
    expect(byKey.fx!.value).toBe("1,5 %");
    expect(byKey.atm!.value).toBe("keine");
    const en = feeCells({ issuanceVirtualEur: null, issuancePhysicalEur: null, monthlyEur: 2.5, fxMarkupPct: 0, atmFreeLimitEurPerMonth: 200, atmFeePctOverLimit: null, inactivityEur: null, spotMakerPct: null, spotTakerPct: null, atmNote: null, note: null }, "en");
    const enKey = Object.fromEntries(en.map((c) => [c.key, c]));
    expect(enKey.monthly!.value).toBe("€2.50");
    expect(enKey.atm!.detail).toBe("per month");
  });
});

describe("Cashback-Zeile", () => {
  const base: RewardStructure = { baseCashbackPct: null, maxCashbackPct: null, rewardToken: null, staking: { required: null, minEur: null, token: null, lockupDays: null }, note: null };

  it("unbekannt", () => {
    expect(cashbackSummary(base, "de")).toMatchObject({ known: false, text: "Cashback: noch nicht geprüft" });
  });

  it("Staking-Pflicht trennt ohne/mit Staking", () => {
    const s = cashbackSummary({ ...base, baseCashbackPct: 2, maxCashbackPct: 8, staking: { required: true, minEur: null, token: "CRO", lockupDays: 180 } }, "de");
    expect(s.text).toBe("2 % ohne Staking | bis zu 8 % mit CRO-Staking, 180 Tage gesperrt");
    expect(s.requiresStaking).toBe(true);
  });

  it("ohne Staking", () => {
    expect(cashbackSummary({ ...base, maxCashbackPct: 1, staking: { ...base.staking, required: false } }, "en").text).toBe("1% cashback, no staking");
  });

  it("Höchstsatz ohne geprüfte Staking-Bedingungen wird markiert", () => {
    expect(cashbackSummary({ ...base, maxCashbackPct: 3 }, "de").text).toContain("Staking-Bedingungen nicht geprüft");
  });
});

describe("CTA-Auflösung", () => {
  const p = prod(catalog, "bitpanda-card");
  const pr = prov(catalog, p);
  const input = (o: Offer | null) => ({
    offer: o,
    provider: pr,
    lang: "de" as const,
    country: { adLabel: "Werbung" },
    countryCode: "DE" as const,
    functionsBaseUrl: "https://x.supabase.co/functions/v1",
    subId: "q-c-de-ex-sc-lf",
    source: "quiz" as const,
    today: TODAY,
    providerPagePath: "/de/providers/bitpanda",
  });
  const bonus = { de: "Mit Bonus starten", en: "Start with bonus" };
  const cond = { de: "Bonus nach KYC und erster Zahlung, bis 31.12.2026.", en: "Bonus after KYC and first payment, until 31 Dec 2026." };

  it("ohne Offer: neutraler interner Link", () => {
    expect(resolveCta(input(null))).toEqual({ kind: "neutral", label: "Mehr zu Bitpanda", href: "/de/providers/bitpanda" });
  });

  it("Offer ohne Bonus: Standardtext, Label, Offenlegung, Redirect-URL", () => {
    const c = resolveCta(input(offer("bitpanda-card")));
    expect(c.kind).toBe("affiliate");
    if (c.kind !== "affiliate") return;
    expect(c.label).toBe("Zu Bitpanda");
    expect(c.adLabel).toBe("Werbung");
    expect(c.disclosure).toContain("Provision");
    expect(c.href).toContain("/functions/v1/go?s=bitpanda-card");
  });

  it("aktueller Bonus mit Bedingungen: eigener Text mit Sternchen", () => {
    const c = resolveCta(input(offer("bitpanda-card", { ctaText: bonus, bonusConditions: cond, bonusVerifiedAt: "2026-09-20" })));
    if (c.kind !== "affiliate") throw new Error();
    expect(c.label).toBe("Mit Bonus starten*");
    expect(c.bonusConditions).toBe(`* ${cond.de}`);
  });

  it("veralteter Bonus, fehlende Bedingungen oder verbotene Wörter: Standardtext", () => {
    const stale = resolveCta(input(offer("bitpanda-card", { ctaText: bonus, bonusConditions: cond, bonusVerifiedAt: "2026-08-01" })));
    const noCond = resolveCta(input(offer("bitpanda-card", { ctaText: bonus, bonusVerifiedAt: "2026-09-30" })));
    const forbidden = resolveCta(input(offer("bitpanda-card", { ctaText: { de: "Steuerfrei bezahlen", en: "Pay tax-free" }, bonusConditions: cond, bonusVerifiedAt: "2026-09-30" })));
    for (const c of [stale, noCond, forbidden]) expect(c.label).toBe("Zu Bitpanda");
  });

  it("gesponsertes Badge wird markiert", () => {
    const c = resolveCta(input(offer("bitpanda-card", { badge: { text: { de: "Beste für Reisen", en: "Best for travel" }, kind: "sponsored" } })));
    if (c.kind !== "affiliate") throw new Error();
    expect(c.badge).toEqual({ text: "Beste für Reisen", sponsored: true });
  });

  it("Liste verbotener Formulierungen greift", () => {
    for (const s of ["MiCA Ready", "MiCA-konform", "steuerneutral", "garantiert", "maximaler Bonus", "tax-free"]) expect(FORBIDDEN_COPY.test(s)).toBe(true);
    expect(FORBIDDEN_COPY.test("Zu Bitpanda")).toBe(false);
  });
});

describe("Trust-Modul Regulierung", () => {
  it("Bybit EU in DE: Zulassung aus Österreich per EU-Pass", () => {
    const p = prod(catalog, "bybit-eu-card");
    const f = regulationFacts(p, prov(catalog, p), country("DE"), "de");
    expect(f.availability).toBe("available");
    expect(f.passportText).toContain("Österreich");
    expect(f.entities.map((e) => e.role)).toEqual(expect.arrayContaining(["Krypto-Dienstleister, Verwahrer", "Kartenherausgeber"]));
    expect(new Set(f.entities.map((e) => e.legalName)).size).toBe(f.entities.length);
    expect(f.sourcesNote).toContain("Sekundärquellen");
  });

  it("Bybit EU in MT: nicht verfügbar, kein Passport-Satz", () => {
    const p = prod(catalog, "bybit-eu-card");
    const f = regulationFacts(p, prov(catalog, p), country("MT"), "de");
    expect(f.availabilityText).toContain("nicht verfügbar");
    expect(f.passportText).toBeNull();
  });

  it("Trade Republic in DE: Zulassung im Land selbst", () => {
    const p = prod(catalog, "trade-republic-card");
    expect(regulationFacts(p, prov(catalog, p), country("DE"), "de").passportText).toContain("in Deutschland selbst");
  });

  it("RedotPay: Bedeutung fehlender EU-Zulassung und Datenverantwortlicher außerhalb EWR", () => {
    const p = prod(catalog, "redotpay-card");
    const f = regulationFacts(p, prov(catalog, p), country("CY"), "de");
    expect(f.noEuMeaning).toContain("keine Aufsicht");
    expect(f.dataControllerText).toContain("außerhalb des EWR");
  });
});

describe("Steuer-Erklärer", () => {
  it("jedes Land hat genau drei Sätze in DE und EN", () => {
    for (const [code, t] of Object.entries(PAYMENT_TAX)) {
      expect(t.de, code).toHaveLength(3);
      expect(t.en, code).toHaveLength(3);
    }
  });

  it("keine Aussage, Stablecoin-Zahlungen seien steuerfrei/steuerneutral", () => {
    const all = JSON.stringify(PAYMENT_TAX).toLowerCase();
    expect(all).not.toMatch(/stablecoin[^.]{0,80}(steuerfrei|steuerneutral|tax-free|tax-neutral|keine steuer)/);
    expect(PAYMENT_TAX.DE.de[1]).toContain("auch für Stablecoins");
  });

  it("Funding-Flow-Hinweis für jede bekannte Variante", () => {
    for (const k of ["auto_sell_per_payment", "prefunded_fiat", "prefunded_stablecoin", "credit_line", "mixed"] as const) {
      expect(FUNDING_FLOW_TAX_NOTE[k]).not.toBeNull();
    }
    expect(FUNDING_FLOW_TAX_NOTE.unknown).toBeNull();
  });
});

describe("Komponenten (Server-Render)", () => {
  const withOffer: Catalog = { ...catalog, offers: [offer("bybit-eu-card", { promoCode: "CRYPTO25" })] };
  const outcome = matchCatalog(withOffer, answers, { today: TODAY, maxCards: 50 });
  const bybit = outcome.cards.find((r) => r.product.slug === "bybit-eu-card") as MatchResult;
  const kraken = outcome.cards.find((r) => r.product.slug === "kraken-card") as MatchResult;
  const base = {
    answers,
    country: country("DE"),
    lang: "de" as const,
    position: 1,
    functionsBaseUrl: "https://x.supabase.co/functions/v1",
    today: TODAY,
    providerPath: (slug: string) => `/de/providers/${slug}`,
  };

  it("Partner-CTA: Werbelabel am Button, rel=sponsored, Offenlegung, Promo-Code, Redirect", () => {
    const html = renderToStaticMarkup(<CardRecommendationCard {...base} result={bybit} />);
    expect(html).toContain(">Werbung<");
    expect(html).toContain('rel="sponsored noopener noreferrer"');
    expect(html).toContain("Partnerlink: Eröffnest du darüber ein Konto");
    expect(html).toContain('value="CRYPTO25"');
    expect(html).toContain("/functions/v1/go?s=bybit-eu-card");
    expect(html).toContain("MiCA-Zulassung");
    expect(html).toContain("Cashback: noch nicht geprüft");
  });

  it("ohne Offer: kein Werbelabel, kein sponsored-Link", () => {
    const html = renderToStaticMarkup(<CardRecommendationCard {...base} result={kraken} />);
    expect(html).not.toContain(">Werbung<");
    expect(html).not.toContain("sponsored");
    expect(html).toContain("Mehr zu Kraken");
    expect(html).toContain('href="/de/providers/kraken"');
  });

  it("Score-Aufschlüsselung zeigt 10 % Partneranteil", () => {
    const html = renderToStaticMarkup(<CardRecommendationCard {...base} result={bybit} />);
    expect(html).toContain("Partnerbeziehung (Provision) <span class=\"text-xs\">(10 %)</span>");
  });

  it("Trust-Layer: zwei Akkordeons, Land, Steuersätze, Funding-Flow je Karte", () => {
    const html = renderToStaticMarkup(<ResultsTrustLayer results={outcome.cards.slice(0, 3)} country={country("DE")} lang="de" />);
    expect((html.match(/<details/g) ?? []).length).toBe(2);
    expect(html).toContain("Verfügbarkeit und Regulierung in Deutschland");
    expect(html).toContain("Was beim Bezahlen mit Krypto steuerlich passiert");
    expect(html).toContain("auch für Stablecoins");
    expect(html).toContain("Keine Steuerberatung");
  });
});
