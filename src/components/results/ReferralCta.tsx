/**
 * Partner-CTA. Werbelabel steht sichtbar am Button (nicht nur als Fußnote),
 * die Offenlegung direkt darunter. Ohne Offer: neutraler interner Link ohne Label.
 */
import type { ResolvedCta } from "@/lib/presentation";
import type { Lang } from "@/lib/types";
import { PromoCodeCopy } from "./parts";

export interface ReferralCtaProps {
  cta: ResolvedCta;
  lang: Lang;
  onClick?: () => void;
}

export function ReferralCta({ cta, lang, onClick }: ReferralCtaProps) {
  if (cta.kind === "neutral") {
    return (
      <a
        href={cta.href}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg border text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {cta.label}
      </a>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-stretch gap-2">
        <span
          className="inline-flex shrink-0 items-center rounded-md border border-foreground/30 px-2 text-xs font-semibold uppercase tracking-wide"
          aria-label={lang === "de" ? "Werbung" : "Advertisement"}
        >
          {cta.adLabel}
        </span>
        <a
          href={cta.href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={onClick}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-lg bg-primary px-4 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {cta.label}
        </a>
      </div>
      {cta.promoCode ? <PromoCodeCopy code={cta.promoCode} lang={lang} /> : null}
      {cta.bonusConditions ? <p className="text-xs text-foreground/80">{cta.bonusConditions}</p> : null}
      <p className="text-xs text-foreground/70">{cta.disclosure}</p>
    </div>
  );
}
