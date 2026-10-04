# Design-Vorgabe UseYourCoins (Richtung B: Neobank-Optik)

Stand 2026-10-04 · Entscheidung Peter · Sichtreferenz: `preview/design-richtung-b.html`

Diese Vorgabe ersetzt den Absatz „Design-System" in `docs/M0-UEBERGABE.md`, Abschnitt 5.2. Alle übrigen Regeln (Pflichttexte, Pfade, Kopfdaten, keine eigene Logik) gelten unverändert.

---

## 1. Charakter

Hell, ruhig, großzügig. Große runde Flächen, eine kräftige Akzentfarbe, viel Weißraum. Wirkt wie eine moderne Banking-App, nicht wie eine Krypto-Börse.

**Nicht:** Verläufe, Neonfarben, Coin-Grafiken, Raketen, Glaseffekte, Schatten als Hauptgestaltungsmittel, Kartenbilder oder Logos, die wir nicht haben, Emoji als Icons.

---

## 2. Farben

Als CSS-Variablen im Token-Format des Projekts anlegen und auf die shadcn-Token abbilden. Keine Farbwerte direkt in Komponenten.

| Token (shadcn) | Hell | Dunkel | Einsatz |
|---|---|---|---|
| `background` | `#FFFFFF` | `#0D1022` | Seitenhintergrund |
| `foreground` | `#10142B` | `#EEF0FA` | Text |
| `card` | `#F7F8FC` | `#171B33` | Karten, Kacheln |
| `card-foreground` | `#10142B` | `#EEF0FA` | |
| `muted` | `#F1F3FA` | `#1E2340` | Navigationsleiste, zweitrangige Kacheln |
| `muted-foreground` | `#4A5170` | `#A9B0CC` | Nebentext, Beschriftungen |
| `primary` | `#2238C9` | `#8FA0FF` | Haupt-CTA, aktive Zustände, Links |
| `primary-foreground` | `#FFFFFF` | `#0D1022` | Text auf `primary` |
| `secondary` | `#10142B` | `#EEF0FA` | Dunkle Schaltfläche („Zum Produktprofil") |
| `secondary-foreground` | `#FFFFFF` | `#0D1022` | |
| `accent` | `#E8ECFF` | `#232A55` | Pillen, Hervorhebungen |
| `accent-foreground` | `#1B2DA8` | `#C5CDFF` | Text in Pillen |
| `border` | `#E3E6F0` | `#2A3050` | Linien, Eingabefelder |
| `ring` | `#2238C9` | `#8FA0FF` | Fokusrahmen |

**Bedeutungsfarben** (zusätzliche Token `--positive`, `--warning`, `--unknown`, je mit `-foreground`):

| Bedeutung | Fläche hell | Text hell | Fläche dunkel | Text dunkel | Einsatz |
|---|---|---|---|---|---|
| Positiv | `#DDF3E6` | `#0E5A33` | `#12301F` | `#8FE0B0` | „verfügbar", belegte positive Fakten |
| Warnung | `#FFF1D6` | `#5E3A00` | `#33270C` | `#F2CE7A` | Warnhinweise, keine EU-Zulassung |
| Unbekannt | `#E9EBF2` | `#4A5170` | `#22273F` | `#A9B0CC` | „nicht geprüft", „nicht bestätigt" |

Regeln:
- `primary` nur für die eine wichtigste Aktion je Ansicht und für Links.
- Rot wird nicht verwendet, auch nicht für „nicht verfügbar" (dafür: Unbekannt-Fläche mit Text).
- Bedeutung nie allein über Farbe: immer mit Text, bei Warnungen zusätzlich mit Icon.
- Kontrast mindestens 4,5:1 für Text, 3:1 für große Schrift und Bedienelemente.

---

## 3. Schrift

**Plus Jakarta Sans**, selbst gehostet (Paket `@fontsource-variable/plus-jakarta-sans`). Keine Verbindung zu Google Fonts. Ersatzschrift: `system-ui, sans-serif`. Nur diese eine Familie.

| Rolle | Größe / Zeilenhöhe | Gewicht | Laufweite |
|---|---|---|---|
| H1 Startseite | 50 / 54 px (mobil 34 / 38) | 800 | −0,03em |
| H1 Unterseiten | 40 / 46 px (mobil 30 / 36) | 800 | −0,02em |
| H2 | 28 / 34 px (mobil 24 / 30) | 800 | −0,02em |
| H3, Kartentitel | 21 / 26 px | 700 | 0 |
| Lead | 18 / 28 px | 400 | 0 |
| Fließtext | 16 / 26 px | 400 | 0 |
| Klein, Beschriftung | 14 / 20 px | 500 | 0 |
| Pille, Label | 13 / 16 px | 600 | 0 |

- Zahlen in Tabellen und Gebührenfeldern mit `font-variant-numeric: tabular-nums`.
- Lesetexte (Wissensartikel) höchstens 68 Zeichen breit.
- Keine Großbuchstaben-Überschriften, keine Kursivschrift als Auszeichnung.

---

## 4. Form und Abstände

| | Wert |
|---|---|
| Abstandsraster | 4 px. Übliche Schritte: 8, 12, 16, 20, 24, 32, 48, 64 |
| Seitenbreite | höchstens 1120 px Inhalt, Seitenrand 48 px (mobil 16 px) |
| Abstand zwischen Abschnitten | 64 px (mobil 44 px) |
| Radius Kachel, Karte | 28 px (mobil 24 px) |
| Radius innere Felder | 18 px |
| Radius Schaltflächen, Pillen, Navigation | 999 px |
| Radius Monogramm | 16 px |
| Linien | 1 px `border`. Karten haben keine Rahmenlinie, sondern die Fläche `card` |
| Schatten | keine. Ebenen entstehen durch Flächenfarbe |
| Mindesthöhe Bedienelemente | 48 px, mobil mindestens 44 px Trefferfläche |

Tailwind: `--radius-xl` auf 24 px setzen, damit die fertigen Komponenten aus `src/components/results/` (nutzen `rounded-xl`) ohne Änderung zur Optik passen.

---

## 5. Komponenten

**Kopfzeile:** 76 px hoch, weiß. Links Wortmarke `useyourcoins` als Text (800, klein geschrieben). Mitte Navigation als Pillenleiste auf `muted`, aktiver Punkt als weiße Pille. Rechts Sprachumschalter. Mobil: Wortmarke, Menü-Schaltfläche, Navigation als Vollbild-Liste.

**Einstieg Startseite:** zentriert. Zählerpille („8 EU-Länder · 14 Anbieter · 23 Produkte", Zahlen aus dem Katalog), H1, Lead, darunter drei gleich breite Kacheln. Erste Kachel `primary`, die anderen `muted`. Jede Kachel: Titel 20 px / 700, eine Zeile Erklärung. Mobil untereinander.

**Schaltflächen**

| Art | Aussehen | Einsatz |
|---|---|---|
| Primär | `primary`, Text weiß, Pille, 50 px hoch | Partnerlink-CTA, Finder starten |
| Dunkel | `secondary`, Pille | „Zum Produktprofil", interne Hauptaktion |
| Hell | `muted`, Pille | Nebenaktionen, Filter |
| Textlink | `primary`, unterstrichen bei Hover und Fokus | im Fließtext |

Am Partnerlink-CTA steht das Werbelabel aus `adLabel()` als eigene kleine Pille direkt über oder im Button, nie nur im Fließtext.

**Produktkarte (Listen, Hubs, Kategorien):** Fläche `card`, Radius 28 px, Innenabstand 24 px, Abstand der Blöcke 16 px. Aufbau von oben:
1. Monogramm (52 px, `secondary`, Radius 16 px) aus `providerMonogram()`, daneben Produktname und „Karte · Anbieter X". Ist ein Logo freigegeben (`providerLogoPath()`), ersetzt es das Monogramm in gleicher Größe auf weißer Fläche.
2. Pillenreihe mit Fakten (Verwahrung, Zulassung, Verfügbarkeit im Land).
3. Raster 2 × 2 mit Feldern (weiß, Radius 18 px): Beschriftung klein, Wert groß.
4. Warnhinweis, falls vorhanden.
5. Schaltfläche in voller Breite, unten bündig.

**Ergebniskarte im Finder:** `CardRecommendationCard` aus `src/components/results/` unverändert verwenden. Sie übernimmt die Optik über die Token. Nicht nachbauen.

**Pillen:** 13 px / 600, Innenabstand 6 × 12 px. Fakt = `accent`. Positiv, Warnung, Unbekannt = jeweilige Bedeutungsfarbe. Höchstens vier Pillen je Karte.

**Tabellen (Direktvergleich, Verfügbarkeit):** Fläche `card`, Radius 28 px, Zeilen durch 1 px `border` getrennt, Kopfzeile 14 px / 600 in `muted-foreground`. Erste Spalte bleibt mobil stehen, Rest scrollt waagerecht in der Fläche.

**Akkordeon (Trust-Layer):** Komponenten aus `src/components/results/` unverändert.

**Schaubild „Wer sieht was":** drei Kacheln auf `muted`, Radius 24 px. Je Kachel: Kürzel (KYC, DAC8, Travel Rule) in `primary`, Titel „Von → An", ein Satz. Mobil untereinander.

**Wissensartikel:** einspaltig, höchstens 68 Zeichen. Oben Kasten „Was heißt das für mich?" auf `accent`. Quellen am Ende als Liste mit Datum. Finder-Kasten auf `muted` mit dunkler Schaltfläche.

**Fußzeile:** Fläche `card`. Allgemeiner Hinweis (`GENERAL_DISCLAIMER`) in 13 px, darunter Links und Betreiberzeile.

---

## 6. Umgang mit fehlenden Daten (verbindlich)

In dieser Optik sieht ein Feld mit „nicht geprüft" schnell wie fehlender Inhalt aus. Deshalb gilt:

| Zustand | Darstellung |
|---|---|
| Wert geprüft (`confidence: "verified"`) | Wert groß in `foreground`, darunter klein „geprüft am {Datum}" |
| Wert aus Anbieterangabe oder Recherche | Wert groß in `foreground`, darunter klein „Anbieterangabe" |
| Wert unbekannt (`null`) | Feld mit gestricheltem Rahmen (1,5 px, `border`) statt weißer Fläche. Text „nicht geprüft" in 15 px / 600 `muted-foreground`. **Nie** in der Größe eines Werts, nie „0", nie „Nein", nie ein Strich allein |
| Alle vier Felder einer Karte unbekannt | Raster entfällt. Stattdessen eine Zeile auf Unbekannt-Fläche: „Gebühren und Cashback sind noch nicht geprüft." |
| Verfügbarkeit unbekannt | Pille in Unbekannt-Farbe: „{Land}: nicht bestätigt" |

Die Texte kommen aus `common.notVerified`, `WARNING_LABEL` und den `product.dataStatus*`-Schlüsseln.

---

## 7. Bewegung, Icons, Bilder

- Übergänge 150 ms für Hover und Fokus, 200 ms für Akkordeon. Keine Einblend-Animationen beim Scrollen. `prefers-reduced-motion` beachten.
- Icons: Lucide, Strichstärke 1,75, Größe 20 px. Nur wo sie Bedeutung tragen (Warnung, externer Link, Menü, Pfeil).
- Keine Stockfotos, keine Illustrationen von Münzen oder Karten. Bildflächen bleiben Typografie und Fläche.

---

## 8. Zugänglichkeit

- WCAG 2.1 AA. Sichtbarer Fokusrahmen 2 px `ring` mit 2 px Abstand auf allen Bedienelementen.
- Echte `<a>` für Navigation, echte `<button>` für Aktionen, `<label>` an jedem Eingabefeld.
- Quiz vollständig per Tastatur bedienbar.
- Layout ab 320 px Breite ohne waagerechtes Scrollen der Seite.

---

## 9. Dunkelmodus

Folgt der Systemeinstellung, Umschalter in der Fußzeile. Alle Farben nur über Token. Bedeutungsfarben nutzen die Dunkel-Werte aus Abschnitt 2.

---

## 10. Prompt an Lovable

```
Setze das Design-System nach docs/DESIGN.md um. Sichtreferenz: preview/design-richtung-b.html.

1. Token: Farben aus Abschnitt 2 (hell und dunkel) als CSS-Variablen im Token-Format des Projekts,
   abgebildet auf die shadcn-Token. Zusätzlich --positive, --warning, --unknown mit -foreground.
   --radius-xl = 24px. Keine Farbwerte direkt in Komponenten.
2. Schrift: Plus Jakarta Sans über @fontsource-variable/plus-jakarta-sans, keine Google-Fonts-Verbindung.
   Schriftgrößen aus Abschnitt 3.
3. Baue die Komponenten aus Abschnitt 5: Kopfzeile mit Pillen-Navigation, Einstieg mit drei Kacheln,
   Schaltflächen (primär, dunkel, hell), Produktkarte, Pillen, Tabellenfläche, Schaubild "Wer sieht was",
   Fußzeile.
4. Fehlende Daten genau nach Abschnitt 6 darstellen. Das ist verbindlich.
5. src/components/results/** nicht umgestalten und nicht nachbauen. Sie übernehmen die Optik über die Token.
6. Keine Verläufe, keine Schatten als Gestaltungsmittel, keine Coin- oder Kartenbilder, keine Emoji.
7. Prüfe: Kontrast AA in hell und dunkel, Fokusrahmen sichtbar, Layout bei 375 px ohne waagerechtes Scrollen.

Zeige mir danach Startseite und einen Karten-Hub in hell und dunkel.
```
