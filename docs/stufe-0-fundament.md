# Stufe 0 — Fundament (Krypto-Spending-Guide)

Stand: 2026-10-01 · Betreiber: DATAMINT LLC · Zielmarkt: EU · Sprachen: DE/EN
Startländer: DE, AT, FR, ES, IT, NL, MT, CY · Dauer: ca. 5 Arbeitstage (Wartezeiten parallel)

## Entscheidungslog (von Peter getroffen)

| Entscheidung | Datum |
|---|---|
| Alle 14 Anbieter aufnehmen: Bitpanda, Nexo, Crypto.com, Bybit EU, Kraken, Coinbase, OKX, Revolut, Trade Republic, Gnosis Pay, MetaMask Card, KAST, Ether.fi, RedotPay | 2026-10-01 |
| Affiliate-Links für alle Anbieter vorgesehen; Risiko bewusst bei Peter/DATAMINT | 2026-10-01 |
| Trustpilot-Score, Sterne, Reviewanzahl werden angezeigt (Schalter `trustpilot_display`) | 2026-10-01 |
| Länderstart wie oben, Sprachen DE/EN | 2026-10-01 |
| Steuer: nur Grundzüge je Land, mit Stand-Datum und Hinweis "keine Rechts-/Steuerberatung" | 2026-10-01 |
| Stack A: Lovable; Logik, Schema, Seed und Redirect-Function vorab gebaut und getestet | 2026-10-01 |
| Ranking mit offengelegter Gewichtung, Partnerbeziehung = 10 % (Methodik 2026-10-01.1) | 2026-10-01 |
| Quiz-Ergebnis: Karte primär, Börse gekoppelt (gleicher Anbieter bzw. On-Ramp); bei "beides" zusätzlich Börsenliste (Empfehlung Claude, Bestätigung offen) | 2026-10-01 |

**Offen:** Bestätigung Quiz-Ergebnis-Logik; Domain/Markenname.

## Produktgrenzen (aus Georgien-/DAC8-Analyse, Prompt 1)

Keine Orders, keine Wallets, keine Kundengelder, kein Order-Routing, kein eingebettetes Kauf-/Swap-Widget, kein KYC-Datenfluss über unsere Seite. Nur Information, Vergleich und Weiterleitung. Das Quiz ist ein Filter ohne Fragen zu Vermögen, Anlageziel oder Risikobereitschaft.

## Arbeitspakete

| ID | Paket | Wer | Aufwand | Abhängigkeit | Fertig, wenn |
|---|---|---|---|---|---|
| 0.1 | Stack-Entscheidung A/B | Peter + Claude | erledigt | — | Lovable (A) |
| 0.2 | Name, Domain, Marken-Check (DPMA/EUIPO), Registrant = DATAMINT LLC | Peter | 2 h | — | Domain registriert |
| 0.3 | GitHub-Repo, Supabase-Projekt (Region Frankfurt), Hosting-Account | Peter legt Accounts an, Claude Code richtet ein | 2 h | 0.1 | Repo + Projekt leer lauffähig |
| 0.4 | `001_init.sql`, `002_extend.sql`, `seed_v1.sql` einspielen | Claude Code | 30 min | 0.3 | Tabellen, RLS, Views, 23 Produkte vorhanden |
| 0.5 | Affiliate-Programme beantragen (14) | Peter | 1 Tag + Wartezeit | — | Anträge raus, Status je Programm notiert |
| 0.6 | Trustpilot-Partneranfrage (Syndication) | Peter, Claude entwirft Text | 1 h | — | Anfrage gesendet |
| 0.7 | EU-Vertreter Art. 27 DSGVO: 3 Angebote einholen | Peter | 3 h | — | Anbieter beauftragt |
| 0.8 | Rechtsgerüst: Impressumsdaten, Datenschutz, Affiliate-Hinweistexte, Consent-Konzept | Claude entwirft, Peter gibt frei | 1 Tag | 0.7 | Texte final (DE/EN) |
| 0.9 | Seed v1 (erledigt) + Gebühren/Cashback je Karte aus Preisverzeichnissen nachtragen | Claude (Seed), Peter/Claude (Gebühren) | 1 Tag | 0.4 | Gebühren je Karte gesetzt oder bewusst null mit Quelle |
| 0.10 | Georgien-Restpunkte mit lokalem Berater | Peter | parallel | — | Antworten zu Gewinnsteuer, MwSt, DBA, Quellensteuer, Zahlungswegen |

0.10 blockiert nicht den Bau, aber die erste Rechnung und die erste Auszahlung eines Netzwerks.

## 0.5 Pro Programm erfassen (Spalten in `affiliate_links`)

Netzwerk oder Direktprogramm, Ziel-URL, Vergütungsmodell und Höhe (intern), Mindestauszahlung und Cookie-Dauer (intern), erlaubte und ausgeschlossene Länder, Bonusbedingungen mit Stand-Datum, Werberegeln (Creatives, Keywords, Bonus-Claims), Ablehnungsgründe. Offen, ob jedes Programm eine georgische Gesellschaft akzeptiert [Vermutung: mindestens einzelne verlangen KYB oder schließen Länder aus].

## 0.6 Trustpilot: schriftlich klären

Anlaufstelle: Partner-Programm auf business.trustpilot.com/partners bzw. partnerships@trustpilot.com. Zu bestätigen: Syndication-Lizenz für Drittanbieter-Profile, erlaubte Elemente (Score, Sterne, Reviewanzahl, Texte, Logo), Länder und Domains, Preis und Laufzeit (nur im Order Form), Aktualisierung (laut Bedingungen innerhalb 24 h, serverseitig), Löschpflichten.

## 0.9 Spot-Checks vor `confidence = 'verified'`

- ESMA-Register: Bitpanda GmbH, Foris DAX MT, Bybit EU GmbH, Payward Europe Solutions / Payward Global Solutions, Coinbase Luxembourg, OKX Europe, Revolut Digital Assets Europe; Trade Republic über Art. 60.
- Gnosis Pay: Einstellung der Consumer-Karte zum 20.12.2026 (bisher nur Sekundärquelle).
- Bitpanda Card: Issuer Contis oder Transact Payments Malta (Quellen widersprechen sich).
- MetaMask Card: EWR-Issuer (UAB Monavate wahrscheinlich, Vertrag nicht abrufbar).
- Nexo: Datenverantwortlicher aus der Privacy Policy im Kundenkonto.
- Bybit EU: Malta ausgeschlossen. Bitpanda Card: Einschränkung Zypern.
- KAST, RedotPay, Ether.fi: Rechtsträger, Issuer und Länderliste nicht belegt, bleiben `unverified`.
- USDT: Status je CASP (kein MiCA-konformer EMT-Emittent gefunden).

## Exit-Kriterien Stufe 0

1. Schema läuft, Seed enthält alle 14 Anbieter mit `confidence`-Stufe.
2. Mindestens 5 Affiliate-Programme freigeschaltet oder Status bekannt.
3. EU-Vertreter beauftragt, Impressum- und Datenschutztexte final.
4. Trustpilot-Anfrage gestellt.
5. Stack entschieden, Domain steht.
