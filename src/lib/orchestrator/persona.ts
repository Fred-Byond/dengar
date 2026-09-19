/**
 * AUREN — the persona manifest.
 *
 * The digital human is the product's face, and a face is the easiest thing in
 * the system to change carelessly. Swap the avatar, warm up the tone, give the
 * coach a nickname — none of that looks like a governance event, and all of it
 * changes what a learner experiences.
 *
 * THE RULE:
 *
 *   Changing the face, the voice or the personality must not change the
 *   approved knowledge, the competency threshold or the safety boundaries.
 *
 * So personality is four separable layers, three of which are configurable and
 * one of which is not. A manifest that tries to loosen the fixed layer is
 * rejected at validation rather than at a post-mortem.
 *
 * WHY A MANIFEST RATHER THAN A SYSTEM PROMPT.
 *
 * A system prompt is a paragraph somebody edited. It has no version, no
 * approver, no diff anyone reviewed, and no way to tell afterwards which
 * wording was live when a given session ran. A manifest is an object: it
 * carries a version, an approval status and an owner, it renders through the
 * same delivery layer every time, and two sessions on the same manifest version
 * are comparable. That is the difference between a personality and a
 * reproducible one.
 */

/* ═══════════════════════════════════════════════════════════════════════
   LAYER 1 — CORE IDENTITY. Not configurable, by anybody.
   ═════════════════════════════════════════════════════════════════════ */

/**
 * The principles that hold across every persona, every tenant and every
 * language. They are constants rather than manifest fields specifically so
 * that no manifest can express their absence.
 */
export const CORE_IDENTITY = [
  { id: "calm", statement: "Calm. Never raises the temperature of a conversation that is already hot." },
  { id: "respectful", statement: "Respectful. The learner is an adult who was targeted, not a fool who was caught." },
  { id: "non_judgmental", statement: "Non-judgmental about the person; exacting about the behaviour." },
  { id: "evidence_led", statement: "Evidence-led. Says nothing about the learner it cannot quote back to them." },
  { id: "protective", statement: "Protective, not paternalistic. Returns the decision to the learner every time." },
  { id: "non_promotional", statement: "Never financially promotional. Names no product, favours no institution." },
  { id: "honest_uncertainty", statement: "Transparent about uncertainty. Says 'that was not tested' rather than filling the gap." },
] as const;

/* ═══════════════════════════════════════════════════════════════════════
   LAYER 2 — COMMUNICATION STYLE. Configurable presentation.
   ═════════════════════════════════════════════════════════════════════ */

export const STYLES = [
  { id: "warm_mentor", label: "Warm mentor", note: "Longer sentences, more acknowledgement, slower to correct." },
  { id: "direct_examiner", label: "Direct examiner", note: "Short, neutral, no reassurance that has not been earned." },
  { id: "patient_educator", label: "Patient educator", note: "Explains twice in different words before moving on." },
  { id: "youth_coach", label: "Youth-oriented coach", note: "Concrete, quick, no institutional register." },
  { id: "senior_guide", label: "Senior-citizen guide", note: "Unhurried, repeats the key action, never implies decline." },
  { id: "compliance_trainer", label: "Professional compliance trainer", note: "Procedural, cites the rule, assumes a working context." },
] as const;

/* ═══════════════════════════════════════════════════════════════════════
   LAYER 3 — FUNCTIONAL ROLE. What the digital human is doing right now.
   ═════════════════════════════════════════════════════════════════════ */

/**
 * The role fixes the generation mode, which is the mechanism that stops a
 * costume change from becoming a permissions change. A persona rendered as a
 * "concerned friend" is still operating under the coaching ceiling; a
 * "fraudulent recruiter" is still inside a scenario graph.
 */
export const ROLES = [
  { id: "teacher", label: "Teacher", modeId: "educate", adversarial: false },
  { id: "interviewer", label: "Interviewer", modeId: "assess", adversarial: false },
  { id: "coach", label: "Coach", modeId: "coach", adversarial: false },
  { id: "assessor", label: "Assessor", modeId: "assess", adversarial: false },
  { id: "adversary", label: "Scam adversary", modeId: "roleplay", adversarial: true },
  { id: "bank_rep", label: "Bank representative", modeId: "roleplay", adversarial: true },
  { id: "concerned_friend", label: "Concerned friend", modeId: "roleplay", adversarial: true },
  { id: "recruiter", label: "Fraudulent recruiter", modeId: "roleplay", adversarial: true },
  { id: "handover", label: "Human-review handover assistant", modeId: "high_risk", adversarial: false },
] as const;

export function roleOf(id: string) {
  return ROLES.find((r) => r.id === id);
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYER 4 — EMOTIONAL STATE. Controlled adaptation, not free affect.
   ═════════════════════════════════════════════════════════════════════ */

/**
 * A closed list, because "responds naturally to emotion" is how a coach ends up
 * sounding disappointed in somebody who has just been defrauded. Each state
 * declares what triggers it, so the adaptation is inspectable rather than
 * emergent.
 */
export const EMOTIONS = [
  { id: "encouraging", label: "Encouraging", trigger: "Effort was made, regardless of outcome." },
  { id: "firm", label: "Firm", trigger: "An unsafe behaviour is being corrected." },
  { id: "calm", label: "Calm", trigger: "Distress is detected. Overrides every other state." },
  { id: "sceptical", label: "Sceptical", trigger: "A verification exercise is running." },
  { id: "neutral", label: "Neutral", trigger: "A formal assessment is in progress." },
] as const;

/** Distress outranks everything. Not a preference — a safety ordering. */
export const EMOTION_PRECEDENCE = ["calm", "neutral", "firm", "sceptical", "encouraging"];

/* ═══════════════════════════════════════════════════════════════════════
   THE MANIFEST
   ═════════════════════════════════════════════════════════════════════ */

export interface PersonaManifest {
  id: string;
  name: string;
  version: string;
  status: "DRAFT" | "APPROVED" | "RETIRED";
  /** Roles that signed it. Identity lives on the release event, as everywhere. */
  approverRoles: string[];

  roleId: string;
  styleId: string;
  purpose: string;
  audience: string;

  /** Delivery parameters the renderer consumes. */
  delivery: {
    /** Words per minute. Slower for senior cohorts, and it is a governed number. */
    pace: number;
    /** Emotional states this persona may enter. Subset of EMOTIONS. */
    emotionalRange: string[];
    /** Gestures and expressions the renderer is cleared to use. */
    expressions: string[];
    /** Language variants this manifest is approved to speak in. */
    languages: string[];
  };

  /** Adversarial personas only. 0 for everything else. */
  pressureCeiling: number;
  /** Conduct refused by this persona specifically, on top of the global bans. */
  prohibitedConduct: string[];
  /** When this persona must stop and hand to a human. */
  handoverConditions: string[];
}

/** Conduct no manifest may permit, in any role, for any tenant. */
export const PROHIBITED_ALWAYS = [
  "Threaten the learner",
  "Continue after distress is detected",
  "Introduce a financial product that is not in the scenario",
  "Request real personal, account or payment details",
  "Produce a working payment link or address",
  "Exceed the approved pressure ceiling",
  "Claim to be a licensed adviser",
  "State or imply a prediction or guaranteed return",
];

export interface ManifestFinding {
  field: string;
  detail: string;
  blocking: boolean;
}

/**
 * Check a manifest before it can render a single frame.
 *
 * The checks that matter are the ones asserting a manifest cannot *loosen*
 * anything. A configuration layer that can widen a safety boundary is not a
 * configuration layer; it is an authoring tool with a friendly name.
 */
export function checkManifest(m: PersonaManifest): ManifestFinding[] {
  const out: ManifestFinding[] = [];
  const role = roleOf(m.roleId);

  if (!role) {
    out.push({
      field: "roleId",
      detail: `Unknown role "${m.roleId}". The role fixes the generation mode, so a manifest without one has no ceiling.`,
      blocking: true,
    });
  }

  if (!STYLES.some((s) => s.id === m.styleId)) {
    out.push({ field: "styleId", detail: `Unknown communication style "${m.styleId}".`, blocking: true });
  }

  const strayEmotions = m.delivery.emotionalRange.filter((e) => !EMOTIONS.some((x) => x.id === e));
  if (strayEmotions.length) {
    out.push({
      field: "emotionalRange",
      detail: `Unrecognised emotional states: ${strayEmotions.join(", ")}. The list is closed because "responds naturally" is how a coach ends up sounding disappointed in somebody who has just been defrauded.`,
      blocking: true,
    });
  }

  if (!m.delivery.emotionalRange.includes("calm")) {
    out.push({
      field: "emotionalRange",
      detail:
        "Every persona must be able to enter the calm state, because distress can arrive in any conversation and calm is the response to it. A persona that cannot be calm cannot be deployed.",
      blocking: true,
    });
  }

  if (role?.adversarial) {
    if (m.pressureCeiling <= 0) {
      out.push({
        field: "pressureCeiling",
        detail: "An adversarial persona with no ceiling. The gate refuses a ladder whose ceiling nobody set.",
        blocking: true,
      });
    }
    if (m.handoverConditions.length === 0) {
      out.push({
        field: "handoverConditions",
        detail:
          "No handover conditions. An adversary with no exit is a pressure source with no off switch, which is the failure the distress exit exists to prevent.",
        blocking: true,
      });
    }
  } else if (m.pressureCeiling !== 0) {
    out.push({
      field: "pressureCeiling",
      detail: `A non-adversarial role carries a pressure ceiling of ${m.pressureCeiling}. Pressure outside role-play is not a configuration — it is the coach turning on the learner.`,
      blocking: true,
    });
  }

  const missing = PROHIBITED_ALWAYS.filter((p) => !m.prohibitedConduct.includes(p));
  if (missing.length) {
    out.push({
      field: "prohibitedConduct",
      detail: `Does not carry ${missing.length} of the always-prohibited items (${missing[0]}${missing.length > 1 ? ", …" : ""}). They are reasserted on every manifest deliberately: a reviewer reads the manifest, not the constant, and an omission here is the one they would not notice.`,
      blocking: true,
    });
  }

  if (m.delivery.pace < 90 || m.delivery.pace > 185) {
    out.push({
      field: "pace",
      detail: `${m.delivery.pace} wpm is outside the deployable band. Too fast and a senior cohort loses the verification step; too slow and the adversary stops being credible.`,
      blocking: false,
    });
  }

  if (m.delivery.languages.length === 0) {
    out.push({ field: "languages", detail: "No approved language variants.", blocking: true });
  }

  if (m.status === "APPROVED" && m.approverRoles.length === 0) {
    out.push({
      field: "approverRoles",
      detail: "Approved with no approving role recorded. Nobody is accountable for how this persona behaves.",
      blocking: true,
    });
  }

  return out;
}

export function manifestDeployable(m: PersonaManifest): boolean {
  return m.status === "APPROVED" && checkManifest(m).every((f) => !f.blocking);
}

/** The generation mode a manifest runs under. Derived, never declared. */
export function modeForManifest(m: PersonaManifest): string {
  return roleOf(m.roleId)?.modeId ?? "high_risk";
}

/**
 * Resolve the emotional state for a turn.
 *
 * Distress wins outright; formal assessment is next, because a warm assessor is
 * an assessor giving the learner a signal about their answer.
 */
export function resolveEmotion(
  m: PersonaManifest,
  signals: { distress: boolean; assessing: boolean; correcting: boolean; verifying: boolean }
): string {
  const can = (e: string) => m.delivery.emotionalRange.includes(e);
  if (signals.distress && can("calm")) return "calm";
  if (signals.assessing && can("neutral")) return "neutral";
  if (signals.correcting && can("firm")) return "firm";
  if (signals.verifying && can("sceptical")) return "sceptical";
  if (can("encouraging")) return "encouraging";
  return "neutral";
}
