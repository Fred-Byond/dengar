/** Team Intelligence Framework — public API. */

export * from "./types";
export {
  CAPABILITIES,
  CAPABILITY_BY_ID,
  CLIMATE,
  CLIMATE_BY_ID,
  EXCLUDED_CONFOUNDS,
  HUMAN_REVIEW_TRIGGERS,
  LEVELS,
  MIN_SEGMENT_N,
  indexColour,
  levelColour,
  levelFor,
} from "./constructs";
export type { CapabilitySpec, ClimateSpec, LevelSpec, RubricAnchor } from "./constructs";
export { SCENARIOS, SCENARIO_BY_ID, scenariosForFocus } from "./scenarios";
export type { ScenarioSpec } from "./scenarios";
export { THEMES, THEME_BY_ID, OWNERS, CONSTRUCT_OWNER, detectThemes } from "./taxonomy";
export type { ThemeSpec, OwnerSpec } from "./taxonomy";
export {
  INTERVENTIONS,
  INTERVENTION_BY_CONSTRUCT,
  INTERVENTION_BY_ID,
  interventionFor,
} from "./interventions";
export type { InterventionSpec } from "./interventions";
export { deterministicScorer } from "./scorer";
export type { Scorer } from "./scorer";
export {
  buildProfile,
  capabilityResults,
  climateResults,
  interventionPriorities,
  perceptionGaps,
  recommendedOwner,
  segmentProfiles,
  toIndex,
} from "./aggregate";
