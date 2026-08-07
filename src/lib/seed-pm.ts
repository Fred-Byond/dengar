/**
 * Deterministic synthetic session generator for the PMO deployment.
 *
 * Builds realistic bilingual 5-minute PM transcripts from the deployment
 * profile's content packs and runs each through the REAL CVIF scorer,
 * configured with the PMO taxonomy — so the PM Session Explorer and the PM
 * briefing show genuine engine output, not hand-authored rows.
 *
 * Seeded (mulberry32) so server and client render identically and the
 * dataset is stable across reloads.
 */

import { createDeterministicScorer } from "./cvif";
import type { TranscriptInput, TranscriptTurn } from "./cvif";
import { PMO_PROFILE, type SessionVariant } from "./deployments";
import type { SeededSession } from "./seed";

const pmScorer = createDeterministicScorer({
  taxonomy: PMO_PROFILE.taxonomy,
  topicKeywords: PMO_PROFILE.topicKeywords,
});

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Population-weighted, matching the PM dashboard's state volumes. */
const STATE_WEIGHTS: [string, number][] = [
  ["Selangor", 820], ["Kuala Lumpur", 640], ["Johor", 540], ["Penang", 372],
  ["Sabah", 334], ["Perak", 311], ["Sarawak", 300], ["Kedah", 228],
  ["Kelantan", 214], ["Pahang", 189], ["N. Sembilan", 172], ["Terengganu", 158],
  ["Melaka", 143], ["Putrajaya", 66], ["Perlis", 64], ["Labuan", 36],
];

const DISTRICTS: Record<string, string[]> = {
  Selangor: ["Petaling", "Klang", "Hulu Langat", "Gombak", "Sepang"],
  "Kuala Lumpur": ["Bukit Bintang", "Kepong", "Cheras", "Wangsa Maju"],
  Johor: ["Johor Bahru", "Batu Pahat", "Kluang", "Muar", "Kulai"],
  Penang: ["Timur Laut", "Barat Daya", "SP Tengah", "SP Utara"],
  Sabah: ["Kota Kinabalu", "Sandakan", "Tawau", "Lahad Datu", "Keningau"],
  Perak: ["Kinta", "Larut Matang", "Manjung", "Kerian"],
  Sarawak: ["Kuching", "Miri", "Sibu", "Bintulu"],
  Kedah: ["Kota Setar", "Kuala Muda", "Kulim", "Baling"],
  Kelantan: ["Kota Bharu", "Pasir Mas", "Tumpat", "Tanah Merah"],
  Pahang: ["Kuantan", "Temerloh", "Bentong", "Cameron Highlands"],
  "N. Sembilan": ["Seremban", "Port Dickson", "Jempol"],
  Terengganu: ["Kuala Terengganu", "Kemaman", "Dungun"],
  Melaka: ["Melaka Tengah", "Alor Gajah", "Jasin"],
  Putrajaya: ["Presint 8", "Presint 14"],
  Perlis: ["Kangar", "Arau"],
  Labuan: ["Victoria"],
};

const LANGS = [
  { label: "Bahasa Melayu", weight: 54 },
  { label: "English", weight: 20 },
  { label: "中文", weight: 14 },
  { label: "தமிழ்", weight: 8 },
  { label: "العربية", weight: 4 },
];

const FIRST = ["Aiman", "Siti", "Wei Ming", "Kavitha", "Ahmad", "Nurul", "Ravi", "Mei Ling", "Farah", "Daniel", "Hafiz", "Priya", "Chong", "Aisyah", "Kumar", "Zul", "Sarah", "Jason"];
const LAST = ["bin Rahim", "binti Yusof", "Tan", "a/l Muthu", "bin Ismail", "Lim", "a/p Suppiah", "binti Aziz", "Wong", "bin Abdullah"];

function weightedPick<T extends { weight: number }>(rng: () => number, items: T[]): T {
  const total = items.reduce((a, b) => a + b.weight, 0);
  let r = rng() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

function pickState(rng: () => number): string {
  const total = STATE_WEIGHTS.reduce((a, b) => a + b[1], 0);
  let r = rng() * total;
  for (const [s, w] of STATE_WEIGHTS) {
    r -= w;
    if (r <= 0) return s;
  }
  return "Selangor";
}

function maskName(name: string): string {
  return name
    .split(" ")
    .map((part, i) => (i === 0 ? part[0] + "•".repeat(Math.max(2, part.length - 1)) : "•".repeat(2)))
    .join(" ");
}

function timeLabelFrom(rng: () => number): string {
  const bucket = rng();
  if (bucket < 0.25) return `${2 + Math.floor(rng() * 55)} min ago`;
  if (bucket < 0.7) return `${1 + Math.floor(rng() * 20)} h ago`;
  return `${1 + Math.floor(rng() * 26)} days ago`;
}

/* The PM's controlled-session script (matches the citizen prototype). */
const PM_GREET =
  "Welcome. This is your five minutes with me. Tell me honestly — how is life for you and your family, and what should the government prioritise for the country?";
const PM_PROBE = "Thank you. Which part of the country does this affect, and what would you want us to do about it?";
const PM_CONFIRM = "So what I am hearing is your concern and your request. Have I understood you correctly?";
const PM_CLOSE =
  "Thank you for contributing your voice to build a better Malaysia for all. I take note of what you have raised, and my team will follow through.";

export function generatePmSessions(count = 260, seed = 20260807): SeededSession[] {
  const rng = mulberry32(seed);
  const out: SeededSession[] = [];

  for (let i = 0; i < count; i++) {
    const state = pickState(rng);
    const districts = DISTRICTS[state] ?? ["Central"];
    const district = districts[Math.floor(rng() * districts.length)];
    const lang = weightedPick(rng, LANGS);
    const pack = weightedPick(rng, PMO_PROFILE.packs);
    const variant: SessionVariant = weightedPick(rng, pack.variants);

    const name = `${FIRST[Math.floor(rng() * FIRST.length)]} ${LAST[Math.floor(rng() * LAST.length)]}`;
    const reference = `${PMO_PROFILE.referencePrefix}-2026-${String(4000 + i).padStart(6, "0").slice(-6)}`;

    // Not every session reaches the confirm step — keeps the NE/IE data honest.
    const reachedConfirm = rng() > 0.18;

    const englishTurns: TranscriptTurn[] = [
      { speaker: "minister", text: PM_GREET, at: "0:00" },
      { speaker: "citizen", text: variant.issueEN, at: "0:40" },
      { speaker: "minister", text: PM_PROBE, at: "2:10" },
      { speaker: "citizen", text: `${variant.impactEN} ${variant.askEN}`, at: "2:30" },
    ];
    const originalTurns: TranscriptTurn[] = [
      { speaker: "minister", text: PM_GREET, at: "0:00" },
      { speaker: "citizen", text: variant.issueOriginal, at: "0:40" },
      { speaker: "minister", text: PM_PROBE, at: "2:10" },
      { speaker: "citizen", text: `${variant.impactEN} ${variant.askEN}`, at: "2:30" },
    ];
    if (reachedConfirm) {
      englishTurns.push(
        { speaker: "minister", text: PM_CONFIRM, at: "3:40" },
        { speaker: "citizen", text: "Yes, that is exactly right.", at: "4:05" },
      );
      originalTurns.push(
        { speaker: "minister", text: PM_CONFIRM, at: "3:40" },
        { speaker: "citizen", text: "Ya, betul sekali.", at: "4:05" },
      );
    }
    englishTurns.push({ speaker: "minister", text: PM_CLOSE, at: "4:30" });
    originalTurns.push({ speaker: "minister", text: PM_CLOSE, at: "4:30" });

    const input: TranscriptInput = {
      reference,
      language: lang.label,
      state,
      district,
      turns: englishTurns,
    };
    const record = pmScorer.score(input);

    out.push({
      record,
      citizenName: name,
      citizenNameMasked: maskName(name),
      satisfaction: (3 + Math.floor(rng() * 3)) as 3 | 4 | 5,
      timeLabel: timeLabelFrom(rng),
      transcript: { original: originalTurns, english: englishTurns },
      languageLabel: lang.label,
    });
  }

  return out;
}
