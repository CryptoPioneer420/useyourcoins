-- 003_card_details.sql — Kartenform, Mobile Wallets, KYC, Gebührenraster, CTA/Promo/Badge am Offer
-- Voraussetzung: 001_init.sql, 002_extend.sql. Idempotent.

begin;

-- ---------- Produkte ----------
alter table products
  add column if not exists card_forms             text[],
  add column if not exists mobile_wallets         text[],
  add column if not exists kyc_level              text,
  add column if not exists fee_issuance_virtual_eur numeric(8,2),
  add column if not exists atm_free_limit_eur     numeric(10,2);

-- Ausgabegebühr wird in virtuell/physisch getrennt; bestehende Spalte = physisch.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_name = 'products' and column_name = 'fee_issuance_eur') then
    alter table products rename column fee_issuance_eur to fee_issuance_physical_eur;
  end if;
end $$;

-- apple_google_pay (boolean) wird durch mobile_wallets (text[]) ersetzt.
alter table products drop constraint if exists card_fields_only_for_cards;
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_name = 'products' and column_name = 'apple_google_pay') then
    -- true ließ offen, welche Wallets; daher bewusst null (= ungeprüft), false = geprüft: keine
    update products set mobile_wallets = '{}'::text[] where apple_google_pay = false and mobile_wallets is null;
    alter table products drop column apple_google_pay;
  end if;
end $$;

alter table products add constraint card_fields_only_for_cards check (
  product_type = 'card'
  or (card_kind is null and card_forms is null and mobile_wallets is null and kyc_level is null)
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_card_forms_check') then
    alter table products add constraint products_card_forms_check
      check (card_forms is null or card_forms <@ array['virtual','physical']::text[]);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_mobile_wallets_check') then
    alter table products add constraint products_mobile_wallets_check
      check (mobile_wallets is null or mobile_wallets <@ array['apple_pay','google_pay']::text[]);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_kyc_level_check') then
    alter table products add constraint products_kyc_level_check
      check (kyc_level is null or kyc_level in ('none','light','full'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_fee_ranges2_check') then
    alter table products add constraint products_fee_ranges2_check check (
      (fee_issuance_virtual_eur is null or fee_issuance_virtual_eur >= 0) and
      (atm_free_limit_eur is null or atm_free_limit_eur >= 0)
    );
  end if;
end $$;

-- ---------- Affiliate-Links: CTA, Promo-Code, Badge ----------
alter table affiliate_links
  add column if not exists cta_text   jsonb,
  add column if not exists promo_code text,
  add column if not exists badge_text jsonb,
  add column if not exists badge_kind text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'affiliate_links_badge_check') then
    alter table affiliate_links add constraint affiliate_links_badge_check check (
      (badge_text is null and badge_kind is null)
      or (badge_text is not null and badge_kind is not null and badge_kind in ('editorial','sponsored'))
    );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'affiliate_links_promo_check') then
    alter table affiliate_links add constraint affiliate_links_promo_check
      check (promo_code is null or promo_code ~ '^[A-Za-z0-9_-]{2,40}$');
  end if;
end $$;

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
       l.excluded_countries,
       l.cta_text,
       l.promo_code,
       l.badge_text,
       l.badge_kind
from affiliate_links l
join products p on p.id = l.product_id and p.is_published
where l.enabled;

grant select on public_offers to anon, authenticated;

commit;
