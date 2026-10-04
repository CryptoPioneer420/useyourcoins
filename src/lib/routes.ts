/**
 * Routen-Register: einzige Quelle für URLs, Sprachalternativen, Indexierbarkeit und Sitemap.
 * Framework-neutral. Der Router (TanStack Start) bildet nur die Muster ab und fragt hier nach.
 *
 * URL-Schema: /:lang/<abschnitt>/<slug>. Abschnittsnamen sind in beiden Sprachen gleich (englisch),
 * Slugs sind je Sprache übersetzt. Ausnahme: die zwei Vergleichs-Hubs liegen direkt unter /:lang.
 *
 * Drei Silos:
 *  1. Transaktion: finder, Hubs (Karten, Börsen), category, calculator, compare
 *  2. Wissen:      learn, methodology
 *  3. Entitäten:   products, providers, countries
 */
import { CATEGORIES } from "./categories";
import { SITE } from "./site";
import { LEARN_PAGES, publishedLearnPages } from "../content/learn-registry";
import { LAUNCH_COUNTRIES, type Catalog, type CountryCode, type I18n, type Lang, type ProductType } from "./types";

export const LANGS: readonly Lang[] = SITE.languages;

export function isLang(value: string | undefined | null): value is Lang {
  return value === "de" || value === "en";
}

/** Sprache für den Redirect von "/" aus dem Accept-Language-Header (serverseitig). */
export function langFromAcceptLanguage(header: string | null | undefined): Lang {
  if (!header) return SITE.fallbackLang;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((x) => x.trim()).find((x) => x.startsWith("q="));
      const weight = q ? Number(q.slice(2)) : 1;
      return { tag: (tag ?? "").toLowerCase(), weight: Number.isFinite(weight) ? weight : 0 };
    })
    .filter((x) => x.tag !== "" && x.weight > 0)
    .sort((a, b) => b.weight - a.weight);
  for (const { tag } of ranked) {
    const primary = tag.split("-")[0];
    if (isLang(primary)) return primary;
  }
  return SITE.fallbackLang;
}

// ---------- Slugs ----------

export type HubId = "cards" | "exchanges";

export const HUBS: Record<HubId, { type: ProductType; slug: I18n }> = {
  cards: { type: "card", slug: { de: "krypto-karten", en: "crypto-cards" } },
  exchanges: { type: "exchange", slug: { de: "krypto-boersen", en: "crypto-exchanges" } },
};

export function hubBySlug(lang: Lang, slug: string): HubId | null {
  return (Object.keys(HUBS) as HubId[]).find((id) => HUBS[id].slug[lang] === slug) ?? null;
}

export const COUNTRY_SLUGS: Record<CountryCode, I18n> = {
  DE: { de: "deutschland", en: "germany" },
  AT: { de: "oesterreich", en: "austria" },
  FR: { de: "frankreich", en: "france" },
  ES: { de: "spanien", en: "spain" },
  IT: { de: "italien", en: "italy" },
  NL: { de: "niederlande", en: "netherlands" },
  MT: { de: "malta", en: "malta" },
  CY: { de: "zypern", en: "cyprus" },
};

export function countryBySlug(lang: Lang, slug: string): CountryCode | null {
  return LAUNCH_COUNTRIES.find((code) => COUNTRY_SLUGS[code][lang] === slug) ?? null;
}

export type LegalPageId = "imprint" | "privacy" | "disclaimer";
export const LEGAL_PAGES: readonly LegalPageId[] = ["imprint", "privacy", "disclaimer"];

// ---------- Seitenreferenzen ----------

export type PageRef =
  | { kind: "home" }
  | { kind: "finder" }
  | { kind: "hub"; hub: HubId }
  | { kind: "compare" }
  | { kind: "category"; categoryId: string }
  | { kind: "calculator" }
  | { kind: "learnHub" }
  | { kind: "learn"; pageId: string }
  | { kind: "methodology" }
  | { kind: "product"; slug: string }
  | { kind: "provider"; slug: string }
  | { kind: "countries" }
  | { kind: "country"; code: CountryCode }
  | { kind: "legal"; page: LegalPageId }
  | { kind: "linkUnavailable" };

export type PageKind = PageRef["kind"];
export type Silo = "transaction" | "knowledge" | "entities" | "service";

export const SILO: Record<PageKind, Silo> = {
  home: "service",
  finder: "transaction",
  hub: "transaction",
  compare: "transaction",
  category: "transaction",
  calculator: "transaction",
  learnHub: "knowledge",
  learn: "knowledge",
  methodology: "knowledge",
  product: "entities",
  provider: "entities",
  countries: "entities",
  country: "entities",
  legal: "service",
  linkUnavailable: "service",
};

/**
 * Nicht indexiert: Direktvergleich (Zustand in Query-Parametern, beliebig viele Varianten)
 * und die Hinweisseite für nicht verfügbare Partnerlinks.
 */
const NOINDEX: ReadonlySet<PageKind> = new Set<PageKind>(["compare", "linkUnavailable"]);

export function isIndexable(ref: PageRef): boolean {
  return !NOINDEX.has(ref.kind);
}

function segment(ref: PageRef, lang: Lang): string {
  switch (ref.kind) {
    case "home":
      return "";
    case "finder":
      return "/finder";
    case "hub":
      return `/${HUBS[ref.hub].slug[lang]}`;
    case "compare":
      return "/compare";
    case "category": {
      const c = CATEGORIES.find((x) => x.id === ref.categoryId);
      if (!c) throw new RangeError(`Unbekannte Kategorie: ${ref.categoryId}`);
      return `/category/${c.slug[lang]}`;
    }
    case "calculator":
      return "/calculator";
    case "learnHub":
      return "/learn";
    case "learn": {
      const p = LEARN_PAGES.find((x) => x.id === ref.pageId);
      if (!p) throw new RangeError(`Unbekannte Wissensseite: ${ref.pageId}`);
      return `/learn/${p.slug[lang]}`;
    }
    case "methodology":
      return "/methodology";
    case "product":
      return `/products/${ref.slug}`;
    case "provider":
      return `/providers/${ref.slug}`;
    case "countries":
      return "/countries";
    case "country":
      return `/countries/${COUNTRY_SLUGS[ref.code][lang]}`;
    case "legal":
      return `/legal/${ref.page}`;
    case "linkUnavailable":
      return "/link-unavailable";
  }
}

/** Pfad ohne Ursprung, ohne Slash am Ende, z. B. "/de/learn/dac8-meldepflicht-krypto". */
export function pathFor(ref: PageRef, lang: Lang): string {
  return `/${lang}${segment(ref, lang)}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface Alternate {
  hreflang: Lang | "x-default";
  href: string;
}

/** hreflang-Satz für eine Seite: beide Sprachen plus x-default (Ausweichsprache). */
export function alternates(ref: PageRef): Alternate[] {
  return [
    ...LANGS.map((lang) => ({ hreflang: lang, href: absoluteUrl(pathFor(ref, lang)) })),
    { hreflang: "x-default" as const, href: absoluteUrl(pathFor(ref, SITE.fallbackLang)) },
  ];
}

/** Pfad derselben Seite in der anderen Sprache (Sprachumschalter). */
export function switchLanguage(ref: PageRef, target: Lang): string {
  return pathFor(ref, target);
}

// ---------- Auflistung für Sitemap und Prerendering ----------

/** Alle Seiten, die als fertiges HTML ausgeliefert und indexiert werden sollen. */
export function indexablePages(catalog: Pick<Catalog, "products" | "providers">): PageRef[] {
  const pages: PageRef[] = [
    { kind: "home" },
    { kind: "finder" },
    { kind: "hub", hub: "cards" },
    { kind: "hub", hub: "exchanges" },
    { kind: "calculator" },
    { kind: "learnHub" },
    { kind: "methodology" },
    { kind: "countries" },
    ...CATEGORIES.map((c): PageRef => ({ kind: "category", categoryId: c.id })),
    ...publishedLearnPages().map((p): PageRef => ({ kind: "learn", pageId: p.id })),
    ...LAUNCH_COUNTRIES.map((code): PageRef => ({ kind: "country", code })),
    ...catalog.providers.map((p): PageRef => ({ kind: "provider", slug: p.slug })),
    // Eingestellte Produkte bleiben erreichbar, werden aber nicht mehr beworben.
    ...catalog.products.filter((p) => p.status !== "discontinued").map((p): PageRef => ({ kind: "product", slug: p.slug })),
    ...LEGAL_PAGES.map((page): PageRef => ({ kind: "legal", page })),
  ];
  return pages.filter(isIndexable);
}

/** Alle Pfade in beiden Sprachen, z. B. als Eingabe für statisches Vorrendern. */
export function prerenderPaths(catalog: Pick<Catalog, "products" | "providers">): string[] {
  return indexablePages(catalog).flatMap((ref) => LANGS.map((lang) => pathFor(ref, lang)));
}

export interface SitemapEntry {
  loc: string;
  alternates: Alternate[];
  lastmod: string | null;
}

export function sitemapEntries(catalog: Pick<Catalog, "products" | "providers">, lastmod: string | null = null): SitemapEntry[] {
  return indexablePages(catalog).flatMap((ref) => {
    const alts = alternates(ref);
    return LANGS.map((lang) => ({ loc: absoluteUrl(pathFor(ref, lang)), alternates: alts, lastmod }));
  });
}

function xml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function sitemapXml(catalog: Pick<Catalog, "products" | "providers">, lastmod: string | null = null): string {
  const urls = sitemapEntries(catalog, lastmod)
    .map((e) => {
      const links = e.alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${xml(a.href)}"/>`).join("\n");
      const mod = e.lastmod ? `\n    <lastmod>${xml(e.lastmod)}</lastmod>` : "";
      return `  <url>\n    <loc>${xml(e.loc)}</loc>${mod}\n${links}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

/**
 * Nur der Affiliate-Redirect wird vom Crawling ausgeschlossen. Seiten mit noindex bleiben crawlbar,
 * sonst kann die Suchmaschine das noindex nicht lesen.
 */
export function robotsTxt(): string {
  return ["User-agent: *", "Allow: /", "Disallow: /go", "", `Sitemap: ${SITE.url}/sitemap.xml`, ""].join("\n");
}
