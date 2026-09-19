const K = require("./dk.js");
const { slide, divider, statement, card, callout, cardRow, rows, body, note, table,
        gap, fit, mh,
        INK, PANEL, PANEL2, PAPER, LILAC, PEACH, MUTED, DIM, OK, BAD, RULE,
        SANS, SERIF, MONO, W, H, M, CW } = K;

module.exports = function partA(p) {
  let n = 0;

  /* ── 1 · TITLE ────────────────────────────────────────────────── */
  {
    const s = slide(p, { bare: true });
    s.addShape("rect", { x: 0, y: 0, w: W, h: H, fill: { color: INK } });
    s.addShape("rect", { x: M, y: 2.26, w: 2.0, h: 0.04, fill: { color: PEACH } });
    s.addText("AUREN", {
      x: M, y: 2.5, w: 9, h: 1.5, fontSize: 88, bold: true, color: PAPER,
      fontFace: SANS, charSpacing: 8,
    });
    s.addText("A HOLOME SOLUTION", {
      x: M, y: 4.02, w: 9, h: 0.4, fontSize: 14, bold: true, color: PEACH,
      fontFace: SANS, charSpacing: 6,
    });
    s.addText("Investor readiness, proven under pressure.", {
      x: M, y: 4.62, w: 9.6, h: 0.5, fontSize: 19, color: LILAC, fontFace: SERIF, italic: true,
    });
    s.addText("Presented by BYOND Asia   ·   IOSCO TechSprint 2026   ·   Madrid", {
      x: M, y: H - 1.15, w: 10, h: 0.35, fontSize: 12, color: MUTED, fontFace: SANS,
    });
  }

  /* ── 2 · INTRODUCTION ─────────────────────────────────────────── */
  divider(p, ++n, "Section one", "Introduction",
    "Who is building this, and why the architecture already existed before the problem was picked.");

  {
    const s = slide(p, { n: ++n, kicker: "Who we are",
      title: "An intelligence platform for physical and digital spaces." });
    cardRow(s, [
      ["BYOND Asia", "Builds intelligence for physical spaces. Government, transport, retail and healthcare deployments across Malaysia and the GCC.", PEACH],
      ["HoloMe", "The digital human interface layer — face, voice, timing, gaze and expression. Avatar realism with Klleon, our strategic partner in Korea.", LILAC],
      ["HoloMe Nexus", "The orchestration and intelligence layer. Governed knowledge in, controlled conversation out, evidence recorded.", OK],
    ], { titleSize: 17, bodySize: 12, gap: 0.34 });
    body(s, "AUREN is HoloMe Nexus configured for one vertical: investor protection. The platform is not new. What is new is the first vertical where the outcome can be proved rather than asserted.",
      { size: 14, color: LILAC, w: CW * 0.92 });
    fit(s, "who we are");
  }

  /* ── 3 · SOLUTION SUMMARY ─────────────────────────────────────── */
  divider(p, ++n, "Section two", "Solution summary",
    "The problem is not that people do not know. It is that knowing does not survive contact with pressure.");

  statement(p, ++n,
    "Everyone knows the rules. Almost nobody follows them when someone is pushing.",
    "Thirty years of investor education has been delivered as information. Information was never the binding constraint — people who can recite every warning sign still transfer the money, because the warning signs were learned in a quiet room and the transfer happens on a deadline, from somebody plausible.");

  {
    const s = slide(p, { n: ++n, kicker: "What AUREN is", titleSize: 30,
      title: "A governed behavioural intelligence platform, delivered through a hyper-realistic digital human." });
    body(s, "It does not tell investors what is safe. It places them under controlled pressure, measures what they actually do, coaches the failure, and retests until the protective behaviour is demonstrated.",
      { size: 15, color: LILAC, w: CW * 0.9, gap: 0.3 });

    const steps = [
      ["Understand", "They talk. Nothing analytical shows."],
      ["Diagnose", "Four governed questions, four elements."],
      ["Stress", "The coach leaves. An approved adversary arrives."],
      ["Coach", "Their own sentence, then the failure named."],
      ["Retest", "A different scam, the same question."],
      ["Evidence", "A record where every line cites what they said."],
    ];
    /* Six narrow cards: measured like any other row, with the stressed one tinted. */
    const gut = 0.14, cw = (CW - gut * 5) / 6, pad = 0.2;
    let ch = 0;
    steps.forEach(([t, d]) => {
      ch = Math.max(ch, 0.3 + mh(t, cw - pad * 2, { size: 13, bold: true })
                          + mh(d, cw - pad * 2, { size: 10, lineSpacing: 14 }) + pad * 2);
    });
    steps.forEach(([t, d], i) => {
      const x = M + i * (cw + gut);
      card(s, x, s.cy, cw, ch, { fill: i === 2 ? "2E1A2B" : PANEL, line: i === 2 ? "6B4552" : RULE });
      s.addText(String(i + 1), {
        x: x + pad, y: s.cy + 0.14, w: 0.4, h: 0.24, fontSize: 10,
        color: i === 2 ? BAD : PEACH, fontFace: MONO,
      });
      const th = mh(t, cw - pad * 2, { size: 13, bold: true });
      s.addText(t, {
        x: x + pad, y: s.cy + 0.42, w: cw - pad * 2, h: th, fontSize: 13, bold: true,
        color: PAPER, fontFace: SANS, valign: "top",
      });
      s.addText(d, {
        x: x + pad, y: s.cy + 0.42 + th, w: cw - pad * 2,
        h: mh(d, cw - pad * 2, { size: 10, lineSpacing: 14 }),
        fontSize: 10, color: MUTED, fontFace: SANS, lineSpacing: 14, valign: "top",
      });
    });
    s.cy += ch + 0.24;
    body(s, "Five minutes.  Spoken.  No account, nothing to type.", { size: 12, color: DIM });
    fit(s, "what AUREN is");
  }

  {
    const s = slide(p, { n: ++n, kicker: "Three solutions, one engine", title: "The loop is the asset." });
    cardRow(s, [
      ["REHEARSE", [["A retail investor, from a link", DIM, 10.5],
                    ["The five-minute voice loop.", MUTED, 12]], PEACH],
      ["NEXUS", [["An authority's analyst or reviewer", DIM, 10.5],
                 ["Where governed knowledge comes from. Two intakes, one publish gate.", MUTED, 12]], LILAC],
      ["SUPERVISION", [["A regulator, a bank, a ministry", DIM, 10.5],
                       ["Who is ready, who is not, and whether the programme works.", MUTED, 12]], OK],
    ], { titleSize: 15, titleSpacing: 2, titleColor: "accent", gap: 0.3 });

    callout(s, "Supervision tells the network which tactics are beating people, and which of those cannot yet be rehearsed against. That gap list is the instruction to the intelligence layer. Nexus turns the answer into approved objects. Rehearse puts people through them — which produces the next gap list.",
      { size: 13.5, gap: 0.16 });
    note(s, "A coach with no intelligence feed teaches last year's scam. A console over a corpus nobody refreshes measures a fixed exam. No competitor assembles that loop by licensing a model, because none of its three parts is a model.",
      { color: LILAC, face: SANS, size: 12 });
    fit(s, "the loop");
  }

  return n;
};
