# Lovable-Brief: Krypto-Spending-Guide (EU)

Stand 2026-10-01 · Gliederung nach Vorgabe von Lovable: 1. Datenmodell, 2. Kernfunktionen und Logik, 3. Seitenstruktur, 4. Meilensteine.
Ausführliche Begründungen: `docs/PRD.md` · Ergebniskarte: `docs/KONZEPT-ERGEBNISKARTE.md` · Prompts je Meilenstein: `docs/LOVABLE_PROMPTS.md`

**Grundsatz:** Datenmodell, Logik und Pflichttexte sind fertig programmiert und getestet (`src/lib`, `src/content`, `src/components/results`, 120 Tests). Lovable baut Oberfläche, Routing und Seiten und ruft diese Funktionen auf. Lovable schreibt keine eigene Filter-, Ranking-, Rechen- oder Rechtstext-Logik.

---

## 1. Datenmodell

Typen: `src/lib/types.ts` · Datenbank: `supabase/migrations/001–004` · Startdaten: `data/seed.json` (14 Anbieter, 23 Produkte, 8 Länder).
Regel für alle Felder: `null` = nicht geprüft → Anzeige "– nicht geprüft", nie 0 oder "nein".

### 1.1 Anbieter (`Provider`)
| Attribut | Bedeutung |
|---|---|
| `name`, `slug`, `websiteUrl` | Marke |
| `entities[]` | Rechtsträger mit Rolle (Krypto-Dienstleister, Verwahrer, Bank, Kartenherausgeber, Betreiber …), Sitz, Aufsicht, Zulassung, Prüfstand, Quelle |
| `dataControllerCountry`, `dataControllerNote` | Wer verarbeitet deine Daten, Sitz im EWR ja/nein |
| `dataResidencyNote`, `kycNote`, `protectionNote` | Speicherort/Drittlandtransfer, KYC-Umfang, Einlagensicherung/Trennung |
| `trustpilot`, `trustpilotDomain` | Score/Anzahl/Datum (nur bei aktivem Schalter), Profil-Link |

### 1.2 Kreditkarten / Debitkarten (`Product`, `type = "card"`)
| Attribut | Bedeutung |
|---|---|
| `card.kind` | Debit, Prepaid, Kredit, Kredit gegen Krypto-Sicherheit |
| `card.network`, `card.forms`, `card.mobileWallets`, `card.kycLevel` | Visa/Mastercard; virtuell/physisch; Apple/Google Pay; KYC-Stufe |
| `custody` | verwahrt beim Anbieter, Self-Custody, gemischt |
| `fundingFlow` | Verkauft Krypto bei jeder Zahlung, zahlt aus Euro-Guthaben, aus Stablecoin, Kreditlinie, wählbar |
| `fundingAssets`, `stablecoins`, `chains`, `depositMethods` | Unterstützte Währungen/Coins, Stablecoins, Netzwerke, Auflademöglichkeiten |
| `fees` | Ausgabe virtuell/physisch, monatlich, Fremdwährung %, Automat frei pro Monat, Automatengebühr % über Freigrenze, Inaktivität |
| `rewards` | Cashback ohne/mit Staking, Reward-Token, Staking-Pflicht (Token, Mindestbetrag, Sperrdauer) |
| `availability[]` | Status je Land: verfügbar, eingeschränkt, nicht verfügbar, unbekannt |
| `status`, `windDownDate` | aktiv / wird eingestellt (mit Datum) / eingestellt |
| `confidence`, `sourceUrl`, `verifiedAt` | Prüfstand und Quelle |

### 1.3 Krypto-Börsen (`Product`, `type = "exchange"`)
| Attribut | Bedeutung |
|---|---|
| `fees.spotMakerPct`, `fees.spotTakerPct` | Spot-Gebühren (Taker bzw. Spread bei Broker-Modellen) |
| `assetCount` | Anzahl handelbarer Kryptowerte für EWR-Kunden |
| `depositMethods` | SEPA, Karte, Apple Pay, Google Pay, Krypto (geprüft vorhanden, ggf. weitere) |
| `stablecoins` | Angebotene Stablecoins (wichtig für Self-Custody-Karten) |
| Regulierung | über `Provider.entities` (siehe 1.1) |
| `availability[]`, `status`, `confidence` | wie bei Karten |

**Bewusst nicht im Modell:** Futures-/Derivategebühren. Derivate für Privatkunden fallen in der EU unter MiFID und Produktinterventionen; ihre Bewerbung ist ein eigenes Rechtsthema [Wahrscheinlich]. Sollen sie später rein, kommt ein eigenes Datenmodell mit Risikohinweisen.

### 1.4 Länder (`Country`) und Partnerlinks (`Offer`)
| Objekt | Attribute |
|---|---|
| `Country` | Name, MiCA-Aufsicht, Ende der Übergangsfrist, Steuer-Grundzüge (DE/EN), unsicher-Flag, Quelle, Werbelabel in Landessprache |
| `Offer` (öffentlich) | Slug für `/go`, Modell (CPA, Dual-Sided …), Bonus mit Bedingungen und Prüfdatum, CTA-Text, Promo-Code, Badge (redaktionell/gesponsert), ausgeschlossene Länder |
| intern (nie im Frontend) | Ziel-URL, Sub-ID-Parameter, Provision, Cookie-Dauer |

---

## 2. Kernfunktionen und Logik

| Funktion | Datei | Eingabe → Ausgabe | Wo genutzt |
|---|---|---|---|
| Datenquelle | `catalog-source.ts` | `VITE_DATA_SOURCE` = `seed` (M1–M3) oder `supabase` (ab M4) → `Catalog` | überall, über einen Hook |
| Quiz | `quiz.ts` | `quizReducer` (Start, Antwort, Zurück, Reset), max. 4 Fragen | Finder, Länderseiten |
| Ranking | `matching.ts` | Antworten → max. 3 Karten, Börsen, Kopplung Karte↔Börse, Gründe, Warnungen | Finder-Ergebnis |
| Gewichtung | `ranking-config.ts` | 6 Faktoren, Partneranteil 10 %, Methodiktexte | Methodik-Seite, Score-Aufschlüsselung |
| Filter | `filters.ts` | Land, Typ, Kartentyp, Verwahrung, Zahlungsquelle, Stablecoin, ohne Staking, Wallets, virtuelle Karte, EU-reguliert, Datenverantwortlicher im EWR, max. FX, max. Monatsgebühr, Einzahlungsweg, Sitzland | Vergleichstabelle, Kategorieseiten |
| Sortierung Tabelle | Tabelle selbst | alphabetisch (Default) oder nach Spalte durch Nutzer; keine "Empfehlung"-Sortierung | Vergleichstabelle |
| Direktvergleich | `compare.ts` | 2–3 Produkte gleichen Typs → Zeilen mit bestem Wert (nur bei ≥ 2 geprüften Werten) | `/compare?vs=…` |
| Kostenrechner | `calculator.ts` | Umsatz/Monat, Anteil Fremdwährung, Bargeld/Monat, Kartenform, Staking ja/nein → Cashback minus Gebühren pro Jahr; fehlende Werte = kein Ergebnis statt Schätzung | Produktseite, `/calculator` |
| Kategorien | `categories.ts` | 6 Voreinstellungen (Self-Custody, Stablecoin, ohne Staking, Euro-Guthaben, EU-regulierte Börsen, SEPA-Börsen) | Kategorieseiten |
| Darstellung | `presentation.ts` | Pills, Gebühren-/Börsenraster, Cashback-Zeile, CTA-Auflösung, Regulierungsfakten | Karten, Detailseiten |
| Pflichttexte | `compliance.ts`, `labels.ts` | Werbelabel, Offenlegung, Ranking-Hinweis, Disclaimer, Labels DE/EN | überall |
| Tracking | `tracking.ts` | Partnerlink über `/go`, Sub-ID ohne Personenbezug, Plausible-Events | ab M4 aktiv |
| Inhalte | `content/knowledge.ts`, `content/payment-tax.ts` | Wissensartikel in 3 Ebenen, Steuer-Erklärer je Land | Wissensseiten, Trust-Layer |

**Rechner, Eingaben und Ausgaben (verbindlich)**
- Eingaben: Kartenumsatz pro Monat (0–1.000.000 €), Fremdwährungsanteil (0–100 %), Bargeld pro Monat, Kartenform (virtuell/physisch), Schalter "Höchstsatz mit Staking einrechnen" (Standard aus), Zeitraum 12 Monate.
- Ausgaben je Karte: Zeilen Cashback, Ausgabe, Monatsgebühren, Fremdwährung, Automat; Summe pro Jahr. Fehlende Angaben werden als "nicht berechenbar, weil … nicht geprüft" gezeigt.
- Hinweise immer sichtbar: "Rechenbeispiel, keine Prognose, Steuern nicht berücksichtigt". Bei Cashback in Token und bei Staking die passenden Hinweise aus `COST_NOTE_LABEL`.
- Wording: "Rechenbeispiel" oder "Kosten und Cashback im Jahr", nie "Rendite" oder "Gewinn".

---

## 3. Seitenstruktur

> Verbindliches URL-Schema mit übersetzten Slugs, Hubs und Indexierung: `docs/M0-UEBERGABE.md`, Abschnitt 2. Die Tabelle hier beschreibt die Inhalte der Seiten.

| Route | Seite | Inhalt | Meilenstein |
|---|---|---|---|
| `/:lang` | Startseite | Drei Einstiege (Karte, Börse, beides), Kurzerklärung, Links zu Kategorien und Ländern | M1 |
| `/:lang/finder` | Finder | Quiz → Ergebnis (Ergebniskarten + Trust-Layer) | M2 |
| `/:lang/krypto-karten`, `/:lang/krypto-boersen` (EN: `crypto-cards`, `crypto-exchanges`) | Vergleichstabelle je Typ | Filterleiste, Auswahl bis 3 für Direktvergleich | M2 |
| `/:lang/compare?vs=a,b,c` | Direktvergleich | Gegenüberstellung aus `buildComparison` | M2 |
| `/:lang/methodology` | Methodik | Gewichtstabelle, Faktoren, Version | M2 |
| `/:lang/products/:slug` | Produktseite | Konditionen, Verfügbarkeitsmatrix 8 Länder, Rechner, Regulierung, CTA | M3 |
| `/:lang/providers/:slug` | Anbieterseite | Rechtsträger, Datenschutz, Produkte des Anbieters | M3 |
| `/:lang/countries/:slug` | Länderseite | Regulierung, Steuer-Grundzüge, Finder mit vorbelegtem Land, verfügbare Produkte | M3 |
| `/:lang/category/:slug` | Kategorieseite | Intro + gefilterte Liste (alphabetisch), Slugs aus `categories.ts` | M3 |
| `/:lang/calculator` | Rechner | Bis zu 3 Karten wählen, Szenario eingeben, Tabelle | M3 |
| `/:lang/learn`, `/:lang/learn/:slug` | Wissen | MiCA, DAC8, Travel Rule, Verwahrung, Stablecoins, Kartenfunktion | M3 |
| `/:lang/legal/*`, `/:lang/link-unavailable`, 404 | System/Recht | Platzhalter bis M4, Footer-Disclaimer ab M1 | M1 / M4 |

**Begriffe:** Produktseiten heißen "Produktprofil", nicht "Test" oder "Testbericht". Wir testen die Karten nicht selbst; "Test" wäre irreführend (UWG/UCPD).

---

## 4. Meilensteine

| | Lovable-Meilenstein | Inhalt bei uns | Fertig, wenn |
|---|---|---|---|
| **M1** | Fundament | Projektregeln, Layout, Design-System, Routing DE/EN, Datenquelle `seed`, Startseite, Footer mit Disclaimer, Rechtsseiten als Platzhalter | Alle Routen erreichbar, Sprachwechsel behält Seite, 23 Produkte aus Seed geladen |
| **M2** | Filter und Vergleichslogik | Finder (Quiz + Ergebnis), Vergleichstabelle mit Filtern, Direktvergleich, Methodik | Abnahmepunkte M2 in `LOVABLE_PROMPTS.md` erfüllt |
| **M3** | Detailseiten und Rechner | Produkt-, Anbieter-, Länder-, Kategorie-, Wissensseiten, Kostenrechner | Abnahmepunkte M3 erfüllt |
| **M4** | Backend und Skalierung | Supabase (Migrationen, Seed, RLS), Umschalten auf `supabase`, Redirect `/go`, Partnerlinks pflegen, Trustpilot-Schalter, Plausible, Rechtstexte, SEO/Prerendering | Abnahmepunkte M4 erfüllt; **erst danach öffentlich** |

Bis M4 gibt es keine Partnerlinks: Der Seed liefert keine Offers, alle CTAs führen intern auf Anbieterseiten. Damit kann vorher nichts live gehen, was Werbelabel, Klickzählung und Rechtstexte voraussetzt.
