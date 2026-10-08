# Auswertung Perplexity-Lauf (Abruf 07.10.2026), Bewertung 08.10.2026

Quelle: Perplexity-PDF "alle fünf" (5 Anbieter, Tabellen A bis D, 496 genannte URLs). Gesamteindruck: [Wahrscheinlich] brauchbarer als der erste Agentenlauf, weil jede Zeile Zitat und URL trägt und Lücken als "nicht gefunden" stehen. Aber: Perplexity hat Werte als "belegt, Primärquelle" markiert, die es nicht sind (Coinbase-Gebühren von einer UK-Seite). Und: Es nennt rund 480 URLs im Verzeichnis, die es nicht ausgewertet hat. Die fehlenden Werte stehen vermutlich dort.

## Stufen für die Übernahme in den Seed
Regel: Kein Wert geht in `data/seed.json`, bevor eine Stichprobe der URL im Browser denselben Wert zeigt. Bis dahin Status "nicht geprüft".

### Stufe 1: konsistent mit dem ersten Lauf, Primärquelle, nach Stichprobe übernehmbar
| Anbieter | Wert | Quelle |
|---|---|---|
| Bitpanda | Cashback 1 % fest, nur bei Zahlung mit Kryptowährung; ausgeschlossen: USDC, USDT, EUROC, Edelmetalle, Bitpanda Stocks, Fiat-Guthaben | support.bitpanda.com/hc/it/articles/4413398057490 (IT) |
| Bitpanda | Broker 0 bis 2,49 % je Trade, Bitcoin 0,99 %; Fiat-Ein- und Auszahlung kostenlos; SEPA und Kreditkarte; EUR-Auszahlung min. 10 € | Support ES, FR, EN |
| Bitpanda | Vertragspartner Krypto: Bitpanda GmbH (Wien), Treuhandmodell | E-Token Terms |
| Crypto.com | Karte: Prepaid Visa, Emittent Foris MT Limited (Malta, E-Geld); Netzwerk Visa (löst den Visa/Mastercard-Widerspruch) | crypto.com/eea/licenses |
| Crypto.com | App-Vertragspartner Foris DAX MT Limited, MiCA-Zulassung MFSA seit 12.02.2025 | AMF-Register, crypto.com/document/mco_services |
| Coinbase | Coinbase Luxembourg S.A., MiCA-Zulassung CSSF seit 20.06.2025; SEPA Kauf, Verkauf, Ein- und Auszahlung, 1 bis 3 Werktage | AMF-Register, help.coinbase.com |
| Nexo | Karte Mastercard; Debit- und Credit-Modus; ATM-Freibetrag 200/400/1.000/2.000 € je Stufe, darüber 2 % (min. 1,99 €); Fremdwährung EWR/UK/CH 0,2 % werktags, 0,7 % am Wochenende; keine Monats-, Jahres- oder Inaktivitätsgebühr | nexo.com/crypto-card (Stand Q2 2026) |
| Nexo | Cashback nur im Credit-Modus, ab 5.000 USD Portfoliowert: Base 0,5 % NEXO oder 0,1 % BTC, Silver 0,7/0,2, Gold 1/0,3, Platinum 2/0,5 | support.nexo.com (Rewards) |
| Nexo | Verwahrung Tangany GmbH, Handel DLT Securities GmbH (beide BaFin); Nexo selbst ohne eigene CASP-Zulassung belegt | nexo.com/eea, nexo.com/en-us/mica-faq |
| Nexo | EUR-Auszahlung SEPA 5 EURx, min. 10 Einheiten; Krypto-Auszahlung gebührenabhängig von Stufe und Netzwerk, 24-Stunden-Cool-off bei bestimmten Kontoänderungen | support.nexo.com |
| Trade Republic | Karte Visa Debit, Abbuchung vom Cash-Konto, keine Kryptoveräußerung beim Zahlen belegt; Apple Pay und Google Pay | traderepublic.com/en-de/support |
| Trade Republic | Saveback 1 % qualifizierter Kartenzahlungen, max. 15 €/Monat, Bedingung Sparplan ≥ 50 €/Monat, Auszahlung als Anlage in den Sparplan am 2. des Folgemonats | support.traderepublic.com/en-de/3050 |
| Trade Republic | Ausgabe: virtuell kostenlos, Classic 5 €, Mirror 50 €; Geldautomat unter 100 € 1 €, ab 100 € gebührenfrei | support.traderepublic.com (1633, 2911) |
| Trade Republic | Karte verfügbar in DE, AT, FR, ES, IT, NL; nicht MT, CY. Krypto verfügbar in DE, AT, FR, ES, IT; nicht NL, MT, CY | Support 487, 1482 |
| Trade Republic | Senden und Empfangen von Krypto über externe Wallets: nicht möglich (löst den Widerspruch) | Support 1497 (LT) |
| Trade Republic | Vertragspartner Trade Republic Bank GmbH, MiCA-Zulassung BaFin seit 28.04.2025 | AMF-Register |

### Stufe 2: Quelle ist nicht EWR, veraltet oder unklar. Nicht übernehmen.
- Coinbase Advanced maker ≤ 0,4 % / taker ≤ 0,6 %: stammt von help.coinbase.com/en-gb (UK). Nicht für EWR-Kunden belegt.
- Coinbase Karte: EWR-Bedingungen von 2022 (Paysafe); keine aktuellen EWR-Konditionen, Cashback oder Länderliste. Verfügbarkeit in den Zielländern unbelegt.
- Crypto.com Kartenbedingungen: Stand 18.11.2024. Gebühren, Cashback, Stufen, Länderliste aus dem Lauf nicht belegt. Karte "Class 3 VFASP" in den alten Bedingungen vs. MiCA-Lizenz heute: für den Vertragsstatus gelten die aktuellen Lizenzseiten.
- Bitpanda Geldautomat 1,50 € (ein freier Bezug, Doc "Contis Lithuania BEST3"): Widerspruch zum ersten Lauf (2 %, min. 2 €). Geltung und Datum des Dokuments unklar.
- Bitpanda Kartenemittent: nicht gefunden. Die Doc-Namen zeigen Contis, der erste Lauf nannte Transact Payments Malta.
- Bitpanda SEPA-Limit "10 Mio. €": Limittabelle, vermutlich höchste Verifizierungsstufe. Nicht als Standardwert verwenden.
- Nexo-Kartenseite ist die globale Seite (nexo.com/crypto-card), nicht die EWR-Seite. Prüfen, ob die Werte unter nexo.com/eea/crypto-card gleich sind.

### Stufe 3: nicht gefunden
Kartenländerlisten (Bitpanda, Crypto.com, Coinbase, Nexo), Kartenemittenten (Bitpanda, Coinbase, Nexo), Krypto-Handelsgebühren (Crypto.com, Nexo, Trade Republic), Coin-Auszahlungsgebühren (Bitpanda, Crypto.com, Coinbase), Whitelisting, Datenverantwortliche (Coinbase, Nexo, Trade Republic), KYC-Dokumentlisten, Drittlandtransfers, DAC8-Behörde je Anbieter. Folgen fehlender Selbstzertifizierung auf Anbieterebene: nirgends gefunden (die DE-Regel steht beim BZSt).

## Wirkung auf die Schnellpfade
- Cashback: Bitpanda und Nexo sind jetzt belegbar, Crypto.com und Coinbase nicht. Trade Republic Saveback ist kein Cashback (Anlage in Sparplan, Bedingung). Pfad bleibt "partial", sobald Stufe 1 im Seed steht. Mit nur zwei belegten Cashback-Karten ist ein Ranking nicht vertretbar.
- Niedrige Gebühren: Nur Nexo und Trade Republic haben belegte Kartengebühren. Ein Gebührenvergleich über alle Karten ist nicht möglich. Pfad bleibt "missing".
- Euro ein- und auszahlen: Bitpanda, Coinbase, Nexo (nur Auszahlung belegt), Trade Republic (Einzahlung SEPA und Karte, Auszahlung über Cash-Konto, nicht vollständig). Crypto.com unklar. Pfad "partial" mit Datenpunkten für vier Börsen.
- Eigene Wallet: Trade Republic scheidet für Wallet-Auszahlung aus (kein externer Transfer).

## Nächste Schritte (Reihenfolge)
1. Zweitrunde gezielt auf die von Perplexity genannten, aber nicht ausgewerteten URLs: help.crypto.com (Artikel 5977463, 10981986, 3966346 "available in which European countries", 2742447), nexo.com/eea/crypto-card, support.nexo.com/article/what-are-the-limits-and-fees-of-the-nexo-card, help.coinbase.com Coinbase-Card-FAQ, support.bitpanda.com Card-FAQ und cdn.bitpanda.com Kartenbedingungen (bitpanda-card-bitpanda-en-latest.pdf). Ziel: Länderlisten, Kartengebühren, Emittenten, aktuelle Cashback-Sätze.
2. Browser-Stichprobe der Stufe-1-Werte (je Anbieter 2 bis 3 URLs).
3. Erst danach Seed, SQL-Seed, `asOf`, Tests.
4. Migration 005 (`withdrawal_methods`) erst, wenn die Auszahlungswege für alle 9 Börsen vorliegen.
