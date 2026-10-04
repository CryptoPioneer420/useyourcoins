import { describe, expect, it } from "vitest";
import { currentStep, initialQuizState, isComplete, quizReducer, visibleSteps, type QuizState } from "../quiz";
import { buildQuizSubId, buildPageSubId, goUrl, SUBID_PATTERN } from "../tracking";
import { applyFilters } from "../filters";
import { adLabel, AFFILIATE_DISCLOSURE } from "../compliance";
import { describeMethodology, COMMERCIAL_WEIGHT } from "../ranking-config";
import { KNOWLEDGE_TOPICS } from "../../content/knowledge";
import { loadSeedCatalog } from "./fixtures";

const run = (state: QuizState, ...values: [string, string][]): QuizState =>
  values.reduce((s, [step, value]) => quizReducer(s, { type: "ANSWER", step: step as never, value }), state);

describe("Quiz-State-Machine", () => {
  it("Karten-Pfad hat 4 Fragen, Börsen-Pfad 2", () => {
    expect(visibleSteps({ goal: "card" }).map((s) => s.id)).toEqual(["country", "holding", "spendAsset", "priority"]);
    expect(visibleSteps({ goal: "exchange" }).map((s) => s.id)).toEqual(["country", "priority"]);
  });

  it("Länderseite überspringt die Länderfrage", () => {
    const s = quizReducer(initialQuizState, { type: "START", goal: "card", country: "AT" });
    expect(currentStep(s)?.id).toBe("holding");
  });

  it("vollständiger Durchlauf endet in done", () => {
    let s = quizReducer(initialQuizState, { type: "START", goal: "card" });
    s = run(s, ["country", "DE"], ["holding", "own_wallet"], ["spendAsset", "stablecoins"], ["priority", "low_fees"]);
    expect(s.status).toBe("done");
    expect(isComplete(s.answers)).toBe(true);
  });

  it("anderes Land → out_of_scope, BACK kehrt zurück", () => {
    let s = quizReducer(initialQuizState, { type: "START", goal: "card" });
    s = run(s, ["country", "other"]);
    expect(s.status).toBe("out_of_scope");
    s = quizReducer(s, { type: "BACK" });
    expect(s.status).toBe("in_progress");
  });

  it("ungültige oder unpassende Antworten werden ignoriert", () => {
    let s = quizReducer(initialQuizState, { type: "START", goal: "exchange" });
    s = run(s, ["country", "DE"], ["priority", "cashback"]);
    expect(s.status).toBe("in_progress");
    s = run(s, ["priority", "low_fees"]);
    expect(s.status).toBe("done");
  });

  it("Antwort auf falschen Schritt wird ignoriert", () => {
    const s0 = quizReducer(initialQuizState, { type: "START", goal: "card" });
    const s1 = run(s0, ["priority", "low_fees"]);
    expect(s1).toBe(s0);
  });
});

describe("Tracking", () => {
  it("Sub-ID ist kurz, kleingeschrieben und ohne Personenbezug", () => {
    const id = buildQuizSubId({ goal: "card", country: "DE", holding: "own_wallet", spendAsset: "stablecoins", priority: "low_fees" });
    expect(id).toBe("q-c-de-ow-sc-lf");
    expect(SUBID_PATTERN.test(id)).toBe(true);
    expect(SUBID_PATTERN.test(buildPageSubId("country_page", "CY"))).toBe(true);
  });

  it("goUrl baut die Redirect-URL und lehnt ungültige Sub-IDs ab", () => {
    const u = new URL(goUrl("https://x.supabase.co/functions/v1/", { slug: "bitpanda-card", country: "DE", lang: "de", source: "quiz", subId: "q-c-de-ex-eu-lf" }));
    expect(u.pathname).toBe("/functions/v1/go");
    expect(u.searchParams.get("s")).toBe("bitpanda-card");
    expect(u.searchParams.get("rv")).toBeTruthy();
    expect(() => goUrl("https://x", { slug: "a", country: "DE", lang: "de", source: "quiz", subId: "Max Mustermann" })).toThrow();
  });
});

describe("Filter", () => {
  const catalog = loadSeedCatalog();

  it("Land MT blendet Bybit EU und Trade Republic aus", () => {
    const slugs = applyFilters(catalog, { country: "MT", type: "card" }).map((r) => r.product.slug);
    expect(slugs).not.toContain("bybit-eu-card");
    expect(slugs).not.toContain("trade-republic-card");
  });

  it("nur EU-reguliert: KAST und RedotPay raus, ether.fi unsicher, Self-Custody mit EU-Issuer drin", () => {
    const res = applyFilters(catalog, { type: "card", euAuthorisedOnly: true });
    const slugs = res.map((r) => r.product.slug);
    expect(slugs).not.toContain("kast-card");
    expect(slugs).not.toContain("redotpay-card");
    expect(res.find((r) => r.product.slug === "ether-fi-cash-card")?.uncertain).toContain("authorisation");
    expect(slugs).toEqual(expect.arrayContaining(["bitpanda-card", "metamask-card", "trade-republic-card"]));
    const strict = applyFilters(catalog, { type: "card", euAuthorisedOnly: true, includeUnknown: false }).map((r) => r.product.slug);
    expect(strict).not.toContain("ether-fi-cash-card");
  });

  it("unbekannte Werte bleiben sichtbar und werden markiert; includeUnknown=false entfernt sie", () => {
    const withUnknown = applyFilters(catalog, { type: "card", stablecoin: "USDC" });
    const kraken = withUnknown.find((r) => r.product.slug === "kraken-card");
    expect(kraken?.uncertain).toContain("stablecoins");
    const strict = applyFilters(catalog, { type: "card", stablecoin: "USDC", includeUnknown: false }).map((r) => r.product.slug);
    expect(strict).toEqual(expect.arrayContaining(["bybit-eu-card", "coinbase-card", "metamask-card"]));
    expect(strict).not.toContain("kraken-card");
    expect(strict).not.toContain("revolut-card");
  });

  it("Datenverantwortlicher im EWR", () => {
    const strict = applyFilters(catalog, { type: "card", dataControllerInEea: true, includeUnknown: false }).map((r) => r.provider.slug);
    expect(strict).toContain("trade-republic");
    expect(strict).not.toContain("redotpay");
    expect(strict).not.toContain("ether-fi");
  });
});

describe("Compliance und Inhalte", () => {
  it("Werbelabel kombiniert Seiten- und Landessprache", () => {
    expect(adLabel("en", { adLabel: "Publicité" })).toBe("Ad · Publicité");
    expect(adLabel("de", { adLabel: "Werbung" })).toBe("Werbung");
  });

  it("Offenlegung nennt den tatsächlichen Provisionsanteil", () => {
    const pct = `${Math.round(COMMERCIAL_WEIGHT * 100)} %`;
    expect(AFFILIATE_DISCLOSURE.de).toContain(pct);
  });

  it("Methodik deckt alle Faktoren ab", () => {
    expect(describeMethodology().rows).toHaveLength(6);
  });

  it("Wissensartikel: Kurzfassung maximal zwei Sätze, DE und EN vorhanden", () => {
    for (const t of KNOWLEDGE_TOPICS) {
      for (const lang of ["de", "en"] as const) {
        const sentences = t.summary[lang].split(/(?<=[^\d\s][.!?])\s+/).filter(Boolean);
        expect(sentences.length, `${t.slug}/${lang}`).toBeLessThanOrEqual(2);
      }
      expect(t.sources.length).toBeGreaterThan(0);
    }
  });

  it("kein Inhalt behauptet, Stablecoin-Zahlungen seien steuerfrei oder steuerneutral", () => {
    const all = JSON.stringify(KNOWLEDGE_TOPICS).toLowerCase() + JSON.stringify(loadSeedCatalog().countries).toLowerCase();
    expect(all).not.toMatch(/stablecoin[^.]{0,60}(steuerfrei|steuerneutral|tax-free|tax-neutral)/);
  });
});
