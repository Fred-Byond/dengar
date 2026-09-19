/**
 * AUREN — provenance. Source → interpretation → approved object → conversation
 * → determination, as a chain anybody can walk backwards.
 *
 * WHAT THIS IS FOR.
 *
 * The product's whole regulatory claim is that it can say *why* it produced a
 * finding. Not "the model concluded X" — which is unfalsifiable — but: this
 * determination came from this verbatim sentence, scored against this version
 * of this object, which was approved by these roles, derived from this passage
 * of this publication, whose hash we recorded at ingestion.
 *
 * Every link in that chain is separately attackable, and a chain missing one
 * link is worth nothing. A citation with no hash cannot prove the source did
 * not silently change. A hash with no approver cannot prove anyone read it. An
 * approver with no verbatim span cannot prove the finding came from what the
 * learner actually said rather than from what the model expected them to say.
 *
 * SHAPED ON W3C PROV.
 *
 * Entity, Activity, Agent, and the relations `wasDerivedFrom`,
 * `wasAttributedTo`, `hadPrimarySource`, `wasRevisionOf`, `wasGeneratedBy` and
 * `wasInvalidatedBy`. Using the standard's vocabulary rather than inventing one
 * is not pedantry: an auditor who already reads PROV can read this, and an
 * export to a regulator's own system is a mapping rather than a translation.
 */

/* ═══════════════════════════════════════════════════════════════════════
   THE THREE PROV PRIMITIVES
   ═════════════════════════════════════════════════════════════════════ */

/** A thing: a source document, a clause, an object version, an utterance. */
export interface ProvEntity {
  id: string;
  kind:
    | "source_document"
    | "source_passage"
    | "knowledge_object"
    | "bundle"
    | "utterance"
    | "determination";
  label: string;
  /** Content hash at the moment it entered the system. */
  hash: string | null;
  /** When this entity was observed or minted. */
  at: string;
}

/** Something that happened to an entity. */
export interface ProvActivity {
  id: string;
  kind:
    | "ingestion"
    | "object_creation"
    | "review"
    | "approval"
    | "native_review"
    | "adversarial_test"
    | "release"
    | "conversation_turn"
    | "scoring"
    | "retirement";
  at: string;
  /** Free text: what was actually done. */
  detail: string;
}

/**
 * Who is responsible. A role for anything that ships in the object register,
 * an identity for anything that ships in the release ledger — the same split
 * `console/schema.ts` already makes, carried through here rather than quietly
 * re-decided.
 */
export interface ProvAgent {
  id: string;
  kind: "organisation" | "role" | "person" | "software";
  label: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   THE RELATIONS
   ═════════════════════════════════════════════════════════════════════ */

export interface ProvLink {
  relation:
    | "wasDerivedFrom"
    | "hadPrimarySource"
    | "wasAttributedTo"
    | "wasGeneratedBy"
    | "wasRevisionOf"
    | "wasInvalidatedBy"
    | "used";
  from: string;
  to: string;
}

export interface ProvGraph {
  entities: ProvEntity[];
  activities: ProvActivity[];
  agents: ProvAgent[];
  links: ProvLink[];
}

/* ═══════════════════════════════════════════════════════════════════════
   THE CHAIN A DETERMINATION MUST CARRY
   ═════════════════════════════════════════════════════════════════════ */

/**
 * One scored finding about one person, and everything standing behind it.
 *
 * `span` is the load-bearing field. A determination whose span is empty is a
 * model opinion wearing an object id, and it must not be scoreable — which is
 * why `checkChain` treats a missing span as blocking rather than advisory.
 */
export interface Determination {
  id: string;
  /** The competency element this resolves. */
  elementId: string;
  /** The object version that produced it — not just the object. */
  objectId: string;
  objectVersion: string;
  /** The question that elicited it. */
  elicitedBy: string;
  /** The learner's own words, verbatim, unedited. */
  span: string;
  /** Where in the turn the span sits, so a reviewer can find it in context. */
  turnIndex: number;
  outcome: "demonstrated" | "failed" | "not_tested";
  /** The language the exchange ran in — cues differ per language. */
  lang: string;
  /** Bundle the object was loaded from, so the whole set is reconstructible. */
  bundleId: string;
  at: string;
}

export interface ChainFinding {
  link: string;
  detail: string;
  blocking: boolean;
}

/**
 * Walk a determination back to a registered source and report what is missing.
 *
 * Written as a set of separate checks rather than one boolean because the
 * failures are not equivalent: a determination with no verbatim span cannot be
 * defended at all, while one whose source hash is absent can be defended today
 * and not in a year. Collapsing those into "invalid" would make the severe
 * case and the housekeeping case look the same to whoever has to fix them.
 */
export function checkChain(
  d: Determination,
  g: ProvGraph
): ChainFinding[] {
  const out: ChainFinding[] = [];
  const entity = (id: string) => g.entities.find((e) => e.id === id);
  const linksFrom = (id: string) => g.links.filter((l) => l.from === id);

  if (!d.span || !d.span.trim()) {
    out.push({
      link: "span",
      detail:
        "No verbatim span. The finding cannot point at anything the person actually said, which makes it a model opinion carrying an object id. Nothing downstream may score it.",
      blocking: true,
    });
  }

  if (!d.objectVersion) {
    out.push({
      link: "objectVersion",
      detail:
        "Object cited without a version. Objects supersede, so a citation without a version resolves to whatever is current — which is not what scored this person.",
      blocking: true,
    });
  }

  const obj = entity(d.objectId);
  if (!obj) {
    out.push({
      link: "knowledge_object",
      detail: `Object ${d.objectId} is not in the provenance graph. Nothing connects this finding to an approved object.`,
      blocking: true,
    });
  } else {
    const src = linksFrom(obj.id).find((l) => l.relation === "hadPrimarySource");
    if (!src) {
      out.push({
        link: "hadPrimarySource",
        detail:
          "The object cites no primary source. An element with no published principle behind it is the programme's own opinion, and the publish gate blocks it for that reason.",
        blocking: true,
      });
    } else {
      const passage = entity(src.to);
      if (passage && !passage.hash) {
        out.push({
          link: "source_hash",
          detail:
            "The source passage carries no hash. It can be cited but not shown to be unchanged since ingestion — defensible today, undefendable the first time the publisher edits the page.",
          blocking: false,
        });
      }
    }

    const approval = linksFrom(obj.id).find((l) => l.relation === "wasAttributedTo");
    if (!approval) {
      out.push({
        link: "wasAttributedTo",
        detail: "No approving agent recorded. Nobody is accountable for this object reaching a learner.",
        blocking: true,
      });
    }
  }

  if (!d.bundleId) {
    out.push({
      link: "bundle",
      detail:
        "No bundle recorded. The object version is known but the set it was loaded with is not, so the session cannot be reconstructed exactly.",
      blocking: false,
    });
  }

  if (!d.lang) {
    out.push({
      link: "lang",
      detail:
        "No session language. Evidence rules are per-language, so a finding without one cannot be checked against the cues that produced it.",
      blocking: true,
    });
  }

  return out;
}

export function chainDefensible(d: Determination, g: ProvGraph): boolean {
  return checkChain(d, g).every((f) => !f.blocking);
}

/* ═══════════════════════════════════════════════════════════════════════
   SOURCE HASHING
   ═════════════════════════════════════════════════════════════════════ */

/**
 * A short, stable digest of a source passage.
 *
 * FNV-1a, deliberately: this proves a passage has not silently changed between
 * ingestion and review, which is a tamper-*evidence* problem, not a tamper-
 * *proofing* one. A cryptographic digest belongs here in production and would
 * need a dependency; what must not happen is a hash field that is left empty
 * because the real one was inconvenient, since an empty hash is indistinguish-
 * able from an unchanged source.
 */
export function sourceHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return "fnv1a-" + h.toString(16).padStart(8, "0");
}

/** True when the passage still hashes to what was recorded at ingestion. */
export function sourceUnchanged(text: string, recorded: string): boolean {
  return sourceHash(text) === recorded;
}
