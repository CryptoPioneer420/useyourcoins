/**
 * Kostenrechner: Was kostet bzw. bringt eine Karte bei meinem Nutzungsverhalten pro Jahr?
 * Reines Rechenbeispiel aus den gespeicherten Konditionen, keine Prognose und keine Empfehlung.
 * Fehlt ein benötigter Wert, ist das Ergebnis unvollständig (netEur = null), nie geschätzt.
 */
import type { CardForm, I18n, Product } from "./types";

export interface CostScenario {
  /** Kartenumsatz pro Monat in EUR. */
  monthlySpendEur: number;
  /** Anteil der Zahlungen in Fremdwährung, 0–100. */
  foreignSharePct: number;
  /** Bargeldabhebungen pro Monat in EUR. */
  atmWithdrawalEurPerMonth: number;
  /** Welche Ausgabegebühr zählt. */
  cardForm: CardForm;
  /** Cashback-Höchstsatz mit Staking einrechnen (nur wenn Staking nötig ist). */
  useStakingTier: boolean;
  /** Zeitraum in Monaten, Default 12. */
  months?: number;
}

export type CostLineKey = "cashback" | "issuance" | "monthly" | "fx" | "atm";

export interface CostLine {
  key: CostLineKey;
  label: I18n;
  /** Positiv = Ertrag (Cashback), negativ = Kosten. null = nicht berechenbar. */
  amountEur: number | null;
}

export type CostNoteCode =
  | "cashback_in_token"
  | "staking_capital_locked"
  | "staking_terms_unknown"
  | "example_only";

export interface CostResult {
  productId: string;
  months: number;
  lines: CostLine[];
  /** Summe aller Zeilen; null, wenn eine benötigte Angabe fehlt. */
  netEur: number | null;
  missing: CostLineKey[];
  notes: CostNoteCode[];
}

export const COST_LINE_LABEL: Record<CostLineKey, I18n> = {
  cashback: { de: "Cashback", en: "Cashback" },
  issuance: { de: "Ausgabegebühr (einmalig)", en: "Issuance fee (one-off)" },
  monthly: { de: "Monatsgebühren", en: "Monthly fees" },
  fx: { de: "Fremdwährungsaufschlag", en: "FX markup" },
  atm: { de: "Automatengebühren über Freigrenze", en: "ATM fees above free limit" },
};

export const COST_NOTE_LABEL: Record<CostNoteCode, I18n> = {
  cashback_in_token: {
    de: "Cashback wird in einem Krypto-Token ausgezahlt; sein Euro-Wert schwankt.",
    en: "Cashback is paid in a crypto token; its euro value fluctuates.",
  },
  staking_capital_locked: {
    de: "Der Höchstsatz setzt gesperrtes Kapital in einem Token voraus; dessen Kursrisiko ist nicht eingerechnet.",
    en: "The top rate requires capital locked in a token; its price risk is not included.",
  },
  staking_terms_unknown: {
    de: "Ob der Cashback-Satz Staking voraussetzt, ist nicht geprüft; Cashback daher nicht eingerechnet.",
    en: "Whether the cashback rate requires staking is not verified; cashback is therefore not included.",
  },
  example_only: {
    de: "Rechenbeispiel aus den gespeicherten Konditionen. Keine Prognose, keine Empfehlung, Steuern nicht berücksichtigt.",
    en: "Example calculation from stored terms. Not a forecast, not a recommendation, taxes not considered.",
  },
};

const STABLE_OR_FIAT = new Set(["EUR", "USD", "USDC", "EURC", "EURE"]);
const round2 = (n: number): number => Math.round(n * 100) / 100;

function validate(s: CostScenario): void {
  const checks: [string, number, number, number][] = [
    ["monthlySpendEur", s.monthlySpendEur, 0, 1_000_000],
    ["foreignSharePct", s.foreignSharePct, 0, 100],
    ["atmWithdrawalEurPerMonth", s.atmWithdrawalEurPerMonth, 0, 1_000_000],
    ["months", s.months ?? 12, 1, 120],
  ];
  for (const [name, v, min, max] of checks) {
    if (!Number.isFinite(v) || v < min || v > max) throw new RangeError(`${name} außerhalb ${min}–${max}: ${v}`);
  }
}

export function calculateCost(product: Product, scenario: CostScenario): CostResult {
  if (product.type !== "card") throw new Error("calculateCost: nur für Karten");
  validate(scenario);
  const months = scenario.months ?? 12;
  const f = product.fees;
  const r = product.rewards;
  const notes: CostNoteCode[] = ["example_only"];
  const lines: CostLine[] = [];
  const add = (key: CostLineKey, amountEur: number | null): void => {
    lines.push({ key, label: COST_LINE_LABEL[key], amountEur: amountEur === null ? null : round2(amountEur) });
  };

  // Cashback
  let rate: number | null;
  if (r.staking.required === true) {
    rate = scenario.useStakingTier ? r.maxCashbackPct : r.baseCashbackPct;
    if (scenario.useStakingTier) notes.push("staking_capital_locked");
  } else if (r.staking.required === false) {
    rate = r.maxCashbackPct ?? r.baseCashbackPct;
  } else {
    rate = r.baseCashbackPct;
    if (rate === null && r.maxCashbackPct !== null) notes.push("staking_terms_unknown");
  }
  if (scenario.monthlySpendEur === 0) rate = rate ?? 0;
  add("cashback", rate === null ? null : (scenario.monthlySpendEur * months * rate) / 100);
  if (rate !== null && rate > 0 && r.rewardToken && !STABLE_OR_FIAT.has(r.rewardToken.toUpperCase())) {
    notes.push("cashback_in_token");
  }

  // Ausgabe
  const issuance = scenario.cardForm === "virtual" ? f.issuanceVirtualEur : f.issuancePhysicalEur;
  add("issuance", issuance === null ? null : -issuance);

  // Monatlich
  add("monthly", f.monthlyEur === null ? null : -f.monthlyEur * months);

  // Fremdwährung
  const foreignVolume = (scenario.monthlySpendEur * scenario.foreignSharePct) / 100;
  add("fx", foreignVolume === 0 ? 0 : f.fxMarkupPct === null ? null : (-foreignVolume * f.fxMarkupPct * months) / 100);

  // Automat
  let atm: number | null;
  if (scenario.atmWithdrawalEurPerMonth === 0) atm = 0;
  else if (f.atmFreeLimitEurPerMonth === null) atm = null;
  else {
    const over = Math.max(0, scenario.atmWithdrawalEurPerMonth - f.atmFreeLimitEurPerMonth);
    atm = over === 0 ? 0 : f.atmFeePctOverLimit === null ? null : (-over * f.atmFeePctOverLimit * months) / 100;
  }
  add("atm", atm);

  const missing = lines.filter((l) => l.amountEur === null).map((l) => l.key);
  const netEur = missing.length ? null : round2(lines.reduce((s, l) => s + (l.amountEur as number), 0));
  return { productId: product.id, months, lines, netEur, missing, notes };
}

export const DEFAULT_SCENARIO: CostScenario = {
  monthlySpendEur: 500,
  foreignSharePct: 10,
  atmWithdrawalEurPerMonth: 100,
  cardForm: "physical",
  useStakingTier: false,
  months: 12,
};
