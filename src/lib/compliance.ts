/**
 * Pflichttexte und Kennzeichnungen. Formulierungen sind Entwürfe (Stufe 0.8),
 * finale Freigabe durch Peter. Keine Rechts- oder Steuerberatung.
 */
import type { AuthorizationType, Country, CustodyModel, FundingFlow, I18n, Lang } from "./types";
import { COMMERCIAL_WEIGHT, RANKING_VERSION } from "./ranking-config";

const pct = Math.round(COMMERCIAL_WEIGHT * 100);

export const AD_LABEL: Record<Lang, string> = { de: "Werbung", en: "Ad" };

/**
 * Label direkt am Affiliate-Link. Auf Länderseiten zusätzlich in der Landessprache,
 * z. B. "Ad · Publicité" (Empfehlung Rechtsrecherche FR/ES/IT/NL/MT/CY).
 */
export function adLabel(lang: Lang, country?: Pick<Country, "adLabel"> | null): string {
  const base = AD_LABEL[lang];
  if (!country || country.adLabel === base) return base;
  return `${base} · ${country.adLabel}`;
}

/** Kurztext unmittelbar unter jedem CTA mit Partnerlink. */
export const AFFILIATE_DISCLOSURE: I18n = {
  de: `Partnerlink: Eröffnest du darüber ein Konto, erhalten wir eine Provision. Für dich ändert sich der Preis nicht. Die Partnerbeziehung zählt mit ${pct} % zur Reihenfolge.`,
  en: `Partner link: if you open an account through it, we receive a commission. Your price does not change. The partner relationship counts for ${pct}% of the ranking.`,
};

/** Über jeder Ergebnisliste / Vergleichstabelle (UCPD-Ranking-Transparenz). */
export const RANKING_DISCLOSURE: I18n = {
  de: `So sortieren wir: Passung zu deinen Antworten, Gebühren, Cashback, Regulierung und Datenschutz, Prüfstand der Daten. Zu ${pct} % fließt ein, ob wir mit dem Anbieter eine Partnerschaft haben. Methodik ${RANKING_VERSION}.`,
  en: `How we sort: fit with your answers, fees, cashback, regulation and data protection, verification status of the data. Whether we have a partnership with the provider counts for ${pct}%. Methodology ${RANKING_VERSION}.`,
};

export const GENERAL_DISCLAIMER: I18n = {
  de: "Die Inhalte dienen der allgemeinen Information und dem Vergleich. Sie berücksichtigen nicht deine persönlichen Verhältnisse und sind keine Anlage-, Rechts- oder Steuerberatung und keine Aufforderung zum Kauf oder Verkauf von Kryptowerten. Kryptowerte können erheblich an Wert verlieren. Gebühren, Leistungen, Regulierung und Verfügbarkeit können sich ändern; maßgeblich sind die aktuellen Unterlagen des Anbieters. Als Werbung gekennzeichnete Links können eine Vergütung für uns auslösen.",
  en: "This content is for general information and comparison only. It does not consider your personal circumstances and is not investment, legal or tax advice, nor a solicitation to buy or sell crypto-assets. Crypto-assets can lose substantial value. Fees, features, regulation and availability can change; the provider's current documents prevail. Links marked as ads may result in compensation for us.",
};

export const TAX_DISCLAIMER: I18n = {
  de: "Steuerliche Grundzüge für Privatpersonen, Stand siehe Datum. Die Rechtslage kann sich ändern und dein Einzelfall kann abweichen. Keine Steuerberatung.",
  en: "Basic tax principles for private individuals, as of the date shown. The law can change and your case may differ. Not tax advice.",
};

export const QUIZ_DISCLAIMER: I18n = {
  de: "Der Karten-Finder filtert nach deinen Angaben. Er prüft weder deine finanzielle Situation noch deine Eignung und gibt keine Anlageempfehlung.",
  en: "The card finder filters by your answers. It does not assess your financial situation or suitability and gives no investment recommendation.",
};

export const AUTHORIZATION_LABEL: Record<AuthorizationType, I18n> = {
  casp_art63: { de: "MiCA-Zulassung als Krypto-Dienstleister (CASP)", en: "MiCA authorisation as crypto-asset service provider (CASP)" },
  art60_notified: { de: "Nach MiCA berechtigt als Bank (Art. 60)", en: "Entitled under MiCA as a bank (Art. 60)" },
  bank: { de: "Bank", en: "Bank" },
  emi: { de: "E-Geld-Institut (deckt Karte, nicht Krypto)", en: "E-money institution (covers the card, not crypto)" },
  none_found: { de: "Keine EU-Zulassung festgestellt", en: "No EU authorisation found" },
  unverified: { de: "Zulassung noch nicht geprüft", en: "Authorisation not yet verified" },
};

/** Was "keine EU-Zulassung" für Nutzer bedeutet. Pflicht neben jedem solchen Anbieter. */
export const NO_EU_AUTHORISATION_MEANING: I18n = {
  de: "Für dich heißt das: keine Aufsicht durch eine EU-Behörde nach MiCA, keine EU-Pflicht zur getrennten Verwahrung deiner Kryptowerte, Vertragspartner und Gerichtsstand möglicherweise außerhalb der EU. Im Streitfall kann die Durchsetzung deiner Ansprüche deutlich schwieriger sein.",
  en: "For you this means: no supervision by an EU authority under MiCA, no EU obligation to keep your crypto-assets segregated, contract partner and jurisdiction possibly outside the EU. Enforcing your claims in a dispute can be considerably harder.",
};

export const CUSTODY_LABEL: Record<CustodyModel, I18n> = {
  custodial: { de: "Verwahrt beim Anbieter", en: "Held by the provider" },
  self_custody: { de: "Eigene Wallet (Self-Custody)", en: "Own wallet (self-custody)" },
  hybrid: { de: "Gemischt", en: "Mixed" },
  not_applicable: { de: "—", en: "—" },
};

export const FUNDING_FLOW_LABEL: Record<FundingFlow, I18n> = {
  auto_sell_per_payment: { de: "Verkauft Krypto bei jeder Zahlung", en: "Sells crypto on every payment" },
  prefunded_fiat: { de: "Zahlt aus Euro-Guthaben", en: "Pays from euro balance" },
  prefunded_stablecoin: { de: "Zahlt aus vorgeladenem Stablecoin", en: "Pays from pre-loaded stablecoin" },
  credit_line: { de: "Kredit gegen Krypto-Sicherheit", en: "Credit against crypto collateral" },
  mixed: { de: "Wählbar: Euro oder Krypto", en: "Selectable: euro or crypto" },
  unknown: { de: "Nicht geprüft", en: "Not verified" },
};

export const FUNDING_FLOW_TAX_HINT: I18n = {
  de: "Wird bei der Zahlung Krypto verkauft oder hingegeben, ist das in den meisten Startländern ein steuerlich relevanter Vorgang, auch bei Stablecoins. Ausnahme in der Regel: Niederlande (Box 3). Details auf der Länderseite.",
  en: "If crypto is sold or handed over at payment, this is a tax-relevant event in most launch countries, including for stablecoins. Usual exception: the Netherlands (Box 3). Details on the country page.",
};

export const TRUSTPILOT_NOTE: I18n = {
  de: "Bewertungen von Trustpilot, Stand siehe Datum. Wir prüfen nicht, ob die Bewertungen von echten Kunden stammen; Trustpilot beschreibt sein Verfahren auf trustpilot.com. Wir haben mit einigen Anbietern Partnerverträge.",
  en: "Ratings from Trustpilot, as of the date shown. We do not verify whether reviews come from real customers; Trustpilot describes its process on trustpilot.com. We have partner agreements with some providers.",
};
