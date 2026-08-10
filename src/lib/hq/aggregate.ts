/**
 * HQ Launch Readiness aggregation — turns raw sessions, transcripts and
 * scorecards into the dashboard's launch-level view. Pure reads; pilot-scale
 * SQL + JS post-processing (hundreds of advisors, not millions).
 */

import { getDb } from "@/lib/db";
import { getLatestPack, listProducts } from "@/lib/db/repos";
import type { DimensionScore } from "@/lib/coach/types";
import { READINESS_DIMENSIONS } from "@/lib/readiness/dimensions";

interface SessionRow {
  id: string;
  advisorId: string;
  advisorName: string;
  startedAt: string;
  distributorId: string;
  distributorName: string;
  territoryName: string;
  marketName: string;
}
interface CardRow {
  sessionId: string;
  advisorId: string;
  overall: number;
  certified: number;
  dimensions: string;
  createdAt: string;
}

type Kpi = { k: string; v: string; d: string; cls: string };
export interface LaunchSummary {
  title: string;
  kpis: Kpi[];
  markets: Array<{ m: string; score: number; cert: number; adv: number }>;
  dims: Record<string, Array<[string, number]>>;
  claims: Array<[string, number]>;
  trend: number[];
  dists: Array<[string, string, number, number, number, number, number, number]>;
  adoption: Array<{ label: string; count: number; current: boolean }>;
  recoach: Array<[string, string, string, number]>;
}

const avg = (xs: number[]) =>
  xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;

function dimAverages(cards: { dims: DimensionScore[] }[]): Array<[string, number]> {
  return READINESS_DIMENSIONS.map((d) => {
    const vals = cards
      .map((c) => c.dims.find((x) => x.dimensionId === d.id)?.score)
      .filter((s): s is number => typeof s === "number");
    return [d.label, avg(vals)];
  });
}

export function buildLaunchSummary(productId: string): LaunchSummary | null {
  const db = getDb();
  const product = listProducts().find((p) => p.id === productId);
  if (!product) return null;

  const sessions = db
    .prepare(
      `SELECT s.id, s.advisor_id AS advisorId, a.name AS advisorName,
              s.started_at AS startedAt, d.id AS distributorId,
              d.name AS distributorName, t.name AS territoryName, m.name AS marketName
         FROM sessions s
         JOIN advisors a ON a.id = s.advisor_id
         JOIN distributors d ON d.id = a.distributor_id
         JOIN territories t ON t.id = d.territory_id
         JOIN markets m ON m.id = d.market_id
        WHERE s.product_id = ?`
    )
    .all(productId) as SessionRow[];
  if (sessions.length === 0) return null;
  const byId = new Map(sessions.map((s) => [s.id, s]));

  const cardRows = db
    .prepare(
      `SELECT sc.session_id AS sessionId, sc.advisor_id AS advisorId,
              sc.overall, sc.certified, sc.dimensions, sc.created_at AS createdAt
         FROM scorecards sc JOIN sessions s ON s.id = sc.session_id
        WHERE s.product_id = ? ORDER BY sc.created_at`
    )
    .all(productId) as CardRow[];
  const cards = cardRows
    .filter((c) => byId.has(c.sessionId))
    .map((c) => ({
      ...c,
      dims: JSON.parse(c.dimensions) as DimensionScore[],
      sess: byId.get(c.sessionId)!,
    }));

  const enrolled = (db.prepare("SELECT COUNT(*) AS n FROM advisors").get() as { n: number }).n;
  const activeAdvisors = new Set(sessions.map((s) => s.advisorId));
  const certifiedAdvisors = new Set(cards.filter((c) => c.certified).map((c) => c.advisorId));
  const overallAvg = avg(cards.map((c) => c.overall));
  const fidelityVals = cards
    .map((c) => c.dims.find((d) => d.dimensionId === "message-fidelity")?.score)
    .filter((s): s is number => typeof s === "number");
  const weekAgo = Date.now() - 7 * 86400e3;
  const sessionsThisWeek = sessions.filter((s) => +new Date(s.startedAt) > weekAgo).length;

  // time-to-competency: first session → first certified scorecard, per advisor
  const ttc: number[] = [];
  for (const advId of certifiedAdvisors) {
    const first = Math.min(
      ...sessions.filter((s) => s.advisorId === advId).map((s) => +new Date(s.startedAt))
    );
    const cert = cards.find((c) => c.advisorId === advId && c.certified);
    if (cert) ttc.push(Math.max(0, (+new Date(cert.createdAt) - first) / 86400e3));
  }
  const certRate = activeAdvisors.size
    ? Math.round((certifiedAdvisors.size / activeAdvisors.size) * 100)
    : 0;

  const kpis: Kpi[] = [
    { k: "Active advisors", v: String(activeAdvisors.size), d: `of ${enrolled} enrolled`, cls: "" },
    { k: "Certification rate", v: `${certRate}%`, d: `${certifiedAdvisors.size} advisors certified`, cls: certRate >= 70 ? "up" : "" },
    { k: "Avg readiness", v: String(overallAvg), d: `${cards.length} scored sessions`, cls: overallAvg >= 75 ? "up" : "" },
    { k: "Message fidelity", v: `${avg(fidelityVals)}%`, d: "approved wording used", cls: "" },
    { k: "Sessions this week", v: String(sessionsThisWeek), d: `${sessions.length} total`, cls: "" },
    { k: "Time-to-competency", v: ttc.length ? `${(ttc.reduce((a, b) => a + b, 0) / ttc.length).toFixed(1)}d` : "—", d: "target ≤ 10 days", cls: "" },
  ];

  // markets
  const marketNames = Array.from(new Set(sessions.map((s) => s.marketName)));
  const markets = marketNames
    .map((m) => {
      const advs = new Set(sessions.filter((s) => s.marketName === m).map((s) => s.advisorId));
      const mCards = cards.filter((c) => c.sess.marketName === m);
      const certd = new Set(mCards.filter((c) => c.certified).map((c) => c.advisorId));
      return {
        m,
        score: avg(mCards.map((c) => c.overall)),
        cert: advs.size ? Math.round((certd.size / advs.size) * 100) : 0,
        adv: advs.size,
      };
    })
    .sort((a, b) => b.score - a.score);

  const dims: Record<string, Array<[string, number]>> = {
    "All markets": dimAverages(cards),
  };
  for (const m of marketNames) {
    dims[m] = dimAverages(cards.filter((c) => c.sess.marketName === m));
  }

  // claim decay from advisor transcripts
  const pack = getLatestPack(productId, "EN");
  let claims: Array<[string, number]> = [];
  if (pack && pack.approvedClaims.length) {
    const turnRows = db
      .prepare(
        `SELECT t.session_id AS sessionId, lower(t.text) AS text
           FROM turns t JOIN sessions s ON s.id = t.session_id
          WHERE s.product_id = ? AND t.speaker = 'advisor'`
      )
      .all(productId) as Array<{ sessionId: string; text: string }>;
    const bySession = new Map<string, string>();
    for (const r of turnRows) {
      bySession.set(r.sessionId, (bySession.get(r.sessionId) ?? "") + " " + r.text);
    }
    const total = Math.max(1, bySession.size);
    claims = pack.approvedClaims
      .map((c): [string, number] => {
        let hit = 0;
        for (const text of bySession.values()) if (text.includes(c.toLowerCase())) hit += 1;
        return [`“${c}”`, Math.round((hit / total) * 100)];
      })
      .sort((a, b) => b[1] - a[1]);
  }

  // 8-week trend of avg readiness
  const trend: number[] = [];
  for (let w = 7; w >= 0; w--) {
    const from = Date.now() - (w + 1) * 7 * 86400e3;
    const to = Date.now() - w * 7 * 86400e3;
    const bucket = cards.filter((c) => {
      const t = +new Date(c.createdAt);
      return t > from && t <= to;
    });
    if (bucket.length) trend.push(avg(bucket.map((c) => c.overall)));
    else if (trend.length) trend.push(trend[trend.length - 1]);
  }
  if (trend.length < 2) trend.unshift(Math.max(0, overallAvg - 5));

  // distributor drill-down
  const distIds = Array.from(new Set(sessions.map((s) => s.distributorId)));
  const dists = distIds
    .map((id) => {
      const ds = sessions.filter((s) => s.distributorId === id);
      const dc = cards.filter((c) => c.sess.distributorId === id);
      const advs = new Set(ds.map((s) => s.advisorId));
      const certd = new Set(dc.filter((c) => c.certified).map((c) => c.advisorId));
      const fid = dc
        .map((c) => c.dims.find((d) => d.dimensionId === "message-fidelity")?.score)
        .filter((s): s is number => typeof s === "number");
      const thisWeek = dc.filter((c) => +new Date(c.createdAt) > weekAgo);
      const prevWeek = dc.filter((c) => {
        const t = +new Date(c.createdAt);
        return t <= weekAgo && t > Date.now() - 14 * 86400e3;
      });
      const trendPts =
        thisWeek.length && prevWeek.length
          ? avg(thisWeek.map((c) => c.overall)) - avg(prevWeek.map((c) => c.overall))
          : 0;
      const s0 = ds[0];
      return [
        s0.distributorName,
        `${s0.marketName} · ${s0.territoryName}`,
        advs.size,
        ds.length,
        avg(dc.map((c) => c.overall)),
        avg(fid),
        advs.size ? Math.round((certd.size / advs.size) * 100) : 0,
        trendPts,
      ] as LaunchSummary["dists"][number];
    })
    .sort((a, b) => b[4] - a[4]);

  // pack-version adoption of certifications (version live at scoring time)
  const packVersions = db
    .prepare(
      `SELECT version, created_at AS createdAt FROM launch_packs
        WHERE product_id = ? AND language = 'EN' ORDER BY version`
    )
    .all(productId) as Array<{ version: number; createdAt: string }>;
  const versionAt = (iso: string): number => {
    let v = packVersions[0]?.version ?? 1;
    for (const p of packVersions) if (p.createdAt <= iso) v = p.version;
    return v;
  };
  const counts = new Map<number, number>();
  for (const c of cards.filter((c) => c.certified)) {
    const v = versionAt(c.createdAt);
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  const currentV = packVersions[packVersions.length - 1]?.version ?? 1;
  const adoption = Array.from(counts.entries())
    .sort((a, b) => a[0] - b[0])
    .slice(-3)
    .map(([v, count]) => ({ label: `v${v}`, count, current: v === currentV }));

  // re-coaching queue: latest card per advisor below 70
  const latestByAdvisor = new Map<string, (typeof cards)[number]>();
  for (const c of cards) latestByAdvisor.set(c.advisorId, c);
  const recoach = Array.from(latestByAdvisor.values())
    .filter((c) => c.overall < 70)
    .sort((a, b) => a.overall - b.overall)
    .slice(0, 6)
    .map((c) => {
      const numeric = c.dims.filter((d) => typeof d.score === "number") as Array<
        DimensionScore & { score: number }
      >;
      const weakest = numeric.sort((a, b) => a.score - b.score)[0];
      const label =
        READINESS_DIMENSIONS.find((d) => d.id === weakest?.dimensionId)?.label ?? "—";
      return [c.sess.advisorName, c.sess.distributorName, label, c.overall] as [
        string, string, string, number,
      ];
    });

  return {
    title: product.name,
    kpis, markets, dims, claims, trend, dists, adoption, recoach,
  };
}

/** Every product that has at least one session, for the launch selector. */
export function listLaunchSummaries(): {
  order: string[];
  launches: Record<string, LaunchSummary>;
} {
  const order: string[] = [];
  const launches: Record<string, LaunchSummary> = {};
  for (const p of listProducts()) {
    const s = buildLaunchSummary(p.id);
    if (s) {
      order.push(p.id);
      launches[p.id] = s;
    }
  }
  return { order, launches };
}
