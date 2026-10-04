/**
 * Matching-Engine: harte Filter → Teilscores (0..1) → gewichteter Score (0..100).
 * Reine Funktionen, keine I/O. Deterministisch (Tie-Break über Datenqualität, dann Slug).
 *
 * Score = 100 × Σ (Gewicht_f × Teilscore_f), Gewichte aus ranking-config.ts.
 */
import type {
  AuthorizationType,
  Availability,
  Catalog,
  Confidence,
  CountryCode,
  EntityRole,
  Offer,
  Product,
  ProductType,
  Provider,
  ProviderEntity,
} from "./types";
import type { Holding, Priority, QuizAnswers, SpendAsset } from "./quiz";
import { normalizeAnswers } from "./quiz";
import { isEea } from "./countries";
import {
  COMMERCIAL_WEIGHT,
  FACTORS,
  NEUTRAL,
  NORMALIZATION,
  RANKING_VERSION,
  weightsFor,
  type Factor,
  type WeightProfile,
} from "./ranking-config";

export type ReasonCode =
  | "custody_matches_wallet"
  | "custody_matches_exchange"
  | "beginner_friendly_custodial"
  | "pays_from_euro_balance"
  | "supports_stablecoins"
  | "supports_btc_eth"
  | "no_monthly_fee"
  | "low_fx_markup"
  | "no_staking_required"
  | "cashback_available"
  | "eu_authorised"
  | "eu_card_issuer"
  | "eea_data_controller"
  | "sepa_deposit";

export type WarningCode =
  | "availability_unknown"
  | "availability_restricted"
  | "wind_down"
  | "fees_unknown"
  | "rewards_unknown"
  | "no_eu_authorisation_found"
  | "authorisation_unverified"
  | "auto_sell_tax_event"
  | "staking_required"
  | "data_unverified"
  | "link_unavailable_in_country"
  | "requires_provider_account"
  | "usdt_not_mica_compliant";

export type BadgeCode = "best_match" | "lowest_cost" | "best_rewards";

export type NoteCode = "no_results" | "single_result" | "contradiction_wallet_euro";

export interface FactorScore {
  value: number;
  /** Wert stammt aus fehlenden Daten (neutral gesetzt). */
  unknown: boolean;
}

export interface MatchResult {
  product: Product;
  provider: Provider;
  /** null, wenn kein aktiver Partnerlink für dieses Land existiert. */
  offer: Offer | null;
  score: number;
  factors: Record<Factor, FactorScore>;
  weights: WeightProfile;
  /** Beitrag je Faktor in Punkten (Summe = score). Für "Warum dieses Match?". */
  contributions: Record<Factor, number>;
  reasons: ReasonCode[];
  warnings: WarningCode[];
  badges: BadgeCode[];
}

export type PairRelation = "same_provider" | "on_ramp";

export interface CardExchangePair {
  cardSlug: string;
  exchange: MatchResult;
  relation: PairRelation;
}

export interface MatchOutcome {
  rankingVersion: string;
  commercialWeight: number;
  answers: QuizAnswers;
  cards: MatchResult[];
  exchanges: MatchResult[];
  /** Je Karte die passende Börse (gleicher Anbieter oder On-Ramp). */
  pairs: CardExchangePair[];
  notes: NoteCode[];
}

export interface MatchOptions {
  /** ISO-Datum (YYYY-MM-DD) für Wind-down-Prüfung. Pflicht für Determinismus. */
  today: string;
  maxCards?: number;
  maxExchanges?: number;
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const round1 = (v: number): number => Math.round(v * 10) / 10;

/** SEPA-Einzahlung: true = geprüft vorhanden, null = nicht geprüft. Kein false, da Listen nicht vollständig sein müssen. */
export function hasSepa(product: Product): boolean | null {
  if (product.depositMethods === null) return null;
  return product.depositMethods.includes("sepa") ? true : null;
}

// ---------- Harte Filter ----------

export function availabilityFor(product: Product, country: CountryCode): Availability["status"] {
  return product.availability.find((a) => a.country === country)?.status ?? "unknown";
}

export function passesHardFilters(product: Product, type: ProductType, country: CountryCode, today: string): boolean {
  if (product.type !== type) return false;
  if (product.status === "discontinued") return false;
  if (product.status === "wind_down" && product.windDownDate !== null && product.windDownDate <= today) return false;
  if (availabilityFor(product, country) === "unavailable") return false;
  return true;
}

// ---------- Teilscores ----------

function custodyFit(product: Product, holding: Holding | null): FactorScore {
  if (product.type === "exchange" || holding === null) return { value: 1, unknown: false };
  const table: Record<Holding, Record<Product["custody"], number>> = {
    own_wallet: { self_custody: 1, hybrid: 0.7, custodial: 0.3, not_applicable: NEUTRAL },
    exchange: { custodial: 1, hybrid: 0.7, self_custody: 0.3, not_applicable: NEUTRAL },
    new: { custodial: 0.9, hybrid: 0.7, self_custody: 0.4, not_applicable: NEUTRAL },
  };
  return { value: table[holding][product.custody], unknown: product.custody === "not_applicable" };
}

const hasAny = (list: string[] | null, wanted: readonly string[]): boolean | null =>
  list === null ? null : list.some((x) => wanted.includes(x.toUpperCase()));

const BTC_ETH = ["BTC", "ETH", "WETH", "WBTC"];

function assetFit(product: Product, spend: SpendAsset | null): FactorScore {
  if (product.type === "exchange") {
    const sepa = hasSepa(product);
    if (sepa === null) return { value: NEUTRAL, unknown: true };
    return { value: sepa ? 1 : 0.6, unknown: false };
  }
  if (spend === null) return { value: 1, unknown: false };
  switch (spend) {
    case "euro_balance": {
      if (product.fundingFlow === "prefunded_fiat") return { value: 1, unknown: false };
      const eur = hasAny(product.fundingAssets, ["EUR"]);
      if (eur === null) return { value: NEUTRAL, unknown: true };
      return { value: eur ? 0.9 : 0.3, unknown: false };
    }
    case "stablecoins": {
      if (product.stablecoins === null) return { value: NEUTRAL, unknown: true };
      return { value: product.stablecoins.length > 0 ? 1 : 0.2, unknown: false };
    }
    case "btc_eth": {
      const has = hasAny(product.fundingAssets, BTC_ETH);
      if (has === null) return { value: NEUTRAL, unknown: true };
      if (!has) return { value: 0.2, unknown: false };
      const direct = ["auto_sell_per_payment", "mixed", "credit_line"].includes(product.fundingFlow);
      return { value: direct ? 1 : 0.6, unknown: false };
    }
  }
}

function fitScore(product: Product, answers: QuizAnswers, today: string): FactorScore {
  const c = custodyFit(product, answers.holding);
  const a = assetFit(product, answers.spendAsset);
  let value = 0.5 * c.value + 0.5 * a.value;
  if (product.status === "wind_down" && product.windDownDate !== null && product.windDownDate > today) value -= 0.3;
  if (answers.priority === "no_lockup" && product.rewards.staking.required === true) value -= 0.3;
  return { value: clamp01(value), unknown: c.unknown && a.unknown };
}

const linearDown = (v: number, max: number): number => clamp01(1 - v / max);

function costScore(product: Product, priority: Priority): FactorScore {
  const f = product.fees;
  const parts: { v: number; w: number }[] = [];
  if (product.type === "exchange") {
    if (f.spotTakerPct !== null) parts.push({ v: linearDown(f.spotTakerPct, NORMALIZATION.spotTakerPct), w: 1 });
  } else {
    if (f.fxMarkupPct !== null) {
      parts.push({ v: linearDown(f.fxMarkupPct, NORMALIZATION.fxMarkupPct), w: priority === "low_fees" ? 2 : 1 });
    }
    if (f.monthlyEur !== null) parts.push({ v: linearDown(f.monthlyEur, NORMALIZATION.monthlyEur), w: 1 });
    // Physische Karte als Referenz; ohne Angabe die virtuelle.
    const issuance = f.issuancePhysicalEur ?? f.issuanceVirtualEur;
    if (issuance !== null) parts.push({ v: linearDown(issuance, NORMALIZATION.issuanceEur), w: 1 });
  }
  if (parts.length === 0) return { value: NEUTRAL, unknown: true };
  const wSum = parts.reduce((s, p) => s + p.w, 0);
  return { value: parts.reduce((s, p) => s + p.v * p.w, 0) / wSum, unknown: false };
}

function rewardsScore(product: Product, priority: Priority): FactorScore {
  if (product.type === "exchange") return { value: 0, unknown: false };
  const r = product.rewards;
  const lockupAllowed = priority !== "no_lockup";
  let pct: number | null;
  if (r.staking.required === true) {
    pct = lockupAllowed ? r.maxCashbackPct : r.baseCashbackPct;
  } else {
    pct = r.maxCashbackPct ?? r.baseCashbackPct;
  }
  if (pct === null) return { value: NEUTRAL, unknown: true };
  return { value: clamp01(pct / NORMALIZATION.cashbackPct), unknown: false };
}

const AUTH_RANK: Record<AuthorizationType, number> = {
  casp_art63: 1,
  art60_notified: 1,
  bank: 1,
  emi: 0.7,
  unverified: 0.4,
  none_found: 0,
};

/** Bestes Zulassungsniveau über alle Rechtsträger des Anbieters (Anbieterseite). */
export function bestAuthorization(provider: Provider): AuthorizationType {
  return bestOf(provider.entities.map((pe) => pe.entity.authorization), provider.entities.length === 0);
}

function bestOf(auths: AuthorizationType[], empty: boolean): AuthorizationType {
  let best: AuthorizationType = empty ? "unverified" : "none_found";
  for (const a of auths) if (AUTH_RANK[a] > AUTH_RANK[best]) best = a;
  return best;
}

const CRYPTO_ROLES: ReadonlySet<EntityRole> = new Set(["casp", "custodian", "bank", "operator"]);

/**
 * Maßgebliche Zulassung für ein Produkt:
 * - Self-Custody-Karte: Kartenherausgeber (es gibt keinen Verwahrer).
 * - sonst: Rechtsträger, die Krypto verwahren, tauschen oder betreiben.
 *   Ein E-Geld-Institut als Kartenherausgeber deckt den Krypto-Teil nicht ab.
 */
export function relevantEntities(provider: Provider, product: Product): ProviderEntity[] {
  const selfCustodyCard = product.type === "card" && product.custody === "self_custody";
  const relevant = provider.entities.filter((pe) =>
    selfCustodyCard ? pe.role === "card_issuer" : CRYPTO_ROLES.has(pe.role),
  );
  return relevant.length > 0 ? relevant : provider.entities;
}

/** Mindestens ein maßgeblicher Rechtsträger sitzt im EWR (true), keiner (false) oder Sitz unbekannt (null). */
export function hasEeaEntity(provider: Provider, product: Product): boolean | null {
  const seats = relevantEntities(provider, product).map((pe) => isEea(pe.entity.seatCountry));
  if (seats.some((s) => s === true)) return true;
  if (seats.some((s) => s === null)) return null;
  return false;
}

export function relevantAuthorization(provider: Provider, product: Product): AuthorizationType {
  const ents = relevantEntities(provider, product);
  return bestOf(ents.map((pe) => pe.entity.authorization), ents.length === 0);
}

function regulationScore(provider: Provider, product: Product): FactorScore {
  const auth = relevantAuthorization(provider, product);
  const authValue = AUTH_RANK[auth];
  const eea = isEea(provider.dataControllerCountry);
  const dcValue = eea === null ? NEUTRAL : eea ? 1 : 0;
  return {
    value: 0.7 * authValue + 0.3 * dcValue,
    unknown: auth === "unverified" && eea === null,
  };
}

const CONFIDENCE_VALUE: Record<Confidence, number> = { verified: 1, secondary: 0.6, unverified: 0.3 };

function dataQualityScore(product: Product): FactorScore {
  return { value: CONFIDENCE_VALUE[product.confidence], unknown: false };
}

export function offerFor(product: Product, offers: readonly Offer[], country: CountryCode): Offer | null {
  const offer = offers.find((o) => o.productId === product.id);
  if (!offer) return null;
  if (offer.excludedCountries.map((c) => c.toUpperCase()).includes(country)) return null;
  return offer;
}

// ---------- Reasons / Warnings ----------

function collectReasons(product: Product, provider: Provider, answers: QuizAnswers): ReasonCode[] {
  const r: ReasonCode[] = [];
  if (product.type === "card") {
    if (answers.holding === "own_wallet" && product.custody === "self_custody") r.push("custody_matches_wallet");
    if (answers.holding === "exchange" && product.custody === "custodial") r.push("custody_matches_exchange");
    if (answers.holding === "new" && product.custody === "custodial") r.push("beginner_friendly_custodial");
    if (answers.spendAsset === "euro_balance" && product.fundingFlow === "prefunded_fiat") r.push("pays_from_euro_balance");
    if (answers.spendAsset === "stablecoins" && (product.stablecoins?.length ?? 0) > 0) r.push("supports_stablecoins");
    if (answers.spendAsset === "btc_eth" && hasAny(product.fundingAssets, BTC_ETH) === true) r.push("supports_btc_eth");
    if (product.fees.monthlyEur === 0) r.push("no_monthly_fee");
    if (product.fees.fxMarkupPct !== null && product.fees.fxMarkupPct <= 0.5) r.push("low_fx_markup");
    if (product.rewards.staking.required === false) r.push("no_staking_required");
    if ((product.rewards.maxCashbackPct ?? 0) > 0) r.push("cashback_available");
  } else if (hasSepa(product) === true) {
    r.push("sepa_deposit");
  }
  const auth = relevantAuthorization(provider, product);
  if (auth === "casp_art63" || auth === "art60_notified" || auth === "bank") r.push("eu_authorised");
  else if (auth === "emi" && product.custody === "self_custody" && hasEeaEntity(provider, product)) r.push("eu_card_issuer");
  if (isEea(provider.dataControllerCountry) === true) r.push("eea_data_controller");
  return r;
}

function collectWarnings(
  product: Product,
  provider: Provider,
  country: CountryCode,
  offer: Offer | null,
  factors: Record<Factor, FactorScore>,
  answers: QuizAnswers,
): WarningCode[] {
  const w: WarningCode[] = [];
  const avail = availabilityFor(product, country);
  if (avail === "unknown") w.push("availability_unknown");
  if (avail === "restricted") w.push("availability_restricted");
  if (product.status === "wind_down") w.push("wind_down");
  if (factors.cost.unknown) w.push("fees_unknown");
  if (product.type === "card" && factors.rewards.unknown) w.push("rewards_unknown");
  const auth = relevantAuthorization(provider, product);
  if (auth === "none_found") w.push("no_eu_authorisation_found");
  if (auth === "unverified") w.push("authorisation_unverified");
  if (product.fundingFlow === "auto_sell_per_payment" || product.fundingFlow === "mixed") w.push("auto_sell_tax_event");
  if (product.rewards.staking.required === true) w.push("staking_required");
  if (product.confidence === "unverified") w.push("data_unverified");
  if (offer === null) w.push("link_unavailable_in_country");
  if (product.type === "card" && product.custody === "custodial") w.push("requires_provider_account");
  if (
    answers.spendAsset === "stablecoins" &&
    (product.stablecoins ?? []).some((s) => s.toUpperCase() === "USDT")
  ) {
    w.push("usdt_not_mica_compliant");
  }
  return w;
}

// ---------- Scoring ----------

export function scoreProduct(
  product: Product,
  provider: Provider,
  offer: Offer | null,
  answersIn: QuizAnswers,
  today: string,
): MatchResult {
  const answers = normalizeAnswers(answersIn);
  const weights = weightsFor(product.type, answers.priority);
  const factors: Record<Factor, FactorScore> = {
    fit: fitScore(product, answers, today),
    cost: costScore(product, answers.priority),
    rewards: rewardsScore(product, answers.priority),
    regulation: regulationScore(provider, product),
    dataQuality: dataQualityScore(product),
    commercial: { value: offer ? 1 : 0, unknown: false },
  };
  const contributions = {} as Record<Factor, number>;
  let total = 0;
  for (const f of FACTORS) {
    const c = weights[f] * factors[f].value * 100;
    contributions[f] = round1(c);
    total += c;
  }
  return {
    product,
    provider,
    offer,
    score: round1(total),
    factors,
    weights,
    contributions,
    reasons: collectReasons(product, provider, answers),
    warnings: collectWarnings(product, provider, answers.country, offer, factors, answers),
    badges: [],
  };
}

function compareResults(a: MatchResult, b: MatchResult): number {
  if (b.score !== a.score) return b.score - a.score;
  const dq = b.factors.dataQuality.value - a.factors.dataQuality.value;
  if (dq !== 0) return dq;
  return a.product.slug.localeCompare(b.product.slug);
}

function rank(
  catalog: Catalog,
  type: ProductType,
  answers: QuizAnswers,
  today: string,
): MatchResult[] {
  const providers = new Map(catalog.providers.map((p) => [p.id, p]));
  const out: MatchResult[] = [];
  for (const product of catalog.products) {
    if (!passesHardFilters(product, type, answers.country, today)) continue;
    const provider = providers.get(product.providerId);
    if (!provider) continue;
    out.push(scoreProduct(product, provider, offerFor(product, catalog.offers, answers.country), answers, today));
  }
  return out.sort(compareResults);
}

function assignBadges(results: MatchResult[]): void {
  if (results.length === 0) return;
  results[0]!.badges.push("best_match");
  const knownCost = results.filter((r) => !r.factors.cost.unknown);
  if (knownCost.length > 1) {
    const best = [...knownCost].sort((a, b) => b.factors.cost.value - a.factors.cost.value || compareResults(a, b))[0]!;
    best.badges.push("lowest_cost");
  }
  const knownRewards = results.filter((r) => r.product.type === "card" && !r.factors.rewards.unknown && r.factors.rewards.value > 0);
  if (knownRewards.length > 1) {
    const best = [...knownRewards].sort((a, b) => b.factors.rewards.value - a.factors.rewards.value || compareResults(a, b))[0]!;
    best.badges.push("best_rewards");
  }
}

const stablesOf = (p: Product): string[] => (p.stablecoins ?? []).map((s) => s.toUpperCase());

function pairExchange(card: MatchResult, exchanges: readonly MatchResult[]): CardExchangePair | null {
  if (card.product.custody === "custodial" || card.product.custody === "hybrid") {
    const same = exchanges.find((e) => e.provider.id === card.provider.id);
    if (same) return { cardSlug: card.product.slug, exchange: same, relation: "same_provider" };
  }
  if (card.product.custody === "self_custody" || card.product.custody === "hybrid") {
    const cardAssets = new Set([...stablesOf(card.product), ...(card.product.fundingAssets ?? []).map((a) => a.toUpperCase())]);
    const candidate = exchanges.find(
      (e) => hasSepa(e.product) !== false && stablesOf(e.product).some((s) => cardAssets.has(s)),
    );
    if (candidate) return { cardSlug: card.product.slug, exchange: candidate, relation: "on_ramp" };
  }
  return null;
}

export function matchCatalog(catalog: Catalog, answersIn: QuizAnswers, opts: MatchOptions): MatchOutcome {
  const answers = normalizeAnswers(answersIn);
  const maxCards = opts.maxCards ?? 3;
  const maxExchanges = opts.maxExchanges ?? 3;
  const notes: NoteCode[] = [];

  if (answers.holding === "own_wallet" && answers.spendAsset === "euro_balance") {
    notes.push("contradiction_wallet_euro");
  }

  const wantsCards = answers.goal !== "exchange";
  const wantsExchanges = answers.goal !== "card";

  // Börsen werden immer gerankt: für die Ausgabe (goal exchange/both) oder für das Pairing.
  const allExchanges = rank(catalog, "exchange", answers, opts.today);
  const allCards = wantsCards ? rank(catalog, "card", answers, opts.today) : [];

  const cards = allCards.slice(0, maxCards);
  const exchanges = wantsExchanges ? allExchanges.slice(0, maxExchanges) : [];

  assignBadges(cards);
  assignBadges(exchanges);

  const pairs: CardExchangePair[] = [];
  for (const card of cards) {
    const pair = pairExchange(card, allExchanges);
    if (pair) pairs.push(pair);
  }

  const shown = (wantsCards ? cards.length : 0) + (wantsExchanges ? exchanges.length : 0);
  if (shown === 0) notes.push("no_results");
  else if ((wantsCards && cards.length === 1) || (!wantsCards && exchanges.length === 1)) notes.push("single_result");

  return {
    rankingVersion: RANKING_VERSION,
    commercialWeight: COMMERCIAL_WEIGHT,
    answers,
    cards,
    exchanges,
    pairs,
    notes,
  };
}
