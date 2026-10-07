# Konzept v2: Regulierung 2026–2028, Modell-Quiz, Steuer-Tool-Box

Stand 2026-10-07 · Ergänzung zu `docs/PRD.md`, `docs/M0-UEBERGABE.md`, `docs/EXECUTIVE-SUMMARY-UND-SEO-BRIEFING.md`
Entscheidungen von Peter (2026-10-07): (1) Quiz: erst Modell, dann Produkte. (2) Steuer-Software: Empfehlungsbox mit 3–5 Tools, aber erst nach Semrush-Prüfung DE und EN. (3) Reihenfolge: Regulierung zuerst.
Sicherheitsmarker: [Sicher] belegt durch Primärquelle, [Wahrscheinlich] Sekundärquelle oder starke Schlussfolgerung, [Vermutung] Lücke gefüllt.

---

## 1. Abgleich: Lovable-Systemübersicht gegen Konzept

| # | Befund | Einschätzung | Folge |
|---|---|---|---|
| 1 | Routen, SEO-Pipeline (`buildMeta`, `pathFor`), Hubs, `/compare` noindex, Katalog nur über `useCatalog()` entsprechen dem Konzept. | [Sicher] | Keine Korrektur. |
| 2 | Die Übersicht erklärt `src/lib`, `src/content`, `src/types`, `src/data`, `data/seed.json`, `supabase/**` für unveränderlich. Quiz-Schritte, Produkttypen, Lernseiten-Register und Migrationen liegen genau dort. | [Sicher] | **Alle drei Änderungen müssen aus meinem Paket kommen, nicht aus Lovable.** Lovable baut nur die Oberfläche darüber. |
| 3 | Es gibt keinen belegten Update-Pfad vom Paket zu Lovable. Lovable kann nur nach GitHub exportieren, nicht importieren. Das Projekt ist noch nicht mit GitHub verbunden. | [Wahrscheinlich] | Voraussetzung für v2: Lovable-Projekt mit GitHub verbinden, danach committe ich Paketänderungen in das von Lovable angelegte Repo. Ob Lovable sie zuverlässig zurücksynchronisiert, ist zu testen [Vermutung]. |
| 4 | Die Übersicht nennt die Regel "kein nackter Strich" (Abschnitt 5), die ausgelieferten Hubs zeigen trotzdem "–". | [Sicher] | Bleibt Auftrag im Design-Prompt. |
| 5 | `/methodology` ist gelöscht (404), die Ergebniskarte verweist aber auf die Reihenfolge-Erklärung. | [Wahrscheinlich] | Prüfen, ob die Offenlegung der Ranking-Parameter noch vollständig erreichbar ist (UWG-Transparenz). |
| 6 | `quizReducer` prüft Antworten gegen die Whitelist `STEP_VALUES`. Neue Schritte müssen dort und in `QUIZ_STEPS` ergänzt werden. | [Sicher] | Änderung im Paket, nicht in `Finder.tsx`. |

---

## 2. Änderung 3 zuerst: Regulierung 2026–2028 konkret erklärt

### 2.1 Zeitachse (belegt)

| Datum | Ereignis | Was es für dich bedeutet | Sicherheit | Quelle |
|---|---|---|---|---|
| 30.12.2024 | Travel Rule (Geldtransferverordnung) gilt | Bei Transfers zwischen Anbietern reisen Absender- und Empfängerdaten mit. Bei Auszahlung auf eigene Wallet über 1.000 € kann der Anbieter Nachweis der Kontrolle verlangen. | [Sicher] | bestehender Eintrag `travel-rule` |
| 01.01.2026 | DAC8 gilt, Anbieter sammeln Daten | Anbieter holen eine Selbstauskunft ein (Name, Anschrift, Steuerwohnsitz, Steuer-ID, Geburtsdatum). | [Sicher] | EU-Kommission DAC8-Seite |
| 01.07.2026 | MiCA-Übergangsfristen enden | Ohne Zulassung darf ein Anbieter in der EU keine Krypto-Dienste mehr erbringen. | [Sicher] | ESMA-Statement (06/2026), bestehender Eintrag `mica` |
| bis 01.01.2027 | Selbstauskunft Bestandskunden (DE) | Wer zum 31.12.2025 Kunde war, muss die Selbstauskunft bis dahin liefern. Antwortet er nicht, muss der Anbieter nach Erinnerung und Aufforderung meldepflichtige Transaktionen frühestens 60, spätestens 90 Tage nach der ersten Anfrage sperren. | [Sicher] für DE | BZSt, Verfahren KStTG |
| 31.07.2027 | Erste Meldung 2026 in DE und AT | Anbieter melden Summen je Kryptowert an BZSt (DE) bzw. BMF (AT). | [Sicher] | BZSt; KPMG Österreich (Sekundärquelle, Krypto-MPfG BGBl I 96/2025) |
| 10.07.2027 | AMLR gilt | Keine anonymen Konten bei Anbietern, keine Konten für Anonymitäts-Coins, Sorgfaltspflichten bei Einzelgeschäften ab 1.000 €. Eigene Wallets und Peer-to-Peer bleiben erlaubt. | [Wahrscheinlich]. Das Datum steht in den EUR-Lex-Metadaten, den Wortlaut von Art. 79 konnte ich nicht abrufen. | Verordnung (EU) 2024/1624, Sekundärquellen |
| 30.09.2027 | Erster EU-Austausch (Meldejahr 2026) | Die Steuerbehörde des Meldelandes leitet Daten an die Behörden anderer Staaten weiter, auch an den Wohnsitzstaat. | [Sicher] | EU-Kommission; BZSt |
| ab 07/2027, 2028 | AMLA-Auswahl, dann direkte Aufsicht | AMLA beaufsichtigt ab 2028 bis zu 40 grenzüberschreitende Finanzunternehmen (mind. 6 Mitgliedstaaten). Ob und welche Krypto-Anbieter darunter fallen, ist offen. | [Sicher] zu Zeitplan, [Vermutung] zu CASPs | AMLA-Erläuterung |

Offen und vor Veröffentlichung zu prüfen: Umsetzungsstand DAC8 in FR, ES, IT, NL, MT, CY. Diese Länderzeilen bleiben bis dahin ohne Aussage ("nicht geprüft"). Beginn des CARF-Austauschs mit Nicht-EU-Staaten ist nicht belegt.

### 2.2 Datenwege: wer meldet was an wen

| # | Weg | Von → An | Inhalt | Rhythmus | Sicherheit |
|---|---|---|---|---|---|
| 1 | KYC und Selbstauskunft | Du → Anbieter | Ausweis, Anschrift, Steuer-ID, Steuerwohnsitz | bei Kontoeröffnung, danach bei Änderung | [Sicher] |
| 2 | DAC8-Meldung | Anbieter → Steuerbehörde seines Meldelandes (DE: BZSt, AT: BMF) | Identität, je Kryptowert Summen aus Käufen und Verkäufen gegen Fiat oder andere Kryptowerte, Zahlungen für Waren und Dienste, Transfers | jährlich, 31.07. | [Sicher] |
| 3 | Austausch | Steuerbehörde → EU-Zentralverzeichnis und andere Staaten, darunter dein Wohnsitzstaat | dieselben Daten | jährlich, bis 30.09. | [Sicher] |
| 4 | Travel Rule | Anbieter → Anbieter | Absender und Empfänger je Transfer | bei jedem Transfer | [Sicher] |
| 5 | Verdachtsmeldung | Anbieter → Zentralstelle für Geldwäsche des Sitzlandes | nur bei Verdacht, Anbieter darf es dir nicht mitteilen | anlassbezogen | [Wahrscheinlich] |
| 6 | Auskunftsersuchen | Behörde → Anbieter | angefragte Konto- und Transaktionsdaten | anlassbezogen | [Wahrscheinlich] |
| 7 | E-Geld-Konto der Karte | Kartenherausgeber → Steuerbehörde, Meldung nach geändertem Gemeinsamen Meldestandard (CRS) | Salden und Erträge von E-Geld-Produkten, seit 01.01.2026 mit erfasst | jährlich | [Vermutung], vor Veröffentlichung gegen DAC8-Text prüfen |

Wichtige Korrektur am bestehenden Text `dac8` (src/content/knowledge.ts): Dort steht, ein Anbieter "kann" Transfers zur Wallet in die Meldung aufnehmen. Nach österreichischer Umsetzung werden Übertragungen an externe Wallet-Adressen mit aggregiertem Marktwert und Einheiten gemeldet [Wahrscheinlich]. Der Text muss entsprechend klarer werden. Außerdem ersetzt "ab 2027" die konkreten Termine nicht.

### 2.3 Was Nutzer konkret tun können (ohne Umgehung)

- Steuer-ID und Steuerwohnsitz beim Anbieter hinterlegen und die Selbstauskunft beantworten, sonst drohen Sperrungen.
- Transaktionshistorie je Anbieter exportieren und aufbewahren.
- Steuererklärung 2026 gegen die späteren Meldungen abgleichbar halten.
- Hier greift die Steuer-Tool-Box (Abschnitt 4), nicht als Werbung im Text, sondern als Verweis am Ende.

### 2.4 Seiten

| Seite | Status | Inhalt | Priorität |
|---|---|---|---|
| `dac8` (bestehend) | überarbeiten | konkrete Termine, Selbstauskunft, Sperrfolge, Wallet-Korrektur, Länderblock DE und AT | 1 |
| `what-providers-report` (geplant) | schreiben | Kernseite "Wer sieht was": Tabelle 2.2 mit Schaubild, verlinkt auf `dac8`, `travel-rule`, KYC | 1 |
| `regulation-timeline` (neu) DE `krypto-regulierung-2026-2028`, EN `crypto-regulation-timeline-2026-2028` | neu | Tabelle 2.1 als Zeitstrahl, je Termin "Was heißt das für mich?" | 1 |
| `kyc-explained` (neu) DE `kyc-krypto-erklaert`, EN `crypto-kyc-explained` | neu | Was erfasst KYC, wer sieht die Daten, DSGVO-Rechte, Abgrenzung zu Meldung | 2 |
| `no-kyc` | bleibt `needs_decision` | Aufklärung, warum anonyme Konten ab 10.07.2027 bei Anbietern nicht mehr zulässig sind | Peter entscheidet |

Keywords für die zwei neuen Seiten sind nicht aus Semrush belegt (`keywordFromSemrush: false`) und werden im Lauf der Semrush-Prüfung nachgezogen.

Redaktionelle Leitplanke bleibt: Wir erklären, was passiert, wir leiten nicht zur Umgehung an. Tests ergänzen: Fehler bei "ohne KYC"-Versprechen, "anonym" als Produktvorteil, "steuerfrei", sowie bei jeder datierten Aussage ohne Quelle und `asOf`.

---

## 3. Änderung 1: Modell-Quiz vor dem Finder

### 3.1 Abgrenzung zum bestehenden Finder

Der Finder hat heute vier Fragen (Land, Wo liegen deine Werte, Womit zahlen, Priorität). Die Priorität "EU-Regulierung und Datenschutz" vermischt zwei verschiedene Wünsche. Das Quiz ist ein Filter, keine Beratung: keine Fragen zu Vermögen, Anlageziel, Risiko (Abgrenzung FMA, BaFin, CNMV). Das bleibt.

### 3.2 Stufe A: Modell-Quiz (4 Fragen, 1 Minute)

| # | Frage | Antworten | Prüfbar mit vorhandenen Daten? |
|---|---|---|---|
| A1 | Was suchst du? | Karte / Börse / beides | ja |
| A2 | Datenschutz: Was ist dir wichtig? | Datenverantwortlicher im EWR / eigene Verwahrung / keins von beidem | ja: `dataControllerCountry` ist für 10 von 14 Anbietern gesetzt, `custody` für alle |
| A3 | Regulierung: Nur Anbieter mit EU-Zulassung? | ja / egal | ja: `entities.authorization` nennt bei 22 von 29 Rechtsträgern eine Zulassung (`casp_art63` 10, `emi` 10, `bank` 1, `art60_notified` 1), 5 `none_found`, 2 `unverified` |
| A4 | Fiat: Brauchst du Euro rein oder raus? | Einzahlen (On-Ramp) / Auszahlen (Off-Ramp) / beides / nein | **teilweise**: Einzahlungswege nur für 2 von 9 Börsen und 2 Karten, Auszahlungswege gibt es im Datenmodell nicht |

Ergebnis: ein Modell, nie ein Anbieter.

| Modell | Kernmerkmale | Wann |
|---|---|---|
| M1 Zugelassene EU-Börse mit SEPA | Börse, MiCA-Zulassung, SEPA ein und aus | Regulierung ja, Fiat ja |
| M2 Börsenkarte (verwahrt) | Karte beim Anbieter, Verwahrung beim Anbieter | Karte, Komfort, kein Self-Custody-Wunsch |
| M3 Self-Custody-Karte | Wallet bleibt bei dir, Karte über E-Geld-Institut | Eigene Verwahrung wichtig |
| M4 Börse und Karte aus einer Hand | gleicher Anbieter | Beides |

Pflicht in jedem Ergebnis ein Abwägungsblock: **Mehr Regulierung bedeutet mehr Meldung** (DAC8, Travel Rule, AMLR). Datenschutz heißt hier Datenschutz im Sinne der DSGVO (Wer verarbeitet meine Daten, wo, mit welchen Rechten), nicht Anonymität. Anonyme Konten sind bei Anbietern ab 10.07.2027 verboten.

Stufe B: danach die bestehenden Finder-Fragen mit vorbelegten Antworten (Ziel, Prioritätshinweis), dann konkrete Produkte über `matchCatalog()`.

### 3.3 Änderungen im Paket

- `src/lib/quiz.ts`: neue Schritte `privacyFocus`, `regulationFocus`, `fiatNeed`, Whitelist in `STEP_VALUES` erweitern, `Priority.regulation_privacy` bleibt aus Kompatibilität gültig und wird im Matching als Summe der beiden neuen Faktoren behandelt.
- Neue Funktion `deriveModel(answers): ModelId[]` plus Test je Kombination.
- `src/locales/de.json` und `en.json`: Texte synchron.
- Datenlücken: Fiat-Frage liefert bei `null` das Ergebnis "nicht prüfbar", nie einen stillen Ausschluss.

```sql
-- supabase/migrations/005_withdrawal_methods.sql (Entwurf)
alter table products
  add column if not exists withdrawal_methods text[];   -- null = nicht geprüft; '{}' = geprüft: keine

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_withdrawal_methods_check') then
    alter table products add constraint products_withdrawal_methods_check
      check (withdrawal_methods is null or withdrawal_methods <@ array['sepa','card','crypto']::text[]);
  end if;
end $$;
```

Voraussetzung: 9 Börsen und 14 Karten auf SEPA-Ein- und Auszahlung recherchieren. Das ist überschaubar und der Engpass für A4.

---

## 4. Änderung 2: Steuer-Software als Empfehlungsbox (nach Semrush-Prüfung)

[Wahrscheinlich] Ein eigener Vergleichs-Hub ist nicht sinnvoll: Die Suchergebnisse zu "Krypto Steuer Software Vergleich" sind nach meiner Suche bereits von Vergleichsportalen besetzt (mindestens 9 in den Top-Treffern). Ob die Box überhaupt Traffic bringt, entscheidet Semrush.

### 4.1 Semrush-Prüfung (Cluster H, DE und EN)

Auftrag an Lovable mit Semrush-Connector, Datenbanken de, at, ch und us bzw. gb für EN:
1. Volumen, Keyword Difficulty, CPC, Intent für "krypto steuer software", "krypto steuer tool", "krypto steuererklärung", "dac8 steuererklärung", "crypto tax software", "crypto tax software eu".
2. Top-10-Domains, Anteil Vergleichsportale gegen Anbieter-Seiten.
3. Long-Tail rund um DAC8 und Steuererklärung (Wo stehen wir ohne Vergleich?).
4. Empfehlung: Box ja/nein, Platzierung, realistische Rankingchance.

Entscheidungsregel (Vorschlag, [Vermutung] bei den Schwellen): Box nur, wenn mindestens eine DAC8- oder Steuererklärungs-Anfrage in DE oder EN messbares Volumen und Difficulty unter dem Niveau der Karten-Keywords hat. Sonst Box ohne eigene Landing Page, nur als Verweis in Steuer- und DAC8-Seiten.

### 4.2 Form (falls Go)

- Kein neuer `ProductType`, kein Hub, keine Migration. Redaktionelle Datei `src/content/tax-tools.ts`, alphabetisch, ohne Wertung, 3–5 Einträge.
- Kriterien je Tool: unterstützte Länder und Steuerreports, Import (Börsen, Wallets, API), Preismodell (je Transaktionsmenge), **Datenverantwortlicher und Sitz** (das Tool sieht die komplette Transaktionshistorie), Prüfdatum, Quelle. Fehlendes = "nicht geprüft".
- Auswahl der Tools nach diesen Kriterien aus Recherche, nicht aus Provisionshöhe. Keine Namen werden gesetzt, bevor sie recherchiert sind.
- Compliance: "Werbung" am Button, Affiliate-Offenlegung, keine Aussagen wie "rechtssicher", "Steuerberatung ersetzt", "Testsieger". Kein Zusammenhang mit dem 10-%-Ranking: Die Box rankt nicht.
- Platzierung: Ende von `dac8`, `paying-with-crypto-tax`, Länderseiten, Quiz-Ergebnis ("Danach: Dokumentation"). Kein Eingriff in Hero und Navigation, solange Semrush nicht entschieden hat.

---

## 5. Umsetzungsreihenfolge

| Phase | Inhalt | Wer | Abhängigkeit |
|---|---|---|---|
| R1 | Regulierungsinhalte: `dac8` überarbeiten, `what-providers-report`, `regulation-timeline`, Tests, Lovable-Prompt | Claude (Paket), Lovable (Oberfläche) | GitHub-Verbindung |
| R2 | Verifikation FR, ES, IT, NL, MT, CY (DAC8-Umsetzung), AMLR-Wortlaut gegen EUR-Lex im Browser, CRS-Punkt | Claude | – |
| S | Semrush Cluster H plus D, A, B, F, G nachziehen | Lovable | – |
| Q1 | Datenrecherche SEPA ein/aus (23 Produkte) und Migration 005 | Claude | – |
| Q2 | Modell-Quiz (Stufe A) | Claude (Paket), Lovable | Q1 für Fiat-Frage |
| T | Steuer-Tool-Box | Claude, Lovable | S |
| D | Design anwenden, "nicht geprüft"-Darstellung | Lovable | parallel zu R1 |

Launch-Gate unverändert: Hubs bleiben `noindex`, bis genug verifizierte Produktdaten vorliegen. Die Regulierungsseiten können davon unabhängig indexiert werden, sobald Quellen und Stand geprüft sind und das Impressum vollständig ist.

---

## 6. Offene Punkte

Bei Peter: Impressumsdaten (5 Felder), Entscheidung `no-kyc`, Freigabe Pflichttexte, Logo-Rechte, GitHub-Verbindung des Lovable-Projekts.
Bei mir: Länderumsetzung DAC8, AMLR-Wortlaut, CRS-E-Geld, Quelle für Verdachtsmeldung je Land.
Spezialistenfragen: Ob Datenwege-Aussagen je Land steuer- und aufsichtsrechtlich ausreichen, sollte ein Steuerberater in DE oder AT gegenlesen, bevor die Länderblöcke live gehen.
