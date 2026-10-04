/**
 * Domain-Typen für den Krypto-Spending-Guide.
 * Spiegeln das Supabase-Schema (001_init.sql + 002_extend.sql) in camelCase.
 * Grundsatz: `null` heißt "unbekannt / nicht geprüft", nie "nein".
 */

export type Lang = "de" | "en";

export interface I18n {
  de: string;
  en: string;
}

export const LAUNCH_COUNTRIES = ["DE", "AT", "FR", "ES", "IT", "NL", "MT", "CY"] as const;
export type CountryCode = (typeof LAUNCH_COUNTRIES)[number];

/** ISO-3166 alpha-2; Sitzländer von Rechtsträgern können außerhalb der EU liegen. */
export type IsoCountry = string;

export type ProductType = "card" | "exchange";
export type CardKind = "debit" | "prepaid" | "credit" | "collateral_credit";
export type CardNetwork = "visa" | "mastercard" | "unknown";
export type CustodyModel = "custodial" | "self_custody" | "hybrid" | "not_applicable";
export type FundingFlow =
  | "auto_sell_per_payment"
  | "prefunded_fiat"
  | "prefunded_stablecoin"
  | "credit_line"
  | "mixed"
  | "unknown";
export type ProductStatus = "active" | "wind_down" | "discontinued";
export type EntityRole =
  | "casp"
  | "bank"
  | "emi"
  | "program_manager"
  | "card_issuer"
  | "custodian"
  | "data_controller"
  | "operator";
export type AuthorizationType =
  | "casp_art63"
  | "art60_notified"
  | "emi"
  | "bank"
  | "none_found"
  | "unverified";
export type AvailabilityStatus = "available" | "restricted" | "unavailable" | "unknown";
export type Confidence = "verified" | "secondary" | "unverified";
export type AffiliateModel = "cpa" | "dual_sided" | "revshare" | "hybrid" | "unknown";
export type TrackingType = "network" | "direct" | "referral_code";
export type CardForm = "virtual" | "physical";
export type MobileWallet = "apple_pay" | "google_pay";
/** Im EWR verlangen regulierte Kartenprogramme in der Regel volles KYC. "none" nur zur Kennzeichnung von Ausreißern. */
export type KycLevel = "none" | "light" | "full";
export type BadgeKind = "editorial" | "sponsored";
/** Einzahlungswege. Futures/Derivate sind bewusst nicht im Modell (nicht im Scope, MiFID). */
export type DepositMethod = "sepa" | "card" | "apple_pay" | "google_pay" | "crypto";

export interface Country {
  code: CountryCode;
  name: I18n;
  micaAuthority: string | null;
  micaTransitionEnded: string | null;
  /** Grundzüge der Besteuerung. Keine Beratung. */
  taxSummary: I18n | null;
  taxUncertain: boolean;
  taxVerifiedAt: string | null;
  taxSourceUrl: string | null;
  /** Werbe-Label in der Landessprache, z. B. "Publicité". */
  adLabel: string;
}

export interface LegalEntity {
  id: string;
  legalName: string;
  seatCountry: IsoCountry | null;
  registrationNo: string | null;
  regulator: string | null;
  authorization: AuthorizationType;
  esmaRegisterRef: string | null;
  passportNote: string | null;
  confidence: Confidence;
  verifiedAt: string | null;
  sourceUrl: string | null;
}

export interface ProviderEntity {
  entity: LegalEntity;
  role: EntityRole;
  scopeNote: string | null;
}

export interface TrustpilotRating {
  domain: string;
  score: number | null;
  reviewCount: number | null;
  retrievedAt: string | null;
}

export interface Provider {
  id: string;
  slug: string;
  name: string;
  websiteUrl: string | null;
  description: I18n | null;
  /** Sitzland des DSGVO-Verantwortlichen, falls festgestellt. */
  dataControllerCountry: IsoCountry | null;
  dataControllerNote: I18n | null;
  dataResidencyNote: I18n | null;
  kycNote: I18n | null;
  protectionNote: I18n | null;
  entities: ProviderEntity[];
  /** Nur gesetzt, wenn site_settings.trustpilot_display = true. */
  trustpilot: TrustpilotRating | null;
  /** Domain für den Textlink zum Trustpilot-Profil (immer erlaubt). */
  trustpilotDomain: string | null;
}

export interface FeeStructure {
  /** Ausgabegebühr virtuelle Karte in EUR. */
  issuanceVirtualEur: number | null;
  /** Ausgabegebühr physische Karte in EUR. */
  issuancePhysicalEur: number | null;
  monthlyEur: number | null;
  fxMarkupPct: number | null;
  /** Gebührenfreies Abhebevolumen am Automaten pro Monat in EUR (0 = keine Freigrenze). */
  atmFreeLimitEurPerMonth: number | null;
  /** Gebühr in Prozent auf Abhebungen über der Freigrenze. */
  atmFeePctOverLimit: number | null;
  inactivityEur: number | null;
  /** Nur Börsen: Spot-Maker-Gebühr in Prozent. */
  spotMakerPct: number | null;
  /** Nur Börsen: Spot-Taker-Gebühr (bzw. Spread bei Broker-Modellen) in Prozent. Grundlage des Rankings. */
  spotTakerPct: number | null;
  atmNote: I18n | null;
  note: I18n | null;
}

export interface StakingRequirement {
  required: boolean | null;
  minEur: number | null;
  token: string | null;
  lockupDays: number | null;
}

export interface RewardStructure {
  baseCashbackPct: number | null;
  maxCashbackPct: number | null;
  rewardToken: string | null;
  staking: StakingRequirement;
  note: I18n | null;
}

export interface CardDetails {
  kind: CardKind | null;
  network: CardNetwork;
  /** null = nicht geprüft, [] = geprüft: keine */
  forms: CardForm[] | null;
  mobileWallets: MobileWallet[] | null;
  kycLevel: KycLevel | null;
}

export interface Availability {
  country: CountryCode;
  status: AvailabilityStatus;
  note: I18n | null;
}

export interface Product {
  id: string;
  slug: string;
  providerId: string;
  type: ProductType;
  name: string;
  status: ProductStatus;
  windDownDate: string | null;
  card: CardDetails | null;
  custody: CustodyModel;
  fundingFlow: FundingFlow;
  /** Womit die Karte bezahlt bzw. was die Börse annimmt, z. B. ["EUR","USDC","BTC"]. */
  fundingAssets: string[] | null;
  stablecoins: string[] | null;
  chains: string[] | null;
  /**
   * Geprüft vorhandene Einzahlungswege (Börse) bzw. Auflademöglichkeiten (Karte).
   * null = nicht geprüft. Eine Liste ist nicht zwingend vollständig.
   */
  depositMethods: DepositMethod[] | null;
  /** Börse: Anzahl handelbarer Kryptowerte für EWR-Kunden. */
  assetCount: number | null;
  fees: FeeStructure;
  rewards: RewardStructure;
  availability: Availability[];
  confidence: Confidence;
  verifiedAt: string | null;
  sourceUrl: string | null;
}

/** Öffentliche Sicht auf einen Affiliate-Link (Ziel-URL bleibt serverseitig). */
export interface Offer {
  slug: string;
  productId: string;
  affiliateModel: AffiliateModel;
  trackingType: TrackingType;
  bonusText: I18n | null;
  bonusConditions: I18n | null;
  bonusVerifiedAt: string | null;
  userBonusValueEur: number | null;
  excludedCountries: string[];
  /** CTA-Text mit Bonusversprechen. Wird nur angezeigt, wenn Bonusbedingungen gepflegt und aktuell sind (resolveCta). */
  ctaText: I18n | null;
  /** Nur bei trackingType "referral_code". */
  promoCode: string | null;
  badge: OfferBadge | null;
}

export interface OfferBadge {
  text: I18n;
  /** editorial = aus Methodik begründet; sponsored = bezahlt, wird als "Gesponsert" gekennzeichnet. */
  kind: BadgeKind;
}

export interface Catalog {
  countries: Country[];
  providers: Provider[];
  products: Product[];
  offers: Offer[];
}
