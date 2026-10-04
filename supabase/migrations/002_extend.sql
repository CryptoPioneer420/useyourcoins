-- 002_extend.sql — Felder für Matching, Filter, Affiliate-Modell und Tracking
-- Voraussetzung: 001_init.sql
-- Idempotent ausführbar (if not exists / drop if exists).

begin;

-- ---------- Anbieter ----------
alter table providers
  add column if not exists data_controller_country char(2),
  add column if not exists trustpilot_domain        text;

-- ---------- Rechtsträger: natürlicher Schlüssel für Seed-Upserts ----------
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'legal_entities_legal_name_key') then
    alter table legal_entities add constraint legal_entities_legal_name_key unique (legal_name);
  end if;
end $$;

-- ---------- Produkte ----------
alter table products
  add column if not exists card_network        text,
  add column if not exists funding_assets      text[],
  add column if not exists chains              text[],
  add column if not exists sepa_deposit        boolean,
  add column if not exists fee_inactivity_eur  numeric(8,2),
  add column if not exists fee_trading_pct     numeric(5,2),
  add column if not exists cashback_base_pct   numeric(5,2),
  add column if not exists staking_token       text,
  add column if not exists staking_lockup_days int,
  add column if not exists reward_token        text;

-- null = unbekannt, '{}' = geprüft: keine
alter table products alter column supported_stablecoins drop not null;
alter table products alter column supported_stablecoins drop default;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_card_network_check') then
    alter table products add constraint products_card_network_check
      check (card_network is null or card_network in ('visa','mastercard','unknown'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_fee_ranges_check') then
    alter table products add constraint products_fee_ranges_check check (
      (fee_fx_pct is null or fee_fx_pct between 0 and 20) and
      (fee_trading_pct is null or fee_trading_pct between 0 and 10) and
      (cashback_max_pct is null or cashback_max_pct between 0 and 20) and
      (cashback_base_pct is null or cashback_base_pct between 0 and 20) and
      (fee_monthly_eur is null or fee_monthly_eur >= 0) and
      (fee_issuance_eur is null or fee_issuance_eur >= 0)
    );
  end if;
end $$;

-- ---------- Affiliate-Links ----------
alter table affiliate_links
  add column if not exists affiliate_model      text not null default 'unknown',
  add column if not exists tracking_type        text not null default 'network',
  add column if not exists user_bonus_value_eur numeric(8,2),
  add column if not exists subid_param          text,          -- z. B. 'subid', 'sub1', 'aff_sub'
  add column if not exists cookie_days          int,           -- intern
  add column if not exists min_payout_note      text;          -- intern

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'affiliate_links_model_check') then
    alter table affiliate_links add constraint affiliate_links_model_check
      check (affiliate_model in ('cpa','dual_sided','revshare','hybrid','unknown'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'affiliate_links_tracking_check') then
    alter table affiliate_links add constraint affiliate_links_tracking_check
      check (tracking_type in ('network','direct','referral_code'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'affiliate_links_target_https_check') then
    alter table affiliate_links add constraint affiliate_links_target_https_check
      check (target_url ~ '^https://');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'affiliate_links_subid_param_check') then
    alter table affiliate_links add constraint affiliate_links_subid_param_check
      check (subid_param is null or subid_param ~ '^[A-Za-z0-9_]{1,32}$');
  end if;
end $$;

-- ---------- Klick-Events ----------
alter table click_events
  add column if not exists subid           text,
  add column if not exists ranking_version text,
  add column if not exists source          text,
  add column if not exists is_bot          boolean not null default false;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'click_events_subid_check') then
    alter table click_events add constraint click_events_subid_check
      check (subid is null or subid ~ '^[a-z0-9-]{1,40}$');
  end if;
end $$;

create index if not exists click_events_link_time_idx on click_events(link_id, occurred_at);

-- ---------- Öffentliche Views neu (zusätzliche Spalten) ----------
drop view if exists public_offers;
create view public_offers as
select l.slug,
       l.product_id,
       l.affiliate_model,
       l.tracking_type,
       l.bonus_text,
       l.bonus_conditions,
       l.bonus_verified_at,
       l.user_bonus_value_eur,
       l.excluded_countries
from affiliate_links l
join products p on p.id = l.product_id and p.is_published
where l.enabled;

grant select on public_offers to anon, authenticated;

-- ---------- Aggregierte Klickstatistik (intern, service role) ----------
create or replace view click_stats_daily as
select date_trunc('day', occurred_at)::date as day,
       l.slug,
       e.country,
       e.source,
       e.ranking_version,
       count(*) filter (where not e.is_bot) as human_clicks,
       count(*) filter (where e.is_bot)     as bot_clicks
from click_events e
left join affiliate_links l on l.id = e.link_id
group by 1, 2, 3, 4, 5;

revoke all on click_stats_daily from anon, authenticated;

-- ---------- Retention (optional, benötigt pg_cron) ----------
-- select cron.schedule('click_events_retention', '17 3 * * *',
--   $$delete from click_events where occurred_at < now() - interval '180 days'$$);

commit;
