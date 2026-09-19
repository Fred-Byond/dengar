/**
 * AUREN — bounded role-play. A scenario is a state machine, not a prompt.
 *
 * The adversarial rehearsal is the product's sharpest differentiator and its
 * largest risk, and those are the same fact. A machine applying commercial
 * pressure to a real person is either inside a graph somebody approved, or it
 * is an improvisation nobody can bound.
 *
 * THE CONTRACT:
 *
 *   The persona may choose among approved branches. It may not leave the graph.
 *
 * Which means the interesting code here is not `step()` succeeding — it is
 * `step()` refusing. Every refusal below corresponds to a way a role-play goes
 * wrong in the field: the ladder jumped, the ceiling exceeded, an unapproved
 * product introduced, distress ignored, a real payment instrument requested.
 *
 * OWASP's LLM application risks — prompt injection, excessive agency,
 * misinformation — are not addressed by better prompting. They are addressed by
 * the model not being the thing that decides where the conversation goes.
 */

/* ═══════════════════════════════════════════════════════════════════════
   THE GRAPH
   ═════════════════════════════════════════════════════════════════════ */

export interface ScenarioNode {
  id: string;
  label: string;
  /** The pressure rung this node sits on. Monotone along any legal path. */
  rung: number;
  /** The persuasion technique in play, from the controlled vocabulary. */
  technique: string;
  /** Approved things the persona may say here. The model picks; it does not write. */
  lines: string[];
  /** Evidence the persona may put on screen at this node. */
  props: string[];
  /** The failure signature this node is designed to elicit, if any. */
  elicits: string | null;
  /** Nodes reachable from here. The safety exit is added automatically. */
  next: string[];
  /** True for the node that ends the scenario cleanly. */
  terminal?: boolean;
}

export interface Scenario {
  id: string;
  label: string;
  /** The fraud typology, from the Nexus vocabulary. */
  typology: string;
  /** Surface profile, so the retest selector can compute distance. */
  surface: Record<string, string>;
  /** Competency elements this scenario is built to pressure. */
  targetElements: string[];
  nodes: ScenarioNode[];
  entryNodeId: string;
  /** No path may exceed this. The persona's manifest may be lower, never higher. */
  ceiling: number;
  /** Statements the persona may never make in this scenario specifically. */
  prohibited: string[];
  learningObjective: string;
}

/** Reachable from every node, always. Not a node an author can forget to wire. */
export const SAFETY_EXIT: ScenarioNode = {
  id: "SAFE-EXIT",
  label: "Safety exit",
  rung: 0,
  technique: "none",
  lines: [],
  props: [],
  elicits: null,
  next: [],
  terminal: true,
};

export function nodeOf(s: Scenario, id: string): ScenarioNode | undefined {
  if (id === SAFETY_EXIT.id) return SAFETY_EXIT;
  return s.nodes.find((n) => n.id === id);
}

/* ═══════════════════════════════════════════════════════════════════════
   AUTHORING CHECKS — run before a scenario can be released
   ═════════════════════════════════════════════════════════════════════ */

export interface ScenarioFinding {
  subject: string;
  detail: string;
  blocking: boolean;
}

export function checkScenario(s: Scenario): ScenarioFinding[] {
  const out: ScenarioFinding[] = [];
  const ids = new Set(s.nodes.map((n) => n.id));

  if (!ids.has(s.entryNodeId)) {
    out.push({ subject: "entry", detail: `Entry node ${s.entryNodeId} is not in the graph.`, blocking: true });
  }

  for (const n of s.nodes) {
    for (const t of n.next) {
      if (t === SAFETY_EXIT.id) continue;
      const target = nodeOf(s, t);
      if (!target) {
        out.push({ subject: n.id, detail: `Transitions to ${t}, which does not exist.`, blocking: true });
        continue;
      }
      /* A rung that goes down mid-scenario means the persona eased off, which
         no approved adversary does — it is almost always an authoring slip
         that makes the transcript incoherent to a reviewer. */
      if (target.rung < n.rung) {
        out.push({
          subject: n.id,
          detail: `Transitions down from rung ${n.rung} to ${target.rung} at ${t}. Pressure does not decrease inside a scenario; if the intent was to relent, that is the safety exit.`,
          blocking: false,
        });
      }
      if (target.rung > n.rung + 1) {
        out.push({
          subject: n.id,
          detail: `Jumps from rung ${n.rung} to ${target.rung}. A ladder is climbed one rung at a time — jumping is how a rehearsal becomes an ambush.`,
          blocking: true,
        });
      }
    }

    if (n.rung > s.ceiling) {
      out.push({
        subject: n.id,
        detail: `Sits at rung ${n.rung}, above the scenario ceiling of ${s.ceiling}. The node is unreachable under any legal path, which means either the ceiling or the node is wrong.`,
        blocking: true,
      });
    }

    if (!n.terminal && n.next.length === 0) {
      out.push({
        subject: n.id,
        detail: "Non-terminal node with no transitions. The scenario dead-ends here with the learner still under pressure.",
        blocking: true,
      });
    }

    if (n.lines.length === 0 && !n.terminal) {
      out.push({
        subject: n.id,
        detail: "No approved lines. The persona would have to compose its own, which is exactly what the graph exists to prevent.",
        blocking: true,
      });
    }
  }

  /* Every node must be able to reach a terminal, or a learner can be held
     inside the scenario indefinitely. */
  const terminals = new Set(s.nodes.filter((n) => n.terminal).map((n) => n.id));
  if (terminals.size === 0) {
    out.push({ subject: "graph", detail: "No terminal node. The scenario has no clean end.", blocking: true });
  }

  const unreachable = s.nodes.filter(
    (n) => n.id !== s.entryNodeId && !s.nodes.some((m) => m.next.includes(n.id))
  );
  if (unreachable.length) {
    out.push({
      subject: "graph",
      detail: `Unreachable node${unreachable.length === 1 ? "" : "s"}: ${unreachable.map((n) => n.id).join(", ")}. Authored, reviewed, and never played — which means reviewed against nothing.`,
      blocking: false,
    });
  }

  if (s.prohibited.length === 0) {
    out.push({
      subject: "prohibited",
      detail: "No scenario-specific prohibitions recorded. The global list still applies, but a scenario usually has its own.",
      blocking: false,
    });
  }

  return out;
}

export function scenarioReleasable(s: Scenario): boolean {
  return checkScenario(s).every((f) => !f.blocking);
}

/* ═══════════════════════════════════════════════════════════════════════
   RUNTIME — the step that refuses
   ═════════════════════════════════════════════════════════════════════ */

export interface StepRequest {
  scenario: Scenario;
  fromNodeId: string;
  /** Where the persona wants to go. Chosen by the model, checked here. */
  toNodeId: string;
  /** The line the persona proposes to say. Must be one of the node's lines. */
  line: string;
  /** Effective ceiling: the lower of the scenario's and the manifest's. */
  ceiling: number;
  signals: { distress: boolean; learnerResisted: boolean };
}

export interface StepResult {
  allowed: boolean;
  nodeId: string;
  line: string;
  /** Present when the step was refused or redirected, and why. */
  reason?: string;
}

/**
 * Advance the scenario, or refuse to.
 *
 * Distress is checked first and unconditionally. Everything after it is a
 * legality question; distress is not — it routes to the safety exit no matter
 * what the model asked for, what rung the ladder is on, or how close the
 * scenario is to its learning objective.
 */
export function step(req: StepRequest): StepResult {
  const { scenario: s, fromNodeId, toNodeId, line, ceiling, signals } = req;

  if (signals.distress) {
    return {
      allowed: true,
      nodeId: SAFETY_EXIT.id,
      line: "",
      reason:
        "Distress detected. The scenario ends here regardless of rung or objective — a rehearsal that continues through distress has stopped being a rehearsal.",
    };
  }

  const from = nodeOf(s, fromNodeId);
  if (!from) {
    return { allowed: false, nodeId: SAFETY_EXIT.id, line: "", reason: `Unknown current node ${fromNodeId}.` };
  }

  if (toNodeId === SAFETY_EXIT.id) {
    return { allowed: true, nodeId: SAFETY_EXIT.id, line: "", reason: "Safety exit taken." };
  }

  if (!from.next.includes(toNodeId)) {
    return {
      allowed: false,
      nodeId: fromNodeId,
      line: "",
      reason: `${toNodeId} is not an approved transition from ${fromNodeId}. The persona chose a branch that is not in the graph — the turn is dropped and the rung holds.`,
    };
  }

  const to = nodeOf(s, toNodeId)!;

  if (to.rung > ceiling) {
    return {
      allowed: false,
      nodeId: fromNodeId,
      line: "",
      reason: `${toNodeId} sits at rung ${to.rung}, above the effective ceiling of ${ceiling}. The ceiling is the lower of the scenario's and the persona manifest's, and neither may be raised at runtime.`,
    };
  }

  if (!to.lines.includes(line)) {
    return {
      allowed: false,
      nodeId: fromNodeId,
      line: "",
      reason:
        "The proposed line is not one of the approved lines at that node. The persona may choose among authored strings; it may not write the adversary's words.",
    };
  }

  /* A learner who has resisted has done the thing the rehearsal is testing.
     Continuing to escalate past that point is not a harder test, it is a
     different and worse one: it teaches that resisting does not work. */
  if (signals.learnerResisted && to.rung > from.rung) {
    return {
      allowed: true,
      nodeId: SAFETY_EXIT.id,
      line: "",
      reason:
        "The learner held. Escalating past a successful resistance would teach that resisting does not work, which is the opposite of the learning objective.",
    };
  }

  return { allowed: true, nodeId: toNodeId, line };
}

/** How far up the ladder a run actually went — reported on every transcript. */
export function reachedRung(s: Scenario, path: string[]): number {
  return path.reduce((a, id) => Math.max(a, nodeOf(s, id)?.rung ?? 0), 0);
}
