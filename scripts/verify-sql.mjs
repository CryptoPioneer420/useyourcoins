#!/usr/bin/env node
/**
 * Spielt Migrationen + Seed in eine In-Memory-Postgres-Instanz (PGlite) ein
 * und prüft Kernannahmen. Ersetzt keinen Test gegen Supabase, fängt aber
 * Syntax-, Typ- und Constraint-Fehler vor dem Einspielen ab.
 * Aufruf: node scripts/verify-sql.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(root, p), "utf8");

const db = new PGlite();
// Supabase-Rollen nachbilden
await db.exec(`
  do $$ begin
    if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  end $$;
`);

const files = [
  "supabase/migrations/001_init.sql",
  "supabase/migrations/002_extend.sql",
  "supabase/migrations/003_card_details.sql",
  "supabase/migrations/004_exchange_fields.sql",
  "supabase/seed/seed_v1.sql",
  // zweiter Lauf: Idempotenz der jüngsten Migrationen und des Seeds
  "supabase/migrations/003_card_details.sql",
  "supabase/migrations/004_exchange_fields.sql",
  "supabase/seed/seed_v1.sql",
];
for (const f of files) {
  try {
    await db.exec(read(f));
    console.log(`OK  ${f}`);
  } catch (e) {
    console.error(`ERR ${f}: ${e.message}`);
    process.exit(1);
  }
}

const one = async (sql) => (await db.query(sql)).rows;
const checks = [
  ["14 Anbieter", "select count(*)::int as n from providers", (r) => r[0].n === 14],
  ["23 Produkte", "select count(*)::int as n from products", (r) => r[0].n === 23],
  ["8 Länder je Produkt", "select count(*)::int as n from product_availability", (r) => r[0].n === 23 * 8],
  ["Bybit EU in MT nicht verfügbar", "select pa.status from product_availability pa join products p on p.id = pa.product_id where p.slug = 'bybit-eu-card' and pa.country_code = 'MT'", (r) => r[0].status === "unavailable"],
  ["Gnosis Pay wind_down mit Datum", "select status, wind_down_date::text as d from products where slug = 'gnosis-pay-card'", (r) => r[0].status === "wind_down" && r[0].d === "2026-12-20"],
  ["UAB Monavate einmal, 4 Verknüpfungen", "select count(distinct le.id)::int as e, count(*)::int as l from provider_entities pe join legal_entities le on le.id = pe.entity_id where le.legal_name = 'UAB Monavate'", (r) => r[0].e === 1 && r[0].l === 4],
  ["Steuer-Grundzüge für alle 8 Länder", "select count(*)::int as n from countries where tax_summary is not null", (r) => r[0].n === 8],
  ["Trustpilot standardmäßig aus", "select count(*)::int as n from public_trustpilot", (r) => r[0].n === 0],
  ["Keine öffentlichen Offers ohne Links", "select count(*)::int as n from public_offers", (r) => r[0].n === 0],
  ["KYC full für 13 Karten, RedotPay ungeprüft", "select count(*) filter (where kyc_level = 'full')::int as f, count(*) filter (where kyc_level is null)::int as n from products where product_type = 'card'", (r) => r[0].f === 13 && r[0].n === 1],
  ["apple_google_pay entfernt, fee_issuance_physical_eur vorhanden", "select count(*) filter (where column_name = 'apple_google_pay')::int as a, count(*) filter (where column_name = 'fee_issuance_physical_eur')::int as p from information_schema.columns where table_name = 'products'", (r) => r[0].a === 0 && r[0].p === 1],
  ["SEPA als Einzahlungsweg bei Revolut/Trade Republic (4 Produkte)", "select count(*)::int as n from products where 'sepa' = any(deposit_methods)", (r) => r[0].n === 4],
  ["sepa_deposit und fee_trading_pct entfernt", "select count(*)::int as n from information_schema.columns where table_name = 'products' and column_name in ('sepa_deposit','fee_trading_pct')", (r) => r[0].n === 0],
  ["Stablecoins null = unbekannt erhalten", "select supported_stablecoins is null as u from products where slug = 'kraken-card'", (r) => r[0].u === true],
];

let failed = 0;
for (const [label, sql, ok] of checks) {
  const rows = await one(sql);
  const pass = ok(rows);
  if (!pass) failed++;
  console.log(`${pass ? "PASS" : "FAIL"} ${label}${pass ? "" : " → " + JSON.stringify(rows)}`);
}

// Constraint-Tests: dürfen NICHT durchgehen
const mustFail = [
  ["http-Ziel-URL abgelehnt", "insert into affiliate_links (product_id, slug, target_url) select id, 'x-http', 'http://example.com' from products limit 1"],
  ["Sub-ID mit Großbuchstaben abgelehnt", "insert into click_events (subid) values ('Q-DE-Max.Mustermann')"],
  ["FX > 20 % abgelehnt", "update products set fee_fx_pct = 25 where slug = 'bitpanda-card'"],
  ["Unbekannte Wallet abgelehnt", "update products set mobile_wallets = array['samsung_pay'] where slug = 'bitpanda-card'"],
  ["Kartenfelder bei Börse abgelehnt", "update products set kyc_level = 'full' where slug = 'bitpanda-exchange'"],
  ["Spot-Gebühr bei Karte abgelehnt", "update products set fee_spot_taker_pct = 0.1 where slug = 'bitpanda-card'"],
  ["Unbekannter Einzahlungsweg abgelehnt", "update products set deposit_methods = array['paypal'] where slug = 'bitpanda-exchange'"],
  ["Badge ohne Art abgelehnt", "insert into affiliate_links (product_id, slug, target_url, badge_text) select id, 'x-badge', 'https://example.com', '{\"de\":\"Top\",\"en\":\"Top\"}'::jsonb from products limit 1"],
];
for (const [label, sql] of mustFail) {
  try {
    await db.exec(sql);
    failed++;
    console.log(`FAIL ${label} (wurde akzeptiert)`);
  } catch {
    console.log(`PASS ${label}`);
  }
}

// Positivtest Affiliate-Link + View
await db.exec(`insert into affiliate_links (product_id, slug, target_url, enabled, affiliate_model, subid_param)
  select id, 'bitpanda-card', 'https://example.com/ref?x=1', true, 'cpa', 'subid' from products where slug = 'bitpanda-card'`);
const offers = await one("select * from public_offers");
const viewOk = offers.length === 1 && offers[0].slug === "bitpanda-card" && !("target_url" in offers[0]) && "promo_code" in offers[0] && "badge_kind" in offers[0];
if (!viewOk) failed++;
console.log(`${viewOk ? "PASS" : "FAIL"} public_offers zeigt Link ohne target_url${viewOk ? "" : " → " + JSON.stringify(offers)}`);

await db.close();
if (failed) {
  console.error(`${failed} Prüfung(en) fehlgeschlagen`);
  process.exit(1);
}
console.log("Alle SQL-Prüfungen bestanden.");
