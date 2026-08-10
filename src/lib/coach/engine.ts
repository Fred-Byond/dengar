/**
 * The conversation engine — the brain dengar never had.
 *
 * Governed generation: the coach answers ONLY from the launch knowledge pack.
 * Primary engine is Claude (Anthropic SDK, requires ANTHROPIC_API_KEY);
 * without a key the deterministic governed fallback answers from pack
 * sections directly, so the product demos end-to-end offline.
 */

import Anthropic from "@anthropic-ai/sdk";
import { getLanguage } from "./languages";
import { getDivision } from "./org";
import { BEAUTY_COACH_PERSONA } from "./persona";
import type {
  AdvisorContext,
  CoachingFocus,
  CoachTurn,
  LaunchPack,
  Product,
} from "./types";

export interface EngineContext {
  advisor: Pick<AdvisorContext, "advisorName" | "role" | "marketName">;
  product: Product;
  pack: LaunchPack;
  focus: CoachingFocus;
  language: string;
}

export function activeEngineName(): string {
  return process.env["ANTHROPIC_API_KEY"] ? "claude" : "governed-fallback";
}

function packToPromptText(pack: LaunchPack, product: Product): string {
  const sections = pack.sections
    .map((s) => `### ${s.title}\n${s.content}`)
    .join("\n\n");
  const objections = pack.objections
    .map((o) => `- Customer says: "${o.objection}"\n  Approved response: "${o.approvedResponse}"`)
    .join("\n");
  return [
    `# Launch Knowledge Pack — ${product.name} (v${pack.version})`,
    sections,
    `### Objection handling library\n${objections}`,
    `### Do NOT say (forbidden wording)\n${pack.doNotSay.map((d) => `- "${d}"`).join("\n")}`,
  ].join("\n\n");
}

function buildSystemPrompt(ctx: EngineContext): string {
  const p = BEAUTY_COACH_PERSONA;
  const lang = getLanguage(ctx.language);
  const division = getDivision(ctx.product.divisionId ?? "");
  const guardrails = [...p.guardrails];
  if (division) guardrails.push(division.guardrail);
  return [
    `You are ${p.displayName} — ${p.roleLine}. You are coaching ${ctx.advisor.advisorName}, a ${ctx.advisor.role} in ${ctx.advisor.marketName}, on the launch of ${ctx.product.name} (${ctx.product.brand}). Today's coaching focus: ${ctx.focus.replace("-", " ")}.`,
    `Speak ONLY in ${lang ? lang.englishName : ctx.language}. Every word you say — including praise, questions and role-play — must be in that language, because this is the language the advisor will use with customers.`,
    division
      ? `Division context: ${division.name}. You are coaching a ${division.advisorType}. ${division.coachEmphasis}`
      : "",
    `Rules:\n${guardrails.map((g) => `- ${g}`).join("\n")}`,
    `Coach actively: after answering, often follow with one short question that makes the advisor practise — e.g. ask them to phrase the claim to a customer, or handle an objection. Praise specifically when they use approved wording correctly; correct gently when they drift from it.`,
    `The approved claims below are legally reviewed wording for THIS market and language. Never translate a claim yourself and never paraphrase one — quote it exactly as written.`,
    packToPromptText(ctx.pack, ctx.product),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Connective phrases the fallback engine wraps around pack content. Coach
 * framing must be in the session language too — an Arabic session where the
 * coach frames its answer in English breaks both the illusion and the
 * training value.
 */
const CONNECTIVES: Record<
  string,
  { objection: string; section: string; anchor: string; practise: string }
> = {
  EN: {
    objection: "That's a common one — here is the approved way to answer it.",
    section: "Good question. From the approved launch material:",
    anchor: "Let me anchor us on the key message.",
    practise: "Now say that in your own words to a customer.",
  },
  FR: {
    objection: "C'est une objection fréquente — voici la réponse approuvée.",
    section: "Bonne question. D'après le matériel de lancement approuvé :",
    anchor: "Revenons au message clé.",
    practise: "Maintenant, reformulez-le avec vos mots à une cliente.",
  },
  AR: {
    objection: "هذا اعتراض شائع — وهذه هي الإجابة المعتمدة.",
    section: "سؤال جيد. من المادة المعتمدة للإطلاق:",
    anchor: "لنعد إلى الرسالة الأساسية.",
    practise: "الآن قوليها بأسلوبك الخاص للعميلة.",
  },
  ZH: {
    objection: "这是常见的异议——以下是官方认可的回应方式。",
    section: "好问题。根据官方认可的上新资料：",
    anchor: "我们回到核心信息。",
    practise: "现在请用您自己的话向顾客说一遍。",
  },
  JA: {
    objection: "よくあるご質問です。承認された回答はこちらです。",
    section: "良いご質問です。承認された発売資料より:",
    anchor: "キーメッセージに戻りましょう。",
    practise: "では、ご自身の言葉でお客様にお伝えしてみてください。",
  },
  HI: {
    objection: "यह आम आपत्ति है — इसका स्वीकृत जवाब यह है।",
    section: "अच्छा सवाल। स्वीकृत लॉन्च सामग्री के अनुसार:",
    anchor: "आइए मुख्य संदेश पर लौटें।",
    practise: "अब इसे अपने शब्दों में ग्राहक को कहकर दिखाइए।",
  },
};

/** Keyword-match utterance to pack content for the fallback engine. */
function bestFallbackReply(utterance: string, ctx: EngineContext): string {
  const text = utterance.toLowerCase();
  const c = CONNECTIVES[ctx.language] ?? CONNECTIVES.EN;
  for (const obj of ctx.pack.objections) {
    if (obj.keywords.some((k) => text.includes(k.toLowerCase()))) {
      return `${c.objection} ${obj.approvedResponse} ${c.practise}`;
    }
  }
  let best: { score: number; content: string } | null = null;
  for (const s of ctx.pack.sections) {
    const score = s.keywords.reduce(
      (acc, k) => acc + (text.includes(k.toLowerCase()) ? 1 : 0),
      0
    );
    if (score > 0 && (!best || score > best.score)) {
      best = { score, content: s.content };
    }
  }
  if (best) {
    return `${c.section} ${best.content} ${c.practise}`;
  }
  const focusSection =
    ctx.pack.sections.find((s) =>
      ctx.focus === "price-positioning"
        ? s.id === "price"
        : ctx.focus === "routine-building"
          ? s.id === "routine"
          : s.id === "claims"
    ) ?? ctx.pack.sections[0];
  return `${c.anchor} ${focusSection.content} ${c.practise}`;
}

/**
 * One coaching turn: history + new advisor utterance → coach reply text.
 * Claude when ANTHROPIC_API_KEY is set; governed fallback otherwise, and on
 * API failure (a silent coach is worse than a fallback reply).
 */
export async function coachReply(
  ctx: EngineContext,
  history: CoachTurn[],
  utterance: string
): Promise<{ reply: string; engine: string }> {
  if (!process.env["ANTHROPIC_API_KEY"]) {
    return { reply: bestFallbackReply(utterance, ctx), engine: "governed-fallback" };
  }
  try {
    const client = new Anthropic();
    const messages: Anthropic.MessageParam[] = [];
    for (const t of history) {
      messages.push({
        role: t.speaker === "advisor" ? "user" : "assistant",
        content: t.text,
      });
    }
    messages.push({ role: "user", content: utterance });

    const response = await client.messages.create({
      model: process.env["COACH_MODEL"] || "claude-opus-5",
      max_tokens: 1024,
      output_config: { effort: "low" },
      system: [
        {
          type: "text",
          text: buildSystemPrompt(ctx),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });
    if (response.stop_reason === "refusal") {
      return { reply: bestFallbackReply(utterance, ctx), engine: "claude" };
    }
    const text = response.content
      .filter(
        (b): b is Anthropic.TextBlock => b.type === "text"
      )
      .map((b) => b.text)
      .join(" ")
      .trim();
    if (!text) {
      return { reply: bestFallbackReply(utterance, ctx), engine: "claude" };
    }
    return { reply: text, engine: "claude" };
  } catch {
    return { reply: bestFallbackReply(utterance, ctx), engine: "governed-fallback" };
  }
}
