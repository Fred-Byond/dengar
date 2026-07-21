/**
 * CVIF dimension rubrics — §5 of the Project Paper, encoded as data so the
 * dashboard, the scorer, and reviewer tooling all read from one source.
 *
 * Each dimension answers a distinct Ministry question and stays VISIBLE in
 * the dashboard rather than collapsing into one opaque master score.
 */

export interface RubricAnchor {
  score: string; // "+2", "5", "NE", "C", "Critical", …
  label: string;
  anchor: string;
}

export interface DimensionSpec {
  id: string;
  name: string;
  /** The Ministry question this dimension answers. */
  purpose: string;
  anchors: RubricAnchor[];
}

export const SENTIMENT: DimensionSpec = {
  id: "sentiment",
  name: "Sentiment Direction & Intensity",
  purpose:
    "Identify the citizen's evaluative position toward a specific issue or service. Sentiment attaches to an issue TARGET, never to the citizen as a permanent attribute.",
  anchors: [
    { score: "+2", label: "Strongly positive", anchor: "Clear praise or strong approval supported by a described experience." },
    { score: "+1", label: "Moderately positive", anchor: "Generally positive experience with limited or minor reservations." },
    { score: "0", label: "Neutral or mixed", anchor: "Factual, balanced, unclear, or materially positive and negative." },
    { score: "-1", label: "Moderately negative", anchor: "Dissatisfaction, frustration or concern with moderate intensity." },
    { score: "-2", label: "Strongly negative", anchor: "Severe anger, distress or strong dissatisfaction linked to the issue." },
    { score: "IE", label: "Insufficient evidence", anchor: "Transcript does not support a fair sentiment classification." },
  ],
};

export const CLARITY: DimensionSpec = {
  id: "clarity",
  name: "Issue Clarity",
  purpose:
    "Can the Ministry understand what happened, where, who/what was affected and why it matters? This is NOT a language-proficiency score.",
  anchors: [
    { score: "5", label: "Fully clear", anchor: "Issue, affected service, location/context and consequence are clear and coherent." },
    { score: "4", label: "Mostly clear", anchor: "Main issue clear, one minor element missing or uncertain." },
    { score: "3", label: "Identifiable", anchor: "A general issue is identifiable, but important details are limited." },
    { score: "2", label: "Vague", anchor: "Concern is vague, fragmented or difficult to operationalise." },
    { score: "1", label: "Incoherent", anchor: "No coherent issue can be identified." },
    { score: "NE", label: "Not elicited", anchor: "The session did not give a fair opportunity to explain the issue." },
    { score: "IE", label: "Insufficient evidence", anchor: "Transcript incomplete, corrupted or too unclear to score." },
  ],
};

export const EVIDENCE: DimensionSpec = {
  id: "evidence",
  name: "Evidence Strength",
  purpose:
    "Separate broad emotional statements from specific, decision-useful evidence. Determines how confidently the Ministry can use the claim — not whether the citizen deserves to be heard.",
  anchors: [
    { score: "1", label: "Unsupported general claim", anchor: "Broad opinion without event, timeframe or affected service." },
    { score: "2", label: "General personal experience", anchor: "Some context, but details remain limited or unverifiable." },
    { score: "3", label: "Specific incident", anchor: "Concrete office, service, event, timeframe or sequence." },
    { score: "4", label: "Specific supported experience", anchor: "Specific facts, repeated attempts, consequence, reference or corroborating detail." },
    { score: "5", label: "Documented / repeated pattern", anchor: "Multiple events, documentary references, several affected parties or independently checkable pattern." },
    { score: "IE", label: "Insufficient evidence", anchor: "Cannot reliably assess strength of evidence." },
  ],
};

export const IMPACT: DimensionSpec = {
  id: "impact",
  name: "Impact Severity",
  purpose:
    "Seriousness of the reported consequence — based on described impact, not emotional intensity alone.",
  anchors: [
    { score: "1", label: "Minor", anchor: "Minor inconvenience, preference or isolated delay. Aggregate & monitor." },
    { score: "2", label: "Repeated friction", anchor: "Repeated inconvenience, wasted time, small cost. Track by office/district." },
    { score: "3", label: "Material", anchor: "Material financial, employment, documentation or service-access impact. Prioritise for operational review." },
    { score: "4", label: "Serious", anchor: "Serious livelihood, rights, welfare, abuse, corruption or security impact. Human review & agency routing." },
    { score: "5", label: "Critical", anchor: "Immediate safety threat, ongoing criminal harm, self-harm risk or severe public-order concern. Urgent same-day escalation." },
    { score: "IE", label: "Insufficient evidence", anchor: "Impact cannot be determined fairly." },
  ],
};

export const ACTIONABILITY: DimensionSpec = {
  id: "actionability",
  name: "Request Actionability",
  purpose:
    "Has the citizen expressed a concrete improvement or desired outcome that can be clustered into a Ministry priority backlog?",
  anchors: [
    { score: "5", label: "Specific & implementable", anchor: "Specific, relevant, implementable request with a clear desired outcome." },
    { score: "4", label: "Clear request", anchor: "Clear request, but implementation details or constraints are limited." },
    { score: "3", label: "General direction", anchor: "General improvement direction is identifiable." },
    { score: "2", label: "Complaint only", anchor: "Complaint is clear but no concrete request is stated." },
    { score: "1", label: "None", anchor: "No identifiable improvement request." },
    { score: "NE", label: "Not elicited", anchor: "The digital Minister did not ask what improvement the citizen wanted." },
    { score: "IE", label: "Insufficient evidence", anchor: "Request cannot be interpreted with sufficient confidence." },
  ],
};

export const CONFIRMATION: DimensionSpec = {
  id: "confirmation",
  name: "Confirmation Status",
  purpose:
    "Did the citizen agree that the system's reflected summary accurately represented the concern?",
  anchors: [
    { score: "C", label: "Confirmed", anchor: "Highest confidence the summary reflects the citizen's intended meaning." },
    { score: "CC", label: "Confirmed with correction", anchor: "Use the corrected summary; preserve the correction in the audit trail." },
    { score: "NC", label: "Not confirmed", anchor: "Do not treat as validated; use only transcript-grounded fields." },
    { score: "NE", label: "Not elicited", anchor: "Session ended or timed out before confirmation." },
    { score: "IE", label: "Insufficient evidence", anchor: "Citizen response to confirmation was unclear." },
  ],
};

export const URGENCY: DimensionSpec = {
  id: "urgency",
  name: "Urgency & Escalation",
  purpose:
    "A routing decision combining severity, immediacy, vulnerability and the presence of an actionable threat.",
  anchors: [
    { score: "Normal", label: "Normal", anchor: "No immediate safety or legal risk. Aggregate analytics & normal review." },
    { score: "Priority", label: "Priority", anchor: "Material harm or repeated failure. Route to agency queue; weekly briefing." },
    { score: "Urgent", label: "Urgent", anchor: "Potential safety, abuse, crime, corruption or severe rights issue. Same-day human review." },
    { score: "Critical", label: "Critical", anchor: "Imminent threat to life, serious violence or self-harm. Trigger pre-approved emergency escalation; never automated handling alone." },
  ],
};

export const DIMENSIONS: DimensionSpec[] = [
  SENTIMENT, CLARITY, EVIDENCE, IMPACT, ACTIONABILITY, CONFIRMATION, URGENCY,
];

/**
 * §7.2 Excluded confounds — these must NEVER influence any score.
 * Citizens are not candidates; they are not judged as people.
 */
export const EXCLUDED_CONFOUNDS = [
  "Accent or dialect",
  "Language fluency or grammar",
  "Vocabulary or sophistication of language",
  "Speaking speed",
  "Emotion display or tone of voice",
  "Confidence, stress handling or charisma",
  "Perceived intelligence or social class",
] as const;

/**
 * Human-review triggers — §7 step 9. Any of these routes a session to a
 * Ministry reviewer / trained analyst regardless of automated scores.
 */
export const HUMAN_REVIEW_TRIGGERS = [
  "Low confidence on a high-severity issue",
  "Impact severity 4-5",
  "Urgency Urgent or Critical",
  "Abusive, illegal or safety-critical content",
  "Reputationally sensitive content",
  "Confirmation Not Confirmed (NC) on a material issue",
] as const;
