#!/usr/bin/env node
/**
 * Erzeugt supabase/seed/seed_v1.sql aus data/seed.json.
 * Idempotent: Upserts über natürliche Schlüssel (slug, legal_name, code).
 * Aufruf: node scripts/build-seed-sql.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const seed = JSON.parse(readFileSync(resolve(root, "data/seed.json"), "utf8"));
const LAUNCH = ["DE", "AT", "FR", "ES", "IT", "NL", "MT", "CY"];

const ENUMS = {
  product_type: ["card", "exchange"],
  card_kind: ["debit", "prepaid", "credit", "collateral_credit"],
  custody_model: ["custodial", "self_custody", "hybrid", "not_applicable"],
  funding_flow: ["auto_sell_per_payment", "prefunded_fiat", "prefunded_stablecoin", "credit_line", "mixed", "unknown"],
  product_status: ["active", "wind_down", "discontinued"],
  entity_role: ["casp", "bank", "emi", "program_manager", "card_issuer", "custodian", "data_controller", "operator"],
  authorization_type: ["casp_art63", "art60_notified", "emi", "bank", "none_found", "unverified"],
  availability_status: ["available", "restricted", "unavailable", "unknown"],
  confidence_level: ["verified", "secondary", "unverified"],
  card_network: ["visa", "mastercard", "unknown"],
  kyc_level: ["none", "light", "full"],
  card_form: ["virtual", "physical"],
  mobile_wallet: ["apple_pay", "google_pay"],
  deposit_method: ["sepa", "card", "apple_pay", "google_pay", "crypto"],
};

const errors = [];
function check(kind, value, ctx) {
  if (value === null || value === undefined) return;
  if (!ENUMS[kind].includes(value)) errors.push(`${ctx}: ungültiger ${kind} "${value}"`);
}

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const qj = (v) => (v === null || v === undefined ? "null" : `${q(JSON.stringify(v))}::jsonb`);
const qn = (v) => (v === null || v === undefined ? "null" : Number.isFinite(Number(v)) ? String(Number(v)) : "null");
const qb = (v) => (v === null || v === undefined ? "null" : v ? "true" : "false");
const qa = (arr) =>
  arr === null || arr === undefined ? "null" : arr.length === 0 ? "'{}'::text[]" : `array[${arr.map(q).join(",")}]::text[]`;
const qe = (v, type) => (v === null || v === undefined ? "null" : `${q(v)}::${type}`);

const out = [];
out.push(`-- seed_v1.sql — generiert aus data/seed.json (Version ${seed.version}). Nicht manuell bearbeiten.`);
out.push(`-- Voraussetzung: Migrationen 001–004`);
out.push("begin;");
out.push("");

// Länder: Steuer-Grundzüge
out.push("-- Länder");
for (const c of seed.countries) {
  if (!LAUNCH.includes(c.code)) errors.push(`country ${c.code} nicht im Launch-Set`);
  out.push(
    `update countries set name = ${qj(c.name)}, mica_authority = ${q(c.micaAuthority)}, mica_transition_ended = ${qe(c.micaTransitionEnded, "date")}, ad_label = ${q(c.adLabel)}, tax_summary = ${qj(c.taxSummary)}, tax_uncertain = ${qb(c.taxUncertain)}, tax_source_url = ${q(c.taxSourceUrl)}, tax_verified_at = null where code = ${q(c.code)};`,
  );
}
out.push("");

// Rechtsträger (dedupliziert über legal_name)
const entities = new Map();
for (const p of seed.providers) {
  for (const e of p.entities) {
    check("authorization_type", e.authorization, `entity ${e.legalName}`);
    check("confidence_level", e.confidence, `entity ${e.legalName}`);
    for (const r of e.roles) check("entity_role", r, `entity ${e.legalName}`);
    const prev = entities.get(e.legalName);
    if (prev && (prev.authorization !== e.authorization || prev.seatCountry !== e.seatCountry)) {
      errors.push(`entity ${e.legalName}: widersprüchliche Angaben zwischen Anbietern`);
    }
    if (!prev) entities.set(e.legalName, e);
  }
}
out.push("-- Rechtsträger");
for (const e of entities.values()) {
  out.push(
    `insert into legal_entities (legal_name, seat_country, registration_no, regulator, auth_status, confidence, source_url) values (${q(e.legalName)}, ${q(e.seatCountry)}, ${q(e.registrationNo)}, ${q(e.regulator)}, ${qe(e.authorization, "authorization_type")}, ${qe(e.confidence, "confidence_level")}, ${q(e.sourceUrl)})\n  on conflict (legal_name) do update set seat_country = excluded.seat_country, registration_no = excluded.registration_no, regulator = excluded.regulator, auth_status = excluded.auth_status, confidence = excluded.confidence, source_url = excluded.source_url;`,
  );
}
out.push("");

const productSlugs = new Set();
for (const p of seed.providers) {
  out.push(`-- Anbieter: ${p.name}`);
  out.push(
    `insert into providers (slug, name, website_url, data_controller_country, data_controller_note, data_residency_note, kyc_note, protection_note, trustpilot_domain, is_published) values (${q(p.slug)}, ${q(p.name)}, ${q(p.websiteUrl)}, ${q(p.dataControllerCountry)}, ${qj(p.dataControllerNote)}, ${qj(p.dataResidencyNote)}, ${qj(p.kycNote)}, ${qj(p.protectionNote)}, ${q(p.trustpilotDomain)}, true)\n  on conflict (slug) do update set name = excluded.name, website_url = excluded.website_url, data_controller_country = excluded.data_controller_country, data_controller_note = excluded.data_controller_note, data_residency_note = excluded.data_residency_note, kyc_note = excluded.kyc_note, protection_note = excluded.protection_note, trustpilot_domain = excluded.trustpilot_domain;`,
  );

  for (const e of p.entities) {
    for (const role of e.roles) {
      out.push(
        `insert into provider_entities (provider_id, entity_id, role, scope_note) select pr.id, le.id, ${qe(role, "entity_role")}, ${q(e.scopeNote)} from providers pr, legal_entities le where pr.slug = ${q(p.slug)} and le.legal_name = ${q(e.legalName)}\n  on conflict (provider_id, entity_id, role) do update set scope_note = excluded.scope_note;`,
      );
    }
  }

  if (p.trustpilotDomain) {
    out.push(
      `insert into trustpilot_ratings (provider_id, tp_domain, license) select id, ${q(p.trustpilotDomain)}, 'none'::trustpilot_license from providers where slug = ${q(p.slug)}\n  on conflict (provider_id) do update set tp_domain = excluded.tp_domain;`,
    );
  }

  for (const pr of p.products) {
    if (productSlugs.has(pr.slug)) errors.push(`product slug doppelt: ${pr.slug}`);
    productSlugs.add(pr.slug);
    const ctx = `product ${pr.slug}`;
    check("product_type", pr.type, ctx);
    check("product_status", pr.status, ctx);
    check("custody_model", pr.custody, ctx);
    check("funding_flow", pr.fundingFlow, ctx);
    check("confidence_level", pr.confidence, ctx);
    if (pr.type === "card") {
      check("card_kind", pr.cardKind, ctx);
      check("card_network", pr.cardNetwork, ctx);
      check("kyc_level", pr.kycLevel, ctx);
      for (const f of pr.cardForms ?? []) check("card_form", f, ctx);
      for (const w of pr.mobileWallets ?? []) check("mobile_wallet", w, ctx);
    }
    for (const m of pr.depositMethods ?? []) check("deposit_method", m, ctx);
    if (pr.status === "wind_down" && !pr.windDownDate) errors.push(`${ctx}: wind_down ohne Datum`);

    const f = pr.fees ?? {};
    const r = pr.rewards ?? {};
    const isCard = pr.type === "card";
    out.push(
      `insert into products (provider_id, slug, product_type, name, status, wind_down_date, card_kind, card_network, card_forms, mobile_wallets, kyc_level, custody, funding_flow, funding_assets, supported_stablecoins, chains, deposit_methods, asset_count, fee_issuance_virtual_eur, fee_issuance_physical_eur, fee_monthly_eur, fee_fx_pct, atm_free_limit_eur, atm_fee_pct, fee_inactivity_eur, fee_spot_maker_pct, fee_spot_taker_pct, fee_atm_note, fee_note, cashback_base_pct, cashback_max_pct, cashback_note, reward_token, staking_required, staking_min_eur, staking_token, staking_lockup_days, confidence, source_url, is_published)\nselect id, ${q(pr.slug)}, ${qe(pr.type, "product_type")}, ${q(pr.name)}, ${qe(pr.status, "product_status")}, ${qe(pr.windDownDate, "date")}, ${isCard ? qe(pr.cardKind, "card_kind") : "null"}, ${isCard ? q(pr.cardNetwork ?? "unknown") : "null"}, ${isCard ? qa(pr.cardForms) : "null"}, ${isCard ? qa(pr.mobileWallets) : "null"}, ${isCard ? q(pr.kycLevel) : "null"}, ${qe(pr.custody, "custody_model")}, ${qe(pr.fundingFlow, "funding_flow")}, ${qa(pr.fundingAssets)}, ${qa(pr.stablecoins)}, ${qa(pr.chains)}, ${qa(pr.depositMethods)}, ${qn(pr.assetCount)}, ${qn(f.issuanceVirtualEur)}, ${qn(f.issuancePhysicalEur)}, ${qn(f.monthlyEur)}, ${qn(f.fxMarkupPct)}, ${qn(f.atmFreeLimitEurPerMonth)}, ${qn(f.atmFeePctOverLimit)}, ${qn(f.inactivityEur)}, ${qn(f.spotMakerPct)}, ${qn(f.spotTakerPct)}, ${qj(f.atmNote)}, ${qj(f.note)}, ${qn(r.baseCashbackPct)}, ${qn(r.maxCashbackPct)}, ${qj(r.note)}, ${q(r.rewardToken)}, ${qb(r.stakingRequired)}, ${qn(r.stakingMinEur)}, ${q(r.stakingToken)}, ${qn(r.stakingLockupDays)}, ${qe(pr.confidence, "confidence_level")}, ${q(pr.sourceUrl)}, true from providers where slug = ${q(p.slug)}\n  on conflict (slug) do update set name = excluded.name, status = excluded.status, wind_down_date = excluded.wind_down_date, card_kind = excluded.card_kind, card_network = excluded.card_network, card_forms = excluded.card_forms, mobile_wallets = excluded.mobile_wallets, kyc_level = excluded.kyc_level, custody = excluded.custody, funding_flow = excluded.funding_flow, funding_assets = excluded.funding_assets, supported_stablecoins = excluded.supported_stablecoins, chains = excluded.chains, deposit_methods = excluded.deposit_methods, asset_count = excluded.asset_count, fee_issuance_virtual_eur = excluded.fee_issuance_virtual_eur, fee_issuance_physical_eur = excluded.fee_issuance_physical_eur, fee_monthly_eur = excluded.fee_monthly_eur, fee_fx_pct = excluded.fee_fx_pct, atm_free_limit_eur = excluded.atm_free_limit_eur, atm_fee_pct = excluded.atm_fee_pct, fee_inactivity_eur = excluded.fee_inactivity_eur, fee_spot_maker_pct = excluded.fee_spot_maker_pct, fee_spot_taker_pct = excluded.fee_spot_taker_pct, fee_atm_note = excluded.fee_atm_note, fee_note = excluded.fee_note, cashback_base_pct = excluded.cashback_base_pct, cashback_max_pct = excluded.cashback_max_pct, cashback_note = excluded.cashback_note, reward_token = excluded.reward_token, staking_required = excluded.staking_required, staking_min_eur = excluded.staking_min_eur, staking_token = excluded.staking_token, staking_lockup_days = excluded.staking_lockup_days, confidence = excluded.confidence, source_url = excluded.source_url;`,
    );

    for (const country of LAUNCH) {
      const status = pr.availability?.[country] ?? "unknown";
      check("availability_status", status, `${ctx} ${country}`);
      const note = pr.availabilityNote?.[country] ?? pr.availabilityNoteAll ?? null;
      out.push(
        `insert into product_availability (product_id, country_code, status, note, source_url) select id, ${qe(country, "char(2)")}, ${qe(status, "availability_status")}, ${qj(note)}, ${q(pr.sourceUrl)} from products where slug = ${q(pr.slug)}\n  on conflict (product_id, country_code) do update set status = excluded.status, note = excluded.note, source_url = excluded.source_url;`,
      );
    }
  }
  out.push("");
}

out.push("commit;");

if (errors.length) {
  console.error("Seed-Validierung fehlgeschlagen:\n- " + errors.join("\n- "));
  process.exit(1);
}

const target = resolve(root, "supabase/seed/seed_v1.sql");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, out.join("\n") + "\n");
console.log(`OK: ${seed.providers.length} Anbieter, ${productSlugs.size} Produkte, ${entities.size} Rechtsträger → ${target}`);
