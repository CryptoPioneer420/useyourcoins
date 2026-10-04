# Krypto-Spending-Guide: Executive Summary und SEO-Briefing für Lovable

Stand: 2026-10-04. Teil A gibt Lovable das Gesamtverständnis. Teil B ist der Arbeitsauftrag an Lovable (mit Semrush-Connector) für eine Keyword- und Content-Strategie.

---

# Teil A: Executive Summary

## 1. Worum es geht

Ein unabhängiges EU-Vergleichs- und Aufklärungsportal (DE/EN) für **Krypto-Karten und Krypto-Börsen**. Nutzer finden per Quiz, Filter und Direktvergleich das passende Produkt in ihrem Land und verstehen dabei, **welche Regulierung, welche Datenweitergabe und welche steuerlichen Folgen** mit der Nutzung verbunden sind. Finanziert wird das Portal über Affiliate-Links, die klar als Werbung gekennzeichnet sind.

**Differenzierung:** Es gibt viele Vergleichsseiten. Dieses Portal erklärt zusätzlich verständlich, was Nutzer gegenüber Regulierungsbehörden und Anbietern preisgeben (KYC, DAC8, Travel Rule, Datenschutz), und trennt dabei sauber zwischen dem, was automatisch gemeldet wird, und dem, was nicht.

## 2. Zielgruppe und Märkte

- Krypto-Halter, die Krypto im Alltag ausgeben wollen oder einen Anbieter suchen. Einsteiger bis Fortgeschrittene.
- Startländer: **DE, AT, FR, ES, IT, NL, MT, CY**. Sprachen: Deutsch und Englisch (Länderseiten in der jeweiligen Landessprache später).
- Betreiber: DATAMINT LLC (Tiflis, Georgien). Das Portal vermittelt nicht, verwahrt nichts und berät nicht.

## 3. Umfang

**14 Anbieter, 23 Produkte** (Karten und Börsen): Bitpanda, Nexo, Crypto.com, Bybit EU, Kraken, Coinbase, OKX, Revolut, Trade Republic, Gnosis Pay, MetaMask Card, KAST, ether.fi, RedotPay. Auch Anbieter ohne EU-Lizenz sind enthalten und werden faktenbasiert gekennzeichnet.

## 4. Was Nutzer auf der Seite sehen

| Bereich | Inhalt |
|---|---|
| Startseite `/:lang` | Drei Einstiege (Karte / Börse / Beides), Kategorien, Länder, Wissen |
| Finder `/finder` | Quiz mit max. 4 Fragen (Land, Verwahrung, Zahl-Asset, Priorität). Ergebnis: max. 3 Karten, dazu passende Börse |
| Ergebniskarte | Highlight, faktenbasierte Pills, Gebührenraster (unbekannt = "nicht geprüft"), Cashback (mit/ohne Staking), Warnhinweise, Match-Begründung, CTA mit "Werbung"-Label, Promo-Code, Score-Aufschlüsselung |
| Trust-Layer | Akkordeon "Verfügbarkeit und Regulierung in {Land}" und "Was beim Bezahlen mit Krypto steuerlich passiert" |
| Vergleich `/compare` | Tabs, Filter, Direktvergleich von bis zu 3 Produkten |
| Detailseiten | `/products/:slug` ("Produktprofil", nie "Test"), `/providers/:slug`, `/countries/:code`, `/category/:slug` (6 Presets) |
| Werkzeuge und Wissen | Kostenrechner, `/learn` (MiCA, DAC8, Travel Rule, Custody, Stablecoins), `/methodology`, Rechtstexte |

## 5. Ranking und Transparenz

Sechs Faktoren, offen gelegte Gewichtung, Partnerbeziehung mit **10 %** Gewicht (in der Methodik ausgewiesen). Keine "Testsieger"-Sprache, keine Behauptung ungeprüfter Werte. Fehlende Daten werden als "nicht geprüft" angezeigt, nie geschätzt.

## 6. Technischer Stand

- Frontend: Lovable (React, Vite, Tailwind, shadcn). Meilensteine M0–M4: Fundament, Filter und Vergleich, Detailseiten und Rechner, Backend und Skalierung.
- Logik als framework-neutrales TypeScript fertig und getestet (120 Tests): Quiz, Matching, Filter, Rechner, Vergleich, Kategorien, Compliance-Texte.
- Backend ab M4: Supabase (EU, Frankfurt), RLS, Edge Function `/go` für Affiliate-Redirects (Deno, ohne IP-Logging).
- Datenquelle per `VITE_DATA_SOURCE`: Seed bis M4, danach Supabase. **Keine Affiliate-Links vor M4.**
- Gebühren und Cashback sind im Seed bewusst leer, bis sie geprüft sind.

## 7. Leitplanken (nicht verhandelbar)

1. Jede Werbung ist am Button und im Disclosure gekennzeichnet.
2. Keine Rechts- oder Steuerberatung. Steuer nur als Grundprinzipien mit Disclaimer.
3. Keine Behauptungen wie "MiCA Ready" oder "Stablecoin-Steuervorteil". Zahlungen mit Krypto sind in den meisten Startländern steuerlich relevant.
4. DSGVO: kein unnötiges Tracking, Consent, EU-Hosting der Daten.
5. Inhalte erklären, sie leiten nicht zur Umgehung von Pflichten an (siehe Teil B, Abschnitt 2).

## 8. Offene Punkte

Name und Domain, Supabase-Projekt (eigenes oder Lovable Cloud), Prerendering/SEO-Lösung, Gebühren- und Cashback-Daten, Affiliate-Programmbewerbungen, Trustpilot-Lizenz für fremde Scores, EU-Vertreter nach Art. 27 DSGVO.

---

# Teil B: Arbeitsauftrag an Lovable (mit Semrush)

## 1. Ziel

Erarbeite zusammen mit dem Semrush-Connector ein Konzept, mit dem das Portal **über die Zeit** für die relevanten Suchanfragen in DE und EN rankt: Keyword-Analyse, Content-Formate, Keyword-Platzierung, Priorisierung, Messung.

**Wichtig vorab:** Vergleichsseiten für "beste Krypto Kreditkarte" sind hart umkämpft und von etablierten Portalen besetzt. Die realistische Chance liegt in der **Informationsschicht** (Regulierung, KYC, Datenschutz, Steuern pro Land) und in Long-Tail-Anfragen. Das Konzept soll das ehrlich bewerten und nicht Volumen um jeden Preis jagen.

## 2. Inhaltliche Positionierung "Privacy und Regulierung verständlich"

Das Portal soll einfach erklären, **was Nutzer wem gegenüber preisgeben**. Kernbotschaften, Sicherheit jeweils markiert:

| Aussage | Einschätzung |
|---|---|
| KYC ist zunächst ein Verhältnis zwischen Nutzer und Anbieter (Geldwäscheprävention des Anbieters). Aufsichtsbehörden erhalten keine Routinekopie aller KYC-Daten. | [Wahrscheinlich] |
| Behörden bekommen Daten über **definierte Wege**: Verdachtsmeldungen, Auskunftsersuchen, steuerliche Meldungen. | [Sicher] |
| **DAC8** (seit 1.1.2026): Krypto-Dienstleister melden Identität, Steuer-ID und Transaktionssummen automatisch an die Steuerbehörde ihres Sitzlandes, die sie EU-weit austauscht. Erste Meldungen betreffen das Jahr 2026. | [Sicher] |
| Anbieter außerhalb der EU, die EU-Kunden bedienen, müssen sich nach DAC8 in einem Mitgliedstaat registrieren und melden. | [Wahrscheinlich] |
| **Travel Rule** (EU-Geldtransferverordnung, seit 30.12.2024): Bei Transfers zwischen Dienstleistern reisen Absender- und Empfängerdaten mit. Bei Self-Hosted-Wallets gelten Nachweispflichten ab 1.000 EUR. | [Sicher] |
| Außereuropäische Anbieter führen **nicht automatisch** zu "weniger Meldung": Der OECD-Standard CARF wird ab 2027 in vielen Staaten umgesetzt, Karten laufen über EU-Emittenten mit eigenem KYC, und die Steuerpflicht des Nutzers bleibt bestehen. | [Wahrscheinlich] |
| DSGVO-Auskunft (Art. 15) und Drittlandübermittlung (Art. 44 ff.) sind echte Privacy-Hebel des Nutzers gegenüber dem Anbieter. | [Sicher] |

**Redaktionelle Leitplanke (gegen Umgehungs-Framing):**

- Positionierung: "Verstehen, was passiert", **nicht** "so entgehst du Meldungen".
- Nicht gezielt auf Suchbegriffe wie "Krypto ohne KYC" oder "Börse ohne Meldung ans Finanzamt" optimieren. Falls Volumen vorhanden ist: höchstens als Aufklärungsartikel, der erklärt, warum das rechtlich und praktisch keine tragfähige Option ist. Peter entscheidet.
- Grund: Rechtsrisiko (Beihilfe-Vorwürfe), Verstoß gegen Affiliate-Programmbedingungen und Einordnung durch Google als riskanter YMYL-Inhalt.
- Jede Seite mit Steuer- oder Meldebezug: Quellen (EUR-Lex, Steuerbehörden), Stand-Datum, Disclaimer.

## 3. Aufgaben an Lovable und Semrush

1. **Keyword-Universum** je Cluster, Sprache (DE/EN) und Startland: Suchvolumen, Keyword Difficulty, CPC (als Indikator des kommerziellen Werts), Intent, SERP-Features.
2. **Wettbewerbsanalyse:** Top-10-Domains je Cluster, Content-Gap (Keywords, für die Wettbewerber ranken und wir nicht), Backlink-Profile der Hauptwettbewerber, realistische Einschätzung der Rankingchance einer neuen Domain.
3. **Content-Format je Intent** vorschlagen (siehe Abschnitt 5).
4. **Keyword-Platzierungsmatrix** je Seitentyp (siehe Abschnitt 6).
5. **Topic-Cluster und interne Verlinkung:** Pillar-Seiten, Cluster-Seiten, Verlinkung zu Vergleich/Finder.
6. **Priorisierung** nach Impact, Aufwand, Ranking-Chance und kommerziellem Wert, als Roadmap für 90 Tage und 12 Monate.
7. **Messkonzept:** Zielkeywords, Search-Console-Integration, Position-Tracking in Semrush, KPI (Impressions, Klicks, Quiz-Starts, Affiliate-Klicks).

Wenn der Semrush-Connector nicht verfügbar ist oder Daten fehlen: Das benennen und nicht schätzen.

## 4. Keyword-Cluster (Startpunkt, von Semrush zu validieren)

| Cluster | Beispiel-Themen | Intent | Erwartung |
|---|---|---|---|
| A. Karten | Krypto-Kreditkarte, Krypto-Debitkarte, Visa Krypto Karte, Karte pro Land | Kommerziell | Hart umkämpft, hoher CPC |
| B. Börsen | Krypto-Börse Vergleich, Börse pro Land, Gebühren, Sicherheit | Kommerziell | Hart umkämpft |
| C. Regulierung | MiCA erklärt, DAC8, Travel Rule, Lizenzprüfung eines Anbieters | Informational | Mittleres Volumen, gute Autoritätschance |
| D. Privacy und KYC | Was meldet eine Krypto-Börse dem Finanzamt, DAC8 was wird gemeldet, KYC Datenschutz, Auskunft nach DSGVO, Börse außerhalb der EU und Meldepflichten | Informational | **Differenzierungs-Cluster**, Long-Tail |
| E. Steuer-Grundlagen | Mit Krypto bezahlen steuerlich, Stablecoin bezahlen Steuer, je Land | Informational | Hohe Nachfrage, YMYL, nur Grundprinzipien |
| F. Länder | Krypto-Karte in Österreich, Spanien, Zypern usw. | Gemischt | Long-Tail |
| G. Marke + Eigenschaft | "Anbieter X Gebühren", "Anbieter X Verfügbarkeit Deutschland" | Navigational/Info | Produktprofile, keine Testberichte |

## 5. Content-Formate (Vorschlag, von Lovable zu schärfen)

- **Pillar-Guide** je Cluster C, D, E (2.000–3.500 Wörter, Inhaltsverzeichnis, FAQ, Quellen, Stand-Datum).
- **Erklärartikel "Was passiert mit meinen Daten?"** als Serie: KYC, DAC8, Travel Rule, CARF, DSGVO-Rechte. Je Artikel ein Schaubild "Wer sieht was".
- **Länderseiten** (8 Länder): Verfügbarkeit, Regulierung, Steuer-Grundzüge, passende Produkte.
- **Produktprofile** (23): faktenbasiert, strukturierte Daten, keine Bewertungsrhetorik.
- **Interaktive Werkzeuge:** Quiz, Kostenrechner, ggf. "Datenfluss-Checker" (Anbieter + Land = was wird gemeldet). Werkzeuge verdienen Links und Verweildauer.
- **Glossar** (KYC, CASP, EMI, Travel Rule …) als interne Link-Ziele.
- **Aktualitäts-Format:** Kurznews zu Regulierungsänderungen, nur wenn dauerhaft pflegbar.

## 6. Keyword-Platzierung (Matrix zu befüllen)

Für jeden Seitentyp festlegen: Haupt-Keyword, 2–4 Neben-Keywords und Platzierung in

- Title (≤ 60 Zeichen), Meta-Description (≤ 155), URL-Slug (sprachspezifisch)
- H1, erste 100 Wörter, H2/H3, FAQ-Fragen, Bild-Alt-Texte, Ankertexte interner Links
- Strukturierte Daten: `FAQPage`, `Article`, `BreadcrumbList`, `Organization`, `WebSite`. Kein `Review`/`AggregateRating` ohne echte, belegbare Bewertungsgrundlage.

Regeln: kein Keyword-Stuffing, ein Haupt-Keyword pro URL, keine Kannibalisierung zwischen Pillar und Cluster-Seiten.

## 7. Technische SEO-Randbedingungen

- Lovable erzeugt standardmäßig eine Single-Page-App. Das ist für SEO ein Risiko [Wahrscheinlich]. Lovable soll vorschlagen, wie Prerendering oder statisches Rendering umgesetzt wird, und früh (M0) per Search Console ("URL prüfen") testen, ob Google den Inhalt indexiert. Fällt der Test schlecht aus, wird das Frontend nach Next.js migriert. Logik, Schema und Seed bleiben unverändert.
- `hreflang` DE/EN, sprachspezifische Slugs, XML-Sitemap, saubere Canonicals, Core Web Vitals.
- E-E-A-T bei YMYL-Themen: Impressum mit Betreiber, Autorenangabe, Methodik, Quellenangaben, Korrekturhistorie, Werbekennzeichnung.

## 8. Gewünschtes Ergebnis von Lovable

1. Keyword-Tabelle (Keyword, Sprache, Land, Volumen, KD, CPC, Intent, Cluster, Ziel-URL, Priorität).
2. Seitenarchitektur mit Topic-Clustern und interner Verlinkung.
3. Platzierungsmatrix je Seitentyp.
4. Content-Kalender 90 Tage, Reihenfolge nach Chance und Wert.
5. Offene Fragen und Annahmen, ausdrücklich getrennt von belegten Semrush-Daten.

---

*Hinweis zu Teil B, Abschnitt 2: Die regulatorischen Aussagen sind der Stand der Recherche und vor Veröffentlichung je Land gegen Primärquellen (EUR-Lex, nationale Steuerbehörden) zu prüfen. Offene Spezialistenfrage: Formulierung der Privacy-Inhalte aus Sicht DE/AT/FR-Wettbewerbs- und Steuerstrafrecht.*
