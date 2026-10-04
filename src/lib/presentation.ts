/**
 * Präsentationslogik für Ergebniskarten und Trust-Module.
 * Reine Funktionen: Daten rein, fertige Strings/Strukturen raus. Komponenten rendern nur.
 */
import type {
  AvailabilityStatus,
  Country,
  CountryCode,
  DepositMethod,
  FeeStructure,
  Lang,
  Offer,
  Product,
  Provider,
  RewardStructure,
} from "./types";
import type { MatchResult } from "./matching";
import { availabilityFor, hasEeaEntity, relevantAuthorization, relevantEntities } from "./matching";
import type { QuizAnswers } from "./quiz";
import { countryAfterIn, isEea } from "./countries";
import {
  adLabel,
  AFFILIATE_DISCLOSURE,
  AUTHORIZATION_LABEL,
  NO_EU_AUTHORISATION_MEANING,
} from "./compliance";
import { BADGE_LABEL } from "./labels";
import { goUrl, type ClickSource } from "./tracking";

export type Tone = "neutral" | "positive" | "warning";

const LOCALE: Record<Lang, string> = { de: "de-DE", en: "en-IE" };

export function formatEur(value: number, lang: Lang): string {
  const fractional = Math.round(value * 100) % 100 !== 0;
  return new Intl.NumberFormat(LOCALE[lang], {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: fractional ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPct(value: number, lang: Lang): string {
  const n = new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: 2 }).format(value);
  return lang === "de" ? `${n} %` : `${n}%`;
}

export function regionName(code: string, lang: Lang): string {
  try {
    return new Intl.DisplayNames([LOCALE[lang]], { type: "region" }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

const NOT_VERIFIED: Record<Lang, string> = { de: "nicht geprüft", en: "not verified" };

// ---------- Pills ----------

export type PillCode =
  | "mica_casp"
  | "mica_bank"
  | "eu_emi_issuer"
  | "no_eu_authorisation"
  | "self_custody"
  | "zero_fx"
  | "no_staking"
  | "virtual_card"
  | "apple_pay"
  | "google_pay";

export interface Pill {
  code: PillCode;
  label: string;
  tone: Tone;
}

const PILL_LABEL: Record<PillCode, Record<Lang, string>> = {
  mica_casp: { de: "MiCA-Zulassung", en: "MiCA authorised" },
  mica_bank: { de: "MiCA über Bank", en: "MiCA via bank" },
  eu_emi_issuer: { de: "EU-E-Geld-Herausgeber", en: "EU e-money issuer" },
  no_eu_authorisation: { de: "Keine EU-Zulassung", en: "No EU authorisation" },
  self_custody: { de: "Self-Custody", en: "Self-custody" },
  zero_fx: { de: "0 % FX", en: "0% FX" },
  no_staking: { de: "Ohne Staking", en: "No staking" },
  virtual_card: { de: "Virtuelle Karte", en: "Virtual card" },
  apple_pay: { de: "Apple Pay", en: "Apple Pay" },
  google_pay: { de: "Google Pay", en: "Google Pay" },
};

/**
 * Faktenbasierte Pills. Jede Pill nur bei geprüftem Wert (nie aus null abgeleitet).
 * "MiCA Ready" gibt es bewusst nicht: kein Gütesiegel, sondern Zulassung eines Rechtsträgers.
 */
export function productPills(product: Product, provider: Provider, lang: Lang, max = 5): Pill[] {
  const pills: Pill[] = [];
  const add = (code: PillCode, tone: Tone): void => {
    pills.push({ code, label: PILL_LABEL[code][lang], tone });
  };

  const auth = relevantAuthorization(provider, product);
  if (auth === "casp_art63") add("mica_casp", "positive");
  else if (auth === "art60_notified" || auth === "bank") add("mica_bank", "positive");
  else if (auth === "emi" && product.custody === "self_custody" && hasEeaEntity(provider, product) === true) add("eu_emi_issuer", "positive");
  else if (auth === "none_found") add("no_eu_authorisation", "warning");

  if (product.custody === "self_custody") add("self_custody", "neutral");
  if (product.fees.fxMarkupPct === 0) add("zero_fx", "positive");
  if (product.rewards.staking.required === false) add("no_staking", "neutral");
  if (product.card?.forms?.includes("virtual")) add("virtual_card", "neutral");
  if (product.card?.mobileWallets?.includes("apple_pay")) add("apple_pay", "neutral");
  if (product.card?.mobileWallets?.includes("google_pay")) add("google_pay", "neutral");

  // Warn-Pill nie abschneiden
  const warning = pills.filter((p) => p.tone === "warning");
  const rest = pills.filter((p) => p.tone !== "warning");
  return [...warning, ...rest].slice(0, Math.max(max, warning.length));
}

// ---------- Gebührenraster ----------

export interface FeeCell {
  key: "issuance" | "monthly" | "fx" | "atm";
  label: string;
  value: string;
  detail: string | null;
  unknown: boolean;
}

const FEE_LABEL: Record<FeeCell["key"], Record<Lang, string>> = {
  issuance: { de: "Ausgabe", en: "Issuance" },
  monthly: { de: "Monatlich", en: "Monthly" },
  fx: { de: "Fremdwährung", en: "FX markup" },
  atm: { de: "Geldautomat frei", en: "Free ATM" },
};

const DASH = "–";

export function feeCells(fees: FeeStructure, lang: Lang): FeeCell[] {
  const cell = (key: FeeCell["key"], value: string | null, detail: string | null = null): FeeCell => ({
    key,
    label: FEE_LABEL[key][lang],
    value: value ?? DASH,
    detail: value === null ? NOT_VERIFIED[lang] : detail,
    unknown: value === null,
  });

  let issuance: FeeCell;
  const v = fees.issuanceVirtualEur;
  const p = fees.issuancePhysicalEur;
  if (v !== null && p !== null) {
    issuance = cell("issuance", `${formatEur(v, lang)} / ${formatEur(p, lang)}`, lang === "de" ? "virtuell / physisch" : "virtual / physical");
  } else if (p !== null) {
    issuance = cell("issuance", formatEur(p, lang), lang === "de" ? "physisch" : "physical");
  } else if (v !== null) {
    issuance = cell("issuance", formatEur(v, lang), lang === "de" ? "virtuell" : "virtual");
  } else {
    issuance = cell("issuance", null);
  }

  const atm = fees.atmFreeLimitEurPerMonth;
  return [
    issuance,
    cell("monthly", fees.monthlyEur === null ? null : formatEur(fees.monthlyEur, lang)),
    cell("fx", fees.fxMarkupPct === null ? null : formatPct(fees.fxMarkupPct, lang)),
    cell(
      "atm",
      atm === null ? null : atm === 0 ? (lang === "de" ? "keine" : "none") : formatEur(atm, lang),
      atm !== null && atm > 0 ? (lang === "de" ? "pro Monat" : "per month") : null,
    ),
  ];
}

// ---------- Börsen-Raster ----------

const DEPOSIT_LABEL: Record<DepositMethod, Record<Lang, string>> = {
  sepa: { de: "SEPA", en: "SEPA" },
  card: { de: "Karte", en: "Card" },
  apple_pay: { de: "Apple Pay", en: "Apple Pay" },
  google_pay: { de: "Google Pay", en: "Google Pay" },
  crypto: { de: "Krypto", en: "Crypto" },
};

export function depositMethodLabel(m: DepositMethod, lang: Lang): string {
  return DEPOSIT_LABEL[m][lang];
}

export interface ExchangeCell {
  key: "maker" | "taker" | "deposit" | "assets";
  label: string;
  value: string;
  detail: string | null;
  unknown: boolean;
}

export function exchangeCells(product: Product, lang: Lang): ExchangeCell[] {
  const de = lang === "de";
  const cell = (key: ExchangeCell["key"], label: string, value: string | null, detail: string | null = null): ExchangeCell => ({
    key,
    label,
    value: value ?? DASH,
    detail: value === null ? NOT_VERIFIED[lang] : detail,
    unknown: value === null,
  });
  const f = product.fees;
  const dm = product.depositMethods;
  return [
    cell("maker", de ? "Spot Maker" : "Spot maker", f.spotMakerPct === null ? null : formatPct(f.spotMakerPct, lang)),
    cell("taker", de ? "Spot Taker / Spread" : "Spot taker / spread", f.spotTakerPct === null ? null : formatPct(f.spotTakerPct, lang)),
    cell(
      "deposit",
      de ? "Einzahlung" : "Deposit",
      dm === null || dm.length === 0 ? null : dm.map((m) => DEPOSIT_LABEL[m][lang]).join(", "),
      dm && dm.length ? (de ? "geprüft, ggf. weitere" : "verified, possibly more") : null,
    ),
    cell("assets", de ? "Kryptowerte" : "Crypto assets", product.assetCount === null ? null : String(product.assetCount)),
  ];
}

// ---------- Cashback ----------

export interface CashbackSummary {
  text: string;
  tone: Tone;
  /** true = Höchstsatz nur mit Staking; null = unbekannt */
  requiresStaking: boolean | null;
  known: boolean;
}

export function cashbackSummary(r: RewardStructure, lang: Lang): CashbackSummary {
  const de = lang === "de";
  const base = r.baseCashbackPct;
  const max = r.maxCashbackPct;
  const token = r.staking.token ?? (de ? "Token" : "token");
  const lockup = r.staking.lockupDays ? (de ? `, ${r.staking.lockupDays} Tage gesperrt` : `, locked ${r.staking.lockupDays} days`) : "";
  const minEur = r.staking.minEur ? (de ? ` ab ${formatEur(r.staking.minEur, lang)}` : ` from ${formatEur(r.staking.minEur, lang)}`) : "";

  if (base === null && max === null) {
    return { text: de ? "Cashback: noch nicht geprüft" : "Cashback: not yet verified", tone: "neutral", requiresStaking: r.staking.required, known: false };
  }
  if ((max ?? base) === 0) {
    return { text: de ? "Kein Cashback" : "No cashback", tone: "neutral", requiresStaking: false, known: true };
  }
  if (r.staking.required === true) {
    const withoutStaking = base === null ? (de ? "ohne Staking: nicht geprüft" : "without staking: not verified") : de ? `${formatPct(base, lang)} ohne Staking` : `${formatPct(base, lang)} without staking`;
    const withStaking =
      max === null
        ? ""
        : de
          ? ` | bis zu ${formatPct(max, lang)} mit ${token}-Staking${minEur}${lockup}`
          : ` | up to ${formatPct(max, lang)} with ${token} staking${minEur}${lockup}`;
    return { text: withoutStaking + withStaking, tone: base === 0 || base === null ? "warning" : "neutral", requiresStaking: true, known: true };
  }
  const pct = formatPct((max ?? base) as number, lang);
  if (r.staking.required === false) {
    return { text: de ? `${pct} Cashback, ohne Staking` : `${pct} cashback, no staking`, tone: "positive", requiresStaking: false, known: true };
  }
  return {
    text: de ? `bis zu ${pct} Cashback · Staking-Bedingungen nicht geprüft` : `up to ${pct} cashback · staking terms not verified`,
    tone: "neutral",
    requiresStaking: null,
    known: true,
  };
}

// ---------- Kopfbereich ----------

const NETWORK_LABEL = { visa: "Visa", mastercard: "Mastercard", unknown: null } as const;

/** z. B. "Mastercard · Herausgeber: Via Payments UAB" */
export function issuerLine(product: Product, provider: Provider, lang: Lang): string | null {
  const network = product.card ? NETWORK_LABEL[product.card.network] : null;
  const issuer = provider.entities.find((pe) => pe.role === "card_issuer")?.entity.legalName ?? null;
  const parts: string[] = [];
  if (network) parts.push(network);
  if (issuer) parts.push(lang === "de" ? `Herausgeber: ${issuer}` : `Issuer: ${issuer}`);
  return parts.length ? parts.join(" · ") : null;
}

export function highlightText(result: MatchResult, answers: QuizAnswers, lang: Lang): string | null {
  const de = lang === "de";
  if (result.badges.includes("best_match")) {
    const ctx: Record<string, [string, string]> = {
      stablecoins: ["für Zahlungen mit Stablecoins", "for paying with stablecoins"],
      btc_eth: ["für Zahlungen mit BTC/ETH", "for paying with BTC/ETH"],
      euro_balance: ["für Zahlungen aus Euro-Guthaben", "for paying from a euro balance"],
    };
    const c = answers.spendAsset ? ctx[answers.spendAsset] : undefined;
    if (result.product.type === "card" && c) return de ? `Top-Match ${c[0]}` : `Top match ${c[1]}`;
    return BADGE_LABEL.best_match[lang];
  }
  if (result.badges.includes("lowest_cost")) return BADGE_LABEL.lowest_cost[lang];
  if (result.badges.includes("best_rewards")) return BADGE_LABEL.best_rewards[lang];
  return null;
}

/** Deterministischer Farbverlauf je Anbieter (keine Markenfarben, keine Logos). */
export function mockupGradient(slug: string): { from: string; to: string } {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  return { from: `hsl(${hue} 55% 38%)`, to: `hsl(${(hue + 40) % 360} 60% 22%)` };
}

// ---------- CTA ----------

/** Formulierungen, die in CTAs nie erscheinen dürfen (Irreführungsrisiko). */
export const FORBIDDEN_COPY =
  /steuerfrei|steuerneutral|tax[- ]?free|tax[- ]?neutral|mica[- ]?(konform|compliant|ready)|garantiert|guaranteed|risikofrei|risk[- ]?free|maximale[nr]? bonus|maximum bonus|nur heute|only today/i;

export const BONUS_MAX_AGE_DAYS = 30;

function daysBetween(fromIso: string, toIso: string): number {
  return Math.floor((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000);
}

export function bonusIsFresh(offer: Offer, today: string): boolean {
  if (!offer.bonusConditions || !offer.bonusVerifiedAt) return false;
  const age = daysBetween(offer.bonusVerifiedAt, today);
  return age >= 0 && age <= BONUS_MAX_AGE_DAYS;
}

export type ResolvedCta =
  | {
      kind: "affiliate";
      label: string;
      href: string;
      adLabel: string;
      disclosure: string;
      bonusConditions: string | null;
      promoCode: string | null;
      badge: { text: string; sponsored: boolean } | null;
    }
  | { kind: "neutral"; label: string; href: string };

export interface ResolveCtaInput {
  offer: Offer | null;
  provider: Provider;
  lang: Lang;
  country: Pick<Country, "adLabel"> | null;
  countryCode: CountryCode;
  functionsBaseUrl: string;
  subId: string;
  source: ClickSource;
  today: string;
  /** Pfad zur internen Anbieterseite, z. B. "/de/providers/bitpanda". */
  providerPagePath: string;
}

export function resolveCta(i: ResolveCtaInput): ResolvedCta {
  const de = i.lang === "de";
  if (!i.offer) {
    return { kind: "neutral", label: de ? `Mehr zu ${i.provider.name}` : `More about ${i.provider.name}`, href: i.providerPagePath };
  }
  const fallbackLabel = de ? `Zu ${i.provider.name}` : `Go to ${i.provider.name}`;
  const fresh = bonusIsFresh(i.offer, i.today);
  const custom = i.offer.ctaText?.[i.lang] ?? null;
  const useCustom = fresh && custom !== null && custom.trim() !== "" && !FORBIDDEN_COPY.test(custom);
  const badgeText = i.offer.badge?.text[i.lang] ?? null;
  const badgeAllowed = badgeText !== null && !FORBIDDEN_COPY.test(badgeText);
  return {
    kind: "affiliate",
    label: useCustom ? `${custom}*` : fallbackLabel,
    href: goUrl(i.functionsBaseUrl, { slug: i.offer.slug, country: i.countryCode, lang: i.lang, source: i.source, subId: i.subId }),
    adLabel: adLabel(i.lang, i.country),
    disclosure: AFFILIATE_DISCLOSURE[i.lang],
    bonusConditions: useCustom ? `* ${i.offer.bonusConditions?.[i.lang] ?? ""}` : null,
    promoCode: i.offer.promoCode,
    badge: badgeAllowed ? { text: badgeText as string, sponsored: i.offer.badge?.kind === "sponsored" } : null,
  };
}

// ---------- Trust-Modul: Verfügbarkeit und Regulierung im Land ----------

export interface EntityFact {
  key: string;
  role: string;
  legalName: string;
  seat: string | null;
  regulator: string | null;
  authorization: string;
  verified: boolean;
  sourceUrl: string | null;
  note: string | null;
}

export interface RegulationFacts {
  availability: AvailabilityStatus;
  availabilityText: string;
  passportText: string | null;
  entities: EntityFact[];
  dataControllerText: string;
  noEuMeaning: string | null;
  sourcesNote: string | null;
}

const ROLE_LABEL: Record<string, Record<Lang, string>> = {
  casp: { de: "Krypto-Dienstleister", en: "Crypto service provider" },
  custodian: { de: "Verwahrer", en: "Custodian" },
  bank: { de: "Bank", en: "Bank" },
  emi: { de: "E-Geld-Institut", en: "E-money institution" },
  card_issuer: { de: "Kartenherausgeber", en: "Card issuer" },
  program_manager: { de: "Programmbetreiber", en: "Programme manager" },
  data_controller: { de: "Datenverantwortlicher", en: "Data controller" },
  operator: { de: "Betreiber", en: "Operator" },
};

export function regulationFacts(product: Product, provider: Provider, country: Country, lang: Lang): RegulationFacts {
  const de = lang === "de";
  const cName = countryAfterIn(country, lang);
  const availability = availabilityFor(product, country.code);
  const availabilityText = {
    available: de ? `In ${cName} verfügbar.` : `Available in ${cName}.`,
    restricted: de ? `In ${cName} nur eingeschränkt verfügbar.` : `Only partly available in ${cName}.`,
    unavailable: de ? `In ${cName} nicht verfügbar.` : `Not available in ${cName}.`,
    unknown: de ? `Verfügbarkeit in ${cName} nicht bestätigt; der Anbieter prüft den Wohnsitz bei der Anmeldung.` : `Availability in ${cName} not confirmed; the provider checks residence at sign-up.`,
  }[availability];

  const relevant = relevantEntities(provider, product);
  const issuer = provider.entities.filter((pe) => pe.role === "card_issuer");
  const byEntity = new Map<string, { pe: (typeof relevant)[number]; roles: string[]; notes: string[] }>();
  for (const pe of [...relevant, ...(product.type === "card" ? issuer : [])]) {
    const roleLabel = ROLE_LABEL[pe.role]?.[lang] ?? pe.role;
    const entry = byEntity.get(pe.entity.id) ?? { pe, roles: [], notes: [] };
    if (!entry.roles.includes(roleLabel)) entry.roles.push(roleLabel);
    // scope_note ist derzeit nur deutsch gepflegt
    if (lang === "de" && pe.scopeNote && !entry.notes.includes(pe.scopeNote)) entry.notes.push(pe.scopeNote);
    byEntity.set(pe.entity.id, entry);
  }
  const entities: EntityFact[] = [...byEntity.values()].map(({ pe, roles, notes }) => ({
    key: pe.entity.id,
    role: roles.join(", "),
    legalName: pe.entity.legalName,
    seat: pe.entity.seatCountry ? regionName(pe.entity.seatCountry, lang) : null,
    regulator: pe.entity.regulator,
    authorization: AUTHORIZATION_LABEL[pe.entity.authorization][lang],
    verified: pe.entity.confidence === "verified",
    sourceUrl: pe.entity.sourceUrl,
    note: notes.length ? notes.join(" ") : null,
  }));
  const sourcesNote = entities.some((e) => !e.verified)
    ? de
      ? "Angaben teils aus Sekundärquellen; die Prüfung gegen die Aufsichtsregister läuft."
      : "Some details come from secondary sources; checks against supervisory registers are ongoing."
    : null;

  const auth = relevantAuthorization(provider, product);
  let passportText: string | null = null;
  const strong = auth === "casp_art63" || auth === "art60_notified" || auth === "bank";
  const leadSeat = relevant.find((pe) => pe.entity.authorization === auth)?.entity.seatCountry ?? null;
  if (strong && leadSeat && availability !== "unavailable") {
    if (leadSeat.toUpperCase() === country.code) {
      passportText = de ? `Die Zulassung wurde in ${cName} selbst erteilt.` : `The authorisation was granted in ${cName} itself.`;
    } else if (isEea(leadSeat)) {
      const seat = regionName(leadSeat, lang);
      passportText = de
        ? `Die Zulassung stammt aus ${seat} und kann über den EU-Pass in ${cName} genutzt werden. Die konkrete Notifizierung prüfen wir im ESMA-Register.`
        : `The authorisation comes from ${seat} and can be used in ${cName} via the EU passport. We check the specific notification in the ESMA register.`;
    }
  }

  const dc = provider.dataControllerCountry;
  const dcEea = isEea(dc);
  const dataControllerText =
    dc === null
      ? de
        ? "Datenverantwortlicher: nicht eindeutig offengelegt."
        : "Data controller: not clearly disclosed."
      : dcEea
        ? de
          ? `Datenverantwortlicher sitzt in ${regionName(dc, lang)} (EWR, DSGVO gilt direkt).`
          : `Data controller is based in ${regionName(dc, lang)} (EEA, GDPR applies directly).`
        : de
          ? `Datenverantwortlicher sitzt in ${regionName(dc, lang)}, außerhalb des EWR.`
          : `Data controller is based in ${regionName(dc, lang)}, outside the EEA.`;

  return {
    availability,
    availabilityText,
    passportText,
    entities,
    dataControllerText,
    noEuMeaning: auth === "none_found" ? NO_EU_AUTHORISATION_MEANING[lang] : null,
    sourcesNote,
  };
}
