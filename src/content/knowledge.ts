/**
 * Wissensbereich: komplexe Regeln in drei Ebenen.
 * Ebene 1 summary: "Was heißt das für mich?" (max. 2 Sätze, immer sichtbar)
 * Ebene 2 details: aufklappbar
 * Ebene 3 sources: Primärquellen
 * Stand: 2026-10-01, Grundlage Perplexity-Recherche, vor Launch Quellen stichprobenartig prüfen.
 */
import type { I18n } from "../lib/types";

export interface KnowledgeTopic {
  slug: string;
  title: I18n;
  summary: I18n;
  details: I18n[];
  sources: { label: string; url: string }[];
  asOf: string;
}

export const KNOWLEDGE_TOPICS: readonly KnowledgeTopic[] = [
  {
    slug: "mica",
    asOf: "2026-10-01",
    title: { de: "MiCA: Wer darf dir Krypto-Dienste anbieten?", en: "MiCA: who may offer you crypto services?" },
    summary: {
      de: "Seit Juli 2026 dürfen nur noch zugelassene Anbieter Krypto-Dienste an Kunden in der EU erbringen. Die Zulassung macht deine Kryptowerte aber nicht zu einer Bankeinlage: Kursverluste und Totalverlust sind nicht abgesichert.",
      en: "Since July 2026 only authorised providers may offer crypto services to customers in the EU. Authorisation does not turn your crypto into a bank deposit: price losses and total loss are not insured.",
    },
    details: [
      {
        de: "Die EU-Verordnung MiCA verlangt für Verwahrung, Handel, Tausch, Transfers und Beratung eine Zulassung als Krypto-Dienstleister (CASP). Banken und E-Geld-Institute können dieselben Dienste nach einer Anzeige bei ihrer Aufsicht anbieten (Art. 60). Eine Zulassung aus einem EU-Land gilt per Passporting in weiteren EU-Ländern.",
        en: "The EU regulation MiCA requires authorisation as a crypto-asset service provider (CASP) for custody, trading, exchange, transfers and advice. Banks and e-money institutions can offer the same services after notifying their supervisor (Art. 60). An authorisation from one EU country applies in other EU countries via passporting.",
      },
      {
        de: "Alle nationalen Übergangsfristen sind abgelaufen, die letzten am 1. Juli 2026. Eine frühere Registrierung als Krypto-Anbieter nach Geldwäscherecht reicht nicht mehr.",
        en: "All national transition periods have ended, the last on 1 July 2026. An earlier anti-money-laundering registration as a crypto provider is no longer enough.",
      },
      {
        de: "Entscheidend ist die Gesellschaft, mit der du den Vertrag schließt, nicht die Marke. Eine Lizenz einer Konzerntochter schützt dich nicht, wenn dein Vertrag laut AGB mit einer Gesellschaft außerhalb der EU besteht. Prüfen lässt sich das im ESMA-Register.",
        en: "What matters is the company you sign the contract with, not the brand. A licence held by a group subsidiary does not protect you if your contract under the terms is with a company outside the EU. You can check this in the ESMA register.",
      },
      {
        de: "Ein zugelassener Verwahrer muss deine Kryptowerte von seinem eigenen Vermögen trennen. Das verbessert deine Lage bei einer Insolvenz, ist aber keine staatliche Garantie.",
        en: "An authorised custodian must keep your crypto separate from its own assets. This improves your position in an insolvency but is not a state guarantee.",
      },
    ],
    sources: [
      { label: "MiCA-Verordnung (EU) 2023/1114", url: "https://eur-lex.europa.eu/eli/reg/2023/1114/oj" },
      { label: "ESMA Statement Ende der Übergangsfristen (06/2026)", url: "https://www.esma.europa.eu/sites/default/files/2026-06/ESMA75-113276571-1710_Public_Statement_MiCA_transitional_period_ends.pdf" },
      { label: "ESMA MiCA-Register", url: "https://www.esma.europa.eu/publications-and-data/data/markets-crypto-assets-regulation-mica" },
    ],
  },
  {
    slug: "dac8",
    asOf: "2026-10-01",
    title: { de: "DAC8: Was Krypto-Anbieter an das Finanzamt melden", en: "DAC8: what crypto providers report to tax authorities" },
    summary: {
      de: "Seit 1. Januar 2026 sammeln Krypto-Anbieter in der EU Daten zu deinen Transaktionen und melden sie ab 2027 an die Steuerbehörden. Das erzeugt keine neue Steuer, macht aber Abweichungen in deiner Steuererklärung leichter sichtbar.",
      en: "Since 1 January 2026 crypto providers in the EU collect data on your transactions and report it to tax authorities from 2027. This creates no new tax but makes discrepancies in your tax return easier to spot.",
    },
    details: [
      {
        de: "Gemeldet werden unter anderem Name, Anschrift, Steuer-ID und Steuerwohnsitz sowie je Kryptowert die Summen aus Käufen, Verkäufen, Tauschvorgängen und Transfers. Zahlungen über Krypto-Karten können als Zahlungstransaktionen erfasst sein.",
        en: "Reported data include name, address, tax ID and tax residence, plus per crypto-asset the totals of purchases, sales, exchanges and transfers. Payments via crypto cards may be captured as payment transactions.",
      },
      {
        de: "Das internationale Gegenstück heißt CARF (OECD). Ob Daten aus einem Nicht-EU-Land fließen, hängt davon ab, ob dieses Land teilnimmt.",
        en: "The international counterpart is CARF (OECD). Whether data flow from a non-EU country depends on whether that country participates.",
      },
      {
        de: "Eine eigene Wallet wird nicht automatisch gemeldet. Ein Anbieter kann aber Transfers zu oder von deiner Wallet-Adresse in seine Meldung aufnehmen.",
        en: "Your own wallet is not reported automatically. A provider can, however, include transfers to or from your wallet address in its report.",
      },
    ],
    sources: [
      { label: "DAC8, Richtlinie (EU) 2023/2226", url: "https://eur-lex.europa.eu/eli/dir/2023/2226/oj" },
      { label: "OECD Crypto-Asset Reporting Framework", url: "https://www.oecd.org/tax/exchange-of-tax-information/crypto-asset-reporting-framework-and-amended-common-reporting-standard.htm" },
    ],
  },
  {
    slug: "travel-rule",
    asOf: "2026-10-01",
    title: { de: "Travel Rule: Warum deine Börse nach der Wallet fragt", en: "Travel rule: why your exchange asks about your wallet" },
    summary: {
      de: "Bei Krypto-Transfers über einen regulierten Anbieter müssen Angaben zu Absender und Empfänger mitgeschickt werden, ähnlich wie bei einer Banküberweisung. Bei Auszahlungen über 1.000 € auf deine eigene Wallet kann der Anbieter einen Nachweis verlangen, dass sie dir gehört.",
      en: "For crypto transfers through a regulated provider, sender and recipient details must travel with the transfer, similar to a bank transfer. For withdrawals above €1,000 to your own wallet, the provider may ask for proof that it belongs to you.",
    },
    details: [
      {
        de: "Die Regel gilt seit 30. Dezember 2024 in der ganzen EU. Sie greift ab dem ersten Euro, die 1.000-€-Schwelle betrifft nur die Prüfung von Self-Custody-Adressen.",
        en: "The rule has applied across the EU since 30 December 2024. It applies from the first euro; the €1,000 threshold only concerns checks of self-custody addresses.",
      },
      {
        de: "Übliche Nachweise sind eine signierte Nachricht, eine Testüberweisung kleiner Beträge oder das Verbinden der Wallet. Transfers direkt zwischen zwei privaten Wallets fallen nicht darunter.",
        en: "Common proofs are a signed message, a small test transfer or connecting the wallet. Transfers directly between two private wallets are not covered.",
      },
    ],
    sources: [
      { label: "Transfer of Funds Regulation (EU) 2023/1113", url: "https://eur-lex.europa.eu/eli/reg/2023/1113/oj" },
    ],
  },
  {
    slug: "custody",
    asOf: "2026-10-01",
    title: { de: "Verwahrt beim Anbieter oder eigene Wallet?", en: "Held by the provider or your own wallet?" },
    summary: {
      de: "Bei einer verwahrten Karte liegen deine Coins beim Anbieter, bei einer Self-Custody-Karte behältst du die Schlüssel. Das eine verlagert das Risiko auf den Anbieter, das andere auf dich selbst.",
      en: "With a custodial card your coins sit with the provider; with a self-custody card you keep the keys. One shifts the risk to the provider, the other to you.",
    },
    details: [
      {
        de: "Verwahrt: einfacher Einstieg, Passwort-Reset möglich. Risiko: Insolvenz, Kontosperre oder Hack beim Anbieter. Mit MiCA-Zulassung muss der Anbieter deine Werte getrennt halten.",
        en: "Custodial: easy start, password reset possible. Risk: insolvency, account freeze or hack at the provider. With MiCA authorisation, the provider must keep your assets segregated.",
      },
      {
        de: "Self-Custody: Die Karte darf nur einen freigegebenen Betrag aus deiner Wallet nutzen. Risiko: Verlust der Schlüssel, Phishing, Fehler im Smart Contract. Self-Custody heißt nicht unreguliert: Kartenausgabe und Umtausch laufen über Partnerfirmen, die ihrerseits reguliert sein müssen.",
        en: "Self-custody: the card can only use an approved amount from your wallet. Risk: losing your keys, phishing, smart-contract bugs. Self-custody does not mean unregulated: card issuing and conversion run through partner companies that must themselves be regulated.",
      },
      {
        de: "In beiden Fällen gibt es für Kryptowerte keine Einlagensicherung.",
        en: "In both cases there is no deposit insurance for crypto-assets.",
      },
    ],
    sources: [
      { label: "MiCA Art. 75 (Verwahrung)", url: "https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-75-providing-custody-and" },
    ],
  },
  {
    slug: "stablecoins",
    asOf: "2026-10-01",
    title: { de: "Stablecoins: USDC, EURC, EURe und USDT", en: "Stablecoins: USDC, EURC, EURe and USDT" },
    summary: {
      de: "USDC und EURC werden in der EU von einem zugelassenen E-Geld-Institut ausgegeben, für USDT gibt es keinen MiCA-zugelassenen Emittenten. Auch eine Zahlung mit Stablecoins kann steuerlich ein Verkauf sein.",
      en: "USDC and EURC are issued in the EU by an authorised e-money institution; USDT has no MiCA-authorised issuer. Paying with stablecoins can also count as a sale for tax purposes.",
    },
    details: [
      {
        de: "Ein E-Geld-Token (EMT) bildet genau eine Währung ab. Du hast gegenüber dem Emittenten einen Anspruch auf Rücktausch zum Nennwert. Das ist keine Bankeinlage und nicht durch die Einlagensicherung gedeckt.",
        en: "An e-money token (EMT) tracks exactly one currency. You have a claim against the issuer for redemption at par. This is not a bank deposit and not covered by deposit insurance.",
      },
      {
        de: "USDT kann weiter gehalten und übertragen werden, regulierte EU-Börsen haben den Handel aber weitgehend eingeschränkt.",
        en: "USDT can still be held and transferred, but regulated EU exchanges have largely restricted trading.",
      },
      {
        de: "Steuern: In Deutschland, Österreich, Frankreich, Spanien, Italien und Zypern gilt die Zahlung mit einem Stablecoin grundsätzlich als Veräußerung. Bei gleichem Ein- und Verkaufskurs entsteht kaum Gewinn; bei USD-Stablecoins kann schon der Euro-Dollar-Kurs einen Gewinn oder Verlust erzeugen. In den Niederlanden wird privates Kryptovermögen in der Regel pauschal über Box 3 besteuert.",
        en: "Taxes: in Germany, Austria, France, Spain, Italy and Cyprus, paying with a stablecoin generally counts as a disposal. If buy and sell price are equal, there is little gain; with USD stablecoins the euro-dollar rate alone can create a gain or loss. In the Netherlands private crypto holdings are usually taxed on a flat basis under Box 3.",
      },
    ],
    sources: [
      { label: "Circle MiCA-Informationen", url: "https://www.circle.com/marketing-communications" },
      { label: "BMF-Schreiben Kryptowerte 06.03.2025", url: "https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Einkommensteuer/2025-03-06-einzelfragen-kryptowerte.html" },
    ],
  },
  {
    slug: "how-crypto-cards-work",
    asOf: "2026-10-01",
    title: { de: "Wie eine Krypto-Karte rechtlich funktioniert", en: "How a crypto card works legally" },
    summary: {
      de: "Hinter einer Krypto-Karte stehen meist zwei Firmen: ein Krypto-Anbieter, der deine Coins verkauft, und ein Kartenherausgeber, der die Visa- oder Mastercard ausgibt. Wichtig ist, ob bei jeder Zahlung Krypto verkauft wird oder ob du aus Euro-Guthaben zahlst.",
      en: "A crypto card usually involves two companies: a crypto provider that sells your coins and a card issuer that issues the Visa or Mastercard. What matters is whether crypto is sold on every payment or whether you pay from a euro balance.",
    },
    details: [
      {
        de: "Kartenherausgeber ist meist ein E-Geld-Institut, etwa in Litauen oder Malta. Visa und Mastercard sind nur das Zahlungsnetz. E-Geld-Guthaben ist abgesichert, aber keine Bankeinlage.",
        en: "The card issuer is usually an e-money institution, for example in Lithuania or Malta. Visa and Mastercard are only the payment network. E-money balances are safeguarded but are not bank deposits.",
      },
      {
        de: "Verkauft die Karte bei jeder Zahlung Krypto, entsteht pro Einkauf ein Vorgang, den du in vielen Ländern für die Steuer dokumentieren musst. Karten mit Euro-Guthaben verschieben den Verkauf auf den Moment, in dem du auflädst.",
        en: "If the card sells crypto on every payment, each purchase creates an event you have to document for tax in many countries. Cards with a euro balance move the sale to the moment you top up.",
      },
      {
        de: "Vor der Bestellung lohnt ein Blick in vier Dokumente: Kartenbedingungen (wer ist Herausgeber?), Kontobedingungen (Bank, E-Geld oder Verrechnungskonto?), Krypto-Bedingungen (welche Gesellschaft verwahrt?) und das Preisverzeichnis.",
        en: "Before ordering, check four documents: card terms (who is the issuer?), account terms (bank, e-money or settlement account?), crypto terms (which company holds your crypto?) and the fee schedule.",
      },
    ],
    sources: [
      { label: "PSD2, Richtlinie (EU) 2015/2366", url: "https://eur-lex.europa.eu/eli/dir/2015/2366/oj" },
      { label: "E-Geld-Richtlinie 2009/110/EG", url: "https://eur-lex.europa.eu/eli/dir/2009/110/oj" },
    ],
  },
];
