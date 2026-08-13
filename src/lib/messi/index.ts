/**
 * MESSI.LIVE — public API of the platform library.
 *
 * One Messi. Every Fan. Every Language. Anywhere.
 *
 * Same architecture as DENGAR.ai's citizen-listening platform: a controlled
 * digital-human session produces comparable data (FVIF), aggregation turns
 * that data into a management view (Global Pulse), and a recurring document
 * (World Brief) closes the loop back to the principal.
 */

export * from "./fvif";
export * from "./types";
export * from "./markets";
export * from "./commercial";
export { generateConversations, type SeededConversation } from "./seed";
export {
  buildPulse,
  buildCuration,
  type Pulse,
  type TopicSignal,
  type CountrySignal,
  type CuratedQuestion,
  type CareSummary,
} from "./pulse";
export {
  buildWorldBrief,
  type WorldBrief,
  type BriefTheme,
  type ContentCommission,
  type CommercialSignal,
} from "./brief";
