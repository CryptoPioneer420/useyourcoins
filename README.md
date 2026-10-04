# UseYourCoins — Übergabepaket

Logik, Datenmodell, Seed und Redirect für das Lovable-Frontend von **UseYourCoins** (useyourcoins.com). Stand 2026-10-04.

## Für Lovable: so wird dieses Repo verwendet

Dieses Repo ist die Quelle für Logik, Daten und Pflichttexte. Es enthält bewusst kein App-Gerüst (kein Router, keine Seiten). Das Gerüst entsteht im Lovable-Projekt.

**Lesereihenfolge**

1. `docs/M0-UEBERGABE.md` — verbindlich: Marke, URL-Schema, Rendering, Abnahme
2. `docs/LOVABLE_BRIEF.md` — Datenmodell, Kernfunktionen, Seiteninhalte
3. `docs/LOVABLE_PROMPTS.md` — Projektregeln und Meilensteine
4. `docs/KONZEPT-ERGEBNISKARTE.md` — Ergebnisansicht

**Übernahme ins Lovable-Projekt**

- Diese Pfade **unverändert und vollständig** übernehmen, gleiche Ordnerstruktur, kein Umschreiben, kein Kürzen, keine Zusammenfassung:
  `src/lib/**`, `src/content/**`, `src/components/results/**`, `src/types/**`, `src/data/**`, `src/locales/**`, `data/seed.json`, `supabase/**`, `scripts/**`, `vitest.config.ts`.
- `data/seed.json` liegt im Projektstamm, nicht unter `src/`. `src/lib/seed-catalog.ts` importiert `../../data/seed.json`.
- Pfad-Alias `@/` zeigt auf `src/`. `tsconfig`: `resolveJsonModule: true`.
- Danach `npm test` ausführen. **Erwartet: 120 bestandene Tests in 5 Dateien.** Weicht die Zahl ab, wurde eine Datei verändert oder vergessen. Dann die Datei erneut aus diesem Repo holen, nicht anpassen.
- Diese Ordner im Lovable-Projekt nie ändern. Fehlt Logik: melden, nicht selbst bauen.

**Start:** Prompt in `docs/M0-UEBERGABE.md`, Abschnitt 5.2.

## Inhalt

| Pfad | Inhalt |
|---|---|
| `docs/M0-UEBERGABE.md` | **Zuerst lesen:** Keyword-Bewertung, URL-Architektur, Rendering, Antworten an Lovable, Aufträge M0 |
| `src/lib/site.ts` | Marke, Domain, Betreiberangaben, Logo-Freigaben |
| `src/lib/routes.ts` | Alle Pfade, hreflang, Sitemap, robots.txt |
| `src/lib/seo.ts` | Titel, Beschreibung, H1, Brotkrumen, JSON-LD |
| `src/lib/i18n.ts`, `src/locales/` | Oberflächentexte DE/EN |
| `src/content/learn-registry.ts` | Wissensseiten mit Keyword, Status, Priorität |
| `src/types/`, `src/data/seed.ts` | Einstiege im von Lovable gewünschten Format |
| `docs/LOVABLE_BRIEF.md` | **Einstieg für Lovable:** Datenmodell, Kernfunktionen, Seitenstruktur, Meilensteine |
| `docs/PRD.md` | Produktanforderungen, Score-Formel, Gewichte, Edge Cases, Fahrplan |
| `docs/LOVABLE_PROMPTS.md` | Meilensteine M0–M4: Aufträge an Claude Code, Lovable-Prompts, Abnahme |
| `docs/stufe-0-fundament.md` | Arbeitspakete Stufe 0, Entscheidungslog |
| `docs/KONZEPT-ERGEBNISKARTE.md` | Vorgabe Ergebniskarte und Trust-Layer |
| `src/lib/presentation.ts` | Pills, Gebührenraster, Cashback-Zeile, CTA-Auflösung, Regulierungsfakten |
| `src/content/payment-tax.ts` | Steuer-Erklärer je Land (3 Sätze) |
| `src/components/results/` | `CardRecommendationCard`, `ResultsTrustLayer` und Bausteine |
| `preview/ergebniskarte-vorschau.html` | Statische Vorschau (mobil) mit Beispielwerten |
| `src/lib/types.ts` | Domain-Typen |
| `src/lib/quiz.ts` | Fragen, State-Machine (`quizReducer`) |
| `src/lib/ranking-config.ts` | Gewichte, Methodik-Texte (einzige Quelle) |
| `src/lib/matching.ts` | Filter, Scoring, Badges, Pairing Karte↔Börse |
| `src/lib/filters.ts` | Vergleichstabelle |
| `src/lib/compliance.ts`, `labels.ts` | Pflichttexte, UI-Labels DE/EN |
| `src/lib/tracking.ts` | Sub-ID, Redirect-URL, Analytics-Events |
| `src/lib/data-access.ts` | Supabase → Domain |
| `src/lib/seed-catalog.ts`, `catalog-source.ts` | Datenquelle Seed (M1–M3) oder Supabase (ab M4) |
| `src/lib/calculator.ts` | Kostenrechner (Cashback minus Gebühren pro Jahr) |
| `src/lib/compare.ts` | Direktvergleich 2–3 Produkte |
| `src/lib/categories.ts` | Kategorieseiten als Filter-Voreinstellungen |
| `src/content/knowledge.ts` | Wissensartikel MiCA, DAC8, Travel Rule, Custody, Stablecoins, Kartenfunktion |
| `data/seed.json` | 14 Anbieter, 23 Produkte, Steuer-Grundzüge 8 Länder |
| `supabase/migrations/` | `001_init.sql` bis `004_exchange_fields.sql` |
| `supabase/seed/seed_v1.sql` | generiert aus `data/seed.json` |
| `supabase/functions/go/` | Affiliate-Redirect (Deno) |
| `scripts/` | Seed-Generator, SQL-Verifikation (PGlite) |

Prüfungen: `npm test` (120 Tests), `npm run typecheck`, `npm run db:verify` (Migrationen + Seed zweimal, Constraints).
Seed ändern: `data/seed.json` bearbeiten, dann `npm run seed:sql` und `npm run db:verify`.
