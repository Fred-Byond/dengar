/**
 * The three vertical packs.
 *
 * Populated from the source papers, not invented. Where a paper leaves
 * something unstated it is left unstated here too — the gate will report it,
 * which is the point. A library that passes on first run is a library nobody
 * has told the truth about.
 */

import type { VerticalPack } from "./schema";

export const VERTICALS: VerticalPack[] = [
  {
    id: "auren",
    name: "AUREN",
    programme: "Investor readiness and scam resistance",
    source: "AUREN Paper III v1.1 · Paper IV v1.0",
    doctrine: "dual",
    modes: ["LEARN", "REHEARSE", "PROTECT"],
    languages: ["EN", "ES", "ZH", "AR"],
    markets: ["GLOBAL"],
    anchorAuthority: "IOSCO investor-education principles · OECD/INFE competence framework",
    outputObject: "Investor Readiness Record",
    humanAuthority: "Coach-only. The learner decides.",
    surfaces: [
      { id: "rehearse", name: "Rehearse", assesses: true, adversarial: true },
      { id: "learn", name: "Learn", assesses: false, adversarial: false },
      { id: "protect", name: "Protect", assesses: false, adversarial: false },
    ],
    accent: "#7C6BC4",
  },
  {
    id: "pioneer",
    name: "Project Pioneer",
    programme: "Investigation-ready police reporting · PDRM",
    source: "Pioneer Paper III v1.0 · Paper IV v1.0 (KB Spec)",
    // Absolute. An adversarial police interview engine is not a feature.
    doctrine: "neutral",
    modes: ["CAPTURE"],
    languages: ["BM", "EN", "ZH", "TA"],
    markets: ["MY"],
    anchorAuthority: "Penal Code · Criminal Procedure Code · AGC validation",
    outputObject: "Element Coverage Record",
    humanAuthority: "Recommendation-only. The officer certifies.",
    surfaces: [
      { id: "kiosk", name: "Reporting Concierge", assesses: false, adversarial: false },
      { id: "console", name: "Officer's Console", assesses: false, adversarial: false },
    ],
    accent: "#4E7C96",
  },
  {
    id: "beauty",
    name: "Beauty Intelligence",
    programme: "One intelligence, two audiences · GCC and SEA",
    source: "Beauty Intelligence solution paper",
    doctrine: "dual",
    modes: ["COACH", "CONCIERGE"],
    languages: ["EN", "AR", "FR", "ZH"],
    markets: ["AE", "SA", "MY", "SG"],
    anchorAuthority: "Approved claims library · market regulatory position",
    outputObject: "Certification record",
    humanAuthority: "The advisor closes. The platform hands over.",
    surfaces: [
      { id: "coach", name: "Beauty Coach", assesses: true, adversarial: true },
      { id: "concierge", name: "Beauty Concierge", assesses: false, adversarial: false },
    ],
    accent: "#A8617A",
  },
];

export function vertical(id: string): VerticalPack {
  return VERTICALS.find((v) => v.id === id) ?? VERTICALS[0];
}
