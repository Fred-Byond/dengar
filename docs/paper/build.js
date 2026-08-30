const fs = require("fs");
const L = require("./lib");
const { d, numbering } = L;
const {
  Document, Packer, Paragraph, TextRun, Footer, Header, PageNumber,
  AlignmentType, BorderStyle,
} = d;

const { cover, exec, problem } = require("./part1");
const { ecosystem, solution } = require("./part2");
const { architecture, dhLang } = require("./part3");
const { value, status } = require("./part4");
const { deployment, pilot, decisions, appendix } = require("./part5");

const footer = new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: L.RULE, space: 6 } },
    children: [
      new TextRun({ text: "L'Oréal Beauty Coach — Project Paper  ·  BYOND Asia  ·  ",
        size: 15, color: L.MUTE, font: "Calibri" }),
      new TextRun({ children: [PageNumber.CURRENT], size: 15, color: L.MUTE, font: "Calibri" }),
    ],
  })],
});

const header = new Header({
  children: [new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [new TextRun({ text: "CONFIDENTIAL — for L'Oréal and BYOND Asia project team",
      size: 14, color: "9C9287", font: "Calibri", characterSpacing: 20 })],
  })],
});

const doc = new Document({
  creator: "BYOND Asia",
  title: "L'Oréal Beauty Coach — Project Paper",
  description: "What the product is, the problem it solves, how it works and what it delivers.",
  numbering,
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 21, color: L.BODY } },
    },
  },
  sections: [
    // Cover: no header/footer.
    {
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: cover,
    },
    {
      properties: { page: { margin: { top: 1180, right: 1440, bottom: 1180, left: 1440 } } },
      headers: { default: header },
      footers: { default: footer },
      children: [
        ...exec,
        ...problem,
        ...ecosystem,
        ...solution,
        ...architecture,
        ...dhLang,
        ...value,
        ...status,
        ...deployment,
        ...pilot,
        ...decisions,
        ...appendix,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  const out = process.argv[2] || "LOreal-Beauty-Coach-Project-Paper.docx";
  fs.writeFileSync(out, buf);
  console.log("wrote", out, buf.length, "bytes");
});
