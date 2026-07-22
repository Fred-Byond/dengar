/**
 * Digital-human integration — public API.
 *
 * The seam between DENGAR.ai and the existing conversation engine. See
 * docs/INTEGRATION-DIGITAL-HUMAN.md for the sequence and the Phase-0 contract
 * to confirm with the platform team.
 */

export * from "./types";
export {
  type DigitalHumanGateway,
  MockDigitalHumanGateway,
  toTranscriptInput,
} from "./gateway";
export {
  KLLEON_AVATAR_ID,
  KLLEON_SDK_URL,
  klleonVoiceCodes,
  loadKlleonScript,
} from "./adapters/klleon";
