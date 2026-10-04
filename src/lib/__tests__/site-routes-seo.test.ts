import { describe, expect, it } from "vitest";
import de from "../../locales/de.json";
import en from "../../locales/en.json";
import { CATEGORIES } from "../categories";
import { COMMERCIAL_WEIGHT } from "../ranking-config";
import { FORBIDDEN_COPY } from "../presentation";
import { t } from "../i18n";
import {
  alternates,
  countryBySlug,
  COUNTRY_SLUGS,
  hubBySlug,
  indexablePages,
  isIndexable,
  langFromAcceptLanguage,
  pathFor,
  prerenderPaths,
  robotsTxt,
  sitemapXml,
  type PageRef,
} from "../routes";
import { articleJsonLd, breadcrumbJsonLd, breadcrumbs, buildMeta, clip, DESCRIPTION_MAX, fitDescription, fitTitle, productSeoName, serializeJsonLd, TITLE_MAX } from "../seo";
import { countryAfterIn } from "../countries";
import { ALLOWED_ORIGINS, missingOperatorFields, OPERATOR, providerLogoPath, providerMonogram, SITE } from "../site";
import { LAUNCH_COUNTRIES } from "../types";
import { KNOWLEDGE_TOPICS } from "../../content/knowledge";
import { LEARN_PAGES, learnPageBySlug, publishedLearnPages } from "../../content/learn-registry";
import { isVerified, seedCoverage } from "../../data/seed";
import { loadSeedCatalog } from "./fixtures";

const catalog = loadSeedCatalog();
const LANGS = ["de", "en"] as const;
const BANNED = /testsieger|testbericht|im test\b|\btested\b|test winner/i;

describe("Marke und Betreiber", () => {
  it("kanonischer Ursprung ohne www und ohne Slash, beide Ursprünge für den Redirect erlaubt", () => {
    expect(SITE.url).toBe("https://useyourcoins.com");
    expect(ALLOWED_ORIGINS).toEqual(["https://useyourcoins.com", "https://www.useyourcoins.com"]);
  });

  it("fehlende Impressumsangaben werden benannt, nicht erfunden", () => {
    expect(missingOperatorFields()).toEqual(["streetAddress", "registrationNo", "representedBy", "email", "euRepresentative"]);
    expect(missingOperatorFields({ ...OPERATOR, streetAddress: "x", registrationNo: "1", representedBy: "y", email: "a@b.c", euRepresentative: " " })).toEqual(["euRepresentative"]);
  });

  it("Logos nur nach Freigabe, sonst Monogramm", () => {
    expect(providerLogoPath("kraken")).toBeNull();
    expect(providerMonogram("Trade Republic")).toBe("TR");
    expect(providerMonogram("ether.fi")).toBe("EF");
    expect(providerMonogram("Kraken")).toBe("KR");
  });
});

describe("Routen", () => {
  it("Pfade je Sprache mit übersetzten Slugs", () => {
    expect(pathFor({ kind: "home" }, "de")).toBe("/de");
    expect(pathFor({ kind: "hub", hub: "cards" }, "de")).toBe("/de/krypto-karten");
    expect(pathFor({ kind: "hub", hub: "exchanges" }, "en")).toBe("/en/crypto-exchanges");
    expect(pathFor({ kind: "country", code: "AT" }, "de")).toBe("/de/countries/oesterreich");
    expect(pathFor({ kind: "country", code: "AT" }, "en")).toBe("/en/countries/austria");
    expect(pathFor({ kind: "learn", pageId: "dac8" }, "de")).toBe("/de/learn/dac8-meldepflicht-krypto");
    expect(pathFor({ kind: "category", categoryId: "sepa-exchanges" }, "en")).toBe("/en/category/exchanges-with-sepa");
    expect(pathFor({ kind: "product", slug: "kraken-card" }, "en")).toBe("/en/products/kraken-card");
    expect(() => pathFor({ kind: "learn", pageId: "nope" }, "de")).toThrow(RangeError);
  });

  it("Slugs lassen sich zurück auflösen und gelten nur in ihrer Sprache", () => {
    expect(hubBySlug("de", "krypto-karten")).toBe("cards");
    expect(hubBySlug("en", "krypto-karten")).toBeNull();
    expect(countryBySlug("de", "zypern")).toBe("CY");
    expect(countryBySlug("en", "zypern")).toBeNull();
    for (const lang of LANGS) {
      const slugs = LAUNCH_COUNTRIES.map((c) => COUNTRY_SLUGS[c][lang]);
      expect(new Set(slugs).size).toBe(8);
    }
  });

  it("alle Pfade sind eindeutig, klein geschrieben und ohne Slash am Ende", () => {
    const paths = prerenderPaths(catalog);
    expect(new Set(paths).size).toBe(paths.length);
    for (const p of paths) expect(p).toMatch(/^\/(de|en)(\/[a-z0-9-]+)*$/);
  });

  it("Hub-Slugs kollidieren nicht mit festen Abschnitten", () => {
    const fixed = ["finder", "compare", "category", "calculator", "learn", "methodology", "products", "providers", "countries", "legal", "link-unavailable"];
    for (const lang of LANGS) for (const hub of ["cards", "exchanges"] as const) expect(fixed).not.toContain(pathFor({ kind: "hub", hub }, lang).split("/")[2]);
  });

  it("Umfang: 8 feste Seiten, 6 Kategorien, 6 Wissensseiten, 8 Länder, 14 Anbieter, 23 Produkte, 3 Rechtstexte", () => {
    const pages = indexablePages(catalog);
    const count = (k: PageRef["kind"]) => pages.filter((p) => p.kind === k).length;
    expect(count("category")).toBe(CATEGORIES.length);
    expect(count("learn")).toBe(6);
    expect(count("country")).toBe(8);
    expect(count("provider")).toBe(14);
    expect(count("product")).toBe(23);
    expect(count("legal")).toBe(3);
    expect(pages).toHaveLength(8 + 6 + 6 + 8 + 14 + 23 + 3);
    expect(prerenderPaths(catalog)).toHaveLength(pages.length * 2);
  });

  it("Direktvergleich und Hinweisseite sind nicht indexierbar und nicht in der Sitemap", () => {
    expect(isIndexable({ kind: "compare" })).toBe(false);
    expect(isIndexable({ kind: "linkUnavailable" })).toBe(false);
    const xml = sitemapXml(catalog, "2026-10-04");
    expect(xml).not.toContain("/compare");
    expect(xml).not.toContain("/link-unavailable");
    expect(xml).toContain("<loc>https://useyourcoins.com/de/learn/mica-verordnung-krypto</loc>");
    expect(xml).toContain('hreflang="x-default" href="https://useyourcoins.com/en/learn/mica-regulation-crypto"');
    expect(xml.match(/<url>/g)).toHaveLength(prerenderPaths(catalog).length);
  });

  it("hreflang: beide Sprachen plus x-default auf die Ausweichsprache", () => {
    expect(alternates({ kind: "country", code: "DE" })).toEqual([
      { hreflang: "de", href: "https://useyourcoins.com/de/countries/deutschland" },
      { hreflang: "en", href: "https://useyourcoins.com/en/countries/germany" },
      { hreflang: "x-default", href: "https://useyourcoins.com/en/countries/germany" },
    ]);
  });

  it("robots.txt sperrt nur den Redirect und nennt die Sitemap", () => {
    const txt = robotsTxt();
    expect(txt).toContain("Disallow: /go");
    expect(txt).not.toContain("compare");
    expect(txt).toContain("Sitemap: https://useyourcoins.com/sitemap.xml");
  });

  it("Sprache aus Accept-Language, sonst Ausweichsprache", () => {
    expect(langFromAcceptLanguage("de-AT,de;q=0.9,en;q=0.8")).toBe("de");
    expect(langFromAcceptLanguage("fr-FR,fr;q=0.9,de;q=0.4,en;q=0.6")).toBe("en");
    expect(langFromAcceptLanguage("fr-FR,es;q=0.9")).toBe("en");
    expect(langFromAcceptLanguage("en;q=0,de;q=0.1")).toBe("de");
    expect(langFromAcceptLanguage(null)).toBe("en");
    expect(langFromAcceptLanguage("")).toBe("en");
  });
});

describe("Wissens-Register", () => {
  it("jede veröffentlichte Seite hat Inhalt, jeder Inhalt hat eine Seite", () => {
    for (const p of publishedLearnPages()) expect(KNOWLEDGE_TOPICS.some((t) => t.slug === p.topicSlug), p.id).toBe(true);
    for (const topic of KNOWLEDGE_TOPICS) expect(LEARN_PAGES.filter((p) => p.topicSlug === topic.slug && p.status === "published"), topic.slug).toHaveLength(1);
  });

  it("geplante Seiten haben keinen Inhalt, sind nicht erreichbar und haben einen Arbeitstitel", () => {
    for (const p of LEARN_PAGES.filter((x) => x.status !== "published")) {
      expect(p.topicSlug, p.id).toBeNull();
      expect(p.workingTitle, p.id).not.toBeNull();
      expect(learnPageBySlug("de", p.slug.de), p.id).toBeNull();
    }
    expect(learnPageBySlug("de", "dac8-meldepflicht-krypto")?.id).toBe("dac8");
    expect(learnPageBySlug("en", "dac8-meldepflicht-krypto")).toBeNull();
  });

  it("IDs, Slugs und Haupt-Keywords sind je Sprache eindeutig (keine Kannibalisierung)", () => {
    expect(new Set(LEARN_PAGES.map((p) => p.id)).size).toBe(LEARN_PAGES.length);
    for (const lang of LANGS) {
      expect(new Set(LEARN_PAGES.map((p) => p.slug[lang])).size).toBe(LEARN_PAGES.length);
      expect(new Set(LEARN_PAGES.map((p) => p.primaryKeyword[lang])).size).toBe(LEARN_PAGES.length);
      const all = LEARN_PAGES.flatMap((p) => [p.primaryKeyword[lang], ...p.secondaryKeywords[lang]]);
      expect(new Set(all).size).toBe(all.length);
    }
  });

  it("die No-KYC-Seite bleibt bis zur Freigabe unveröffentlicht", () => {
    expect(LEARN_PAGES.find((p) => p.id === "no-kyc")!.status).toBe("needs_decision");
  });
});

describe("Meta-Daten", () => {
  const pages: PageRef[] = [...indexablePages(catalog), { kind: "compare" }, { kind: "linkUnavailable" }];

  it("jede Seite: Titel ≤ 60, Beschreibung ≤ 155, Canonical absolut, H1 gesetzt", () => {
    for (const ref of pages) {
      for (const lang of LANGS) {
        const m = buildMeta(ref, lang, catalog);
        const id = `${lang} ${JSON.stringify(ref)}`;
        expect(m.title.length, `${id}: ${m.title}`).toBeLessThanOrEqual(TITLE_MAX);
        expect(m.title, id).toContain(SITE.brand);
        expect(m.title, id).not.toContain("…");
        expect(m.description.length, id).toBeLessThanOrEqual(DESCRIPTION_MAX);
        expect(m.description.length, id).toBeGreaterThan(20);
        expect(m.canonical, id).toBe(`https://useyourcoins.com${pathFor(ref, lang)}`);
        expect(m.h1.length, id).toBeGreaterThan(3);
        expect(m.alternates, id).toHaveLength(3);
      }
    }
  });

  it("Titel sind je Sprache eindeutig", () => {
    for (const lang of LANGS) {
      const titles = pages.map((ref) => buildMeta(ref, lang, catalog).title);
      expect(new Set(titles).size).toBe(titles.length);
    }
  });

  it("keine verbotenen Aussagen und keine Test-Begriffe in Titeln, Beschreibungen und H1", () => {
    for (const ref of pages) {
      for (const lang of LANGS) {
        const m = buildMeta(ref, lang, catalog);
        const text = `${m.title} ${m.description} ${m.h1}`;
        expect(FORBIDDEN_COPY.test(text), text).toBe(false);
        expect(BANNED.test(text), text).toBe(false);
      }
    }
  });

  it("robots folgt der Indexierbarkeit", () => {
    expect(buildMeta({ kind: "compare" }, "de", catalog).robots).toBe("noindex,follow");
    expect(buildMeta({ kind: "finder" }, "de", catalog).robots).toBe("index,follow");
  });

  it("Methodik-Beschreibung nennt das tatsächliche Gewicht der Partnerbeziehung", () => {
    const pct = Math.round(COMMERCIAL_WEIGHT * 100);
    expect(buildMeta({ kind: "methodology" }, "de", catalog).description).toContain(`${pct} %`);
    expect(buildMeta({ kind: "methodology" }, "en", catalog).description).toContain(`${pct}%`);
  });

  it("clip kürzt an der Wortgrenze", () => {
    expect(clip("kurz", 10)).toBe("kurz");
    const out = clip("eins zwei drei vier fünf sechs sieben", 20);
    expect(out.length).toBeLessThanOrEqual(20);
    expect(out.endsWith("…")).toBe(true);
    expect(out).toBe("eins zwei drei vier…");
  });

  it("Titelvarianten statt Kürzung, Beschreibung in ganzen Sätzen", () => {
    expect(fitTitle(["Ein sehr langer Titel, der bestimmt nicht in den Platz passt", "Kurzer Titel"])).toBe("Kurzer Titel");
    expect(fitDescription("Kurz.")).toBe("Kurz.");
    const long = `${"Erster Satz mit genug Inhalt für eine Beschreibung der Seite. "}${"Zweiter Satz, der die Grenze überschreitet und deshalb wegfällt, weil er zu lang ist für die Suchergebnisseite."}`;
    expect(fitDescription(long)).toBe("Erster Satz mit genug Inhalt für eine Beschreibung der Seite.");
  });

  it("Börsen ohne eigenen Produktnamen bekommen den Typ, Klammerzusätze entfallen", () => {
    expect(productSeoName({ name: "Kraken", type: "exchange" }, "de")).toBe("Kraken Börse");
    expect(productSeoName({ name: "Nexo (EWR über DLT Finance)", type: "exchange" }, "en")).toBe("Nexo exchange");
    expect(productSeoName({ name: "Revolut Krypto", type: "exchange" }, "de")).toBe("Revolut Krypto");
    expect(productSeoName({ name: "Kraken Card", type: "card" }, "de")).toBe("Kraken Card");
    expect(buildMeta({ kind: "product", slug: "kraken-exchange" }, "de", catalog).h1).toBe("Kraken Börse: Produktprofil");
  });

  it("Länderform nach \"in\"", () => {
    const nl = catalog.countries.find((c) => c.code === "NL")!;
    expect(countryAfterIn(nl, "de")).toBe("den Niederlanden");
    expect(countryAfterIn(nl, "en")).toBe("the Netherlands");
    expect(buildMeta({ kind: "country", code: "NL" }, "de", catalog).h1).toBe("Krypto-Karten und Börsen in den Niederlanden");
    expect(buildMeta({ kind: "country", code: "DE" }, "de", catalog).title).toBe("Krypto-Karten in Deutschland: Regeln, Steuern | UseYourCoins");
  });

  it("Brotkrumen folgen dem Silo", () => {
    expect(breadcrumbs({ kind: "product", slug: "kraken-exchange" }, "de", catalog).map((c) => c.path)).toEqual(["/de", "/de/krypto-boersen", "/de/products/kraken-exchange"]);
    expect(breadcrumbs({ kind: "learn", pageId: "mica" }, "en", catalog).map((c) => c.path)).toEqual(["/en", "/en/learn", "/en/learn/mica-regulation-crypto"]);
    expect(breadcrumbs({ kind: "category", categoryId: "sepa-exchanges" }, "de", catalog)[1]!.path).toBe("/de/krypto-boersen");
    expect(breadcrumbs({ kind: "home" }, "de", catalog)).toHaveLength(1);
    const ld = breadcrumbJsonLd(breadcrumbs({ kind: "country", code: "CY" }, "en", catalog));
    expect((ld.itemListElement as unknown[]).length).toBe(3);
  });

  it("Artikel-Schema nennt Stand und Quellen, JSON-LD ist einbettbar", () => {
    const ld = articleJsonLd("dac8", "de");
    expect(ld.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect((ld.citation as string[]).length).toBeGreaterThan(0);
    expect(JSON.stringify(ld)).not.toMatch(/Review|AggregateRating/);
    expect(serializeJsonLd({ a: "</script>" })).not.toContain("</script>");
    expect(() => articleJsonLd("no-kyc", "de")).toThrow(RangeError);
  });
});

describe("Oberflächentexte", () => {
  const keys = (o: Record<string, Record<string, string>>) => Object.entries(o).flatMap(([ns, v]) => Object.keys(v).map((k) => `${ns}.${k}`)).sort();

  it("DE und EN haben dieselben Schlüssel und dieselben Platzhalter", () => {
    expect(keys(en)).toEqual(keys(de));
    for (const [ns, group] of Object.entries(de)) {
      for (const [k, v] of Object.entries(group)) {
        const other = (en as Record<string, Record<string, string>>)[ns]![k]!;
        expect((other.match(/\{\w+\}/g) ?? []).sort(), `${ns}.${k}`).toEqual((v.match(/\{\w+\}/g) ?? []).sort());
        expect(v.trim().length, `${ns}.${k}`).toBeGreaterThan(0);
      }
    }
  });

  it("keine verbotenen Aussagen und keine Test-Begriffe", () => {
    for (const text of [JSON.stringify(de), JSON.stringify(en)]) {
      expect(FORBIDDEN_COPY.test(text)).toBe(false);
      expect(BANNED.test(text)).toBe(false);
      expect(/\bsicher\b|\brendite\b/i.test(text)).toBe(false);
    }
  });

  it("t() ersetzt Platzhalter und wirft bei unbekanntem Schlüssel", () => {
    expect(t("de", "finder.stepOf", { current: 2, total: 4 })).toBe("Frage 2 von 4");
    expect(t("en", "country.finderCta", { country: "Austria" })).toBe("Start the finder for Austria");
    expect(t("de", "footer.operatedBy")).toBe("Betrieben von {operator}");
    expect(() => t("de", "nav.nope" as never)).toThrow(RangeError);
  });
});

describe("Datenstand im Seed", () => {
  it("Basisdaten vollständig, Konditionen bewusst leer", () => {
    const c = seedCoverage(catalog);
    expect(c).toMatchObject({ providers: 14, products: 23, cards: 14, exchanges: 9, availabilityCells: 184 });
    expect(c.cardsWithAnyFee).toBe(0);
    expect(c.cardsWithCashback).toBe(0);
    expect(c.exchangesWithTakerFee).toBe(0);
    expect(c.productsVerified).toBe(0);
    for (const p of catalog.products) {
      const provider = catalog.providers.find((x) => x.id === p.providerId)!;
      expect(p.name.length, p.slug).toBeGreaterThan(0);
      expect(p.availability, p.slug).toHaveLength(8);
      expect(p.sourceUrl, p.slug).not.toBeNull();
      expect(provider.websiteUrl, p.slug).not.toBeNull();
      expect(provider.entities.length, p.slug).toBeGreaterThan(0);
      if (p.type === "card") expect(p.custody, p.slug).not.toBe("not_applicable");
    }
  });

  it("Lücke Verfügbarkeit: sechs Produkte ohne belegtes Land", () => {
    const c = seedCoverage(catalog);
    expect(c.productsWithoutAvailability.sort()).toEqual(["ether-fi-cash-card", "gnosis-pay-card", "kast-card", "nexo-card", "nexo-exchange", "redotpay-card"]);
    expect(c.availabilityUnknown).toBe(48);
  });

  it("isVerified nur bei Prüfung gegen die Primärquelle", () => {
    expect(isVerified({ confidence: "verified" })).toBe(true);
    expect(isVerified({ confidence: "secondary" })).toBe(false);
  });
});
