/**
 * AUREN — the seeded tenant roster.
 *
 * Every organisation that signs in, across the four kinds that actually buy
 * this differently: network bodies, regulators, banks, and a ministry running
 * a citizen programme.
 *
 * The entitlements are deliberately uneven. A roster where everyone has the
 * same ceiling, the same languages and the same knowledge scope is a roster
 * that has never been through a procurement — and the interesting behaviour of
 * the console is exactly what happens when a tenant is licensed for less than
 * it wants to do.
 */

import type { Tenant } from "./tenant";

export const TENANTS: Tenant[] = [
  /* ── Network bodies ─────────────────────────────────────────────────── */
  {
    id: "AUTH-IOSCO",
    name: "IOSCO — coordinating secretariat",
    kind: "network",
    jurisdiction: "GLOBAL",
    networkJurisdictions: ["ES", "FR", "DE", "IT", "GB", "MY", "SG", "AE", "JP", "HK"],
    reportsTo: null,
    entitlement: {
      seats: 0,
      ccuCeiling: 0,
      languages: ["EN", "ES", "ZH", "AR", "JA"],
      markets: ["GLOBAL"],
      ownModules: true,
      knowledge: "network_full",
      contractEnds: "2029-12-31",
    },
    memberNoun: "participant",
    consentBasis: "No members. The secretariat coordinates contributors and reads aggregates.",
  },
  {
    id: "AUTH-ESMA-EU",
    name: "European Securities and Markets Authority",
    kind: "network",
    jurisdiction: "EU",
    networkJurisdictions: ["ES", "FR", "DE", "IT"],
    reportsTo: null,
    entitlement: {
      seats: 0,
      ccuCeiling: 0,
      languages: ["EN", "ES"],
      markets: ["EU"],
      ownModules: true,
      knowledge: "network_full",
      contractEnds: "2028-06-30",
    },
    memberNoun: "participant",
    consentBasis: "No members. Convergence mandate — aggregates across national programmes only.",
  },

  /* ── Regulators ─────────────────────────────────────────────────────── */
  {
    id: "AUTH-CNMV-ES",
    name: "Comisión Nacional del Mercado de Valores",
    kind: "authority",
    jurisdiction: "ES",
    reportsTo: null,
    entitlement: {
      seats: 40000,
      ccuCeiling: 400,
      languages: ["ES", "EN"],
      markets: ["EU", "GLOBAL"],
      ownModules: true,
      knowledge: "network_full",
      contractEnds: "2028-03-31",
    },
    memberNoun: "participant",
    consentBasis: "Programme enrolment · sponsor may review readiness",
  },
  {
    id: "AUTH-FCA-UK",
    name: "Financial Conduct Authority",
    kind: "authority",
    jurisdiction: "GB",
    reportsTo: null,
    entitlement: {
      seats: 25000,
      ccuCeiling: 250,
      languages: ["EN"],
      markets: ["GLOBAL"],
      ownModules: true,
      knowledge: "network_full",
      contractEnds: "2027-09-30",
    },
    memberNoun: "participant",
    consentBasis: "Programme enrolment · sponsor may review readiness",
  },
  {
    id: "AUTH-AMF-FR",
    name: "Autorité des marchés financiers",
    kind: "authority",
    jurisdiction: "FR",
    reportsTo: null,
    entitlement: {
      seats: 15000,
      ccuCeiling: 150,
      languages: ["EN"],
      markets: ["EU"],
      ownModules: false,
      knowledge: "own_plus_released",
      contractEnds: "2027-12-31",
    },
    memberNoun: "participant",
    consentBasis: "Programme enrolment · sponsor may review readiness",
  },
  {
    id: "AUTH-BAFIN-DE",
    name: "Bundesanstalt für Finanzdienstleistungsaufsicht",
    kind: "authority",
    jurisdiction: "DE",
    reportsTo: null,
    entitlement: {
      seats: 15000,
      ccuCeiling: 150,
      languages: ["EN"],
      markets: ["EU"],
      ownModules: false,
      knowledge: "own_plus_released",
      contractEnds: "2027-12-31",
    },
    memberNoun: "participant",
    consentBasis: "Programme enrolment · sponsor may review readiness",
  },
  {
    id: "AUTH-CONSOB-IT",
    name: "Commissione Nazionale per le Società e la Borsa",
    kind: "authority",
    jurisdiction: "IT",
    reportsTo: null,
    entitlement: {
      seats: 15000,
      ccuCeiling: 150,
      languages: ["EN"],
      markets: ["EU"],
      ownModules: false,
      knowledge: "own_plus_released",
      contractEnds: "2027-12-31",
    },
    memberNoun: "participant",
    consentBasis: "Programme enrolment · sponsor may review readiness",
  },
  {
    id: "AUTH-SC-MY",
    name: "Securities Commission Malaysia",
    kind: "authority",
    jurisdiction: "MY",
    reportsTo: null,
    entitlement: {
      seats: 30000,
      ccuCeiling: 300,
      languages: ["EN", "ZH"],
      markets: ["GLOBAL"],
      ownModules: true,
      knowledge: "network_full",
      contractEnds: "2028-06-30",
    },
    memberNoun: "participant",
    consentBasis: "Programme enrolment · sponsor may review readiness",
  },
  {
    id: "AUTH-MAS-SG",
    name: "Monetary Authority of Singapore",
    kind: "authority",
    jurisdiction: "SG",
    reportsTo: null,
    entitlement: {
      seats: 20000,
      ccuCeiling: 200,
      languages: ["EN", "ZH"],
      markets: ["GLOBAL"],
      ownModules: true,
      knowledge: "network_full",
      contractEnds: "2028-06-30",
    },
    memberNoun: "participant",
    consentBasis: "Programme enrolment · sponsor may review readiness",
  },
  {
    id: "AUTH-SFC-HK",
    name: "Securities and Futures Commission",
    kind: "authority",
    jurisdiction: "HK",
    reportsTo: null,
    entitlement: {
      seats: 18000,
      ccuCeiling: 180,
      languages: ["ZH", "EN"],
      markets: ["GLOBAL"],
      ownModules: true,
      knowledge: "network_full",
      contractEnds: "2028-09-30",
    },
    memberNoun: "participant",
    consentBasis: "Programme enrolment · sponsor may review readiness",
  },
  {
    id: "AUTH-FSA-JP",
    name: "金融庁 — Financial Services Agency",
    kind: "authority",
    jurisdiction: "JP",
    reportsTo: null,
    entitlement: {
      seats: 30000,
      ccuCeiling: 260,
      languages: ["JA", "EN"],
      markets: ["GLOBAL"],
      ownModules: true,
      knowledge: "network_full",
      contractEnds: "2028-03-31",
    },
    memberNoun: "participant",
    consentBasis: "Programme enrolment · sponsor may review readiness",
  },
  {
    id: "AUTH-SCA-AE",
    name: "Securities and Commodities Authority",
    kind: "authority",
    jurisdiction: "AE",
    reportsTo: null,
    entitlement: {
      seats: 12000,
      ccuCeiling: 120,
      languages: ["AR", "EN"],
      markets: ["GLOBAL"],
      ownModules: true,
      /* Contributes intelligence to the network and does not take the network's
         released objects back. That asymmetry is a real negotiating position
         and the model has to be able to express it. */
      knowledge: "own_plus_released",
      contractEnds: "2027-12-31",
    },
    memberNoun: "participant",
    consentBasis: "Programme enrolment · sponsor may review readiness",
  },

  /* ── Banks ──────────────────────────────────────────────────────────── */
  {
    id: "BANK-IBERIA-ES",
    name: "Banco Ibérico",
    kind: "bank",
    jurisdiction: "ES",
    reportsTo: "AUTH-CNMV-ES",
    entitlement: {
      seats: 60000,
      /* Advised sessions booked into branch diaries — a working-hours plateau,
         not a campaign spike, so the ceiling is lower than the seat count
         would suggest. */
      ccuCeiling: 220,
      languages: ["ES", "EN"],
      markets: ["EU"],
      ownModules: true,
      knowledge: "own_plus_released",
      contractEnds: "2027-06-30",
    },
    memberNoun: "customer",
    consentBasis: "Customer onboarding · bank may review readiness under duty of care",
  },
  {
    id: "BANK-NOZOMI-JP",
    name: "のぞみ信託銀行 — Nozomi Trust Bank",
    kind: "bank",
    jurisdiction: "JP",
    reportsTo: "AUTH-FSA-JP",
    entitlement: {
      seats: 45000,
      ccuCeiling: 180,
      languages: ["JA"],
      markets: ["GLOBAL"],
      ownModules: true,
      knowledge: "own_plus_released",
      contractEnds: "2027-09-30",
    },
    memberNoun: "customer",
    consentBasis: "お客さま同意 · 適合性確認の一環として当行が結果を確認します",
  },
  {
    id: "BANK-HARBOUR-HK",
    name: "維港銀行 — Harbour Commercial Bank",
    kind: "bank",
    jurisdiction: "HK",
    reportsTo: "AUTH-SFC-HK",
    entitlement: {
      seats: 30000,
      ccuCeiling: 140,
      languages: ["ZH", "EN"],
      markets: ["GLOBAL"],
      ownModules: true,
      /* Bought the private deployment. It rehearses only against what it has
         itself uploaded, which is the weakest configuration on offer and the
         one procurement asked for. The console does not hide the consequence. */
      knowledge: "own",
      contractEnds: "2027-03-31",
    },
    memberNoun: "customer",
    consentBasis: "Customer onboarding · bank may review readiness under duty of care",
  },

  /* ── Government ─────────────────────────────────────────────────────── */
  {
    id: "GOV-EMIRATES-AE",
    name: "Ministry of Community Development",
    kind: "government",
    jurisdiction: "AE",
    reportsTo: "AUTH-SCA-AE",
    entitlement: {
      /* A citizen programme is uncapped by construction: the population is the
         population, and a seat count would be a fiction. Concurrency is where
         the real constraint sits, and a national campaign spikes hard. */
      seats: null,
      ccuCeiling: 900,
      languages: ["AR", "EN"],
      markets: ["GLOBAL"],
      ownModules: true,
      knowledge: "own_plus_released",
      contractEnds: "2028-12-31",
    },
    memberNoun: "resident",
    consentBasis: "Programme registration · ministry may review readiness in aggregate",
  },
];

export function tenantById(id: string): Tenant | undefined {
  return TENANTS.find((t) => t.id === id);
}
