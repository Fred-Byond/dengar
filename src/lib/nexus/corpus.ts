/**
 * AUREN Nexus — the seeded corpus.
 *
 * Contributing authorities and the signals they have lodged. The typologies
 * are the documented ones that securities regulators publish investor alerts
 * about; the point of writing them down in this shape is that a tactic
 * described consistently by eight authorities is a tactic that can be
 * rehearsed against, and a tactic described eight different ways is not.
 *
 * The signals are deliberately at DIFFERENT pipeline stages, including one
 * declined and one that cannot be derived from at all. A corpus where
 * everything is clean is a corpus nobody has used.
 */

import type { ContributingAuthority, ThreatSignal } from "./signal";

export const AUTHORITIES: ContributingAuthority[] = [
  { id: "AUTH-IOSCO", name: "IOSCO — coordinating secretariat", jurisdiction: "GLOBAL", sharesToNetwork: true },
  { id: "AUTH-SC-MY", name: "Securities Commission Malaysia", jurisdiction: "MY", sharesToNetwork: true },
  { id: "AUTH-FCA-UK", name: "Financial Conduct Authority", jurisdiction: "GB", sharesToNetwork: true },
  { id: "AUTH-MAS-SG", name: "Monetary Authority of Singapore", jurisdiction: "SG", sharesToNetwork: true },
  { id: "AUTH-CNMV-ES", name: "Comisión Nacional del Mercado de Valores", jurisdiction: "ES", sharesToNetwork: true },
  { id: "AUTH-SCA-AE", name: "Securities and Commodities Authority", jurisdiction: "AE", sharesToNetwork: false },
];

export function authority(id: string): ContributingAuthority | undefined {
  return AUTHORITIES.find((a) => a.id === id);
}

export const SIGNALS: ThreatSignal[] = [
  {
    id: "SIG-2026-0117",
    title: "Synthetic executive endorsement in paid social video",
    authorityId: "AUTH-FCA-UK",
    jurisdiction: "GB",
    observedFrom: "2026-05-02",
    surface: {
      typology: "TYP-SYNTHETIC-ENDORSEMENT",
      channel: "CH-SOCIAL-AD",
      persona: "PER-RETAIL-PEER",
      productClass: "PC-TOKEN",
    },
    method:
      "A short generated video shows a recognisable business figure describing a fund as somewhere they hold personal capital. The clip is placed as a paid advertisement and links to a funnel that collects a phone number before showing any terms. The endorsement is never claimed in writing, only spoken on video, which keeps it out of the text a compliance scraper would read.",
    indicators: [
      "Endorsement exists only in video, never in written copy",
      "Contact details collected before any product terms are shown",
      "Figure's own organisation has issued no corresponding statement",
      "Comments disabled or heavily moderated on the placement",
    ],
    targetProfile: "Retail, 35–65, prior interest in digital assets",
    defeats:
      "Questions authority claims. The investor treats a recognisable person's apparent endorsement as evidence about the offer, and stops asking who is actually authorised to sell it.",
    confidence: "corroborated",
    sharing: "GREEN",
    status: "RELEASED",
    derivedObjectIds: ["CH-2026-0117", "FAIL-2026-0117", "Q-2026-0117"],
    declineReason: null,
    supersededBy: null,
  },
  {
    id: "SIG-2026-0164",
    title: "Recovery approach to victims of an earlier collapse",
    authorityId: "AUTH-SC-MY",
    jurisdiction: "MY",
    observedFrom: "2026-06-19",
    surface: {
      typology: "TYP-RECOVERY",
      channel: "CH-VOICE",
      persona: "PER-AUTHORITY",
      productClass: "PC-MANAGED",
    },
    method:
      "Callers contact people already known to have lost money in a named collapse, presenting as acting for or alongside the supervisor. They quote the victim's real loss figure — obtained from lists circulating after the collapse — as proof of legitimacy, then require an advance fee framed as a legal or escrow cost before recovered funds can be released.",
    indicators: [
      "Caller already knows the exact loss amount",
      "Fee required before any recovery is demonstrated",
      "Supervisor's name invoked but no case reference that can be checked independently",
      "Pressure framed as a closing window on a recovery pool",
    ],
    targetProfile: "Prior victims, all ages; highest susceptibility 60+",
    defeats:
      "Independent verification, under the specific condition that the caller already appears to hold private information. Knowing the loss figure is treated as proof of standing rather than as evidence the list leaked.",
    confidence: "corroborated",
    sharing: "AMBER",
    status: "IN_REVIEW",
    derivedObjectIds: ["CH-2026-0164", "FAIL-2026-0164", "Q-2026-0164"],
    declineReason: null,
    supersededBy: null,
  },
  {
    id: "SIG-2026-0188",
    title: "Task-based onboarding converting to managed account",
    authorityId: "AUTH-MAS-SG",
    jurisdiction: "SG",
    observedFrom: "2026-07-08",
    surface: {
      typology: "TYP-TASK-ONBOARDING",
      channel: "CH-MESSAGING",
      persona: "PER-SUPPORT",
      productClass: "PC-MANAGED",
    },
    method:
      "Targets are recruited to a paid micro-task group and paid promptly for the first several rounds, establishing a working pattern of deposits and withdrawals. Once withdrawal has been demonstrated as reliable, a managed-account tier is introduced requiring a larger deposit to unlock higher-value tasks. Withdrawals stop at that tier.",
    indicators: [
      "Early withdrawals honoured quickly and visibly",
      "Deposit thresholds rise in steps rather than once",
      "Group chat contains other participants confirming payouts",
      "Platform exists only inside the messaging app",
    ],
    targetProfile: "Retail, 20–40, seeking supplementary income",
    defeats:
      "Payment-destination scrutiny. Because early withdrawals worked, the destination stops being questioned at exactly the point the amounts become material.",
    confidence: "corroborated",
    sharing: "GREEN",
    status: "DERIVED",
    derivedObjectIds: ["CH-2026-0188", "FAIL-2026-0188", "Q-2026-0188"],
    declineReason: null,
    supersededBy: null,
  },
  {
    id: "SIG-2026-0203",
    title: "Automated-trading performance claim with capital-protection wrapper",
    authorityId: "AUTH-CNMV-ES",
    jurisdiction: "ES",
    observedFrom: "2026-07-24",
    surface: {
      typology: "TYP-AI-PERFORMANCE",
      channel: "CH-VIDEO",
      persona: "PER-INSTITUTIONAL",
      productClass: "PC-FX-CFD",
    },
    method:
      "A video meeting with an apparent institutional desk presents a model-driven strategy with a monthly return band and a described capital-protection layer. The protection is attributed to an unnamed counterparty and never documented. The technical explanation is detailed enough to satisfy a lay listener and unfalsifiable enough to survive questioning.",
    indicators: [
      "Return described as a band rather than a projection",
      "Capital protection asserted but counterparty unnamed",
      "Model described in detail; licence never mentioned unprompted",
      "Meeting recorded by them, not shareable by you",
    ],
    targetProfile: "Retail and semi-professional, 40–70, some market experience",
    defeats:
      "AI-capability scepticism and understanding of downside together. The sophistication of the model explanation is read as evidence the returns are real, and the protection claim removes the loss question entirely.",
    confidence: "single-source",
    sharing: "AMBER",
    status: "TRIAGED",
    derivedObjectIds: [],
    declineReason: null,
    supersededBy: null,
  },
  {
    id: "SIG-2026-0211",
    title: "Pre-IPO allocation with a same-day close",
    authorityId: "AUTH-SCA-AE",
    jurisdiction: "AE",
    observedFrom: "2026-08-03",
    surface: {
      typology: "TYP-PRE-IPO",
      channel: "CH-VOICE",
      persona: "PER-INSTITUTIONAL",
      productClass: "PC-EQUITY",
    },
    method:
      "Cold approach offering a provisional allocation in an unlisted company said to be approaching listing. The allocation is described as held and expiring the same day. Documentation is produced on request and is internally consistent but references no registry entry that can be independently searched.",
    indicators: [
      "Allocation described as already reserved in the target's name",
      "Same-day or next-day expiry",
      "Documents reference an entity with no searchable registration",
      "Payment routed to an account name that differs from the firm name",
    ],
    targetProfile: "Retail with investable surplus, 45–70",
    defeats:
      "Resists urgency. The deadline is manufactured and verification behaviour collapses the moment the clock is introduced.",
    confidence: "corroborated",
    sharing: "RED",
    status: "SUBMITTED",
    derivedObjectIds: [],
    declineReason: null,
    supersededBy: null,
  },
  {
    id: "SIG-2026-0219",
    title: "Reported increase in unsolicited investment contact",
    authorityId: "AUTH-IOSCO",
    jurisdiction: "GLOBAL",
    observedFrom: "2026-08-11",
    surface: { typology: "", channel: "", persona: "", productClass: "" },
    method:
      "Aggregated member reporting indicates a broad rise in unsolicited investment approaches across several markets during the period.",
    indicators: [],
    targetProfile: "Unspecified",
    defeats: "",
    confidence: "unverified",
    sharing: "CLEAR",
    status: "DECLINED",
    derivedObjectIds: [],
    declineReason:
      "Not a tactic. This is a volume observation with no method, no indicators and no statement of what reasoning it defeats — there is nothing here a person could be trained to notice. Valuable for supervisory reporting, unusable as training intelligence. Returned to IOSCO with a request for the underlying case narratives.",
    supersededBy: null,
  },
];

export function signal(id: string): ThreatSignal | undefined {
  return SIGNALS.find((s) => s.id === id);
}
