/**
 * AUREN — tenancy.
 *
 * Who is logging in, what they may see, and what they are entitled to run.
 *
 * The product has one engine and many operators. A securities commission
 * running a national investor-education programme, a bank training the
 * customers it is legally exposed to, and a ministry putting a citizen
 * population through a rehearsal are the same software and three different
 * accountabilities. Tenancy is where that difference is made explicit instead
 * of being an unwritten assumption in a query.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE.
 *
 *   A tenant sees its own members and nobody else's. A network body sees
 *   aggregates across the tenants it covers, and individuals in none of them.
 *
 * That is not a permissions nicety. A bank looking at another bank's customers
 * is a competition problem and a data-protection breach in the same query, and
 * "we filter in the UI" is not an answer to either. The scope decision is made
 * once, here, and every read passes through it.
 *
 * WHAT IS DELIBERATELY NOT HERE.
 *
 * Pricing. Entitlements are operational limits — how many people may rehearse
 * at once, which languages are licensed for delivery, whose knowledge a tenant
 * may draw on. What those limits cost is a commercial question answered in
 * `docs/AUREN-COMMERCIAL.md`, and putting a price in the runtime is how a
 * product ends up unable to change its packaging without a release.
 */

/* ═══════════════════════════════════════════════════════════════════════
   WHAT KIND OF ORGANISATION THIS IS
   ═════════════════════════════════════════════════════════════════════ */

/**
 * The kind drives two things that actually differ: whether the tenant may
 * contribute to the shared corpus, and whether naming an individual is
 * defensible at all.
 *
 * An authority supervises a market and its programme participants consent at
 * enrolment. A bank has a customer relationship and a duty of care, which is a
 * stronger basis for naming someone than a supervisor's interest — and a much
 * weaker basis for seeing anyone outside it. A network body has no members of
 * its own by construction.
 */
export const TENANT_KINDS = [
  {
    id: "network",
    label: "Network body",
    note: "Coordinates contributors. Has no members of its own and can never be given any.",
    mayContribute: true,
    mayNameIndividuals: false,
  },
  {
    id: "authority",
    label: "Securities commission or regulator",
    note: "Supervises a market. Its programme participants consent at enrolment.",
    mayContribute: true,
    mayNameIndividuals: true,
  },
  {
    id: "bank",
    label: "Bank or broker",
    note: "Has a customer relationship and a duty of care — a stronger basis for naming a member than a supervisor's, and a far weaker basis for seeing anyone outside it.",
    mayContribute: true,
    mayNameIndividuals: true,
  },
  {
    id: "enterprise",
    label: "Enterprise",
    note: "Trains its own staff or members. Never sees another tenant's people and never contributes to the shared corpus by default.",
    mayContribute: false,
    mayNameIndividuals: true,
  },
  {
    id: "government",
    label: "Government or ministry",
    note: "Runs a citizen programme. Population scale, and the consent basis is the programme's own, not AUREN's.",
    mayContribute: true,
    mayNameIndividuals: true,
  },
] as const;

export type TenantKind = (typeof TENANT_KINDS)[number]["id"];

export function tenantKind(id: string) {
  return TENANT_KINDS.find((k) => k.id === id);
}

/* ═══════════════════════════════════════════════════════════════════════
   WHAT A TENANT MAY DRAW ON
   ═════════════════════════════════════════════════════════════════════ */

/**
 * Whose knowledge reaches this tenant's learners.
 *
 * `own` is the case every bank asks for first and it is the weakest one: a
 * tenant rehearsing only against its own uploaded material is rehearsing
 * against what it already knew, which is precisely the corpus a new tactic is
 * designed to be absent from. The network corpus is the product; a private
 * corpus is a deployment option.
 */
export const KNOWLEDGE_SCOPES = [
  {
    id: "own",
    label: "Own modules only",
    note: "Rehearses against what this tenant already knew. Offered because procurement asks for it; the coverage gap is real and the console says so.",
  },
  {
    id: "own_plus_released",
    label: "Own modules + released network corpus",
    note: "The default. Everything the network has released, plus whatever this tenant has authored and released itself.",
  },
  {
    id: "network_full",
    label: "Full network participation",
    note: "As above, and this tenant's own released objects are offered back to the network. Contribution is an act, never a side effect of uploading.",
  },
] as const;

export type KnowledgeScopeId = (typeof KNOWLEDGE_SCOPES)[number]["id"];

export function knowledgeScope(id: string) {
  return KNOWLEDGE_SCOPES.find((k) => k.id === id);
}

/* ═══════════════════════════════════════════════════════════════════════
   ENTITLEMENT
   ═════════════════════════════════════════════════════════════════════ */

/**
 * The operational envelope, expressed in units that mean something to the
 * runtime rather than to a price list.
 *
 * `ccuCeiling` is the load-bearing one. A rehearsal is a live voice session
 * holding a speech pipeline open for five to eight minutes, so the cost that
 * matters is how many run at the same instant, not how many ran this month.
 * A ministry putting 200,000 citizens through a campaign over a year and a
 * bank putting 2,000 customers through in one afternoon are the same annual
 * volume and completely different infrastructure — and the second one is the
 * one that falls over.
 */
export interface Entitlement {
  /** Enrolled members the tenant may hold. `null` = uncapped (population programmes). */
  seats: number | null;
  /** Rehearsals that may run at the same instant. The unit that provisions capacity. */
  ccuCeiling: number;
  /** Languages licensed for delivery. A language not listed here cannot be selected. */
  languages: string[];
  markets: string[];
  /** May upload its own governed training modules. */
  ownModules: boolean;
  knowledge: KnowledgeScopeId;
  /** ISO date. Objects must not be released with an effective date beyond it. */
  contractEnds: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   THE TENANT
   ═════════════════════════════════════════════════════════════════════ */

export interface Tenant {
  id: string;
  name: string;
  kind: TenantKind;
  /** ISO-ish code for the market this tenant operates in. */
  jurisdiction: string;
  /**
   * A network body's reach. Set only on `kind: "network"`: the jurisdictions
   * whose tenants it may see in aggregate. It never confers individual access,
   * which is why it is separate from anything on `Entitlement`.
   */
  networkJurisdictions?: string[];
  /** Populated for tenants that report into a network body. */
  reportsTo: string | null;
  entitlement: Entitlement;
  /** What the members are called here. A bank has customers, not participants. */
  memberNoun: string;
  /** Recorded at enrolment and shown on every row that names a person. */
  consentBasis: string;
}

export function tenant(list: Tenant[], id: string): Tenant | undefined {
  return list.find((t) => t.id === id);
}

/* ═══════════════════════════════════════════════════════════════════════
   SCOPE — the one decision, made once
   ═════════════════════════════════════════════════════════════════════ */

export type ScopeGrain = "individual" | "aggregate" | "none";

/**
 * What `viewer` may see of `subject`'s people.
 *
 * Returning a grain rather than a boolean is the point. "May a supervisor at
 * ESMA see Spanish participants?" has no yes/no answer: they may see how the
 * Spanish cohort is doing and they may not see who Encarnación Sáez is. A
 * boolean forces that question to be answered wrongly in one direction or the
 * other, and whichever way it is answered, it is answered in a hundred call
 * sites instead of here.
 */
export function scopeOf(viewer: Tenant, subject: Tenant): ScopeGrain {
  if (viewer.id === subject.id) {
    return tenantKind(viewer.kind)?.mayNameIndividuals ? "individual" : "aggregate";
  }
  if (
    viewer.kind === "network" &&
    (viewer.networkJurisdictions ?? []).includes(subject.jurisdiction)
  ) {
    return "aggregate";
  }
  /* A supervising authority sees the programmes it supervises in aggregate.
     It is the regulator of the market, not of the individual customer, and the
     bank's relationship with that customer is not the regulator's to read. */
  if (viewer.kind === "authority" && subject.reportsTo === viewer.id) {
    return "aggregate";
  }
  return "none";
}

/** Every tenant whose people `viewer` may see at all, at any grain. */
export function visibleTenants(viewer: Tenant, all: Tenant[]): Tenant[] {
  return all.filter((t) => scopeOf(viewer, t) !== "none");
}

/** Every tenant whose people `viewer` may see by name. */
export function nameableTenants(viewer: Tenant, all: Tenant[]): Tenant[] {
  return all.filter((t) => scopeOf(viewer, t) === "individual");
}

/* ═══════════════════════════════════════════════════════════════════════
   ENTITLEMENT CHECKS
   ═════════════════════════════════════════════════════════════════════ */

export interface EntitlementFinding {
  field: string;
  detail: string;
  blocking: boolean;
}

/**
 * Checked at the point a session would start, not at the point a bill is
 * raised. A learner who is refused because the tenant is over its seat count
 * has been failed by the operator, not by the product, and the message has to
 * be able to say which.
 */
export function checkEntitlement(
  t: Tenant,
  req: { language: string; market: string; enrolled: number; liveSessions: number },
  asOf: string
): EntitlementFinding[] {
  const out: EntitlementFinding[] = [];

  if (!t.entitlement.languages.includes(req.language)) {
    out.push({
      field: "language",
      detail: `${req.language} is not licensed for delivery to this tenant. Delivering in an unlicensed language is not a billing question — the variant may not have passed native review for this market, and an unreviewed variant scoring a real person is the failure the fidelity rule exists to prevent.`,
      blocking: true,
    });
  }

  if (!t.entitlement.markets.includes(req.market) && !t.entitlement.markets.includes("GLOBAL")) {
    out.push({
      field: "market",
      detail: `${req.market} is outside this tenant's licensed markets. Eligibility is an object property, so content released for another market is not merely hidden — it is not loadable.`,
      blocking: true,
    });
  }

  if (t.entitlement.seats !== null && req.enrolled > t.entitlement.seats) {
    out.push({
      field: "seats",
      detail: `${req.enrolled} enrolled against ${t.entitlement.seats} seats. Enrolment is the operator's act, so this is an account conversation rather than a reason to refuse a learner who is already in the programme.`,
      blocking: false,
    });
  }

  if (req.liveSessions >= t.entitlement.ccuCeiling) {
    out.push({
      field: "ccu",
      detail: `${req.liveSessions} rehearsals already running against a ceiling of ${t.entitlement.ccuCeiling}. A voice session holds a live pipeline open for five to eight minutes, so this is a capacity limit before it is a commercial one — and the honest behaviour at the ceiling is a queue with a stated wait, never a degraded session.`,
      blocking: true,
    });
  }

  if (asOf > t.entitlement.contractEnds) {
    out.push({
      field: "contractEnds",
      detail: `The agreement ended on ${t.entitlement.contractEnds}. Records already produced stay valid — a rehearsal that happened, happened — but nothing new may be released or delivered.`,
      blocking: true,
    });
  }

  return out;
}

export function mayStart(
  t: Tenant,
  req: { language: string; market: string; enrolled: number; liveSessions: number },
  asOf: string
): boolean {
  return checkEntitlement(t, req, asOf).every((f) => !f.blocking);
}
