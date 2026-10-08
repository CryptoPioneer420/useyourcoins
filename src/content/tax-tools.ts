/**
 * Steuer-Tool-Box (Cluster H) auf der DAC8-Seite.
 *
 * Regeln:
 * - Keine eigene Vergleichsseite, nur eine neutrale Box am Ende der DAC8-Seite.
 * - Die Box erscheint erst, wenn mindestens TAX_TOOLS_MIN_TO_SHOW Tools nach den fünf Kriterien
 *   geprüft sind (shouldShowTaxToolBox). Solange TAX_TOOLS leer ist, rendert die App nichts.
 * - Reihenfolge alphabetisch, kein Ranking, keine Testnoten, keine Steueraussagen.
 * - Kriterienwerte tragen eine Quelle. null = nicht geprüft, nie geschätzt.
 * - Affiliate-Links werden als Werbung gekennzeichnet (affiliateDisclosure).
 */
import type { I18n } from "../lib/types";

export type TaxToolCriterionId =
  | "import_sources"
  | "transfer_matching"
  | "country_coverage"
  | "export_and_method"
  | "data_handling_pricing";

export interface TaxToolCriterion {
  id: TaxToolCriterionId;
  label: I18n;
  /** Frage, die der Anbieter-Beleg beantworten muss. */
  question: I18n;
}

export const TAX_TOOL_CRITERIA: readonly TaxToolCriterion[] = [
  {
    id: "import_sources",
    label: { de: "Datenimport", en: "Data import" },
    question: {
      de: "Welche Börsen und Wallets lassen sich per Schnittstelle (API) oder CSV-Datei einlesen?",
      en: "Which exchanges and wallets can be imported through an interface (API) or a CSV file?",
    },
  },
  {
    id: "transfer_matching",
    label: { de: "Abgleich von Transfers", en: "Transfer matching" },
    question: {
      de: "Erkennt das Tool Überweisungen zwischen eigenen Konten und Wallets und markiert offene Fälle zur manuellen Prüfung?",
      en: "Does the tool recognise transfers between your own accounts and wallets and flag open cases for manual review?",
    },
  },
  {
    id: "country_coverage",
    label: { de: "Länder", en: "Countries" },
    question: {
      de: "Für welche der Länder DE, AT, FR, ES, IT, NL, MT, CY gibt es länderspezifische Berichte?",
      en: "For which of the countries DE, AT, FR, ES, IT, NL, MT, CY are country-specific reports available?",
    },
  },
  {
    id: "export_and_method",
    label: { de: "Export und Rechenmethode", en: "Export and calculation method" },
    question: {
      de: "Welche Exportformate gibt es, und wird die gewählte Rechenmethode (z. B. FIFO) im Bericht dokumentiert?",
      en: "Which export formats exist, and is the chosen calculation method (e.g. FIFO) documented in the report?",
    },
  },
  {
    id: "data_handling_pricing",
    label: { de: "Datenhaltung und Preis", en: "Data handling and price" },
    question: {
      de: "Wo werden die Daten verarbeitet (EWR oder nicht), gibt es einen Auftragsverarbeitungsvertrag, und wie ist das Preismodell aufgebaut?",
      en: "Where is data processed (EEA or not), is there a data processing agreement, and how is pricing structured?",
    },
  },
];

export interface TaxToolValue {
  value: I18n;
  sourceUrl: string;
}

export interface TaxTool {
  id: string;
  name: string;
  url: string;
  /** ISO-Datum der letzten Prüfung gegen die Anbieterseiten. */
  verifiedAt: string;
  /** null = nicht geprüft. */
  criteria: Record<TaxToolCriterionId, TaxToolValue | null>;
  /** Tracking-Link, falls vorhanden. Dann zeigt die App affiliateDisclosure. */
  affiliateUrl: string | null;
}

/** Noch leer: Die Recherche der Tools folgt nach der Semrush-Prüfung (DE und EN). */
export const TAX_TOOLS: readonly TaxTool[] = [];

export const TAX_TOOLS_MIN_TO_SHOW = 3;
export const TAX_TOOLS_MAX_AGE_DAYS = 180;

export const TAX_BOX_TEXT = {
  title: { de: "Werkzeuge, um deine Daten zu ordnen", en: "Tools to organise your data" },
  intro: {
    de: "Diese Programme lesen Transaktionen verschiedener Anbieter ein und erzeugen Berichte. Die Liste ist alphabetisch und kein Ranking.",
    en: "These programs import transactions from several providers and produce reports. The list is alphabetical and not a ranking.",
  },
  note: {
    de: "Keine Steuerberatung. Das Ergebnis hängt von deinen Einstellungen und den Regeln deines Landes ab. Lass es von einer Steuerfachperson prüfen.",
    en: "Not tax advice. The result depends on your settings and your country's rules. Have it reviewed by a tax professional.",
  },
  affiliateDisclosure: {
    de: "Werbung: Für Links mit dieser Kennzeichnung erhalten wir eine Vergütung. Die Reihenfolge und die Angaben beeinflusst das nicht.",
    en: "Advertisement: we receive a commission for links with this label. It does not affect order or information.",
  },
} as const;

export function sortedTaxTools(tools: readonly TaxTool[]): TaxTool[] {
  return [...tools].sort((a, b) => a.name.localeCompare(b.name, "en"));
}

function ageDays(fromIso: string, toIso: string): number {
  return Math.floor((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000);
}

/** Box nur zeigen, wenn genug aktuell geprüfte Tools vorliegen. */
export function shouldShowTaxToolBox(tools: readonly TaxTool[], today: string): boolean {
  const fresh = tools.filter((t) => {
    const a = ageDays(t.verifiedAt, today);
    return Number.isFinite(a) && a >= 0 && a <= TAX_TOOLS_MAX_AGE_DAYS;
  });
  return fresh.length >= TAX_TOOLS_MIN_TO_SHOW;
}
