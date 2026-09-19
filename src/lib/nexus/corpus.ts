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

import type { TrainingModule } from "./module";
import type { ContributingAuthority, ThreatSignal } from "./signal";

export const AUTHORITIES: ContributingAuthority[] = [
  { id: "AUTH-IOSCO", name: "IOSCO — coordinating secretariat", jurisdiction: "GLOBAL", sharesToNetwork: true },
  { id: "AUTH-SC-MY", name: "Securities Commission Malaysia", jurisdiction: "MY", sharesToNetwork: true },
  { id: "AUTH-FCA-UK", name: "Financial Conduct Authority", jurisdiction: "GB", sharesToNetwork: true },
  { id: "AUTH-MAS-SG", name: "Monetary Authority of Singapore", jurisdiction: "SG", sharesToNetwork: true },
  { id: "AUTH-CNMV-ES", name: "Comisión Nacional del Mercado de Valores", jurisdiction: "ES", sharesToNetwork: true },
  { id: "AUTH-SCA-AE", name: "Securities and Commodities Authority", jurisdiction: "AE", sharesToNetwork: false },
  /* European members. ESMA is the regional body: it supervises no retail
     investor directly, and the convergence mandate is exactly a right to see
     across national programmes without the right to approve inside them. */
  {
    id: "AUTH-ESMA-EU",
    name: "European Securities and Markets Authority",
    jurisdiction: "EU",
    sharesToNetwork: true,
    scopeJurisdictions: ["ES", "FR", "DE", "IT"],
  },
  { id: "AUTH-AMF-FR", name: "Autorité des marchés financiers", jurisdiction: "FR", sharesToNetwork: true },
  { id: "AUTH-BAFIN-DE", name: "Bundesanstalt für Finanzdienstleistungsaufsicht", jurisdiction: "DE", sharesToNetwork: true },
  { id: "AUTH-CONSOB-IT", name: "Commissione Nazionale per le Società e la Borsa", jurisdiction: "IT", sharesToNetwork: true },
  { id: "AUTH-SFC-HK", name: "Securities and Futures Commission", jurisdiction: "HK", sharesToNetwork: true },
  { id: "AUTH-FSA-JP", name: "金融庁 — Financial Services Agency", jurisdiction: "JP", sharesToNetwork: true },
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

/* ═══════════════════════════════════════════════════════════════════════
   TRAINING MODULES

   What the authorities already have. Deliberately at different stages and in
   different states of usability, because a module queue where everything maps
   cleanly is a queue nobody has put real training material through: real
   curricula state topics rather than behaviours, arrive as internal procedure,
   or turn out to be a superseded edition of something already mapped.
   ═════════════════════════════════════════════════════════════════════ */

export const MODULES: TrainingModule[] = [
  {
    id: "MOD-ES-0041",
    title: "Detección de fraudes de inversión — guía para formadores",
    authorityId: "AUTH-CNMV-ES",
    jurisdiction: "ES",
    edition: "3ª edición",
    publishedOn: "2026-03-11",
    audience: ["AUD-TRAINER", "AUD-RETAIL"],
    languages: ["ES"],
    usageBasis: "own_publication",
    licenceExpires: null,
    scope:
      "Material de formación para las sesiones presenciales de educación financiera: cómo se presentan las ofertas fraudulentas, qué comprobaciones puede hacer un inversor antes de transferir fondos, y cómo se responde a la presión comercial en el momento.",
    outcomes: [
      {
        id: "OUT-ES-1",
        statement:
          "El inversor comprueba en el registro oficial que la entidad está autorizada, y sabe que la comprobación la hace él y no la entidad.",
        clauseId: "CL-ES-1",
      },
      {
        id: "OUT-ES-2",
        statement:
          "El inversor identifica la presión de urgencia como una técnica de venta y no como una característica de la oportunidad.",
        clauseId: "CL-ES-2",
      },
      {
        id: "OUT-ES-3",
        statement:
          "El inversor comprueba a nombre de quién está la cuenta de destino antes de ordenar cualquier transferencia.",
        clauseId: "CL-ES-3",
      },
      {
        id: "OUT-ES-4",
        statement:
          "El inversor consulta con alguien ajeno a la operación antes de comprometer fondos, y no acepta la petición de mantenerla en secreto.",
        clauseId: "CL-ES-4",
      },
    ],
    clauses: [
      {
        id: "CL-ES-1",
        citation: "§2.4, p. 17",
        text: "La verificación en los registros oficiales corresponde siempre al inversor. Una entidad que facilita su propio número de registro no ha acreditado nada: el número debe consultarse en la fuente oficial.",
      },
      {
        id: "CL-ES-2",
        citation: "§3.1, p. 24",
        text: "La urgencia es una técnica de venta. Ninguna oportunidad legítima de inversión pierde su valor porque el inversor se tome el tiempo necesario para verificarla.",
      },
      {
        id: "CL-ES-3",
        citation: "§4.2, p. 31",
        text: "Antes de ordenar una transferencia debe comprobarse la titularidad de la cuenta de destino. Una discrepancia entre el nombre de la entidad y el del titular de la cuenta es motivo suficiente para detener la operación.",
      },
      {
        id: "CL-ES-4",
        citation: "§5.3, p. 38",
        text: "La petición de no comentar la operación con terceros es, por sí sola, un indicador. Consultar con una persona ajena a la operación antes de comprometer fondos es la medida de protección más eficaz de las recogidas en esta guía.",
      },
    ],
    sharing: "CLEAR",
    status: "RELEASED",
    derivedObjectIds: ["E-MOD-ES-0041-1"],
    declineReason: null,
    supersededBy: null,
  },
  {
    id: "MOD-ES-0038",
    title: "Detección de fraudes de inversión — guía para formadores",
    authorityId: "AUTH-CNMV-ES",
    jurisdiction: "ES",
    edition: "2ª edición",
    publishedOn: "2024-09-02",
    audience: ["AUD-TRAINER"],
    languages: ["ES"],
    usageBasis: "own_publication",
    licenceExpires: null,
    scope:
      "Edición anterior de la guía para formadores. Conservada porque hay objetos publicados que citan sus cláusulas y deben volver a anclarse en la 3ª edición.",
    outcomes: [
      {
        id: "OUT-ES38-1",
        statement: "El inversor comprueba que la entidad figura en el registro oficial antes de contratar.",
        clauseId: "CL-ES38-1",
      },
    ],
    clauses: [
      { id: "CL-ES38-1", citation: "§2.2, p. 14", text: "Toda entidad que ofrezca servicios de inversión debe figurar en el registro correspondiente." },
    ],
    sharing: "CLEAR",
    status: "SUPERSEDED",
    derivedObjectIds: [],
    declineReason: null,
    supersededBy: "MOD-ES-0041",
  },
  {
    id: "MOD-GB-0112",
    title: "ScamSmart practitioner briefing — investment fraud",
    authorityId: "AUTH-FCA-UK",
    jurisdiction: "GB",
    edition: "v4.2",
    publishedOn: "2026-01-19",
    audience: ["AUD-ADVISER", "AUD-TRAINER"],
    languages: ["EN"],
    usageBasis: "own_publication",
    licenceExpires: null,
    scope:
      "Briefing for advisers and educators on how investment fraud is presented to consumers, the checks a consumer can make, and the conversational patterns that precede a loss.",
    outcomes: [
      {
        id: "OUT-GB-1",
        statement: "The consumer treats a stated return as a claim to be tested rather than a feature of the product.",
        clauseId: "CL-GB-1",
      },
      {
        id: "OUT-GB-2",
        statement: "The consumer can state what would have to happen for them to lose the whole amount, and what recourse exists if it does.",
        clauseId: "CL-GB-2",
      },
      {
        id: "OUT-GB-3",
        statement: "The consumer recognises that a claim of automated or AI-driven trading describes how a system is built and not whether it works.",
        clauseId: null,
      },
      {
        id: "OUT-GB-4",
        statement:
          "The consumer treats an unsolicited approach offering to retrieve money already handed over as a second attempt by the same operation, and hands over no advance fee.",
        clauseId: "CL-GB-4",
      },
    ],
    clauses: [
      {
        id: "CL-GB-1",
        citation: "s.3.2",
        text: "A projected return is a claim made by the seller. Consumers should ask what generates it, who else has to succeed for it to be paid, and what happens to it in a falling market.",
      },
      {
        id: "CL-GB-2",
        citation: "s.5.1",
        text: "Consumers should establish, before committing funds, the circumstances in which the entire investment could be lost and whether any compensation scheme would apply.",
      },
      {
        id: "CL-GB-4",
        citation: "s.7.4",
        text: "Consumers who have already handed over funds are frequently approached a second time by the same operation, presented as a recovery service. No legitimate recovery service requires a fee to be paid in advance of any recovery.",
      },
    ],
    sharing: "CLEAR",
    status: "MAPPED",
    derivedObjectIds: [],
    declineReason: null,
    supersededBy: null,
  },
  {
    id: "MOD-SG-0207",
    title: "Frontline interception procedure — suspected investment scam transfers",
    authorityId: "AUTH-MAS-SG",
    jurisdiction: "SG",
    edition: "2026.2",
    publishedOn: "2026-04-28",
    audience: ["AUD-BANK-STAFF"],
    languages: ["EN"],
    usageBasis: "restricted_internal",
    licenceExpires: null,
    scope:
      "Procedure issued to bank and broker frontline staff: the questions to ask a customer instructing a transfer that matches a scam pattern, the hold thresholds, and the escalation path.",
    outcomes: [
      {
        id: "OUT-SG-1",
        statement: "Staff establish the beneficiary account's registered name and whether the customer has verified it independently.",
        clauseId: null,
      },
      {
        id: "OUT-SG-2",
        statement: "Staff identify time pressure applied by a third party to the customer as a hold trigger rather than a reason to expedite.",
        clauseId: null,
      },
    ],
    clauses: [],
    sharing: "AMBER",
    status: "TRIAGED",
    derivedObjectIds: [],
    declineReason: null,
    supersededBy: null,
  },
  {
    id: "MOD-MY-0074",
    title: "InvestSmart® facilitator guide — recognising unlicensed offers",
    authorityId: "AUTH-SC-MY",
    jurisdiction: "MY",
    edition: "2026 rev. 1",
    publishedOn: "2026-02-06",
    audience: ["AUD-TRAINER", "AUD-RETAIL"],
    languages: ["EN", "MS"],
    usageBasis: "own_publication",
    licenceExpires: null,
    scope:
      "Facilitator material for public investor-education sessions, covering licensing checks, the anatomy of an unlicensed offer, and how referrals through a trusted contact change a person's threshold for verifying.",
    outcomes: [
      {
        id: "OUT-MY-1",
        statement:
          "The investor verifies licensing independently of the person making the offer, including when that person is known to them.",
        clauseId: "CL-MY-1",
      },
      {
        id: "OUT-MY-2",
        statement:
          "The investor recognises that a referral from a friend or community group is social proof and not evidence about the offer.",
        clauseId: "CL-MY-2",
      },
    ],
    clauses: [
      {
        id: "CL-MY-1",
        citation: "Module 2, para 2.3",
        text: "Licensing must be verified against the public register by the investor. Verification performed or reported by the party making the offer is not verification.",
      },
      {
        id: "CL-MY-2",
        citation: "Module 4, para 4.1",
        text: "That other people have invested, including people known and trusted by the investor, is not evidence that an offer is genuine or that the entity is licensed.",
      },
    ],
    sharing: "CLEAR",
    status: "IN_REVIEW",
    derivedObjectIds: [],
    declineReason: null,
    supersededBy: null,
  },
  {
    id: "MOD-EU-0009",
    title: "Retail investor protection — supervisory briefing on marketing communications",
    authorityId: "AUTH-ESMA-EU",
    jurisdiction: "EU",
    edition: "2026/1",
    publishedOn: "2026-05-20",
    audience: ["AUD-SUPERVISOR"],
    languages: ["EN"],
    usageBasis: "own_publication",
    licenceExpires: null,
    scope:
      "Briefing for national supervisors on convergence in the assessment of retail marketing communications. Chapters cover fair-balanced-not-misleading, risk disclosure placement, and influencer marketing.",
    outcomes: [],
    clauses: [
      {
        id: "CL-EU-1",
        citation: "Ch. 2, §14",
        text: "Marketing communications should be identifiable as such and the presentation of risk should be no less prominent than the presentation of potential return.",
      },
    ],
    sharing: "CLEAR",
    status: "DECLINED",
    derivedObjectIds: [],
    declineReason:
      "Nothing to map. This is supervisory guidance about what firms must do, not a curriculum about what an investor should be able to do — it states no learning outcome, so there is no behaviour to connect to a competency element. Genuinely useful to a supervisor and unusable by the rehearsal engine. Returned to ESMA with the observation that Chapter 2 would restate as an outcome without much effort.",
    supersededBy: null,
  },
  {
    id: "MOD-IOSCO-0003",
    title: "Retail investor education toolkit — fraud and high-pressure selling",
    authorityId: "AUTH-IOSCO",
    jurisdiction: "GLOBAL",
    edition: "2025.4",
    publishedOn: "2025-11-14",
    audience: ["AUD-TRAINER", "AUD-RETAIL"],
    languages: ["EN", "ES", "FR"],
    usageBasis: "licensed",
    licenceExpires: "2027-11-14",
    scope:
      "Cross-jurisdiction toolkit contributed by members and licensed to national programmes. Covers high-pressure selling patterns, the verification sequence, and structured debriefing after a simulated approach.",
    outcomes: [
      {
        id: "OUT-IO-1",
        statement:
          "The investor states, before committing funds, what the downside is and what recourse exists if the entity turns out not to be real.",
        clauseId: "CL-IO-1",
      },
      {
        id: "OUT-IO-2",
        statement:
          "The investor maintains a verification step under sustained commercial pressure rather than abandoning it to end the conversation.",
        clauseId: "CL-IO-2",
      },
    ],
    clauses: [
      {
        id: "CL-IO-1",
        citation: "Part B, §3",
        text: "Investors should be able to articulate the loss scenario and the available recourse before funds are committed, in their own words rather than by reference to a document they have been shown.",
      },
      {
        id: "CL-IO-2",
        citation: "Part C, §2",
        text: "Sustained pressure is itself an indicator. The verification step is the part most commonly abandoned, and programmes should rehearse maintaining it rather than merely teaching it.",
      },
    ],
    sharing: "GREEN",
    status: "SUBMITTED",
    derivedObjectIds: [],
    declineReason: null,
    supersededBy: null,
  },
];

export function trainingModule(id: string): TrainingModule | undefined {
  return MODULES.find((m) => m.id === id);
}
