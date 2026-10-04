/**
 * Filter für Vergleichstabelle und Länderseiten.
 * Unbekannte Werte werden nicht stillschweigend als "nein" behandelt:
 * includeUnknown = true (Default) zeigt sie an und markiert das Feld als unsicher.
 */
import type {
  AuthorizationType,
  CardKind,
  Catalog,
  CountryCode,
  CustodyModel,
  DepositMethod,
  FundingFlow,
  MobileWallet,
  Product,
  ProductType,
  Provider,
} from "./types";
import { availabilityFor, hasEeaEntity, relevantAuthorization } from "./matching";
import { isEea } from "./countries";

export interface ProductFilters {
  country?: CountryCode;
  type?: ProductType;
  cardKinds?: CardKind[];
  custody?: CustodyModel[];
  fundingFlows?: FundingFlow[];
  /** z. B. "USDC", "EURC", "EURe" */
  stablecoin?: string;
  /** Irgendein Stablecoin als Zahlungsquelle. */
  anyStablecoin?: boolean;
  /** Mindestens einer der Einzahlungswege. */
  depositMethods?: DepositMethod[];
  noStaking?: boolean;
  /** Mindestens eine der genannten Wallets. */
  mobileWallets?: MobileWallet[];
  /** Virtuelle Karte sofort verfügbar. */
  virtualCard?: boolean;
  /** Nur Anbieter mit MiCA-Zulassung, Art.-60-Berechtigung oder Bank. */
  euAuthorisedOnly?: boolean;
  dataControllerInEea?: boolean;
  maxFxPct?: number;
  maxMonthlyEur?: number;
  /** Sitzländer (ISO-2) eines beliebigen Rechtsträgers des Anbieters. */
  entitySeats?: string[];
  includeUnknown?: boolean;
  includeWindDown?: boolean;
}

export type UncertainField =
  | "availability"
  | "stablecoins"
  | "staking"
  | "mobileWallets"
  | "virtualCard"
  | "depositMethods"
  | "authorisation"
  | "dataController"
  | "fxMarkup"
  | "monthlyFee";

export interface FilteredProduct {
  product: Product;
  provider: Provider;
  uncertain: UncertainField[];
}

const STRONG_AUTH: ReadonlySet<AuthorizationType> = new Set(["casp_art63", "art60_notified", "bank"]);

/** Dreiwertiger Check: true = passt, false = passt nicht, null = unbekannt. */
type Tri = boolean | null;

/**
 * "EU-reguliert" je Produkt:
 * - verwahrt/Börse: maßgeblicher Krypto-Rechtsträger mit MiCA-Zulassung, Art. 60 oder Bank.
 * - Self-Custody-Karte: Kartenherausgeber ist E-Geld-Institut/Bank mit Sitz im EWR.
 */
export function euAuthorised(provider: Provider, product: Product): Tri {
  const auth = relevantAuthorization(provider, product);
  if (auth === "none_found") return false;
  if (auth === "unverified") return null;
  if (product.type === "card" && product.custody === "self_custody") {
    if (auth !== "emi" && !STRONG_AUTH.has(auth)) return false;
    return hasEeaEntity(provider, product);
  }
  return STRONG_AUTH.has(auth);
}

export function applyFilters(catalog: Catalog, filters: ProductFilters): FilteredProduct[] {
  const includeUnknown = filters.includeUnknown ?? true;
  const providers = new Map(catalog.providers.map((p) => [p.id, p]));
  const out: FilteredProduct[] = [];

  for (const product of catalog.products) {
    const provider = providers.get(product.providerId);
    if (!provider) continue;
    if (product.status === "discontinued") continue;
    if (product.status === "wind_down" && filters.includeWindDown === false) continue;
    if (filters.type && product.type !== filters.type) continue;

    const uncertain: UncertainField[] = [];
    const checks: [UncertainField, Tri][] = [];

    if (filters.country) {
      const s = availabilityFor(product, filters.country);
      if (s === "unavailable") continue;
      if (s === "unknown") uncertain.push("availability");
    }
    if (filters.cardKinds?.length && product.card) {
      if (!product.card.kind || !filters.cardKinds.includes(product.card.kind)) continue;
    }
    if (filters.custody?.length && !filters.custody.includes(product.custody)) continue;
    if (filters.fundingFlows?.length && !filters.fundingFlows.includes(product.fundingFlow)) continue;

    if (filters.stablecoin) {
      const want = filters.stablecoin.toUpperCase();
      checks.push(["stablecoins", product.stablecoins === null ? null : product.stablecoins.some((s) => s.toUpperCase() === want)]);
    }
    if (filters.anyStablecoin) {
      checks.push(["stablecoins", product.stablecoins === null ? null : product.stablecoins.length > 0]);
    }
    if (filters.depositMethods?.length) {
      const dm = product.depositMethods;
      const want = filters.depositMethods;
      checks.push(["depositMethods", dm === null ? null : want.some((m) => dm.includes(m)) ? true : null]);
    }
    if (filters.noStaking) {
      const req = product.rewards.staking.required;
      checks.push(["staking", req === null ? null : !req]);
    }
    if (filters.mobileWallets?.length && product.type === "card") {
      const mw = product.card?.mobileWallets ?? null;
      checks.push(["mobileWallets", mw === null ? null : filters.mobileWallets.some((w) => mw.includes(w))]);
    }
    if (filters.virtualCard && product.type === "card") {
      const forms = product.card?.forms ?? null;
      checks.push(["virtualCard", forms === null ? null : forms.includes("virtual")]);
    }
    if (filters.euAuthorisedOnly) {
      checks.push(["authorisation", euAuthorised(provider, product)]);
    }
    if (filters.dataControllerInEea) {
      checks.push(["dataController", isEea(provider.dataControllerCountry)]);
    }
    if (filters.maxFxPct !== undefined && product.type === "card") {
      const fx = product.fees.fxMarkupPct;
      checks.push(["fxMarkup", fx === null ? null : fx <= filters.maxFxPct]);
    }
    if (filters.maxMonthlyEur !== undefined && product.type === "card") {
      const m = product.fees.monthlyEur;
      checks.push(["monthlyFee", m === null ? null : m <= filters.maxMonthlyEur]);
    }
    if (filters.entitySeats?.length) {
      const seats = new Set(filters.entitySeats.map((s) => s.toUpperCase()));
      if (!provider.entities.some((pe) => pe.entity.seatCountry && seats.has(pe.entity.seatCountry.toUpperCase()))) continue;
    }

    let rejected = false;
    for (const [field, result] of checks) {
      if (result === false) {
        rejected = true;
        break;
      }
      if (result === null) {
        if (!includeUnknown) {
          rejected = true;
          break;
        }
        uncertain.push(field);
      }
    }
    if (rejected) continue;
    out.push({ product, provider, uncertain });
  }

  return out.sort((a, b) => a.provider.name.localeCompare(b.provider.name) || a.product.name.localeCompare(b.product.name));
}

/** Für Filter-UI: alle vorkommenden Stablecoins. */
export function availableStablecoins(catalog: Catalog): string[] {
  const set = new Set<string>();
  for (const p of catalog.products) for (const s of p.stablecoins ?? []) set.add(s);
  return [...set].sort();
}
