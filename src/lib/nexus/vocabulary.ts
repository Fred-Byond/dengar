/**
 * AUREN Nexus — the controlled vocabulary.
 *
 * Every threat signal is classified against these closed lists, and the lists
 * are the reason the whole thing works at scale:
 *
 *  1. SURFACE DISTANCE. AUREN's retest selector requires a scenario that shares
 *     no typology, channel, persona or product class with the one the learner
 *     failed. With free-text classification that comparison is a guess. With a
 *     closed vocabulary it is a set operation, and the retest stays honest as
 *     the corpus grows from two challenges to two hundred.
 *
 *  2. COVERAGE. "Which tactics can we rehearse, and which do we merely know
 *     about?" is only answerable if tactics are counted in the same units in
 *     every jurisdiction that contributes.
 *
 *  3. COMPARABILITY. A supervisory dashboard that aggregates across authorities
 *     is arithmetic on a shared vocabulary or it is nothing.
 *
 * Adding a term is a governance act, not a UI convenience: it changes what
 * "different enough" means for every retest already in the field.
 */

export interface VocabularyTerm {
  id: string;
  label: string;
  /** What a reviewer needs to know to classify consistently. */
  note: string;
}

/** WHAT the fraud is. The primary axis of surface distance. */
export const TYPOLOGIES: VocabularyTerm[] = [
  {
    id: "TYP-CLONE-FIRM",
    label: "Clone firm / unauthorised broker",
    note: "Impersonates an authorised entity, or invents one. Defeated by the register check.",
  },
  {
    id: "TYP-SYNTHETIC-ENDORSEMENT",
    label: "Synthetic or celebrity endorsement",
    note: "A public figure appears to back the offer. Includes generated video and audio.",
  },
  {
    id: "TYP-RELATIONSHIP-INVESTMENT",
    label: "Relationship-led investment fraud",
    note: "A relationship is built first and the offer arrives late. Long grooming window.",
  },
  {
    id: "TYP-AI-PERFORMANCE",
    label: "Automated-trading performance claim",
    note: "Returns attributed to an algorithm or model. The claim is capability, not licence.",
  },
  {
    id: "TYP-PRE-IPO",
    label: "Pre-IPO or private allocation",
    note: "Scarcity of access to an unlisted opportunity. Often paired with a deadline.",
  },
  {
    id: "TYP-RECOVERY",
    label: "Recovery fraud",
    note: "Targets people who already lost money. The second approach, not the first.",
  },
  {
    id: "TYP-AUTHORITY-IMPERSONATION",
    label: "Regulator or authority impersonation",
    note: "The attacker claims to BE the supervisor. Uniquely corrosive; handle with care.",
  },
  {
    id: "TYP-TASK-ONBOARDING",
    label: "Task-based onboarding",
    note: "Small paid tasks establish a pattern of deposits before the investment appears.",
  },
];

/** HOW it reaches the person. Second axis of surface distance. */
export const CHANNELS: VocabularyTerm[] = [
  { id: "CH-VOICE", label: "Voice call", note: "Live, synchronous, high pressure." },
  { id: "CH-VIDEO", label: "Video call", note: "Live with a face — carries synthetic-media risk." },
  { id: "CH-MESSAGING", label: "Messaging app", note: "Asynchronous, long grooming, group chats." },
  { id: "CH-SOCIAL-AD", label: "Social advertisement", note: "Paid placement; first contact is inbound." },
  { id: "CH-EMAIL", label: "Email", note: "Document-heavy, forged artefacts." },
  { id: "CH-IN-PERSON", label: "In person or seminar", note: "Social proof from a room of people." },
];

/** WHO appears to be speaking. Third axis — the persona the learner faces. */
export const PERSONAS: VocabularyTerm[] = [
  { id: "PER-INSTITUTIONAL", label: "Institutional professional", note: "Formal register, borrowed firm name." },
  { id: "PER-RETAIL-PEER", label: "Peer investor", note: "Presents as someone like the target." },
  { id: "PER-RELATIONSHIP", label: "Personal relationship", note: "Friend, partner or family framing." },
  { id: "PER-AUTHORITY", label: "Official or regulator", note: "Claims supervisory standing." },
  { id: "PER-SUPPORT", label: "Support or account agent", note: "Helpful framing; extracts through assistance." },
];

/** WHAT is nominally being sold. Fourth axis. */
export const PRODUCT_CLASSES: VocabularyTerm[] = [
  { id: "PC-MANAGED", label: "Managed account", note: "Funds handed over to be traded." },
  { id: "PC-TOKEN", label: "Token or digital asset", note: "On-chain settlement, irreversible." },
  { id: "PC-EQUITY", label: "Equity or pre-IPO stock", note: "Unlisted shares in a named company." },
  { id: "PC-FUND", label: "Fund or collective scheme", note: "Pooled vehicle with a prospectus-like artefact." },
  { id: "PC-FX-CFD", label: "FX or contracts for difference", note: "Leverage; losses exceed deposits." },
];

/** Confidence in the signal itself, declared by the submitting authority. */
export const CONFIDENCE = ["corroborated", "single-source", "unverified"] as const;
export type Confidence = (typeof CONFIDENCE)[number];

/**
 * Sharing marking, on the traffic-light protocol authorities already use.
 * This governs who may SEE the signal, and is independent of whether the
 * objects derived from it may be DEPLOYED — a RED signal can still produce a
 * released challenge, because the challenge no longer carries the source.
 */
export const SHARING = ["CLEAR", "GREEN", "AMBER", "RED"] as const;
export type Sharing = (typeof SHARING)[number];

export function term(list: VocabularyTerm[], id: string): VocabularyTerm | undefined {
  return list.find((t) => t.id === id);
}

export function label(list: VocabularyTerm[], id: string): string {
  return term(list, id)?.label ?? id;
}

/**
 * Surface distance between two classified things, 0–4.
 *
 * AUREN's doctrine is that a retest proves transfer only when it shares
 * nothing with the scenario the learner failed. This is that rule, computed
 * rather than asserted: 4 means every axis differs.
 */
export interface Surface {
  typology: string;
  channel: string;
  persona: string;
  productClass: string;
}

export function surfaceDistance(a: Surface, b: Surface): number {
  let d = 0;
  if (a.typology !== b.typology) d += 1;
  if (a.channel !== b.channel) d += 1;
  if (a.persona !== b.persona) d += 1;
  if (a.productClass !== b.productClass) d += 1;
  return d;
}

/** The threshold AUREN requires of a retest. Below this, transfer is not proven. */
export const RETEST_MIN_DISTANCE = 4;
