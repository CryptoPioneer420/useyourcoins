/**
 * Supabase → Domain-Mapping. Lovable-Projekte stellen den Client unter
 * "@/integrations/supabase/client" bereit; hier wird er als Parameter übergeben,
 * damit die Datei framework-unabhängig und testbar bleibt.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AffiliateModel,
  Availability,
  AvailabilityStatus,
  AuthorizationType,
  BadgeKind,
  CardForm,
  CardKind,
  CardNetwork,
  Catalog,
  Confidence,
  Country,
  CountryCode,
  CustodyModel,
  DepositMethod,
  EntityRole,
  FundingFlow,
  I18n,
  KycLevel,
  MobileWallet,
  Offer,
  Product,
  ProductStatus,
  ProductType,
  Provider,
  TrackingType,
} from "./types";
import { isLaunchCountry } from "./countries";

// ---------- Row-Typen (snake_case, wie in Postgres) ----------

export interface CountryRow {
  code: string;
  name: I18n;
  mica_authority: string | null;
  mica_transition_ended: string | null;
  tax_summary: I18n | null;
  tax_uncertain: boolean;
  tax_verified_at: string | null;
  tax_source_url: string | null;
  ad_label: string;
  is_launch_country: boolean;
  sort: number;
}

export interface LegalEntityRow {
  id: string;
  legal_name: string;
  seat_country: string | null;
  registration_no: string | null;
  regulator: string | null;
  auth_status: AuthorizationType;
  esma_register_ref: string | null;
  passport_note: string | null;
  confidence: Confidence;
  verified_at: string | null;
  source_url: string | null;
}

export interface ProviderRow {
  id: string;
  slug: string;
  name: string;
  website_url: string | null;
  description: I18n | null;
  data_controller_country: string | null;
  data_controller_note: I18n | null;
  data_residency_note: I18n | null;
  kyc_note: I18n | null;
  protection_note: I18n | null;
  trustpilot_domain: string | null;
  provider_entities: { role: EntityRole; scope_note: string | null; legal_entities: LegalEntityRow | null }[];
}

export interface AvailabilityRow {
  country_code: string;
  status: AvailabilityStatus;
  note: I18n | null;
}

export interface ProductRow {
  id: string;
  provider_id: string;
  slug: string;
  product_type: ProductType;
  name: string;
  status: ProductStatus;
  wind_down_date: string | null;
  card_kind: CardKind | null;
  card_network: CardNetwork | null;
  custody: CustodyModel;
  funding_flow: FundingFlow;
  funding_assets: string[] | null;
  supported_stablecoins: string[] | null;
  chains: string[] | null;
  deposit_methods: DepositMethod[] | null;
  asset_count: number | null;
  card_forms: CardForm[] | null;
  mobile_wallets: MobileWallet[] | null;
  kyc_level: KycLevel | null;
  staking_required: boolean | null;
  staking_min_eur: number | string | null;
  staking_token: string | null;
  staking_lockup_days: number | null;
  fee_issuance_virtual_eur: number | string | null;
  fee_issuance_physical_eur: number | string | null;
  atm_free_limit_eur: number | string | null;
  fee_monthly_eur: number | string | null;
  fee_fx_pct: number | string | null;
  fee_inactivity_eur: number | string | null;
  fee_spot_maker_pct: number | string | null;
  fee_spot_taker_pct: number | string | null;
  atm_fee_pct: number | string | null;
  fee_atm_note: I18n | null;
  fee_note: I18n | null;
  cashback_base_pct: number | string | null;
  cashback_max_pct: number | string | null;
  cashback_note: I18n | null;
  reward_token: string | null;
  confidence: Confidence;
  verified_at: string | null;
  source_url: string | null;
  product_availability: AvailabilityRow[];
}

export interface OfferRow {
  slug: string;
  product_id: string;
  affiliate_model: AffiliateModel;
  tracking_type: TrackingType;
  bonus_text: I18n | null;
  bonus_conditions: I18n | null;
  bonus_verified_at: string | null;
  user_bonus_value_eur: number | string | null;
  excluded_countries: string[] | null;
  cta_text: I18n | null;
  promo_code: string | null;
  badge_text: I18n | null;
  badge_kind: BadgeKind | null;
}

export interface TrustpilotRow {
  provider_id: string;
  tp_domain: string;
  score: number | string | null;
  review_count: number | null;
  retrieved_at: string | null;
}

// ---------- Mapper ----------

/** Postgres numeric kommt über PostgREST als string oder number. */
export const num = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

export function mapCountry(r: CountryRow): Country | null {
  if (!isLaunchCountry(r.code)) return null;
  return {
    code: r.code.toUpperCase() as CountryCode,
    name: r.name,
    micaAuthority: r.mica_authority,
    micaTransitionEnded: r.mica_transition_ended,
    taxSummary: r.tax_summary,
    taxUncertain: r.tax_uncertain,
    taxVerifiedAt: r.tax_verified_at,
    taxSourceUrl: r.tax_source_url,
    adLabel: r.ad_label,
  };
}

export function mapProvider(r: ProviderRow, trustpilot: TrustpilotRow | undefined): Provider {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    websiteUrl: r.website_url,
    description: r.description,
    dataControllerCountry: r.data_controller_country,
    dataControllerNote: r.data_controller_note,
    dataResidencyNote: r.data_residency_note,
    kycNote: r.kyc_note,
    protectionNote: r.protection_note,
    trustpilotDomain: r.trustpilot_domain,
    trustpilot: trustpilot
      ? {
          domain: trustpilot.tp_domain,
          score: num(trustpilot.score),
          reviewCount: trustpilot.review_count,
          retrievedAt: trustpilot.retrieved_at,
        }
      : null,
    entities: r.provider_entities
      .filter((pe): pe is typeof pe & { legal_entities: LegalEntityRow } => pe.legal_entities !== null)
      .map((pe) => ({
        role: pe.role,
        scopeNote: pe.scope_note,
        entity: {
          id: pe.legal_entities.id,
          legalName: pe.legal_entities.legal_name,
          seatCountry: pe.legal_entities.seat_country,
          registrationNo: pe.legal_entities.registration_no,
          regulator: pe.legal_entities.regulator,
          authorization: pe.legal_entities.auth_status,
          esmaRegisterRef: pe.legal_entities.esma_register_ref,
          passportNote: pe.legal_entities.passport_note,
          confidence: pe.legal_entities.confidence,
          verifiedAt: pe.legal_entities.verified_at,
          sourceUrl: pe.legal_entities.source_url,
        },
      })),
  };
}

export function mapProduct(r: ProductRow): Product {
  const availability: Availability[] = r.product_availability
    .filter((a) => isLaunchCountry(a.country_code))
    .map((a) => ({ country: a.country_code.toUpperCase() as CountryCode, status: a.status, note: a.note }));
  return {
    id: r.id,
    slug: r.slug,
    providerId: r.provider_id,
    type: r.product_type,
    name: r.name,
    status: r.status,
    windDownDate: r.wind_down_date,
    card:
      r.product_type === "card"
        ? {
            kind: r.card_kind,
            network: r.card_network ?? "unknown",
            forms: r.card_forms,
            mobileWallets: r.mobile_wallets,
            kycLevel: r.kyc_level,
          }
        : null,
    custody: r.custody,
    fundingFlow: r.funding_flow,
    fundingAssets: r.funding_assets,
    stablecoins: r.supported_stablecoins,
    chains: r.chains,
    depositMethods: r.deposit_methods,
    assetCount: r.asset_count,
    fees: {
      issuanceVirtualEur: num(r.fee_issuance_virtual_eur),
      issuancePhysicalEur: num(r.fee_issuance_physical_eur),
      monthlyEur: num(r.fee_monthly_eur),
      fxMarkupPct: num(r.fee_fx_pct),
      atmFreeLimitEurPerMonth: num(r.atm_free_limit_eur),
      atmFeePctOverLimit: num(r.atm_fee_pct),
      inactivityEur: num(r.fee_inactivity_eur),
      spotMakerPct: num(r.fee_spot_maker_pct),
      spotTakerPct: num(r.fee_spot_taker_pct),
      atmNote: r.fee_atm_note,
      note: r.fee_note,
    },
    rewards: {
      baseCashbackPct: num(r.cashback_base_pct),
      maxCashbackPct: num(r.cashback_max_pct),
      rewardToken: r.reward_token,
      staking: {
        required: r.staking_required,
        minEur: num(r.staking_min_eur),
        token: r.staking_token,
        lockupDays: r.staking_lockup_days,
      },
      note: r.cashback_note,
    },
    availability,
    confidence: r.confidence,
    verifiedAt: r.verified_at,
    sourceUrl: r.source_url,
  };
}

export function mapOffer(r: OfferRow): Offer {
  return {
    slug: r.slug,
    productId: r.product_id,
    affiliateModel: r.affiliate_model,
    trackingType: r.tracking_type,
    bonusText: r.bonus_text,
    bonusConditions: r.bonus_conditions,
    bonusVerifiedAt: r.bonus_verified_at,
    userBonusValueEur: num(r.user_bonus_value_eur),
    excludedCountries: (r.excluded_countries ?? []).map((c) => c.toUpperCase()),
    ctaText: r.cta_text,
    promoCode: r.promo_code,
    badge: r.badge_text && r.badge_kind ? { text: r.badge_text, kind: r.badge_kind } : null,
  };
}

// ---------- Abruf ----------

export class CatalogLoadError extends Error {
  constructor(public readonly source: string, message: string) {
    super(`${source}: ${message}`);
    this.name = "CatalogLoadError";
  }
}

const PROVIDER_SELECT =
  "id,slug,name,website_url,description,data_controller_country,data_controller_note,data_residency_note,kyc_note,protection_note,trustpilot_domain,provider_entities(role,scope_note,legal_entities(*))";
const PRODUCT_SELECT = "*,product_availability(country_code,status,note)";

/** Lädt den kompletten öffentlichen Katalog (anon key, RLS greift). */
export async function fetchCatalog(client: SupabaseClient): Promise<Catalog> {
  const [countries, providers, products, offers, trustpilot] = await Promise.all([
    client.from("countries").select("*").eq("is_launch_country", true).order("sort"),
    client.from("providers").select(PROVIDER_SELECT),
    client.from("products").select(PRODUCT_SELECT),
    client.from("public_offers").select("*"),
    client.from("public_trustpilot").select("*"),
  ]);
  for (const [name, res] of [
    ["countries", countries],
    ["providers", providers],
    ["products", products],
    ["public_offers", offers],
    ["public_trustpilot", trustpilot],
  ] as const) {
    if (res.error) throw new CatalogLoadError(name, res.error.message);
  }
  const tpByProvider = new Map(((trustpilot.data ?? []) as TrustpilotRow[]).map((t) => [t.provider_id, t]));
  return {
    countries: ((countries.data ?? []) as CountryRow[]).map(mapCountry).filter((c): c is Country => c !== null),
    providers: ((providers.data ?? []) as unknown as ProviderRow[]).map((p) => mapProvider(p, tpByProvider.get(p.id))),
    products: ((products.data ?? []) as unknown as ProductRow[]).map(mapProduct),
    offers: ((offers.data ?? []) as OfferRow[]).map(mapOffer),
  };
}
