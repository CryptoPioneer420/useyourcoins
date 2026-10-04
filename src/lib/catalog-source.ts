/**
 * Eine Datenquelle für die ganze App, umschaltbar per VITE_DATA_SOURCE:
 * - "seed" (Default, Meilensteine 1–3): data/seed.json, keine Partnerlinks
 * - "supabase" (ab Meilenstein 4): fetchCatalog() mit RLS und public_offers
 * Komponenten importieren nur loadCatalog(), nie seed.json oder Supabase direkt.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Catalog } from "./types";
import { loadSeedCatalog } from "./seed-catalog";
import { fetchCatalog } from "./data-access";

export type CatalogSource = "seed" | "supabase";

export function catalogSourceFromEnv(value: string | undefined | null): CatalogSource {
  return value === "supabase" ? "supabase" : "seed";
}

export async function loadCatalog(source: CatalogSource, client?: SupabaseClient | null): Promise<Catalog> {
  if (source === "supabase") {
    if (!client) throw new Error("loadCatalog: Supabase-Client fehlt für Quelle 'supabase'");
    return fetchCatalog(client);
  }
  return loadSeedCatalog();
}
