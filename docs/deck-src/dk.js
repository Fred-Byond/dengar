/* AUREN pitch deck — kit.
 *
 * Every vertical position is measured, never guessed. A slide keeps a cursor
 * (`s.cy`); each helper draws at the cursor and advances it by the height its
 * own text actually needs. Nothing downstream can be landed on by a title that
 * wrapped to three lines, because nothing downstream has a fixed y.
 *
 * `fit()` is called on every slide at build time and throws if the flow has run
 * past the footer, so an overrun is a failed build rather than a slide somebody
 * notices in the room. */
const PptxGenJS = require("pptxgenjs");
const DM = require("./dm.js");

const INK   = "0C0820";
const PANEL = "1A1338";
const PANEL2= "241B52";
const PAPER = "F3EDFB";
const LILAC = "C7B3F0";
const PEACH = "EBA98C";
const MUTED = "A394C8";
const DIM    = "7A6AA8";
const OK    = "8FD3BA";
const BAD   = "E88DA0";
const WARN  = "EBC98C";
const RULE  = "332758";

/* Trebuchet MS and Georgia ship with both Windows and macOS. Consolas does not
   exist on macOS, so the monospace face is Courier New, which does. */
const SANS = "Trebuchet MS";
const SERIF= "Georgia";
const MONO = "Courier New";

const W = 13.333, H = 7.5;
const M = 0.78;
const CW = W - M * 2;
const FOOT = H - 0.42;        // footer rule
const SAFE = FOOT - 0.22;     // nothing may be drawn below this

/* Map a fontFace to the metric family used for measurement. */
function fam(face) {
  return face === SERIF ? "serif" : face === MONO ? "mono" : "sans";
}
function mh(text, w, o) {
  return DM.height(text, w, { ...o, face: fam(o.face || SANS) });
}
function ml(text, w, o) {
  return DM.lines(text, w, { ...o, face: fam(o.face || SANS) });
}

function deck() {
  const p = new PptxGenJS();
  p.defineLayout({ name: "W16", width: W, height: H });
  p.layout = "W16";
  p.author = "BYOND Asia";
  p.company = "HoloMe";
  p.title = "AUREN — a HoloMe solution";
  p.subject = "IOSCO TechSprint 2026";
  return p;
}

/* ── the slide, its chrome, and the cursor ───────────────────────── */

function slide(p, o = {}) {
  const s = p.addSlide();
  s.background = { color: o.bg || INK };
  s._n = o.n;
  if (!o.bare) {
    s.addShape("rect", { x: 0, y: FOOT, w: W, h: 0.012, fill: { color: RULE } });
    s.addText(
      [
        { text: "AUREN", options: { bold: true, color: LILAC, charSpacing: 2 } },
        { text: "   a HoloMe solution  ·  presented by BYOND Asia", options: { color: DIM } },
      ],
      { x: M, y: FOOT + 0.06, w: CW * 0.7, h: 0.28, fontSize: 9, fontFace: SANS, valign: "middle" }
    );
    if (o.n) s.addText(String(o.n), {
      x: W - M - 0.6, y: FOOT + 0.06, w: 0.6, h: 0.28, fontSize: 9, fontFace: MONO,
      color: DIM, align: "right", valign: "middle",
    });
  }

  let y = 0.52;
  if (o.kicker) {
    s.addText(o.kicker.toUpperCase(), {
      x: M, y, w: CW, h: 0.3, fontSize: 11, bold: true, color: PEACH,
      fontFace: SANS, charSpacing: 3,
    });
    y += 0.36;
  } else {
    y = 0.6;
  }

  if (o.title) {
    const size = o.titleSize || 34;
    const tw = o.titleW || CW;
    const h = mh(o.title, tw, { size, bold: true, lineSpacing: size * 1.18 });
    s.addText(o.title, {
      x: M, y, w: tw, h, fontSize: size, bold: true, color: PAPER,
      fontFace: SANS, valign: "top", lineSpacing: size * 1.18,
    });
    y += h;
  }

  s.cy = y + (o.title ? 0.26 : 0);
  return s;
}

/** Push the cursor down. */
function gap(s, v) { s.cy += v; return s.cy; }

/** Fail the build if this slide has overrun. */
function fit(s, label) {
  if (s.cy > SAFE + 0.001) {
    throw new Error(
      `Slide ${s._n ?? "?"}${label ? ` (${label})` : ""} overruns by ` +
      `${(s.cy - SAFE).toFixed(2)}in — cursor at ${s.cy.toFixed(2)}, safe bottom ${SAFE.toFixed(2)}.`
    );
  }
  return s;
}

/* ── blocks ──────────────────────────────────────────────────────── */

/** A paragraph at the cursor. */
function body(s, text, o = {}) {
  const w = o.w || CW * (o.wide ? 1 : 0.88);
  const size = o.size || 15;
  const ls = o.lineSpacing || size * 1.5;
  const h = mh(text, w, { size, face: o.face || SANS, lineSpacing: ls });
  s.addText(text, {
    x: o.x ?? M, y: s.cy, w, h, fontSize: size, color: o.color || MUTED,
    fontFace: o.face || SANS, italic: !!o.italic, lineSpacing: ls, valign: "top",
  });
  s.cy += h + (o.gap ?? 0.16);
  return s.cy;
}

/** Italic aside, in the deck's quieter voice. */
function note(s, text, o = {}) {
  return body(s, text, { size: 12.5, color: o.color || DIM, italic: true, face: SERIF, ...o });
}

/** A tinted card with an accent edge. Height is given, not measured. */
function card(s, x, y, w, h, o = {}) {
  s.addShape("roundRect", {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: o.fill || PANEL },
    line: { color: o.line || RULE, width: 1 },
  });
  if (o.accent) s.addShape("rect", { x, y, w: 0.045, h, fill: { color: o.accent } });
}

/** A full-width accented callout whose height comes from its text. */
function callout(s, text, o = {}) {
  const w = o.w || CW;
  const pad = 0.3;
  const size = o.size || 13;
  const ls = o.lineSpacing || size * 1.45;
  const h = mh(text, w - pad * 2, { size, face: o.face || SANS, lineSpacing: ls }) + 0.3;
  card(s, o.x ?? M, s.cy, w, h, { fill: o.fill || PANEL2, accent: o.accent || PEACH, line: o.line });
  s.addText(text, {
    x: (o.x ?? M) + pad, y: s.cy + 0.15, w: w - pad * 2, h: h - 0.3,
    fontSize: size, color: o.color || PAPER, fontFace: o.face || SANS,
    italic: !!o.italic, lineSpacing: ls, valign: "top",
  });
  s.cy += h + (o.gap ?? 0.2);
  return s.cy;
}

/**
 * A row of equal-width cards. Every card takes the height the tallest one
 * needs, so a long line in card three cannot spill out of card three.
 * items: [title, body, accentColour?]
 */
function cardRow(s, items, o = {}) {
  const n = items.length;
  const gutter = o.gutter ?? 0.3;
  const cw = (CW - gutter * (n - 1)) / n;
  const pad = o.pad ?? 0.26;
  const tSize = o.titleSize || 16;
  const bSize = o.bodySize || 12;
  const bls = bSize * 1.5;
  /* A body may be a string, or segments of [text, colour, size] so a card can
     carry a quiet qualifying line above its description. */
  const segs = (d) => (d == null ? [] : Array.isArray(d) ? d : [[d, o.bodyColor || MUTED, bSize]]);
  const segH = (seg, i) => mh(seg[0], cw - pad * 2, { size: seg[2] || bSize, lineSpacing: (seg[2] || bSize) * 1.5 })
                           + (i ? 0.06 : 0);
  let h = 0;
  items.forEach(([t, d]) => {
    const th = t ? mh(t, cw - pad * 2, { size: tSize, bold: true }) : 0;
    const dh = segs(d).reduce((a, seg, i) => a + segH(seg, i), 0);
    h = Math.max(h, th + dh + pad * 2);
  });
  items.forEach(([t, d, accent, fillOverride], i) => {
    const x = M + i * (cw + gutter);
    card(s, x, s.cy, cw, h, { accent, fill: fillOverride || o.fill, line: o.line });
    let ty = s.cy + pad;
    if (t) {
      const th = mh(t, cw - pad * 2, { size: tSize, bold: true });
      s.addText(t, {
        x: x + pad, y: ty, w: cw - pad * 2, h: th, fontSize: tSize, bold: true,
        color: o.titleColor === "accent" ? (accent || PAPER) : (o.titleColor || PAPER),
        fontFace: SANS, charSpacing: o.titleSpacing || 0, valign: "top",
      });
      ty += th;
    }
    segs(d).forEach((seg, k) => {
      const sz = seg[2] || bSize;
      const sh = mh(seg[0], cw - pad * 2, { size: sz, lineSpacing: sz * 1.5 });
      if (k) ty += 0.06;
      s.addText(seg[0], {
        x: x + pad, y: ty, w: cw - pad * 2, h: sh, fontSize: sz,
        color: seg[1] || o.bodyColor || MUTED, fontFace: SANS, lineSpacing: sz * 1.5, valign: "top",
      });
      ty += sh;
    });
  });
  s.cy += h + (o.gap ?? 0.24);
  return s.cy;
}

/**
 * Numbered or labelled rows: a left label column and a right description,
 * separated by hairlines. Each row is as tall as its own text needs.
 * items: [label, description, tag?]
 */
function rows(s, items, o = {}) {
  const labW = o.labelW || 3.4;
  const tagW = o.tagW || 0;
  const numW = o.numbered ? 0.42 : 0;
  const descW = CW - numW - labW - tagW - 0.2;
  const lSize = o.labelSize || 13.5;
  const dSize = o.descSize || 11.5;
  const dls = dSize * 1.45;
  items.forEach(([lab, desc, tag], i) => {
    const lh = mh(lab, labW - 0.2, { size: lSize, bold: true });
    const dh = mh(desc, descW, { size: dSize, lineSpacing: dls });
    const h = Math.max(lh, dh, 0.34) + (o.rowPad ?? 0.2);
    if (i > 0) s.addShape("rect", { x: M, y: s.cy - 0.09, w: CW, h: 0.008, fill: { color: RULE } });
    let x = M;
    if (o.numbered) {
      s.addText(String(i + 1), {
        x, y: s.cy, w: numW, h: 0.34, fontSize: 15, bold: true,
        color: (o.dim && o.dim(i)) ? DIM : PEACH, fontFace: SANS, valign: "top",
      });
      x += numW;
    }
    s.addText(lab, {
      x, y: s.cy, w: labW - 0.2, h: lh, fontSize: lSize, bold: true,
      color: (o.dim && o.dim(i)) ? MUTED : (o.labelColor || PAPER), fontFace: o.labelFace || SANS, valign: "top",
    });
    s.addText(desc, {
      x: M + numW + labW, y: s.cy, w: descW, h: dh, fontSize: dSize,
      color: o.descColor || MUTED, fontFace: SANS, lineSpacing: dls, valign: "top",
    });
    if (tagW && tag) {
      s.addText(tag, {
        x: W - M - tagW, y: s.cy, w: tagW, h: 0.3, fontSize: 9.5,
        color: (o.dim && o.dim(i)) ? DIM : OK, fontFace: MONO, align: "right", valign: "top",
      });
    }
    s.cy += h;
  });
  s.cy += (o.gap ?? 0.16);
  return s.cy;
}

/** Bulleted list. items: text or [text, sub]. */
function bullets(s, items, o = {}) {
  const w = (o.w || CW) - 0.34;
  const size = o.size || 13;
  const sub = o.subSize || 11.5;
  items.forEach((it) => {
    const [t, d] = Array.isArray(it) ? it : [it, null];
    const th = mh(t, w, { size, lineSpacing: size * 1.4 });
    s.addText(o.mark || "—", {
      x: o.x ?? M, y: s.cy, w: 0.3, h: 0.3, fontSize: size, color: o.markColor || PEACH, fontFace: SANS,
    });
    s.addText(t, {
      x: (o.x ?? M) + 0.34, y: s.cy, w, h: th, fontSize: size, color: o.color || PAPER,
      fontFace: SANS, lineSpacing: size * 1.4, valign: "top",
    });
    s.cy += th;
    if (d) {
      const dh = mh(d, w, { size: sub, lineSpacing: sub * 1.42 });
      s.addText(d, {
        x: (o.x ?? M) + 0.34, y: s.cy, w, h: dh, fontSize: sub, color: MUTED,
        fontFace: SANS, lineSpacing: sub * 1.42, valign: "top",
      });
      s.cy += dh;
    }
    s.cy += o.gap ?? 0.12;
  });
  return s.cy;
}

/** Table. rows[0] is the header. Every row is as tall as its tallest cell. */
function table(s, colW, data, o = {}) {
  const x0 = o.x ?? M;
  const w = colW.reduce((a, b) => a + b, 0);
  const size = o.size || 11.5;
  const pad = o.rowPad ?? 0.2;
  data.forEach((r, i) => {
    let need = 0;
    r.forEach((c, j) => {
      const txt = Array.isArray(c) ? c[0] : c;
      const isMono = Array.isArray(c) && c[2] === "mono";
      need = Math.max(need, mh(String(txt), colW[j] - 0.28, {
        size: i === 0 ? 9.5 : size, bold: i === 0, face: isMono ? MONO : SANS,
        lineSpacing: (i === 0 ? 9.5 : size) * 1.3,
      }));
    });
    const h = Math.max(need, 0.3) + pad;
    if (i === 0) s.addShape("rect", { x: x0, y: s.cy, w, h, fill: { color: PANEL2 } });
    else if (i % 2 === 0) s.addShape("rect", { x: x0, y: s.cy, w, h, fill: { color: "150F35" } });
    let cx = x0;
    r.forEach((c, j) => {
      const arr = Array.isArray(c);
      s.addText(arr ? c[0] : c, {
        x: cx + 0.14, y: s.cy, w: colW[j] - 0.28, h,
        fontSize: i === 0 ? 9.5 : size,
        bold: i === 0 || (o.boldCol0 && j === 0),
        color: i === 0 ? LILAC : (arr ? (c[1] || PAPER) : PAPER),
        fontFace: arr && c[2] === "mono" ? MONO : SANS,
        charSpacing: i === 0 ? 1.4 : 0,
        lineSpacing: (i === 0 ? 9.5 : size) * 1.3,
        valign: "middle",
      });
      cx += colW[j];
    });
    s.cy += h;
  });
  s.cy += o.gap ?? 0.2;
  return s.cy;
}

/** Horizontal bar with a label and a value. */
function barRow(s, label, frac, value, o = {}) {
  const labW = o.labelW || 3.0;
  const valW = o.valueW || 1.9;
  const barW = CW - labW - valW - 0.3;
  s.addText(label, {
    x: M, y: s.cy, w: labW, h: 0.3, fontSize: 12.5, color: PAPER, fontFace: SANS, valign: "middle",
  });
  const by = s.cy + 0.09;
  s.addShape("rect", { x: M + labW, y: by, w: barW, h: 0.14, fill: { color: "2A2059" } });
  s.addShape("rect", {
    x: M + labW, y: by, w: Math.max(0.04, barW * Math.min(1, frac)), h: 0.14,
    fill: { color: o.color || PEACH },
  });
  s.addText(value, {
    x: M + labW + barW + 0.2, y: s.cy, w: valW, h: 0.3, fontSize: 11,
    color: MUTED, fontFace: MONO, valign: "middle",
  });
  s.cy += 0.46;
  return s.cy;
}

/* ── whole-slide forms ───────────────────────────────────────────── */

function divider(p, n, kicker, title, sub) {
  const s = slide(p, { n, bare: true });
  s.background = { color: PANEL };
  s.addShape("rect", { x: 0, y: 0, w: 0.09, h: H, fill: { color: PEACH } });
  const tw = 10.6;
  const th = mh(title, tw, { size: 40, bold: true, lineSpacing: 46 });
  s.addText(kicker.toUpperCase(), {
    x: 1.1, y: 2.5, w: 10, h: 0.35, fontSize: 12, bold: true, color: PEACH, fontFace: SANS, charSpacing: 4,
  });
  s.addText(title, {
    x: 1.1, y: 2.9, w: tw, h: th, fontSize: 40, bold: true, color: PAPER, fontFace: SANS, lineSpacing: 46,
  });
  if (sub) {
    const sw = 9.6;
    s.addText(sub, {
      x: 1.1, y: 2.95 + th, w: sw, h: mh(sub, sw, { size: 15, lineSpacing: 22 }),
      fontSize: 15, color: MUTED, fontFace: SANS, lineSpacing: 22, valign: "top",
    });
  }
  s.addText(String(n), {
    x: W - 1.2, y: H - 0.72, w: 0.6, h: 0.3, fontSize: 9, fontFace: MONO, color: DIM, align: "right",
  });
  s.cy = 0;
  return s;
}

/** One sentence, large, with the rule above it. */
function statement(p, n, text, sub, o = {}) {
  const s = slide(p, { n });
  const size = o.size || 34;
  const tw = CW * 0.9;
  const th = mh(text, tw, { size, face: SERIF, lineSpacing: size * 1.32 });
  const y = o.y ?? 1.95;
  s.addShape("rect", { x: M, y: y - 0.34, w: 1.5, h: 0.035, fill: { color: PEACH } });
  s.addText(text, {
    x: M, y, w: tw, h: th, fontSize: size, color: PAPER, fontFace: SERIF,
    italic: true, lineSpacing: size * 1.32, valign: "top",
  });
  s.cy = y + th + 0.34;
  if (sub) body(s, sub, { size: 14, w: CW * 0.8 });
  return fit(s, "statement");
}

module.exports = {
  PptxGenJS, deck, slide, divider, statement,
  gap, fit, body, note, card, callout, cardRow, rows, bullets, table, barRow,
  mh, ml,
  INK, PANEL, PANEL2, PAPER, LILAC, PEACH, MUTED, DIM, OK, BAD, WARN, RULE,
  SANS, SERIF, MONO, W, H, M, CW, FOOT, SAFE,
};
