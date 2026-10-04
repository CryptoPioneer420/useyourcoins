/** Test-Helfer. Der Seed-Katalog selbst liegt in src/lib/seed-catalog.ts. */
import type { Catalog, Product } from "../types";

export { loadSeedCatalog } from "../seed-catalog";

/** Kopie mit gezielten Änderungen an einem Produkt (für Szenario-Tests). */
export function withProduct(catalog: Catalog, slug: string, patch: (p: Product) => Product): Catalog {
  return { ...catalog, products: catalog.products.map((p) => (p.slug === slug ? patch(p) : p)) };
}
