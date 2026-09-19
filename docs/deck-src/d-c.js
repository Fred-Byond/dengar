const K = require("./dk.js");
const { slide, divider, statement, card, callout, cardRow, rows, bullets, table,
        barRow, body, note, gap, fit, mh,
        INK, PANEL, PANEL2, PAPER, LILAC, PEACH, MUTED, DIM, OK, BAD, WARN, RULE,
        SANS, SERIF, MONO, W, H, M, CW } = K;

module.exports = function partC(p, n) {

  /* ── 5 · DEMONSTRATION ────────────────────────────────────────── */
  divider(p, ++n, "Section four", "Demonstration",
    "Four minutes, live. Everything shown is the running system, not a specification.");

  {
    const s = slide(p, { n: ++n, kicker: "Run sheet", title: "What you will see." });
    table(s, [0.95, 6.65, 4.17], [
      ["", "On screen", "The point"],
      [["0:00", PEACH, "mono"], "A learner speaks. The coach listens, diagnoses, then becomes a broker with a deadline.", "The pressure is real and the ladder is approved."],
      [["1:30", PEACH, "mono"], "The coach names the failure using the learner's own sentence, then a different scam asks the same question.", "Transfer, not recall."],
      [["2:30", PEACH, "mono"], "Switch to 日本語 mid-session. The loop continues.", "205 governed strings per language — including the cues that decide a pass."],
      [["3:00", PEACH, "mono"], "Nexus: a CNMV training module uploaded, mapped, and put through the publish gate.", "The gate refuses. Nothing reaches a learner."],
      [["3:45", PEACH, "mono"], "The turn contract: eight model returns, six refused, each naming the rule.", "What happens when the model does something it should not."],
      [["4:20", PEACH, "mono"], "The console: a named participant opened to the sentence their score rests on.", "Evidence, not a rating."],
    ], { size: 10.5, rowPad: 0.12, gap: 0.2 });
    note(s, "If the room has time for one thing only, it is the fourth row. Everything else is a good demo; that one is the thing a competitor cannot show.",
      { color: LILAC, face: SANS, size: 12 });
    fit(s, "run sheet");
  }

  {
    const s = slide(p, { n: ++n, kicker: "Reach", title: "Five languages. Not a translated interface." });
    const langs = ["English", "Español", "中文", "العربية", "日本語"];
    langs.forEach((l, i) => {
      const x = M + i * (CW / 5);
      card(s, x, s.cy, CW / 5 - 0.24, 0.8, { fill: i === 0 ? PANEL2 : PANEL });
      s.addText(l, {
        x: x + 0.2, y: s.cy, w: CW / 5 - 0.6, h: 0.8, fontSize: 19,
        color: i === 0 ? PAPER : LILAC, fontFace: SANS, valign: "middle",
      });
    });
    s.cy += 0.8 + 0.26;
    body(s, "205 governed strings each: every diagnostic question, every escalation ladder, every coaching line, the resistance patterns the retest reads — and the satisfaction cues that decide whether a competency element passed.",
      { size: 13.5, color: PAPER, w: CW * 0.92, gap: 0.24 });
    callout(s, "Ship English cues only and every element silently fails for every non-English learner, while the screen looks perfectly translated.",
      { size: 14.5, face: SERIF, italic: true, accent: BAD, gap: 0.24 });
    body(s, "Fidelity is stated, not assumed. Only English has passed native review; the other four ship at review-pending, the publish gate reports every pending variant, and the learner-facing screen says so. Adding Japanese broke the gate — the boundary refusal had been proven in four languages, and a boundary not proven in a language it will be spoken in is not a boundary.",
      { size: 12.5, w: CW * 0.94 });
    fit(s, "five languages");
  }

  {
    const s = slide(p, { n: ++n, kicker: "Deployment", title: "One engine. Many operators. One scope rule." });
    body(s, "A securities commission, a bank and a ministry are the same software and three different accountabilities.",
      { size: 13.5, color: LILAC, w: CW * 0.9, gap: 0.2 });
    table(s, [3.5, 4.2, 4.07], [
      ["Viewer", "Subject", "What they see"],
      ["Any tenant", "Itself", ["Individuals by name", OK]],
      ["Network body — IOSCO, ESMA", "A tenant in its jurisdictions", ["Aggregate only", WARN]],
      [["Regulator", PEACH], ["A bank that reports to it", PEACH], ["Aggregate only", WARN]],
      ["Anyone", "Anyone else", ["Nothing", BAD]],
    ], { rowPad: 0.14, gap: 0.24 });
    callout(s, "The third row decides deployments. A bank will not put its customers into a platform where its supervisor can read the list — and filtering it in the interface is not an answer, it is the same query with a cosmetic layer over it. The scope decision is made once, in one function, and every read passes through it.",
      { size: 12.5 });
    fit(s, "scope rule");
  }

  /* ── 6 · EVALUATION ───────────────────────────────────────────── */
  divider(p, ++n, "Section five", "Evaluation",
    "Whether it works — and what we are allowed to claim on the evidence we actually have.");

  {
    const s = slide(p, { n: ++n, kicker: "The value chain", titleSize: 26,
      title: "Most programmes measure level one and report it\nin the language of level seven." });
    const levels = [
      ["Reach", "Counts exposure. The weakest number available.", true],
      ["Knowledge", "Everyone knows the rules. Uncorrelated with behaviour under pressure.", true],
      ["Demonstrated behaviour", "What they did in a pressure simulation, bound to their words.", true],
      ["Transfer", "The same behaviour in a scenario sharing nothing with the first.", true],
      ["Persistence", "Whether it survives at 30, 60 and 90 days.", false],
      ["Real-world action", "Checks run, transfers abandoned. Needs institutional telemetry.", false],
      ["Financial outcome", "Losses avoided against a control cohort. Closes the business case.", false],
    ];
    const descW = CW - 0.45 - 3.0 - 1.6 - 0.2;
    levels.forEach(([t, d, reached], i) => {
      const h = Math.max(0.32, mh(d, descW, { size: 11.5, lineSpacing: 16 }));
      s.addShape("ellipse", { x: M, y: s.cy + 0.02, w: 0.28, h: 0.28, fill: { color: reached ? OK : "2A2059" } });
      s.addText(String(i + 1), {
        x: M, y: s.cy + 0.02, w: 0.28, h: 0.28, fontSize: 9, bold: true,
        color: reached ? INK : DIM, fontFace: MONO, align: "center", valign: "middle",
      });
      s.addText(t, { x: M + 0.45, y: s.cy, w: 3.0, h: 0.32, fontSize: 13, bold: true,
        color: reached ? PAPER : DIM, fontFace: SANS, valign: "top" });
      s.addText(d, { x: M + 3.5, y: s.cy, w: descW, h, fontSize: 11.5, color: MUTED,
        fontFace: SANS, lineSpacing: 16, valign: "top" });
      s.addText(reached ? "measured" : "not yet", {
        x: W - M - 1.6, y: s.cy, w: 1.6, h: 0.32, fontSize: 10,
        color: reached ? OK : DIM, fontFace: MONO, align: "right", valign: "top",
      });
      s.cy += h + 0.16;
    });
    gap(s, 0.14);
    body(s, "We are at four. We say four.", { size: 16, color: PEACH, face: SERIF, italic: true, w: CW });
    fit(s, "value chain");
  }

  statement(p, ++n,
    "A failure rate moving 20% → 19% is one percentage point and a five percent relative fall. 20% → 19.8% is 0.2 points and one percent.",
    "They differ by a factor of five, they are written identically, and the ambiguity always resolves in the vendor's favour — which is exactly why a procurement officer who has been burned once discounts both readings. In this system an improvement is a type. The only renderer states both, plus the count per ten thousand and the sample size. Nothing here can emit “a five percent improvement” without saying of what.",
    { size: 26, y: 1.75 });

  {
    const s = slide(p, { n: ++n, kicker: "Trial design", title: "The trial has to be far larger than it looks." });
    body(s, "Participants per arm, at 80% power. Run a pilot against a one-point hypothesis and it returns “no significant difference” whatever happens — which reads as a failed product and is a failed design.",
      { size: 13.5, color: LILAC, w: CW * 0.9, gap: 0.3 });
    [
      ["1 point   (5% relative)", 1.0, "≈ 24,600 per arm"],
      ["3 points  (15% relative)", 0.106, "≈ 2,600 per arm"],
      ["5 points  (25% relative)", 0.037, "≈ 900 per arm"],
      ["10 points (50% relative)", 0.008, "≈ 200 per arm"],
    ].forEach(([t, frac, v]) => barRow(s, t, frac, v, { labelW: 3.4, valueW: 2.2 }));
    gap(s, 0.2);
    body(s, "Read the other way: a 400-per-arm pilot detects about seven percentage points. AUREN's premise is behaviour change under pressure, not a nudge — so it should be tested against a hypothesis worth detecting.",
      { size: 12.5, w: CW * 0.92, gap: 0.14 });
    body(s, "Three arms: control, conventional education, AUREN. The second is the one people drop, and it is the one that matters — without it, any effect is arguably just the hour spent thinking about scams.",
      { size: 12.5, color: LILAC, w: CW * 0.92 });
    fit(s, "trial design");
  }

  {
    const s = slide(p, { n: ++n, kicker: "The claim ladder", title: "What we may say, on what we have." });
    const rungs = [
      ["N people completed a governed rehearsal with an evidence-bound record", true],
      ["Reduced unsafe decisions in unfamiliar simulated scams by X% against conventional education", true],
      ["The reduction was sustained at 90 days", false],
      ["Rehearsed customers performed more protective actions in real conditions", false],
      ["Reduced actual scam-loss events by X% and avoided Y in losses", false],
    ];
    const tw = CW - 0.85 - 2.0;
    rungs.forEach(([t, have], i) => {
      const th = mh(t, tw, { size: 13 });
      const h = Math.max(0.56, th + 0.26);
      card(s, M, s.cy, CW, h, { fill: have ? PANEL2 : PANEL, accent: have ? OK : "2A2059" });
      s.addText(String(i + 1), {
        x: M + 0.35, y: s.cy, w: 0.4, h, fontSize: 14, bold: true,
        color: have ? OK : DIM, fontFace: MONO, valign: "middle",
      });
      s.addText(t, {
        x: M + 0.85, y: s.cy, w: tw, h, fontSize: 13,
        color: have ? PAPER : DIM, fontFace: SANS, valign: "middle",
      });
      s.addText(have ? "supported" : "not yet", {
        x: W - M - 1.8, y: s.cy, w: 1.5, h, fontSize: 10.5,
        color: have ? OK : DIM, fontFace: MONO, align: "right", valign: "middle",
      });
      s.cy += h + 0.1;
    });
    gap(s, 0.16);
    body(s, "Saying rung five while holding rung two evidence is the most common overstatement in this sector, and it is the one a regulator's economist finds. The system refuses a claim above its evidence and names the missing requirement — because “we need more data” gets waved through and “you do not have linked transaction outcomes” does not.",
      { size: 12.5, w: CW * 0.94 });
    fit(s, "claim ladder");
  }

  return n;
};
