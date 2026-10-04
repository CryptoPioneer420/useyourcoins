/**
 * Edge Function: go — Affiliate-Redirect mit datensparsamem Klick-Logging.
 *
 * GET /functions/v1/go?s=<slug>&c=<DE|AT|...>&l=<de|en>&src=<quiz|table|...>&q=<subid>&rv=<ranking_version>
 *
 * - Ziel-URLs liegen nur in affiliate_links (RLS ohne Policy → nur service role).
 * - Kein Cookie, keine IP-Speicherung, keine Nutzer-ID. IP wird nur flüchtig für
 *   einen In-Memory-Duplikatfilter (30 min, gehasht, pro Isolate) verwendet.
 * - Bots werden geloggt (is_bot = true), aber nicht blockiert.
 * - Bei jedem Fehler: 302 auf eine Fallback-Seite der Website, nie eine leere Seite.
 *
 * Deploy: verify_jwt = false (Navigation ohne Authorization-Header).
 * Secrets: SITE_URL (z. B. https://example.eu), ALLOWED_ORIGINS (kommagetrennt, exakt).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LAUNCH_COUNTRIES = ["DE", "AT", "FR", "ES", "IT", "NL", "MT", "CY"] as const;
const LANGS = ["de", "en"] as const;
const SOURCES = ["quiz", "table", "country_page", "provider_page", "knowledge"] as const;
const SLUG_RE = /^[a-z0-9-]{2,64}$/;
const SUBID_RE = /^[a-z0-9-]{1,40}$/;
const RV_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}\.[0-9]{1,3}$/;
const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|monitor|curl|wget|python-requests|go-http-client/i;
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

const SITE_URL = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? SITE_URL)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)
  .concat(["http://localhost:5173", "http://localhost:8080"]);

function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] ?? "";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    Vary: "Origin",
  };
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

type Country = (typeof LAUNCH_COUNTRIES)[number];
type Lang = (typeof LANGS)[number];

const oneOf = <T extends string>(list: readonly T[], v: string | null): T | null =>
  v !== null && (list as readonly string[]).includes(v) ? (v as T) : null;

/** Flüchtiger Duplikatfilter. Lebt nur im Speicher dieses Isolates. */
const recent = new Map<string, number>();

async function dedupeKey(ip: string, slug: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${ip}|${slug}|${day}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash).slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}

function isDuplicate(key: string): boolean {
  const now = Date.now();
  if (recent.size > 5000) {
    for (const [k, t] of recent) if (now - t > DEDUPE_WINDOW_MS) recent.delete(k);
  }
  const last = recent.get(key);
  recent.set(key, now);
  return last !== undefined && now - last < DEDUPE_WINDOW_MS;
}

function redirect(location: string, req: Request): Response {
  return new Response(null, {
    status: 302,
    headers: {
      ...getCorsHeaders(req),
      Location: location,
      "Cache-Control": "no-store",
      "Referrer-Policy": "origin",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function fallback(req: Request, lang: Lang, reason: string, slug?: string): Response {
  console.warn(JSON.stringify({ fn: "go", level: "warn", reason, slug: slug ?? null }));
  const base = SITE_URL || "/";
  const path = `/${lang}/link-unavailable${slug ? `?p=${encodeURIComponent(slug)}` : ""}`;
  return redirect(`${base}${path}`, req);
}

function runInBackground(p: Promise<unknown>): void {
  const rt = (globalThis as unknown as { EdgeRuntime?: { waitUntil(p: Promise<unknown>): void } }).EdgeRuntime;
  if (rt?.waitUntil) rt.waitUntil(p);
  else p.catch(() => {});
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }
  const url = new URL(req.url);
  const lang: Lang = oneOf(LANGS, url.searchParams.get("l")) ?? "en";

  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json", Allow: "GET, HEAD, OPTIONS" },
    });
  }

  try {
    const slug = url.searchParams.get("s");
    const country: Country | null = oneOf(LAUNCH_COUNTRIES, (url.searchParams.get("c") ?? "").toUpperCase());
    const source = oneOf(SOURCES, url.searchParams.get("src"));
    const subidRaw = url.searchParams.get("q");
    const subid = subidRaw && SUBID_RE.test(subidRaw) ? subidRaw : null;
    const rvRaw = url.searchParams.get("rv");
    const rankingVersion = rvRaw && RV_RE.test(rvRaw) ? rvRaw : null;

    if (!slug || !SLUG_RE.test(slug)) return fallback(req, lang, "invalid_slug");

    const { data: link, error } = await supabase
      .from("affiliate_links")
      .select("id, target_url, enabled, excluded_countries, subid_param")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(`db_lookup: ${error.message}`);
    if (!link || !link.enabled) return fallback(req, lang, "link_not_active", slug);

    const excluded = ((link.excluded_countries ?? []) as string[]).map((c) => c.toUpperCase());
    if (country && excluded.includes(country)) return fallback(req, lang, "country_excluded", slug);

    let target: URL;
    try {
      target = new URL(link.target_url as string);
    } catch {
      return fallback(req, lang, "invalid_target", slug);
    }
    if (target.protocol !== "https:") return fallback(req, lang, "non_https_target", slug);
    if (subid && link.subid_param) target.searchParams.set(link.subid_param as string, subid);

    const ua = req.headers.get("user-agent") ?? "";
    const isBot = ua === "" || BOT_RE.test(ua);
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ?? "";

    if (req.method === "GET") {
      const duplicate = ip ? isDuplicate(await dedupeKey(ip, slug)) : false;
      if (!duplicate) {
        runInBackground(
          supabase
            .from("click_events")
            .insert({
              link_id: link.id,
              source_page: source,
              source,
              lang,
              country,
              from_quiz: source === "quiz",
              subid,
              ranking_version: rankingVersion,
              is_bot: isBot,
            })
            .then(({ error: insErr }) => {
              if (insErr) console.error(JSON.stringify({ fn: "go", level: "error", reason: "log_insert", message: insErr.message }));
            }),
        );
      }
    }

    return redirect(target.toString(), req);
  } catch (err) {
    console.error("[go]", err);
    return fallback(req, lang, "internal_error");
  }
});
