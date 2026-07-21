/**
 * Citizen Voice Intelligence Framework (CVIF) — public API.
 *
 * The intelligence layer of DENGAR.ai. Turns a controlled 5-minute listening
 * session into a de-identified, evidence-grounded Session Insight Record that
 * feeds the National Pulse dashboard and the weekly Ministry briefing.
 *
 * See docs/CVIF.md for the framework narrative and docs/ARCHITECTURE.md for
 * where this sits in the pipeline.
 */

export * from "./types";
export * from "./dimensions";
export * from "./taxonomy";
export { deterministicScorer, type Scorer } from "./scorer";
