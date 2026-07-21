/**
 * CVIF scoring pipeline — §7 of the Project Paper.
 *
 * In production this is an LLM structured-extraction pass (see docs/CVIF.md):
 * capture → normalise/translate → segment → extract exact quotes → map to
 * one primary dimension → apply evidence-quality & excluded-confound controls
 * → score or emit NE/IE → assign confidence → run escalation & human-review
 * triggers → generate the citizen-confirmed summary.
 *
 * The `Scorer` interface below is the seam. `deterministicScorer` is a
 * dependency-free heuristic implementation used for the demo dashboard and
 * for pipeline tests; an `llmScorer` implementing the same interface is the
 * Phase 2 deliverable.
 */

import type {
  TranscriptInput,
  SessionInsightRecord,
  UrgencyLevel,
  SentimentScore,
  Confidence,
} from "./types";
import { TAXONOMY, TAXONOMY_BY_ID } from "./taxonomy";

export interface Scorer {
  score(input: TranscriptInput): SessionInsightRecord;
}

// --- lightweight lexical signals (illustrative; the LLM pass replaces these) ---

const CRITICAL_SIGNALS = ["bunuh diri", "self-harm", "kill myself", "violence", "senjata", "weapon", "trafficking", "pukul", "bomb"];
const URGENT_SIGNALS = ["ah long", "loan shark", "corruption", "rasuah", "abuse", "dera", "threat", "ugut", "dadah", "trafficking"];
const NEG_WORDS = ["delay", "lambat", "slow", "queue", "tak", "lost", "hilang", "scam", "tipu", "problem", "masalah", "frustrated", "marah", "gagal", "months", "bulan"];
const POS_WORDS = ["thank", "terima kasih", "good", "bagus", "improve", "better", "proud", "bangga", "fast", "cepat", "appreciate", "hargai"];

const TOPIC_KEYWORDS: Record<string, string[]> = {
  immigration: ["permit", "passport", "visa", "renewal", "imigresen", "foreign worker", "levy", "fomema", "quota"],
  foreign_workers: ["levy", "agent", "quota", "fomema", "work pass", "worker"],
  policing: ["patrol", "balai", "police", "pdrm", "cctv", "rempit", "loan shark", "ah long", "crime", "jenayah"],
  scams: ["scam", "tipu", "bank", "freeze", "mule", "investment", "tac", "fraud"],
  registration: ["mykad", "jpn", "birth", "registration", "kad pengenalan", "kiosk"],
  drugs: ["dadah", "drug", "vape", "rehab", "aadk"],
  civil_defence: ["banjir", "flood", "apm", "siren", "emergency"],
};

function citizenText(input: TranscriptInput): string {
  return input.turns
    .filter((t) => t.speaker === "citizen")
    .map((t) => t.text)
    .join(" ");
}

function countHits(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.reduce((n, w) => (lower.includes(w) ? n + 1 : n), 0);
}

function firstQuoteContaining(input: TranscriptInput, words: string[]): string | null {
  for (const turn of input.turns) {
    if (turn.speaker !== "citizen") continue;
    const lower = turn.text.toLowerCase();
    if (words.some((w) => lower.includes(w))) return turn.text.trim();
  }
  const citizenTurns = input.turns.filter((t) => t.speaker === "citizen");
  return citizenTurns[0]?.text.trim() ?? null;
}

function classifyTopic(text: string, hint?: string): string {
  const scores = Object.entries(TOPIC_KEYWORDS).map(([id, words]) => [id, countHits(text, words)] as const);
  scores.sort((a, b) => b[1] - a[1]);
  if (scores[0] && scores[0][1] > 0) return scores[0][0];
  if (hint && TAXONOMY.some((t) => t.label === hint)) {
    return TAXONOMY.find((t) => t.label === hint)!.id;
  }
  return "general";
}

function sentimentScore(text: string): SentimentScore {
  const neg = countHits(text, NEG_WORDS);
  const pos = countHits(text, POS_WORDS);
  const net = pos - neg;
  if (neg === 0 && pos === 0) return 0;
  if (net >= 2) return 2;
  if (net === 1) return 1;
  if (net === 0) return 0;
  if (net === -1) return -1;
  return -2;
}

function impactScore(text: string): 1 | 2 | 3 | 4 | 5 {
  const lower = text.toLowerCase();
  if (CRITICAL_SIGNALS.some((s) => lower.includes(s))) return 5;
  if (URGENT_SIGNALS.some((s) => lower.includes(s))) return 4;
  if (/(income|lost|rm\s?\d|gaji|kerja|contract|kontrak|livelihood)/.test(lower)) return 3;
  if (/(months|bulan|again|lagi|repeat|berkali|four times|three times)/.test(lower)) return 2;
  return 1;
}

function urgencyFrom(text: string, impact: number): UrgencyLevel {
  const lower = text.toLowerCase();
  if (CRITICAL_SIGNALS.some((s) => lower.includes(s))) return "Critical";
  if (URGENT_SIGNALS.some((s) => lower.includes(s)) || impact >= 4) return "Urgent";
  if (impact === 3) return "Priority";
  return "Normal";
}

function evidenceScore(text: string): 1 | 2 | 3 | 4 | 5 {
  const lower = text.toLowerCase();
  const specific = /(shah alam|office|pejabat|\bjb\b|penang|selangor|counter|\d\s?(times|kali|months|bulan))/.test(lower);
  const documented = /(reference|rujukan|report|laporan|receipt|resit|several|many people|ramai)/.test(lower);
  if (documented && specific) return 5;
  if (specific) return /(again|lagi|times|kali)/.test(lower) ? 4 : 3;
  if (lower.length > 120) return 2;
  return 1;
}

function confidenceFrom(evidence: number, clarity: number): Confidence {
  const avg = (evidence + clarity) / 2;
  if (avg >= 4) return "high";
  if (avg >= 3) return "moderate";
  if (avg >= 2) return "low";
  return "insufficient";
}

/**
 * Deterministic, dependency-free scorer. Faithful to the CVIF SHAPE and the
 * NE/IE + human-review discipline; the heuristics stand in for the LLM pass.
 */
export const deterministicScorer: Scorer = {
  score(input: TranscriptInput): SessionInsightRecord {
    const text = citizenText(input);
    const topicId = classifyTopic(text, input.topicHint);
    const topic = TAXONOMY_BY_ID[topicId];

    const sentiment = sentimentScore(text);
    const impact = impactScore(text);
    const evidence = evidenceScore(text);
    const urgency = urgencyFrom(text, impact);

    // Issue clarity: proxy from length + presence of a concrete ask/location.
    const hasLocation = input.locationsMentioned?.length || /(office|pejabat|shah alam|kuala|johor|penang|sabah)/i.test(text);
    const clarity: 1 | 2 | 3 | 4 | 5 = text.length < 40 ? 2 : hasLocation ? 4 : 3;

    // Actionability: did the citizen state a concrete improvement?
    const askQuote = firstQuoteContaining(input, ["please", "sila", "boleh", "should", "harap", "want", "online", "system", "kiosk"]);
    const actionability: 1 | 2 | 3 | 4 | 5 = askQuote && /(online|system|kiosk|hotline|track|publish|patrol)/i.test(askQuote) ? 5 : askQuote ? 3 : 2;

    // Confirmation: did the minister reflect a summary and the citizen agree?
    const ministerReflected = input.turns.some((t) => t.speaker === "minister" && /(understood|betul|correct|hearing|dengar)/i.test(t.text));
    const citizenAgreed = input.turns.some((t) => t.speaker === "citizen" && /(yes|ya|betul|correct|right|exactly)/i.test(t.text));
    const confirmation = ministerReflected ? (citizenAgreed ? "C" : "NC") : "NE";

    const confidence = confidenceFrom(evidence, clarity);

    // --- human-review triggers (§7 step 9) ---
    const humanReviewReasons: string[] = [];
    if (urgency === "Urgent" || urgency === "Critical") humanReviewReasons.push(`Urgency: ${urgency}`);
    if (impact >= 4) humanReviewReasons.push("Impact severity 4-5");
    if (confidence === "low" || confidence === "insufficient") {
      if (impact >= 3) humanReviewReasons.push("Low confidence on a high-severity issue");
    }
    if (confirmation === "NC") humanReviewReasons.push("Summary not confirmed");

    const painPoint = firstQuoteContaining(input, NEG_WORDS);
    const suggestion = askQuote;
    const summary = buildSummary(input, topic?.label ?? "General feedback", painPoint, suggestion);

    return {
      reference: input.reference,
      language: input.language,
      state: input.state,
      district: input.district,
      locationsMentioned: input.locationsMentioned ?? extractLocations(text),
      topicL1: topic?.label ?? "General governance feedback / praise",
      topicL2: topic?.level2?.[0] ?? null,
      keywords: extractKeywords(text, topicId),
      sentiment: {
        overall: { value: sentiment, confidence, evidenceQuote: painPoint ?? askQuote },
        targets: [],
      },
      clarity: { value: clarity, confidence, evidenceQuote: painPoint },
      evidence: { value: evidence, confidence, evidenceQuote: painPoint },
      impact: { value: impact, confidence, evidenceQuote: painPoint },
      actionability: { value: actionability, confidence, evidenceQuote: askQuote },
      confirmation,
      urgency,
      painPoint,
      suggestion,
      summary,
      humanReview: humanReviewReasons.length > 0,
      humanReviewReasons,
    };
  },
};

function extractLocations(text: string): string[] {
  const known = ["Shah Alam", "Kuala Lumpur", "Johor Bahru", "Penang", "Selangor", "Sabah", "Sarawak", "Klang", "Sandakan", "Kota Bharu"];
  return known.filter((k) => text.toLowerCase().includes(k.toLowerCase()));
}

function extractKeywords(text: string, topicId: string): string[] {
  const pool = TOPIC_KEYWORDS[topicId] ?? [];
  const lower = text.toLowerCase();
  return pool.filter((k) => lower.includes(k)).slice(0, 5);
}

function buildSummary(
  input: TranscriptInput,
  topic: string,
  painPoint: string | null,
  suggestion: string | null,
): string {
  const where = input.district ? `${input.district}, ${input.state}` : input.state;
  const problem = painPoint ? `raised a concern about ${topic.toLowerCase()}` : `shared feedback on ${topic.toLowerCase()}`;
  const ask = suggestion ? ` and requested: ${suggestion.replace(/\.$/, "")}.` : ".";
  return `Citizen from ${where} ${problem}${ask}`;
}
