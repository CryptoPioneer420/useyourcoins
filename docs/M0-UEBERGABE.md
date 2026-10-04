# M0-Übergabe: Keyword-Analyse, Architektur, Antworten an Lovable

Stand 2026-10-04 · Marke **UseYourCoins**, Domain `useyourcoins.com` · Betreiber DATAMINT LLC

Dieses Dokument beantwortet Lovables vier offene Punkte, bewertet die Semrush-Matrix und legt die URL-Architektur fest. Bei Widerspruch zu älteren Dokumenten gilt dieses.

---

## 1. Bewertung der Keyword-Matrix

### 1.1 Was die Zahlen sagen

| | DE (Datenbank `de`) | EN (Datenbank `us`) |
|---|---|---|
| Cluster C Regulierung | 120 Suchen/Monat | 1.490 |
| Cluster D Privacy/KYC | 520, davon 480 "ohne KYC" | 50 |
| Cluster E Steuern | 110 | 120 |
| **Summe** | **750** | **1.660** |

1. **Die Informations-Cluster bringen kaum Besucher.** Ohne die zwei "ohne KYC"-Begriffe bleiben im deutschen Markt 270 Suchen pro Monat über 14 Keywords. Selbst mit durchgehend guten Platzierungen sind das wenige Dutzend Besuche im Monat. Semrush-Werte von 10 bis 20 sind zudem Schätzstufen, keine Messung.
2. **Die englischen Zahlen stammen aus dem falschen Markt.** Die Datenbank `us` misst Suchen in den USA. Für die Zielländer sagen sie nichts aus.
3. **Zwei der größten englischen Keywords haben Unternehmens-Intent.** "mica crypto license" (320) suchen Firmen, die eine Zulassung wollen. "dac8 compliance solutions" (110) suchen Anbieter, die Meldesoftware kaufen. Beides ist nicht unser Publikum.
4. **64 % des deutschen Volumens liegen auf "ohne KYC".** Wer das sucht, will einen Anbieter ohne Identitätsprüfung. Den liefern wir nicht. Eine Aufklärungsseite kann ranken, wird aber selten zu einem Klick auf einen Partnerlink führen.
5. **Die umsatzrelevanten Cluster fehlen.** Karten (A), Börsen (B), Länder (F) und Marke plus Eigenschaft (G) sind nicht analysiert. Ebenso fehlen Keyword-Schwierigkeit, Wettbewerber und Content-Gap. Vom Auftrag im SEO-Briefing ist damit etwa ein Drittel geliefert.

**Folgerung:** Die Wissensseiten tragen Vertrauen, interne Verlinkung und die Differenzierung, aber nicht die Reichweite. Ob das Portal über Suche Reichweite bekommt, entscheidet sich in den Clustern A, B, F und G. Diese Analyse muss vor dem Schreiben weiterer Inhalte nachgeliefert werden (Auftrag in Abschnitt 6).

### 1.2 Korrekturen an Lovables Seitenplan

| Lovables Vorschlag | Entscheidung | Grund |
|---|---|---|
| `/de/learn/krypto-kreditkarte-steuern` und `/de/learn/mit-krypto-bezahlen-steuern` | Eine Seite: `mit-krypto-bezahlen-steuern` | Gleiche Suchabsicht, zwei Seiten würden gegeneinander ranken |
| `crypto-card-taxes-guide` und `tax-when-paying-with-crypto` | Eine Seite: `tax-when-paying-with-crypto` | Wie oben |
| Zwei "ohne KYC"-Seiten (Börse, Karte), beide P1 | Eine Seite, Status "Freigabe offen", ohne Anbieterliste und ohne Partnerlink | Risiko Umgehungs-Framing; eine Seite genügt für beide Begriffe |
| `mica-casp-license-check` als P1 | Aus Nutzersicht ("Zulassung prüfen"), P2 | Suchende sind überwiegend Unternehmen |
| "dac8 compliance solutions" als Ziel | Gestrichen | Unternehmens-Intent |
| `eu-aml-kyc-thresholds` als eigene Seite | In "Was Krypto-Anbieter melden" aufgenommen | Volumen 10, kein eigenes Thema |
| "Wie Bitpanda Meldungen nach DAC8 handhabt" als Linktext | Allgemein: "Was Anbieter nach DAC8 melden" | Anbieterbezogene Aussage können wir nicht belegen |
| `/products/bitpanda` | `/products/bitpanda-card`, `/providers/bitpanda` | Produkt und Anbieter sind getrennte Seiten |
| Silo-Diagramm `/learn/mica` neben Tabelle `/learn/mica-verordnung-krypto` | Es gilt die lange Form | Widerspruch im Dokument |

Alle Wissensseiten mit Keyword, Status und Priorität stehen in `src/content/learn-registry.ts`. Nur Seiten mit Status `published` erscheinen in Navigation und Sitemap. Sechs sind veröffentlicht, sechs geplant, eine wartet auf Freigabe.

---

## 2. URL- und Silo-Architektur (verbindlich)

Lovables Drei-Silo-Modell wird übernommen. Einzige Quelle für alle Pfade ist `src/lib/routes.ts`.

**Schema:** `/:lang/<abschnitt>/<slug>`. Abschnittsnamen sind in beiden Sprachen gleich, Slugs sind übersetzt.

| Silo | Seite | DE | EN | Index |
|---|---|---|---|---|
| – | Start | `/de` | `/en` | ja |
| Transaktion | Finder | `/de/finder` | `/en/finder` | ja |
| Transaktion | Hub Karten | `/de/krypto-karten` | `/en/crypto-cards` | ja |
| Transaktion | Hub Börsen | `/de/krypto-boersen` | `/en/crypto-exchanges` | ja |
| Transaktion | Kategorie (6) | `/de/category/self-custody-karten` | `/en/category/self-custody-cards` | ja |
| Transaktion | Rechner | `/de/calculator` | `/en/calculator` | ja |
| Transaktion | Direktvergleich | `/de/compare?vs=a,b` | `/en/compare?vs=a,b` | **nein** |
| Wissen | Hub | `/de/learn` | `/en/learn` | ja |
| Wissen | Artikel | `/de/learn/dac8-meldepflicht-krypto` | `/en/learn/dac8-crypto-reporting` | ja |
| Wissen | Methodik | `/de/methodology` | `/en/methodology` | ja |
| Entitäten | Produkt (23) | `/de/products/kraken-card` | `/en/products/kraken-card` | ja |
| Entitäten | Anbieter (14) | `/de/providers/kraken` | `/en/providers/kraken` | ja |
| Entitäten | Länderübersicht | `/de/countries` | `/en/countries` | ja |
| Entitäten | Land (8) | `/de/countries/oesterreich` | `/en/countries/austria` | ja |
| – | Recht (3) | `/de/legal/imprint` | `/en/legal/imprint` | ja |

Das ergibt 68 indexierbare Seiten je Sprache, 136 URLs.

**Änderungen gegenüber dem bisherigen Plan**

- Die Vergleichstabelle zieht von `/compare` auf zwei Hubs um (Karten, Börsen), weil nur eine eigene URL je Typ für "Krypto-Kreditkarte" und "Krypto-Börse" ranken kann. `/compare` bleibt für den Direktvergleich ausgewählter Produkte und wird nicht indexiert.
- Der Karten-Hub heißt `krypto-karten`, nicht `krypto-kreditkarten`. Die meisten Produkte sind Debit- oder Prepaid-Karten. Das Suchwort "Krypto-Kreditkarte" steht im Titel und in der H1, mit der Einordnung im ersten Absatz.
- Länderseiten haben Namens-Slugs (`oesterreich`) statt Codes (`at`).
- `hreflang`: `de`, `en` und `x-default` auf Englisch. `/` leitet serverseitig nach `Accept-Language` weiter.

**Interne Verlinkung**

| Von | Nach | Umsetzung |
|---|---|---|
| Wissensartikel | Finder | Kasten mit `learn.finderBoxTitle/Body/Cta` |
| Wissensartikel | Länderseiten | Im Steuerteil je Land |
| Produktprofil | Wissensartikel | Im Trust-Layer, allgemein formuliert |
| Produktprofil | Hub des Typs | Brotkrumen aus `breadcrumbs()` |
| Länderseite | Finder mit vorbelegtem Land | `country.finderCta` |
| Kategorie | Hub des Typs | Brotkrumen |

**Keyword-Platzierung je Seitentyp** liefert `buildMeta()` aus `src/lib/seo.ts`: Titel (höchstens 60 Zeichen, nie abgeschnitten, sondern kürzere Variante), Beschreibung (höchstens 155 Zeichen, ganze Sätze), H1, Canonical, `hreflang`, `robots`. Strukturierte Daten: `Organization`, `WebSite`, `BreadcrumbList`, `Article`, `FAQPage`. Kein `Review` und kein `AggregateRating`.

---

## 3. Antworten auf Lovables vier Punkte

### 3.1 Name, Domain, Titel

| | |
|---|---|
| Marke | UseYourCoins |
| Kanonische Domain | `https://useyourcoins.com` (ohne www, www leitet weiter) |
| Titel | `{Seite} \| UseYourCoins`, Startseite `UseYourCoins: {Claim}` |
| Quelle | `src/lib/site.ts` (`SITE`, `ALLOWED_ORIGINS`) |

### 3.2 Rendering: TanStack Start mit serverseitigem Rendern

**Entscheidung: TanStack Start (SSR), kein Vite-Prerender-Plugin.**

Seit 13. Mai 2026 ist TanStack Start der Standard für neue Lovable-Projekte. Seiten werden auf dem Server zu fertigem HTML gerendert und über Cloudflare Workers ausgeliefert. Rendering ist je Route wählbar (Server, statisch, Client).

| Option | Pro | Contra |
|---|---|---|
| **TanStack Start (gewählt)** | Lovable-Standard, kein Zusatzwerkzeug, fertiges HTML für alle Routen, Kopfdaten je Route | Code muss servertauglich sein; Auslieferung über Cloudflare |
| Vite + Prerender-Plugin | Rein statische Dateien | Plugin kaum gepflegt, gegen Lovables Standard, eigene Build-Pflege |
| Next.js ohne Lovable | Volle Kontrolle | Kein visueller Editor, gesamte Oberfläche selbst bauen |

Voraussetzungen im Paket sind erfüllt:

- Logik und Komponenten greifen nicht ungeschützt auf `window`, `document` oder `navigator` zu.
- `prerenderPaths(catalog)` liefert alle 136 Pfade, falls einzelne Routen statisch erzeugt werden sollen.
- `sitemapXml()` und `robotsTxt()` liefern die Inhalte für `/sitemap.xml` und `/robots.txt`.

**Vorgabe an Lovable:** Der Katalog wird im `loader` der Route geladen, nicht erst im Browser. Sonst enthält das HTML nur Platzhalter und der Vorteil des Server-Renderns entfällt. `noindex`-Seiten (`/compare`) dürfen clientseitig rendern.

### 3.3 Daten im Seed

**Ja, Basisdaten sind für alle 23 Produkte vorhanden. Drei Einschränkungen.**

| Angabe | Stand |
|---|---|
| Name, Typ, Anbieter, Verwahrungsart | 23 von 23 |
| Rechtsträger mit Zulassungsart, Aufsicht, Sitz | 14 von 14 Anbietern |
| Website und Quelle | 23 von 23 |
| Länder-Zuordnung (8 Länder je Produkt) | 184 Zellen, davon **48 "unbekannt"** |
| Gebühren, Cashback, Börsengebühren | planmäßig leer, Anzeige "nicht geprüft" |
| Prüfstand | **0 von 23 gegen Primärquelle geprüft** (`confidence: "secondary"` oder `"unverified"`) |
| Logo-URL | **nicht vorhanden** |

1. **Verfügbarkeit:** Bei sechs Produkten ist kein Land belegt: Nexo Card, Nexo, Gnosis Pay, KAST, ether.fi Cash, RedotPay. Sie erscheinen mit dem Hinweis "Verfügbarkeit nicht bestätigt".
2. **Prüfstand:** Statt `isVerified` gibt es das Feld `confidence` mit drei Stufen. `isVerified(item)` aus `src/data/seed.ts` liefert `true` nur bei `"verified"`. Aktuell ist das bei keinem Produkt der Fall.
3. **Logos:** Logos sind Marken der Anbieter. Sie werden erst eingebunden, wenn eine Nutzungserlaubnis vorliegt, in der Regel aus dem Partnerprogramm. Bis dahin zeigt die Oberfläche ein Monogramm (`providerMonogram()`). Freigegebene Logos kommen nach `public/logos/<anbieter>.svg` und in `PROVIDER_LOGOS`.

`seedCoverage()` liefert diese Zahlen jederzeit aktuell.

### 3.4 Disclaimer und Impressum

**Die Pflichttexte liegen wortgetreu vor**, in `src/lib/compliance.ts`, jeweils DE und EN:

| Baustein | Konstante | Einsatz |
|---|---|---|
| Allgemeiner Hinweis | `GENERAL_DISCLAIMER` | Footer jeder Seite |
| Steuerhinweis | `TAX_DISCLAIMER` | Jede Steuerbox |
| Finder-Hinweis | `QUIZ_DISCLAIMER` | Unter dem Quiz |
| Werbelabel | `adLabel()` | Direkt am Partner-Button |
| Partnerlink-Hinweis | `AFFILIATE_DISCLOSURE` | Direkt unter dem Button |
| Reihenfolge | `RANKING_DISCLOSURE` | Über jeder Ergebnisliste |
| Keine EU-Zulassung | `NO_EU_AUTHORISATION_MEANING` | Neben jedem solchen Anbieter |
| Trustpilot | `TRUSTPILOT_NOTE` | Neben Bewertungen |

`GENERAL_DISCLAIMER` (DE), wörtlich:

> Die Inhalte dienen der allgemeinen Information und dem Vergleich. Sie berücksichtigen nicht deine persönlichen Verhältnisse und sind keine Anlage-, Rechts- oder Steuerberatung und keine Aufforderung zum Kauf oder Verkauf von Kryptowerten. Kryptowerte können erheblich an Wert verlieren. Gebühren, Leistungen, Regulierung und Verfügbarkeit können sich ändern; maßgeblich sind die aktuellen Unterlagen des Anbieters. Als Werbung gekennzeichnete Links können eine Vergütung für uns auslösen.

Die Texte sind Entwürfe und von Peter freizugeben.

**Impressumsdaten fehlen.** In `src/lib/site.ts` stehen Name, Rechtsform und Sitz. Fünf Pflichtangaben sind leer und werden nicht geraten:

| Feld | Benötigt |
|---|---|
| `streetAddress` | Ladungsfähige Anschrift in Tiflis |
| `registrationNo` | Registernummer |
| `representedBy` | Vertretungsberechtigter Direktor |
| `email` | Kontaktadresse |
| `euRepresentative` | Vertreter in der EU nach Art. 27 DSGVO |

`missingOperatorFields()` nennt die fehlenden Felder. Solange die Liste nicht leer ist, zeigt das Impressum `legal.imprintIncomplete` und die Seite geht nicht öffentlich.

---

## 4. Paket nach Lovables Übergabeformat

| Lovable erwartet | Im Paket | Hinweis |
|---|---|---|
| `/src/types/product.ts`, `provider.ts`, `country.ts`, `quiz.ts` | vorhanden | Re-Exporte. Definitionen bleiben in `src/lib/types.ts`, `quiz.ts`, `matching.ts` |
| Quiz- und Matching-Logik | `src/lib/quiz.ts`, `matching.ts`, `ranking-config.ts` | 4 Antworten → bis zu 3 Karten, Börse, Begründung |
| Filter und Sortierung | `src/lib/filters.ts`, `compare.ts`, `categories.ts` | |
| Rechner | `src/lib/calculator.ts` | Cashback minus Gebühren pro Jahr |
| Tests | `src/lib/__tests__/` | **120 Tests** (vorher 87), Vitest |
| `/src/data/seed.ts` | vorhanden | Einstieg; Daten in `data/seed.json`. Seiten nutzen `loadCatalog()` |
| Länder-Zuordnung | `product.availability` | 8 Länder je Produkt |
| `/src/locales/de.json`, `en.json` | vorhanden, 137 Texte je Sprache | Nur Oberfläche (Navigation, Überschriften, Schaltflächen). Zugriff über `t()` aus `src/lib/i18n.ts` |
| Quiz-Fragen, Kategorien, Rechtshinweise | `src/lib/quiz.ts`, `categories.ts`, `compliance.ts`, `labels.ts` | **Bewusst nicht in JSON.** Die Logik spricht diese Texte über typisierte Codes an. Eine Kopie in JSON würde zwei Quellen schaffen |
| Neu | `src/lib/site.ts`, `routes.ts`, `seo.ts`, `i18n.ts`, `src/content/learn-registry.ts` | Marke, Pfade, Meta-Daten, Wissens-Register |

**Abweichung von Lovables Wunsch:** Fachtexte liegen nicht in den JSON-Dateien. Der Preis ist, dass Lovable zwei Zugriffswege kennt (`t()` für Oberfläche, `pick()` für Fachtexte). Der Nutzen ist, dass Pflichttexte und Quiz nicht versehentlich in der Oberfläche umformuliert werden.

Prüfungen: `npm test` (120 Tests), `npm run typecheck`, `npm run db:verify`.

---

## 5. Aufträge für M0

### 5.1 Auftrag an Claude Code

```
Kontext: Neues Lovable-Projekt (TanStack Start) ist mit GitHub verbunden, Repo <REPO-URL> ist geklont.
Übergabepaket unter <PFAD>/krypto-guide.

1. Kopiere ins Repo, Struktur beibehalten:
   src/lib/**, src/content/**, src/components/results/**, src/types/**, src/data/**, src/locales/**,
   data/seed.json, scripts/**, supabase/**, docs/**, public/logos/README.md, vitest.config.ts.
   Vorhandene Dateien des Lovable-Gerüsts nicht überschreiben; bei Namenskonflikt stoppen und berichten.
2. Prüfe: Pfad-Alias "@/" zeigt auf src/. tsconfig: resolveJsonModule = true.
3. devDependencies ergänzen, falls nicht vorhanden: vitest, @electric-sql/pglite.
   Scripts: "test": "vitest run", "typecheck": "tsc --noEmit",
   "db:verify": "node scripts/verify-sql.mjs", "seed:sql": "node scripts/build-seed-sql.mjs".
4. .env: VITE_DATA_SOURCE=seed
5. npm install, npm test (120 Tests), npm run typecheck, npm run db:verify, npm run build.
   Bei Fehlern stoppen und berichten, nichts in src/lib anpassen.
6. Berichte: React-Version, Tailwind-Version, Verzeichnis und Namensschema der Routen,
   wie Kopfdaten je Route gesetzt werden (head), ob src/lib-Module im Server-Render fehlerfrei laden.
7. Commit "chore: core logic, routes, seo, locales" und push.
```

### 5.2 Prompt an Lovable: Gerüst und Routing (ersetzt M1.1)

```
Baue das Grundgerüst mit TanStack Start und serverseitigem Rendern. Vorgabe: docs/M0-UEBERGABE.md.

Routing
- Sprache als erstes Segment, lang ∈ {de, en}, geprüft mit isLang() aus src/lib/routes.ts, sonst 404.
- "/" leitet serverseitig weiter: langFromAcceptLanguage(Accept-Language-Header) → /de oder /en.
- Routen: /$lang, /$lang/finder, /$lang/compare, /$lang/calculator, /$lang/methodology,
  /$lang/learn, /$lang/learn/$slug, /$lang/products/$slug, /$lang/providers/$slug,
  /$lang/countries, /$lang/countries/$slug, /$lang/category/$slug,
  /$lang/legal/imprint, /$lang/legal/privacy, /$lang/legal/disclaimer, /$lang/link-unavailable,
  /$lang/$hub (Karten- und Börsen-Hub), /sitemap.xml, /robots.txt.
- Slugs auflösen nur mit: hubBySlug, countryBySlug (routes.ts), categoryBySlug (categories.ts),
  learnPageBySlug (content/learn-registry.ts). Liefert die Funktion null → 404.
- Links nie als Zeichenkette bauen, immer pathFor(ref, lang). Sprachumschalter: switchLanguage(ref, zielsprache).

Kopfdaten je Route (head)
- meta = buildMeta(ref, lang, catalog) aus src/lib/seo.ts: title, description, canonical, robots,
  alternates als <link rel="alternate" hreflang>, og:locale. Die sichtbare H1 ist meta.h1.
- JSON-LD mit serializeJsonLd(): organizationJsonLd + websiteJsonLd auf der Startseite,
  breadcrumbJsonLd(breadcrumbs(...)) auf allen Unterseiten, articleJsonLd auf Wissensartikeln.
- <html lang> entspricht der Sprache der Route.
- /sitemap.xml liefert sitemapXml(catalog, heutiges Datum), /robots.txt liefert robotsTxt().

Daten
- Katalog im loader der Route laden: loadCatalog(catalogSourceFromEnv(import.meta.env.VITE_DATA_SOURCE), null).
  Nicht erst im Browser nachladen. Das ausgelieferte HTML muss die Inhalte enthalten.
- /$lang/compare darf clientseitig rendern (noindex).

Texte
- Oberfläche: t(lang, "bereich.schluessel") aus src/lib/i18n.ts. Keine Texte hart im Code.
- Fachtexte: I18n-Objekte aus src/lib und src/content über pick(text, lang).
- src/locales/*.json nur um Oberflächentexte erweitern, immer in beiden Sprachen.

Layout
- Header: Wortmarke "UseYourCoins" als Text, Navigation aus nav.* (Finder, Karten, Börsen, Rechner, Länder, Wissen),
  Sprachumschalter, Sprunglink common.skipToContent.
- Footer: GENERAL_DISCLAIMER, Links Impressum, Datenschutz, Hinweise, Methodik, footer.noCookies,
  footer.operatedBy mit OPERATOR.legalName.
- Anbieter-Logo: providerLogoPath(slug); bei null das Monogramm aus providerMonogram(name).
- Impressum: Felder aus OPERATOR. Ist missingOperatorFields() nicht leer, legal.imprintIncomplete anzeigen.

Design-System: nach docs/DESIGN.md (Richtung B, Neobank-Optik). Sichtreferenz: preview/design-richtung-b.html.

Seiten zunächst als Platzhalter mit H1 aus buildMeta().
```

### 5.3 Abnahme M0/M1

- [ ] `npm test` zeigt 120 bestandene Tests, `npm run build` läuft
- [ ] Quelltext von `/de/learn/mica-verordnung-krypto` (ohne JavaScript) enthält H1 und Fließtext
- [ ] Jede Seite hat genau einen `canonical` und drei `hreflang`-Einträge
- [ ] `/sitemap.xml` listet 136 URLs, `/de/compare` hat `noindex`
- [ ] `/en/krypto-karten` und `/de/learn/krypto-ohne-kyc` liefern 404
- [ ] Sprachwechsel auf `/de/countries/oesterreich` führt zu `/en/countries/austria`
- [ ] Footer-Hinweis auf jeder Seite, keine Cookies, keine externen Schriften

---

## 6. Nächster Semrush-Auftrag an Lovable

```
Ergänze die Keyword-Matrix um die fehlenden Teile. Schätze keine Werte; fehlende Daten als "keine Daten" ausweisen.

1. Cluster A (Karten), B (Börsen), F (Land + Karte/Börse), G (Marke + Eigenschaft) für die 14 Anbieter.
2. Datenbanken: de und at für deutsche Keywords. Für englische Keywords die Datenbanken der Zielländer
   (nl, es, fr, it, mt, cy), nicht us. Zusätzlich je Zielland die Top-Keywords in Landessprache für
   "Krypto-Karte" und "Krypto-Börse", um zu beurteilen, ob sich Französisch, Spanisch, Italienisch, Niederländisch lohnen.
3. Je Keyword: Volumen, Keyword Difficulty, CPC, Intent, SERP-Features, Top-3-Domains.
4. Wettbewerb: die zehn sichtbarsten Domains je Cluster, deren Autorität und Verlinkung,
   Content-Gap, und eine begründete Einschätzung, welche Keywords eine neue Domain in 6 bis 12 Monaten erreichen kann.
5. Für die sieben Seiten, die in learn-registry.ts in mindestens einer Sprache keywordFromSemrush = false haben, das Haupt-Keyword belegen oder ersetzen.
6. Ergebnis als Tabelle mit Ziel-URL nach dem Schema in docs/M0-UEBERGABE.md, Abschnitt 2.
```

---

## 7. Offene Punkte

| # | Punkt | Wer | Blockiert |
|---|---|---|---|
| 1 | Impressumsdaten (fünf Felder, Abschnitt 3.4) | Peter | Veröffentlichung |
| 2 | Freigabe oder Ablehnung der Seite "Krypto ohne KYC" | Peter | nur diese Seite |
| 3 | Freigabe der Pflichttexte in `compliance.ts` | Peter | Veröffentlichung |
| 4 | Semrush-Nachlieferung Cluster A, B, F, G | Lovable | Content-Plan |
| 5 | Verfügbarkeit von sechs Produkten, Gebühren und Cashback aller Produkte | Recherche | Aussagekraft von Finder und Rechner |
| 6 | Logo-Freigaben über Partnerprogramme | Peter | nur Optik |
| 7 | Datenschutzerklärung: Auslieferung über Cloudflare (Serverprotokolle, Drittlandbezug) | Spezialist | Veröffentlichung |
| 8 | Markenrecherche "UseYourCoins" (EUIPO, DPMA) | Peter | nicht geprüft |
