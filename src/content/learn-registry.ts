/**
 * Register aller Wissensseiten unter /:lang/learn/:slug mit Keyword-Zuordnung.
 * Grundlage: Semrush-Matrix vom 2026-10-04 (Datenbanken de und us), bereinigt um
 * Kannibalisierung und Suchanfragen mit Unternehmens-Intent.
 *
 * Regeln:
 * - Eine Seite je Suchabsicht. Ein Haupt-Keyword je Seite.
 * - Nur status "published" erscheint in Navigation, Sitemap und interner Verlinkung.
 * - "published" setzt einen Eintrag in KNOWLEDGE_TOPICS voraus (topicSlug).
 * - Steuer- und Meldethemen erklären, was passiert. Sie leiten nicht zur Umgehung an.
 */
import type { I18n, Lang } from "../lib/types";

export type LearnCluster = "basics" | "regulation" | "privacy" | "tax";
export type LearnStatus = "published" | "planned" | "needs_decision";

export interface LearnPage {
  id: string;
  slug: I18n;
  cluster: LearnCluster;
  status: LearnStatus;
  /** Slug in KNOWLEDGE_TOPICS. Pflicht bei status "published". */
  topicSlug: string | null;
  primaryKeyword: I18n;
  /** false = Annahme ohne Semrush-Beleg, vor dem Schreiben prüfen. */
  keywordFromSemrush: Record<Lang, boolean>;
  secondaryKeywords: Record<Lang, readonly string[]>;
  /** 1 = zuerst schreiben. */
  priority: 1 | 2 | 3;
  /** Kurzer Titel für den Title-Tag (≤ 45 Zeichen, mit Haupt-Keyword). null = Titel des Inhalts passt. */
  seoTitle: I18n | null;
  /** Arbeitstitel für geplante Seiten. */
  workingTitle: I18n | null;
  note: string | null;
}

export const LEARN_PAGES: readonly LearnPage[] = [
  {
    id: "mica",
    slug: { de: "mica-verordnung-krypto", en: "mica-regulation-crypto" },
    cluster: "regulation",
    status: "published",
    topicSlug: "mica",
    primaryKeyword: { de: "mica krypto regulierung", en: "mica crypto" },
    keywordFromSemrush: { de: true, en: true },
    secondaryKeywords: { de: ["mica eu krypto", "mica verordnung"], en: ["mica regulation", "mica crypto regulation"] },
    priority: 1,
    seoTitle: { de: "MiCA-Verordnung: Regeln für Krypto-Anbieter", en: "MiCA regulation: rules for crypto providers" },
    workingTitle: null,
    note: null,
  },
  {
    id: "dac8",
    slug: { de: "dac8-meldepflicht-krypto", en: "dac8-crypto-reporting" },
    cluster: "regulation",
    status: "published",
    topicSlug: "dac8",
    primaryKeyword: { de: "dac8 krypto", en: "dac8 crypto reporting requirements" },
    keywordFromSemrush: { de: true, en: true },
    secondaryKeywords: {
      de: ["dac8 deutschland krypto meldepflicht 2026", "dac8 krypto rückwirkend"],
      en: ["dac8 crypto", "dac8 reporting 2026"],
    },
    priority: 1,
    seoTitle: { de: "DAC8: Meldepflicht für Krypto-Anbieter", en: "DAC8: crypto reporting to tax authorities" },
    workingTitle: null,
    note: "\"dac8 compliance solutions\" ist eine Unternehmensanfrage (Software für Anbieter) und kein Ziel-Keyword.",
  },
  {
    id: "travel-rule",
    slug: { de: "travel-rule-krypto", en: "crypto-travel-rule" },
    cluster: "regulation",
    status: "published",
    topicSlug: "travel-rule",
    primaryKeyword: { de: "travel rule krypto europa", en: "crypto travel rule" },
    keywordFromSemrush: { de: true, en: true },
    secondaryKeywords: { de: ["travel rule krypto"], en: ["travel rule crypto", "fatf travel rule crypto"] },
    priority: 1,
    seoTitle: { de: "Travel Rule für Krypto in der EU", en: "Crypto travel rule in the EU" },
    workingTitle: null,
    note: null,
  },
  {
    id: "custody",
    slug: { de: "verwahrung-anbieter-oder-eigene-wallet", en: "custodial-vs-self-custody" },
    cluster: "basics",
    status: "published",
    topicSlug: "custody",
    primaryKeyword: { de: "self custody krypto", en: "custodial vs self custody" },
    keywordFromSemrush: { de: false, en: false },
    secondaryKeywords: { de: ["eigene wallet oder börse"], en: ["self custody crypto card"] },
    priority: 2,
    seoTitle: { de: "Verwahrung: Anbieter oder eigene Wallet?", en: "Custodial vs self-custody crypto" },
    workingTitle: null,
    note: "Keyword-Daten fehlen in der Matrix, mit Semrush nachziehen.",
  },
  {
    id: "stablecoins",
    slug: { de: "stablecoins-usdc-eurc-usdt", en: "stablecoins-usdc-eurc-usdt" },
    cluster: "basics",
    status: "published",
    topicSlug: "stablecoins",
    primaryKeyword: { de: "stablecoin mica", en: "mica stablecoin" },
    keywordFromSemrush: { de: false, en: false },
    secondaryKeywords: { de: ["usdt mica", "usdc eurc unterschied"], en: ["usdt mica", "usdc vs eurc"] },
    priority: 2,
    seoTitle: null,
    workingTitle: null,
    note: "Keyword-Daten fehlen in der Matrix, mit Semrush nachziehen.",
  },
  {
    id: "how-crypto-cards-work",
    slug: { de: "wie-krypto-karten-funktionieren", en: "how-crypto-cards-work" },
    cluster: "basics",
    status: "published",
    topicSlug: "how-crypto-cards-work",
    primaryKeyword: { de: "wie funktioniert eine krypto kreditkarte", en: "how do crypto cards work" },
    keywordFromSemrush: { de: false, en: false },
    secondaryKeywords: { de: ["krypto debitkarte"], en: ["crypto debit card explained"] },
    priority: 2,
    seoTitle: { de: "So funktioniert eine Krypto-Karte", en: "How crypto cards work" },
    workingTitle: null,
    note: "Keyword-Daten fehlen in der Matrix, mit Semrush nachziehen.",
  },
  {
    id: "what-providers-report",
    slug: { de: "was-krypto-anbieter-melden", en: "what-crypto-exchanges-report" },
    cluster: "privacy",
    status: "planned",
    topicSlug: null,
    primaryKeyword: { de: "krypto meldung finanzamt", en: "crypto exchange reporting requirements" },
    keywordFromSemrush: { de: true, en: true },
    secondaryKeywords: {
      de: ["awv meldepflicht kryptobörse", "krypto börse meldet finanzamt"],
      en: ["crypto exchange reporting requirements 2026", "eu amlr rules crypto kyc threshold 2026"],
    },
    priority: 1,
    seoTitle: null,
    workingTitle: {
      de: "Wer sieht was? Welche Daten Krypto-Anbieter an Behörden weitergeben",
      en: "Who sees what? Which data crypto providers pass to authorities",
    },
    note: "Kernseite der Differenzierung: KYC ist nicht gleich Meldung. Übersicht aller Datenwege (DAC8, Verdachtsmeldung, Auskunftsersuchen, Travel Rule, AWV) mit Schaubild. Verlinkt auf dac8 und travel-rule, ersetzt sie nicht.",
  },
  {
    id: "paying-with-crypto-tax",
    slug: { de: "mit-krypto-bezahlen-steuern", en: "tax-when-paying-with-crypto" },
    cluster: "tax",
    status: "planned",
    topicSlug: null,
    primaryKeyword: { de: "krypto kreditkarte steuern", en: "if i buy something with crypto do i pay tax" },
    keywordFromSemrush: { de: true, en: true },
    secondaryKeywords: { de: ["mit krypto bezahlen steuern"], en: ["crypto card taxes", "crypto credit card taxes"] },
    priority: 1,
    seoTitle: null,
    workingTitle: {
      de: "Mit Krypto bezahlen: was steuerlich passiert",
      en: "Paying with crypto: what happens for tax",
    },
    note: "Fasst zwei von Lovable getrennt geplante Seiten zusammen (gleiche Suchabsicht). Inhalt je Land kommt aus payment-tax.ts, Details auf den Länderseiten.",
  },
  {
    id: "cashback-tax",
    slug: { de: "krypto-cashback-steuer", en: "crypto-cashback-tax" },
    cluster: "tax",
    status: "planned",
    topicSlug: null,
    primaryKeyword: { de: "krypto cashback steuer", en: "crypto cashback tax" },
    keywordFromSemrush: { de: true, en: false },
    secondaryKeywords: { de: ["cashback krypto versteuern"], en: ["crypto card rewards tax"] },
    priority: 2,
    seoTitle: null,
    workingTitle: { de: "Krypto-Cashback und Steuern: die Grundzüge", en: "Crypto cashback and tax: the basics" },
    note: "Rechtslage je Land uneinheitlich. Nur Grundzüge mit Quelle und Stand, sonst nicht veröffentlichen.",
  },
  {
    id: "stablecoin-tax",
    slug: { de: "stablecoin-steuern", en: "stablecoin-tax" },
    cluster: "tax",
    status: "planned",
    topicSlug: null,
    primaryKeyword: { de: "stablecoin steuern", en: "stablecoin taxes" },
    keywordFromSemrush: { de: true, en: true },
    secondaryKeywords: { de: ["krypto in stablecoins steuer"], en: ["convert crypto to stablecoin tax"] },
    priority: 2,
    seoTitle: null,
    workingTitle: { de: "Stablecoins und Steuern: Tausch und Zahlung", en: "Stablecoins and tax: swapping and paying" },
    note: null,
  },
  {
    id: "check-provider-licence",
    slug: { de: "krypto-anbieter-zulassung-pruefen", en: "check-crypto-provider-licence" },
    cluster: "regulation",
    status: "planned",
    topicSlug: null,
    primaryKeyword: { de: "krypto börse lizenz prüfen", en: "mica crypto license" },
    keywordFromSemrush: { de: false, en: true },
    secondaryKeywords: { de: ["esma register krypto"], en: ["mica casp register", "is my exchange mica licensed"] },
    priority: 2,
    seoTitle: null,
    workingTitle: {
      de: "Zulassung prüfen: So findest du deinen Anbieter im ESMA-Register",
      en: "Check the licence: how to find your provider in the ESMA register",
    },
    note: "\"mica crypto license\" suchen überwiegend Unternehmen, die eine Zulassung wollen. Seite aus Nutzersicht schreiben, Erwartung an Traffic niedrig halten.",
  },
  {
    id: "gdpr-rights",
    slug: { de: "datenschutz-rechte-krypto-anbieter", en: "gdpr-rights-crypto-providers" },
    cluster: "privacy",
    status: "planned",
    topicSlug: null,
    primaryKeyword: { de: "krypto datenschutz", en: "crypto exchange gdpr" },
    keywordFromSemrush: { de: false, en: false },
    secondaryKeywords: { de: ["dsgvo auskunft kryptobörse"], en: ["gdpr data request crypto exchange"] },
    priority: 3,
    seoTitle: null,
    workingTitle: {
      de: "Deine Datenschutzrechte gegenüber Krypto-Anbietern",
      en: "Your data protection rights towards crypto providers",
    },
    note: "Auskunft nach Art. 15 DSGVO, Verantwortlicher, Übermittlung in Drittländer.",
  },
  {
    id: "no-kyc",
    slug: { de: "krypto-ohne-kyc", en: "crypto-without-kyc" },
    cluster: "privacy",
    status: "needs_decision",
    topicSlug: null,
    primaryKeyword: { de: "krypto börse ohne kyc", en: "crypto exchange without kyc" },
    keywordFromSemrush: { de: true, en: false },
    secondaryKeywords: { de: ["krypto kreditkarte ohne kyc"], en: ["no kyc crypto card"] },
    priority: 1,
    seoTitle: null,
    workingTitle: {
      de: "Krypto ohne KYC: was in der EU rechtlich und praktisch gilt",
      en: "Crypto without KYC: what applies in the EU, legally and in practice",
    },
    note: "Einziges Keyword der Matrix mit nennenswertem Volumen (DE 390 + 90). Suchabsicht ist ein Anbieter ohne Identitätsprüfung, den wir nicht liefern. Nur als Aufklärungsseite, ohne Anbieterliste, ohne Partnerlink auf der Seite. Eine Seite für Börse und Karte, keine zwei. Freigabe durch Peter offen.",
  },
];

export function publishedLearnPages(): LearnPage[] {
  return LEARN_PAGES.filter((p) => p.status === "published");
}

/** Liefert nur veröffentlichte Seiten, damit geplante Slugs zu 404 führen. */
export function learnPageBySlug(lang: Lang, slug: string): LearnPage | null {
  return publishedLearnPages().find((p) => p.slug[lang] === slug) ?? null;
}

export function learnPageByTopic(topicSlug: string): LearnPage | null {
  return LEARN_PAGES.find((p) => p.topicSlug === topicSlug) ?? null;
}
