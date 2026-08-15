import io, os
SP = os.path.dirname(os.path.abspath(__file__))
body = open(SP + "/body11.html").read()

HEAD = r"""<title>MESSI.LIVE Paper v1.1</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

<style>
  /* ------------------------------------------------------------------ *
   * MESSI.LIVE — Project & Product Paper, reading edition.
   * A document, not a landing page: one column, a real measure, a serif
   * body for sustained reading, and the sans reserved for structure.
   * ------------------------------------------------------------------ */
  :root {
    --paper: #f7f8fb;
    --card: #ffffff;
    --ink: #141a24;
    --ink-2: #37415a;
    --muted: #5f6878;
    --line: #e0e5ee;
    --line-soft: #eef1f7;
    --navy: #0f1730;
    --sky: #2e6fa7;
    --sky-soft: #eaf2fa;
    --gold: #8a6a12;
    --gold-soft: #fdf6e4;
    --rose: #a5215f;
    --rose-soft: #fdeef4;
    --serif: Georgia, "Iowan Old Style", "Times New Roman", serif;
    --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    --bar-bg: #0f1730;
    --bar-fg: #f7f8fb;
    color-scheme: light;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --paper: #0b1018;
      --card: #121a27;
      --ink: #e9edf5;
      --ink-2: #c2cbdb;
      --muted: #94a0b4;
      --line: #24304a;
      --line-soft: #1a2333;
      --navy: #cfe0f2;
      --sky: #8bbde8;
      --sky-soft: #16273a;
      --gold: #e0b85a;
      --gold-soft: #2a2413;
      --rose: #f07aac;
      --rose-soft: #2c1523;
      --bar-bg: #060a14;
      --bar-fg: #e9edf5;
      color-scheme: dark;
    }
  }
  :root[data-theme="dark"] {
    --paper: #0b1018;
    --card: #121a27;
    --ink: #e9edf5;
    --ink-2: #c2cbdb;
    --muted: #94a0b4;
    --line: #24304a;
    --line-soft: #1a2333;
    --navy: #cfe0f2;
    --sky: #8bbde8;
    --sky-soft: #16273a;
    --gold: #e0b85a;
    --gold-soft: #2a2413;
    --rose: #f07aac;
    --rose-soft: #2c1523;
    --bar-bg: #060a14;
    --bar-fg: #e9edf5;
    color-scheme: dark;
  }

  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--serif); }

  /* running head */
  .bar {
    position: sticky; top: 0; z-index: 20;
    display: flex; align-items: center; gap: 10px;
    padding: 10px 18px;
    background: var(--bar-bg);
    color: var(--bar-fg);
    font-family: var(--sans);
  }
  .bar .wm { font-size: 14px; font-weight: 800; letter-spacing: 0.05em; }
  .bar .doc { font-size: 11px; opacity: 0.7; letter-spacing: 0.05em; }
  .bar .badge {
    margin-left: auto; font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.1em;
    border: 1px solid currentColor; opacity: 0.75; padding: 4px 8px; border-radius: 99px; white-space: nowrap;
  }
  @media (max-width: 620px) {
    .bar .doc { display: none; }
    .bar .badge .long { display: none; }
  }

  .page { max-width: 760px; margin: 0 auto; padding: 0 20px 80px; }

  /* cover */
  .cover { padding: 44px 0 30px; border-bottom: 1px solid var(--line); }
  .cover .kicker {
    font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--rose);
  }
  .cover h1.title {
    margin: 10px 0 6px; font-family: var(--sans); font-size: clamp(38px, 9vw, 58px);
    font-weight: 800; letter-spacing: -0.03em; line-height: 1; color: var(--navy);
  }
  .cover h1.title span { font-weight: 300; color: var(--sky); }
  .cover .sub { margin: 0 0 18px; font-size: 17px; color: var(--muted); }
  .cover .lede { font-size: 19px; line-height: 1.6; color: var(--ink-2); margin: 0 0 22px; }
  .meta { display: grid; grid-template-columns: max-content 1fr; gap: 4px 18px; font-family: var(--sans); font-size: 13px; }
  .meta dt { color: var(--muted); }
  .meta dd { margin: 0; color: var(--ink); }
  .meta a.vlink { color: var(--sky); }

  /* contents */
  .toc { margin: 26px 0 10px; padding: 18px 20px; background: var(--card); border: 1px solid var(--line); border-radius: 14px; }
  .toc-h { font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--sky); margin-bottom: 10px; }
  .toc ol { margin: 0; padding: 0; list-style: none; font-family: var(--sans); }
  .toc li { margin: 0; }
  .toc a { color: var(--ink); text-decoration: none; display: block; padding: 5px 0; border-bottom: 1px solid var(--line-soft); }
  .toc a:hover { color: var(--sky); }
  .toc .l1 > a { font-weight: 700; font-size: 14.5px; }
  .toc .l2 > a { font-size: 13px; color: var(--ink-2); padding-left: 14px; }
  @media (max-width: 560px) { .toc .l2 { display: none; } }

  /* document body */
  h1 { font-family: var(--sans); font-size: 27px; font-weight: 800; letter-spacing: -0.02em;
       color: var(--navy); margin: 52px 0 14px; padding-top: 18px; border-top: 2px solid var(--line);
       scroll-margin-top: 62px; text-wrap: balance; }
  h2 { font-family: var(--sans); font-size: 19px; font-weight: 700; color: var(--sky);
       margin: 34px 0 10px; scroll-margin-top: 62px; }
  h3 { font-family: var(--sans); font-size: 15.5px; font-weight: 700; color: var(--ink); margin: 24px 0 8px; }
  p { font-size: 17px; line-height: 1.68; margin: 0 0 14px; color: var(--ink); }
  li { font-size: 17px; line-height: 1.62; margin-bottom: 7px; }
  ul, ol { padding-left: 22px; margin: 0 0 16px; }
  strong { font-weight: 700; }
  em { font-style: italic; }

  /* insight / implication / action */
  .iia {
    background: var(--sky-soft); border-left: 3px solid var(--sky);
    padding: 11px 15px; margin: 0 0 3px; font-size: 16px; line-height: 1.6;
  }
  .iia-insight { border-radius: 10px 10px 0 0; margin-top: 18px; }
  .iia-action { border-radius: 0 0 10px 10px; margin-bottom: 20px; }
  .iia .k {
    display: inline-block; font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--sky); margin-right: 8px; font-weight: 700;
  }
  .callout {
    background: var(--gold-soft); border-left: 3px solid var(--gold); border-radius: 10px;
    padding: 13px 16px; margin: 20px 0; font-size: 16px; line-height: 1.6;
  }
  .callout .k {
    display: block; font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--gold); margin-bottom: 5px; font-weight: 700;
  }

  /* tables */
  .tw { overflow-x: auto; margin: 0 0 20px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); }
  table { border-collapse: collapse; width: 100%; min-width: 460px; font-family: var(--sans); font-size: 13.5px; color: var(--ink); }
  td, th { padding: 9px 12px; border-top: 1px solid var(--line-soft); vertical-align: top; text-align: left; }
  thead td, thead th { border-top: 0; background: var(--sky-soft); font-weight: 700; font-size: 11px;
    letter-spacing: 0.06em; text-transform: uppercase; color: var(--navy); }
  tbody tr:first-child td { border-top: 0; }
  td p { margin: 0; font-family: var(--sans); font-size: 13.5px; line-height: 1.5; }

  /* figures */
  figure { margin: 26px 0; text-align: center; }
  figure img { max-width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--line); }
  figure.portrait img { max-width: 260px; }
  figcaption { margin-top: 8px; font-family: var(--sans); font-size: 12.5px; color: var(--muted); }

  .foot { margin-top: 54px; padding-top: 18px; border-top: 1px solid var(--line);
    font-family: var(--sans); font-size: 12px; line-height: 1.6; color: var(--muted); }

  @media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
  html { scroll-behavior: smooth; }
</style>

<div class="bar">
  <span class="wm">MESSI.LIVE</span>
  <span class="doc">Project &amp; Product Paper · v1.1</span>
  <span class="badge">PROPOSAL<span class="long"> · NOT AFFILIATED WITH LIONEL MESSI</span></span>
</div>

<div class="page">
  <header class="cover">
    <div class="kicker">Project &amp; Product Paper</div>
    <h1 class="title">MESSI<span>.LIVE</span></h1>
    <p class="sub">One Messi. Every Fan. Every Language. Anywhere.</p>
    <p class="lede">
      An officially governed digital relationship platform giving any fan, anywhere, a bookable
      five-minute one-to-one conversation with Lionel Messi's authorised digital human — and
      giving management the first listening infrastructure ever built around an athlete.
    </p>
    <dl class="meta">
      <dt>Prepared by</dt><dd>BYOND Asia</dd>
      <dt>Prepared for</dt><dd>Lionel Messi &amp; Management (proposal stage)</dd>
      <dt>Version</dt><dd>1.1 · 14 August 2026</dd>
      <dt>Supersedes</dt><dd><a class="vlink" href="https://claude.ai/code/artifact/38d26dac-0509-475c-9ba5-fcdafa4f464e">v1.0 — 13 August 2026</a>, kept unchanged for comparison</dd>
      <dt>Status</dt><dd>Proposal. Working prototype built; no rights, licence or endorsement in place.</dd>
    </dl>
  </header>
"""

FOOT = r"""
  <div class="foot">
    <b>Disclaimer.</b> This paper is a commercial proposal prepared by BYOND Asia. It is not
    affiliated with, endorsed by, or connected to Lionel Messi or his management. Every partner
    slot, category, price point and financial figure is illustrative and subject to management
    approval and to existing contractual rights. Nothing described here may be built or
    published without an executed licence.
  </div>
</div>
"""

# wrap tables so wide ones scroll inside their own container
body = body.replace("<table>", '<div class="tw"><table>').replace("</table>", "</table></div>")

open(SP + "/messi-live-paper-v1.1.html", "w").write(HEAD + body + FOOT)
print("written", round(os.path.getsize(SP + "/messi-live-paper-v1.1.html") / 1024), "KB")
