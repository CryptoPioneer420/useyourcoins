/** UI-Texte für Codes aus matching.ts. */
import type { I18n } from "./types";
import type { BadgeCode, NoteCode, ReasonCode, WarningCode } from "./matching";

export const BADGE_LABEL: Record<BadgeCode, I18n> = {
  best_match: { de: "Beste Übereinstimmung", en: "Best match" },
  lowest_cost: { de: "Niedrigste Gebühren", en: "Lowest fees" },
  best_rewards: { de: "Bestes Cashback", en: "Best cashback" },
};

export const REASON_LABEL: Record<ReasonCode, I18n> = {
  custody_matches_wallet: { de: "Funktioniert mit deiner eigenen Wallet", en: "Works with your own wallet" },
  custody_matches_exchange: { de: "Passt zu Kryptowerten auf einer Börse", en: "Fits crypto held on an exchange" },
  beginner_friendly_custodial: { de: "Einstieg ohne eigene Wallet", en: "Start without your own wallet" },
  pays_from_euro_balance: { de: "Zahlt aus Euro-Guthaben", en: "Pays from euro balance" },
  supports_stablecoins: { de: "Unterstützt Stablecoins", en: "Supports stablecoins" },
  supports_btc_eth: { de: "Zahlung mit BTC/ETH möglich", en: "Pay with BTC/ETH" },
  no_monthly_fee: { de: "Keine Monatsgebühr", en: "No monthly fee" },
  low_fx_markup: { de: "Niedriger Fremdwährungsaufschlag", en: "Low FX markup" },
  no_staking_required: { de: "Kein Staking nötig", en: "No staking required" },
  cashback_available: { de: "Cashback verfügbar", en: "Cashback available" },
  eu_authorised: { de: "EU-Zulassung vorhanden", en: "EU authorisation in place" },
  eu_card_issuer: { de: "Karte von EU-reguliertem E-Geld-Institut", en: "Card from an EU-regulated e-money institution" },
  eea_data_controller: { de: "Datenverantwortlicher im EWR", en: "Data controller in the EEA" },
  sepa_deposit: { de: "Euro-Einzahlung per SEPA", en: "Euro deposit via SEPA" },
};

export const WARNING_LABEL: Record<WarningCode, I18n> = {
  availability_unknown: { de: "Verfügbarkeit in deinem Land nicht bestätigt", en: "Availability in your country not confirmed" },
  availability_restricted: { de: "In deinem Land eingeschränkt", en: "Restricted in your country" },
  wind_down: { de: "Anbieter stellt das Produkt ein", en: "Provider is discontinuing this product" },
  fees_unknown: { de: "Gebühren noch nicht geprüft", en: "Fees not yet verified" },
  rewards_unknown: { de: "Cashback noch nicht geprüft", en: "Cashback not yet verified" },
  no_eu_authorisation_found: { de: "Keine EU-Zulassung festgestellt", en: "No EU authorisation found" },
  authorisation_unverified: { de: "Zulassung noch nicht geprüft", en: "Authorisation not yet verified" },
  auto_sell_tax_event: { de: "Zahlung mit Krypto kann steuerlich relevant sein", en: "Paying with crypto can be tax-relevant" },
  staking_required: { de: "Höheres Cashback nur mit Token-Lock-up", en: "Higher cashback only with token lock-up" },
  data_unverified: { de: "Daten ungeprüft", en: "Data unverified" },
  link_unavailable_in_country: { de: "Kein Partnerlink für dein Land", en: "No partner link for your country" },
  requires_provider_account: { de: "Konto beim Anbieter nötig", en: "Requires an account with the provider" },
  usdt_not_mica_compliant: { de: "USDT hat keinen MiCA-zugelassenen Emittenten", en: "USDT has no MiCA-authorised issuer" },
};

export const NOTE_LABEL: Record<NoteCode, I18n> = {
  no_results: {
    de: "Für deine Auswahl haben wir in diesem Land kein passendes Produkt gefunden.",
    en: "We found no matching product in this country for your selection.",
  },
  single_result: {
    de: "Nur ein Produkt passt. Weitere Optionen findest du in der Vergleichstabelle.",
    en: "Only one product matches. More options are in the comparison table.",
  },
  contradiction_wallet_euro: {
    de: "Hinweis: Karten für eigene Wallets zahlen meist mit Stablecoins, nicht aus Euro-Guthaben.",
    en: "Note: cards for your own wallet usually pay with stablecoins, not from a euro balance.",
  },
};
