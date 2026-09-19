/**
 * AUREN Nexus — mapping. Training module in, DRAFT candidates out.
 *
 * The same contract as `derive()` and deliberately the same shape, so a
 * reviewer meets one screen rather than two: mapping PROPOSES, it never
 * approves, and everything it emits is DRAFT with an explicit list of what it
 * could not supply.
 *
 * What differs is what it is entitled to propose, and the difference is the
 * whole reason this file exists rather than an `if` inside derive():
 *
 *   Signals  → challenges and failure signatures. They describe an adversary.
 *   Modules  → elements and diagnostic questions. They describe a competence.
 *
 * Mapping a curriculum into a role-play would mean writing an adversary the
 * authority never described. The gap list says so where an authority expects
 * a challenge to come out, because "we uploaded our handbook and got no
 * scenarios" is a surprise worth pre-empting in the console rather than in a
 * meeting.
 */

import type {
  ElementObject,
  KnowledgeObject,
  QuestionObject,
} from "../console/schema";
import type { DerivationGap } from "./derive";
import type { LearningOutcome, TrainingModule } from "./module";
import { learnerFacing, quotable, usageBasis } from "./module";

/** Languages the cue lists actually carry terms for. */
export const CUE_LANGUAGES = ["EN", "ES"];

export interface ModuleMapping {
  moduleId: string;
  objects: KnowledgeObject[];
  gaps: DerivationGap[];
  /** Outcome id → the element proposed for it. */
  outcomeElements: Array<{ outcomeId: string; elementId: string; anchored: boolean }>;
  /** Existing elements this module corroborates rather than extends. */
  corroborated: string[];
  basis: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   MATCHING AN OUTCOME AGAINST THE EXISTING COMPETENCY FRAME
   ═════════════════════════════════════════════════════════════════════ */

/**
 * The same cue lists derivation uses, read against an outcome statement rather
 * than a tactic description, and carrying terms in each deployed language.
 *
 * That last part is not decoration. A Spanish curriculum matched against an
 * English cue list matches by accident — "transferencia" happens to contain
 * "transfer" and "registro" does not contain "register" — which produces a
 * mapping that looks like it worked and silently proposes a duplicate element.
 * A cue list is per-language or it is a coin toss, and `basis` says which
 * language it read. Sharing them is the point: if a module's outcome
 * and a signal's `defeats` land on the same element, the network has a
 * curriculum and an adversary for the same competence, which is the state the
 * whole pipeline is trying to reach.
 */
const OUTCOME_CUES: Array<{ elementId: string; cues: string[] }> = [
  { elementId: "E-VER-02", cues: ["verif", "register", "authoris", "authoriz", "licen", "check the firm", "independent", "registro", "comprueba", "comprobar", "autorizad", "inscrit"] },
  { elementId: "E-RET-01", cues: ["return", "yield", "guaranteed", "percent", "plausib", "too good", "rentabilidad", "rendimiento", "garantizad"] },
  { elementId: "E-AI-01", cues: ["ai", "algorithm", "automated", "model", "bot", "machine learning", "algoritmo", "automatizad", "inteligencia artificial"] },
  { elementId: "E-RISK-01", cues: ["downside", "loss", "lose", "capital at risk", "risk", "recourse", "pérdida", "perder", "riesgo", "reclamar"] },
  { elementId: "E-URG-01", cues: ["urgen", "pressure", "deadline", "closing", "scarcity", "time", "urgencia", "presión", "plazo", "prisa"] },
  { elementId: "E-AUTH-01", cues: ["authority", "regulator", "official", "impersonat", "endorse", "celebrity", "autoridad", "supervisor", "suplanta", "aval"] },
  { elementId: "E-SOC-01", cues: ["social proof", "testimonial", "group", "referral", "friend", "community", "testimonio", "recomendación", "conocido", "grupo"] },
  { elementId: "E-PAY-01", cues: ["payment", "transfer", "wallet", "beneficiar", "third party", "account name", "transferencia", "titular", "cuenta de destino", "pago"] },
];

export function matchOutcome(statement: string): string | null {
  const hay = statement.toLowerCase();
  const hits = OUTCOME_CUES.map((e) => ({
    elementId: e.elementId,
    score: e.cues.filter((c) => hay.includes(c)).length,
  })).filter((h) => h.score > 0);
  if (hits.length === 0) return null;
  hits.sort((a, b) => b.score - a.score);
  return hits[0].elementId;
}

/* ═══════════════════════════════════════════════════════════════════════
   MAPPING
   ═════════════════════════════════════════════════════════════════════ */

const MODULE_DRAFT_GOV = (source: string, roles: string[], reviewDue: string | null) => ({
  version: "0.1.0-draft",
  status: "DRAFT" as const,
  approverRoles: roles,
  source,
  effectiveDate: null,
  reviewDue,
  supersededBy: null,
});

export function mapModule(
  m: TrainingModule,
  deployedLanguages: string[],
  markets: string[]
): ModuleMapping {
  const objects: KnowledgeObject[] = [];
  const gaps: DerivationGap[] = [];
  const outcomeElements: ModuleMapping["outcomeElements"] = [];
  const corroborated: string[] = [];

  const stem = m.id.replace(/^MOD-/, "");
  const source = `Training module ${m.id} · ${m.title} · ${m.jurisdiction} · edition ${m.edition} (${m.publishedOn})`;
  const mayQuote = quotable(m.usageBasis);

  /* A licensed module hands its expiry straight to every object mapped from it.
     The alternative is content that outlives the right to use it, which nobody
     notices until someone asks where a sentence came from. */
  const reviewDue = m.usageBasis === "licensed" ? m.licenceExpires : null;

  const clauseFor = (o: LearningOutcome) =>
    o.clauseId ? m.clauses.find((c) => c.id === o.clauseId) ?? null : null;

  m.outcomes.forEach((o, i) => {
    const existing = matchOutcome(o.statement);
    const clause = clauseFor(o);
    const anchor = mayQuote && clause ? `${m.title}, ${clause.citation}: “${clause.text}”` : "";

    if (existing) {
      /* The module corroborates an element AUREN already has. That is not
         nothing — it is a second authority's published principle behind a
         competence, which is exactly what a legal reviewer wants when the
         first anchor came from one jurisdiction. It creates no new object. */
      corroborated.push(existing);
      outcomeElements.push({ outcomeId: o.id, elementId: existing, anchored: !!anchor });
      if (anchor) {
        gaps.push({
          objectId: existing,
          field: "authorityAnchor — additional citation offered",
          role: "role:legal_reviewer",
          detail: `${m.jurisdiction} publishes a principle covering this element (${clause?.citation}). Adding it as a second anchor is a judgement about cross-jurisdiction citation, not a merge the mapping may perform.`,
        });
      }
      return;
    }

    /* Nothing existing covers it, so propose an element — and this is the one
       place a module is better than a signal, because the anchor arrives with
       the upload instead of being sourced by hand afterwards. */
    const el: ElementObject = {
      id: `E-MOD-${stem}-${i + 1}`,
      kind: "element",
      label: o.statement,
      eligibility: { modes: ["REHEARSE", "LEARN"], languages: deployedLanguages, markets },
      governance: MODULE_DRAFT_GOV(source, ["role:domain_reviewer", "role:legal_reviewer"], reviewDue),
      authorityAnchor: anchor,
      mandatory: false,
      capturable: true,
    };
    objects.push(el);
    outcomeElements.push({ outcomeId: o.id, elementId: el.id, anchored: !!anchor });

    if (anchor) {
      gaps.push({
        objectId: el.id,
        field: "authorityAnchor — proposed, needs confirming",
        role: "role:legal_reviewer",
        detail: `Anchored to ${clause?.citation} of the authority's own publication. The reviewer confirms the clause supports this element rather than sourcing one — which is the work the upload removed, not work it did.`,
      });
    } else {
      gaps.push({
        objectId: el.id,
        field: "authorityAnchor",
        role: "role:legal_reviewer",
        detail: mayQuote
          ? "This outcome cites no clause, so there is nothing to anchor it to. Same empty field a signal would leave, and the same cost to fill."
          : `Usage basis is ${usageBasis(m.usageBasis)?.label ?? m.usageBasis}, so nothing from this module may be quoted as an anchor. The principle has to be found in a publishable source.`,
      });
    }

    gaps.push({
      objectId: el.id,
      field: "mandatory",
      role: "role:domain_reviewer",
      detail: "Proposed as optional. Whether every investor must demonstrate this is a programme decision, not a property of the curriculum.",
    });

    /* The diagnostic. A module states the competence; it almost never states
       the question that resolves it in conversation, and the wording is where
       the evidence rule actually lives. */
    const q: QuestionObject = {
      id: `Q-MOD-${stem}-${i + 1}`,
      kind: "question",
      label: `Diagnostic for ${el.id}`,
      eligibility: { modes: ["REHEARSE", "LEARN"], languages: deployedLanguages, markets },
      governance: MODULE_DRAFT_GOV(source, ["role:domain_reviewer", "role:legal_reviewer"], reviewDue),
      targetElement: el.id,
      variants: deployedLanguages.map((lang) => ({ lang, wording: "", fidelity: "pending" as const })),
      leadingRisk: "none",
      leadingRiskRationale: null,
      firesOnlyAfter: null,
      satisfaction: "verbatim_bound",
    };
    objects.push(q);
    gaps.push({
      objectId: q.id,
      field: "wording, every language",
      role: "role:domain_reviewer + native reviewers",
      detail: m.languages.includes("EN")
        ? "The module's own phrasing is written to be read, not asked. A question has to be answerable out loud by someone under pressure, and that is authored."
        : `The module exists in ${m.languages.join(", ")} and not in every deployed language. Translating the question also translates the evidence rule behind it, which is why native review is not optional.`,
    });
  });

  /* The absence a contributing authority will ask about, stated before they
     have to. */
  gaps.push({
    objectId: `MOD-${stem}`,
    field: "no challenge proposed",
    role: "role:analyst + role:safety_reviewer",
    detail:
      "A curriculum describes what a person should be able to do; it does not describe an adversary. Rehearsing these elements needs a challenge, and a challenge comes from a threat signal — lodge one, or map these elements onto a challenge already released.",
  });

  if (!learnerFacing(m.audience)) {
    gaps.push({
      objectId: `MOD-${stem}`,
      field: "audience — re-authoring required",
      role: "role:domain_reviewer",
      detail:
        "Written for practitioners. Every string that will be spoken to a retail investor has to be re-authored for someone with no procedure, no screen and no colleague beside them — the competence transfers, the wording does not.",
    });
  }

  const newElements = objects.filter((o) => o.kind === "element");
  const cued = m.languages.filter((l) => CUE_LANGUAGES.includes(l.toUpperCase()));
  const basis =
    `${m.outcomes.length} outcome${m.outcomes.length === 1 ? "" : "s"} read: ` +
    `${corroborated.length} ${corroborated.length === 1 ? "corroborates" : "corroborate"} an element AUREN already has, ` +
    `${newElements.length} ${newElements.length === 1 ? "proposes a new one" : "propose new ones"}. ` +
    (cued.length
      ? `Matched against the ${cued.join("/")} cue lists.`
      : `No cue list exists for ${m.languages.join("/")}, so every outcome fell through to a proposed element — a domain reviewer should expect duplicates and should be the one to say so.`);

  return { moduleId: m.id, objects, gaps, outcomeElements, corroborated, basis };
}

/**
 * The honest headline, phrased as work remaining — same discipline as
 * `derivationSummary`, with the one genuine win stated rather than buried.
 */
export function mappingSummary(mp: ModuleMapping): string {
  if (mp.objects.length === 0) {
    return `No new objects. Every outcome corroborates an element AUREN already carries — which is a result, not a failure: ${mp.corroborated.length} element${mp.corroborated.length === 1 ? " now has" : "s now have"} a second authority's published principle behind ${mp.corroborated.length === 1 ? "it" : "them"}.`;
  }
  const byRole = new Map<string, number>();
  mp.gaps.forEach((g) => byRole.set(g.role, (byRole.get(g.role) ?? 0) + 1));
  const roles = Array.from(byRole.entries())
    .map(([r, n]) => `${n} for ${r.replace(/role:/g, "").replace(/_/g, " ")}`)
    .join(", ");

  /* Count the anchors against the new elements only. Counting corroborations
     in makes the anchored figure exceed the object count, which is the kind of
     arithmetic that gets a whole console disbelieved. */
  const newElementIds = new Set(mp.objects.filter((o) => o.kind === "element").map((o) => o.id));
  const anchoredNew = mp.outcomeElements.filter(
    (o) => o.anchored && newElementIds.has(o.elementId)
  ).length;
  const corroborations = mp.corroborated.length;

  return (
    `${mp.objects.length} candidate object${mp.objects.length === 1 ? "" : "s"} drafted` +
    (newElementIds.size
      ? anchoredNew === newElementIds.size
        ? `, ${newElementIds.size === 1 ? "the new element arriving" : `all ${newElementIds.size} new elements arriving`} anchored to a published clause`
        : `, ${anchoredNew} of the ${newElementIds.size} new elements arriving anchored to a published clause`
      : "") +
    (corroborations
      ? `, and ${corroborations} outcome${corroborations === 1 ? "" : "s"} corroborating elements AUREN already carries`
      : "") +
    `. None is releasable: ${mp.gaps.length} fields need a human — ${roles}.`
  );
}
