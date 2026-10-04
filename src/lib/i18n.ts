/**
 * Texte der Oberfläche (Navigation, Überschriften, Schaltflächen) aus src/locales/*.json.
 * Fachtexte (Quiz, Labels, Pflichttexte, Kategorien, Wissen) bleiben als typisierte I18n-Objekte
 * in src/lib und src/content, weil die Logik sie über Codes anspricht. Nicht nach JSON kopieren.
 */
import de from "../locales/de.json";
import en from "../locales/en.json";
import type { I18n, Lang } from "./types";

export type Messages = typeof de;
export type Namespace = keyof Messages;
export type MessageKey = { [N in Namespace]: `${N}.${Extract<keyof Messages[N], string>}` }[Namespace];

const MESSAGES: Record<Lang, Messages> = { de, en };

/** Text der Oberfläche. Platzhalter in geschweiften Klammern: t("de", "finder.stepOf", { current: 1, total: 4 }). */
export function t(lang: Lang, key: MessageKey, vars: Record<string, string | number> = {}): string {
  const [ns, name] = key.split(".") as [Namespace, string];
  const template = (MESSAGES[lang][ns] as Record<string, string>)[name];
  if (template === undefined) throw new RangeError(`Unbekannter Textschlüssel: ${key}`);
  return template.replace(/\{(\w+)\}/g, (match, v: string) => (v in vars ? String(vars[v]) : match));
}

/** Wert eines I18n-Objekts aus src/lib oder src/content. */
export function pick(text: I18n, lang: Lang): string {
  return text[lang];
}

export function messages(lang: Lang): Messages {
  return MESSAGES[lang];
}
