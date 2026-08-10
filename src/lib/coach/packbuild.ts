/**
 * Builds a LaunchPack from the Product Nexus form input.
 * The product team writes plain content; retrieval keywords for the
 * governed engine are derived here, not hand-entered.
 */

import type { LaunchPack, ObjectionEntry, PackSection } from "./types";

/** Fixed section frame every launch pack follows (message governance). */
export const PACK_SECTION_FRAME: Array<{
  id: string;
  title: string;
  hint: string;
  keywords: string[];
}> = [
  { id: "positioning", title: "Positioning", hint: "The one-line launch message and how to position it.",
    keywords: ["positioning", "message", "story", "about", "what is", "tell me", "introduce"] },
  { id: "claims", title: "Hero claims (approved wording)", hint: "The exact approved claim sentences.",
    keywords: ["claim", "results", "proof", "percent", "works", "evidence"] },
  { id: "ingredients", title: "Ingredient story", hint: "Key actives and how they work.",
    keywords: ["ingredient", "formula", "inside", "contains", "active"] },
  { id: "routine", title: "Routine placement", hint: "How and when to use; what it pairs with.",
    keywords: ["routine", "apply", "use", "when", "how", "steps", "morning", "night"] },
  { id: "price", title: "Price positioning", hint: "The approved value story versus competitors.",
    keywords: ["price", "cost", "expensive", "cheap", "value", "compare"] },
  { id: "upsell", title: "Complete the routine", hint: "Companion products to recommend together.",
    keywords: ["upsell", "companion", "also", "together", "recommend", "pair"] },
];

const STOPWORDS = new Set([
  "the", "and", "that", "this", "with", "your", "have", "just", "what",
  "when", "will", "does", "dont", "don't", "about", "them", "they", "from",
  "very", "much", "then", "than", "some", "cant", "can't", "really",
]);

/** Significant words from an objection line become its trigger keywords. */
export function objectionKeywords(objection: string): string[] {
  const words = objection
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
  return Array.from(new Set(words)).slice(0, 8);
}

export interface NexusPackInput {
  language: string;
  sections: Record<string, string>; // frame id -> content
  approvedClaims: string[];
  doNotSay: string[];
  objections: Array<{ objection: string; approvedResponse: string }>;
}

export function buildPack(
  input: NexusPackInput
): Omit<LaunchPack, "id" | "version" | "productId"> {
  const sections: PackSection[] = PACK_SECTION_FRAME.filter(
    (f) => (input.sections[f.id] ?? "").trim()
  ).map((f) => ({
    id: f.id,
    title: f.title,
    content: input.sections[f.id].trim(),
    keywords: f.keywords,
  }));
  const objections: ObjectionEntry[] = input.objections
    .filter((o) => o.objection.trim() && o.approvedResponse.trim())
    .map((o) => ({
      objection: o.objection.trim(),
      keywords: objectionKeywords(o.objection),
      approvedResponse: o.approvedResponse.trim(),
    }));
  return {
    language: input.language || "EN",
    sections,
    objections,
    doNotSay: input.doNotSay.map((d) => d.trim()).filter(Boolean),
    approvedClaims: input.approvedClaims.map((c) => c.trim()).filter(Boolean),
  };
}
