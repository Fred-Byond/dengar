/**
 * Fixed workplace theme taxonomy + intervention-owner routing.
 *
 * Themes are what participants talk about. Constructs are what the framework
 * measures. Keeping them separate stops the analysis from quietly renaming a
 * symptom as a diagnosis (§2.1).
 */

export interface ThemeSpec {
  id: string;
  label: string;
  /** Climate constructs this theme most often signals. */
  signals: string[];
  keywords: string[];
}

export const THEMES: ThemeSpec[] = [
  {
    id: "handovers",
    label: "Handovers & dependencies",
    signals: ["collaboration", "roleClarity", "accountability"],
    keywords: ["handover", "hand-off", "dependency", "waiting on", "chase", "follow up"],
  },
  {
    id: "decisionRights",
    label: "Decision rights & escalation",
    signals: ["roleClarity", "leadershipOpenness"],
    keywords: ["who decides", "sign off", "approval", "escalate", "authority", "stuck"],
  },
  {
    id: "speakingUp",
    label: "Speaking up & upward feedback",
    signals: ["psychSafety", "leadershipOpenness", "inclusion"],
    keywords: ["speak up", "raise", "disagree", "afraid", "senior", "pushback"],
  },
  {
    id: "meetings",
    label: "Meeting quality & airtime",
    signals: ["inclusion", "conflict", "psychSafety"],
    keywords: ["meeting", "airtime", "interrupt", "quiet", "dominate", "agenda"],
  },
  {
    id: "workload",
    label: "Workload & prioritisation",
    signals: ["resilience", "goalAlignment", "trust"],
    keywords: ["workload", "overload", "priority", "capacity", "burnout", "bandwidth"],
  },
  {
    id: "targets",
    label: "Competing targets",
    signals: ["goalAlignment", "collaboration"],
    keywords: ["target", "kpi", "incentive", "quota", "measure", "conflicting"],
  },
  {
    id: "recognition",
    label: "Recognition & fairness",
    signals: ["inclusion", "trust", "accountability"],
    keywords: ["credit", "recognition", "unfair", "blame", "favouritism"],
  },
  {
    id: "change",
    label: "Change & communication",
    signals: ["resilience", "leadershipOpenness", "trust"],
    keywords: ["change", "restructure", "announcement", "communication", "uncertainty"],
  },
  {
    id: "conflictHandling",
    label: "Unresolved disagreement",
    signals: ["conflict", "psychSafety"],
    keywords: ["conflict", "argument", "tension", "avoid", "passive", "silent"],
  },
  {
    id: "newJoiners",
    label: "Onboarding & new-team integration",
    signals: ["roleClarity", "inclusion", "trust"],
    keywords: ["onboard", "new joiner", "induction", "buddy", "first six months"],
  },
];

export const THEME_BY_ID: Record<string, ThemeSpec> = Object.fromEntries(
  THEMES.map((t) => [t.id, t])
);

/** Who owns the follow-through when an action is assigned (§Component 5). */
export interface OwnerSpec {
  id: string;
  name: string;
}

export const OWNERS: OwnerSpec[] = [
  { id: "hrbp", name: "HR Business Partner" },
  { id: "od", name: "Organisational Development" },
  { id: "lineMgmt", name: "Line management (department head)" },
  { id: "exco", name: "Executive committee" },
  { id: "facilitator", name: "Programme facilitator" },
  { id: "lnd", name: "Learning & Development" },
  { id: "pmo", name: "Operations / PMO" },
];

/** Default owner per climate construct — a suggestion the user can override. */
export const CONSTRUCT_OWNER: Record<string, string> = {
  psychSafety: "exco",
  trust: "lineMgmt",
  roleClarity: "pmo",
  goalAlignment: "exco",
  collaboration: "pmo",
  conflict: "facilitator",
  leadershipOpenness: "exco",
  inclusion: "hrbp",
  accountability: "lineMgmt",
  resilience: "od",
};

export function detectThemes(text: string): string[] {
  const lower = text.toLowerCase();
  const hits = THEMES.filter((t) =>
    t.keywords.some((k) => lower.includes(k))
  ).map((t) => t.id);
  return hits.length ? Array.from(new Set(hits)) : [];
}
