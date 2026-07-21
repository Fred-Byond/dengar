/**
 * Home Ministry (KDN) topic taxonomy — §5.3 of the Development Plan.
 *
 * A fixed two-level taxonomy keeps the dashboard readable and trends
 * comparable over time. Level 1 is fixed at launch; Level 2 is refined
 * with the Ministry in Phase 0. Each L1 topic maps to a default routing
 * department and whether it skews negative (for chart colouring / triage).
 */

export interface TopicDefinition {
  id: string;
  /** Level-1 label shown in the dashboard. */
  label: string;
  /** Level-2 sub-issues, refined with the Ministry in Phase 0. */
  level2: string[];
  /** Default responsible agency (see DEPARTMENTS). */
  defaultDepartment: string;
  /** Whether this topic typically carries negative sentiment (triage hint). */
  negativeLeaning: boolean;
}

export const DEPARTMENTS = [
  { id: "jim", name: "Immigration Dept (JIM)" },
  { id: "pdrm", name: "Royal Malaysia Police (PDRM)" },
  { id: "jsjk", name: "PDRM Commercial Crime (JSJK)" },
  { id: "jpn", name: "National Registration (JPN)" },
  { id: "aadk", name: "Anti-Drugs Agency (AADK)" },
  { id: "apm", name: "Civil Defence Force (APM)" },
  { id: "penjara", name: "Prisons Dept" },
  { id: "rela", name: "RELA" },
  { id: "polisi", name: "KDN Policy Division" },
  { id: "comms", name: "Minister's Office / Comms" },
] as const;

export type DepartmentId = (typeof DEPARTMENTS)[number]["id"];

export const TAXONOMY: TopicDefinition[] = [
  {
    id: "policing",
    label: "Policing & community safety",
    level2: ["Night patrol requests", "Report response times", "Mat rempit & street racing", "CCTV coverage", "Loan-shark harassment"],
    defaultDepartment: "pdrm",
    negativeLeaning: true,
  },
  {
    id: "immigration",
    label: "Immigration & borders",
    level2: ["Foreign-worker permit renewal", "Passport appointments", "Counter queue times", "Visa status transparency", "Border checkpoint congestion"],
    defaultDepartment: "jim",
    negativeLeaning: true,
  },
  {
    id: "registration",
    label: "National registration (MyKad)",
    level2: ["MyKad replacement time", "Late birth registration", "Rural JPN access", "Kiosk availability"],
    defaultDepartment: "jpn",
    negativeLeaning: false,
  },
  {
    id: "scams",
    label: "Scams & cybercrime",
    level2: ["Phone/Macau scam losses", "Bank-freeze speed", "Mule-account recruitment", "Fake investment platforms", "SIM-card fraud"],
    defaultDepartment: "jsjk",
    negativeLeaning: true,
  },
  {
    id: "drugs",
    label: "Drugs & rehabilitation",
    level2: ["Vape with substances near schools", "Rehab centre capacity", "Community relapse support", "Enforcement visibility"],
    defaultDepartment: "aadk",
    negativeLeaning: true,
  },
  {
    id: "foreign_workers",
    label: "Foreign workers & refugees",
    level2: ["Agent overcharging", "Levy & quota confusion", "FOMEMA scheduling", "Undocumented worker concerns", "Employer compliance"],
    defaultDepartment: "jim",
    negativeLeaning: true,
  },
  {
    id: "civil_defence",
    label: "Civil defence & emergency response",
    level2: ["Flood response", "Siren & alert systems", "APM readiness"],
    defaultDepartment: "apm",
    negativeLeaning: false,
  },
  {
    id: "prisons",
    label: "Prisons & corrections",
    level2: ["Visitation process", "Rehabilitation programmes", "Reintegration support"],
    defaultDepartment: "penjara",
    negativeLeaning: false,
  },
  {
    id: "general",
    label: "General governance feedback / praise",
    level2: ["Service appreciation", "MADANI programme feedback", "Cost-of-living mentions"],
    defaultDepartment: "comms",
    negativeLeaning: false,
  },
  {
    id: "out_of_portfolio",
    label: "Out of portfolio",
    level2: ["Routed to other ministries (cross-government hook)"],
    defaultDepartment: "polisi",
    negativeLeaning: false,
  },
];

export const TAXONOMY_BY_ID: Record<string, TopicDefinition> = Object.fromEntries(
  TAXONOMY.map((t) => [t.id, t]),
);

export function departmentName(id: string): string {
  return DEPARTMENTS.find((d) => d.id === id)?.name ?? "KDN Policy Division";
}
