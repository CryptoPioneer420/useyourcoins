/**
 * Katalog aus data/seed.json (ohne Datenbank).
 * Für Meilensteine 1–3 in Lovable und für Tests. Liefert nie Partnerlinks (offers = []),
 * damit vor Meilenstein 4 kein Affiliate-Klick ohne Redirect, Logging und Rechtstexte möglich ist.
 */
import seed from "../../data/seed.json";
import type {
  Availability,
  AvailabilityStatus,
  AuthorizationType,
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
  Product,
  ProductStatus,
  ProductType,
  Provider,
} from "./types";
import { LAUNCH_COUNTRIES } from "./types";

interface SeedFees {
  issuanceVirtualEur?: number | null;
  issuancePhysicalEur?: number | null;
  monthlyEur?: number | null;
  fxMarkupPct?: number | null;
  atmFreeLimitEurPerMonth?: number | null;
  atmFeePctOverLimit?: number | null;
  inactivityEur?: number | null;
  spotMakerPct?: number | null;
  spotTakerPct?: number | null;
}

interface SeedRewards {
  baseCashbackPct?: number | null;
  maxCashbackPct?: number | null;
  rewardToken?: string | null;
  stakingRequired?: boolean | null;
  stakingToken?: string | null;
  stakingMinEur?: number | null;
  stakingLockupDays?: number | null;
  note?: I18n | null;
}

interface SeedProduct {
  slug: string;
  type: ProductType;
  name: string;
  status: ProductStatus;
  windDownDate: string | null;
  cardKind?: CardKind | null;
  cardNetwork?: CardNetwork;
  cardForms?: CardForm[] | null;
  mobileWallets?: MobileWallet[] | null;
  kycLevel?: KycLevel | null;
  custody: CustodyModel;
  fundingFlow: FundingFlow;
  fundingAssets: string[] | null;
  stablecoins: string[] | null;
  chains: string[] | null;
  depositMethods?: DepositMethod[] | null;
  assetCount?: number | null;
  availability: Partial<Record<CountryCode, AvailabilityStatus>>;
  availabilityNote?: Partial<Record<CountryCode, I18n>>;
  availabilityNoteAll?: I18n;
  fees: SeedFees | null;
  rewards: SeedRewards | null;
  confidence: Confidence;
  sourceUrl: string | null;
}

interface SeedEntity {
  legalName: string;
  seatCountry: string | null;
  registrationNo: string | null;
  regulator: string | null;
  authorization: AuthorizationType;
  roles: EntityRole[];
  scopeNote: string | null;
  confidence: Confidence;
  sourceUrl: string | null;
}

interface SeedProvider {
  slug: string;
  name: string;
  websiteUrl: string | null;
  trustpilotDomain: string | null;
  dataControllerCountry: string | null;
  dataControllerNote: I18n | null;
  dataResidencyNote: I18n | null;
  kycNote: I18n | null;
  protectionNote: I18n | null;
  entities: SeedEntity[];
  products: SeedProduct[];
}

interface SeedCountry {
  code: CountryCode;
  name: I18n;
  micaAuthority: string | null;
  micaTransitionEnded: string | null;
  adLabel: string;
  taxSummary: I18n | null;
  taxUncertain: boolean;
  taxSourceUrl: string | null;
}

interface SeedFile {
  version: string;
  countries: SeedCountry[];
  providers: SeedProvider[];
}

const data = seed as unknown as SeedFile;

export const SEED_VERSION = data.version;

function mapProduct(p: SeedProvider, pr: SeedProduct): Product {
  const f = pr.fees ?? {};
  const r = pr.rewards ?? {};
  const availability: Availability[] = LAUNCH_COUNTRIES.map((c) => ({
    country: c,
    status: pr.availability[c] ?? "unknown",
    note: pr.availabilityNote?.[c] ?? pr.availabilityNoteAll ?? null,
  }));
  return {
    id: `prod:${pr.slug}`,
    slug: pr.slug,
    providerId: `prov:${p.slug}`,
    type: pr.type,
    name: pr.name,
    status: pr.status,
    windDownDate: pr.windDownDate,
    card:
      pr.type === "card"
        ? {
            kind: pr.cardKind ?? null,
            network: pr.cardNetwork ?? "unknown",
            forms: pr.cardForms ?? null,
            mobileWallets: pr.mobileWallets ?? null,
            kycLevel: pr.kycLevel ?? null,
          }
        : null,
    custody: pr.custody,
    fundingFlow: pr.fundingFlow,
    fundingAssets: pr.fundingAssets,
    stablecoins: pr.stablecoins,
    chains: pr.chains,
    depositMethods: pr.depositMethods ?? null,
    assetCount: pr.assetCount ?? null,
    fees: {
      issuanceVirtualEur: f.issuanceVirtualEur ?? null,
      issuancePhysicalEur: f.issuancePhysicalEur ?? null,
      monthlyEur: f.monthlyEur ?? null,
      fxMarkupPct: f.fxMarkupPct ?? null,
      atmFreeLimitEurPerMonth: f.atmFreeLimitEurPerMonth ?? null,
      atmFeePctOverLimit: f.atmFeePctOverLimit ?? null,
      inactivityEur: f.inactivityEur ?? null,
      spotMakerPct: f.spotMakerPct ?? null,
      spotTakerPct: f.spotTakerPct ?? null,
      atmNote: null,
      note: null,
    },
    rewards: {
      baseCashbackPct: r.baseCashbackPct ?? null,
      maxCashbackPct: r.maxCashbackPct ?? null,
      rewardToken: r.rewardToken ?? null,
      staking: {
        required: r.stakingRequired ?? null,
        minEur: r.stakingMinEur ?? null,
        token: r.stakingToken ?? null,
        lockupDays: r.stakingLockupDays ?? null,
      },
      note: r.note ?? null,
    },
    availability,
    confidence: pr.confidence,
    verifiedAt: null,
    sourceUrl: pr.sourceUrl,
  };
}

function mapProvider(p: SeedProvider): Provider {
  return {
    id: `prov:${p.slug}`,
    slug: p.slug,
    name: p.name,
    websiteUrl: p.websiteUrl,
    description: null,
    dataControllerCountry: p.dataControllerCountry,
    dataControllerNote: p.dataControllerNote,
    dataResidencyNote: p.dataResidencyNote,
    kycNote: p.kycNote,
    protectionNote: p.protectionNote,
    trustpilot: null,
    trustpilotDomain: p.trustpilotDomain,
    entities: p.entities.flatMap((e) =>
      e.roles.map((role) => ({
        role,
        scopeNote: e.scopeNote,
        entity: {
          id: `ent:${e.legalName}`,
          legalName: e.legalName,
          seatCountry: e.seatCountry,
          registrationNo: e.registrationNo,
          regulator: e.regulator,
          authorization: e.authorization,
          esmaRegisterRef: null,
          passportNote: null,
          confidence: e.confidence,
          verifiedAt: null,
          sourceUrl: e.sourceUrl,
        },
      })),
    ),
  };
}

function mapCountry(c: SeedCountry): Country {
  return {
    code: c.code,
    name: c.name,
    micaAuthority: c.micaAuthority,
    micaTransitionEnded: c.micaTransitionEnded,
    taxSummary: c.taxSummary,
    taxUncertain: c.taxUncertain,
    taxVerifiedAt: null,
    taxSourceUrl: c.taxSourceUrl,
    adLabel: c.adLabel,
  };
}

/** Vollständiger Katalog aus dem Seed. Reihenfolge der Länder wie im Launch-Set. */
export function loadSeedCatalog(): Catalog {
  const order = new Map(LAUNCH_COUNTRIES.map((c, i) => [c, i]));
  return {
    countries: data.countries.map(mapCountry).sort((a, b) => (order.get(a.code) ?? 0) - (order.get(b.code) ?? 0)),
    providers: data.providers.map(mapProvider),
    products: data.providers.flatMap((p) => p.products.map((pr) => mapProduct(p, pr))),
    offers: [],
  };
}
