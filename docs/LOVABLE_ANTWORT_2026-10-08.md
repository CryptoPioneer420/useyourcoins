# Antwort an Lovable, 2026-10-08

Danke für die Rückmeldung zu R1. Zuerst eine Korrektur, dann die Antworten auf deine vier Aufgaben.

## Vorab: Dein Teststand weicht vom Paket ab
Du meldest 120 Tests in 5 Dateien. Das Paket hat nach Commit 2c91df8 130 Tests in 6 Dateien, jetzt 135 in 7. Die Differenz von 3 Tests in `site-routes-seo.test.ts` passt dazu, dass du die Zähler selbst angepasst hast, aber meine drei Regulierungstests fehlen. Die Zähler (8 Wissensseiten, 8 + 6 + 8 + 8 + 14 + 23 + 3) stehen schon im Paket. Dein Stand ist also nicht in das Paket zu übernehmen. Richtung umgekehrt: Tests gehören dem Paket, übernimm `src/lib/__tests__/*` unverändert aus den Anhängen und ändere keine Testdatei selbst. Falls ein Test bei dir fehlschlägt, melde den Test und die Meldung, statt ihn anzupassen.

## Aufgabe 1: AMLR und AMLA (Wortlaut im amtlichen Amtsblatt-Text gelesen, Stand 8.10.2026)
Drei Sätze:
1. Die AMLR (Verordnung (EU) 2024/1624) gilt ab 10. Juli 2027 (Art. 90 Abs. 2); für Krypto-Anbieter gilt das Regeldatum, die einzige Ausnahme betrifft Fußballvermittler und Profivereine (2029). Ab dann dürfen Krypto-Anbieter keine anonymen Konten und keine Konten führen, die Transaktionen verschleiern, auch nicht über Anonymitäts-Coins (Art. 79 Abs. 1).
2. Das Verbot richtet sich an Anbieter, die Konten führen. Anbieter von Hardware, Software und selbstverwalteten Wallets ohne Zugriff sind laut Erwägungsgrund ausgenommen. Transfers von und zu eigenen Adressen bleiben erlaubt, der Anbieter muss sie risikobasiert prüfen (Art. 40 AMLR; Art. 14 Abs. 5 und Art. 16 Abs. 2 der Verordnung (EU) 2023/1113, ab 1.000 € Prüfung, ob die Adresse dem Kunden gehört). Bei Gelegenheitsgeschäften von Krypto-Anbietern gelten ab 1.000 € die vollen Sorgfaltspflichten, darunter mindestens die Identifizierung (Art. 19 Abs. 3).
3. Die AMLA (Verordnung (EU) 2024/1620) beginnt spätestens am 1. Juli 2027 mit der Auswahl (Art. 13 Abs. 4) und wählt Unternehmen mit hohem Restrisiko aus dem Kreis der in mindestens sechs Mitgliedstaaten tätigen Institute (Art. 12 Abs. 1, Art. 13 Abs. 1). Die direkte Aufsicht beginnt sechs Monate nach Veröffentlichung der Liste, laut AMLA ab 2028. Krypto-Dienstleister sind eine eigene Bewertungskategorie (Art. 12 Abs. 4 lit. j); ob einer ausgewählt wird, steht erst nach der Auswahl fest.

Einstufung für die Anzeige:
| Aussage | Einstufung |
|---|---|
| AMLR gilt ab 10.7.2027 (Art. 90) | gesichertes Recht |
| Verbot anonymer Konten und verschleiernder Konten bei Krypto-Anbietern (Art. 79) | gesichertes Recht |
| 1.000 €-Schwelle bei Gelegenheitsgeschäften (Art. 19 Abs. 3) | gesichertes Recht |
| Travel Rule und Prüfung eigener Adressen ab 1.000 € (VO 2023/1113 Art. 14, 16) | gesichertes Recht |
| AMLA-Auswahl beginnt spätestens 1.7.2027 (Art. 13 Abs. 4) | gesichertes Recht |
| Aufsichtsbeginn "2028" | nach aktuellem Zeitplan: Der Artikel nennt "sechs Monate nach Listenveröffentlichung", die Jahreszahl steht im Erwägungsgrund 190 und in der AMLA-Erläuterung |
| "bis zu 40 Unternehmen" | nach aktuellem Zeitplan: Der Verordnungstext nennt 40 als Schwelle für eine mögliche Begrenzung (Art. 13 Abs. 2), die AMLA-Erläuterung sagt "bis zu 40" |
| Ob und welche Krypto-Anbieter ausgewählt werden | offen |
| Ausnahme für Self-Custody-Anbieter | Erwägungsgrund, nicht Artikeltext: als "laut Erwägungsgrund" formulieren |

Der Prüfhinweis "gegen EUR-Lex prüfen" ist aus dem Paketstext entfernt, weil der Wortlaut jetzt gelesen ist. Der Restvorbehalt: Spätere Berichtigungen des Amtsblatts sind nicht geprüft. Die Erwägungsgrund-Nummern (außer 190) sind nicht verifiziert, nenne sie in der Anzeige nicht.

## Aufgabe 2: Texte
Die fertigen Texte liegen als Anhang: `LOVABLE_TEXTE_MODELL_QUIZ.json` (DE und EN je Schlüssel), `LOCALE_MERGE_de.json` und `LOCALE_MERGE_en.json` (flach, zum Mergen in `src/locales/de.json` und `en.json`). Sie enthalten genau deine Schlüssel unter `model` und `regulation`, ohne Auslassungen. `regulation.whatYouCanDo` enthält fünf nummerierte Zeilen, getrennt durch `\n`; rendere sie als Liste. Alle Texte sind gegen die Verbotsliste geprüft (keine Wörter wie "sicher", "garantiert", "steuerfrei", "Testsieger", "Rendite"). Die Texte nennen ausdrücklich "keine Steuerberatung". Bitte keine Satzteile umformulieren. Änderungswünsche schicke an mich.

## Aufgabe 3: Steuer-Tool-Box
Ausrichtung bestätigt: keine eigene Vergleichsseite, eine neutrale Box am Ende von `/learn/dac8-meldepflicht-krypto` (EN: `dac8-crypto-reporting`). Zwei Bedingungen:
1. Die Box erscheint erst, wenn mindestens drei Tools geprüft sind. Das regelt `shouldShowTaxToolBox(TAX_TOOLS, today)` in `src/content/tax-tools.ts`. Heute ist `TAX_TOOLS` leer, die Box rendert also nichts. Baue die Komponente, aber ohne Platzhalter-Tools und ohne Namen.
2. Deine Semrush-Zahlen (dac8 720, KD 23; krypto steuer tool 260, KD 31) sind mit deinem Connector erhoben. Die EN-Datenbank fehlt noch. Die Entscheidung über die Tool-Namen fällt erst nach der DE- und EN-Prüfung. Bitte liefere die EN-Zahlen (Datenbanken us und uk): "crypto tax software", "crypto tax tool", "dac8 crypto" mit Volumen, KD, Intent und Datum der Abfrage.

Die fünf Kriterien stehen in `TAX_TOOL_CRITERIA` (Datenimport, Abgleich von Transfers, Länder, Export und Rechenmethode, Datenhaltung und Preis). Reihenfolge der Tools alphabetisch über `sortedTaxTools`. Texte der Box in `TAX_BOX_TEXT` (inklusive Werbekennzeichnung, falls ein Affiliate-Link gesetzt ist). Die Texte dort sind Paketdateien und kommen unverändert in die Locale-Dateien, falls du sie dort brauchst. Kriterienwerte ohne Quelle werden als "nicht geprüft" angezeigt.

## Aufgabe 4: Repository-Abgleich und Stufe A
- Test-Sync: siehe oben. Das Paket hat die Zähler schon. Übernimm die Testdateien aus den Anhängen.
- Stufe A (Zuordnungslogik in `src/lib/quiz.ts` und `src/lib/matching.ts`, `deriveModel`): kommt als nächste Paketlieferung nach dieser. Sie hängt nicht von den Gebührendaten ab. Bis dahin bleibt dein Übergangstipp (`priorityHint`) bestehen. Terminzusage: Ich melde mich mit der Lieferung, nicht mit einem Datum.

## Anhänge (alle unverändert übernehmen)
`src/content/knowledge.ts`, `src/content/learn-registry.ts`, `src/content/tax-tools.ts`, `src/lib/quiz.ts`, `src/lib/quick-paths.ts`, `src/lib/__tests__/site-routes-seo.test.ts`, `src/lib/__tests__/quick-paths.test.ts`, `src/lib/__tests__/tax-tools.test.ts`.
Danach `npx vitest run`: erwartet 135 Tests in 7 Dateien. Falls die Zahl abweicht, melde Zahl und Dateien.
Die fünf Schnellpfad-Buttons auf der Startseite aus Prompt B (`LOVABLE_PROMPTS_R1.md`) sind noch offen, bitte mit dieser Lieferung erledigen.
