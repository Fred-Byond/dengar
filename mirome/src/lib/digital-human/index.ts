/**
 * Digital-human integration — public API.
 *
 * The seam between MIROME Team Intelligence and the existing conversation
 * engine. See docs/INTEGRATION-DIGITAL-HUMAN.md for the sequence and the
 * Phase-1 contract to confirm with the platform team.
 */

export * from "./types";
export {
  type DigitalHumanGateway,
  MockDigitalHumanGateway,
  TEAM_DIAGNOSIS_PROFILE,
  toTranscriptInput,
} from "./gateway";
export {
  KLLEON_AVATAR_ID,
  KLLEON_SDK_URL,
  klleonVoiceCodes,
  loadKlleonScript,
} from "./adapters/klleon";
