/**
 * Trust-Layer unter den Ergebnissen: zwei Akkordeons (native <details>, ohne Abhängigkeiten).
 * 1. Verfügbarkeit und Regulierung im Land, je angezeigtem Produkt.
 * 2. Was beim Bezahlen mit Krypto steuerlich passiert, je Land, plus Einordnung je Karte.
 */
import type { Country, Lang, Product, Provider } from "@/lib/types";

/** Ein MatchResult erfüllt diese Form ebenso wie ein einzelnes Produkt auf der Produktseite. */
export interface TrustItem {
  product: Product;
  provider: Provider;
}
import { regulationFacts } from "@/lib/presentation";
import { countryAfterIn } from "@/lib/countries";
import { TAX_DISCLAIMER } from "@/lib/compliance";
import { FUNDING_FLOW_TAX_NOTE, PAYMENT_TAX, PAYMENT_TAX_AS_OF, PAYMENT_TAX_TITLE } from "@/content/payment-tax";

const T = {
  de: {
    regTitle: (c: string) => `Verfügbarkeit und Regulierung in ${c}`,
    seat: "Sitz",
    regulator: "Aufsicht",
    source: "Quelle",
    asOf: "Stand",
    uncertain: "Rechtslage in diesem Land unsicher oder im Wandel.",
    perCard: "Bei den angezeigten Karten",
  },
  en: {
    regTitle: (c: string) => `Availability and regulation in ${c}`,
    seat: "Seat",
    regulator: "Supervisor",
    source: "Source",
    asOf: "As of",
    uncertain: "The legal situation in this country is uncertain or changing.",
    perCard: "For the cards shown",
  },
} as const;

const DETAILS = "group rounded-xl border bg-card text-card-foreground";
const SUMMARY =
  "flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden";
const CHEVRON = "shrink-0 transition-transform group-open:rotate-180";

function Chevron() {
  return (
    <svg className={CHEVRON} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CountryRegulationAccordion({ results, country, lang, defaultOpen = false }: { results: readonly TrustItem[]; country: Country; lang: Lang; defaultOpen?: boolean }) {
  const t = T[lang];
  return (
    <details className={DETAILS} open={defaultOpen}>
      <summary className={SUMMARY}>
        <span>{t.regTitle(countryAfterIn(country, lang))}</span>
        <Chevron />
      </summary>
      <div className="space-y-4 px-4 pb-4 text-sm">
        {results.map((r) => {
          const f = regulationFacts(r.product, r.provider, country, lang);
          return (
            <section key={r.product.id} className="space-y-2 border-t pt-3 first:border-t-0 first:pt-0">
              <h4 className="font-semibold">{r.product.name}</h4>
              <p>{f.availabilityText}</p>
              {f.passportText ? <p>{f.passportText}</p> : null}
              <ul className="space-y-2">
                {f.entities.map((e) => (
                  <li key={e.key} className="rounded-lg bg-muted px-3 py-2">
                    <p className="font-medium">
                      {e.role}: {e.legalName}
                    </p>
                    <p className="text-muted-foreground">
                      {e.authorization}
                      {e.regulator ? ` · ${t.regulator}: ${e.regulator}` : ""}
                      {e.seat ? ` · ${t.seat}: ${e.seat}` : ""}
                    </p>
                    {e.note ? <p className="text-xs text-muted-foreground">{e.note}</p> : null}
                    <p className="text-xs text-muted-foreground">
                      {e.sourceUrl ? (
                        <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                          {t.source}
                        </a>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>
              <p>{f.dataControllerText}</p>
              {f.sourcesNote ? <p className="text-xs text-muted-foreground">{f.sourcesNote}</p> : null}
              {f.noEuMeaning ? (
                <p className="rounded-lg border border-amber-600/40 bg-amber-50 p-3 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{f.noEuMeaning}</p>
              ) : null}
            </section>
          );
        })}
      </div>
    </details>
  );
}

export function PaymentTaxAccordion({ results, country, lang, defaultOpen = false }: { results: readonly TrustItem[]; country: Country; lang: Lang; defaultOpen?: boolean }) {
  const t = T[lang];
  const sentences = PAYMENT_TAX[country.code][lang];
  const cardNotes = results
    .filter((r) => r.product.type === "card")
    .map((r) => ({ id: r.product.id, name: r.product.name, note: FUNDING_FLOW_TAX_NOTE[r.product.fundingFlow]?.[lang] ?? null }))
    .filter((n): n is { id: string; name: string; note: string } => n.note !== null);
  return (
    <details className={DETAILS} open={defaultOpen}>
      <summary className={SUMMARY}>
        <span>{PAYMENT_TAX_TITLE[lang]}</span>
        <Chevron />
      </summary>
      <div className="space-y-3 px-4 pb-4 text-sm">
        <p>{sentences.join(" ")}</p>
        {country.taxUncertain ? <p className="text-amber-800 dark:text-amber-300">{t.uncertain}</p> : null}
        {cardNotes.length > 0 ? (
          <div>
            <p className="font-medium">{t.perCard}</p>
            <ul className="mt-1 space-y-1">
              {cardNotes.map((n) => (
                <li key={n.id}>
                  <span className="font-medium">{n.name}:</span> {n.note}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {t.asOf} {country.taxVerifiedAt ?? PAYMENT_TAX_AS_OF}. {TAX_DISCLAIMER[lang]}{" "}
          {country.taxSourceUrl ? (
            <a href={country.taxSourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {t.source}
            </a>
          ) : null}
        </p>
      </div>
    </details>
  );
}

export function ResultsTrustLayer({ results, country, lang }: { results: readonly TrustItem[]; country: Country; lang: Lang }) {
  if (results.length === 0) return null;
  return (
    <div className="space-y-3">
      <CountryRegulationAccordion results={results} country={country} lang={lang} />
      <PaymentTaxAccordion results={results} country={country} lang={lang} />
    </div>
  );
}
