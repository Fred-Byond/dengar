const d = require("docx");
const {
  Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, LevelFormat, PageBreak,
} = d;

const GOLD = "8A6A18";
const GOLD_L = "C9A44C";
const INK = "1A1613";
const BODY = "3D3630";
const MUTE = "6E655C";
const RULE = "DDD6C9";
const BAND = "F4EFE3";
const W = 9026; // A4 content width in DXA

const CPD = "A8355B", LUXE = "5F4A93", DERM = "1F6070", PPD = "7A6224";

const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: none, bottom: none, left: none, right: none };

/** Body paragraph. */
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 160, line: 276 },
    alignment: opts.align,
    indent: opts.indent,
    children: runs(text, opts),
  });
}

/**
 * Accepts a string, or an array of strings/objects so a single paragraph can
 * mix weights: ["plain ", {b:"bold"}, " more"].
 */
function runs(text, opts = {}) {
  const arr = Array.isArray(text) ? text : [text];
  return arr.map((t) => {
    if (typeof t === "string") {
      return new TextRun({
        text: t, size: opts.size ?? 21, color: opts.color ?? BODY,
        font: "Calibri", italics: opts.i, bold: opts.b,
      });
    }
    return new TextRun({
      text: t.b ?? t.i ?? t.t ?? "",
      bold: Boolean(t.b), italics: Boolean(t.i),
      size: opts.size ?? 21, color: t.color ?? opts.color ?? BODY, font: "Calibri",
    });
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 380, after: 170 },
    children: [new TextRun({ text, bold: true, size: 30, color: INK, font: "Georgia" })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 110 },
    children: [new TextRun({ text, bold: true, size: 23, color: INK, font: "Georgia" })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 21, color: GOLD, font: "Calibri" })],
  });
}
/** Small uppercase section eyebrow with a rule under it. */
function eyebrow(text) {
  return new Paragraph({
    spacing: { before: 300, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD_L, space: 4 } },
    children: [new TextRun({
      text: text.toUpperCase(), bold: true, size: 16, color: GOLD,
      font: "Calibri", characterSpacing: 60,
    })],
  });
}
function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "dot", level },
    spacing: { after: 90, line: 276 },
    children: runs(text),
  });
}
function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "num", level },
    spacing: { after: 90, line: 276 },
    children: runs(text),
  });
}
/** Callout: shaded single-cell table. */
function callout(title, body) {
  return new Table({
    columnWidths: [W],
    width: { size: W, type: WidthType.DXA },
    borders: {
      top: none, bottom: none, right: none,
      left: { style: BorderStyle.SINGLE, size: 18, color: GOLD_L },
      insideHorizontal: none, insideVertical: none,
    },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: BAND, color: "auto" },
      margins: { top: 160, bottom: 160, left: 200, right: 200 },
      children: [
        new Paragraph({ spacing: { after: 70 },
          children: [new TextRun({ text: title, bold: true, size: 20, color: INK, font: "Calibri" })] }),
        new Paragraph({ spacing: { after: 0, line: 276 }, children: runs(body, { size: 20 }) }),
      ],
    })] })],
  });
}
/** Data table. head = array of strings; rows = array of arrays (string | {t,b,color}). */
function table(head, rows, widths) {
  const cols = widths || head.map(() => Math.floor(W / head.length));
  const sum = cols.reduce((a, b) => a + b, 0);
  cols[cols.length - 1] += W - sum;
  const cell = (content, i, isHead) => new TableCell({
    width: { size: cols[i], type: WidthType.DXA },
    shading: isHead ? { type: ShadingType.CLEAR, fill: BAND, color: "auto" } : undefined,
    margins: { top: 90, bottom: 90, left: 130, right: 130 },
    children: [new Paragraph({
      spacing: { after: 0, line: 260 },
      children: isHead
        ? [new TextRun({ text: content, bold: true, size: 17, color: GOLD, font: "Calibri", characterSpacing: 30 })]
        : runs(content, { size: 19 }),
    })],
  });
  return new Table({
    columnWidths: cols,
    width: { size: W, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: RULE },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE },
      left: none, right: none,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      insideVertical: none,
    },
    rows: [
      new TableRow({ tableHeader: true, children: head.map((c, i) => cell(c, i, true)) }),
      ...rows.map((r) => new TableRow({ children: r.map((c, i) => cell(c, i, false)) })),
    ],
  });
}
function spacer(h = 120) {
  return new Paragraph({ spacing: { after: h }, children: [] });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

const numbering = {
  config: [
    { reference: "dot", levels: [
      { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 200 } } } },
      { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 200 } } } },
    ] },
    { reference: "num", levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 400, hanging: 240 } } } },
    ] },
  ],
};

module.exports = {
  d, p, h1, h2, h3, eyebrow, bullet, numbered, callout, table, spacer, pageBreak,
  runs, numbering, W, GOLD, GOLD_L, INK, BODY, MUTE, RULE, BAND, CPD, LUXE, DERM, PPD, none,
};
