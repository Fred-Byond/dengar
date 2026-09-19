# The pitch deck, and why it is generated

`../AUREN-IOSCO-Pitch-Deck-HoloMe-v2.pptx` is built from these files. Editing the
`.pptx` by hand is fine for a typo and wrong for anything else, because the thing
that keeps the deck legible is not in the file — it is in `dk.js`.

## The problem this solves

The first build of this deck placed every element at a hardcoded y-coordinate. A
title that happened to wrap onto a second line therefore landed on top of the
content beneath it, and text longer than its box simply ran out of the bottom.
Twelve of the thirty-five slides were affected and none of it was visible in the
XML, in a shape-bounds check, or in a browser mock-up — only in a real renderer.

So nothing here has a hardcoded y-coordinate any more.

## How it works

- **`dm.js`** measures text. Advance widths come from `metrics.json`, extracted
  from DejaVu with PIL. DejaVu is *wider* than Trebuchet MS and Georgia at every
  size, so a measured line count is an upper bound on what PowerPoint will
  actually wrap to — the layout errs towards too much room, never too little. It
  is also the font LibreOffice substitutes, so the verification render and the
  measurement agree exactly.
- **`dk.js`** is the kit. Each slide carries a cursor (`s.cy`); every helper
  draws at the cursor and advances it by the height its own text needs. Cards in
  a row all take the height of the tallest. Table rows take the height of their
  tallest cell.
- **`fit(s)`** is called on every slide and **throws** if the flow has run past
  the footer. An overrun is a failed build rather than something a person
  notices in the room.
- **`d-a.js` … `d-d.js`** are the content, in slide order. `dbuild.js` assembles.

## Building

```sh
npm i pptxgenjs          # not a dependency of the app; this folder only
node dbuild.js ../AUREN-IOSCO-Pitch-Deck-HoloMe-v2.pptx
```

## Verifying

Two passes, and the second one is the one that has actually caught things.

```sh
# 1 · geometry, measured against the built file
python3 dump.py ../AUREN-IOSCO-Pitch-Deck-HoloMe-v2.pptx geom.json
node dcheck.mjs geom.json     # off-slide shapes, box overflow, text overlap

# 2 · render it and look at it
soffice --headless --convert-to pdf ../AUREN-IOSCO-Pitch-Deck-HoloMe-v2.pptx
pdftoppm -r 100 -png *.pdf page
```

`dcheck.mjs` was validated by running it against the broken build, where it
reported 36 issues across the twelve bad slides. A checker that has never failed
has not been tested.

## What is not checked

Font substitution. The deck asks for Trebuchet MS, Georgia and Courier New —
present on both Windows and macOS, absent here, so every render in this
environment is DejaVu. Line counts are therefore conservative rather than exact,
and the deck should still be opened once in PowerPoint before it is presented.
