# Lovable: Übergabe R1, Dateien aus dem Paket

Dieser Prompt gehört zusammen mit zwei Dateianhängen:
- `knowledge.ts` (Ziel: `src/content/knowledge.ts`)
- `learn-registry.ts` (Ziel: `src/content/learn-registry.ts`)

## Aufgabe
1. Ersetze `src/content/knowledge.ts` und `src/content/learn-registry.ts` vollständig und unverändert durch die angehängten Dateien. Das sind Paketdateien. Falls sie in deinem Projekt als geschützt markiert sind: Der Projektinhaber erlaubt diese Ersetzung ausdrücklich. Ändere keinen Inhalt, keine Formatierung, keine Übersetzung.
2. Rendere die neuen Wissensseiten über das vorhandene Learn-Registry-Muster:
   - `what-providers-report`: DE und EN laut Registry-Slug.
   - `regulation-timeline`: DE `krypto-regulierung-2026-2028`, EN `crypto-regulation-timeline-2026-2028`.
   - Der Eintrag `kyc-explained` hat Status `planned`: nicht rendern, nicht in Navigation und Sitemap.
3. Die Wissensseite `dac8` zeigt automatisch den neuen Text. Entferne deine eigenen Hilfstexte zur Zeitachse und zu Meldewegen aus den drei Bestandsseiten und verlinke stattdessen intern auf die neuen Seiten.
4. Zeige je Seite `asOf` und die Quellenliste sichtbar an. Die Aussagen zu AMLR (10.7.2027, anonyme Konten) sind "wahrscheinlich" und dürfen nicht als gesichert dargestellt werden. Der Prüfhinweis im Text bleibt.
5. Sitemap: Es entstehen 140 URLs (70 pro Sprache), `lastmod` aus `asOf`.
6. Ändere keine Texte außerhalb von `src/locales/de.json` und `en.json`.

## Danach melden
- Welche Dateien wurden ersetzt, welche Routen sind neu?
- Alle Stellen, an denen du eigene Texte neben den Paketdateien behalten hast, mit Begründung.
