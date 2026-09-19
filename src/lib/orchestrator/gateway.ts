/**
 * AUREN — the Real-Time Trust Gateway.
 *
 * The coach needs current facts: is this firm on the register, has this entity
 * been named in an alert, is this instrument suspended. Those change daily, so
 * they cannot live in a bundle that is approved quarterly.
 *
 * THE RULE:
 *
 *   Live information never flows from the internet into the digital human.
 *
 * Everything arrives through an allow-listed, authenticated connector and is
 * verified, schema-validated, injection-scanned, freshness-checked and
 * classified as fact or signal before any of it can be spoken. A register entry
 * is a fact. A scam-intelligence pattern match is a signal. Saying the second
 * in the voice of the first is how an educational system ends up accusing a
 * real business of fraud.
 *
 * WHAT THIS IS DEFENDING AGAINST.
 *
 * Retrieved content is attacker-reachable. A fraudster who can get text onto a
 * page the gateway reads can attempt prompt injection; a poisoned feed can
 * introduce false warnings; a stale cache can report a revoked licence as
 * current. None of those are prompting problems, and none of them are solved by
 * asking the model to be careful.
 */

/* ═══════════════════════════════════════════════════════════════════════
   CONNECTORS — the allow-list
   ═════════════════════════════════════════════════════════════════════ */

export type ConnectorClass =
  | "registry"      // licensed entities, adviser registers
  | "alert"         // investor warnings, enforcement notices
  | "market"        // prices, suspensions, filings
  | "institution"   // a bank's own signals, with permission
  | "intelligence"; // scam patterns, impersonated brands

export interface Connector {
  id: string;
  label: string;
  cls: ConnectorClass;
  /** The organisation that publishes it. Never a scraped aggregator. */
  publisher: string;
  jurisdiction: string;
  /** Beyond this age the answer is refused rather than served stale. */
  maxAgeMinutes: number;
  /**
   * `fact` outputs may be stated plainly. `signal` outputs may only ever be
   * reported as an indicator that something needs checking.
   */
  yields: "fact" | "signal";
  /** Whether a failure here degrades the session or merely narrows it. */
  fallback: "narrow" | "refuse";
  authenticated: boolean;
}

export const CONNECTORS: Connector[] = [
  {
    id: "CX-REGISTER-ES", label: "CNMV entity register", cls: "registry",
    publisher: "Comisión Nacional del Mercado de Valores", jurisdiction: "ES",
    maxAgeMinutes: 1440, yields: "fact", fallback: "narrow", authenticated: true,
  },
  {
    id: "CX-REGISTER-MY", label: "SC Malaysia public register", cls: "registry",
    publisher: "Securities Commission Malaysia", jurisdiction: "MY",
    maxAgeMinutes: 1440, yields: "fact", fallback: "narrow", authenticated: true,
  },
  {
    id: "CX-ALERT-IOSCO", label: "IOSCO I-SCAN investor alerts", cls: "alert",
    publisher: "IOSCO", jurisdiction: "GLOBAL",
    maxAgeMinutes: 720, yields: "fact", fallback: "narrow", authenticated: true,
  },
  {
    id: "CX-ALERT-FCA", label: "FCA warning list", cls: "alert",
    publisher: "Financial Conduct Authority", jurisdiction: "GB",
    maxAgeMinutes: 720, yields: "fact", fallback: "narrow", authenticated: true,
  },
  {
    id: "CX-MARKET-STATUS", label: "Exchange trading status and suspensions", cls: "market",
    publisher: "Exchange operator feed", jurisdiction: "GLOBAL",
    maxAgeMinutes: 15, yields: "fact", fallback: "narrow", authenticated: true,
  },
  {
    id: "CX-BANK-RISK", label: "Beneficiary and transfer risk indicators", cls: "institution",
    publisher: "Tenant institution", jurisdiction: "TENANT",
    maxAgeMinutes: 60, yields: "signal", fallback: "narrow", authenticated: true,
  },
  {
    id: "CX-SCAM-PATTERN", label: "Reported scam scripts and impersonated brands", cls: "intelligence",
    publisher: "Network contributors", jurisdiction: "GLOBAL",
    maxAgeMinutes: 4320, yields: "signal", fallback: "narrow", authenticated: true,
  },
];

export function connector(id: string): Connector | undefined {
  return CONNECTORS.find((c) => c.id === id);
}

/* ═══════════════════════════════════════════════════════════════════════
   WHAT A CONNECTOR RETURNS
   ═════════════════════════════════════════════════════════════════════ */

export interface FeedResult {
  connectorId: string;
  /** When the upstream published it, not when we asked. */
  publishedAt: string;
  /** When we retrieved it. Both are recorded because both are evidence. */
  retrievedAt: string;
  /** The payload, already parsed. */
  payload: Record<string, string | number | boolean>;
  /** Free-text fields inside the payload — the attacker-reachable surface. */
  freeText: string[];
}

export type Verdict = "fact" | "signal" | "refused";

export interface GatewayFinding {
  check: string;
  detail: string;
  blocking: boolean;
}

export interface GatewayResult {
  verdict: Verdict;
  findings: GatewayFinding[];
  /** How the coach is permitted to say it. Empty when refused. */
  utterancePolicy: string;
  ageMinutes: number | null;
}

/* ═══════════════════════════════════════════════════════════════════════
   INJECTION SCANNING
   ═════════════════════════════════════════════════════════════════════ */

/**
 * Patterns that have no business in a register entry or an alert body.
 *
 * This is a tripwire, not a filter, and the distinction matters: a scanner that
 * tries to *clean* injected text has to decide what the safe remainder means,
 * which is the same judgement call the injection was attacking. So a hit
 * quarantines the whole field rather than editing it.
 */
const INJECTION_PATTERNS: Array<{ id: string; re: RegExp }> = [
  { id: "instruction_override", re: /\b(ignore|disregard|forget)\b[^.]{0,40}\b(previous|prior|above|earlier)\b/i },
  { id: "role_reassignment", re: /\byou are now\b|\bact as\b|\bfrom now on you\b/i },
  { id: "system_impersonation", re: /\bsystem\s*[:>]|\b<\|?im_start\|?>|\[INST\]/i },
  { id: "exfiltration", re: /\b(reveal|print|output|repeat)\b[^.]{0,30}\b(prompt|instruction|system message|api key)\b/i },
  { id: "advice_bait", re: /\b(tell|advise)\b[^.]{0,30}\b(them|the user|the investor)\b[^.]{0,30}\b(to invest|to buy|to transfer)\b/i },
];

export function scanInjection(text: string): string[] {
  return INJECTION_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.id);
}

/* ═══════════════════════════════════════════════════════════════════════
   THE GATE
   ═════════════════════════════════════════════════════════════════════ */

function minutesBetween(a: string, b: string): number | null {
  const x = Date.parse(a), y = Date.parse(b);
  if (Number.isNaN(x) || Number.isNaN(y)) return null;
  return Math.round((y - x) / 60000);
}

/**
 * Everything a live result must survive before the coach may use it.
 *
 * Ordered by cost: identity and schema are cheap and catch the common failures;
 * injection scanning runs on every free-text field regardless, because it is
 * the check whose absence is exploitable rather than merely embarrassing.
 */
export function admit(
  r: FeedResult,
  expectedFields: string[],
  now: string
): GatewayResult {
  const findings: GatewayFinding[] = [];
  const c = connector(r.connectorId);

  if (!c) {
    return {
      verdict: "refused",
      findings: [
        {
          check: "allow_list",
          detail: `${r.connectorId} is not an allow-listed connector. Anything arriving from an unlisted source is refused without being read — an unlisted source is indistinguishable from an attacker-controlled one.`,
          blocking: true,
        },
      ],
      utterancePolicy: "",
      ageMinutes: null,
    };
  }

  if (!c.authenticated) {
    findings.push({
      check: "authentication",
      detail: `${c.label} is not authenticated. An unauthenticated feed proves nothing about who produced the bytes.`,
      blocking: true,
    });
  }

  const missing = expectedFields.filter((f) => !(f in r.payload));
  if (missing.length) {
    findings.push({
      check: "schema",
      detail: `Missing expected field${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}. A payload that does not match its schema may be a changed API or a substituted response; either way it is not the thing that was approved.`,
      blocking: true,
    });
  }

  const age = minutesBetween(r.publishedAt, now);
  if (age === null) {
    findings.push({ check: "freshness", detail: "Unparseable publication time. Age cannot be established.", blocking: true });
  } else if (age > c.maxAgeMinutes) {
    findings.push({
      check: "freshness",
      detail: `Published ${age} minutes ago, against a limit of ${c.maxAgeMinutes}. Serving it anyway would report a possibly-revoked status as current, which is worse than saying nothing.`,
      blocking: true,
    });
  }

  const hits = r.freeText.flatMap((t) => scanInjection(t));
  if (hits.length) {
    findings.push({
      check: "injection",
      detail: `Injection patterns in free text: ${[...new Set(hits)].join(", ")}. The field is quarantined whole rather than cleaned — deciding what the safe remainder means is the same judgement the injection was attacking.`,
      blocking: true,
    });
  }

  const blocked = findings.some((f) => f.blocking);
  if (blocked) {
    return {
      verdict: "refused",
      findings,
      utterancePolicy:
        c.fallback === "narrow"
          ? "Continue the session without this fact. Tell the learner the check could not be completed and what they should do themselves — never substitute a guess."
          : "Refuse the turn and route to a human.",
      ageMinutes: age,
    };
  }

  return {
    verdict: c.yields,
    findings,
    utterancePolicy:
      c.yields === "fact"
        ? `May be stated plainly, with ${c.publisher} named as the source and the retrieval time available on the record.`
        : `May only be reported as an indicator that something needs checking. It must never be stated as a finding about a named business — a pattern match is not an accusation, and the difference is defamation.`,
    ageMinutes: age,
  };
}

/** What the coach does when the gateway refuses. Never silence, never a guess. */
export function fallbackFor(connectorId: string): string {
  const c = connector(connectorId);
  if (!c) return "Refuse and route to a human.";
  return c.fallback === "narrow"
    ? "Narrow the session: drop the live check, keep the rehearsal, and hand the learner the verification step to perform themselves. The behaviour being taught is the check — having AUREN do it was always the lesser half."
    : "Refuse the turn and route to a human.";
}
