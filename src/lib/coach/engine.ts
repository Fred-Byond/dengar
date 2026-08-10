/**
 * The conversation engine — the brain dengar never had.
 *
 * Governed generation: the coach answers ONLY from the launch knowledge pack.
 * Primary engine is Claude (Anthropic SDK, requires ANTHROPIC_API_KEY);
 * without a key the deterministic governed fallback answers from pack
 * sections directly, so the product demos end-to-end offline.
 */

import Anthropic from "@anthropic-ai/sdk";
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
  return [
    `You are ${p.displayName} — ${p.roleLine}. You are coaching ${ctx.advisor.advisorName}, a ${ctx.advisor.role} in ${ctx.advisor.marketName}, on the launch of ${ctx.product.name}. Today's coaching focus: ${ctx.focus.replace("-", " ")}. Speak in ${ctx.language === "EN" ? "English" : ctx.language}.`,
    `Rules:\n${p.guardrails.map((g) => `- ${g}`).join("\n")}`,
    `Coach actively: after answering, often follow with one short question that makes the advisor practise — e.g. ask them to phrase the claim to a customer, or handle an objection. Praise specifically when they use approved wording correctly; correct gently when they drift from it.`,
    packToPromptText(ctx.pack, ctx.product),
  ].join("\n\n");
}

/** Keyword-match utterance to pack content for the fallback engine. */
function bestFallbackReply(utterance: string, ctx: EngineContext): string {
  const text = utterance.toLowerCase();
  for (const obj of ctx.pack.objections) {
    if (obj.keywords.some((k) => text.includes(k))) {
      return `That's a common one — here is the approved way to answer it. ${obj.approvedResponse} Try saying that in your own words to a customer.`;
    }
  }
  let best: { score: number; content: string } | null = null;
  for (const s of ctx.pack.sections) {
    const score = s.keywords.reduce(
      (acc, k) => acc + (text.includes(k) ? 1 : 0),
      0
    );
    if (score > 0 && (!best || score > best.score)) {
      best = { score, content: s.content };
    }
  }
  if (best) {
    return `Good question. From the approved launch material: ${best.content} How would you explain that to a customer in one sentence?`;
  }
  const focusSection =
    ctx.pack.sections.find((s) =>
      ctx.focus === "price-positioning"
        ? s.id === "price"
        : ctx.focus === "routine-building"
          ? s.id === "routine"
          : s.id === "claims"
    ) ?? ctx.pack.sections[0];
  return `Let me anchor us on the key message. ${focusSection.content} Which part of that would you like to practise saying?`;
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
