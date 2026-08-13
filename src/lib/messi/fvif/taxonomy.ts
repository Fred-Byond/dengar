/**
 * MESSI.LIVE conversation taxonomy.
 *
 * A fixed two-level taxonomy keeps the Global Pulse readable and trends
 * comparable month over month. Level 1 is fixed at launch; Level 2 is refined
 * with Messi's management in Phase 0. Each L1 topic maps to the team that owns
 * the response and to the MESSI.LIVE experience it feeds (slide 10), plus
 * whether it is a reserved / brand-sensitive area.
 */

export interface TopicDefinition {
  id: string;
  /** Level-1 label shown in the dashboard. */
  label: string;
  /** Level-2 sub-themes, refined with management in Phase 0. */
  level2: string[];
  /** Owning team (see TEAMS). */
  defaultTeam: string;
  /** Which MESSI.LIVE experience this topic feeds (slide 10). */
  experience: ExperienceId;
  /** Reserved / brand-sensitive ground — always human-reviewed. */
  sensitive: boolean;
}

export const TEAMS = [
  { id: "academy", name: "Messi Academy (coaching)" },
  { id: "content", name: "Content Studio" },
  { id: "stories", name: "Messi Stories (children's)" },
  { id: "inspires", name: "Messi Inspires (motivation)" },
  { id: "foundation", name: "Messi For Good / Foundation" },
  { id: "commercial", name: "Commercial & Partnerships" },
  { id: "fanrel", name: "Fan Relations" },
  { id: "care", name: "Fan Care & Safeguarding" },
  { id: "brand", name: "Brand Governance (management)" },
  { id: "product", name: "MESSI.LIVE Product (BYOND)" },
] as const;

export type TeamId = (typeof TEAMS)[number]["id"];

export const EXPERIENCES = [
  { id: "five_minutes", name: "5 Minutes With Messi", blurb: "Private one-to-one conversations." },
  { id: "stories", name: "Messi Stories", blurb: "Children's and bedtime storytelling." },
  { id: "inspires", name: "Messi Inspires", blurb: "Motivation and encouragement." },
  { id: "academy", name: "Messi Academy", blurb: "Football development." },
  { id: "exclusive", name: "Messi Exclusive", blurb: "Interactive career stories." },
  { id: "my_messi", name: "My Messi", blurb: "Personal relationship and memories." },
  { id: "moments", name: "Messi Moments", blurb: "Birthdays and important milestones." },
  { id: "for_good", name: "Messi For Good", blurb: "Youth and social-impact programmes." },
] as const;

export type ExperienceId = (typeof EXPERIENCES)[number]["id"];

export const TAXONOMY: TopicDefinition[] = [
  {
    id: "football_training",
    label: "Football & training",
    level2: ["Ball mastery & first touch", "Movement off the ball", "Weak foot", "Free kicks", "Playing against bigger opponents", "Position & role"],
    defaultTeam: "academy",
    experience: "academy",
    sensitive: false,
  },
  {
    id: "motivation",
    label: "Motivation & resilience",
    level2: ["Confidence after losing", "Being told you are too small", "Nerves before a match", "Getting cut from a squad", "Staying consistent", "Fear of failing"],
    defaultTeam: "inspires",
    experience: "inspires",
    sensitive: false,
  },
  {
    id: "world_cup",
    label: "World Cup & career moments",
    level2: ["2022 final", "The 2014 defeat", "First Barcelona goal", "Copa América 2021", "Retirement and coming back", "Playing with friends"],
    defaultTeam: "content",
    experience: "exclusive",
    sensitive: false,
  },
  {
    id: "family_childhood",
    label: "Family & childhood",
    level2: ["Leaving Rosario at 13", "Growth-hormone treatment", "Missing home", "Parents' sacrifice", "Being a father", "Balancing school and football"],
    defaultTeam: "stories",
    experience: "stories",
    sensitive: false,
  },
  {
    id: "academy_progress",
    label: "Academy & trials",
    level2: ["Academy trial preparation", "Scout attention", "Choosing a club", "Training load for young players", "Coming back from being released"],
    defaultTeam: "academy",
    experience: "academy",
    sensitive: false,
  },
  {
    id: "wellbeing",
    label: "Wellbeing, injury & recovery",
    level2: ["Coming back from injury", "Pressure and anxiety", "Sleep and routine", "Being bullied", "School stress"],
    defaultTeam: "care",
    experience: "inspires",
    sensitive: true,
  },
  {
    id: "gratitude",
    label: "Gratitude & personal stories",
    level2: ["What Messi meant to my family", "Watching with a parent who has passed", "A shirt kept for years", "Naming a child", "Recovering while watching football"],
    defaultTeam: "fanrel",
    experience: "my_messi",
    sensitive: false,
  },
  {
    id: "for_good",
    label: "Community & social impact",
    level2: ["Local youth programme requests", "School and club visits", "Access for children with disabilities", "Girls' football", "Equipment donation requests"],
    defaultTeam: "foundation",
    experience: "for_good",
    sensitive: false,
  },
  {
    id: "commerce",
    label: "Products, tickets & experiences",
    level2: ["Shirt and collection questions", "Match tickets", "HoloMe activation locations", "MESSI+ membership questions", "Academy programme pricing"],
    defaultTeam: "commercial",
    experience: "five_minutes",
    sensitive: false,
  },
  {
    id: "reserved",
    label: "Reserved / out of scope",
    level2: ["Transfers & contracts", "Politics", "Other players' disputes", "Private family matters", "Medical or legal advice"],
    defaultTeam: "brand",
    experience: "five_minutes",
    sensitive: true,
  },
];

export const TAXONOMY_BY_ID: Record<string, TopicDefinition> = Object.fromEntries(
  TAXONOMY.map((t) => [t.id, t]),
);

export function teamName(id: string): string {
  return TEAMS.find((t) => t.id === id)?.name ?? "MESSI.LIVE Product (BYOND)";
}

export function experienceName(id: string): string {
  return EXPERIENCES.find((e) => e.id === id)?.name ?? "5 Minutes With Messi";
}

export function topicByLabel(label: string): TopicDefinition | undefined {
  return TAXONOMY.find((t) => t.label === label);
}
