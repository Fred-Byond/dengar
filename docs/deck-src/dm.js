/* Text measurement for the deck kit.
 *
 * Measured against DejaVu, which is wider than Trebuchet MS and Georgia at every
 * size. So a line count computed here is an upper bound on what PowerPoint will
 * wrap to, and the layout errs towards too much room rather than too little.
 * It is also exactly what LibreOffice renders with, so the verification render
 * and the measurement agree. */
const MET = require("./metrics.json");

function table(face, bold) {
  const fam = face === "serif" ? "serif" : face === "mono" ? "mono" : "sans";
  return MET[bold ? fam + "-bold" : fam] || MET.sans;
}

/** Advance width of one character, as a fraction of the em. */
function adv(ch, t) {
  const w = t[ch];
  if (w !== undefined) return w;
  const c = ch.codePointAt(0);
  /* CJK ideographs, kana, fullwidth forms — one em square. */
  if ((c >= 0x3000 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xff60) || (c >= 0xac00 && c <= 0xd7af))
    return MET._fallback.cjk;
  if (c >= 0x0600 && c <= 0x06ff) return MET._fallback.arabic;
  return MET._fallback.default;
}

/** Width of a string in inches. `size` in points, `charSpacing` in points. */
function width(str, o = {}) {
  const t = table(o.face, o.bold);
  const size = o.size || 12;
  let em = 0;
  for (const ch of str) em += adv(ch, t);
  return (em * size + (o.charSpacing || 0) * Math.max(0, [...str].length - 1)) / 72;
}

/** Greedy wrap. Returns the number of lines the text occupies at width `w` (inches). */
function lines(str, w, o = {}) {
  if (!str) return 0;
  /* PowerPoint's default text-box inset is 0.05in each side. */
  const avail = Math.max(0.2, w - 0.1);
  let total = 0;
  for (const para of String(str).split("\n")) {
    if (!para.trim()) { total += 1; continue; }
    const words = para.split(/(\s+)/).filter((x) => x !== "");
    let cur = "", n = 1;
    for (const tok of words) {
      const cand = cur + tok;
      if (width(cand.replace(/\s+$/, ""), o) <= avail || cur === "") {
        cur = cand;
      } else {
        n += 1;
        cur = tok.replace(/^\s+/, "");
      }
      /* A single token longer than the line breaks inside itself. */
      while (width(cur, o) > avail && cur.length > 1) {
        let cut = cur.length;
        while (cut > 1 && width(cur.slice(0, cut), o) > avail) cut -= 1;
        n += 1;
        cur = cur.slice(cut);
      }
    }
    total += n;
  }
  return total;
}

/**
 * Height in inches for `str` laid out at width `w`.
 *
 * lineSpacing is pptxgenjs's own unit (points per line). Where it is absent
 * PowerPoint uses roughly 1.2x the font size. A small pad covers the ascender
 * and descender clearance the inset does not.
 */
function height(str, w, o = {}) {
  const n = lines(str, w, o);
  if (!n) return 0;
  const lead = (o.lineSpacing || (o.size || 12) * 1.22) / 72;
  return n * lead + 0.1;
}

module.exports = { width, lines, height };
