/**
 * FVIF dimension rubrics — encoded as data so the dashboard, the scorer and
 * the fan-care review tooling all read from one source.
 *
 * Each dimension answers a distinct question Messi's team would actually ask,
 * and stays VISIBLE in the dashboard rather than collapsing into one opaque
 * "fan score". There is deliberately no master score: a single number would
 * turn a relationship platform into a ranking system.
 */

export interface RubricAnchor {
  score: string; // "+2", "5", "NE", "C", "Critical", …
  label: string;
  anchor: string;
}

export interface DimensionSpec {
  id: string;
  name: string;
  /** The question this dimension answers for Messi and his management. */
  purpose: string;
  anchors: RubricAnchor[];
}

export const SENTIMENT: DimensionSpec = {
  id: "sentiment",
  name: "Sentiment & Emotional Register",
  purpose:
    "Identify the fan's emotional position toward a specific TARGET inside the conversation — a moment, a setback, a hope. Sentiment attaches to the target, never to the fan as a permanent attribute.",
  anchors: [
    { score: "+2", label: "Joy / deep gratitude", anchor: "Strong positive emotion tied to a described experience or memory." },
    { score: "+1", label: "Warm / hopeful", anchor: "Generally positive, appreciative or optimistic register." },
    { score: "0", label: "Neutral or mixed", anchor: "Factual, curious, balanced, or materially positive and negative." },
    { score: "-1", label: "Discouraged", anchor: "Doubt, disappointment or low confidence with moderate intensity." },
    { score: "-2", label: "Distressed", anchor: "Grief, fear or acute distress linked to the described situation." },
    { score: "IE", label: "Insufficient evidence", anchor: "Transcript does not support a fair emotional reading." },
  ],
};

export const INTENT_CLARITY: DimensionSpec = {
  id: "intentClarity",
  name: "Intent Clarity",
  purpose:
    "Can the team understand what the fan actually came for — the question behind the question? This is NOT a language-proficiency score and never penalises a child or a non-native speaker.",
  anchors: [
    { score: "5", label: "Fully clear", anchor: "The ask, the situation behind it and what a good answer looks like are all clear." },
    { score: "4", label: "Mostly clear", anchor: "Main intent clear, one element missing or uncertain." },
    { score: "3", label: "Identifiable", anchor: "A general intent is identifiable but the specifics are thin." },
    { score: "2", label: "Vague", anchor: "The fan spoke, but the intent is fragmented or hard to act on." },
    { score: "1", label: "Unformed", anchor: "No coherent intent can be identified from the conversation." },
    { score: "NE", label: "Not elicited", anchor: "Digital Messi never gave a fair opening for the fan to say why they came." },
    { score: "IE", label: "Insufficient evidence", anchor: "Transcript incomplete, corrupted or too unclear to score." },
  ],
};

export const CONTEXT_DEPTH: DimensionSpec = {
  id: "contextDepth",
  name: "Personal Context Depth",
  purpose:
    "Separate broad admiration from a specific lived situation. Determines how usable the conversation is as evidence about a real fan need — not whether the fan deserves attention. Every fan deserves attention.",
  anchors: [
    { score: "1", label: "General admiration", anchor: "Praise or excitement with no situation attached." },
    { score: "2", label: "Light personal context", anchor: "Some context about the fan's life, but thin or generic." },
    { score: "3", label: "Specific situation", anchor: "A concrete circumstance: a team, a trial, an injury, a school, a match." },
    { score: "4", label: "Situation with stakes", anchor: "Specific circumstance plus what depends on it and what has already been tried." },
    { score: "5", label: "Sustained personal narrative", anchor: "A developed story across time — repeated attempts, family context, a milestone with a date." },
    { score: "IE", label: "Insufficient evidence", anchor: "Cannot reliably assess the depth of context." },
  ],
};

export const SIGNIFICANCE: DimensionSpec = {
  id: "significance",
  name: "Relationship Significance",
  purpose:
    "How much this moment matters in the fan's life — based on the described stakes, not on emotional volume, and never on what the fan pays.",
  anchors: [
    { score: "1", label: "Curiosity", anchor: "A light question or a fun exchange. Aggregate and enjoy." },
    { score: "2", label: "Meaningful moment", anchor: "A memorable personal moment for the fan. Worth a warm, personalised close." },
    { score: "3", label: "Live personal goal", anchor: "Tied to something the fan is actively working toward. Candidate for continuity and MESSI ACADEMY follow-up." },
    { score: "4", label: "Milestone or hardship", anchor: "A trial, a loss, an illness, a family milestone. Candidate for Lionel's own 30-second response." },
    { score: "5", label: "Life-defining", anchor: "The fan frames this as one of the most important moments of their life. Human review before any public use." },
    { score: "IE", label: "Insufficient evidence", anchor: "Significance cannot be determined fairly." },
  ],
};

export const ACTIONABILITY: DimensionSpec = {
  id: "actionability",
  name: "Content Actionability",
  purpose:
    "Did the fan express something Messi's world can actually make, do or answer — a story, a drill, an academy module, a response, an experience?",
  anchors: [
    { score: "5", label: "Specific & producible", anchor: "A clear, specific request that maps to an existing MESSI.LIVE experience or a producible piece of content." },
    { score: "4", label: "Clear request", anchor: "Clear request, but format or scope still needs a decision." },
    { score: "3", label: "General direction", anchor: "A theme the fan wants more of is identifiable." },
    { score: "2", label: "Expression only", anchor: "The fan shared or asked, but there is no thing to make." },
    { score: "1", label: "None", anchor: "No identifiable content or product signal." },
    { score: "NE", label: "Not elicited", anchor: "Digital Messi never asked what the fan would like to hear or learn next." },
    { score: "IE", label: "Insufficient evidence", anchor: "Request cannot be interpreted with sufficient confidence." },
  ],
};

export const CONFIRMATION: DimensionSpec = {
  id: "confirmation",
  name: "Continuity Confirmation",
  purpose:
    "Did the fan agree that the reflected summary was right — the gate that decides whether a memory may be carried into the next conversation?",
  anchors: [
    { score: "C", label: "Confirmed", anchor: "Highest confidence the summary reflects the fan's meaning. Memory may be stored if consent was given." },
    { score: "CC", label: "Confirmed with correction", anchor: "Store the corrected version; preserve the correction in the audit trail." },
    { score: "NC", label: "Not confirmed", anchor: "Do not treat as validated and do not carry into memory. Transcript-grounded fields only." },
    { score: "NE", label: "Not elicited", anchor: "The five minutes ended before the confirm step." },
    { score: "IE", label: "Insufficient evidence", anchor: "The fan's response to the confirmation was unclear." },
  ],
};

export const CARE: DimensionSpec = {
  id: "care",
  name: "Care & Escalation",
  purpose:
    "A duty-of-care routing decision combining distress, vulnerability, the age band of the fan and the presence of a real-world risk. Never a sentiment label.",
  anchors: [
    { score: "Normal", label: "Normal", anchor: "No welfare concern. Aggregate analytics and normal curation." },
    { score: "Watch", label: "Watch", anchor: "Discouragement, bullying or persistent low confidence in a young fan. Route to the fan-care queue; consider a MESSI INSPIRES follow-up." },
    { score: "Care", label: "Care", anchor: "Disclosed hardship, illness, bereavement or a safety concern. Same-day human review by a trained fan-care officer; localised support signposting." },
    { score: "Critical", label: "Critical", anchor: "Disclosure of self-harm risk, abuse or imminent danger. Trigger the pre-approved safeguarding protocol — never automated handling alone, never a scripted avatar reply." },
  ],
};

export const DIMENSIONS: DimensionSpec[] = [
  SENTIMENT, INTENT_CLARITY, CONTEXT_DEPTH, SIGNIFICANCE, ACTIONABILITY, CONFIRMATION, CARE,
];

/**
 * Excluded confounds — these must NEVER influence any FVIF score.
 * Fans are not candidates, customers-to-be-ranked, or leads.
 */
export const EXCLUDED_CONFOUNDS = [
  "Membership tier, spend or lifetime value",
  "Accent, dialect or language fluency",
  "Vocabulary or sophistication of language",
  "Speaking speed or hesitation",
  "Emotional volume or tone of voice",
  "Follower count, fame or social reach",
  "Country, market size or partner value",
  "Perceived football knowledge",
] as const;

/**
 * Human-review triggers. Any of these routes a conversation to a trained
 * fan-care reviewer regardless of the automated scores.
 */
export const HUMAN_REVIEW_TRIGGERS = [
  "Care level Care or Critical",
  "Relationship significance 5 (life-defining)",
  "Any conversation with a fan in the under-13 age band flagged for content use",
  "Low confidence on a high-significance conversation",
  "Brand-sensitive or reserved-category content",
  "Continuity not confirmed (NC) on a memory candidate",
  "Any record proposed for Lionel's personal response queue",
] as const;

/**
 * Disclosure and governance invariants that hold on every single conversation,
 * independent of market, tier or partner (slide 19).
 */
export const PLATFORM_INVARIANTS = [
  "Every session discloses, before it begins, that this is an official AI-powered digital representation of Lionel Messi.",
  "Digital Messi never makes promises, endorsements or claims on Lionel's behalf.",
  "No medical, legal, financial or transfer/contract commentary — those are reserved categories.",
  "Under-18 sessions run inside the children's environment with verified parental consent and age-appropriate scripts.",
  "Memory is opt-in, reviewable by the fan, and erasable on request.",
  "Management holds likeness, voice, content, campaign and partner approval, plus emergency shutdown authority.",
] as const;
