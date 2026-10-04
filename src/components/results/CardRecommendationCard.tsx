/**
 * Ergebniskarte für den Finder (max. 2–3 je Ergebnis).
 * Reihenfolge der Inhalte ist Vorgabe (siehe docs/KONZEPT-ERGEBNISKARTE.md, Abschnitt 4).
 */
import type { CardExchangePair, MatchResult } from "@/lib/matching";
import type { QuizAnswers } from "@/lib/quiz";
import type { Country, Lang } from "@/lib/types";
import type { ClickSource } from "@/lib/tracking";
import { buildQuizSubId } from "@/lib/tracking";
import {
  cashbackSummary,
  exchangeCells,
  feeCells,
  highlightText,
  issuerLine,
  productPills,
  resolveCta,
} from "@/lib/presentation";
import { FACTORS, FACTOR_LABELS } from "@/lib/ranking-config";
import { NO_EU_AUTHORISATION_MEANING } from "@/lib/compliance";
import { REASON_LABEL, WARNING_LABEL } from "@/lib/labels";
import { CardMockup, CashbackBanner, FeeGrid, PillBadges } from "./parts";
import { ReferralCta } from "./ReferralCta";

export interface CardRecommendationCardProps {
  result: MatchResult;
  answers: QuizAnswers;
  country: Country;
  lang: Lang;
  /** 1-basiert, für Tracking. */
  position: number;
  functionsBaseUrl: string;
  /** YYYY-MM-DD, für Bonus-Aktualität. */
  today: string;
  /** Baut den internen Pfad zur Anbieterseite, z. B. (slug) => `/de/providers/${slug}`. */
  providerPath: (providerSlug: string) => string;
  pair?: CardExchangePair | null;
  source?: ClickSource;
  subId?: string;
  logoUrl?: string | null;
  onCtaClick?: (info: { slug: string; position: number; pair: boolean }) => void;
}

const T = {
  de: {
    why: "Warum dieses Match?",
    fees: "Gebühren",
    score: "So kommt die Reihenfolge zustande",
    points: "Punkte",
    total: "Gesamt",
    sponsored: "Gesponsert",
    samePair: (p: string) => `Konto bei ${p} nötig, die Karte läuft darüber.`,
    onRamp: (p: string) => `Stablecoin kaufen, z. B. bei ${p}:`,
  },
  en: {
    why: "Why this match?",
    fees: "Fees",
    score: "How the ranking is calculated",
    points: "points",
    total: "Total",
    sponsored: "Sponsored",
    samePair: (p: string) => `Requires an account with ${p}; the card runs through it.`,
    onRamp: (p: string) => `Buy the stablecoin, e.g. at ${p}:`,
  },
} as const;

export function CardRecommendationCard(props: CardRecommendationCardProps) {
  const { result, answers, country, lang, position, functionsBaseUrl, today, providerPath, pair } = props;
  const { product, provider } = result;
  const t = T[lang];
  const source = props.source ?? "quiz";
  const subId = props.subId ?? buildQuizSubId(answers);

  const highlight = highlightText(result, answers, lang);
  const pills = productPills(product, provider, lang);
  const isCard = product.type === "card";
  const cta = resolveCta({
    offer: result.offer,
    provider,
    lang,
    country,
    countryCode: country.code,
    functionsBaseUrl,
    subId,
    source,
    today,
    providerPagePath: providerPath(provider.slug),
  });
  const pairCta =
    pair && pair.relation === "on_ramp"
      ? resolveCta({
          offer: pair.exchange.offer,
          provider: pair.exchange.provider,
          lang,
          country,
          countryCode: country.code,
          functionsBaseUrl,
          subId,
          source,
          today,
          providerPagePath: providerPath(pair.exchange.provider.slug),
        })
      : null;

  return (
    <article className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm" data-product={product.slug}>
      <header className="flex gap-4 p-4">
        <CardMockup slug={provider.slug} name={provider.name} logoUrl={props.logoUrl} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {highlight ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{highlight}</span>
            ) : null}
            {cta.kind === "affiliate" && cta.badge ? (
              <span className="rounded-full border px-2 py-0.5 text-xs font-medium">
                {cta.badge.text}
                {cta.badge.sponsored ? ` · ${t.sponsored}` : ""}
              </span>
            ) : null}
          </div>
          <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>
          <p className="text-sm leading-snug text-muted-foreground">{issuerLine(product, provider, lang) ?? provider.name}</p>
        </div>
      </header>

      <div className="space-y-3 px-4 pb-4">
        <PillBadges pills={pills} />

        <FeeGrid cells={isCard ? feeCells(product.fees, lang) : exchangeCells(product, lang)} title={t.fees} />
        {isCard ? <CashbackBanner summary={cashbackSummary(product.rewards, lang)} /> : null}

        {result.warnings.length > 0 ? (
          <ul className="space-y-1 rounded-lg border border-amber-600/40 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {result.warnings
              .filter((w) => w !== "link_unavailable_in_country")
              .filter((w) => !(w === "requires_provider_account" && pair?.relation === "same_provider"))
              .map((w) => (
                <li key={w}>
                  {WARNING_LABEL[w][lang]}
                  {w === "no_eu_authorisation_found" ? <span className="mt-1 block text-xs">{NO_EU_AUTHORISATION_MEANING[lang]}</span> : null}
                </li>
              ))}
          </ul>
        ) : null}

        {result.reasons.length > 0 ? (
          <div>
            <p className="text-sm font-medium">{t.why}</p>
            <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
              {result.reasons.slice(0, 4).map((r) => (
                <li key={r}>{REASON_LABEL[r][lang]}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {pair ? (
          <div className="rounded-lg bg-muted p-3 text-sm">
            {pair.relation === "same_provider" ? (
              <p>{t.samePair(provider.name)}</p>
            ) : (
              <div className="space-y-2">
                <p>{t.onRamp(pair.exchange.provider.name)}</p>
                {pairCta ? (
                  <ReferralCta
                    cta={pairCta}
                    lang={lang}
                    onClick={() => props.onCtaClick?.({ slug: pair.exchange.product.slug, position, pair: true })}
                  />
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        <ReferralCta cta={cta} lang={lang} onClick={() => props.onCtaClick?.({ slug: product.slug, position, pair: false })} />

        <details className="group rounded-lg border px-3 py-2 text-sm">
          <summary className="cursor-pointer select-none font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {t.score}
          </summary>
          <dl className="mt-2 space-y-1.5">
            {FACTORS.map((f) => {
              const pct = Math.round(result.weights[f] * 100);
              const pts = result.contributions[f];
              return (
                <div key={f} className="grid grid-cols-[1fr_auto] items-center gap-x-3">
                  <dt className="text-muted-foreground">
                    {FACTOR_LABELS[f][lang]} <span className="text-xs">({pct} %)</span>
                  </dt>
                  <dd className="tabular-nums">
                    {pts.toLocaleString(lang === "de" ? "de-DE" : "en-IE")} {t.points}
                  </dd>
                  <div className="col-span-2 h-1.5 overflow-hidden rounded bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${pct === 0 ? 0 : Math.min(100, (pts / pct) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between border-t pt-1.5 font-semibold">
              <dt>{t.total}</dt>
              <dd className="tabular-nums">{result.score.toLocaleString(lang === "de" ? "de-DE" : "en-IE")}</dd>
            </div>
          </dl>
        </details>
      </div>
    </article>
  );
}
