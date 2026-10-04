import type { Country, CountryCode, I18n, IsoCountry, Lang } from "./types";
import { LAUNCH_COUNTRIES } from "./types";

/** EU-27 + EWR (IS, LI, NO). Für "Datenverantwortlicher im EWR". */
export const EEA_COUNTRIES: ReadonlySet<IsoCountry> = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
  "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "IS", "LI", "NO",
]);

export function isEea(country: IsoCountry | null | undefined): boolean | null {
  if (!country) return null;
  return EEA_COUNTRIES.has(country.toUpperCase());
}

export function isLaunchCountry(value: string): value is CountryCode {
  return (LAUNCH_COUNTRIES as readonly string[]).includes(value.toUpperCase());
}

/** Fallback-Namen, falls die DB noch nicht geladen ist (Quiz-Schritt "Land"). */
export const COUNTRY_NAMES: Record<CountryCode, I18n> = {
  DE: { de: "Deutschland", en: "Germany" },
  AT: { de: "Österreich", en: "Austria" },
  FR: { de: "Frankreich", en: "France" },
  ES: { de: "Spanien", en: "Spain" },
  IT: { de: "Italien", en: "Italy" },
  NL: { de: "Niederlande", en: "Netherlands" },
  MT: { de: "Malta", en: "Malta" },
  CY: { de: "Zypern", en: "Cyprus" },
};

/** Abweichende Form nach "in" (Dativ bzw. mit Artikel). */
const AFTER_IN: Partial<Record<CountryCode, I18n>> = {
  NL: { de: "den Niederlanden", en: "the Netherlands" },
};

/** Ländername, wie er nach "in" steht: "in den Niederlanden", "in the Netherlands", sonst der Name. */
export function countryAfterIn(country: Pick<Country, "code" | "name">, lang: Lang): string {
  return AFTER_IN[country.code]?.[lang] ?? country.name[lang];
}
