/**
 * Launch-readiness scorer (Phase 1: deterministic heuristic).
 *
 * Mirrors CVIF's honesty rules: every score carries verbatim evidence from
 * the advisor's own utterances, and dimensions that were not exercised in
 * the session return NE (not elicited) rather than an invented number.
 * The Week-5 upgrade path is an LLM judge scoring the same dimensions
 * against the same rubric — this module is the seam for it.
 */

import type {
  CoachTurn,
  DimensionScore,
  LaunchPack,
  Scorecard,
  CoachSession,
} from "@/lib/coach/types";
import { CERTIFICATION_THRESHOLD } from "@/lib/coach/types";
import { getDivision } from "@/lib/coach/org";
import { READINESS_DIMENSIONS } from "./dimensions";

const PERSONALIZATION_WORDS = [
  "skin type", "sensitive", "dry skin", "oily", "your skin", "your hair",
  "concern", "your routine", "for you", "depends on",
];
const UPSELL_WORDS = [
  "routine", "pair", "together", "also recommend", "spf", "companion",
  "complete", "as well", "morning and night", "cleanser", "eye cream",
];
const OBJECTION_MARKERS = ["expensive", "price", "cost", "sensitive", "irritate", "why", "already", "really", "believe"];

function quoteOf(text: string, max = 140): string {
  const t = text.trim();
  return t.length <= max ? t : t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

function coverageScore(hits: number, possible: number): number {
  if (possible === 0) return 0;
  return Math.round(Math.min(1, hits / Math.min(possible, 4)) * 100);
}

export function scoreSession(
  session: CoachSession,
  turns: CoachTurn[],
  pack: LaunchPack,
  divisionId?: string | null
): Scorecard {
  const advisorTurns = turns.filter((t) => t.speaker === "advisor");
  const advisorText = advisorTurns.map((t) => t.text.toLowerCase()).join(" \n ");

  const findEvidence = (words: string[]): string | null => {
    for (const t of advisorTurns) {
      const lower = t.text.toLowerCase();
      if (words.some((w) => lower.includes(w.toLowerCase()))) return quoteOf(t.text);
    }
    return null;
  };

  const dims: DimensionScore[] = READINESS_DIMENSIONS.map((d) => {
    switch (d.id) {
      case "message-fidelity": {
        const used = pack.approvedClaims.filter((c) =>
          advisorText.includes(c.toLowerCase())
        );
        if (advisorTurns.length === 0)
          return ne(d.id, "No advisor speech captured.");
        return {
          dimensionId: d.id,
          score: coverageScore(used.length, pack.approvedClaims.length),
          confidence: used.length > 0 ? "moderate" : "low",
          evidence: findEvidence(used.length ? used : pack.approvedClaims),
          note: used.length
            ? `Used ${used.length} of ${pack.approvedClaims.length} approved claim phrases.`
            : "No approved claim wording detected in advisor speech.",
        };
      }
      case "product-accuracy": {
        const claimHits = pack.approvedClaims.filter((c) =>
          advisorText.includes(c.toLowerCase())
        ).length;
        const violations = pack.doNotSay.filter((w) =>
          advisorText.includes(w.toLowerCase())
        );
        if (advisorTurns.length === 0)
          return ne(d.id, "No advisor speech captured.");
        if (claimHits === 0 && violations.length === 0)
          return ie(d.id, "Not enough product statements to assess accuracy.");
        const base = coverageScore(claimHits, 3);
        return {
          dimensionId: d.id,
          score: Math.max(0, base - violations.length * 40),
          confidence: "moderate",
          evidence: findEvidence([...pack.approvedClaims, ...pack.doNotSay]),
          note: violations.length
            ? `Forbidden wording used: ${violations.join(", ")}.`
            : "Product statements align with approved claims.",
        };
      }
      case "brand-tone": {
        if (advisorTurns.length === 0)
          return ne(d.id, "No advisor speech captured.");
        const violations = pack.doNotSay.filter((w) =>
          advisorText.includes(w.toLowerCase())
        );
        return {
          dimensionId: d.id,
          score: violations.length ? Math.max(0, 70 - violations.length * 30) : 85,
          confidence: "low",
          evidence: quoteOf(advisorTurns[advisorTurns.length - 1].text),
          note: violations.length
            ? `Do-not-say list breached (${violations.join(", ")}).`
            : "No forbidden wording; tone assessment is heuristic in the pilot.",
        };
      }
      case "objection-handling": {
        const objectionRaised = turns.some(
          (t) =>
            t.speaker === "coach" &&
            OBJECTION_MARKERS.some((m) => t.text.toLowerCase().includes(m))
        );
        if (!objectionRaised)
          return ne(d.id, "No objection scenario arose in this session.");
        const responded = pack.objections.some((o) =>
          o.keywords.some((k) => advisorText.includes(k))
        );
        return {
          dimensionId: d.id,
          score: responded ? 75 : 40,
          confidence: "low",
          evidence: findEvidence(pack.objections.flatMap((o) => o.keywords)),
          note: responded
            ? "Engaged with the objection scenario."
            : "Objection raised but approved response elements not detected.",
        };
      }
      case "personalization": {
        const evidence = findEvidence(PERSONALIZATION_WORDS);
        if (advisorTurns.length === 0)
          return ne(d.id, "No advisor speech captured.");
        return {
          dimensionId: d.id,
          score: evidence ? 80 : 45,
          confidence: "low",
          evidence,
          note: evidence
            ? "Referenced customer context."
            : "No customer-context language detected.",
        };
      }
      case "upsell-fluency": {
        const evidence = findEvidence(UPSELL_WORDS);
        if (advisorTurns.length === 0)
          return ne(d.id, "No advisor speech captured.");
        return {
          dimensionId: d.id,
          score: evidence ? 80 : 40,
          confidence: "low",
          evidence,
          note: evidence
            ? "Recommended routine or companion products."
            : "No routine-completion language detected.",
        };
      }
      default:
        return ie(d.id, "Unknown dimension.");
    }
  });

  // Division-weighted overall: a derm pharmacist is judged hardest on
  // product accuracy, a Luxe advisor on personalisation and tone.
  const weights = getDivision(divisionId ?? "")?.weights ?? {};
  const numeric = dims.filter((x) => typeof x.score === "number") as Array<
    DimensionScore & { score: number }
  >;
  const wsum = numeric.reduce((a, x) => a + (weights[x.dimensionId] ?? 1), 0);
  const overall = numeric.length
    ? Math.round(
        numeric.reduce(
          (a, x) => a + x.score * (weights[x.dimensionId] ?? 1),
          0
        ) / (wsum || numeric.length)
      )
    : 0;

  const practiceNext = dims
    .filter((x) => x.score === "NE" || (typeof x.score === "number" && x.score < 60))
    .slice(0, 3)
    .map((x) => {
      const dim = READINESS_DIMENSIONS.find((r) => r.id === x.dimensionId);
      return `Practise ${dim?.label ?? x.dimensionId}: ${dim?.anchorHigh ?? ""}`;
    });

  return {
    sessionId: session.id,
    advisorId: session.advisorId,
    productId: session.productId,
    overall,
    dimensions: dims,
    certified: overall >= CERTIFICATION_THRESHOLD && numeric.length >= 3,
    practiceNext,
    createdAt: new Date().toISOString(),
  };
}

function ne(dimensionId: string, note: string): DimensionScore {
  return { dimensionId, score: "NE", confidence: "high", evidence: null, note };
}
function ie(dimensionId: string, note: string): DimensionScore {
  return { dimensionId, score: "IE", confidence: "low", evidence: null, note };
}
