/**
 * Marke, Domain und Betreiberangaben. Einzige Quelle für Title-Präfix, Canonical-Basis und Impressum.
 * Felder mit `null` sind noch nicht geliefert und dürfen nicht geraten werden.
 */
import type { I18n, Lang } from "./types";

export const SITE = {
  brand: "UseYourCoins",
  domain: "useyourcoins.com",
  /** Kanonischer Ursprung: https, ohne www, ohne Slash am Ende. */
  url: "https://useyourcoins.com",
  /** Sprache für hreflang x-default und für Besucher ohne passende Accept-Language. */
  fallbackLang: "en" as Lang,
  languages: ["de", "en"] as const satisfies readonly Lang[],
  tagline: {
    de: "Krypto ausgeben, Regeln verstehen",
    en: "Spend crypto, understand the rules",
  } satisfies I18n,
} as const;

/** Ursprünge, die die Redirect-Function `/go` akzeptieren muss (Secret ALLOWED_ORIGINS). */
export const ALLOWED_ORIGINS: readonly string[] = [SITE.url, `https://www.${SITE.domain}`];

export interface Operator {
  legalName: string;
  legalForm: I18n;
  seatCity: string;
  seatCountry: string;
  /** Ladungsfähige Anschrift (Straße, Hausnummer, PLZ). */
  streetAddress: string | null;
  /** Registernummer im georgischen Unternehmensregister (NAPR). */
  registrationNo: string | null;
  /** Vertretungsberechtigte Person (Direktor). */
  representedBy: string | null;
  email: string | null;
  phone: string | null;
  vatId: string | null;
  /** Inhaltlich Verantwortlicher (§ 18 Abs. 2 MStV), falls journalistisch-redaktionelle Inhalte. */
  editorialResponsible: string | null;
  /** Vertreter in der EU nach Art. 27 DSGVO (Name und Anschrift). */
  euRepresentative: string | null;
}

export const OPERATOR: Operator = {
  legalName: "DATAMINT LLC",
  legalForm: { de: "Gesellschaft mit beschränkter Haftung nach georgischem Recht", en: "Limited liability company under Georgian law" },
  seatCity: "Tbilisi",
  seatCountry: "GE",
  streetAddress: null,
  registrationNo: null,
  representedBy: null,
  email: null,
  phone: null,
  vatId: null,
  editorialResponsible: null,
  euRepresentative: null,
};

/** Ohne diese Angaben darf die Seite nicht öffentlich gehen (Impressum, Datenschutz). */
export const REQUIRED_OPERATOR_FIELDS = ["streetAddress", "registrationNo", "representedBy", "email", "euRepresentative"] as const satisfies readonly (keyof Operator)[];

export function missingOperatorFields(op: Operator = OPERATOR): (keyof Operator)[] {
  return REQUIRED_OPERATOR_FIELDS.filter((k) => {
    const v = op[k];
    return v === null || (typeof v === "string" && v.trim() === "");
  });
}

/**
 * Anbieter-Logos sind Marken Dritter und werden erst eingebunden, wenn eine Nutzungserlaubnis
 * vorliegt (in der Regel über das Partnerprogramm). Bis dahin: Monogramm.
 * Datei ablegen unter public/logos/<provider-slug>.svg und den Slug hier eintragen.
 */
export const PROVIDER_LOGOS: ReadonlySet<string> = new Set<string>([]);

export function providerLogoPath(providerSlug: string): string | null {
  return PROVIDER_LOGOS.has(providerSlug) ? `/logos/${providerSlug}.svg` : null;
}

/** Zwei Buchstaben als Ersatz für ein Logo, z. B. "Trade Republic" → "TR". */
export function providerMonogram(name: string): string {
  const words = name.trim().split(/[\s.\-]+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0]!;
  const letters = words.length === 1 ? first.slice(0, 2) : first.charAt(0) + words[1]!.charAt(0);
  return letters.toUpperCase();
}
