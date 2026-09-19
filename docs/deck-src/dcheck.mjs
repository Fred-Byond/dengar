/* Post-build verification: nothing off-slide, nothing overflowing its own box,
   no two text boxes overlapping. Runs on the built file, not on intentions. */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const DM = createRequire(import.meta.url)("./dm.js");

const W = 13.333, H = 7.5, TOL = 0.06;
const slides = JSON.parse(readFileSync(process.argv[2], "utf8"));
const fam = (f) => /Georgia/i.test(f || "") ? "serif" : /Courier|Consolas|Mono/i.test(f || "") ? "mono" : "sans";

let bad = 0;
const say = (m) => { console.log("  " + m); bad++; };

for (const sl of slides) {
  const texts = sl.shapes.filter((s) => s.text);
  const issues = [];

  for (const s of sl.shapes) {
    if (s.x < -TOL || s.y < -TOL || s.x + s.w > W + TOL || s.y + s.h > H + TOL)
      issues.push(`off-slide: ${(s.text || s.kind).slice(0, 40)}`);
  }
  for (const s of texts) {
    const need = DM.height(s.text, s.w, {
      size: s.size, face: fam(s.face), bold: s.bold, lineSpacing: s.lineSpacing,
    });
    if (need > s.h + 0.12)
      issues.push(`overflows box by ${(need - s.h).toFixed(2)}in: “${s.text.slice(0, 48)}…”`);
  }
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      /* Only a real two-dimensional intersection counts; boxes that merely abut
         or share a row (a label beside its value) do not. */
      if (ox > 0.12 && oy > 0.12)
        issues.push(`overlap ${oy.toFixed(2)}in: “${a.text.slice(0, 26)}…” × “${b.text.slice(0, 26)}…”`);
    }
  }
  if (issues.length) {
    console.log(`slide ${sl.n}:`);
    issues.forEach(say);
  }
}
console.log(bad ? `\n${bad} issue(s).` : `\nClean: ${slides.length} slides, no off-slide shapes, no overflow, no overlap.`);
process.exit(bad ? 1 : 0);
