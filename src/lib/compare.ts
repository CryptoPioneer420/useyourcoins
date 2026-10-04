/**
 * Direktvergleich von 2–3 Produkten gleichen Typs (Karte oder Börse).
 * "Bester Wert" wird nur markiert, wenn mindestens zwei Werte geprüft sind,
 * und nie für qualitative Zeilen (Zulassung, Verwahrung).
 */
import type { Country, Lang, Product, Provider } from "./types";
import { AUTHORIZATION_LABEL, CUSTODY_LABEL, FUNDING_FLOW_LABEL } from "./compliance";
import { availabilityFor, relevantAuthorization } from "./matching";
import { cashbackSummary, depositMethodLabel, formatEur, formatPct, regionName } from "./presentation";
import { countryAfterIn, isEea } from "./countries";

export interface ComparisonItem {
  product: Product;
  provider: Provider;
}

export interface ComparisonRow {
  key: string;
  label: string;
  values: string[];
  unknown: boolean[];
  /** Indizes der besten Werte (leer, wenn nicht vergleichbar). */
  best: number[];
}

export interface Comparison {
  type: "card" | "exchange";
  headers: string[];
  rows: ComparisonRow[];
}

const DASH = "–";

type Direction = "min" | "max";

function numericRow(
  key: string,
  label: string,
  nums: (number | null)[],
  fmt: (n: number) => string,
  direction: Direction,
): ComparisonRow {
  const known = nums.map((n, i) => [n, i] as const).filter((x): x is readonly [number, number] => x[0] !== null);
  let best: number[] = [];
  if (known.length >= 2) {
    const target = direction === "min" ? Math.min(...known.map((k) => k[0])) : Math.max(...known.map((k) => k[0]));
    best = known.filter((k) => k[0] === target).map((k) => k[1]);
    if (best.length === known.length) best = []; // alle gleich: keine Hervorhebung
  }
  return { key, label, values: nums.map((n) => (n === null ? DASH : fmt(n))), unknown: nums.map((n) => n === null), best };
}

function textRow(key: string, label: string, values: (string | null)[]): ComparisonRow {
  return { key, label, values: values.map((v) => v ?? DASH), unknown: values.map((v) => v === null), best: [] };
}

const AVAIL: Record<string, Record<Lang, string>> = {
  available: { de: "verfügbar", en: "available" },
  restricted: { de: "eingeschränkt", en: "restricted" },
  unavailable: { de: "nicht verfügbar", en: "not available" },
  unknown: { de: "nicht bestätigt", en: "not confirmed" },
};

export function buildComparison(items: ComparisonItem[], country: Country, lang: Lang): Comparison {
  if (items.length < 2 || items.length > 3) throw new RangeError("buildComparison: 2 bis 3 Produkte");
  const type = items[0]!.product.type;
  if (items.some((i) => i.product.type !== type)) throw new Error("buildComparison: nur gleicher Produkttyp");
  const de = lang === "de";
  const eur = (n: number): string => formatEur(n, lang);
  const pct = (n: number): string => formatPct(n, lang);
  const P = items.map((i) => i.product);

  const rows: ComparisonRow[] = [
    textRow("availability", de ? `Verfügbarkeit in ${countryAfterIn(country, "de")}` : `Availability in ${countryAfterIn(country, "en")}`, P.map((p) => AVAIL[availabilityFor(p, country.code)]![lang])),
    textRow("authorisation", de ? "Zulassung (maßgeblicher Rechtsträger)" : "Authorisation (relevant entity)", items.map((i) => AUTHORIZATION_LABEL[relevantAuthorization(i.provider, i.product)][lang])),
    textRow(
      "data_controller",
      de ? "Datenverantwortlicher" : "Data controller",
      items.map((i) => {
        const c = i.provider.dataControllerCountry;
        if (!c) return null;
        return `${regionName(c, lang)}${isEea(c) ? (de ? " (EWR)" : " (EEA)") : de ? " (außerhalb EWR)" : " (outside EEA)"}`;
      }),
    ),
  ];

  if (type === "card") {
    rows.push(
      textRow("custody", de ? "Verwahrung" : "Custody", P.map((p) => CUSTODY_LABEL[p.custody][lang])),
      textRow("funding_flow", de ? "Zahlungsquelle" : "Funding source", P.map((p) => FUNDING_FLOW_LABEL[p.fundingFlow][lang])),
      numericRow("issuance", de ? "Ausgabe (physisch)" : "Issuance (physical)", P.map((p) => p.fees.issuancePhysicalEur), eur, "min"),
      numericRow("issuance_virtual", de ? "Ausgabe (virtuell)" : "Issuance (virtual)", P.map((p) => p.fees.issuanceVirtualEur), eur, "min"),
      numericRow("monthly", de ? "Monatsgebühr" : "Monthly fee", P.map((p) => p.fees.monthlyEur), eur, "min"),
      numericRow("fx", de ? "Fremdwährungsaufschlag" : "FX markup", P.map((p) => p.fees.fxMarkupPct), pct, "min"),
      numericRow("atm_free", de ? "Automat frei pro Monat" : "Free ATM per month", P.map((p) => p.fees.atmFreeLimitEurPerMonth), eur, "max"),
      numericRow("cashback_no_staking", de ? "Cashback ohne Staking" : "Cashback without staking", P.map((p) => (p.rewards.staking.required === true ? p.rewards.baseCashbackPct : p.rewards.staking.required === false ? (p.rewards.maxCashbackPct ?? p.rewards.baseCashbackPct) : null)), pct, "max"),
      textRow("cashback", de ? "Cashback-Bedingungen" : "Cashback terms", P.map((p) => {
        const s = cashbackSummary(p.rewards, lang);
        return s.known ? s.text : null;
      })),
      textRow("stablecoins", "Stablecoins", P.map((p) => (p.stablecoins === null ? null : p.stablecoins.length ? p.stablecoins.join(", ") : de ? "keine" : "none"))),
      textRow("wallets", "Apple / Google Pay", P.map((p) => {
        const w = p.card?.mobileWallets ?? null;
        if (w === null) return null;
        if (w.length === 0) return de ? "nein" : "no";
        return w.map((x) => (x === "apple_pay" ? "Apple Pay" : "Google Pay")).join(", ");
      })),
      textRow("forms", de ? "Kartenform" : "Card form", P.map((p) => {
        const f = p.card?.forms ?? null;
        if (f === null) return null;
        return f.map((x) => (x === "virtual" ? (de ? "virtuell" : "virtual") : de ? "physisch" : "physical")).join(", ");
      })),
    );
  } else {
    rows.push(
      numericRow("spot_maker", "Spot Maker", P.map((p) => p.fees.spotMakerPct), pct, "min"),
      numericRow("spot_taker", de ? "Spot Taker / Spread" : "Spot taker / spread", P.map((p) => p.fees.spotTakerPct), pct, "min"),
      textRow("deposit", de ? "Einzahlung (geprüft)" : "Deposit (verified)", P.map((p) => (p.depositMethods && p.depositMethods.length ? p.depositMethods.map((m) => depositMethodLabel(m, lang)).join(", ") : null))),
      numericRow("assets", de ? "Kryptowerte" : "Crypto assets", P.map((p) => p.assetCount), (n) => String(n), "max"),
    );
  }

  return { type, headers: P.map((p) => p.name), rows };
}
