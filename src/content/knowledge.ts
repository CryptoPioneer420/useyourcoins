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
    asOf: "2026-10-07",
    title: { de: "DAC8: Was Krypto-Anbieter an das Finanzamt melden", en: "DAC8: what crypto providers report to tax authorities" },
    summary: {
      de: "Seit 1. Januar 2026 sammeln Krypto-Anbieter in der EU deine Steuerdaten. Die erste Meldung für 2026 erfolgt bis zum 31. Juli 2027 in Deutschland und Österreich, der erste EU-weite Austausch bis zum 30. September 2027.",
      en: "Since 1 January 2026 crypto providers in the EU collect your tax data. The first report for 2026 is due by 31 July 2027 in Germany and Austria, and the first EU-wide exchange by 30 September 2027.",
    },
    details: [
      {
        de: "DAC8 ist keine neue Steuer. Sie sorgt dafür, dass Steuerbehörden Daten zu deinen Krypto-Geschäften automatisch erhalten und mit deiner Steuererklärung vergleichen können.",
        en: "DAC8 is not a new tax. It ensures that tax authorities receive data on your crypto transactions automatically and can compare them with your tax return.",
      },
      {
        de: "Der Anbieter holt eine Selbstauskunft von dir ein: Name, Anschrift, Steuerwohnsitz, Steuer-ID und Geburtsdatum. In Deutschland muss sie von Bestandskunden (Kunde am 31. Dezember 2025) bis zum 1. Januar 2027 vorliegen. Antwortest du nicht, muss der Anbieter nach Erinnerung und Aufforderung meldepflichtige Transaktionen frühestens 60 und spätestens 90 Tage nach der ersten Anfrage sperren.",
        en: "The provider collects a self-certification from you: name, address, tax residence, tax ID and date of birth. In Germany, existing customers (customers on 31 December 2025) must have provided it by 1 January 2027. If you do not respond, after a reminder and a formal request the provider must block reportable transactions no earlier than 60 and no later than 90 days after the first request.",
      },
      {
        de: "Gemeldet werden je Kryptowert Summen aus Käufen und Verkäufen gegen Euro oder andere Kryptowerte, aus Zahlungen für Waren und Dienstleistungen sowie aus Übertragungen. Übertragungen an externe Wallet-Adressen werden mit aggregiertem Marktwert und Einheiten erfasst. Einzelne Geschäfte werden nicht aufgelistet.",
        en: "Reported per crypto-asset are totals from purchases and sales against euro or other crypto-assets, from payments for goods and services, and from transfers. Transfers to external wallet addresses are captured with aggregated market value and units. Individual transactions are not itemised.",
      },
      {
        de: "Der Weg der Daten: Dein Anbieter meldet an die Steuerbehörde seines Meldelandes (Deutschland: Bundeszentralamt für Steuern, Österreich: Bundesministerium für Finanzen). Diese leitet die Daten bis zum 30. September 2027 an andere Staaten weiter, darunter dein Wohnsitzstaat. Das internationale Gegenstück heißt CARF (OECD). Ob Daten aus einem Nicht-EU-Land fließen, hängt davon ab, ob dieses Land teilnimmt.",
        en: "The data path: your provider reports to the tax authority of its reporting country (Germany: Federal Central Tax Office, Austria: Federal Ministry of Finance). That authority forwards the data to other states by 30 September 2027, including your country of residence. The international counterpart is CARF (OECD). Whether data flow from a non-EU country depends on whether that country participates.",
      },
      {
        de: "Für andere Startländer (Frankreich, Spanien, Italien, Niederlande, Malta, Zypern) haben wir den Umsetzungsstand noch nicht geprüft. Die EU-Termine gelten unabhängig davon.",
        en: "For the other launch countries (France, Spain, Italy, Netherlands, Malta, Cyprus) we have not yet checked the state of implementation. The EU deadlines apply regardless.",
      },
    ],
    sources: [
      { label: "EU-Kommission: DAC8", url: "https://taxation-customs.ec.europa.eu/taxation/tax-transparency-cooperation/administrative-co-operation-and-mutual-assistance/directive-administrative-cooperation-dac/dac8_en" },
      { label: "BZSt: Verfahren zum Kryptowerte-Steuertransparenzgesetz (KStTG)", url: "https://www.bzst.de/DE/Unternehmen/Intern_Informationsaustausch/DAC8/Verfahren/verfahren_node.html" },
      { label: "KPMG Österreich: Krypto-Meldepflichtgesetz (Sekundärquelle)", url: "https://kpmg.com/at/de/media/newsletter/tax-news/2026/04/tn-dac8-informationsaustausch-ueber-kryptowerte.html" },
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
  {
    slug: "what-providers-report",
    asOf: "2026-10-07",
    title: { de: "Wer sieht was? Welche Daten Krypto-Anbieter weitergeben", en: "Who sees what? Which data crypto providers pass on" },
    summary: {
      de: "Ein Krypto-Anbieter erhält deine Ausweisdaten und gibt sie nicht routinemäßig an Behörden weiter. Weitergegeben werden Steuerdaten (DAC8), Transferdaten an andere Anbieter (Travel Rule) und Daten bei Verdacht oder auf Anfrage einer Behörde.",
      en: "A crypto provider receives your ID data and does not pass it to authorities routinely. What is passed on are tax data (DAC8), transfer data to other providers (travel rule) and data in case of suspicion or on an authority's request.",
    },
    details: [
      {
        de: "1. Du an den Anbieter: Bei der Kontoeröffnung (KYC) liefern Ausweis, Anschrift und Steuerdaten an den Anbieter. Das ist Pflicht für zugelassene Anbieter und dient der Geldwäscheprävention.",
        en: "1. You to the provider: when opening an account (KYC) you provide ID, address and tax details to the provider. This is mandatory for authorised providers and serves anti-money-laundering purposes.",
      },
      {
        de: "2. Anbieter an Steuerbehörde (DAC8): einmal im Jahr, in Deutschland und Österreich bis 31. Juli. Inhalt: Identität, Steuer-ID und Summen je Kryptowert. Die Behörde leitet die Daten an andere Staaten weiter, auch an deinen Wohnsitzstaat (bis 30. September 2027 für das Jahr 2026).",
        en: "2. Provider to tax authority (DAC8): once a year, in Germany and Austria by 31 July. Content: identity, tax ID and totals per crypto-asset. The authority forwards the data to other states, including your country of residence (by 30 September 2027 for the year 2026).",
      },
      {
        de: "3. Anbieter an Anbieter (Travel Rule): bei jedem Transfer zwischen Anbietern reisen Angaben zu Absender und Empfänger mit. Bei Auszahlungen über 1.000 € auf eine eigene Wallet kann der Anbieter einen Nachweis verlangen, dass sie dir gehört.",
        en: "3. Provider to provider (travel rule): with every transfer between providers, details of sender and recipient travel with it. For withdrawals above €1,000 to your own wallet, the provider may ask for proof that it belongs to you.",
      },
      {
        de: "4. Anbieter an die Geldwäsche-Meldestelle: nur bei Verdacht. Der Anbieter darf dich darüber nicht informieren.",
        en: "4. Provider to the financial intelligence unit: only in case of suspicion. The provider may not inform you about it.",
      },
      {
        de: "5. Behörde an Anbieter: Auskunftsersuchen im Einzelfall, etwa von Steuer- oder Strafverfolgungsbehörden.",
        en: "5. Authority to provider: information requests in individual cases, for example from tax or law enforcement authorities.",
      },
      {
        de: "Deine Rechte gegenüber dem Anbieter: Auskunft über die gespeicherten Daten nach Art. 15 DSGVO. Die gesetzlichen Meldungen an Behörden kannst du nicht ausschließen.",
        en: "Your rights towards the provider: access to the stored data under Art. 15 GDPR. You cannot opt out of the statutory reports to authorities.",
      },
    ],
    sources: [
      { label: "EU-Kommission: DAC8", url: "https://taxation-customs.ec.europa.eu/taxation/tax-transparency-cooperation/administrative-co-operation-and-mutual-assistance/directive-administrative-cooperation-dac/dac8_en" },
      { label: "BZSt: Verfahren zum Kryptowerte-Steuertransparenzgesetz (KStTG)", url: "https://www.bzst.de/DE/Unternehmen/Intern_Informationsaustausch/DAC8/Verfahren/verfahren_node.html" },
      { label: "Transfer of Funds Regulation (EU) 2023/1113", url: "https://eur-lex.europa.eu/eli/reg/2023/1113/oj" },
      { label: "DSGVO Art. 15", url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj" },
    ],
  },
  {
    slug: "regulation-timeline",
    asOf: "2026-10-07",
    title: { de: "Krypto-Regulierung 2026 bis 2028: Was wann gilt", en: "Crypto regulation 2026 to 2028: what applies when" },
    summary: {
      de: "Bis Mitte 2027 kommen drei Einschnitte: die DAC8-Meldung (31. Juli 2027), die EU-Geldwäscheverordnung AMLR (10. Juli 2027) und der erste EU-Datenaustausch (30. September 2027). 2028 beginnt die direkte EU-Aufsicht über große grenzüberschreitende Finanzunternehmen.",
      en: "Three milestones arrive by mid-2027: the DAC8 report (31 July 2027), the EU anti-money-laundering regulation AMLR (10 July 2027) and the first EU data exchange (30 September 2027). In 2028 direct EU supervision of large cross-border financial firms begins.",
    },
    details: [
      {
        de: "30. Dezember 2024: Travel Rule gilt. Bei Transfers zwischen Anbietern reisen Absender- und Empfängerdaten mit.",
        en: "30 December 2024: the travel rule applies. Sender and recipient data travel with transfers between providers.",
      },
      {
        de: "1. Januar 2026: DAC8 gilt. Anbieter sammeln deine Steuerdaten per Selbstauskunft.",
        en: "1 January 2026: DAC8 applies. Providers collect your tax data through a self-certification.",
      },
      {
        de: "1. Juli 2026: Die MiCA-Übergangsfristen enden. Ohne Zulassung darf ein Anbieter in der EU keine Krypto-Dienste mehr erbringen.",
        en: "1 July 2026: the MiCA transition periods end. Without authorisation, a provider may no longer offer crypto services in the EU.",
      },
      {
        de: "1. Januar 2027 (Deutschland): Die Selbstauskunft von Bestandskunden muss vorliegen. Sonst droht die Sperre meldepflichtiger Transaktionen.",
        en: "1 January 2027 (Germany): the self-certification of existing customers must be on file. Otherwise reportable transactions may be blocked.",
      },
      {
        de: "10. Juli 2027: Die EU-Geldwäscheverordnung AMLR gilt. Anbieter dürfen keine anonymen Konten und keine Konten für Anonymitäts-Coins führen. Für Einzelgeschäfte ab 1.000 € gelten Sorgfaltspflichten. Eigene Wallets und Übertragungen unter Privatpersonen bleiben erlaubt. Der genaue Gesetzestext ist vor Veröffentlichung gegen EUR-Lex zu prüfen.",
        en: "10 July 2027: the EU anti-money-laundering regulation AMLR applies. Providers may not keep anonymous accounts or accounts for anonymity-enhancing coins. Due diligence applies to occasional transactions from €1,000. Your own wallets and transfers between private persons remain allowed. The exact legal text must be checked against EUR-Lex before publication.",
      },
      {
        de: "31. Juli 2027: Erste DAC8-Meldung für das Jahr 2026 in Deutschland und Österreich.",
        en: "31 July 2027: first DAC8 report for the year 2026 in Germany and Austria.",
      },
      {
        de: "30. September 2027: Erster EU-weiter Austausch der Daten zwischen den Steuerbehörden.",
        en: "30 September 2027: first EU-wide exchange of data between tax authorities.",
      },
      {
        de: "Ab Juli 2027 wählt die EU-Behörde AMLA die Unternehmen aus, die sie ab 2028 direkt beaufsichtigt (bis zu 40 Unternehmen mit Tätigkeit in mindestens sechs Mitgliedstaaten). Ob Krypto-Anbieter darunter sind, ist offen.",
        en: "From July 2027 the EU authority AMLA selects the firms it will supervise directly from 2028 (up to 40 firms active in at least six member states). Whether crypto providers are among them is open.",
      },
    ],
    sources: [
      { label: "EU-Kommission: DAC8", url: "https://taxation-customs.ec.europa.eu/taxation/tax-transparency-cooperation/administrative-co-operation-and-mutual-assistance/directive-administrative-cooperation-dac/dac8_en" },
      { label: "BZSt: Verfahren zum Kryptowerte-Steuertransparenzgesetz (KStTG)", url: "https://www.bzst.de/DE/Unternehmen/Intern_Informationsaustausch/DAC8/Verfahren/verfahren_node.html" },
      { label: "AMLR, Verordnung (EU) 2024/1624", url: "https://eur-lex.europa.eu/eli/reg/2024/1624/oj/eng" },
      { label: "AMLA: Erläuterung zur direkten Aufsicht", url: "https://www.amla.europa.eu/document/download/5aa923cc-eece-4cff-a9dd-4f687e88962b_en?filename=Explainer+-+Direct+Supervision+by+AMLA.pdf" },
      { label: "Transfer of Funds Regulation (EU) 2023/1113", url: "https://eur-lex.europa.eu/eli/reg/2023/1113/oj" },
      { label: "ESMA Statement Ende der Übergangsfristen (06/2026)", url: "https://www.esma.europa.eu/sites/default/files/2026-06/ESMA75-113276571-1710_Public_Statement_MiCA_transitional_period_ends.pdf" },
    ],
  },
];
