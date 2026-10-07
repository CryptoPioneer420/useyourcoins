/**
 * Quiz-Definition und State-Machine.
 * Das Quiz ist ein Filter, keine Beratung: keine Fragen zu Vermögen,
 * Anlagezielen oder Risikobereitschaft (Abgrenzung FMA/BaFin/CNMV).
 *
 * Ablauf: Einstieg über Hero-Buttons (Ziel = Karte | Börse | beides),
 * danach maximal 4 Fragen. Auf Länderseiten ist das Land vorbelegt.
 */
import type { CountryCode, I18n } from "./types";
import { LAUNCH_COUNTRIES } from "./types";
import { COUNTRY_NAMES, isLaunchCountry } from "./countries";

export type Goal = "card" | "exchange" | "both";
export type Holding = "exchange" | "own_wallet" | "new";
export type SpendAsset = "euro_balance" | "stablecoins" | "btc_eth";
export type Priority = "low_fees" | "cashback" | "no_lockup" | "regulation_privacy";

export interface QuizAnswers {
  goal: Goal;
  country: CountryCode;
  holding: Holding | null;
  spendAsset: SpendAsset | null;
  priority: Priority;
}

export type StepId = "country" | "holding" | "spendAsset" | "priority";

export interface QuizOption {
  value: string;
  label: I18n;
  hint?: I18n;
}

export interface QuizStep {
  id: StepId;
  question: I18n;
  help?: I18n;
  options: (answers: Partial<QuizAnswers>) => QuizOption[];
  visible: (answers: Partial<QuizAnswers>) => boolean;
}

export const OTHER_COUNTRY = "other" as const;

const wantsCard = (a: Partial<QuizAnswers>): boolean => a.goal === "card" || a.goal === "both";

export const QUIZ_STEPS: readonly QuizStep[] = [
  {
    id: "country",
    question: { de: "In welchem Land wohnst du?", en: "Which country do you live in?" },
    help: {
      de: "Verfügbarkeit und Steuern hängen vom Wohnsitz ab, nicht vom Urlaubsort.",
      en: "Availability and taxes depend on your residence, not where you travel.",
    },
    options: () => [
      ...LAUNCH_COUNTRIES.map((c) => ({ value: c, label: COUNTRY_NAMES[c] })),
      { value: OTHER_COUNTRY, label: { de: "Anderes Land", en: "Other country" } },
    ],
    visible: () => true,
  },
  {
    id: "holding",
    question: { de: "Wo liegen deine Kryptowerte heute?", en: "Where are your crypto assets today?" },
    options: () => [
      {
        value: "exchange",
        label: { de: "Auf einer Börse oder in einer App", en: "On an exchange or in an app" },
      },
      {
        value: "own_wallet",
        label: { de: "In meiner eigenen Wallet", en: "In my own wallet" },
        hint: { de: "z. B. MetaMask, Ledger, Safe", en: "e.g. MetaMask, Ledger, Safe" },
      },
      { value: "new", label: { de: "Ich fange gerade an", en: "I'm just starting" } },
    ],
    visible: wantsCard,
  },
  {
    id: "spendAsset",
    question: { de: "Womit möchtest du bezahlen?", en: "What do you want to pay with?" },
    help: {
      de: "Bei manchen Karten wird bei jeder Zahlung Krypto verkauft. Das kann steuerlich relevant sein.",
      en: "Some cards sell crypto on every payment. That can matter for taxes.",
    },
    options: () => [
      {
        value: "euro_balance",
        label: { de: "Euro-Guthaben (Krypto vorher verkaufen)", en: "Euro balance (sell crypto first)" },
      },
      {
        value: "stablecoins",
        label: { de: "Stablecoins (z. B. USDC, EURC, EURe)", en: "Stablecoins (e.g. USDC, EURC, EURe)" },
      },
      { value: "btc_eth", label: { de: "Bitcoin oder Ether direkt", en: "Bitcoin or Ether directly" } },
    ],
    visible: wantsCard,
  },
  {
    id: "priority",
    question: { de: "Was ist dir am wichtigsten?", en: "What matters most to you?" },
    options: (a) => {
      const lowFees: QuizOption = {
        value: "low_fees",
        label:
          a.goal === "exchange"
            ? { de: "Niedrige Gebühren", en: "Low fees" }
            : { de: "Niedrige Gebühren, auch im Ausland", en: "Low fees, also abroad" },
      };
      const regulation: QuizOption = {
        value: "regulation_privacy",
        label: {
          de: "EU-Regulierung und Datenschutz",
          en: "EU regulation and data protection",
        },
        hint: {
          de: "Anbieter mit EU-Zulassung und Datenverantwortlichem im EWR zuerst",
          en: "Providers with EU authorisation and an EEA data controller first",
        },
      };
      if (a.goal === "exchange") return [lowFees, regulation];
      return [
        lowFees,
        { value: "cashback", label: { de: "Cashback", en: "Cashback" } },
        {
          value: "no_lockup",
          label: { de: "Kein Staking oder Token-Lock-up", en: "No staking or token lock-up" },
        },
        regulation,
      ];
    },
    visible: () => true,
  },
];

export function visibleSteps(answers: Partial<QuizAnswers>, skip: ReadonlySet<StepId> = new Set()): QuizStep[] {
  return QUIZ_STEPS.filter((s) => s.visible(answers) && !skip.has(s.id));
}

export function isComplete(a: Partial<QuizAnswers>): a is QuizAnswers {
  if (!a.goal || !a.country || !a.priority) return false;
  if (wantsCard(a) && (!a.holding || !a.spendAsset)) return false;
  return true;
}

/** Fehlende Card-Felder bei goal = "exchange" auf null normalisieren. */
export function normalizeAnswers(a: QuizAnswers): QuizAnswers {
  if (a.goal === "exchange") return { ...a, holding: null, spendAsset: null };
  return a;
}

// ---------- State-Machine ----------

export type QuizStatus = "idle" | "in_progress" | "done" | "out_of_scope";

export interface QuizState {
  status: QuizStatus;
  answers: Partial<QuizAnswers>;
  stepIndex: number;
  /** Vorbelegte Schritte (z. B. Land auf Länderseite). */
  skip: StepId[];
}

export type QuizAction =
  | { type: "START"; goal: Goal; country?: CountryCode; priority?: Priority }
  | { type: "ANSWER"; step: StepId; value: string }
  | { type: "BACK" }
  | { type: "RESET" };

export const initialQuizState: QuizState = { status: "idle", answers: {}, stepIndex: 0, skip: [] };

const STEP_VALUES: Record<StepId, readonly string[]> = {
  country: [...LAUNCH_COUNTRIES, OTHER_COUNTRY],
  holding: ["exchange", "own_wallet", "new"],
  spendAsset: ["euro_balance", "stablecoins", "btc_eth"],
  priority: ["low_fees", "cashback", "no_lockup", "regulation_privacy"],
};

export function currentStep(state: QuizState): QuizStep | null {
  if (state.status !== "in_progress") return null;
  return visibleSteps(state.answers, new Set(state.skip))[state.stepIndex] ?? null;
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "START": {
      const answers: Partial<QuizAnswers> = { goal: action.goal };
      const skip: StepId[] = [];
      if (action.country) {
        answers.country = action.country;
        skip.push("country");
      }
      // Vorbelegte Priorität (Schnellpfade): nur wenn sie für das Ziel zulässig ist.
      if (action.priority) {
        const priorityStep = QUIZ_STEPS.find((x) => x.id === "priority")!;
        if (priorityStep.options(answers).some((o) => o.value === action.priority)) {
          answers.priority = action.priority;
          skip.push("priority");
        }
      }
      // Bleibt keine Frage übrig (z. B. Börse mit Land und Priorität), ist das Quiz sofort fertig.
      if (visibleSteps(answers, new Set(skip)).length === 0 && isComplete(answers)) {
        return { status: "done", answers, stepIndex: 0, skip };
      }
      return { status: "in_progress", answers, stepIndex: 0, skip };
    }
    case "ANSWER": {
      if (state.status !== "in_progress") return state;
      const step = currentStep(state);
      if (!step || step.id !== action.step) return state;
      if (!STEP_VALUES[action.step].includes(action.value)) return state;
      if (step.id === "priority" && !step.options(state.answers).some((o) => o.value === action.value)) {
        return state;
      }
      if (action.step === "country" && action.value === OTHER_COUNTRY) {
        return { ...state, status: "out_of_scope" };
      }
      const answers = { ...state.answers, [action.step]: normalizeValue(action.step, action.value) };
      const steps = visibleSteps(answers, new Set(state.skip));
      const nextIndex = state.stepIndex + 1;
      if (nextIndex >= steps.length && isComplete(answers)) {
        return { ...state, answers, stepIndex: nextIndex, status: "done" };
      }
      return { ...state, answers, stepIndex: nextIndex };
    }
    case "BACK": {
      if (state.status === "out_of_scope") return { ...state, status: "in_progress" };
      if (state.status === "done") return { ...state, status: "in_progress", stepIndex: state.stepIndex - 1 };
      return { ...state, stepIndex: Math.max(0, state.stepIndex - 1) };
    }
    case "RESET":
      return initialQuizState;
  }
}

function normalizeValue(step: StepId, value: string): string {
  if (step === "country" && isLaunchCountry(value)) return value.toUpperCase();
  return value;
}
