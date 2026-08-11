/**
 * Speech-to-text via Whisper.
 *
 * The coach is graded on what the advisor actually said, so the transcript is
 * evidence, not convenience — a mis-transcription becomes a wrong score with a
 * verbatim quote attached to it. Two consequences shape this module:
 *
 *  1. The session language is PINNED, never auto-detected. Whisper guesses
 *     language from short audio and confuses neighbours (Arabic/Farsi/Urdu,
 *     Hindi/Marathi). A guess that lands one language off would score the
 *     advisor against a pack they were not speaking.
 *  2. A failed transcription returns null rather than a best-effort string.
 *     The UI falls back to typing; it never invents an utterance.
 *
 * Provider is configurable so a pilot can run against OpenAI's hosted Whisper
 * and a production deployment can point at a self-hosted endpoint inside the
 * client's own network — which is where a beauty-advisor voice corpus with
 * named staff will have to live for most L'Oréal markets.
 */

import { getLanguage } from "./languages";

/** Whisper-compatible endpoint. Defaults to OpenAI's hosted API. */
const WHISPER_URL =
  process.env["WHISPER_API_URL"] || "https://api.openai.com/v1/audio/transcriptions";
const WHISPER_MODEL = process.env["WHISPER_MODEL"] || "whisper-1";

export function sttConfigured(): boolean {
  return Boolean(process.env["WHISPER_API_KEY"] || process.env["OPENAI_API_KEY"]);
}

export interface TranscriptResult {
  text: string;
  language: string;
}

/**
 * Transcribe one utterance. Returns null when STT is unavailable or the audio
 * yields nothing usable — callers must treat null as "advisor should type",
 * never as an empty answer worth scoring.
 */
export async function transcribe(
  audio: Blob,
  languageCode: string
): Promise<TranscriptResult | null> {
  const key = process.env["WHISPER_API_KEY"] || process.env["OPENAI_API_KEY"];
  if (!key) return null;

  const lang = getLanguage(languageCode);
  if (!lang) return null;

  const form = new FormData();
  form.append("file", audio, "utterance.webm");
  form.append("model", WHISPER_MODEL);
  // Pinned, not detected — see module note.
  form.append("language", lang.whisper);
  form.append("response_format", "json");
  // Nudges Whisper toward beauty vocabulary and brand names, which it
  // otherwise mangles ("Kérastase" → "care a stass", "Effaclar" → "F clar").
  form.append("prompt", BEAUTY_HINT[lang.code] ?? BEAUTY_HINT.EN);

  try {
    const res = await fetch(WHISPER_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: string };
    const text = (data.text ?? "").trim();
    if (!text) return null;
    return { text, language: lang.code };
  } catch {
    return null;
  }
}

/**
 * Vocabulary priming per language. Brand names stay in Latin script even in
 * non-Latin transcripts — that is how advisors actually say them, and the
 * fidelity scorer matches approved claims that carry the same spelling.
 */
const BEAUTY_HINT: Record<string, string> = {
  EN: "L'Oréal, Lancôme, La Roche-Posay, Kérastase, CeraVe, Maybelline, Effaclar, Génifique, niacinamide, salicylic acid, hyaluronic acid, serum, SPF, non-comedogenic.",
  FR: "L'Oréal, Lancôme, La Roche-Posay, Kérastase, Effaclar, Génifique, niacinamide, acide salicylique, acide hyaluronique, sérum, SPF, non comédogène.",
  AR: "لوريال، لانكوم، لاروش بوزيه، كيراستاس، سيرافي، ميبيلين، النياسيناميد، حمض الساليسيليك، حمض الهيالورونيك، سيروم، واقي شمس.",
  ZH: "欧莱雅、兰蔻、理肤泉、卡诗、适乐肤、美宝莲、烟酰胺、水杨酸、玻尿酸、精华、防晒。",
  JA: "ロレアル、ランコム、ラロッシュポゼ、ケラスターゼ、セラヴィ、メイベリン、ナイアシンアミド、サリチル酸、ヒアルロン酸、美容液、日焼け止め。",
  HI: "लॉरियल, लैंकोम, ला रोश-पोज़े, केरास्टास, सेरावी, मेबेलिन, नियासिनामाइड, सैलिसिलिक एसिड, हायलुरोनिक एसिड, सीरम, सनस्क्रीन।",
};
