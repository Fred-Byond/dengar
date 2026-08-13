/**
 * FVIF scoring pipeline.
 *
 * In production this is an LLM structured-extraction pass, identical in shape
 * to the CVIF pipeline: capture → normalise/translate → segment → extract exact
 * quotes → map to one primary dimension → apply evidence-quality and
 * excluded-confound controls → score or emit NE/IE → assign confidence → run
 * care/safeguarding and human-review triggers → generate the fan-confirmed
 * summary and the continuity hook.
 *
 * The `Scorer` interface below is the seam. `deterministicScorer` is a
 * dependency-free heuristic implementation used for the demo dashboard and for
 * pipeline tests; an `llmScorer` implementing the same interface drops in
 * behind it without changing the dashboard, the brief, or the explorer.
 */

import type {
  TranscriptInput,
  FanInsightRecord,
  CareLevel,
  SentimentScore,
  SentimentTarget,
  Confidence,
} from "./types";
import { TAXONOMY, TAXONOMY_BY_ID } from "./taxonomy";

export interface Scorer {
  score(input: TranscriptInput): FanInsightRecord;
}

// --- lightweight lexical signals (illustrative; the LLM pass replaces these) ---

/** Never handled by the avatar alone — always the safeguarding protocol. */
const CRITICAL_SIGNALS = [
  "kill myself", "end my life", "self-harm", "hurt myself", "suicidio", "hitting me",
  "he beats", "abuse", "abuso", "threatened me", "run away from home", "starving",
];

/** Disclosed hardship — same-day trained human review. */
const CARE_SIGNALS = [
  "passed away", "died", "funeral", "cancer", "hospital", "surgery", "murió", "falleció",
  "bullied", "bullying", "depressed", "depression", "panic", "afraid to go to school",
  "we lost our home", "refugee", "war", "cannot afford", "no money for boots",
];

/** Discouragement in a young fan — the fan-care watch queue. */
const WATCH_SIGNALS = [
  "want to quit", "give up", "gave up", "not good enough", "too small", "laugh at me",
  "cut from", "released me", "no confidence", "scared to play", "always on the bench",
  "my coach says i", "i keep failing",
];

const NEG_WORDS = [
  "lost", "losing", "defeat", "quit", "give up", "afraid", "scared", "nervous", "nervios",
  "doubt", "sad", "triste", "cry", "injury", "injured", "lesión", "bench", "rejected",
  "released", "too small", "bullied", "stress", "pressure", "failed", "mistake", "worried",
];

const POS_WORDS = [
  "thank", "gracias", "obrigado", "شكرا", "grateful", "happy", "proud", "orgulloso",
  "inspire", "inspired", "love", "dream", "hope", "best day", "amazing", "believe",
  "improved", "scored", "won", "champion", "excited",
];

const TOPIC_KEYWORDS: Record<string, string[]> = {
  football_training: ["first touch", "dribbl", "weak foot", "free kick", "shooting", "passing", "position", "movement", "ball control", "training", "entrenamiento", "drill"],
  motivation: ["confidence", "believe", "too small", "give up", "quit", "nervous", "pressure", "motivation", "keep going", "after losing", "mental"],
  world_cup: ["world cup", "2022", "final", "copa", "argentina", "barcelona", "goal against", "penalty", "trophy", "mundial", "career"],
  family_childhood: ["my father", "my mother", "my parents", "rosario", "childhood", "when you were young", "left home", "growth hormone", "my son", "my daughter", "bedtime", "story"],
  academy_progress: ["trial", "academy", "scout", "club", "selection", "tryout", "signed", "youth team", "coach", "prueba"],
  wellbeing: ["injury", "injured", "recover", "anxiety", "bullied", "sleep", "school stress", "depressed", "hospital", "panic"],
  gratitude: ["thank you", "gracias", "meant to me", "my family", "watching with", "since i was", "your shirt", "named my", "obrigado"],
  for_good: ["our school", "our village", "programme", "program", "donate", "equipment", "girls team", "community", "disabled", "wheelchair"],
  commerce: ["shirt", "jersey", "ticket", "membership", "messi+", "subscription", "collection", "holome", "store", "price"],
  reserved: ["transfer", "contract", "politics", "president", "election", "lawsuit", "salary", "divorce"],
};

/** Cues that mark a fan turn as an explicit request for something. */
const REQUEST_CUES = [
  "can you", "could you", "please", "would you", "tell me", "teach me", "show me",
  "i want to learn", "i would like", "how do i", "how can i", "what should i",
  "puedes", "por favor", "cómo", "me gustaría",
];

/** Cues that mark a fan turn as a question. */
function isQuestion(text: string): boolean {
  return /[?？]/.test(text) || /^(how|what|why|when|did|do|does|can|could|would|should|cómo|qué|por qué)\b/i.test(text.trim());
}

/** Cues that a fan named a dated, upcoming personal milestone. */
const MILESTONE_CUES = [
  "next month", "next week", "tomorrow", "in two weeks", "on saturday", "this season",
  "my birthday", "final next", "trial next", "exam next", "próximo mes",
];

/** A dated cue only signals a milestone when something is actually at stake. */
const STAKES_CONTEXT =
  /(trial|tryout|prueba|academy|selection|exam|final|tournament|match|debut|surgery|treatment|school|birthday|scout)/;

function fanText(input: TranscriptInput): string {
  return input.turns.filter((t) => t.speaker === "fan").map((t) => t.text).join(" ");
}

function countHits(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.reduce((n, w) => (lower.includes(w) ? n + 1 : n), 0);
}

function firstFanTurnContaining(input: TranscriptInput, words: string[]): string | null {
  for (const turn of input.turns) {
    if (turn.speaker !== "fan") continue;
    const lower = turn.text.toLowerCase();
    if (words.some((w) => lower.includes(w))) return turn.text.trim();
  }
  return null;
}

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?？])\s+/).map((s) => s.trim()).filter(Boolean);
}

/**
 * The fan's actual question, verbatim — the raw material for the curation
 * queue. A short question ("Should I keep going?") is meaningless without the
 * sentence that set it up, so the immediately preceding sentence from the same
 * turn is carried with it.
 */
function questionSentence(input: TranscriptInput): string | null {
  for (const turn of input.turns) {
    if (turn.speaker !== "fan") continue;
    const parts = sentences(turn.text);
    const idx = parts.findIndex(isQuestion);
    if (idx < 0) continue;
    const q = parts[idx];
    if (q.length < 60 && idx > 0) return `${parts[idx - 1]} ${q}`;
    return q;
  }
  return null;
}

const L2_STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "your", "you", "being", "after", "before",
  "against", "off", "out", "into", "a", "an", "of", "to", "on", "at", "in", "too",
]);

/**
 * Pick the level-2 sub-theme by matching its label's distinctive words against
 * the transcript, rather than defaulting to the first entry. Sub-themes are
 * what the curation queue clusters on, so a lazy default would invent
 * precision that is not there.
 */
function classifyLevel2(text: string, level2: string[]): string | null {
  const lower = text.toLowerCase();
  let best: { label: string; hits: number } | null = null;
  for (const label of level2) {
    const tokens = label
      .toLowerCase()
      .split(/[^a-z0-9']+/)
      .filter((w) => w.length > 3 && !L2_STOPWORDS.has(w));
    if (tokens.length === 0) continue;
    const hits = tokens.reduce((n, w) => (lower.includes(w) ? n + 1 : n), 0);
    const needed = tokens.length >= 3 ? 2 : 1;
    if (hits >= needed && (!best || hits > best.hits)) best = { label, hits };
  }
  return best?.label ?? null;
}

/** What the fan asked Messi's world to make, do or answer. */
function requestSentence(input: TranscriptInput): string | null {
  const all = sentences(fanText(input));
  for (const s of all) {
    const l = s.toLowerCase();
    if (REQUEST_CUES.some((c) => l.includes(c))) return s;
  }
  return null;
}

function classifyTopic(text: string, hint?: string): string {
  const scores = Object.entries(TOPIC_KEYWORDS).map(
    ([id, words]) => [id, countHits(text, words)] as const,
  );
  scores.sort((a, b) => b[1] - a[1]);
  if (scores[0] && scores[0][1] > 0) return scores[0][0];
  if (hint) {
    const byLabel = TAXONOMY.find((t) => t.label === hint || t.id === hint);
    if (byLabel) return byLabel.id;
  }
  return "gratitude";
}

function sentimentScore(text: string): SentimentScore {
  const neg = countHits(text, NEG_WORDS);
  const pos = countHits(text, POS_WORDS);
  if (neg === 0 && pos === 0) return 0;
  const net = pos - neg;
  if (net >= 2) return 2;
  if (net === 1) return 1;
  if (net === 0) return 0;
  if (net === -1) return -1;
  return -2;
}

function significanceScore(text: string, care: CareLevel): 1 | 2 | 3 | 4 | 5 {
  const lower = text.toLowerCase();
  if (/(most important|biggest moment|changed my life|all my life|dream of my life|life)/.test(lower) && /(dream|moment|change)/.test(lower)) return 5;
  if (care === "Care" || care === "Critical") return 4;
  if (MILESTONE_CUES.some((c) => lower.includes(c)) && STAKES_CONTEXT.test(lower)) return 4;
  if (/(trial|academy|selection|exam|final|tournament|comeback|recover)/.test(lower)) return 3;
  if (/(my father|my mother|my son|my daughter|my family|grandfather|abuelo)/.test(lower)) return 3;
  if (lower.length > 160) return 2;
  return 1;
}

function careLevel(text: string, ageBand: string): CareLevel {
  const lower = text.toLowerCase();
  if (CRITICAL_SIGNALS.some((s) => lower.includes(s))) return "Critical";
  if (CARE_SIGNALS.some((s) => lower.includes(s))) return "Care";
  const watchHits = countHits(lower, WATCH_SIGNALS);
  if (watchHits > 0) {
    // Discouragement is a watch item, not a welfare case — a young player
    // saying "I want to quit" needs encouragement, not an escalation. It
    // becomes a Care item only when several distress markers stack up in the
    // same conversation with a minor. The age band changes the ROUTING, never
    // any score about the child.
    const minor = ageBand === "under-13" || ageBand === "13-17";
    return minor && watchHits >= 2 ? "Care" : "Watch";
  }
  return "Normal";
}

function contextDepthScore(text: string): 1 | 2 | 3 | 4 | 5 {
  const lower = text.toLowerCase();
  const specific = /(my (coach|club|team|school|academy|father|mother|son|daughter)|last (season|month|week|year)|when i was \d|\b\d{1,2} years old)/.test(lower);
  const stakes = /(depends|if i (don't|do not|fail)|last chance|only chance|they will|i have been trying|for (two|three|four|five) years|again this year)/.test(lower);
  const dated = MILESTONE_CUES.some((c) => lower.includes(c));
  if (specific && stakes && (dated || lower.length > 260)) return 5;
  if (specific && (stakes || dated)) return 4;
  if (specific) return 3;
  if (lower.length > 120) return 2;
  return 1;
}

function confidenceFrom(contextDepth: number, clarity: number): Confidence {
  const avg = (contextDepth + clarity) / 2;
  if (avg >= 4) return "high";
  if (avg >= 3) return "moderate";
  if (avg >= 2) return "low";
  return "insufficient";
}

/** Sentiment targets: what inside the conversation the feeling attaches to. */
function sentimentTargets(input: TranscriptInput, topicId: string): SentimentTarget[] {
  const out: SentimentTarget[] = [];
  const setbackQuote = firstFanTurnContaining(input, [...NEG_WORDS, ...WATCH_SIGNALS]);
  if (setbackQuote) {
    out.push({
      target: topicId === "academy_progress" ? "their own trial / selection" : "their own situation",
      score: sentimentScore(setbackQuote),
      evidenceQuote: setbackQuote,
    });
  }
  const messiQuote = firstFanTurnContaining(input, ["you", "your", "usted", "tu "]);
  if (messiQuote && countHits(messiQuote, POS_WORDS) > 0) {
    out.push({ target: "Messi and his story", score: 2, evidenceQuote: messiQuote });
  }
  return out.slice(0, 3);
}

/**
 * Deterministic, dependency-free scorer. Faithful to the FVIF SHAPE and to the
 * NE/IE + care-routing discipline; the heuristics stand in for the LLM pass.
 */
export const deterministicScorer: Scorer = {
  score(input: TranscriptInput): FanInsightRecord {
    const text = fanText(input);
    const topicId = classifyTopic(text, input.topicHint);
    const topic = TAXONOMY_BY_ID[topicId];

    const care = careLevel(text, input.ageBand);
    const sentiment = sentimentScore(text);
    const contextDepth = contextDepthScore(text);
    const significance = significanceScore(text, care);

    // Intent clarity: proxy from an identifiable question/request plus context.
    const question = questionSentence(input);
    const request = requestSentence(input);
    const messiInvited = input.turns.some(
      (t) => t.speaker === "messi" && /(what would you like|tell me|what should we talk|qué te gustaría)/i.test(t.text),
    );
    let intentClarity: 1 | 2 | 3 | 4 | 5 | "NE" = 3;
    if (!messiInvited && !question && !request) intentClarity = "NE";
    else if (question && contextDepth >= 4) intentClarity = 5;
    else if (question || request) intentClarity = contextDepth >= 3 ? 4 : 3;
    else intentClarity = text.length < 60 ? 1 : 2;

    // Content actionability: is there something the team can actually make?
    const producible = /(teach|drill|training|story|tell me about|explain|show me|programme|program|academy|video|routine)/i;
    let actionability: 1 | 2 | 3 | 4 | 5 | "NE" = 2;
    if (!messiInvited && !request && !question) actionability = "NE";
    else if (request && producible.test(request)) actionability = 5;
    else if (request) actionability = 4;
    else if (question && producible.test(question)) actionability = 4;
    else if (question) actionability = 3;
    else actionability = 2;

    // Continuity confirmation: did digital Messi reflect back, and did the fan agree?
    const messiReflected = input.turns.some(
      (t) => t.speaker === "messi" && /(what i(')?m hearing|so you|have i understood|is that right|resumiendo|entendí)/i.test(t.text),
    );
    const fanAgreed = input.turns.some(
      (t) => t.speaker === "fan" && /^(yes|yeah|yep|exactly|that's right|sí|si,|correct|isso|na'am)/i.test(t.text.trim()),
    );
    const fanCorrected = input.turns.some(
      (t) => t.speaker === "fan" && /(not exactly|actually|no,|más bien|not quite)/i.test(t.text),
    );
    const confirmation = messiReflected
      ? fanAgreed
        ? "C"
        : fanCorrected
          ? "CC"
          : "NC"
      : "NE";

    const clarityNumeric = intentClarity === "NE" ? 1 : intentClarity;
    const confidence = confidenceFrom(contextDepth, clarityNumeric);

    // --- memory & continuity (slide 6) ---
    const memoryConsent = !!input.memoryConsent;
    const memoryCandidate = extractMemory(input, text);
    const continuityHook =
      memoryConsent && memoryCandidate && (confirmation === "C" || confirmation === "CC")
        ? `Last time you told me ${lowerFirst(memoryCandidate)} — how did it go?`
        : null;

    // --- human-review triggers ---
    const humanReviewReasons: string[] = [];
    if (care === "Critical") humanReviewReasons.push("Care level: Critical — safeguarding protocol");
    else if (care === "Care") humanReviewReasons.push("Care level: Care — same-day fan-care review");
    if (significance === 5) humanReviewReasons.push("Relationship significance 5 (life-defining)");
    if (topic?.sensitive) humanReviewReasons.push("Reserved / brand-sensitive topic");
    if ((confidence === "low" || confidence === "insufficient") && significance >= 4) {
      humanReviewReasons.push("Low confidence on a high-significance conversation");
    }
    if (confirmation === "NC" && memoryCandidate) {
      humanReviewReasons.push("Memory candidate not confirmed by the fan");
    }
    if ((input.ageBand === "under-13" || input.ageBand === "13-17") && significance >= 4) {
      humanReviewReasons.push("Minor + high significance — review before any content use");
    }

    const painOrHopeQuote =
      firstFanTurnContaining(input, [...WATCH_SIGNALS, ...NEG_WORDS]) ??
      firstFanTurnContaining(input, POS_WORDS);

    return {
      reference: input.reference,
      language: input.language,
      country: input.country,
      region: input.region,
      territory: input.territory,
      tier: input.tier,
      surface: input.surface,
      ageBand: input.ageBand,
      topicL1: topic?.label ?? "Gratitude & personal stories",
      topicL2: topic ? classifyLevel2(text, topic.level2) : null,
      keywords: extractKeywords(text, topicId),
      sentiment: {
        overall: { value: sentiment, confidence, evidenceQuote: painOrHopeQuote },
        targets: sentimentTargets(input, topicId),
      },
      intentClarity: { value: intentClarity, confidence, evidenceQuote: question ?? request },
      contextDepth: { value: contextDepth, confidence, evidenceQuote: painOrHopeQuote },
      significance: { value: significance, confidence, evidenceQuote: painOrHopeQuote },
      actionability: { value: actionability, confidence, evidenceQuote: request ?? question },
      confirmation,
      care,
      questionAsked: question,
      contentRequest: request,
      summary: buildSummary(input, topic?.label ?? "their relationship with Messi", question, request),
      memoryCandidate,
      memoryConsent,
      continuityHook,
      humanReview: humanReviewReasons.length > 0,
      humanReviewReasons,
      brandSensitive: !!topic?.sensitive,
    };
  },
};

/** A durable, factual fragment worth carrying into the next conversation. */
function extractMemory(input: TranscriptInput, text: string): string | null {
  const all = sentences(text);
  const dated = all.find((s) => MILESTONE_CUES.some((c) => s.toLowerCase().includes(c)));
  if (dated) return trimTo(dated, 120);
  const goal = all.find((s) => /(i want to|i'm trying to|i am trying to|my dream is|i hope to|quiero)/i.test(s));
  if (goal) return trimTo(goal, 120);
  const situation = input.turns.find((t) => t.speaker === "fan" && /(my (coach|club|team|school|academy))/i.test(t.text));
  return situation ? trimTo(sentences(situation.text)[0] ?? situation.text, 120) : null;
}

function extractKeywords(text: string, topicId: string): string[] {
  const pool = TOPIC_KEYWORDS[topicId] ?? [];
  const lower = text.toLowerCase();
  return pool.filter((k) => lower.includes(k)).slice(0, 5);
}

function buildSummary(
  input: TranscriptInput,
  topic: string,
  question: string | null,
  request: string | null,
): string {
  const where = input.region ? `${input.region}, ${input.country}` : input.country;
  const opener = question
    ? `Fan from ${where} asked about ${topic.toLowerCase()}: "${trimTo(question, 110)}"`
    : `Fan from ${where} shared a personal story about ${topic.toLowerCase()}.`;
  const ask = request ? ` They asked for: ${trimTo(request.replace(/\.$/, ""), 110)}.` : "";
  return `${opener}${ask}`;
}

function trimTo(s: string, n: number): string {
  const clean = s.trim();
  return clean.length <= n ? clean : clean.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
