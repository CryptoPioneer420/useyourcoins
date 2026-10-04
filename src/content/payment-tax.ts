/**
 * Steuer-Erklärer für den Trust-Bereich "Was beim Bezahlen mit Krypto steuerlich passiert".
 * Je Land genau drei Sätze, Grundlage Recherche 2026-10-01 (siehe countries.tax_source_url).
 * Ersetzt den Prompt-Baustein "Der Stablecoin-Vorteil", dessen Kernaussage
 * (keine Veräußerungsgewinne bei Stablecoins) für DE, AT, FR, ES, IT, CY falsch ist.
 */
import type { CountryCode, FundingFlow, I18n } from "../lib/types";

export const PAYMENT_TAX_TITLE: I18n = {
  de: "Was beim Bezahlen mit Krypto steuerlich passiert",
  en: "What happens tax-wise when you pay with crypto",
};

export const PAYMENT_TAX_AS_OF = "2026-10-01";

export const PAYMENT_TAX: Readonly<Record<CountryCode, { de: [string, string, string]; en: [string, string, string] }>> = {
  DE: {
    de: [
      "In Deutschland gilt jede Zahlung mit Krypto als Verkauf; liegt der Kauf weniger als ein Jahr zurück, ist ein Gewinn steuerpflichtig.",
      "Das gilt auch für Stablecoins: Bei Euro-Stablecoins wie EURC oder EURe entsteht meist kaum Gewinn, bei Dollar-Stablecoins wie USDC kann allein der Euro-Dollar-Kurs einen Gewinn oder Verlust erzeugen.",
      "Bleibt dein Gesamtgewinn aus privaten Veräußerungsgeschäften im Jahr unter 1.000 €, fällt keine Steuer an; dokumentieren solltest du jede Zahlung trotzdem.",
    ],
    en: [
      "In Germany every payment with crypto counts as a sale; if you bought it less than a year ago, any gain is taxable.",
      "This also applies to stablecoins: euro stablecoins such as EURC or EURe usually produce little gain, while with dollar stablecoins such as USDC the euro-dollar rate alone can create a gain or loss.",
      "If your total gain from private disposals stays below €1,000 a year, no tax is due; you should still document every payment.",
    ],
  },
  AT: {
    de: [
      "In Österreich ist das Bezahlen von Waren oder Dienstleistungen mit Krypto ein steuerpflichtiger Tausch; für ab März 2021 gekaufte Kryptowerte gelten 27,5 % auf den Gewinn, unabhängig von der Haltedauer.",
      "Stablecoins sind davon nicht ausgenommen: Bei Euro-Stablecoins ist der Gewinn meist gering, bei Dollar-Stablecoins zählt auch die Kursbewegung zum Euro.",
      "Ohne Steuerfolge bleibt nur der Tausch Krypto gegen Krypto, nicht das Bezahlen.",
    ],
    en: [
      "In Austria paying for goods or services with crypto is a taxable exchange; for crypto bought from March 2021, gains are taxed at 27.5% regardless of holding period.",
      "Stablecoins are not exempt: with euro stablecoins the gain is usually small, with dollar stablecoins the movement against the euro also counts.",
      "Only swapping crypto for crypto has no immediate tax effect, paying does.",
    ],
  },
  FR: {
    de: [
      "In Frankreich ist das Bezahlen mit Krypto eine steuerbare Veräußerung; 2026 gilt in der Regel ein Pauschalsatz von 31,4 %.",
      "Auch bei Stablecoins kann ein Gewinn entstehen, weil er anteilig über dein gesamtes Krypto-Portfolio berechnet wird.",
      "Bleiben die Verkaufserlöse deines Haushalts im Jahr bei höchstens 305 €, fällt keine Steuer an.",
    ],
    en: [
      "In France paying with crypto is a taxable disposal; in 2026 a flat rate of 31.4% usually applies.",
      "Even with stablecoins a gain can arise, because it is calculated proportionally across your whole crypto portfolio.",
      "If your household's sale proceeds stay at or below €305 a year, no tax is due.",
    ],
  },
  ES: {
    de: [
      "In Spanien ist jede Zahlung mit Krypto ein steuerlich relevanter Tausch; eine steuerfreie Haltefrist gibt es nicht.",
      "Das gilt auch für Stablecoins; bei Dollar-Stablecoins kann schon der Wechselkurs zum Euro einen Gewinn erzeugen.",
      "Gewinne werden mit 19 % bis 30 % besteuert, und für im Ausland verwahrte Kryptowerte ab 50.000 € besteht eine zusätzliche Meldepflicht (Modell 721).",
    ],
    en: [
      "In Spain every payment with crypto is a tax-relevant exchange; there is no tax-free holding period.",
      "This also applies to stablecoins; with dollar stablecoins the exchange rate to the euro alone can create a gain.",
      "Gains are taxed at 19% to 30%, and crypto held abroad above €50,000 triggers an additional reporting duty (form 721).",
    ],
  },
  IT: {
    de: [
      "In Italien ist das Bezahlen mit Krypto eine steuerlich relevante Verwendung; seit 2026 gelten grundsätzlich 33 % auf Gewinne, ohne Freigrenze.",
      "Stablecoins sind davon nicht ausgenommen; bei Dollar-Stablecoins zählt auch die Kursbewegung zum Euro.",
      "Zusätzlich kann eine jährliche Abgabe von 0,2 % auf gehaltene Kryptowerte anfallen; einzelne Übergangsregeln sind noch offen.",
    ],
    en: [
      "In Italy paying with crypto is a tax-relevant use; since 2026 gains are generally taxed at 33%, with no exemption limit.",
      "Stablecoins are not exempt; with dollar stablecoins the movement against the euro also counts.",
      "An annual levy of 0.2% on crypto held may also apply; some transition rules are still open.",
    ],
  },
  NL: {
    de: [
      "In den Niederlanden wird privates Kryptovermögen in der Regel pauschal über Box 3 besteuert, nicht jeder einzelne Verkauf.",
      "Eine Kartenzahlung mit Krypto oder Stablecoins löst deshalb normalerweise keine eigene Gewinnsteuer aus.",
      "Bei sehr aktivem Handel kann eine andere Einordnung greifen, und Box 3 wird derzeit umgebaut.",
    ],
    en: [
      "In the Netherlands private crypto holdings are usually taxed on a flat basis under Box 3, not each individual sale.",
      "A card payment with crypto or stablecoins therefore normally triggers no separate gains tax.",
      "Very active trading can be classified differently, and Box 3 is currently being reformed.",
    ],
  },
  MT: {
    de: [
      "In Malta hängt die Besteuerung davon ab, ob du Kryptowerte als Kapitalanlage hältst oder damit handelst.",
      "Gewinne aus häufigem Handel können der Einkommensteuer unterliegen, Gewinne aus als Anlage gehaltenen Coins können außerhalb der Kapitalgewinnsteuer liegen.",
      "Eine pauschale Aussage für Kartenzahlungen ist nicht möglich; regelmäßige Kartennutzung kann für eine Einordnung als Handel sprechen.",
    ],
    en: [
      "In Malta taxation depends on whether you hold crypto as a capital investment or trade it.",
      "Gains from frequent trading can be subject to income tax, while gains from coins held as an investment may fall outside capital gains tax.",
      "A general statement for card payments is not possible; regular card use can point towards a trading classification.",
    ],
  },
  CY: {
    de: [
      "In Zypern gilt seit 2026 für Gewinne aus Kryptowerten ein eigener Steuersatz von 8 %, und auch das Bezahlen mit Krypto zählt als Veräußerung.",
      "Das betrifft auch Stablecoins; bei Dollar-Stablecoins kann der Wechselkurs zum Euro einen Gewinn oder Verlust erzeugen.",
      "Die Verwaltungspraxis ist noch jung, besonders bei Gebühren und E-Geld-Token.",
    ],
    en: [
      "In Cyprus a separate 8% rate has applied to crypto gains since 2026, and paying with crypto also counts as a disposal.",
      "This includes stablecoins; with dollar stablecoins the exchange rate to the euro can create a gain or loss.",
      "Administrative practice is still new, especially regarding fees and e-money tokens.",
    ],
  },
};

/** Ein Zusatzsatz, der den Funding-Flow der konkreten Karte einordnet. */
export const FUNDING_FLOW_TAX_NOTE: Readonly<Record<FundingFlow, I18n | null>> = {
  auto_sell_per_payment: {
    de: "Diese Karte verkauft bei jeder Zahlung Krypto, jeder Einkauf ist also ein eigener Vorgang.",
    en: "This card sells crypto on every payment, so each purchase is a separate event.",
  },
  prefunded_fiat: {
    de: "Diese Karte zahlt aus Euro-Guthaben; steuerlich relevant ist der Verkauf beim Aufladen, nicht die Kartenzahlung.",
    en: "This card pays from a euro balance; what matters for tax is the sale when you top up, not the card payment.",
  },
  prefunded_stablecoin: {
    de: "Diese Karte zahlt aus einem vorgeladenen Stablecoin; relevant sind der Tausch in den Stablecoin und die Zahlung selbst.",
    en: "This card pays from a pre-loaded stablecoin; both the swap into the stablecoin and the payment itself can matter.",
  },
  credit_line: {
    de: "Diese Karte gibt Kredit gegen Krypto-Sicherheiten; relevant werden Rückzahlung oder Verwertung der Sicherheiten.",
    en: "This card provides credit against crypto collateral; repayment or liquidation of the collateral can matter.",
  },
  mixed: {
    de: "Bei dieser Karte hängt es von der gewählten Zahlungsquelle ab: Euro-Guthaben oder Verkauf von Krypto bei jeder Zahlung.",
    en: "With this card it depends on the selected funding source: euro balance or selling crypto on every payment.",
  },
  unknown: null,
};
