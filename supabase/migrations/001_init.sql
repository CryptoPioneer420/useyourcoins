-- 001_init.sql — Krypto-Spending-Guide (Betreiber: DATAMINT LLC)
-- Ziel: Supabase Postgres, EU-Region (Frankfurt). Content-Site, kein Multi-Tenant.
-- Prinzipien:
--   1. Jede inhaltliche Aussage hat verified_at + source_url (Claims-Register via source_refs).
--   2. Affiliate-Ziel-URLs sind NIE öffentlich lesbar; Zugriff nur über /go/:slug (service role).
--   3. Klick-Logging ohne IP, ohne User-Agent, ohne persistente ID.
--   4. Texte sind i18n-jsonb: {"de": "...", "en": "..."}.

begin;

-- ---------- Enums ----------
create type product_type        as enum ('card', 'exchange');
create type card_kind           as enum ('debit', 'prepaid', 'credit', 'collateral_credit');
create type custody_model       as enum ('custodial', 'self_custody', 'hybrid', 'not_applicable');
create type funding_flow        as enum ('auto_sell_per_payment', 'prefunded_fiat', 'prefunded_stablecoin', 'credit_line', 'mixed', 'unknown');
create type product_status      as enum ('active', 'wind_down', 'discontinued');
create type entity_role         as enum ('casp', 'bank', 'emi', 'program_manager', 'card_issuer', 'custodian', 'data_controller', 'operator');
create type authorization_type  as enum ('casp_art63', 'art60_notified', 'emi', 'bank', 'none_found', 'unverified');
create type availability_status as enum ('available', 'restricted', 'unavailable', 'unknown');
create type confidence_level    as enum ('verified', 'secondary', 'unverified');
create type trustpilot_license  as enum ('none', 'pending', 'licensed');

-- ---------- Helper ----------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Länder ----------
create table countries (
  code                  char(2) primary key,
  name                  jsonb not null,
  mica_authority        text,
  mica_transition_ended date,
  tax_summary           jsonb,                -- Grundzüge, KEINE Beratung
  tax_uncertain         boolean not null default false,
  tax_verified_at       date,
  tax_source_url        text,
  ad_label              text not null default 'Ad',   -- lokales Werbe-Label am Affiliate-Link
  is_launch_country     boolean not null default false,
  sort                  int not null default 100
);

-- ---------- Anbieter (Marke) ----------
create table providers (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  name                  text not null,
  website_url           text,
  description           jsonb,
  data_controller_note  jsonb,                -- wer ist DSGVO-Verantwortlicher
  data_residency_note   jsonb,                -- Speicherort / Drittlandtransfer
  kyc_note              jsonb,
  protection_note       jsonb,                -- Einlagensicherung / Segregation
  is_published          boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create trigger providers_updated before update on providers
  for each row execute function set_updated_at();

-- ---------- Rechtsträger ----------
create table legal_entities (
  id                uuid primary key default gen_random_uuid(),
  legal_name        text not null,
  seat_country      char(2),
  registration_no   text,
  regulator         text,
  auth_status       authorization_type not null default 'unverified',
  esma_register_ref text,
  passport_note     text,
  confidence        confidence_level not null default 'unverified',
  verified_at       date,
  source_url        text
);

create table provider_entities (
  provider_id uuid not null references providers(id) on delete cascade,
  entity_id   uuid not null references legal_entities(id) on delete cascade,
  role        entity_role not null,
  scope_note  text,                           -- z. B. 'Earn/Borrow ausserhalb dieser Zulassung'
  primary key (provider_id, entity_id, role)
);

-- ---------- Produkte (Karte / Börse) ----------
create table products (
  id                    uuid primary key default gen_random_uuid(),
  provider_id           uuid not null references providers(id) on delete cascade,
  slug                  text not null unique,
  product_type          product_type not null,
  name                  text not null,
  status                product_status not null default 'active',
  wind_down_date        date,
  card_kind             card_kind,
  custody               custody_model not null default 'not_applicable',
  funding_flow          funding_flow not null default 'unknown',
  supported_stablecoins text[] not null default '{}',
  stablecoin_direct     boolean,
  auto_swap             boolean,
  apple_google_pay      boolean,
  staking_required      boolean,
  staking_min_eur       numeric(12,2),
  fee_issuance_eur      numeric(8,2),
  fee_monthly_eur       numeric(8,2),
  fee_fx_pct            numeric(5,2),
  fee_atm_note          jsonb,
  fee_note              jsonb,
  cashback_max_pct      numeric(5,2),
  cashback_note         jsonb,
  is_published          boolean not null default false,
  confidence            confidence_level not null default 'unverified',
  verified_at           date,
  source_url            text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint card_fields_only_for_cards
    check (product_type = 'card' or (card_kind is null and apple_google_pay is null))
);
create index products_provider_idx on products(provider_id);
create trigger products_updated before update on products
  for each row execute function set_updated_at();

-- ---------- Verfügbarkeit je Land ----------
create table product_availability (
  product_id   uuid not null references products(id) on delete cascade,
  country_code char(2) not null references countries(code),
  status       availability_status not null default 'unknown',
  note         jsonb,
  verified_at  date,
  source_url   text,
  primary key (product_id, country_code)
);
create index product_availability_country_idx on product_availability(country_code);

-- ---------- Affiliate-Links (nie öffentlich lesbar) ----------
create table affiliate_links (
  id                 uuid primary key default gen_random_uuid(),
  product_id         uuid not null references products(id) on delete cascade,
  slug               text not null unique,     -- /go/:slug
  network            text,
  target_url         text not null,
  enabled            boolean not null default false,
  payout_model       text,                     -- intern
  payout_note        text,                     -- intern
  program_terms_url  text,
  bonus_text         jsonb,
  bonus_conditions   jsonb,
  bonus_verified_at  date,
  excluded_countries char(2)[] not null default '{}',
  risk_note          text,                     -- intern
  last_checked_at    date,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger affiliate_links_updated before update on affiliate_links
  for each row execute function set_updated_at();

-- ---------- Claims-Register ----------
create table source_refs (
  id            uuid primary key default gen_random_uuid(),
  subject_table text not null
    check (subject_table in ('countries','providers','legal_entities','products','product_availability','affiliate_links')),
  subject_id    text not null,
  field         text,
  url           text not null,
  retrieved_at  date not null,
  note          text
);
create index source_refs_subject_idx on source_refs(subject_table, subject_id);

-- ---------- Trustpilot ----------
create table trustpilot_ratings (
  provider_id  uuid primary key references providers(id) on delete cascade,
  tp_domain    text not null,
  score        numeric(2,1),
  review_count int,
  retrieved_at timestamptz,
  license      trustpilot_license not null default 'none'
);

-- ---------- Einstellungen / Feature-Flags ----------
create table site_settings (
  key   text primary key,
  value jsonb not null
);
insert into site_settings (key, value) values
  ('trustpilot_display', 'false'::jsonb);   -- Schalter: UPDATE ... SET value = 'true'

-- ---------- Klick-Events (datensparsam) ----------
create table click_events (
  id          bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  link_id     uuid references affiliate_links(id) on delete set null,
  source_page text,
  lang        text,
  country     char(2),                        -- aus CDN-Header, keine IP
  from_quiz   boolean not null default false
);
create index click_events_time_idx on click_events(occurred_at);
-- Retention: Zeilen > 180 Tage per pg_cron löschen (separat einrichten).

-- ---------- RLS ----------
alter table countries            enable row level security;
alter table providers            enable row level security;
alter table legal_entities       enable row level security;
alter table provider_entities    enable row level security;
alter table products             enable row level security;
alter table product_availability enable row level security;
alter table affiliate_links      enable row level security;   -- keine Policy = nur service role
alter table source_refs          enable row level security;
alter table trustpilot_ratings   enable row level security;   -- nur über View
alter table site_settings        enable row level security;   -- nur über View / service role
alter table click_events         enable row level security;   -- nur service role

create policy countries_read on countries
  for select to anon, authenticated using (true);

create policy providers_read on providers
  for select to anon, authenticated using (is_published);

create policy provider_entities_read on provider_entities
  for select to anon, authenticated
  using (exists (select 1 from providers p where p.id = provider_id and p.is_published));

create policy legal_entities_read on legal_entities
  for select to anon, authenticated
  using (exists (
    select 1 from provider_entities pe
    join providers p on p.id = pe.provider_id
    where pe.entity_id = legal_entities.id and p.is_published));

create policy products_read on products
  for select to anon, authenticated using (is_published);

create policy availability_read on product_availability
  for select to anon, authenticated
  using (exists (select 1 from products p where p.id = product_id and p.is_published));

create policy source_refs_read on source_refs
  for select to anon, authenticated using (true);

-- ---------- Öffentliche Views (laufen bewusst als Owner, zeigen nur freigegebene Spalten) ----------
create view public_offers as
select l.slug, l.product_id, l.bonus_text, l.bonus_conditions,
       l.bonus_verified_at, l.excluded_countries
from affiliate_links l
join products p on p.id = l.product_id and p.is_published
where l.enabled;

create view public_trustpilot as
select r.provider_id, r.tp_domain, r.score, r.review_count, r.retrieved_at
from trustpilot_ratings r
join providers pr on pr.id = r.provider_id and pr.is_published
where coalesce((select (s.value #>> '{}')::boolean
                from site_settings s where s.key = 'trustpilot_display'), false);

grant select on public_offers, public_trustpilot to anon, authenticated;

-- ---------- Seed: Startländer (Stand Recherche 2026-10-01, ungeprüft) ----------
insert into countries (code, name, mica_authority, mica_transition_ended, ad_label, is_launch_country, sort) values
  ('DE', '{"de":"Deutschland","en":"Germany"}',  'BaFin (mit Bundesbank)',        '2025-12-31', 'Werbung',     true, 1),
  ('AT', '{"de":"Österreich","en":"Austria"}',   'FMA',                           '2025-12-31', 'Werbung',     true, 2),
  ('FR', '{"de":"Frankreich","en":"France"}',    'AMF (ACPR für Institute)',      '2026-07-01', 'Publicité',   true, 3),
  ('ES', '{"de":"Spanien","en":"Spain"}',        'CNMV',                          '2025-12-30', 'Publicidad',  true, 4),
  ('IT', '{"de":"Italien","en":"Italy"}',        'Consob / Banca d''Italia',      '2026-06-30', 'Pubblicità',  true, 5),
  ('NL', '{"de":"Niederlande","en":"Netherlands"}', 'AFM (DNB prudenziell)',      '2025-06-30', 'Advertentie', true, 6),
  ('MT', '{"de":"Malta","en":"Malta"}',          'MFSA',                          '2026-07-01', 'Advert',      true, 7),
  ('CY', '{"de":"Zypern","en":"Cyprus"}',        'CySEC (Central Bank of Cyprus für EMT/EMI)', '2026-07-01', 'Διαφήμιση', true, 8);

commit;
