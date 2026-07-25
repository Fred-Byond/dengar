/**
 * Layer 3 — Behavioural scenario simulation (§8 Layer 3).
 *
 * Scenarios are delivered by the digital human as a short role-play. They
 * provide stronger evidence than self-report because the participant has to
 * act, not describe themselves.
 */

import type { CapabilityScore } from "./types";

export interface ScenarioSpec {
  id: string;
  title: string;
  /** What the digital human says to set the scene. */
  setup: string;
  /** The direct question that ends the setup. */
  ask: string;
  /** Follow-up probe if the first response is thin. */
  probe: string;
  /** Capabilities this scenario is designed to evidence. */
  capabilities: string[];
  /** Behaviours the rubric looks for, in observation order. */
  observed: string[];
  /** Climate constructs this response also informs. */
  climateSignals: string[];
}

export const SCENARIOS: ScenarioSpec[] = [
  {
    id: "missedDeadline",
    title: "Missed deadline",
    setup:
      "A colleague in another department has delayed a deliverable you depend on. Your own commitment to a customer is now at risk, and this is the second time it has happened.",
    ask: "What do you do next, and what exactly do you say to them?",
    probe: "And if the delay happens again the following week — what changes?",
    capabilities: ["communication", "empathy", "problemSolving", "assertiveness"],
    observed: [
      "Clarifies the facts before reacting",
      "Avoids immediate blame",
      "Communicates the downstream impact concretely",
      "Proposes a specific recovery action",
      "Preserves accountability rather than absorbing it silently",
      "Offers proportionate support",
    ],
    climateSignals: ["trust", "accountability", "collaboration"],
  },
  {
    id: "disagreeManager",
    title: "Disagreement with a manager",
    setup:
      "Your manager has decided to bring a launch date forward. You believe the new date creates a real operational risk that senior management cannot see from where they sit.",
    ask: "What do you do?",
    probe: "Suppose the decision stands after you raise it. What do you do then?",
    capabilities: ["assertiveness", "criticalThinking", "communication", "stress"],
    observed: [
      "Raises the concern rather than absorbing it",
      "Challenges the decision, not the person",
      "Brings evidence for the risk",
      "Judges escalation appropriately",
      "Maintains emotional control",
      "Commits to the decision once made, or states the residual risk",
    ],
    climateSignals: ["psychSafety", "leadershipOpenness", "conflict"],
  },
  {
    id: "departmentConflict",
    title: "Departmental conflict",
    setup:
      "Two departments are blaming each other for a failed handover to a customer. You are in the meeting where it surfaces, and both sides are describing the same events differently.",
    ask: "How do you handle the conversation?",
    probe: "What would you put in place so it does not happen a third time?",
    capabilities: ["empathy", "problemSolving", "criticalThinking", "communication"],
    observed: [
      "Takes both perspectives seriously",
      "Separates the process failure from the people",
      "Defines the actual breakdown point",
      "Stays neutral without avoiding the issue",
      "Moves the group to shared accountability",
      "Proposes a durable process fix",
    ],
    climateSignals: ["collaboration", "roleClarity", "conflict", "goalAlignment"],
  },
  {
    id: "overloadedColleague",
    title: "Overloaded colleague",
    setup:
      "A teammate tells you privately that they cannot complete their part of the work this week. Your own workload is already full, and the deadline is shared.",
    ask: "What do you say and what do you do?",
    probe: "What do you tell your manager, and when?",
    capabilities: ["empathy", "communication", "problemSolving", "stress"],
    observed: [
      "Clarifies what is actually blocked",
      "Responds to the person as well as the task",
      "Sets a realistic boundary",
      "Re-prioritises rather than absorbing everything",
      "Escalates early with a proposal, not a complaint",
    ],
    climateSignals: ["trust", "resilience", "inclusion"],
  },
  {
    id: "suddenChange",
    title: "Sudden change",
    setup:
      "Three days before delivery, the requirement changes materially. Half the work already done no longer applies, and the team is tired.",
    ask: "What are your first three moves?",
    probe: "How do you communicate it to the rest of the team?",
    capabilities: ["stress", "problemSolving", "communication", "criticalThinking"],
    observed: [
      "Re-establishes the facts quickly",
      "Re-prioritises explicitly rather than working harder",
      "Names the trade-off to the decision-maker",
      "Keeps the team informed",
      "Maintains steadiness under the pressure",
    ],
    climateSignals: ["resilience", "goalAlignment", "leadershipOpenness"],
  },
];

export const SCENARIO_BY_ID: Record<string, ScenarioSpec> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s])
);

/** Two scenarios per session in the MVP (§18) — chosen by diagnosis focus. */
export function scenariosForFocus(focusConstructIds: string[]): ScenarioSpec[] {
  const ranked = [...SCENARIOS].sort((a, b) => {
    const score = (s: ScenarioSpec) =>
      s.climateSignals.filter((c) => focusConstructIds.includes(c)).length;
    return score(b) - score(a);
  });
  return ranked.slice(0, 2);
}

/** Map an observation count onto the shared 1–5 capability anchor set. */
export function scoreFromObservations(
  observedCount: number,
  totalExpected: number
): CapabilityScore {
  if (totalExpected === 0) return "NE";
  const ratio = observedCount / totalExpected;
  if (ratio >= 0.85) return 5;
  if (ratio >= 0.65) return 4;
  if (ratio >= 0.45) return 3;
  if (ratio >= 0.2) return 2;
  return 1;
}
