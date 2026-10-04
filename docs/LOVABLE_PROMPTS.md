# Lovable-Übergabe: Meilensteine und Prompts

Stand 2026-10-04 · Gliederung nach Lovables Vorgehen in vier Meilensteine. Inhalt und Begründungen: `docs/LOVABLE_BRIEF.md`.

> **Vorrang:** Marke, URL-Schema, Rendering (TanStack Start) und der Auftrag M0 sowie Prompt M1.1 stehen in `docs/M0-UEBERGABE.md` und ersetzen die entsprechenden Stellen hier. Pfade immer über `pathFor()` aus `src/lib/routes.ts`. Die Vergleichstabelle liegt auf den Hubs `/:lang/krypto-karten` bzw. `/:lang/crypto-cards` und `/:lang/krypto-boersen` bzw. `/:lang/crypto-exchanges`; `/:lang/compare` ist nur noch der Direktvergleich.

**Grundregel:** Logik, Datenmodell und Pflichttexte liegen fertig in `src/lib/`, `src/content/`, `src/components/results/` (120 Tests). Lovable baut Oberfläche, Routing und Seiten. **Lovable darf diese Ordner sowie `supabase/**`, `data/**`, `scripts/**` nicht verändern.**

Ablauf je Meilenstein: (1) Claude Code bereitet vor, falls nötig → (2) Prompts in Lovable nacheinander, nach jedem Prompt Vorschau prüfen → (3) Abnahme-Checkliste → (4) erst dann nächster Meilenstein.

---

## M0 · Einrichtung (einmalig)

| # | Schritt | Wer |
|---|---|---|
| 1 | Lovable-Projekt anlegen (`krypto-guide`), noch nichts bauen lassen | Peter |
| 2 | GitHub in Lovable verbinden, Lovable legt das Repo an | Peter |
| 3 | Claude Code mit Auftrag M0 starten | Peter startet, Claude Code führt aus |
| 4 | In Lovable prüfen, dass die Dateien synchronisiert sind; Projektregeln (unten) unter Project Knowledge einfügen | Peter |

Eine Datenbank wird erst in M4 verbunden.

**Auftrag an Claude Code (M0):** siehe `docs/M0-UEBERGABE.md`, Abschnitt 5.1.

**Projektregeln (Project Knowledge in Lovable)**
```
Projekt: EU-Vergleichsportal für Krypto-Karten und Krypto-Börsen. Sprachen DE und EN. Startländer DE, AT, FR, ES, IT, NL, MT, CY.
Fachliche Vorgabe: docs/LOVABLE_BRIEF.md. Ergebnisansicht: docs/KONZEPT-ERGEBNISKARTE.md.

Unveränderliche Regeln:
1. src/lib/**, src/content/**, src/components/results/**, src/types/**, src/data/**, supabase/**, data/**, scripts/** NIEMALS ändern, umbenennen oder duplizieren. Nur importieren.
2. Daten ausschließlich über loadCatalog(catalogSourceFromEnv(import.meta.env.VITE_DATA_SOURCE), supabase) aus src/lib/catalog-source.ts.
   Nie seed.json oder Supabase-Tabellen direkt in Komponenten lesen. Keine Anbieterdaten hart im UI-Code.
3. Ranking nur über matchCatalog(), Filter nur über applyFilters(), Direktvergleich nur über buildComparison(),
   Rechner nur über calculateCost(), Kategorien nur aus CATEGORIES. Keine eigene Rechen- oder Sortierlogik.
4. Partnerlinks nur über resolveCta()/goUrl(). Nie eine Anbieter-URL direkt als Partnerlink.
5. Jeder Partnerlink: adLabel() direkt am Button, AFFILIATE_DISCLOSURE direkt darunter (src/lib/compliance.ts).
6. Über jeder Ergebnisliste: RANKING_DISCLOSURE. Footer jeder Seite: GENERAL_DISCLAIMER. Steuerboxen: TAX_DISCLAIMER.
7. Fachtexte aus I18n-Objekten ({de, en}) nach aktueller Sprache, Texte für Codes aus src/lib/labels.ts.
   Oberflächentexte aus src/locales über t(). Pfade nur über pathFor(), Kopfdaten nur über buildMeta().
8. null heißt "nicht geprüft": anzeigen als "–" plus "nicht geprüft", nie als "Nein" oder "0".
9. Verboten: "steuerfrei", "steuerneutral", "MiCA-konform", "MiCA Ready", "garantiert", "sicher", "maximaler Bonus",
   "Test", "Testsieger", "Testbericht", Countdown oder Dringlichkeit, "Rendite" im Rechner.
10. Keine Cookies, kein Google Analytics, kein GTM, keine Pixel, keine Google-Fonts-Verbindung. Analytics nur über track().
11. Keine Formulare zu Finanzlage, Vermögen oder Risikobereitschaft.
12. Mobile first, WCAG AA, sichtbare Fokus-Stile, Tastaturbedienung im Quiz.
13. Neue Funktionen, die Logik brauchen, die nicht in src/lib existiert: nicht selbst bauen, sondern melden.
```

---

## M1 · Fundament

**M1.1 Layout, Design-System, Routing:** Prompt in `docs/M0-UEBERGABE.md`, Abschnitt 5.2.

**M1.2 Datenquelle und Startseite**
```
1. Katalog im loader der Route laden (serverseitig), nicht erst im Browser:
   - source = catalogSourceFromEnv(import.meta.env.VITE_DATA_SOURCE)
   - loadCatalog(source, source === "supabase" ? supabase : null)
     (supabase-Client aus "@/integrations/supabase/client" erst ab M4)
   - Hook useCatalog() liest die loader-Daten. Fehlerzustand mit common.errorTitle, common.errorBody, common.retry.
2. useLang() aus der Route. Oberflächentexte über t(lang, key), Fachtexte über pick(text, lang), beide aus src/lib/i18n.ts.
3. Startseite /:lang:
   - Hero: kurzer Nutzensatz, drei große Buttons "Karte finden", "Börse finden", "Beides" → /:lang/finder?goal=card|exchange|both
   - Abschnitt "Nach Thema": Links auf alle CATEGORIES (src/lib/categories.ts), Titel aus category.title
   - Abschnitt "Nach Land": 8 Länder aus useCatalog().countries → pathFor({ kind: "country", code }, lang)
   - Abschnitt "Wissen": publishedLearnPages() (src/content/learn-registry.ts) als Karten; Titel und Kurzfassung aus dem zugehörigen KNOWLEDGE_TOPICS-Eintrag
4. Rechtsseiten und /link-unavailable als Platzhalter "Text folgt".
```

**Abnahme M1**
- [ ] Jede Route erreichbar in DE und EN, Sprachwechsel behält die Seite
- [ ] Startseite zeigt 6 Kategorien, 8 Länder, 6 Wissensthemen aus den Daten, nichts hart codiert
- [ ] Footer-Disclaimer auf jeder Seite
- [ ] Mobile 375 px ohne horizontales Scrollen

---

## M2 · Filter und Vergleichslogik

**M2.1 Finder (Quiz)**
```
/:lang/finder:
- useReducer(quizReducer, initialQuizState) aus src/lib/quiz.ts.
- Ohne ?goal: drei Buttons "Karte finden", "Börse finden", "Beides" → dispatch START. Mit ?goal (und optional ?country) direkt starten.
- Schritt: currentStep(state); Frage, Hilfetext, Optionen als große Kacheln (options(state.answers)), Hint klein. Auswahl → ANSWER. Zurück → BACK.
- Fortschritt "Schritt X von Y" (Y = visibleSteps(state.answers, new Set(state.skip)).length).
- status "out_of_scope": Hinweis auf die 8 Länder, Link zur Vergleichstabelle, Zurück.
- status "done": Ergebnisansicht (M2.2) auf derselben Seite; Antworten in die URL schreiben, beim Laden mit allen Parametern direkt Ergebnis.
- Unter dem Quiz: QUIZ_DISCLAIMER.
- Tastatur: Pfeiltasten, Enter, Escape = zurück.
- track(): quiz_start, quiz_step, quiz_back, quiz_out_of_scope, quiz_complete (wirkt erst ab M4, kein Fehler ohne Plausible).
```

**M2.2 Ergebnisansicht**
```
Baue ResultView ausschließlich aus src/components/results. Vorgabe: docs/KONZEPT-ERGEBNISKARTE.md. Nichts nachbauen oder umstylen.
- outcome = matchCatalog(catalog, answers, { today: heutiges Datum YYYY-MM-DD }).
- Oben RANKING_DISCLOSURE mit Link zu /:lang/methodology. outcome.notes als Hinweise (NOTE_LABEL).
- Karten: outcome.cards.map((r, i) => <CardRecommendationCard result={r} answers={answers} country={country} lang={lang}
    position={i+1} functionsBaseUrl={`${import.meta.env.VITE_SUPABASE_URL ?? ""}/functions/v1`} today={heute}
    providerPath={(slug) => `/${lang}/providers/${slug}`}
    pair={outcome.pairs.find(p => p.cardSlug === r.product.slug) ?? null}
    onCtaClick={({slug, position}) => track({ name: "affiliate_click", props: { slug, type: "card", position, source: "quiz", country: country.code } })} />)
- goal "both": darunter "Börsen" mit outcome.exchanges, gleiche Komponente. goal "exchange": nur Börsen.
- Darunter <ResultsTrustLayer results={[...outcome.cards, ...outcome.exchanges]} country={country} lang={lang} />.
- Unten "Neu starten" (RESET) und "Alle Produkte vergleichen".
Hinweis: Bis M4 liefert der Seed keine Partnerlinks; alle Buttons zeigen "Mehr zu {Anbieter}". Das ist korrekt.
```

**M2.3 Vergleichstabelle, Filter und Direktvergleich**
```
/:lang/compare:
- Tabs "Karten" | "Börsen".
- Filterleiste (Mobile als Drawer), alle Felder aus ProductFilters (src/lib/filters.ts):
  Land (Pflicht, Default letzte Quizantwort oder DE), Kartentyp, Verwahrung, Zahlungsquelle, Stablecoin (availableStablecoins),
  "Irgendein Stablecoin", "Ohne Staking", Apple/Google Pay, "Virtuelle Karte", "Nur EU-reguliert", "Datenverantwortlicher im EWR",
  max. FX, max. Monatsgebühr, Einzahlungsweg (Börsen), Sitzland, "Ungeprüfte Werte einblenden" (Default an), "Auslaufende Produkte zeigen".
- Daten: applyFilters(catalog, filters). Felder in result.uncertain mit "?" und Tooltip "nicht geprüft".
- Karten-Spalten: Produkt, Verfügbarkeit im Land, Verwahrung, Zahlungsquelle, Stablecoins, Monatsgebühr, FX, Cashback (cashbackSummary),
  Staking, Zulassung (AUTHORIZATION_LABEL über relevantAuthorization), Datenverantwortlicher, Auswahl-Checkbox.
- Börsen-Spalten: Börse, Verfügbarkeit, Zulassung, Aufsicht/Sitz, exchangeCells (Maker, Taker, Einzahlung, Kryptowerte), Datenverantwortlicher, Auswahl.
- Sortierung: alphabetisch (Default), Nutzer kann nach Spalte sortieren. Keine "Empfohlen"-Sortierung. Über der Tabelle:
  "Alphabetisch sortiert. Partnerlinks sind als Werbung gekennzeichnet."
- Auswahl 2–3 Produkte gleichen Typs → Button "Direkt vergleichen" → /:lang/compare?vs=slug1,slug2[,slug3].
- Direktvergleich: buildComparison(items, country, lang). Tabelle mit Produkten als Spalten, rows als Zeilen,
  Zellen aus row.best hervorgehoben (Hinweis "bester geprüfter Wert"), row.unknown als "– nicht geprüft".
  Darunter je Produkt der CTA über resolveCta (source "table").
- Filterzustand in die URL, track filter_change.
```

**M2.4 Methodik**
```
/:lang/methodology aus describeMethodology(): Version, je Faktor label und description, Gewichtstabelle (Profile × Faktoren in %).
Darüber: "Die Partnerbeziehung zählt mit 10 %. Unbekannte Werte zählen neutral (50 %)."
```

**Abnahme M2**
- [ ] Ergebnis sieht aus wie `preview/ergebniskarte-vorschau.html`
- [ ] Länderfrage "Anderes Land" führt zum Hinweis; Quiz per Tastatur bedienbar
- [ ] Tabelle: Land MT blendet Bybit EU und Trade Republic aus; "Nur EU-reguliert" blendet KAST und RedotPay aus
- [ ] Direktvergleich lehnt gemischte Typen ab (Button deaktiviert) und hebt nur geprüfte Werte hervor
- [ ] Methodik zeigt 10 % Partneranteil in jeder Profilzeile

---

## M3 · Detailseiten und Rechner

**M3.1 Produktseite und Anbieterseite**
```
/:lang/products/:slug (Produktprofil, nie "Test" oder "Testbericht"):
- Kopf wie CardRecommendationCard ohne Score-Aufschlüsselung: Name, Herausgeberzeile (issuerLine), Pills (productPills).
- Konditionen: FeeGrid mit feeCells bzw. exchangeCells, CashbackBanner (Karten).
- Verfügbarkeitsmatrix: 8 Länder × Status aus product.availability.
- Rechner-Block (M3.3) mit diesem Produkt vorausgewählt (nur Karten).
- Regulierung: CountryRegulationAccordion mit dem Land aus der letzten Quizantwort, sonst DE, offen.
- CTA über resolveCta (source "provider_page", subId buildPageSubId("provider_page", land)).
- Link zur Anbieterseite.

/:lang/providers/:slug:
- Name, Website, protectionNote, Trustpilot (nur wenn provider.trustpilot gesetzt; sonst Textlink zu provider.trustpilotDomain).
- Tabelle "Wer steht dahinter": regulationFacts für das erste Produkt; alle Rechtsträger mit Rolle, Sitz, Aufsicht, Zulassung, Quelle.
- Datenschutz: dataControllerNote, dataResidencyNote, kycNote.
- Bei bestAuthorization = none_found: NO_EU_AUTHORISATION_MEANING prominent.
- Alle Produkte des Anbieters als Liste mit Link zur Produktseite.
```

**M3.2 Länder-, Kategorie- und Wissensseiten**
```
/:lang/countries/:code:
- H1 "Krypto-Karten und Börsen in {Land}".
- Box Regulierung: country.micaAuthority, micaTransitionEnded, Kurztext KNOWLEDGE_TOPICS "mica".summary.
- Box Steuern: country.taxSummary, Hinweis bei taxUncertain, Quelle, TAX_DISCLAIMER, FUNDING_FLOW_TAX_HINT.
- Eingebetteter Finder: START mit country vorbelegt (Länderfrage entfällt), Ergebnis wie M2.2 mit source "country_page".
- Liste der Produkte mit Status verfügbar/ungeklärt (applyFilters mit country), alphabetisch.
- Werbelabel hier immer adLabel(lang, country) (zweisprachig, z. B. "Ad · Publicité").

/:lang/category/:slug:
- preset = categoryBySlug(lang, slug), sonst 404. H1 preset.title, Intro preset.intro.
- Liste applyFilters(catalog, { ...preset.filters, country: Land aus Auswahl/Quiz/DE }), alphabetisch, als kompakte Karten
  (Name, Pills, FeeGrid, Link zum Produktprofil). Über der Liste: "Alphabetisch sortiert." Kein Ranking.
- Link "In der Vergleichstabelle filtern" mit denselben Filtern.

/:lang/learn und /:lang/learn/:slug aus KNOWLEDGE_TOPICS: summary groß (Ebene 1), details als Akkordeon (Ebene 2),
sources als Liste (Ebene 3), "Stand: asOf".
```

**M3.3 Kostenrechner**
```
Komponente CostCalculator (Produktseite und /:lang/calculator):
- Eingaben: Kartenumsatz pro Monat (Slider + Feld, 0–5.000 €, Default 500), Anteil Fremdwährung (0–100 %, Default 10),
  Bargeld pro Monat (Default 100 €), Kartenform virtuell/physisch (Default physisch),
  Schalter "Höchstsatz mit Staking einrechnen" (Default aus). Werte aus DEFAULT_SCENARIO (src/lib/calculator.ts).
- /:lang/calculator: bis zu 3 Karten wählen (Suche über catalog.products mit type "card").
- Berechnung ausschließlich calculateCost(product, scenario). Fehler (RangeError) als Feldvalidierung anzeigen.
- Ausgabe je Karte: Zeilen aus result.lines (COST_LINE_LABEL), amountEur null → "nicht berechenbar, nicht geprüft".
  Summe netEur pro Jahr; wenn null: "Keine Summe, weil Angaben fehlen: …" (result.missing).
- Hinweise result.notes (COST_NOTE_LABEL) immer sichtbar, "example_only" direkt unter der Summe.
- Wording: "Kosten und Cashback im Jahr", nie "Rendite" oder "Gewinn". Keine Sortierung nach Ergebnis, Reihenfolge = Auswahl.
```

**Abnahme M3**
- [ ] Produktseite zeigt bei ungeprüften Gebühren "– nicht geprüft" und im Rechner "Keine Summe, weil Angaben fehlen"
- [ ] Länderseite FR zeigt Label "Publicité" bzw. "Ad · Publicité", Steuerbox mit Quelle
- [ ] Kategorie "Self-Custody" zeigt genau Gnosis Pay, MetaMask Card, ether.fi Cash
- [ ] Nirgends "Test", "Testsieger", "Rendite"

---

## M4 · Backend, Skalierung und Launch

**Datenbank: eigenes Supabase-Projekt oder Lovable Cloud?**

| | Eigenes Supabase (Frankfurt) | Lovable Cloud |
|---|---|---|
| Pro | Region EU frei wählbar, Claude Code spielt Migrationen per CLI ein, volle Kontrolle, keine Bindung an Lovable | Einfachste Integration in Lovable, kein zweites Konto |
| Contra | Ein Konto mehr, Verbindung in Lovable manuell | Region, Datenexport und direkter SQL-/CLI-Zugriff nicht geklärt [Vermutung] |

Empfehlung: eigenes Supabase-Projekt in Frankfurt. Kosten: ein zweites Konto, dafür kein Lock-in und sauberer Weg für die vier Migrationen. Wenn du Lovable Cloud nimmst, vorher Region (EU) und SQL-Zugriff bestätigen lassen.

**Auftrag an Claude Code (M4)**
```
1. Supabase-Projekt (Frankfurt) ist in Lovable verbunden. Spiele per Supabase CLI ein:
   001_init.sql, 002_extend.sql, 003_card_details.sql, 004_exchange_fields.sql, danach supabase/seed/seed_v1.sql.
2. supabase/config.toml um supabase/config.functions.toml ergänzen (verify_jwt = false für go).
3. Function-Secrets: SITE_URL=https://useyourcoins.com, ALLOWED_ORIGINS=https://useyourcoins.com,https://www.useyourcoins.com (entspricht ALLOWED_ORIGINS in src/lib/site.ts). Function go deployen.
4. Prüfen: products = 23; /functions/v1/go?s=test → 302 auf /en/link-unavailable; anon kann affiliate_links nicht lesen.
5. Partnerlinks aus der Liste von Peter in affiliate_links eintragen (target_url, subid_param, enabled, Bonusfelder).
6. .env/Lovable-Env: VITE_DATA_SOURCE=supabase. npm test, npm run build.
7. Commit "feat: supabase backend, redirect, affiliate links" und push.
```

**M4.1 Umschalten, Tracking, Recht, SEO (Lovable)**
```
1. Prüfe, dass useCatalog mit VITE_DATA_SOURCE=supabase genau 5 Supabase-Requests beim ersten Laden macht und alle Seiten unverändert funktionieren.
2. Plausible (cookielos) einbinden: Script nur von plausible.io bzw. eigener Domain, Domain aus Env. track() ist bereits verdrahtet.
3. Rechtsseiten mit den Texten von Peter füllen (Impressum inkl. EU-Vertreter, Datenschutz, Disclaimer).
4. /:lang/link-unavailable: "Dieser Partnerlink ist derzeit nicht aktiv." Bei ?p=slug Link zum Produktprofil.
5. SEO: react-helmet-async mit Title, Description, canonical, hreflang de/en/x-default je Seite.
   Strukturierte Daten nur Organization/BreadcrumbList, keine Rating-Markups.
   sitemap.xml aus allen Routen inkl. Produkte, Anbieter, Länder, Kategorien, Wissen.
   robots.txt: /functions/ und /*/link-unavailable disallow.
6. Prüfe, ob Lovable Prerendering/SSG für statische Routen anbietet. Falls nicht: berichten, Peter entscheidet über einen Prerender-Dienst.
```

**Abnahme M4 (Launch-Gate)**
- [ ] Testklick auf einen Partnerlink erzeugt eine `click_events`-Zeile ohne IP, Sub-ID kommt beim Netzwerk an
- [ ] Jeder Partner-CTA zeigt Werbelabel am Button und Offenlegung darunter
- [ ] Impressum, Datenschutz, EU-Vertreter final; kein Cookie ohne Einwilligung (Browser-Speicher leer nach Erstbesuch)
- [ ] `view-source` einer Länderseite enthält Inhalt (nicht nur `<div id="root">`)
- [ ] Trustpilot-Schalter getestet (an/aus)
