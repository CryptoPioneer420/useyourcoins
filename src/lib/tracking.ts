/**
 * Tracking: Sub-ID, Redirect-URL, Analytics-Events.
 * Grundsatz: keine personenbezogenen Daten in URLs, keine Cookies, keine Nutzer-IDs.
 * Analytics über Plausible (cookielos); ohne geladenes Script ist track() ein No-op.
 */
import type { CountryCode, Lang, ProductType } from "./types";
import type { QuizAnswers, StepId } from "./quiz";
import { RANKING_VERSION } from "./ranking-config";

const CODE = {
  goal: { card: "c", exchange: "x", both: "b" },
  holding: { exchange: "ex", own_wallet: "ow", new: "nw" },
  spendAsset: { euro_balance: "eu", stablecoins: "sc", btc_eth: "be" },
  priority: { low_fees: "lf", cashback: "cb", no_lockup: "nl", regulation_privacy: "rp" },
} as const;

export const SUBID_PATTERN = /^[a-z0-9-]{1,40}$/;

/** Nicht personenbezogener Pfad-Code, z. B. "q-c-de-ow-sc-lf". */
export function buildQuizSubId(a: QuizAnswers): string {
  const parts = [
    "q",
    CODE.goal[a.goal],
    a.country.toLowerCase(),
    a.holding ? CODE.holding[a.holding] : "na",
    a.spendAsset ? CODE.spendAsset[a.spendAsset] : "na",
    CODE.priority[a.priority],
  ];
  return parts.join("-");
}

export type ClickSource = "quiz" | "table" | "country_page" | "provider_page" | "knowledge";

export function buildPageSubId(source: Exclude<ClickSource, "quiz">, country: CountryCode | null): string {
  const src = { table: "t", country_page: "cp", provider_page: "pp", knowledge: "k" }[source];
  return country ? `${src}-${country.toLowerCase()}` : src;
}

export interface GoUrlParams {
  slug: string;
  country: CountryCode;
  lang: Lang;
  source: ClickSource;
  subId: string;
}

/**
 * URL zur Edge Function /go. Kein direkter Link auf die Ziel-URL im Frontend.
 * functionsBaseUrl z. B. "https://<project>.supabase.co/functions/v1".
 */
export function goUrl(functionsBaseUrl: string, p: GoUrlParams): string {
  if (!SUBID_PATTERN.test(p.subId)) throw new Error(`invalid subId: ${p.subId}`);
  const u = new URL(`${functionsBaseUrl.replace(/\/$/, "")}/go`);
  u.searchParams.set("s", p.slug);
  u.searchParams.set("c", p.country);
  u.searchParams.set("l", p.lang);
  u.searchParams.set("src", p.source);
  u.searchParams.set("q", p.subId);
  u.searchParams.set("rv", RANKING_VERSION);
  return u.toString();
}

// ---------- Analytics-Event-Taxonomie ----------

export type AnalyticsEvent =
  | { name: "quiz_start"; props: { goal: QuizAnswers["goal"]; entry: "home" | "country_page"; country?: CountryCode } }
  | { name: "quiz_step"; props: { step: StepId; value: string; index: number } }
  | { name: "quiz_back"; props: { step: StepId } }
  | { name: "quiz_out_of_scope"; props: Record<string, never> }
  | { name: "quiz_complete"; props: { subId: string } }
  | { name: "result_view"; props: { subId: string; cards: number; exchanges: number; rankingVersion: string } }
  | { name: "affiliate_click"; props: { slug: string; type: ProductType; position: number; source: ClickSource; country: CountryCode } }
  | { name: "filter_change"; props: { filter: string; value: string } }
  | { name: "trustpilot_outbound"; props: { provider: string } };

interface PlausibleWindow {
  plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as PlausibleWindow;
  if (typeof w.plausible !== "function") return;
  const props: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(event.props)) {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") props[k] = v;
  }
  try {
    w.plausible(event.name, { props });
  } catch {
    /* Analytics darf die Seite nie brechen */
  }
}
