/**
 * Einstieg für den Startdatensatz (14 Anbieter, 23 Produkte, 8 Länder) aus data/seed.json.
 * In Seiten nicht direkt verwenden, sondern über loadCatalog() aus src/lib/catalog-source.ts.
 */
import { loadSeedCatalog, SEED_VERSION } from "../lib/seed-catalog";
import type { Catalog, Confidence } from "../lib/types";

export { loadSeedCatalog, SEED_VERSION };

/** "verified" heißt: gegen die Primärquelle geprüft. Alles andere wird als ungeprüft angezeigt. */
export function isVerified(item: { confidence: Confidence }): boolean {
  return item.confidence === "verified";
}

export interface SeedCoverage {
  providers: number;
  products: number;
  cards: number;
  exchanges: number;
  /** Produkte, die gegen die Primärquelle geprüft sind. */
  productsVerified: number;
  /** Zellen Produkt × Land. */
  availabilityCells: number;
  availabilityUnknown: number;
  /** Produkte, bei denen in keinem Land die Verfügbarkeit bekannt ist. */
  productsWithoutAvailability: string[];
  cardsWithAnyFee: number;
  cardsWithCashback: number;
  exchangesWithTakerFee: number;
}

/** Zählt, was im Datensatz belegt ist und was fehlt. Grundlage für die Datenpflege vor dem Start. */
export function seedCoverage(catalog: Catalog = loadSeedCatalog()): SeedCoverage {
  const cards = catalog.products.filter((p) => p.type === "card");
  const exchanges = catalog.products.filter((p) => p.type === "exchange");
  const cells = catalog.products.flatMap((p) => p.availability);
  return {
    providers: catalog.providers.length,
    products: catalog.products.length,
    cards: cards.length,
    exchanges: exchanges.length,
    productsVerified: catalog.products.filter(isVerified).length,
    availabilityCells: cells.length,
    availabilityUnknown: cells.filter((a) => a.status === "unknown").length,
    productsWithoutAvailability: catalog.products.filter((p) => p.availability.every((a) => a.status === "unknown")).map((p) => p.slug),
    cardsWithAnyFee: cards.filter((p) => [p.fees.issuanceVirtualEur, p.fees.issuancePhysicalEur, p.fees.monthlyEur, p.fees.fxMarkupPct].some((v) => v !== null)).length,
    cardsWithCashback: cards.filter((p) => p.rewards.baseCashbackPct !== null || p.rewards.maxCashbackPct !== null).length,
    exchangesWithTakerFee: exchanges.filter((p) => p.fees.spotTakerPct !== null).length,
  };
}
