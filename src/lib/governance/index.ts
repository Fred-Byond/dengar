/**
 * Data governance — classification, access control and restricted-disclosure
 * handling. The enforceable half of docs/DATA-GOVERNANCE.md.
 *
 * Server-side only. Never authorise from a client-side role claim.
 */

export * from "./classification";
export * from "./access";
export * from "./referral";
