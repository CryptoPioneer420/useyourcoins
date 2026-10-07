# Lovable-Prompts, Stand 2026-10-07

## Prompt A: Semrush-Validierung (nur Lesen, keine Code-Änderung)
Prüfe mit dem Semrush-Connector die Keyword-Zahlen aus dem SEO/GEO-Prompt neu. Datenbanken: de, at, ch und us/uk für EN. Cluster: H (Krypto-Steuer-Software), D, A, B, F, G. Liefere pro Keyword: Volumen, KD, Intent, Datum der Abfrage, Datenbank. Kennzeichne Werte, die du nicht abrufen konntest, als "nicht abrufbar". Keine Schätzungen. Ergebnis als Tabelle, nichts im Code ändern.

## Prompt B: R1-Übergabe (Regulierungsinhalte und Schnellpfade)
Übernimm aus dem Paket ausschließlich unverändert: `src/content/knowledge.ts`, `src/content/learn-registry.ts`, `src/lib/quiz.ts`, `src/lib/quick-paths.ts`, die Tests unter `src/lib/__tests__/`.
1. Rendere die Lernseiten `what-providers-report` und `regulation-timeline` über das bestehende Learn-Registry-Muster (DE: `krypto-regulierung-2026-2028`, EN: `crypto-regulation-timeline-2026-2028`). Texte nur aus den Topics, keine eigenen Formulierungen. `asOf` und Quellen sichtbar. `kyc-explained` ist `planned`: nicht rendern, nicht in die Sitemap.
2. Baue auf der Startseite fünf große Buttons aus `QUICK_PATHS` (Label und Hint aus `label`/`hint`). `target.kind === "hub"`: öffne den Hub mit den Filtern aus `target.filters`, serialisiert über die vorhandene `withQuery`/Compare-Query-Logik. `target.kind === "finder"`: öffne den Finder und sende `quickPathQuizAction(path, country)` an `quizReducer`.
3. Bei `dataStatus` "missing" oder "partial" zeige einen Hinweis "Daten werden noch geprüft". Unbekannte Werte weiter als "nicht geprüft" anzeigen, nie stillschweigend ausschließen.
4. Sitemap: 140 URLs (70 pro Sprache). `npx vitest run` muss grün sein.
Keine Änderungen an Texten außerhalb von `src/locales/de.json` und `en.json`.
