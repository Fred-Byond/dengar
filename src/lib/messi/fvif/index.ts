/**
 * Fan Voice Intelligence Framework — public API.
 *
 * The intelligence layer of MESSI.LIVE, and the reason the platform is an
 * asset rather than a feature: every controlled 5-minute conversation becomes
 * one comparable, evidence-grounded Fan Insight Record.
 */

export * from "./types";
export * from "./dimensions";
export * from "./taxonomy";
export { deterministicScorer, type Scorer } from "./scorer";
