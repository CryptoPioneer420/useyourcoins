/**
 * Kleine Bausteine der Ergebniskarte. Tailwind-Klassen nutzen die shadcn/ui-Tokens
 * (bg-card, text-muted-foreground, border, ring), die in Lovable-Projekten vorhanden sind.
 * Keine Tailwind-v4-exklusive Syntax: Verläufe als Inline-Style, damit v3 und v4 funktionieren.
 */
import { useEffect, useRef, useState } from "react";
import type { CashbackSummary, ExchangeCell, FeeCell, Pill, Tone } from "@/lib/presentation";
import { mockupGradient } from "@/lib/presentation";

const TONE_PILL: Record<Tone, string> = {
  positive: "border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  neutral: "border-border bg-muted text-foreground",
  warning: "border-amber-600/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
};

export function CardMockup({ slug, name, logoUrl }: { slug: string; name: string; logoUrl?: string | null }) {
  const g = mockupGradient(slug);
  const monogram = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase();
  return (
    <div
      aria-hidden="true"
      className="relative flex h-14 w-[5.5rem] shrink-0 items-end justify-between overflow-hidden rounded-lg p-2 shadow-sm"
      style={{ backgroundImage: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
    >
      {logoUrl ? (
        <img src={logoUrl} alt="" className="h-5 w-auto max-w-[3.5rem] object-contain" loading="lazy" />
      ) : (
        <span className="text-sm font-semibold tracking-wide text-white/90">{monogram}</span>
      )}
      <span className="h-3 w-4 rounded-sm bg-white/40" />
    </div>
  );
}

export function PillBadges({ pills }: { pills: Pill[] }) {
  if (pills.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Merkmale">
      {pills.map((p) => (
        <li key={p.code} className={`rounded-full border px-2 py-0.5 text-xs font-medium ${TONE_PILL[p.tone]}`}>
          {p.label}
        </li>
      ))}
    </ul>
  );
}

export function FeeGrid({ cells, title }: { cells: (FeeCell | ExchangeCell)[]; title: string }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border text-sm" aria-label={title}>
      {cells.map((c) => (
        <div key={c.key} className="bg-card px-3 py-2">
          <dt className="text-xs text-muted-foreground">{c.label}</dt>
          <dd className={`font-semibold tabular-nums ${c.unknown ? "text-muted-foreground" : ""}`}>
            {c.value}
            {c.detail ? <span className="block text-xs font-normal text-muted-foreground">{c.detail}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CashbackBanner({ summary }: { summary: CashbackSummary }) {
  const tone =
    summary.tone === "warning"
      ? "border-amber-600/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
      : summary.tone === "positive"
        ? "border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
        : "border-border bg-muted text-foreground";
  return (
    <p className={`rounded-lg border px-3 py-2 text-sm font-medium ${tone}`} data-requires-staking={String(summary.requiresStaking)}>
      {summary.text}
    </p>
  );
}

const COPY_TEXT = {
  de: { label: "Promo-Code", copy: "Kopieren", copied: "Kopiert" },
  en: { label: "Promo code", copy: "Copy", copied: "Copied" },
} as const;

export function PromoCodeCopy({ code, lang }: { code: string; lang: "de" | "en" }) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const t = COPY_TEXT[lang];

  async function copy() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      } else {
        inputRef.current?.select();
        document.execCommand("copy");
      }
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      inputRef.current?.select();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor={`promo-${code}`}>
        {t.label}
      </label>
      <input
        id={`promo-${code}`}
        ref={inputRef}
        readOnly
        value={code}
        className="h-9 min-w-0 flex-1 rounded-md border bg-muted px-2 font-mono text-sm"
        onFocus={(e) => e.currentTarget.select()}
      />
      <button
        type="button"
        onClick={copy}
        className="h-9 shrink-0 rounded-md border px-3 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? t.copied : t.copy}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? t.copied : ""}
      </span>
    </div>
  );
}
