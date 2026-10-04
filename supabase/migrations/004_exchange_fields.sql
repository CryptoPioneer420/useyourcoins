-- 004_exchange_fields.sql — Börsen-Gebühren (Spot Maker/Taker), Einzahlungswege, Asset-Anzahl,
-- Automatengebühr über Freigrenze. Futures/Derivate bewusst nicht im Modell.
-- Voraussetzung: 001–003. Idempotent.

begin;

alter table products
  add column if not exists fee_spot_maker_pct numeric(5,3),
  add column if not exists deposit_methods    text[],
  add column if not exists asset_count        int,
  add column if not exists atm_fee_pct        numeric(5,2);

-- Handelsgebühr wird zur Spot-Taker-Gebühr
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'fee_trading_pct') then
    alter table products rename column fee_trading_pct to fee_spot_taker_pct;
  end if;
end $$;

-- sepa_deposit (boolean) wird durch deposit_methods ersetzt
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'sepa_deposit') then
    update products set deposit_methods = array['sepa'] where sepa_deposit = true and deposit_methods is null;
    alter table products drop column sepa_deposit;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_deposit_methods_check') then
    alter table products add constraint products_deposit_methods_check
      check (deposit_methods is null or deposit_methods <@ array['sepa','card','apple_pay','google_pay','crypto']::text[]);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_exchange_fields_check') then
    alter table products add constraint products_exchange_fields_check check (
      (fee_spot_maker_pct is null or fee_spot_maker_pct between 0 and 10) and
      (asset_count is null or asset_count >= 0) and
      (atm_fee_pct is null or atm_fee_pct between 0 and 20) and
      (product_type = 'exchange' or (fee_spot_maker_pct is null and fee_spot_taker_pct is null and asset_count is null))
    );
  end if;
end $$;

commit;
