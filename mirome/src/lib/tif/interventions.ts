/**
 * Facilitator Recommendation Engine (§Component 5).
 *
 * Maps a diagnosis to intervention options. It SUPPORTS the facilitator; it
 * does not replace them — every recommendation carries its rationale and the
 * measure that will show whether it worked (§23.1: every finding must connect
 * to an objective, an action and a measure).
 */

export interface InterventionSpec {
  id: string;
  /** Climate construct this intervention answers. */
  constructId: string;
  /** The diagnostic finding this is the answer to. */
  trigger: string;
  /** Workshop objective, written as an outcome. */
  objective: string;
  /** Activities in delivery order. */
  activities: string[];
  /** Questions the facilitator asks in the room. */
  facilitatorPrompts: string[];
  /** What the facilitator watches for and records (§Component 8). */
  observationChecklist: string[];
  /** What management commits to after the room empties. */
  managerActions: string[];
  /** How the change is measured at reassessment (§4.6). */
  measure: string;
  /** Indicative delivery format. */
  format: string;
}

export const INTERVENTIONS: InterventionSpec[] = [
  {
    id: "iv-psych-safety",
    constructId: "psychSafety",
    trigger:
      "People can explain their ideas, but they do not challenge decisions from above.",
    objective:
      "Junior and mid-level staff raise a disagreement with a senior colleague in the room, and leaders demonstrably respond to it.",
    activities: [
      "Mistake-sharing protocol — leaders go first, naming a decision they got wrong",
      "Speaking-up ladder: rehearse raising a concern at three levels of directness",
      "Leader listening rounds — senior staff may only ask questions for 20 minutes",
      "Anonymous-to-attributed exercise: team converts anonymous themes into owned statements",
    ],
    facilitatorPrompts: [
      "What would have to be true for you to disagree with your manager in a meeting?",
      "Who in this room has changed a decision because someone junior pushed back?",
      "What happens here to the person who raises the awkward thing?",
    ],
    observationChecklist: [
      "Who speaks first after a senior person states a position",
      "Whether disagreement is addressed or deflected",
      "Whether leaders ask questions or defend",
      "Silence patterns by level and by department",
    ],
    managerActions: [
      "Leaders adopt a stated response protocol for challenge (acknowledge → explain → decide)",
      "Each manager names one decision they will consult on before deciding",
    ],
    measure:
      "Psychological safety index and the manager–staff gap on the same item at 30 and 60 days.",
    format: "Half-day workshop, mixed-level tables, leaders present throughout",
  },
  {
    id: "iv-cross-trust",
    constructId: "collaboration",
    trigger:
      "Trust is strong inside departments and weak across them; coordination fails at the handover.",
    objective:
      "Each cross-department dependency has a named owner, an agreed handover standard and a shared measure.",
    activities: [
      "Dependency mapping — every department maps what it needs and what it owes",
      "Handover simulation with a deliberately incomplete brief",
      "Shared-customer-outcome challenge: mixed teams solve one end-to-end case",
      "Handover standard drafting (what 'complete' means, per interface)",
    ],
    facilitatorPrompts: [
      "Walk me through the last request you sent to another department. What came back?",
      "What does the other side wish you had included?",
      "Which handover would you fix first if you could only fix one?",
    ],
    observationChecklist: [
      "Whether groups define the interface or defend their own function",
      "Whether they design for the customer or for their department",
      "Who volunteers to own a dependency",
    ],
    managerActions: [
      "Publish the dependency map and named owners within 14 days",
      "Add one shared cross-department measure to the next quarter",
    ],
    measure:
      "Collaboration and trust indices for cross-department items; count of escalations required.",
    format: "One-day cross-functional programme, mixed-department tables",
  },
  {
    id: "iv-role-clarity",
    constructId: "roleClarity",
    trigger:
      "Ownership of decisions and handovers is ambiguous; work stalls between roles.",
    objective:
      "Decision rights, ownership and escalation paths are documented and tested against real stalled work.",
    activities: [
      "RACI workshop on three real pieces of work that stalled recently",
      "Decision-rights mapping: which decisions need whom, and which do not",
      "Escalation design — when, to whom, and how fast",
      "Stall autopsy: replay one delayed deliverable and mark the boundary where it stopped",
    ],
    facilitatorPrompts: [
      "Who decided this? How did you find out?",
      "What decision are you making that someone else should be making?",
      "Where does work sit longest without an owner?",
    ],
    observationChecklist: [
      "Whether the group can name the decision-maker without debate",
      "Whether escalation is described as a route or as a failure",
      "Disagreement between levels on who owns what",
    ],
    managerActions: [
      "Publish a decision-rights table for the top ten recurring decisions",
      "Set an escalation SLA and communicate it",
    ],
    measure:
      "Role clarity index and stalled-work count reported at 30 and 60 days.",
    format: "Half-day working session per department cluster",
  },
  {
    id: "iv-conflict",
    constructId: "conflict",
    trigger:
      "Disagreement is avoided rather than resolved; issues resurface as delays.",
    objective:
      "The team has a shared protocol for disagreement and has used it on a live issue.",
    activities: [
      "Difficult-conversation role-play with the digital human, then with a peer",
      "Disagreement protocol drafting (how we raise, how we decide, how we commit)",
      "Live issue clinic: run one real unresolved disagreement through the protocol",
    ],
    facilitatorPrompts: [
      "What do you do when you disagree and the other person outranks you?",
      "What is the disagreement nobody in this room is naming?",
      "How do we know when a disagreement is closed?",
    ],
    observationChecklist: [
      "Whether disagreement is depersonalised",
      "Whether the group converges or defers",
      "Who withdraws when tension rises",
    ],
    managerActions: [
      "Adopt the disagreement protocol in the team's standing meeting",
      "Review one previously avoided issue within 30 days",
    ],
    measure:
      "Constructive conflict index; count of issues resolved at team level without escalation.",
    format: "Half-day workshop, intact teams",
  },
  {
    id: "iv-accountability",
    constructId: "accountability",
    trigger:
      "Agreed actions are not tracked to closure; follow-through depends on individuals.",
    objective:
      "Every commitment made in the programme has an owner, a date and a review point.",
    activities: [
      "Commitment tracking: convert discussion into owned actions in the room",
      "Peer accountability pairing across departments",
      "Action ownership clinic — rewrite vague actions until they are testable",
    ],
    facilitatorPrompts: [
      "What happens here when an agreed action is not delivered?",
      "Who will notice if this slips, and when?",
      "What are we deciding to stop doing to make room for this?",
    ],
    observationChecklist: [
      "Whether actions get named owners without prompting",
      "Whether dates are realistic or aspirational",
      "Whether underperformance is addressed or absorbed",
    ],
    managerActions: [
      "Standing action review in the weekly management meeting",
      "Publish action status to participants — closing the loop",
    ],
    measure: "Accountability index; on-time closure rate of programme actions.",
    format: "Integrated into every workshop close (45 minutes)",
  },
  {
    id: "iv-resilience",
    constructId: "resilience",
    trigger:
      "Under pressure the team fragments into individual coping rather than shared re-prioritisation.",
    objective:
      "The team can re-prioritise together under time pressure and communicate the trade-off upward.",
    activities: [
      "Crisis simulation with a mid-exercise requirement change",
      "Prioritisation challenge: more work than capacity, explicit trade-offs required",
      "Workload communication drill — say no with a proposal",
    ],
    facilitatorPrompts: [
      "When the requirement changed, what did you stop doing?",
      "Who told the customer, and when?",
      "What would have helped most in the first hour?",
    ],
    observationChecklist: [
      "Whether the group re-plans or works harder",
      "Whether trade-offs are named upward",
      "Emotional regulation under time pressure",
      "Who supports whom when the pressure lands",
    ],
    managerActions: [
      "Agree a re-prioritisation trigger and who can pull it",
      "Review capacity assumptions with the executive committee",
    ],
    measure: "Collective resilience index; stress-handling capability distribution.",
    format: "Half-day simulation, intact delivery teams",
  },
  {
    id: "iv-leadership-gap",
    constructId: "leadershipOpenness",
    trigger:
      "Leaders rate openness highly while employees report that input rarely changes a decision.",
    objective:
      "Leaders see the gap in their own data and commit to a visible change in how decisions are made.",
    activities: [
      "Facilitated dialogue on the anonymised employee themes",
      "Leadership reflection: each leader states what they heard and what surprised them",
      "Decision-consultation redesign for the three decisions employees named",
    ],
    facilitatorPrompts: [
      "Here is where your view and your team's view diverge most. What explains it?",
      "When did input last change your decision, and did people know?",
      "What will people see you do differently next month?",
    ],
    observationChecklist: [
      "Whether leaders explain or defend",
      "Whether commitments are specific and observable",
      "Whether employees present believe the commitment",
    ],
    managerActions: [
      "Each leader commits to one visible consultation change",
      "Explain the reasoning for the next significant decision in writing",
    ],
    measure:
      "Leadership openness index and the manager–staff perception gap at 30 and 60 days.",
    format: "Executive session, then joint session with employee representatives",
  },
  {
    id: "iv-goal-alignment",
    constructId: "goalAlignment",
    trigger:
      "Departmental targets compete, so cooperation costs individuals their own measures.",
    objective:
      "The conflicting measures are named and at least one shared outcome replaces or overrides them.",
    activities: [
      "Target-conflict mapping across departments",
      "Shared-outcome design workshop",
      "Trade-off negotiation: departments trade one measure each",
    ],
    facilitatorPrompts: [
      "Which of your targets makes it rational to say no to another department?",
      "What would you have to give up for the end-to-end outcome to improve?",
    ],
    observationChecklist: [
      "Whether departments defend measures or the customer outcome",
      "Whether executives resolve the conflict or leave it with the teams",
    ],
    managerActions: [
      "Executive committee resolves the named target conflicts",
      "Publish the shared outcome and its owner",
    ],
    measure: "Goal alignment index; cross-department escalation volume.",
    format: "Leadership offsite, half day",
  },
  {
    id: "iv-inclusion",
    constructId: "inclusion",
    trigger:
      "Airtime and influence concentrate in a subset of the team; others withdraw.",
    objective:
      "Meeting practice changes so contribution is distributed and recorded.",
    activities: [
      "Airtime audit in a live meeting simulation",
      "Round-robin and written-first meeting formats",
      "Contribution mapping: who was heard, who was cited",
    ],
    facilitatorPrompts: [
      "Who has not spoken yet, and what do they think?",
      "Whose idea was that originally?",
    ],
    observationChecklist: [
      "Airtime distribution by level, department and tenure",
      "Interruption patterns",
      "Whether contributions are attributed",
    ],
    managerActions: [
      "Adopt written-first for decision meetings",
      "Rotate meeting facilitation",
    ],
    measure: "Inclusion index; observed airtime distribution at the follow-up session.",
    format: "Two-hour module inside a wider programme",
  },
  {
    id: "iv-trust",
    constructId: "trust",
    trigger:
      "Commitments are not reliably honoured, so people build private buffers and duplicate work.",
    objective:
      "The team makes and keeps a small set of visible commitments to each other for 30 days.",
    activities: [
      "Reliability mapping: where do you build in a buffer, and why",
      "Commitment contracting between dependent pairs",
      "Blame-to-system reframing on two recent failures",
    ],
    facilitatorPrompts: [
      "Where do you add time because you cannot rely on the handover?",
      "What promise could you make that the other side would actually feel?",
    ],
    observationChecklist: [
      "Whether failures are attributed to people or to the system",
      "Whether commitments made are specific enough to fail visibly",
    ],
    managerActions: [
      "Review the commitment set at 30 days in public",
      "Remove one structural cause of unreliability",
    ],
    measure: "Trust index; buffer time reported by dependent teams.",
    format: "Half-day workshop, paired dependent teams",
  },
];

export const INTERVENTION_BY_CONSTRUCT: Record<string, InterventionSpec> =
  Object.fromEntries(INTERVENTIONS.map((i) => [i.constructId, i]));

export const INTERVENTION_BY_ID: Record<string, InterventionSpec> =
  Object.fromEntries(INTERVENTIONS.map((i) => [i.id, i]));

export function interventionFor(constructId: string): InterventionSpec | null {
  return INTERVENTION_BY_CONSTRUCT[constructId] ?? null;
}
