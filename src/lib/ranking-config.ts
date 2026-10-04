/**
 * Ranking-Methodik — einzige Quelle der Wahrheit.
 * Die Methodik-Seite rendert aus describeMethodology(), damit veröffentlichte
 * und tatsächlich verwendete Gewichtung nie auseinanderlaufen.
 *
 * Entscheidung (2026-10-01): Die Partnerbeziehung (Affiliate-Link aktiv)
 * fließt mit offengelegtem Gewicht COMMERCIAL_WEIGHT ins Ranking ein.
 * UCPD/Omnibus: Hinweis muss in unmittelbarer Nähe der Ergebnisse stehen
 * (siehe compliance.ts → rankingDisclosure).
 */
import type { I18n, ProductType } from "./types";
import type { Priority } from "./quiz";

export const RANKING_VERSION = "2026-10-01.1";

export type Factor = "fit" | "cost" | "rewards" | "regulation" | "dataQuality" | "commercial";
export const FACTORS: readonly Factor[] = ["fit", "cost", "rewards", "regulation", "dataQuality", "commercial"];

export type WeightProfile = Readonly<Record<Factor, number>>;

/** Anteil der Partnerbeziehung am Gesamtscore. Änderung = neue RANKING_VERSION. */
export const COMMERCIAL_WEIGHT = 0.1;

/** Wert für unbekannte Daten: neutral, nie Bestnote. */
export const NEUTRAL = 0.5;

/** Normierungsgrenzen: Wert >= Grenze ergibt Teilscore 0. */
export const NORMALIZATION = {
  fxMarkupPct: 3,
  monthlyEur: 10,
  issuanceEur: 50,
  spotTakerPct: 1.5,
  /** Cashback >= Grenze ergibt Teilscore 1. */
  cashbackPct: 3,
} as const;

const CARD_WEIGHTS: Readonly<Record<Priority, WeightProfile>> = {
  low_fees: { fit: 0.3, cost: 0.35, rewards: 0.05, regulation: 0.15, dataQuality: 0.05, commercial: COMMERCIAL_WEIGHT },
  cashback: { fit: 0.3, cost: 0.15, rewards: 0.3, regulation: 0.1, dataQuality: 0.05, commercial: COMMERCIAL_WEIGHT },
  no_lockup: { fit: 0.35, cost: 0.2, rewards: 0.1, regulation: 0.2, dataQuality: 0.05, commercial: COMMERCIAL_WEIGHT },
  regulation_privacy: { fit: 0.3, cost: 0.15, rewards: 0.05, regulation: 0.35, dataQuality: 0.05, commercial: COMMERCIAL_WEIGHT },
};

const EXCHANGE_LOW_FEES: WeightProfile = {
  fit: 0.3, cost: 0.35, rewards: 0, regulation: 0.2, dataQuality: 0.05, commercial: COMMERCIAL_WEIGHT,
};
const EXCHANGE_REGULATION: WeightProfile = {
  fit: 0.25, cost: 0.15, rewards: 0, regulation: 0.45, dataQuality: 0.05, commercial: COMMERCIAL_WEIGHT,
};
const EXCHANGE_DEFAULT: WeightProfile = {
  fit: 0.3, cost: 0.25, rewards: 0, regulation: 0.3, dataQuality: 0.05, commercial: COMMERCIAL_WEIGHT,
};

export function weightsFor(type: ProductType, priority: Priority): WeightProfile {
  if (type === "card") return CARD_WEIGHTS[priority];
  if (priority === "low_fees") return EXCHANGE_LOW_FEES;
  if (priority === "regulation_privacy") return EXCHANGE_REGULATION;
  return EXCHANGE_DEFAULT;
}

/** Alle Profile, für Tests und Methodik-Seite. */
export function allProfiles(): { type: ProductType; priority: Priority; weights: WeightProfile }[] {
  const priorities: Priority[] = ["low_fees", "cashback", "no_lockup", "regulation_privacy"];
  const out: { type: ProductType; priority: Priority; weights: WeightProfile }[] = [];
  for (const type of ["card", "exchange"] as const) {
    for (const priority of priorities) out.push({ type, priority, weights: weightsFor(type, priority) });
  }
  return out;
}

export const FACTOR_LABELS: Readonly<Record<Factor, I18n>> = {
  fit: { de: "Passung zu deinen Antworten", en: "Fit with your answers" },
  cost: { de: "Gebühren", en: "Fees" },
  rewards: { de: "Cashback und Belohnungen", en: "Cashback and rewards" },
  regulation: { de: "Regulierung und Datenschutz", en: "Regulation and data protection" },
  dataQuality: { de: "Prüfstand unserer Daten", en: "Verification status of our data" },
  commercial: { de: "Partnerbeziehung (Provision)", en: "Partner relationship (commission)" },
};

export const FACTOR_DESCRIPTIONS: Readonly<Record<Factor, I18n>> = {
  fit: {
    de: "Verwahrungsmodell passend zu deinem Standort der Coins, Zahlungsquelle passend zu deinem gewünschten Zahlungsmittel. Abzug, wenn ein Produkt eingestellt wird oder Staking verlangt, obwohl du das ausschließt.",
    en: "Custody model matching where your coins are, funding source matching how you want to pay. Deduction if a product is being discontinued or requires staking although you excluded it.",
  },
  cost: {
    de: `Fremdwährungsaufschlag (0 % = beste Note, ab ${NORMALIZATION.fxMarkupPct} % = 0), Monatsgebühr (ab ${NORMALIZATION.monthlyEur} € = 0), Ausgabegebühr der physischen Karte, ersatzweise der virtuellen (ab ${NORMALIZATION.issuanceEur} € = 0); bei Börsen die Spot-Taker-Gebühr bzw. der Spread (ab ${NORMALIZATION.spotTakerPct} % = 0). Unbekannte Werte zählen neutral (50 %).`,
    en: `FX markup (0% = best, ${NORMALIZATION.fxMarkupPct}% or more = 0), monthly fee (${NORMALIZATION.monthlyEur} € or more = 0), issuance fee of the physical card, otherwise the virtual one (${NORMALIZATION.issuanceEur} € or more = 0); for exchanges the spot taker fee or spread (${NORMALIZATION.spotTakerPct}% or more = 0). Unknown values count as neutral (50%).`,
  },
  rewards: {
    de: `Cashback ohne Staking-Pflicht; ab ${NORMALIZATION.cashbackPct} % = beste Note. Höheres Cashback mit Token-Lock-up zählt nur, wenn du Lock-ups nicht ausgeschlossen hast. Unbekannt = neutral.`,
    en: `Cashback without staking requirement; ${NORMALIZATION.cashbackPct}% or more = best. Higher cashback that needs a token lock-up only counts if you did not exclude lock-ups. Unknown = neutral.`,
  },
  regulation: {
    de: "70 %: Zulassung des maßgeblichen Rechtsträgers. Bei verwahrten Produkten ist das die Gesellschaft, die deine Kryptowerte hält oder tauscht; bei Self-Custody-Karten der Kartenherausgeber. MiCA-Zulassung, Art. 60 oder Bank = voll, E-Geld-Institut = 70 %, ungeprüft = 40 %, keine EU-Zulassung festgestellt = 0. 30 %: Datenverantwortlicher im EWR (ja = voll, unbekannt = 50 %, nein = 0).",
    en: "70%: authorisation of the relevant legal entity. For custodial products this is the company that holds or exchanges your crypto; for self-custody cards the card issuer. MiCA authorisation, Art. 60 or bank = full, e-money institution = 70%, unverified = 40%, no EU authorisation found = 0. 30%: data controller in the EEA (yes = full, unknown = 50%, no = 0).",
  },
  dataQuality: {
    de: "Primärquelle geprüft = voll, Sekundärquelle = 60 %, ungeprüft = 30 %.",
    en: "Primary source verified = full, secondary source = 60%, unverified = 30%.",
  },
  commercial: {
    de: `Wir erhalten bei einigen Anbietern eine Provision. Besteht für dein Land ein aktiver Partnerlink, fließt das mit ${Math.round(COMMERCIAL_WEIGHT * 100)} % in die Reihenfolge ein. Die übrigen ${Math.round((1 - COMMERCIAL_WEIGHT) * 100)} % sind unabhängig davon.`,
    en: `We receive a commission from some providers. If an active partner link exists for your country, this counts for ${Math.round(COMMERCIAL_WEIGHT * 100)}% of the ranking. The remaining ${Math.round((1 - COMMERCIAL_WEIGHT) * 100)}% are independent of it.`,
  },
};

export interface MethodologyRow {
  factor: Factor;
  label: I18n;
  description: I18n;
  /** Gewicht je Profil in Prozent. */
  weights: { type: ProductType; priority: Priority; percent: number }[];
}

export function describeMethodology(): { version: string; rows: MethodologyRow[] } {
  const profiles = allProfiles();
  return {
    version: RANKING_VERSION,
    rows: FACTORS.map((factor) => ({
      factor,
      label: FACTOR_LABELS[factor],
      description: FACTOR_DESCRIPTIONS[factor],
      weights: profiles.map((p) => ({
        type: p.type,
        priority: p.priority,
        percent: Math.round(p.weights[factor] * 100),
      })),
    })),
  };
}
