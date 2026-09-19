const K = require("./dk.js");
const { slide, divider, statement, card, callout, cardRow, rows, bullets, table,
        body, note, gap, fit, mh,
        INK, PANEL, PANEL2, PAPER, LILAC, PEACH, MUTED, DIM, OK, BAD, WARN, RULE,
        SANS, SERIF, MONO, W, H, M, CW } = K;

module.exports = function partB(p, n) {

  /* ── 4 · SOLUTION DETAIL ──────────────────────────────────────── */
  divider(p, ++n, "Section three", "Solution detail",
    "Why this is not a language model with financial content and a digital human.");

  statement(p, ++n,
    "The model supplies language intelligence. AUREN supplies authority.",
    "A frontier model does not know which jurisdiction applies, whether a rule is in force, who approved the content, or whether its assessment rests on sufficient evidence. It will change its answer when the question is rephrased — fatal for an assessment, because the same person asked twice must get the same finding. The model is the replaceable component, deliberately: a moat built on model access is not a moat.");

  {
    const s = slide(p, { n: ++n, kicker: "Where the defensibility actually sits",
      title: "Five layers of intellectual property." });
    rows(s, [
      ["Governed knowledge", "Regulator-approved object schema, eight-state lifecycle, five libraries, a corpus multiple authorities classify the same way."],
      ["Controlled coaching", "Approved interventions bound to specific failure signatures, in a register the person can use, in every deployed language."],
      ["Bounded role-play", "Scenario graphs with approved lines, ladders, ceilings and distress exits — and an engine that refuses anything outside them."],
      ["Evidence-based assessment", "Competency framework, multilingual evidence rules, surface-distance retest, determinations bound to verbatim spans."],
      ["Hyper-realistic delivery", "HoloMe: face, voice, timing, gaze, gesture and expression rendering a governed persona manifest reproducibly."],
    ], { numbered: true, labelW: 3.0, labelSize: 13.5, descSize: 11, rowPad: 0.18, gap: 0.2 });
    body(s, "Two more assets are not layers — they accumulate from operating the five: the behavioural transcript dataset, and longitudinal evidence that rehearsal reduces real-world losses. The second cannot be bought, hired or copied. Only accumulated.",
      { size: 12.5, color: LILAC, w: CW * 0.94 });
    fit(s, "five layers");
  }

  {
    const s = slide(p, { n: ++n, kicker: "Closed generation", titleSize: 25,
      title: "The model may select, sequence, explain and deliver.\nIt may not create authority." });
    body(s, "Every product in this space has that on a slide. The difference between a slide and a system is whether it is checkable at runtime, on the bytes the model returned, before they reach a person.",
      { size: 13, color: LILAC, w: CW * 0.88, gap: 0.22 });
    table(s, [3.1, 4.6, 4.07], [
      ["Mode", "May", "On a violation"],
      ["General education", "select · sequence · paraphrase · explain", "Fall back to approved wording"],
      ["Coaching", "select · sequence · paraphrase · explain", "Fall back to approved wording"],
      [["Assessment", PEACH], ["select · sequence · classify", PEACH], ["Refuse and escalate", PEACH]],
      ["Bounded role-play", "select · sequence · paraphrase · escalate", "Drop the turn, hold the rung"],
      ["Regulatory answer", "select · sequence", "Refuse and escalate"],
      ["High-risk", "select — and refuse", "Refuse and escalate"],
    ], { rowPad: 0.1, gap: 0.2 });
    body(s, "Paraphrase is refused during assessment, and the refusal is the point: the moment an assessor restates what the learner said, the finding binds to the restatement rather than to the person.",
      { size: 12, w: CW * 0.94 });
    fit(s, "closed generation");
  }

  {
    const s = slide(p, { n: ++n, kicker: "The turn contract",
      title: "Validated before a syllable reaches the learner." });

    /* Two columns, each measured, the taller deciding both card heights. */
    const lw = CW * 0.44, rw = CW * 0.52, x2 = M + CW * 0.48, pad = 0.34;
    const left = [
      ["A closed candidate set", "The only objects this turn may draw on."],
      ["A declared mode", "Which fixes the ceiling before the call is made."],
      ["What the learner said, verbatim", "Never edited before it is scored."],
    ];
    const foot = "No corpus. No retrieved chunks. No instruction to be helpful with some documents.";
    const checks = [
      ["Closed set", "It cited an object it was not given."],
      ["Span fidelity", "A finding bound to a paraphrase, not the transcript."],
      ["Classify", "A determination returned from a coaching turn."],
      ["Ladder step", "A jumped rung — a rehearsal that skips the middle is an ambush."],
      ["Ceiling", "Pressure above what was approved for this cohort."],
      ["Refusal", "A high-risk turn that answered instead of refusing."],
    ];

    const lH = left.reduce((a, [t, d]) =>
      a + mh(t, lw - pad * 2, { size: 12.5, bold: true })
        + mh(d, lw - pad * 2, { size: 10.5, lineSpacing: 15 }) + 0.1, 0)
      + mh(foot, lw - pad * 2, { size: 11.5, lineSpacing: 16 }) + 0.2;
    const checkW = rw - pad * 2 - 1.65;
    const rH = checks.reduce((a, [, d]) =>
      a + Math.max(0.28, mh(d, checkW, { size: 10.5, lineSpacing: 14.5 })) + 0.08, 0);
    const h = Math.max(lH, rH) + 0.78;   // header band + padding
    const top = s.cy;

    card(s, M, top, lw, h, { accent: LILAC });
    s.addText("HANDED TO THE MODEL", {
      x: M + pad, y: top + 0.2, w: lw - pad * 2, h: 0.28, fontSize: 10, bold: true,
      color: LILAC, fontFace: SANS, charSpacing: 2,
    });
    let ly = top + 0.6;
    left.forEach(([t, d]) => {
      const th = mh(t, lw - pad * 2, { size: 12.5, bold: true });
      const dh = mh(d, lw - pad * 2, { size: 10.5, lineSpacing: 15 });
      s.addText("—", { x: M + pad, y: ly, w: 0.26, h: 0.26, fontSize: 12.5, color: PEACH, fontFace: SANS });
      s.addText(t, { x: M + pad + 0.3, y: ly, w: lw - pad * 2 - 0.3, h: th,
        fontSize: 12.5, color: PAPER, fontFace: SANS, valign: "top" });
      s.addText(d, { x: M + pad + 0.3, y: ly + th, w: lw - pad * 2 - 0.3, h: dh,
        fontSize: 10.5, color: MUTED, fontFace: SANS, lineSpacing: 15, valign: "top" });
      ly += th + dh + 0.1;
    });
    s.addText(foot, {
      x: M + pad, y: top + h - 0.2 - mh(foot, lw - pad * 2, { size: 11.5, lineSpacing: 16 }),
      w: lw - pad * 2, h: mh(foot, lw - pad * 2, { size: 11.5, lineSpacing: 16 }),
      fontSize: 11.5, color: PEACH, fontFace: SANS, italic: true, lineSpacing: 16, valign: "top",
    });

    card(s, x2, top, rw, h, { accent: PEACH });
    s.addText("REFUSED IF…", {
      x: x2 + pad, y: top + 0.2, w: rw - pad * 2, h: 0.28, fontSize: 10, bold: true,
      color: PEACH, fontFace: SANS, charSpacing: 2,
    });
    let cy = top + 0.6;
    checks.forEach(([t, d]) => {
      const dh = Math.max(0.28, mh(d, checkW, { size: 10.5, lineSpacing: 14.5 }));
      s.addText("✕", { x: x2 + pad, y: cy, w: 0.3, h: 0.26, fontSize: 11, color: BAD, fontFace: SANS });
      s.addText(t, { x: x2 + pad + 0.3, y: cy, w: 1.4, h: 0.28, fontSize: 11.5, bold: true, color: PAPER, fontFace: SANS });
      s.addText(d, { x: x2 + pad + 1.65, y: cy, w: checkW, h: dh,
        fontSize: 10.5, color: MUTED, fontFace: SANS, lineSpacing: 14.5, valign: "top" });
      cy += dh + 0.08;
    });

    s.cy = top + h + 0.24;
    note(s, "In a retrieval architecture the first of these is invisible, because everything in the index is fair game.",
      { color: LILAC, face: SANS, size: 12 });
    fit(s, "turn contract");
  }

  {
    const s = slide(p, { n: ++n, kicker: "Bounded role-play", titleSize: 26,
      title: "The persona may choose among approved branches.\nIt may not leave the graph." });
    table(s, [4.4, 7.37], [
      ["The persona asks to…", "The engine…"],
      ["take an approved transition", ["allows it, and speaks the authored line at that node", OK]],
      ["take a branch not in the graph", ["refuses — the rung holds", BAD]],
      ["speak a line it composed itself", ["refuses — it chooses among authored strings, it does not write the adversary's words", BAD]],
      ["climb above the manifest's ceiling", ["refuses — the effective ceiling is the lower of scenario and manifest", BAD]],
      ["continue after distress is detected", ["exits to safety, regardless of rung or learning objective", WARN]],
      ["escalate after the learner held", ["exits to safety — escalating past a successful resistance teaches that resisting does not work", WARN]],
    ], { rowPad: 0.2, gap: 0.24 });
    body(s, "That last row is a design decision rather than a safety minimum, and it is the one worth arguing about: it costs a harder test in exchange for not teaching the opposite of the learning objective.",
      { size: 12, w: CW * 0.94 });
    fit(s, "bounded role-play");
  }

  {
    const s = slide(p, { n: ++n, kicker: "Governed knowledge",
      title: "Two intakes. Neither one alone produces a rehearsal." });
    cardRow(s, [
      ["THREAT SIGNAL", [["An emerging tactic lodged by an authority", DIM, 11],
                         ["Produces challenges and failure signatures", PAPER, 13],
                         ["It describes an adversary", MUTED, 11.5]], BAD],
      ["TRAINING MODULE", [["The authority's existing curriculum", DIM, 11],
                           ["Produces competency elements and diagnostic questions", PAPER, 13],
                           ["It describes a competence", MUTED, 11.5]], OK],
    ], { titleSize: 14, titleSpacing: 2, titleColor: "accent", gap: 0.22 });
    body(s, "A challenge with no element to score against is theatre. An element with no challenge to pressure it is a quiz.",
      { size: 14.5, color: LILAC, face: SERIF, italic: true, w: CW, gap: 0.2 });
    callout(s, "What a curriculum can do that a threat report cannot: anchor an element. Every competency element must cite the published principle it derives from, and the gate blocks release without one. A module IS the authority's published guidance, so the clause arrives as the citation — the reviewer confirms it rather than sourcing it.",
      { size: 12.5, fill: PANEL2, accent: LILAC });
    fit(s, "two intakes");
  }

  return n;
};
