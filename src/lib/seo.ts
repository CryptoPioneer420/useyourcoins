/**
 * Meta-Daten und strukturierte Daten je Seite. Framework-neutral: liefert reine Objekte,
 * die der Router in <head> schreibt (TanStack Start: `head()` der Route).
 *
 * Regeln:
 * - Titel: "{Seite} | {Marke}", Startseite "{Marke}: {Claim}". Ziel ≤ 60 Zeichen.
 * - Description ≤ 155 Zeichen, ohne Versprechen zu Gebühren, Steuern oder Regulierung.
 * - Kein Review- oder AggregateRating-Schema: Es gibt keine eigenen Tests.
 */
import { CATEGORIES } from "./categories";
import { SITE, OPERATOR } from "./site";
import { absoluteUrl, alternates, HUBS, isIndexable, pathFor, type Alternate, type PageRef } from "./routes";
import { LEARN_PAGES } from "../content/learn-registry";
import { KNOWLEDGE_TOPICS } from "../content/knowledge";
import { countryAfterIn } from "./countries";
import type { Catalog, I18n, Lang, Product } from "./types";

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  robots: "index,follow" | "noindex,follow";
  alternates: Alternate[];
  ogLocale: string;
  /** Sichtbare H1 der Seite. Enthält das Haupt-Keyword, ohne die Marke. */
  h1: string;
}

const OG_LOCALE: Record<Lang, string> = { de: "de_DE", en: "en_GB" };

/** Kürzt an einer Wortgrenze und hängt "…" an. */
export function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const endsOnWord = clean.charAt(max - 1) === " ";
  const lastSpace = cut.lastIndexOf(" ");
  const kept = endsOnWord || lastSpace <= max * 0.6 ? cut : cut.slice(0, lastSpace);
  return `${kept.replace(/[\s,;:.–-]+$/, "")}…`;
}

/** Ganze Sätze, solange sie passen. Erst wenn schon der erste Satz zu lang ist, wird gekürzt. */
export function fitDescription(text: string, max: number = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const sentences = clean.split(/(?<=[.!?])\s+/);
  let out = "";
  for (const sentence of sentences) {
    const next = out === "" ? sentence : `${out} ${sentence}`;
    if (next.length > max) break;
    out = next;
  }
  return out.length >= 50 ? out : clip(clean, max);
}

export function pageTitle(page: string): string {
  return `${page} | ${SITE.brand}`;
}

interface Copy {
  /** H1 und Titelbestandteil. */
  h1: I18n;
  /** Abweichender Titel, falls die H1 für den Title-Tag zu lang ist. */
  title?: I18n;
  description: I18n;
}

const STATIC_COPY = {
  home: {
    h1: { de: "Krypto ausgeben: Karten und Börsen in der EU vergleichen", en: "Spend crypto: compare cards and exchanges in the EU" },
    description: {
      de: "Krypto-Karten und Börsen für die EU im Vergleich. Mit Erklärungen zu MiCA, DAC8, KYC und Steuern: verständlich, mit Quellen, ohne Hype.",
      en: "Compare crypto cards and exchanges for the EU. With plain explanations of MiCA, DAC8, KYC and tax: sourced, readable, no hype.",
    },
  },
  finder: {
    h1: { de: "Karten-Finder: in vier Fragen zur passenden Krypto-Karte", en: "Card finder: four questions to a matching crypto card" },
    title: { de: "Krypto-Karten-Finder: vier Fragen", en: "Crypto card finder: four questions" },
    description: {
      de: "Land, Verwahrung, Zahlungsmittel, Priorität: vier Fragen, bis zu drei passende Krypto-Karten und eine Börse. Mit offengelegter Reihenfolge.",
      en: "Country, custody, payment asset, priority: four questions, up to three matching crypto cards and an exchange. Ranking fully disclosed.",
    },
  },
  cards: {
    h1: { de: "Krypto-Kreditkarten und Debitkarten im Vergleich", en: "Crypto credit and debit cards compared" },
    title: { de: "Krypto-Kreditkarten im Vergleich", en: "Crypto cards compared" },
    description: {
      de: "Krypto-Karten nach Land, Verwahrung, Gebühren und Zulassung filtern. Die meisten sind Debitkarten. Ungeprüfte Angaben sind gekennzeichnet.",
      en: "Filter crypto cards by country, custody, fees and authorisation. Most are debit cards. Unverified data is clearly marked.",
    },
  },
  exchanges: {
    h1: { de: "Krypto-Börsen für die EU im Vergleich", en: "Crypto exchanges for the EU compared" },
    title: { de: "Krypto-Börsen im Vergleich", en: "Crypto exchanges compared" },
    description: {
      de: "Krypto-Börsen nach Land, Zulassung, Gebühren und Einzahlungsweg filtern. Mit Rechtsträger, Aufsicht und Sitz des Datenverantwortlichen.",
      en: "Filter crypto exchanges by country, authorisation, fees and deposit method. With legal entity, supervisor and data controller seat.",
    },
  },
  compare: {
    h1: { de: "Direktvergleich", en: "Side-by-side comparison" },
    description: { de: "Bis zu drei Produkte nebeneinander vergleichen.", en: "Compare up to three products side by side." },
  },
  calculator: {
    h1: { de: "Kostenrechner für Krypto-Karten", en: "Cost calculator for crypto cards" },
    description: {
      de: "Cashback minus Gebühren pro Jahr, mit deinen Umsätzen gerechnet. Fehlende Konditionen werden benannt und nicht geschätzt.",
      en: "Cashback minus fees per year, calculated with your spending. Missing terms are named, never estimated.",
    },
  },
  learnHub: {
    h1: { de: "Wissen: Regulierung, Datenweitergabe und Steuern", en: "Learn: regulation, data sharing and tax" },
    title: { de: "Krypto-Wissen: MiCA, DAC8, KYC, Steuern", en: "Crypto guides: MiCA, DAC8, KYC, tax" },
    description: {
      de: "Was MiCA, DAC8 und die Travel Rule für dich bedeuten und welche Daten Krypto-Anbieter weitergeben. Kurz erklärt, mit Primärquellen.",
      en: "What MiCA, DAC8 and the travel rule mean for you and which data crypto providers pass on. Short explanations with primary sources.",
    },
  },
  methodology: {
    h1: { de: "Methodik: So entsteht die Reihenfolge", en: "Methodology: how the ranking works" },
    title: { de: "Methodik und Gewichtung", en: "Methodology and weighting" },
    description: {
      de: "Sechs Faktoren, offengelegte Gewichte, Partnerbeziehung mit 10 %. So entsteht die Reihenfolge und so kennzeichnen wir ungeprüfte Daten.",
      en: "Six factors, disclosed weights, partner relationship at 10%. How the ranking works and how we mark unverified data.",
    },
  },
  countries: {
    h1: { de: "Krypto-Karten und Börsen nach Land", en: "Crypto cards and exchanges by country" },
    description: {
      de: "Verfügbarkeit, Aufsicht und Steuer-Grundzüge für Deutschland, Österreich, Frankreich, Spanien, Italien, die Niederlande, Malta und Zypern.",
      en: "Availability, supervision and tax basics for Germany, Austria, France, Spain, Italy, the Netherlands, Malta and Cyprus.",
    },
  },
  imprint: {
    h1: { de: "Impressum", en: "Imprint" },
    description: { de: "Anbieterkennzeichnung und Kontakt.", en: "Provider identification and contact." },
  },
  privacy: {
    h1: { de: "Datenschutzerklärung", en: "Privacy policy" },
    description: { de: "Welche Daten wir verarbeiten und welche nicht.", en: "Which data we process and which we do not." },
  },
  disclaimer: {
    h1: { de: "Hinweise und Haftungsausschluss", en: "Notices and disclaimer" },
    description: {
      de: "Keine Anlage-, Rechts- oder Steuerberatung. Hinweise zu Werbung, Partnerlinks und Datenstand.",
      en: "No investment, legal or tax advice. Notices on advertising, partner links and data status.",
    },
  },
  linkUnavailable: {
    h1: { de: "Partnerlink nicht verfügbar", en: "Partner link unavailable" },
    description: { de: "Für dein Land gibt es keinen Partnerlink.", en: "There is no partner link for your country." },
  },
} satisfies Record<string, Copy>;

/** Platz für den Seitenteil des Titels vor " | Marke". */
const PAGE_TITLE_MAX = TITLE_MAX - SITE.brand.length - 3;

/** Nimmt die erste Variante, die ungekürzt passt. Nur die letzte wird notfalls gekürzt. */
export function fitTitle(candidates: readonly string[]): string {
  return candidates.find((c) => c.length <= PAGE_TITLE_MAX) ?? clip(candidates[candidates.length - 1] ?? "", PAGE_TITLE_MAX);
}

const withoutParenthesis = (text: string) => text.replace(/\s*\([^)]*\)/g, "").trim();

/**
 * Name für Titel und H1. Börsen heißen im Datensatz oft wie der Anbieter ("Kraken");
 * dann wird der Typ ergänzt, damit sich Produkt- und Anbieterprofil unterscheiden.
 */
export function productSeoName(product: Pick<Product, "name" | "type">, lang: Lang): string {
  const base = withoutParenthesis(product.name);
  if (product.type !== "exchange" || /krypto|crypto|börse|exchange|app\b/i.test(base)) return base;
  return `${base} ${lang === "de" ? "Börse" : "exchange"}`;
}

interface PageCopy {
  h1: string;
  /** Varianten vom ausführlichsten zum kürzesten Titel. */
  titles: string[];
  description: string;
}

function copyFor(ref: PageRef, lang: Lang, catalog: Catalog): PageCopy {
  const fromCopy = (c: Copy): PageCopy => ({ h1: c.h1[lang], titles: [(c.title ?? c.h1)[lang]], description: c.description[lang] });
  switch (ref.kind) {
    case "home":
      return { ...fromCopy(STATIC_COPY.home), titles: [SITE.tagline[lang]] };
    case "finder":
      return fromCopy(STATIC_COPY.finder);
    case "hub":
      return fromCopy(STATIC_COPY[ref.hub]);
    case "compare":
      return fromCopy(STATIC_COPY.compare);
    case "calculator":
      return fromCopy(STATIC_COPY.calculator);
    case "learnHub":
      return fromCopy(STATIC_COPY.learnHub);
    case "methodology":
      return fromCopy(STATIC_COPY.methodology);
    case "countries":
      return fromCopy(STATIC_COPY.countries);
    case "linkUnavailable":
      return fromCopy(STATIC_COPY.linkUnavailable);
    case "legal":
      return fromCopy(STATIC_COPY[ref.page]);
    case "category": {
      const c = CATEGORIES.find((x) => x.id === ref.categoryId);
      if (!c) throw new RangeError(`Unbekannte Kategorie: ${ref.categoryId}`);
      return { h1: c.title[lang], titles: [c.title[lang], withoutParenthesis(c.title[lang])], description: c.intro[lang] };
    }
    case "learn": {
      const page = LEARN_PAGES.find((x) => x.id === ref.pageId);
      const topic = page ? KNOWLEDGE_TOPICS.find((t) => t.slug === page.topicSlug) : undefined;
      if (!page || !topic) throw new RangeError(`Wissensseite ohne Inhalt: ${ref.pageId}`);
      return { h1: topic.title[lang], titles: [page.seoTitle?.[lang] ?? topic.title[lang]], description: topic.summary[lang] };
    }
    case "product": {
      const p = catalog.products.find((x) => x.slug === ref.slug);
      if (!p) throw new RangeError(`Unbekanntes Produkt: ${ref.slug}`);
      const name = productSeoName(p, lang);
      return {
        h1: lang === "de" ? `${name}: Produktprofil` : `${name}: product profile`,
        titles:
          lang === "de"
            ? [`${name}: Gebühren, Zulassung, Länder`, `${name}: Gebühren und Zulassung`, `${name}: Produktprofil`]
            : [`${name}: fees, licence, countries`, `${name}: fees and licence`, `${name}: product profile`],
        description:
          lang === "de"
            ? `${name} im Profil: Gebühren, Verwahrung, Rechtsträger, Aufsicht und Verfügbarkeit in acht EU-Ländern. Ungeprüftes ist gekennzeichnet.`
            : `${name} profile: fees, custody, legal entity, supervisor and availability in eight EU countries. Unverified data is marked.`,
      };
    }
    case "provider": {
      const p = catalog.providers.find((x) => x.slug === ref.slug);
      if (!p) throw new RangeError(`Unbekannter Anbieter: ${ref.slug}`);
      return {
        h1: lang === "de" ? `${p.name}: Anbieterprofil` : `${p.name}: provider profile`,
        titles:
          lang === "de"
            ? [`${p.name}: Zulassung, Sitz, Datenschutz`, `${p.name}: Anbieterprofil`]
            : [`${p.name}: licence, seat, data protection`, `${p.name}: licence and data`, `${p.name}: provider profile`],
        description:
          lang === "de"
            ? `${p.name}: Rechtsträger, Zulassung und Aufsicht, Sitz des Datenverantwortlichen und alle Produkte im Überblick. Mit Quellen und Stand.`
            : `${p.name}: legal entities, authorisation and supervisor, data controller seat and all products at a glance. With sources and dates.`,
      };
    }
    case "country": {
      const c = catalog.countries.find((x) => x.code === ref.code);
      if (!c) throw new RangeError(`Unbekanntes Land: ${ref.code}`);
      const name = countryAfterIn(c, lang);
      return {
        h1: lang === "de" ? `Krypto-Karten und Börsen in ${name}` : `Crypto cards and exchanges in ${name}`,
        titles:
          lang === "de"
            ? [`Krypto-Karten in ${name}: Regeln und Steuern`, `Krypto-Karten in ${name}: Regeln, Steuern`, `Krypto-Karten in ${name}`]
            : [`Crypto cards in ${name}: rules and tax`, `Crypto cards in ${name}`],
        description:
          lang === "de"
            ? `Welche Krypto-Karten und Börsen in ${name} verfügbar sind, wer sie beaufsichtigt und was beim Bezahlen steuerlich gilt. Grundzüge mit Quellen.`
            : `Which crypto cards and exchanges are available in ${name}, who supervises them and what applies for tax when paying. Basics with sources.`,
      };
    }
  }
}

export function buildMeta(ref: PageRef, lang: Lang, catalog: Catalog): PageMeta {
  const copy = copyFor(ref, lang, catalog);
  const title = ref.kind === "home" ? `${SITE.brand}: ${copy.titles[0]}` : pageTitle(fitTitle(copy.titles));
  return {
    title,
    description: fitDescription(copy.description),
    canonical: absoluteUrl(pathFor(ref, lang)),
    robots: isIndexable(ref) ? "index,follow" : "noindex,follow",
    alternates: alternates(ref),
    ogLocale: OG_LOCALE[lang],
    h1: copy.h1,
  };
}

// ---------- Brotkrumen ----------

export interface Crumb {
  name: string;
  path: string;
}

const CRUMB_LABEL = {
  home: { de: "Start", en: "Home" },
  learn: { de: "Wissen", en: "Learn" },
  countries: { de: "Länder", en: "Countries" },
  providers: { de: "Anbieter", en: "Providers" },
} satisfies Record<string, I18n>;

/** Brotkrumen folgen dem Silo: Produkt → Hub des Typs, Wissensartikel → Wissens-Hub, Land → Länderübersicht. */
export function breadcrumbs(ref: PageRef, lang: Lang, catalog: Catalog): Crumb[] {
  const home: Crumb = { name: CRUMB_LABEL.home[lang], path: pathFor({ kind: "home" }, lang) };
  if (ref.kind === "home") return [home];
  const self: Crumb = { name: copyFor(ref, lang, catalog).h1, path: pathFor(ref, lang) };
  const hubCrumb = (hub: "cards" | "exchanges"): Crumb => ({
    name: STATIC_COPY[hub].title[lang],
    path: pathFor({ kind: "hub", hub }, lang),
  });
  switch (ref.kind) {
    case "learn":
      return [home, { name: CRUMB_LABEL.learn[lang], path: pathFor({ kind: "learnHub" }, lang) }, self];
    case "country":
      return [home, { name: CRUMB_LABEL.countries[lang], path: pathFor({ kind: "countries" }, lang) }, self];
    case "product": {
      const p = catalog.products.find((x) => x.slug === ref.slug);
      const hub = p?.type === "exchange" ? "exchanges" : "cards";
      return [home, hubCrumb(hub), { ...self, name: p?.name ?? self.name }];
    }
    case "category": {
      const c = CATEGORIES.find((x) => x.id === ref.categoryId);
      return [home, hubCrumb(c?.type === "exchange" ? "exchanges" : "cards"), self];
    }
    case "provider": {
      const p = catalog.providers.find((x) => x.slug === ref.slug);
      return [home, { ...self, name: p?.name ?? self.name }];
    }
    default:
      return [home, self];
  }
}

// ---------- Strukturierte Daten (JSON-LD) ----------

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.brand,
    legalName: OPERATOR.legalName,
    url: SITE.url,
    ...(OPERATOR.email ? { email: OPERATOR.email } : {}),
  };
}

export function websiteJsonLd(lang: Lang): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.brand,
    url: absoluteUrl(pathFor({ kind: "home" }, lang)),
    inLanguage: lang,
    publisher: { "@type": "Organization", name: SITE.brand, url: SITE.url },
  };
}

export function breadcrumbJsonLd(crumbs: readonly Crumb[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

/** Für Wissensseiten. `dateModified` ist der Stand des Inhalts (asOf), nicht das Build-Datum. */
export function articleJsonLd(pageId: string, lang: Lang): JsonLd {
  const page = LEARN_PAGES.find((x) => x.id === pageId);
  const topic = page ? KNOWLEDGE_TOPICS.find((t) => t.slug === page.topicSlug) : undefined;
  if (!page || !topic) throw new RangeError(`Wissensseite ohne Inhalt: ${pageId}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: topic.title[lang],
    description: fitDescription(topic.summary[lang]),
    inLanguage: lang,
    dateModified: topic.asOf,
    mainEntityOfPage: absoluteUrl(pathFor({ kind: "learn", pageId }, lang)),
    author: { "@type": "Organization", name: SITE.brand, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.brand, url: SITE.url },
    citation: topic.sources.map((s) => s.url),
  };
}

/** Nur verwenden, wenn Fragen und Antworten wörtlich so auf der Seite sichtbar sind. */
export function faqJsonLd(items: readonly { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.question, acceptedAnswer: { "@type": "Answer", text: i.answer } })),
  };
}

/** Sicher in <script type="application/ld+json"> einbetten (kein vorzeitiges Schließen des Tags). */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Namen der Hubs für Navigation und interne Links. */
export function hubLabel(hub: keyof typeof HUBS, lang: Lang): string {
  return STATIC_COPY[hub].title[lang];
}
