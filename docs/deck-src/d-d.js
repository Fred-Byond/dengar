const K = require("./dk.js");
const { slide, divider, statement, card, callout, cardRow, rows, bullets, table,
        body, note, gap, fit, mh,
        INK, PANEL, PANEL2, PAPER, LILAC, PEACH, MUTED, DIM, OK, BAD, WARN, RULE,
        SANS, SERIF, MONO, W, H, M, CW } = K;

module.exports = function partD(p, n) {

  /* ── 7 · DEEP DIVE ────────────────────────────────────────────── */
  divider(p, ++n, "Section six", "Deep dive",
    "One thing, in detail: what happens when the model does something it should not.");

  {
    const s = slide(p, { n: ++n, kicker: "Eight model returns, run live", title: "Two admitted. Six refused." });
    table(s, [1.5, 7.6, 2.67], [
      ["Mode", "What the model did", "Verdict"],
      ["assess", "Classified against an approved rubric, bound to a substring of what the learner said", ["ADMITTED", OK]],
      ["coach", "Cited an object outside the candidate set", ["closed_set", BAD]],
      ["assess", "Bound the finding to a paraphrase — a fair summary, not in the transcript", ["span_fidelity", BAD]],
      ["coach", "Returned a determination from a coaching turn", ["classify", BAD]],
      ["roleplay", "Jumped from rung 1 to rung 3", ["ladder_step", BAD]],
      ["roleplay", "Requested rung 4 on a scenario with a ceiling of 3", ["ceiling", BAD]],
      ["high-risk", "Answered “is this firm a scam?” instead of refusing", ["refusal", BAD]],
      ["high-risk", "Refused, said what it could not determine, routed to a human", ["ADMITTED", OK]],
    ], { size: 11, rowPad: 0.09, gap: 0.22 });
    note(s, "Anyone can demonstrate a system working. What a regulator asks is what happens when it does not — and that question has to be answerable by watching rather than by assurance.",
      { color: LILAC, face: SANS, size: 13 });
    fit(s, "eight returns");
  }

  {
    const s = slide(p, { n: ++n, kicker: "The one that matters most", title: "A fair summary is still fatal." });

    const said = "“Their website says they're regulated, and it looks professional, so I assumed that was fine.”";
    const sh = mh(said, CW - 0.7, { size: 16, face: SERIF, lineSpacing: 23 });
    card(s, M, s.cy, CW, sh + 0.78, { accent: LILAC });
    s.addText("THE LEARNER SAID", {
      x: M + 0.35, y: s.cy + 0.18, w: 4, h: 0.28, fontSize: 9.5, bold: true,
      color: LILAC, fontFace: SANS, charSpacing: 2,
    });
    s.addText(said, {
      x: M + 0.35, y: s.cy + 0.52, w: CW - 0.7, h: sh, fontSize: 16,
      color: PAPER, fontFace: SERIF, italic: true, lineSpacing: 23, valign: "top",
    });
    s.cy += sh + 0.78 + 0.24;

    /* Two columns of equal, measured height. */
    const cw2 = CW * 0.485, x2 = M + CW * 0.515, pad = 0.35;
    const leftBits = [
      ["span: “the learner relied on the promoter's own website”", MONO, 12.5, PAPER, false],
      ["Accurate. Well written. Not in the transcript.", SANS, 12, MUTED, true],
    ];
    const rightBits = [
      ["span_fidelity · blocking", MONO, 12.5, PAPER, false],
      ["Either it was paraphrased — which assessment refuses — or it was invented. Both end the finding.", SANS, 12, MUTED, false],
    ];
    const bitsH = (bits) => bits.reduce((a, [t, f, sz]) =>
      a + mh(t, cw2 - pad * 2, { size: sz, face: f, lineSpacing: sz * 1.42 }) + 0.1, 0);
    const h2 = Math.max(bitsH(leftBits), bitsH(rightBits)) + 0.72;
    const top = s.cy;

    const column = (x, label, colour, bits) => {
      card(s, x, top, cw2, h2, { accent: colour });
      s.addText(label, {
        x: x + pad, y: top + 0.18, w: 4, h: 0.28, fontSize: 9.5, bold: true,
        color: colour, fontFace: SANS, charSpacing: 2,
      });
      let by = top + 0.54;
      bits.forEach(([t, f, sz, col, ital]) => {
        const bh = mh(t, cw2 - pad * 2, { size: sz, face: f, lineSpacing: sz * 1.42 });
        s.addText(t, {
          x: x + pad, y: by, w: cw2 - pad * 2, h: bh, fontSize: sz, color: col,
          fontFace: f, italic: !!ital, lineSpacing: sz * 1.42, valign: "top",
        });
        by += bh + 0.1;
      });
    };
    column(M, "THE MODEL RETURNED", BAD, leftBits);
    column(x2, "THE CONTRACT SAID", OK, rightBits);
    s.cy = top + h2 + 0.3;

    body(s, "The determination would have been correct. It would also have been bound to the model's restatement rather than to the person — and a year later, in front of an ombudsman, that is the difference between evidence and an opinion with an object identifier attached.",
      { size: 14, color: PAPER, w: CW * 0.94 });
    fit(s, "fair summary");
  }

  /* ── 8 · FUTURE ───────────────────────────────────────────────── */
  divider(p, ++n, "Section seven", "Looking to the future",
    "What it is worth, what compounds, and what we need from the room.");

  {
    const s = slide(p, { n: ++n, kicker: "The economics", titleSize: 30, title: "We model the addressable pool, not the headline." });
    body(s, "Malaysia is the proof market: the only one in our set with a published loss aggregate, PDRM typologies, SC content validation and banks able to supply payment data. A proof needs a denominator.",
      { size: 12.5, color: LILAC, w: CW * 0.9, gap: 0.2 });
    table(s, [4.6, 3.4, 3.77], [
      ["Scenario", "Modelled", "Range"],
      ["Conservative pilot", ["RM840k", PAPER, "mono"], ["RM202k – RM2.4m", MUTED, "mono"]],
      ["National institutional rollout", ["RM11.2m", PAPER, "mono"], ["RM2.7m – RM32.0m", MUTED, "mono"]],
      ["Scaled national programme", ["RM94.5m", PAPER, "mono"], ["RM22.7m – RM269.9m", MUTED, "mono"]],
      [["The headline we are not using", DIM], ["RM28.0m", DIM, "mono"], ["1% of the national total", DIM]],
    ], { rowPad: 0.08, gap: 0.18 });
    callout(s, "The ranges are the honest width. Four shares multiplied compound their uncertainty — a single figure is false precision, and it is the first number a sceptical finance director attacks. Attribution rises with the evidence: 50% without a control arm, 90% with one, because a control arm already removes the counterfactual and discounting it twice argues the next renewal against half the real number.",
      { size: 12 });
    fit(s, "economics");
  }

  {
    const s = slide(p, { n: ++n, kicker: "What compounds",
      titleSize: 30, title: "The moat is not the model. It is what the model leaves behind." });
    const assets = [
      ["The corpus", "Multiple authorities classifying the same typologies the same way, with anchored clauses and a publish gate behind them. Buildable in a year by nobody working alone."],
      ["The evidence chain", "Every determination bound to a verbatim span, an object version and a signed bundle. This is the export a regulator's own system can read."],
      ["The behavioural dataset", "What people actually say under pressure, in five languages, by cohort and tactic. It has no public equivalent."],
      ["Longitudinal outcome evidence", "That rehearsal reduces real-world losses. It cannot be bought, hired or copied — only accumulated. Every month of unmeasured operation is a month it does not accrue."],
    ];
    const labW = 3.4, descW = CW - labW - 0.85;
    assets.forEach(([t, d], i) => {
      const dh = mh(d, descW, { size: 12, lineSpacing: 17 });
      const h = Math.max(0.68, dh + 0.22);
      card(s, M, s.cy, CW, h, { accent: i === 3 ? PEACH : LILAC, fill: i === 3 ? PANEL2 : PANEL });
      s.addText(t, {
        x: M + 0.35, y: s.cy + 0.14, w: labW - 0.2, h: h - 0.28, fontSize: 14, bold: true,
        color: i === 3 ? PEACH : PAPER, fontFace: SANS, valign: "top",
      });
      s.addText(d, {
        x: M + 0.35 + labW, y: s.cy + 0.14, w: descW, h: dh, fontSize: 12,
        color: MUTED, fontFace: SANS, lineSpacing: 17, valign: "top",
      });
      s.cy += h + 0.08;
    });
    gap(s, 0.1);
    note(s, "Which has a sequencing consequence: outcome follow-up has to be instrumented from the first pilot, because the most valuable asset only starts accruing on the day measurement starts.",
      { color: LILAC, face: SANS, size: 12.5 });
    fit(s, "the moat");
  }

  {
    const s = slide(p, { n: ++n, kicker: "What we need", title: "Four things, in the order they unblock the others." });
    rows(s, [
      ["An authority to anchor the corpus", "A commission that contributes its existing investor-education curriculum closes the most expensive gap in the system on day one — its clauses arrive as anchors rather than having to be sourced."],
      ["An institution with a loss book", "The economic case is computed from a real denominator or it is not computed. One bank converts every figure in this deck from a scenario into a measurement."],
      ["A cohort worth measuring", "900 per arm detects a five-point effect. 200 per arm detects ten. Below that the trial cannot answer the question, whatever the product does."],
      ["Permission to follow the outcome", "Transaction outcomes linked to cohort membership, with consent captured at enrolment. It has to be designed into the first enrolment — it cannot be retrofitted to people who already finished."],
    ], { numbered: true, labelW: 4.0, labelSize: 13.5, descSize: 11, rowPad: 0.18, gap: 0.16 });
    body(s, "We are not asking the room to believe the outcome claim. We are asking for the conditions under which it becomes testable.",
      { size: 13.5, color: LILAC, face: SERIF, italic: true, w: CW * 0.94 });
    fit(s, "what we need");
  }

  {
    const s = slide(p, { n: ++n, kicker: "Honesty as a design property", title: "What we will not claim." });
    bullets(s, [
      "That AUREN saves one percent of global scam losses. We model the addressable pool, the population reached and a conservative attribution, and we publish the range.",
      "That transfer within one session is durable behaviour change. The record says within-session on the face of it, and so does the certificate.",
      "That four of our five languages are deployment-ready. Only English has passed native review. The gate reports every pending variant and the learner-facing screen says so.",
      "That a loss figure exists where it does not. Spain and the UAE have no defensible national aggregate — the system returns a refusal naming what a real baseline would need, rather than a number.",
      "That the trial is done. It is designed, powered and unrun.",
    ], { mark: "✕", markColor: BAD, size: 13, gap: 0.2 });
    gap(s, 0.14);
    note(s, "Each of these costs us a stronger-sounding slide. They are the reason the rest of the deck is believable — and the reason a regulator can put their name next to it.",
      { color: PEACH, face: SANS, size: 13 });
    fit(s, "will not claim");
  }

  /* ── 9 · CLOSE ────────────────────────────────────────────────── */
  {
    const s = slide(p, { n: ++n, bare: true });
    s.background = { color: PANEL };
    s.addShape("rect", { x: 0, y: 0, w: 0.09, h: H, fill: { color: PEACH } });
    const close = "AUREN is not an AI that can produce an answer.\nIt is a regulated system that can prove why it produced that answer — and then show that the person it was produced about behaved differently under pressure.";
    const ch = mh(close, 10.8, { size: 25, face: SERIF, lineSpacing: 38 });
    s.addText(close, {
      x: 1.1, y: 2.2, w: 10.8, h: ch, fontSize: 25, color: PAPER, fontFace: SERIF,
      italic: true, lineSpacing: 38, valign: "top",
    });
    s.addText("Thank you.  Questions welcome.", {
      x: 1.1, y: 2.2 + ch + 0.35, w: 8, h: 0.5, fontSize: 17, color: PEACH, fontFace: SANS,
    });
    s.addText("AUREN  ·  a HoloMe solution  ·  presented by BYOND Asia  ·  IOSCO TechSprint 2026", {
      x: 1.1, y: H - 1.0, w: 10.5, h: 0.35, fontSize: 11, color: MUTED, fontFace: SANS,
    });
  }

  /* ── BACKUP ───────────────────────────────────────────────────── */
  divider(p, ++n, "Backup", "Questions we expect",
    "Held in reserve. Not part of the seven minutes.");

  {
    const s = slide(p, { n: ++n, kicker: "Anticipated", title: "The five hard ones." });
    rows(s, [
      ["“Why can't a competitor build this in six months?”", "They can build the loop. They cannot build the corpus — that needs multiple authorities classifying the same typologies the same way, with anchored clauses and reviewers who signed them. Nor the longitudinal evidence, which only accrues with time."],
      ["“What if your model hallucinates?”", "It is architecturally prevented from mattering. The model receives a closed candidate set and returns a structured object; a return citing anything outside that set is refused before it is read. We show six refusals live."],
      ["“Is this not just gamified training?”", "Gamified training measures completion. We measure whether a specific protective action was performed, unprompted, in a scenario sharing nothing with the one the person was coached on — and we bind the finding to their own sentence."],
      ["“Where is the evidence it reduces losses?”", "We do not have it and we say so. We are at rung two of a five-rung claim ladder. Rung five needs linked transaction outcomes over four quarters with a matched control — which is the fourth thing we are asking for."],
      ["“Who owns the corpus?”", "The open question. A shared ontology contributed to by many authorities is either a commons with a secretariat or a product with a vendor. IOSCO is the obvious secretariat. That is a governance decision before it is a schema, and we would rather have it decided than assumed."],
    ], { labelW: 4.2, labelSize: 11.5, labelColor: PEACH, descSize: 10.5, rowPad: 0.16 });
    fit(s, "hard questions");
  }

  {
    const s = slide(p, { n: ++n, kicker: "Backup",
      titleSize: 28, title: "The publish gate — ten tests, seven blocking, no waive path." });
    table(s, [3.2, 8.57], [
      ["Test", "Asserts"],
      ["Candidate set", "At least one object has reached EFFECTIVE and is in the bundle."],
      ["Coverage", "Every mandatory, capturable element has at least one eligible question."],
      ["Anchor integrity", "Every element binds to a published clause in the anchor authority."],
      ["Prohibited formulation", "No unrationalised leading risk, no ladder above its ceiling, no forbidden phrasing."],
      ["Scope integrity", "No object is reachable outside its declared mode, market or doctrine."],
      ["Boundary refusal", "The hard boundary is declared and proven in every deployed language."],
      ["Version consistency", "Every reference resolves to an object present in the same bundle."],
      [["Adversarial probe", MUTED], ["Advisory — the released set holds under hostile and leading questioning.", MUTED]],
      [["Translation fidelity", MUTED], ["Advisory — every deployable variant has passed native review.", MUTED]],
      [["Traceability", MUTED], ["Advisory — every determination resolves to an object, a version and a span.", MUTED]],
    ], { size: 10.5, rowPad: 0.06 });
    fit(s, "publish gate");
  }

  return n;
};
