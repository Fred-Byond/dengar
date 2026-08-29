"use client";

import { useCallback, useMemo, useState } from "react";
import { runGate, type ReleaseReport } from "@/lib/console/gate";
import { library } from "@/lib/console/library";
import { buildBundle, type ReleaseEvent } from "@/lib/console/release";
import {
  STATUS_CHAIN,
  nextStatus,
  type KnowledgeObject,
  type ObjectStatus,
} from "@/lib/console/schema";
import { VERTICALS, vertical } from "@/lib/console/verticals";
import styles from "./console.module.css";

/**
 * Knowledge Authority — the internal admin console.
 *
 * The journey an ontology administrator actually walks:
 *
 *   sign in → workspace switch → choose vertical → work the library
 *   → advance an object through the governance chain → run the publish gate
 *   → read the release report → release (only if every hard gate passes)
 *   → the release ledger records who signed it
 *
 * Two things this console deliberately does NOT do, because neither is
 * honest. It does not "train" anything — ingestion produces DRAFT objects for
 * a human to anchor and approve, and the model never learns from an upload.
 * And it does not let an administrator create a vertical: a vertical is an
 * authority-anchored ontology with legal review behind it, which is expert
 * months of work that no dashboard shortens.
 */

type Workspace = "authority" | "operations";
type Panel = "library" | "gate" | "releases";

interface Reviewer {
  name: string;
  role: string;
}

export function ConsoleApp() {
  const [reviewer, setReviewer] = useState<Reviewer | null>(null);
  const [name, setName] = useState("Fred Chong");
  const [role, setRole] = useState("role:domain_reviewer");

  const [workspace, setWorkspace] = useState<Workspace>("authority");
  const [verticalId, setVerticalId] = useState("auren");
  const [panel, setPanel] = useState<Panel>("library");
  const [selected, setSelected] = useState<string | null>(null);

  /** Per-vertical working copy. Status advances are local until released. */
  const [libs, setLibs] = useState<Record<string, KnowledgeObject[]>>(() =>
    Object.fromEntries(VERTICALS.map((v) => [v.id, library(v.id)]))
  );
  const [report, setReport] = useState<Record<string, ReleaseReport>>({});
  const [ledger, setLedger] = useState<ReleaseEvent[]>([]);

  const pack = vertical(verticalId);
  // Memoised: the `?? []` fallback allocates a fresh array each render, which
  // would invalidate every downstream memo and callback.
  const objects = useMemo(() => libs[verticalId] ?? [], [libs, verticalId]);
  const current = report[verticalId] ?? null;

  const counts = useMemo(() => {
    const effective = objects.filter((o) => o.governance.status === "EFFECTIVE").length;
    const inReview = objects.filter(
      (o) => o.governance.status !== "EFFECTIVE" && o.governance.status !== "RETIRED"
    ).length;
    const unanchored = objects.filter(
      (o) => o.kind === "element" && !o.authorityAnchor.trim()
    ).length;
    const pendingFidelity = objects.filter(
      (o) => o.kind === "question" && o.variants.some((v) => v.fidelity !== "passed")
    ).length;
    return { effective, inReview, unanchored, pendingFidelity };
  }, [objects]);

  const advance = useCallback(
    (id: string) => {
      setLibs((prev) => {
        const next = { ...prev };
        next[verticalId] = (prev[verticalId] ?? []).map((o) => {
          if (o.id !== id) return o;
          const to = nextStatus(o.governance.status);
          if (!to) return o;
          return {
            ...o,
            governance: {
              ...o.governance,
              status: to,
              // Reaching EFFECTIVE without a date makes the object
              // irreproducible against a point in time — traceability catches
              // it, so stamp it here rather than let the gate scold us.
              effectiveDate:
                to === "EFFECTIVE"
                  ? new Date().toISOString().slice(0, 10)
                  : o.governance.effectiveDate,
              approverRoles: o.governance.approverRoles.includes(role)
                ? o.governance.approverRoles
                : [...o.governance.approverRoles, role],
            },
          };
        });
        return next;
      });
      // The report describes a library that no longer exists. Drop it rather
      // than show a stale verdict beside changed objects.
      setReport((prev) => {
        const next = { ...prev };
        delete next[verticalId];
        return next;
      });
    },
    [verticalId, role]
  );

  /**
   * Emergency withdrawal — Pioneer's one-step transition to RETIRED, taking
   * effect at the next session start. It is also the honest way to clear a
   * coverage failure: an element nobody can yet write a question for does not
   * belong in the bundle, and retiring it is a decision with a name on it
   * rather than a gate quietly ignored.
   */
  const retire = useCallback(
    (id: string) => {
      setLibs((prev) => {
        const next = { ...prev };
        next[verticalId] = (prev[verticalId] ?? []).map((o) =>
          o.id === id
            ? { ...o, governance: { ...o.governance, status: "RETIRED" as ObjectStatus } }
            : o
        );
        return next;
      });
      setReport((prev) => {
        const next = { ...prev };
        delete next[verticalId];
        return next;
      });
    },
    [verticalId]
  );

  const gate = useCallback(() => {
    setReport((prev) => ({ ...prev, [verticalId]: runGate(pack, objects) }));
    setPanel("gate");
  }, [pack, objects, verticalId]);

  const release = useCallback(() => {
    if (!current?.releasable || !reviewer) return;
    const bundle = buildBundle(verticalId, objects);
    setLedger((prev) => [
      {
        bundleId: bundle.id,
        verticalId,
        approver: `${reviewer.name} · ${reviewer.role}`,
        at: new Date().toISOString(),
        markets: pack.markets,
        note: `${bundle.objectCount} objects · all hard gates passed`,
        rolledBack: false,
      },
      ...prev,
    ]);
    setPanel("releases");
  }, [current, reviewer, verticalId, objects, pack]);

  const rollback = useCallback((bundleId: string) => {
    setLedger((prev) =>
      prev.map((e) => (e.bundleId === bundleId ? { ...e, rolledBack: true } : e))
    );
  }, []);

  /* ── Sign in ──────────────────────────────────────────────────────── */
  if (!reviewer) {
    return (
      <div className={styles.root}>
        <div className={styles.signin}>
          <div className={styles.signinCard}>
            <div className={styles.wordmark}>
              <span className={styles.mark} />
              <span className={styles.wordmarkText}>Knowledge Authority</span>
            </div>
            <h1>Sign in to the governance workspace.</h1>
            <p>
              Your role decides what you can approve. It is recorded on every
              object you advance, and your name is recorded on every release you
              sign — never the other way round.
            </p>
            <div className={styles.field}>
              <label htmlFor="ka-name">Name</label>
              <input
                id="ka-name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="ka-role">Role</label>
              <select
                id="ka-role"
                className={styles.input}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="role:domain_reviewer">Domain reviewer</option>
                <option value="role:legal_reviewer">Legal reviewer</option>
                <option value="role:safety_reviewer">Safety reviewer</option>
                <option value="role:regulatory_approver">Regulatory approver</option>
                <option value="role:platform_admin">Platform admin (BYOND)</option>
              </select>
            </div>
            <button
              type="button"
              className={styles.btn}
              onClick={() => setReviewer({ name: name.trim() || "Reviewer", role })}
            >
              Enter workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  const detail = selected ? objects.find((o) => o.id === selected) ?? null : null;

  return (
    <div className={styles.root}>
      {/* ── Top bar. Beauty §3.4: the workspace switch is a switch, and the
             permission boundary is deliberately visible. ────────────────── */}
      <div className={styles.topbar}>
        <div className={styles.wordmark}>
          <span className={styles.mark} />
          <span className={styles.wordmarkText}>Knowledge Authority</span>
        </div>
        <div className={styles.wsSwitch}>
          <button
            type="button"
            className={`${styles.wsBtn} ${workspace === "authority" ? styles.wsBtnOn : ""}`}
            onClick={() => setWorkspace("authority")}
          >
            Governance
          </button>
          <button
            type="button"
            className={`${styles.wsBtn} ${workspace === "operations" ? styles.wsBtnOn : ""}`}
            onClick={() => setWorkspace("operations")}
          >
            Operations
          </button>
        </div>
        <span className={styles.spacer} />
        <div className={styles.who}>
          <b>{reviewer.name}</b>
          <br />
          {reviewer.role}
        </div>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={() => setReviewer(null)}
        >
          Sign out
        </button>
      </div>

      <div className={styles.body}>
        {/* ── Side ─────────────────────────────────────────────────────── */}
        <aside className={styles.side}>
          <div className={styles.sideGroup}>
            <span className={styles.sideLabel}>Vertical</span>
            {VERTICALS.map((v) => (
              <button
                type="button"
                key={v.id}
                className={`${styles.vBtn} ${v.id === verticalId ? styles.vBtnOn : ""}`}
                onClick={() => {
                  setVerticalId(v.id);
                  setSelected(null);
                  setPanel("library");
                }}
              >
                <span className={styles.vDot} style={{ background: v.accent }} />
                <span>
                  <span className={styles.vName}>{v.name}</span>
                  <span className={styles.vMeta}>
                    {v.doctrine === "neutral" ? "Neutral doctrine" : "Dual doctrine"} ·{" "}
                    {(libs[v.id] ?? []).length} objects
                  </span>
                </span>
              </button>
            ))}
          </div>

          {workspace === "authority" ? (
            <div className={styles.sideGroup}>
              <span className={styles.sideLabel}>Workspace</span>
              {(
                [
                  ["library", "Object library"],
                  ["gate", "Publish gate"],
                  ["releases", "Release ledger"],
                ] as [Panel, string][]
              ).map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  className={`${styles.navBtn} ${panel === id ? styles.navBtnOn : ""}`}
                  onClick={() => setPanel(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          <div className={styles.sideGroup}>
            <span className={styles.sideLabel}>Doctrine</span>
            <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.55 }}>
              {pack.humanAuthority}
              <br />
              <span className={styles.mono}>{pack.anchorAuthority}</span>
            </div>
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────────────────── */}
        <main className={styles.main}>
          {workspace === "operations" ? (
            <OperationsPanel packName={pack.name} outputObject={pack.outputObject} />
          ) : panel === "library" ? (
            <>
              <div className={styles.pageHead}>
                <div>
                  <span className={styles.eyebrow}>{pack.source}</span>
                  <h2>{pack.name} object library</h2>
                  <p>
                    {pack.programme}. Objects reach the runtime only at{" "}
                    <span className={styles.mono}>EFFECTIVE</span>; the resolver
                    refuses to load anything else.
                  </p>
                </div>
                <div className={styles.btnRow}>
                  <button type="button" className={styles.btn} onClick={gate}>
                    Run publish gate
                  </button>
                </div>
              </div>

              <div className={styles.stats}>
                <Stat n={counts.effective} l="Effective — in the bundle" />
                <Stat n={counts.inReview} l="In review — not released" />
                <Stat n={counts.unanchored} l="Elements without an anchor" />
                <Stat n={counts.pendingFidelity} l="Questions with a pending variant" />
              </div>

              {detail ? (
                <ObjectDetail
                  object={detail}
                  onClose={() => setSelected(null)}
                  onAdvance={() => advance(detail.id)}
                  onRetire={() => retire(detail.id)}
                />
              ) : null}

              <div className={styles.tw} style={{ marginTop: detail ? 20 : 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Object</th>
                      <th>Kind</th>
                      <th>Status</th>
                      <th>Anchor / source</th>
                      <th>Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {objects.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <button
                            type="button"
                            className={styles.rowBtn}
                            onClick={() => setSelected(o.id)}
                          >
                            {o.id}
                          </button>
                          <div className={styles.mono} style={{ marginTop: 2 }}>
                            {o.label.length > 74 ? `${o.label.slice(0, 74)}…` : o.label}
                          </div>
                        </td>
                        <td>
                          <span className={styles.kindChip}>{o.kind}</span>
                        </td>
                        <td>
                          <StatusChip status={o.governance.status} />
                        </td>
                        <td className={styles.mono}>
                          {o.kind === "element"
                            ? o.authorityAnchor || "— none —"
                            : o.governance.source}
                        </td>
                        <td className={styles.mono}>
                          {o.eligibility.modes.join(", ") || "any mode"}
                          <br />
                          {o.eligibility.markets.join(", ") || "any market"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : panel === "gate" ? (
            <GatePanel
              report={current}
              packName={pack.name}
              onRun={gate}
              onRelease={release}
              canRelease={!!current?.releasable}
            />
          ) : (
            <LedgerPanel
              ledger={ledger.filter((e) => e.verticalId === verticalId)}
              onRollback={rollback}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Pieces ────────────────────────────────────────────────────────────── */

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statN}>{n}</div>
      <div className={styles.statL}>{l}</div>
    </div>
  );
}

function StatusChip({ status }: { status: ObjectStatus }) {
  const cls =
    status === "EFFECTIVE"
      ? styles.chipEffective
      : status === "APPROVED"
        ? styles.chipApproved
        : status === "DRAFT"
          ? styles.chipDraft
          : status === "RETIRED" || status === "SUPERSEDED"
            ? styles.chipRetired
            : styles.chipReview;
  return <span className={`${styles.chip} ${cls}`}>{status.replace(/_/g, " ")}</span>;
}

function ObjectDetail({
  object,
  onClose,
  onAdvance,
  onRetire,
}: {
  object: KnowledgeObject;
  onClose: () => void;
  onAdvance: () => void;
  onRetire: () => void;
}) {
  const to = nextStatus(object.governance.status);
  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <span className={styles.eyebrow}>{object.kind}</span>
        <h3>{object.id}</h3>
        <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{object.label}</div>
      </div>

      <div className={styles.chain}>
        {STATUS_CHAIN.map((s, i) => {
          const at = STATUS_CHAIN.indexOf(object.governance.status);
          const cls =
            i < at ? styles.chainDone : i === at ? styles.chainNow : "";
          return (
            <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              {i > 0 ? <span className={styles.chainArrow}>›</span> : null}
              <span className={`${styles.chainStep} ${cls}`}>{s.replace(/_/g, " ")}</span>
            </span>
          );
        })}
      </div>

      <dl className={styles.kv}>
        <dt>Version</dt>
        <dd className={styles.mono}>{object.governance.version}</dd>
        <dt>Approver roles</dt>
        {/* Roles only. The named individual lives on the release event. */}
        <dd className={styles.mono}>
          {object.governance.approverRoles.join(", ") || "— none yet —"}
        </dd>
        <dt>Source</dt>
        <dd>{object.governance.source}</dd>
        <dt>Effective date</dt>
        <dd className={styles.mono}>{object.governance.effectiveDate ?? "— not effective —"}</dd>
        <dt>Modes</dt>
        <dd className={styles.mono}>{object.eligibility.modes.join(", ") || "unconstrained"}</dd>
        <dt>Languages</dt>
        <dd className={styles.mono}>{object.eligibility.languages.join(", ") || "unconstrained"}</dd>
        <dt>Markets</dt>
        <dd className={styles.mono}>{object.eligibility.markets.join(", ") || "unconstrained"}</dd>
        {object.kind === "element" ? (
          <>
            <dt>Authority anchor</dt>
            <dd>{object.authorityAnchor || "— none. Blocks release. —"}</dd>
            <dt>Capturable</dt>
            <dd>
              {object.capturable
                ? "Yes"
                : "No — inferred, never asked. Legitimately unresolvable at intake."}
            </dd>
          </>
        ) : null}
        {object.kind === "question" ? (
          <>
            <dt>Target element</dt>
            <dd className={styles.mono}>{object.targetElement}</dd>
            <dt>Leading risk</dt>
            <dd>
              {object.leadingRisk}
              {object.leadingRiskRationale ? ` — ${object.leadingRiskRationale}` : ""}
            </dd>
            <dt>Fires only after</dt>
            <dd className={styles.mono}>{object.firesOnlyAfter ?? "— unconditioned —"}</dd>
            <dt>Variants</dt>
            <dd className={styles.mono}>
              {object.variants
                .map((v) => `${v.lang}:${v.fidelity}`)
                .join("  ")}
            </dd>
          </>
        ) : null}
        {object.kind === "challenge" ? (
          <>
            <dt>Ladder</dt>
            <dd className={styles.mono}>
              {object.ladderSteps} steps · ceiling {object.ladderCeiling}
            </dd>
            <dt>Distress exit</dt>
            <dd>{object.distressExit ? "Present" : "Absent — blocks release"}</dd>
          </>
        ) : null}
        {object.kind === "boundary" ? (
          <>
            <dt>Refusal</dt>
            <dd>{object.refusalBehaviour}</dd>
            <dt>Probes</dt>
            <dd>{object.probes.join(" · ")}</dd>
          </>
        ) : null}
      </dl>

      <div className={styles.btnRow}>
        <button type="button" className={styles.btn} disabled={!to} onClick={onAdvance}>
          {to ? `Advance to ${to.replace(/_/g, " ")}` : "Fully effective"}
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnGhost}`}
          disabled={object.governance.status === "RETIRED"}
          onClick={onRetire}
        >
          Retire
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function GatePanel({
  report,
  packName,
  onRun,
  onRelease,
  canRelease,
}: {
  report: ReleaseReport | null;
  packName: string;
  onRun: () => void;
  onRelease: () => void;
  canRelease: boolean;
}) {
  if (!report) {
    return (
      <>
        <div className={styles.pageHead}>
          <div>
            <span className={styles.eyebrow}>Publish gate</span>
            <h2>{packName} release report</h2>
            <p>
              Nine tests, six of them blocking. The gate is not a report
              generated after release — it is the condition of release.
            </p>
          </div>
          <button type="button" className={styles.btn} onClick={onRun}>
            Run gate
          </button>
        </div>
        <div className={styles.empty}>No report yet. Run the gate against the current library.</div>
      </>
    );
  }

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <span className={styles.eyebrow}>
            Publish gate · {new Date(report.generatedAt).toLocaleString()}
          </span>
          <h2>{packName} release report</h2>
        </div>
        <div className={styles.btnRow}>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onRun}>
            Re-run
          </button>
          <button type="button" className={styles.btn} disabled={!canRelease} onClick={onRelease}>
            Release bundle
          </button>
        </div>
      </div>

      <div
        className={`${styles.verdictBar} ${report.releasable ? styles.verdictBarOk : ""}`}
      >
        <span className={styles.verdictText}>
          {report.releasable ? "Releasable." : "Blocked."}
        </span>
        <span className={styles.mono}>
          {report.effectiveCount}/{report.totalCount} effective · {report.hardFailures} hard ·{" "}
          {report.advisoryFailures} advisory
        </span>
        <span className={styles.verdictSub}>
          {report.releasable
            ? "Every hard gate passed. Advisory findings do not block, and they do not disappear either."
            : "A hard gate failed. There is no waive path — for BYOND either, by design."}
        </span>
      </div>

      <div className={styles.gateList}>
        {report.results.map((r) => {
          const mark = !r.assessed
            ? { t: "n/a", c: styles.markNa }
            : r.passed
              ? { t: "pass", c: styles.markPass }
              : r.severity === "hard"
                ? { t: "blocked", c: styles.markHard }
                : { t: "advisory", c: styles.markAdv };
          return (
            <div className={styles.gate} key={r.id}>
              <div className={styles.gateHead}>
                <span className={`${styles.gateMark} ${mark.c}`}>{mark.t}</span>
                <span>
                  <span className={styles.gateName}>{r.name}</span>
                  <span className={styles.gateAsserts}>{r.asserts}</span>
                </span>
                <span className={styles.gateCount}>
                  {r.assessed ? `${r.checked} checked` : "not assessed"}
                </span>
              </div>
              {r.findings.length ? (
                <div className={styles.findings}>
                  {r.findings.map((f, i) => (
                    <div className={styles.finding} key={`${f.subject}-${i}`}>
                      <span className={styles.findingSubject}>{f.subject}</span>
                      <span className={styles.findingDetail}>{f.detail}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}

function LedgerPanel({
  ledger,
  onRollback,
}: {
  ledger: ReleaseEvent[];
  onRollback: (id: string) => void;
}) {
  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <span className={styles.eyebrow}>Append-only</span>
          <h2>Release ledger</h2>
          <p>
            The object register carries roles; this ledger carries names. Both
            papers get the export they need without either compromising.
          </p>
        </div>
      </div>
      {ledger.length === 0 ? (
        <div className={styles.empty}>
          No releases yet. A bundle appears here the moment one is signed.
        </div>
      ) : (
        <div className={styles.tw}>
          <table>
            <thead>
              <tr>
                <th>Bundle</th>
                <th>Approver</th>
                <th>Markets</th>
                <th>Signed</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {ledger.map((e) => (
                <tr key={`${e.bundleId}-${e.at}`}>
                  <td>
                    <span className={styles.mono}>{e.bundleId}</span>
                    <div className={styles.statL}>{e.note}</div>
                  </td>
                  <td>{e.approver}</td>
                  <td className={styles.mono}>{e.markets.join(", ")}</td>
                  <td className={styles.mono}>{new Date(e.at).toLocaleString()}</td>
                  <td>
                    {e.rolledBack ? (
                      <span className={`${styles.chip} ${styles.chipRetired}`}>rolled back</span>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnGhost}`}
                        onClick={() => onRollback(e.bundleId)}
                      >
                        Roll back
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function OperationsPanel({
  packName,
  outputObject,
}: {
  packName: string;
  outputObject: string;
}) {
  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <span className={styles.eyebrow}>Separate workspace</span>
          <h2>{packName} operations</h2>
          <p>
            Records, cohort analytics and remediation queues over the{" "}
            {outputObject}. Tenant-isolated, and never linked across tenants.
          </p>
        </div>
      </div>
      <div className={styles.note}>
        <b>Deliberately separate from governance, and deliberately empty here.</b>{" "}
        Operations reads the data plane — sessions, records, evidence — which is
        tenant-isolated and jurisdiction-resident. The governance workspace reads
        the knowledge plane, which holds no personal data at all and is what
        ships to a sovereign environment as a signed bundle. An error in this
        workspace is an inconvenience; an error in the one next door is a
        regulatory event. They do not share a screen, an undo history or a
        permission set.
      </div>
    </>
  );
}
