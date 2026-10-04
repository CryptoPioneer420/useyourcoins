/**
 * Kategorieseiten (SEO-Einstiege), definiert als Filter-Voreinstellungen.
 * Listen auf Kategorieseiten sind alphabetisch sortiert, ohne Ranking.
 * Keine "Testsieger"- oder "Testbericht"-Begriffe: Es gibt keine eigenen Tests.
 */
import type { I18n, Lang, ProductType } from "./types";
import type { ProductFilters } from "./filters";

export interface CategoryPreset {
  id: string;
  slug: I18n;
  type: ProductType;
  title: I18n;
  intro: I18n;
  filters: ProductFilters;
}

export const CATEGORIES: readonly CategoryPreset[] = [
  {
    id: "self-custody-cards",
    slug: { de: "self-custody-karten", en: "self-custody-cards" },
    type: "card",
    title: { de: "Krypto-Karten mit eigener Wallet (Self-Custody)", en: "Crypto cards with your own wallet (self-custody)" },
    intro: {
      de: "Bei diesen Karten bleiben die Schlüssel bei dir; die Karte darf nur einen freigegebenen Betrag nutzen. Kartenausgabe und Umtausch laufen trotzdem über regulierte Partner.",
      en: "With these cards you keep the keys; the card can only use an approved amount. Card issuing and conversion still run through regulated partners.",
    },
    filters: { type: "card", custody: ["self_custody"] },
  },
  {
    id: "stablecoin-cards",
    slug: { de: "stablecoin-karten", en: "stablecoin-cards" },
    type: "card",
    title: { de: "Krypto-Karten für Stablecoins", en: "Crypto cards for stablecoins" },
    intro: {
      de: "Karten, die direkt mit Stablecoins wie USDC, EURC oder EURe bezahlen. Auch das ist steuerlich in den meisten Ländern ein Verkauf.",
      en: "Cards that pay directly with stablecoins such as USDC, EURC or EURe. In most countries this still counts as a sale for tax purposes.",
    },
    filters: { type: "card", anyStablecoin: true, includeUnknown: false },
  },
  {
    id: "no-staking-cards",
    slug: { de: "karten-ohne-staking", en: "cards-without-staking" },
    type: "card",
    title: { de: "Krypto-Karten ohne Staking-Pflicht", en: "Crypto cards without staking requirement" },
    intro: {
      de: "Karten, bei denen du für Konditionen keine Token sperren musst. Unbekannte Bedingungen sind markiert.",
      en: "Cards where you do not have to lock tokens for the terms. Unknown conditions are marked.",
    },
    filters: { type: "card", noStaking: true },
  },
  {
    id: "euro-balance-cards",
    slug: { de: "karten-mit-euro-guthaben", en: "cards-with-euro-balance" },
    type: "card",
    title: { de: "Karten, die aus Euro-Guthaben zahlen", en: "Cards that pay from a euro balance" },
    intro: {
      de: "Hier wird nicht bei jeder Zahlung Krypto verkauft. Steuerlich relevant ist der Verkauf beim Aufladen.",
      en: "These do not sell crypto on every payment. What matters for tax is the sale when you top up.",
    },
    filters: { type: "card", fundingFlows: ["prefunded_fiat"] },
  },
  {
    id: "eu-regulated-exchanges",
    slug: { de: "eu-regulierte-boersen", en: "eu-regulated-exchanges" },
    type: "exchange",
    title: { de: "Krypto-Börsen mit EU-Zulassung", en: "Crypto exchanges with EU authorisation" },
    intro: {
      de: "Börsen, deren maßgeblicher Rechtsträger eine MiCA-Zulassung hat oder als Bank nach Art. 60 berechtigt ist.",
      en: "Exchanges whose relevant legal entity holds a MiCA authorisation or is entitled as a bank under Art. 60.",
    },
    filters: { type: "exchange", euAuthorisedOnly: true, includeUnknown: false },
  },
  {
    id: "sepa-exchanges",
    slug: { de: "boersen-mit-sepa", en: "exchanges-with-sepa" },
    type: "exchange",
    title: { de: "Krypto-Börsen mit SEPA-Einzahlung", en: "Crypto exchanges with SEPA deposit" },
    intro: {
      de: "Börsen, bei denen wir die Euro-Einzahlung per SEPA geprüft haben.",
      en: "Exchanges where we have verified euro deposits via SEPA.",
    },
    filters: { type: "exchange", depositMethods: ["sepa"], includeUnknown: false },
  },
];

export function categoryBySlug(lang: Lang, slug: string): CategoryPreset | null {
  return CATEGORIES.find((c) => c.slug[lang] === slug) ?? null;
}
