/**
 * Release bundles and the release ledger.
 *
 * A bundle is an immutable, content-addressed snapshot of the EFFECTIVE set.
 * The runtime loads a bundle id and nothing else; rollback is pointing at the
 * previous id. Every session records the bundle it ran on, which is what makes
 * a historical determination reproducible against the knowledge state at the
 * time of capture — Pioneer calls this "a directly court-relevant property".
 *
 * CONFLICT 2, second half. The OBJECT carries an approver role (see ./schema).
 * The RELEASE EVENT carries a named identity, here, in an append-only ledger.
 * Pioneer exports the object register with no individual named in it; Beauty
 * exports the ledger and can answer "who approved this claim, and when".
 */

import type { KnowledgeObject } from "./schema";
import { isLoadable } from "./schema";

export interface ReleaseBundle {
  /** Content-addressed. The same object set always produces the same id. */
  id: string;
  verticalId: string;
  objectIds: string[];
  objectCount: number;
}

export interface ReleaseEvent {
  bundleId: string;
  verticalId: string;
  /** The named person. Never on the object; always on the event. */
  approver: string;
  at: string;
  markets: string[];
  note: string;
  /** Rolled-back releases stay in the ledger. The record is append-only. */
  rolledBack: boolean;
}

/**
 * Deterministic content address over the effective set.
 *
 * Not cryptographic — a real deployment signs the bundle. It is deterministic,
 * which is the property the console needs: two identical libraries produce one
 * bundle id, so "nothing changed" is visible rather than asserted.
 */
export function buildBundle(verticalId: string, objects: KnowledgeObject[]): ReleaseBundle {
  const effective = objects
    .filter((o) => isLoadable(o.governance.status))
    .map((o) => `${o.id}@${o.governance.version}`)
    .sort();

  let h = 2166136261;
  for (const s of effective.join("|")) {
    h ^= s.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");

  return {
    id: `bundle-${verticalId}-${hex}`,
    verticalId,
    objectIds: effective,
    objectCount: effective.length,
  };
}
