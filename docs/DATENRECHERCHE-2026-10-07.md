# Datenrecherche Marken, Stand 2026-10-07

**Status: NICHT im Seed.** Alle Werte stammen aus Zusammenfassungen von WebFetch/WebSearch, teils aus Blogs oder widersprüchlichen Seiten. Vor Übernahme in `data/seed.json` gegen Primärseiten im Browser prüfen. Unbekannt bleibt "nicht geprüft".

## Bitpanda
- Karte: monatlich 0 €; Geldautomat 2 % (min. 2 €); Cashback pauschal 1 % in der zum Zahlen genutzten Krypto (Stablecoins und Fiat ausgenommen).
- Widersprüche: Meta-Text "bis zu 2 %" vs. FAQ pauschal 1 %; Emittent Transact Payments Malta vs. Contis; Gebührenverzeichnis nur in der App; keine Länderliste zur Karte.
- Broker: 0,99 % (BTC, Stablecoins), 1,49 %, 2,49 % je Stufe; SEPA ein und aus. Pro/Fusion maker/taker nicht eindeutig Privatkunden.

## Crypto.com
- Karte: Stufen mit CRO-Sperre (Ruby 450 €, Jade/Indigo 4.500 €, 12 Monate); Cashback 1,5–4,5 % in CRO mit monatlichen USD-Grenzen.
- FX 0,2 % in der EU, 2 % außerhalb (Widerspruch: Meta "zero FX fees"). Inaktivitätsgebühr 5 → 6 € ab 1.10.2026. Visa vs. Mastercard widersprüchlich.
- Emittent Foris MT Limited; Vertragspartner Foris DAX MT Limited (MFSA CASP, Passport 12.2.2025). SEPA ein und aus (1 € App-Auszahlung). Exchange maker/taker nicht lesbar.

## Coinbase
- Karte: keine EWR-Gebühren gefunden; FAQ mischt US/EU (Pathward/Marqeta vs. Paysafe Payment Solutions Ltd); Verfügbarkeit in DE unzuverlässig; kein Apple/Google Pay.
- Coinbase Luxembourg S.A. (Krypto), Coinbase Ireland Ltd (E-Geld). Börse: SEPA ein und aus; maker 0,25 % / taker 0,50 % nur aus altem Blog (unzuverlässig).

## Nexo
- Kein eigener registrierter CASP; Partner Tangany GmbH (Verwahrung, BaFin), DLT Securities GmbH (Handel, BaFin); Kartenemittent DiPocket UAB (LT).
- FX 0,2 % werktags (EWR/UK/CH), 0,7 % am Wochenende; Geldautomat nach Loyalty-Stufe frei (200/400/1.000/2.000 €), darüber 2 % (min. 1,99).
- Cashback nur im Kreditmodus mit Guthaben über 5.000 USD (0,5–2 % in NEXO oder 0,1–0,5 % in BTC). Keine Länderliste; Bankauszahlung nicht belegt.

## Trade Republic
- Karte = Debit auf EUR-Guthaben, nicht an Krypto gekoppelt. Saveback 1 % (max. 15 €/Monat, Sparplan ≥ 50 €/Monat, Auszahlung in Sparplan). Ausgabegebühr physisch unklar (0/5/50 €).
- Krypto-Order 1 € pauschal (undatiert, polnische Seite). Verwahrung widersprüchlich (BitGo Europe GmbH vs. Omnibus-Wallets); Auszahlung auf eigene Wallet widersprüchlich; Länder laut Support 11–12 (NL/MT/CY nicht gelistet).

## Prüfreihenfolge im Browser
1. Bitpanda Karte (Cashback-Satz, Emittent), 2. Crypto.com FX und Karten-Netzwerk, 3. Nexo Kartenländer, 4. Coinbase Karte DE-Verfügbarkeit, 5. Trade Republic Verwahrung.
Danach: Seed, SQL-Seed, `asOf` setzen, Tests.

## Offen (Regulierung)
DAC8-Umsetzung FR, ES, IT, NL, MT, CY; CARF-Start Nicht-EU; AMLR-Wortlaut gegen EUR-Lex; CRS/E-Geld-Meldung für Kartenkonten [Vermutung].
