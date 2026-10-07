/**
 * Schnellpfade der Startseite: fünf große Einstiege, die vorgefiltert in den Hub
 * oder mit vorbelegter Priorität in den Finder führen.
 *
 * Regeln:
 * - Labels beschreiben Eigenschaften, keine Eignung ("EU-reguliert", nicht "sicher").
 * - Ein Pfad zeigt nur, was die Daten tragen. dataStatus sagt, wie gut sie das heute tun.
 *   Unbekannte Werte erscheinen weiter als "nicht geprüft", sie werden nie stillschweigend ausgeschlossen.
 * - Kein Pfad führt zu Anonymität oder "ohne KYC".
 * - Die Umsetzung der Filter als URL-Parameter liegt in der App (src/app), nicht hier.
 */
import type { CountryCode, I18n } from "./types";
import type { ProductFilters } from "./filters";
import type { Goal, Priority, QuizAction } from "./quiz";
import type { HubId } from "./routes";

export type QuickPathId = "everyday_cashback" | "eu_regulated" | "self_custody" | "low_fees" | "fiat_ramp";

/** ready = Daten tragen den Filter, partial = Teile fehlen, missing = Daten werden erst recherchiert. */
export type QuickPathDataStatus = "ready" | "partial" | "missing";

export type QuickPathTarget =
  | { kind: "hub"; hub: HubId; filters: ProductFilters }
  | { kind: "finder"; goal: Goal; priority: Priority };

export interface QuickPath {
  id: QuickPathId;
  label: I18n;
  hint: I18n;
  target: QuickPathTarget;
  dataStatus: QuickPathDataStatus;
}

export const QUICK_PATHS: readonly QuickPath[] = [
  {
    id: "everyday_cashback",
    label: { de: "Alltag mit Cashback", en: "Everyday with cashback" },
    hint: {
      de: "Karten mit Cashback und den Bedingungen, unter denen er gezahlt wird",
      en: "Cards with cashback and the conditions under which it is paid",
    },
    target: { kind: "finder", goal: "card", priority: "cashback" },
    dataStatus: "missing",
  },
  {
    id: "eu_regulated",
    label: { de: "EU-reguliert", en: "EU-regulated" },
    hint: {
      de: "Nur Anbieter mit MiCA-Zulassung, Bank oder Anzeige nach Art. 60",
      en: "Only providers with MiCA authorisation, a bank licence or an Art. 60 notification",
    },
    target: { kind: "hub", hub: "cards", filters: { euAuthorisedOnly: true } },
    dataStatus: "ready",
  },
  {
    id: "self_custody",
    label: { de: "Eigene Wallet", en: "Your own wallet" },
    hint: {
      de: "Du behältst die Schlüssel, die Karte nutzt nur einen freigegebenen Betrag",
      en: "You keep the keys; the card only uses an approved amount",
    },
    target: { kind: "hub", hub: "cards", filters: { custody: ["self_custody"] } },
    dataStatus: "ready",
  },
  {
    id: "low_fees",
    label: { de: "Niedrige Gebühren", en: "Low fees" },
    hint: {
      de: "Karten nach Gebühren, auch im Ausland, soweit geprüft",
      en: "Cards by fees, also abroad, as far as verified",
    },
    target: { kind: "finder", goal: "card", priority: "low_fees" },
    dataStatus: "missing",
  },
  {
    id: "fiat_ramp",
    label: { de: "Euro ein- und auszahlen", en: "Euro in and out" },
    hint: {
      de: "Börsen mit Einzahlung per Überweisung (SEPA), Auszahlungswege folgen",
      en: "Exchanges with bank transfer (SEPA) deposits, withdrawal methods to follow",
    },
    target: { kind: "hub", hub: "exchanges", filters: { depositMethods: ["sepa"] } },
    dataStatus: "partial",
  },
];

export function quickPathById(id: string): QuickPath | null {
  return QUICK_PATHS.find((p) => p.id === id) ?? null;
}

/** Quiz-Aktion für Finder-Pfade, sonst null (Hub-Pfade öffnen den Hub mit Filtern). */
export function quickPathQuizAction(path: QuickPath, country?: CountryCode): QuizAction | null {
  if (path.target.kind !== "finder") return null;
  return { type: "START", goal: path.target.goal, priority: path.target.priority, ...(country ? { country } : {}) };
}
