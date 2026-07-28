"""Generate the Executive Brief page from the exported pipeline bundle.

The dashboard is an instrument — it is operated. The brief is a document; it
is read once, by someone who will not filter anything, and it has to survive
being forwarded. So it is generated, not hand-written: every number, finding,
action and expected movement comes out of `src/lib/tif`, and the only thing
this script owns is the layout.

    node <harness>/export.js      # writes bundle.json from the real pipeline
    python3 scripts/build-brief.py

"""
import html
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
BUNDLE = pathlib.Path(
    sys.argv[1] if len(sys.argv) > 1 else ROOT / "public" / "prototypes" / "bundle.json"
)
OUT = ROOT / "public" / "prototypes" / "mirome-brief.html"

D = json.loads(BUNDLE.read_text())
e = lambda s: html.escape(str(s))

WAVE_LABEL = {w["id"]: w["label"] for w in D["waves"]}
OWNER_NAME = {o["id"]: o["name"] for o in D["owners"]}
BAND_BY_ID = {b["id"]: b for b in D["bands"]}

STYLE = """
/* ============================================================
   MIROME — Executive Brief.

   Written as a board paper, not a dashboard. The reader is a CEO or a CHRO
   who has ten minutes, will not apply a filter, and will forward this to
   someone else. So: one column, a stated headline before any chart, every
   number carrying its confidence, and the actions specific enough to be
   approved rather than discussed.

   The three perception bands are never summed into one score. A company can
   be strong on delivery and unsafe to speak in, and the average of those two
   hides the only finding worth acting on.
   ============================================================ */

:root {
  --ink: #14161d;
  --ink-2: #4d5464;
  --ink-3: #838b9c;
  --line: #e3e6ee;
  --line-2: #eef0f6;
  --paper: #ffffff;
  --canvas: #f5f6fa;

  --indigo: #22306e;
  --violet: #6b4ee6;
  --violet-soft: #f2eeff;

  --strong: #147a5e;
  --strong-soft: #e6f4ef;
  --watch: #b8791a;
  --watch-soft: #fdf3e2;
  --priority: #c0392f;
  --priority-soft: #fceeec;

  --serif: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
  --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ink: #edeff5; --ink-2: #a8afc0; --ink-3: #7c8496;
    --line: #2a2e3b; --line-2: #22262f;
    --paper: #171a21; --canvas: #101318;
    --violet-soft: #241d3d;
    --strong-soft: #10261f; --watch-soft: #2a2113; --priority-soft: #2c1815;
  }
}
:root[data-theme="dark"] {
  --ink: #edeff5; --ink-2: #a8afc0; --ink-3: #7c8496;
  --line: #2a2e3b; --line-2: #22262f;
  --paper: #171a21; --canvas: #101318;
  --violet-soft: #241d3d;
  --strong-soft: #10261f; --watch-soft: #2a2113; --priority-soft: #2c1815;
}
:root[data-theme="light"] {
  --ink: #14161d; --ink-2: #4d5464; --ink-3: #838b9c;
  --line: #e3e6ee; --line-2: #eef0f6;
  --paper: #ffffff; --canvas: #f5f6fa;
  --violet-soft: #f2eeff;
  --strong-soft: #e6f4ef; --watch-soft: #fdf3e2; --priority-soft: #fceeec;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--canvas);
  color: var(--ink);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
}
button { font-family: inherit; cursor: pointer; }
:focus-visible { outline: 2.5px solid var(--violet); outline-offset: 2px; border-radius: 6px; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }

.sheet { max-width: 860px; margin: 0 auto; background: var(--paper); }
.pad { padding: 0 46px; }
@media (max-width: 720px) { .pad { padding: 0 20px; } }

/* ---------- masthead ---------- */
.mast { padding: 34px 46px 26px; border-bottom: 3px solid var(--ink); }
@media (max-width: 720px) { .mast { padding: 24px 20px 20px; } }
.mast .brandline {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  font-size: 11px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--violet);
}
.mast h1 {
  font-family: var(--serif);
  font-size: 40px; font-weight: 600; line-height: 1.1; letter-spacing: -0.015em;
  margin: 14px 0 0; text-wrap: balance;
}
@media (max-width: 720px) { .mast h1 { font-size: 30px; } }
.mast .sub { margin: 10px 0 0; font-size: 14.5px; color: var(--ink-2); max-width: 60ch; }
.meta { display: flex; flex-wrap: wrap; gap: 6px 26px; margin-top: 18px; }
.meta div { font-size: 12px; }
.meta b { display: block; font-size: 9.5px; font-weight: 800; letter-spacing: 0.13em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 2px; }

.waves { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 20px; }
.waves button {
  border: 1px solid var(--line); background: var(--paper); color: var(--ink-2);
  border-radius: 99px; padding: 7px 14px; font-size: 12px; font-weight: 700;
}
.waves button[aria-pressed="true"] { background: var(--ink); border-color: var(--ink); color: var(--paper); }

/* ---------- sections ---------- */
section { padding: 34px 0 4px; border-bottom: 1px solid var(--line-2); }
section:last-of-type { border-bottom: 0; }
.sechead { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 6px; }
.sechead .n {
  font-family: var(--serif); font-size: 13px; font-weight: 700; color: var(--violet);
  border: 1.5px solid var(--violet); border-radius: 50%;
  width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  flex: 0 0 auto;
}
.sechead h2 { font-family: var(--serif); font-size: 24px; font-weight: 600; margin: 0; letter-spacing: -0.01em; }
.sechead small { font-size: 12px; color: var(--ink-3); }
.say { font-size: 14.5px; color: var(--ink-2); margin: 6px 0 0; max-width: 68ch; }

/* ---------- the headline ---------- */
.headline {
  font-family: var(--serif);
  font-size: 23px; line-height: 1.4; font-weight: 500;
  margin: 14px 0 0;
  padding-inline-start: 18px;
  border-inline-start: 4px solid var(--violet);
  text-wrap: pretty;
}
@media (max-width: 720px) { .headline { font-size: 19px; } }

/* ---------- perception bands ---------- */
.bands { display: grid; gap: 14px; margin-top: 18px; }
.band { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.band .top { display: flex; align-items: flex-start; gap: 16px; padding: 16px 18px; }
.band .score { flex: 0 0 auto; text-align: center; min-width: 84px; }
.band .score .v { font-size: 38px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
.band .score .l { font-size: 9.5px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); margin-top: 4px; }
.band .who { min-width: 0; }
.band .who h3 { font-size: 16.5px; margin: 0 0 2px; font-weight: 800; }
.band .who .q { font-size: 14px; color: var(--ink-2); font-style: italic; margin: 0 0 6px; }
.band .who .stake { font-size: 12.5px; color: var(--ink-2); margin: 0; }
.band .foot {
  display: flex; flex-wrap: wrap; gap: 8px 18px; align-items: center;
  padding: 11px 18px; background: var(--canvas); border-top: 1px solid var(--line);
  font-size: 11.5px; color: var(--ink-2);
}
.band .foot b { color: var(--ink); }
.band.strong .score .v { color: var(--strong); }
.band.watch .score .v { color: var(--watch); }
.band.priority .score .v { color: var(--priority); }

.dir { display: inline-flex; align-items: center; gap: 5px; font-weight: 800; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; }
.dir.improving { color: var(--strong); }
.dir.slipping { color: var(--priority); }
.dir.steady, .dir.new { color: var(--ink-3); }

.sub-constructs { display: flex; flex-wrap: wrap; gap: 6px; padding: 12px 18px 14px; }
.pill {
  display: inline-flex; align-items: baseline; gap: 6px;
  border: 1px solid var(--line); border-radius: 99px; padding: 5px 11px;
  font-size: 11.5px; background: var(--paper);
}
.pill i { font-style: normal; font-weight: 800; font-variant-numeric: tabular-nums; }
.pill .d { font-size: 10px; font-weight: 700; }
.pill .d.up { color: var(--strong); }
.pill .d.down { color: var(--priority); }

/* ---------- tables ---------- */
.tablewrap { overflow-x: auto; margin-top: 16px; }
table { border-collapse: collapse; width: 100%; font-size: 13px; min-width: 520px; }
th, td { text-align: start; padding: 10px 12px; border-bottom: 1px solid var(--line-2); vertical-align: top; }
th { font-size: 10px; font-weight: 800; letter-spacing: 0.11em; text-transform: uppercase; color: var(--ink-3); border-bottom: 1.5px solid var(--line); }
td b { font-weight: 700; }
td .muted { color: var(--ink-3); }
tr.suppressed td { color: var(--ink-3); font-style: italic; }
.num { font-variant-numeric: tabular-nums; text-align: end; }
.neg { color: var(--priority); font-weight: 700; }

/* ---------- action board ---------- */
.actions { display: grid; gap: 14px; margin-top: 18px; }
.action { border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; }
.action.now { border-inline-start: 4px solid var(--violet); }
.action.prog { border-inline-start: 4px solid var(--indigo); }
.action .tag {
  display: inline-block; font-size: 9.5px; font-weight: 800; letter-spacing: 0.13em; text-transform: uppercase;
  padding: 3px 8px; border-radius: 99px; background: var(--violet-soft); color: var(--violet);
}
.action.prog .tag { background: var(--canvas); color: var(--indigo); }
.action h3 { font-size: 16.5px; margin: 9px 0 0; line-height: 1.35; text-wrap: balance; }
.action .detail { font-size: 13.5px; color: var(--ink-2); margin: 7px 0 0; }
.action .because { font-size: 12.5px; margin: 10px 0 0; padding-inline-start: 12px; border-inline-start: 2px solid var(--line); color: var(--ink-2); }
.action .because b { color: var(--ink); }
.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 14px; }
@media (max-width: 620px) { .grid4 { grid-template-columns: 1fr 1fr; } }
.grid4 div { min-width: 0; }
.grid4 b { display: block; font-size: 9.5px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 3px; }
.grid4 span { font-size: 12.5px; font-weight: 600; }
.instead { margin-top: 12px; background: var(--canvas); border-radius: 10px; padding: 10px 12px; font-size: 12.5px; color: var(--ink-2); }
.instead b { color: var(--ink); }

/* ---------- limits ---------- */
.limits { list-style: none; padding: 0; margin: 16px 0 0; display: grid; gap: 9px; }
.limits li { display: flex; gap: 10px; font-size: 13.5px; color: var(--ink-2); }
.limits li::before { content: "—"; color: var(--priority); font-weight: 800; flex: 0 0 auto; }

.foot-note { padding: 26px 46px 40px; font-size: 11.5px; color: var(--ink-3); line-height: 1.6; border-top: 1px solid var(--line); margin-top: 26px; }
@media (max-width: 720px) { .foot-note { padding: 22px 20px 34px; } }
.foot-note b { color: var(--ink-2); }

@media print {
  body { background: #fff; }
  .waves, .noprint { display: none !important; }
  .sheet { max-width: none; }
  section { break-inside: auto; }
  .action, .band { break-inside: avoid; }
  @page { margin: 14mm; }
}
"""


def band_class(index: float) -> str:
    if index >= 66:
        return "strong"
    if index >= 54:
        return "watch"
    return "priority"


ARROW = {"improving": "▲", "slipping": "▼", "steady": "▬", "new": "•"}


def render_bands(p):
    out = []
    for b in p["perception"]["bands"]:
        delta = (
            f'<span class="dir {e(b["direction"])}">{ARROW[b["direction"]]} '
            f'{"+" if (b["delta"] or 0) > 0 else ""}{b["delta"]} pts</span>'
            if b["delta"] is not None
            else f'<span class="dir new">• baseline</span>'
        )
        subs = "".join(
            f'<span class="pill">{e(c["name"])} <i>{c["index"]}</i>'
            + (
                f'<span class="d {"up" if c["delta"] > 0 else "down"}">'
                f'{"+" if c["delta"] > 0 else ""}{c["delta"]}</span>'
                if c["delta"] not in (None, 0)
                else ""
            )
            + "</span>"
            for c in b["constructs"]
        )
        out.append(f"""
<article class="band {band_class(b['index'])}">
  <div class="top">
    <div class="score"><div class="v">{b['index']}</div><div class="l">index</div></div>
    <div class="who">
      <h3>{e(b['name'])}</h3>
      <p class="q">&ldquo;{e(b['question'])}&rdquo;</p>
      <p class="stake">{e(b['stake'])}</p>
    </div>
  </div>
  <div class="sub-constructs">{subs}</div>
  <div class="foot">
    {delta}
    <span><b>{b['unfavourableShare']}%</b> of responses not positive</span>
    <span>weakest: <b>{e(b['weakest']['name']) if b['weakest'] else '—'}</b></span>
    <span>confidence: <b>{e(b['confidence'])}</b></span>
    <span>owner: <b>{e(OWNER_NAME.get(b['owner'], b['owner']))}</b></span>
  </div>
</article>""")
    return "".join(out)


def render_segments(p):
    rows = []
    bands = p["perception"]["bands"]
    for s in sorted(
        p["perception"]["segments"], key=lambda x: (x["suppressed"], x["worstGap"])
    ):
        if s["suppressed"]:
            rows.append(
                f'<tr class="suppressed"><td>{e(s["segment"])}</td>'
                f'<td colspan="{len(bands) + 1}">suppressed — fewer than five assessed, '
                f"shown so the absence is visible rather than silent</td></tr>"
            )
            continue
        cells = "".join(
            f'<td class="num">{s["bands"].get(b["id"], "—")}</td>' for b in bands
        )
        worst = BAND_BY_ID.get(s["worstBand"], {}).get("name", "—") if s["worstBand"] else "—"
        gap = f'<span class="neg">{s["worstGap"]}</span>' if s["worstGap"] < 0 else "—"
        rows.append(
            f'<tr><td><b>{e(s["segment"])}</b> <span class="muted">n={s["n"]}</span></td>'
            f'{cells}<td>{e(worst)} {gap}</td></tr>'
        )
    heads = "".join(f'<th class="num">{e(b["name"])}</th>' for b in bands)
    return f"""
<div class="tablewrap"><table>
  <thead><tr><th>Group</th>{heads}<th>Furthest below the organisation</th></tr></thead>
  <tbody>{''.join(rows)}</tbody>
</table></div>"""


COST_WORD = {"none": "no budget", "low": "low", "medium": "medium", "high": "high"}
EFFORT_WORD = {"hours": "hours", "days": "a few days", "weeks": "weeks"}


def render_actions(p):
    out = []
    for a in p["actions"]:
        cls = "now" if a["class"] == "immediate" else "prog"
        tag = "Start inside 30 days" if a["class"] == "immediate" else "Facilitated programme"
        out.append(f"""
<article class="action {cls}">
  <span class="tag">{tag}</span>
  <h3>{e(a['title'])}</h3>
  <p class="detail">{e(a['detail'])}</p>
  <p class="because"><b>Because:</b> {e(a['becauseOf'])} <span class="muted">
    ({e(a['constructName'])} · {a['affectedShare']}% of participants affected · {e(a['confidence'])} confidence)</span></p>
  <div class="grid4">
    <div><b>Owner</b><span>{e(a['ownerName'])}</span></div>
    <div><b>Approved by</b><span>{e(a['approver'])}</span></div>
    <div><b>Effort / cost</b><span>{EFFORT_WORD[a['effort']]} · {COST_WORD[a['cost']]}</span></div>
    <div><b>Expected move</b><span>{e(a['expectedMove'])}</span></div>
  </div>
  <div class="instead"><b>Measured by:</b> {e(a['measure'])}<br><b>Not:</b> {e(a['insteadOf'])}</div>
</article>""")
    return "".join(out)


def render_audiences():
    rows = "".join(
        f'<tr><td><b>{e(a["name"])}</b></td><td>{e(a["reads"])}</td>'
        f'<td>{e(a["decides"])}</td><td class="muted">{e(a["neverSees"])}</td></tr>'
        for a in D["audiences"]
    )
    return f"""
<div class="tablewrap"><table>
  <thead><tr><th>Who</th><th>Opens it for</th><th>Is accountable for</th><th>Never sees</th></tr></thead>
  <tbody>{rows}</tbody>
</table></div>"""


def render_movers(p):
    m = p["perception"]["movers"]
    if not m:
        return (
            '<p class="say">Nothing has moved more than 2.5 index points against the '
            "previous measurement. At this sample size that is reported as steady rather "
            "than dressed up as progress.</p>"
        )
    rows = "".join(
        f'<tr><td><b>{e(x["name"])}</b></td>'
        f'<td class="num"><span class="{"" if x["delta"] > 0 else "neg"}">'
        f'{"+" if x["delta"] > 0 else ""}{x["delta"]}</span></td>'
        f'<td>{e(x["direction"])}</td></tr>'
        for x in m
    )
    return f"""
<div class="tablewrap"><table>
  <thead><tr><th>Construct</th><th class="num">Change</th><th>Direction</th></tr></thead>
  <tbody>{rows}</tbody>
</table></div>"""


def render_wave(wave_id):
    p = D["profiles"][wave_id]
    part = p["participation"]
    prio = p["priorities"][0] if p["priorities"] else None
    top_gap = max(
        (g for g in p["gaps"] if not g["suppressed"]),
        key=lambda g: abs(g["gap"]),
        default=None,
    )
    gap_line = (
        f'On <b>{e(top_gap["constructName"].lower())}</b>, people who manage people rate this '
        f'organisation <b>{abs(top_gap["gap"])} points {"higher" if top_gap["gap"] > 0 else "lower"}</b> '
        f"than the people who report to them. That distance is itself the finding: it is the "
        f"measure of how much of what is happening below is reaching the people deciding above."
        if top_gap
        else "Insufficient evidence to report a leader–staff gap at this wave."
    )
    return f"""
<div class="wave" data-wave="{e(wave_id)}" {'' if wave_id == 'baseline' else 'hidden'}>
  <div class="pad">

    <section>
      <div class="sechead"><span class="n">1</span><h2>What the data says</h2>
        <small>derived from {part['completed']} assessments, not written by hand</small></div>
      <p class="headline">{e(p['perception']['headline'])}</p>
      <p class="say">{gap_line}</p>
    </section>

    <section>
      <div class="sechead"><span class="n">2</span><h2>How people see this organisation</h2>
        <small>three bands, never summed</small></div>
      <p class="say">There is no single engagement score here, and that is deliberate. A company can be
        strong on delivery and unsafe to speak in; averaging those two produces a number that moves two
        points a year and tells nobody what to do. Each band has its own owner and its own fix.</p>
      {render_bands(p)}
    </section>

    <section>
      <div class="sechead"><span class="n">3</span><h2>Where it is concentrated</h2>
        <small>no group under five is ever displayed</small></div>
      <p class="say">An organisation-level number is an average of very different experiences. This is
        the part that tells a department head whether the problem is theirs.</p>
      {render_segments(p)}
    </section>

    <section>
      <div class="sechead"><span class="n">4</span><h2>Do this first</h2>
        <small>owner, cost and measure attached to each</small></div>
      <p class="say">The first three need no programme, no budget line and no external facilitator —
        management can start them this month. They are listed first because a company that acts on
        something within 30 days of asking is a company whose next measurement means something.</p>
      {render_actions(p)}
    </section>

    <section>
      <div class="sechead"><span class="n">5</span><h2>Has it moved</h2>
        <small>against the previous measurement</small></div>
      {render_movers(p)}
    </section>

  </div>
</div>"""


BODY = f"""
<div class="sheet">
  <header class="mast">
    <div class="brandline">
      <span>MIROME Team Intelligence</span><span>·</span><span>Executive Brief</span>
    </div>
    <h1>{e(D['organisation'])} — what your people are telling you</h1>
    <p class="sub">{e(D['orgContext'])}</p>
    <div class="meta">
      <div><b>Assessed</b>{D['profiles']['baseline']['participation']['completed']} of
        {D['profiles']['baseline']['participation']['invited']} invited
        ({D['profiles']['baseline']['participation']['completionRate']}%)</div>
      <div><b>Method</b>Confidential digital-human interview + 10-item pulse + 2 scenarios</div>
      <div><b>Routed to a reviewer</b>{D['profiles']['baseline']['participation']['humanReview']} sessions</div>
      <div><b>Read time</b>About ten minutes</div>
    </div>
    <div class="waves" id="waves">
      {''.join(f'<button data-w="{e(w["id"])}" aria-pressed="{"true" if w["id"] == "baseline" else "false"}">{e(w["label"])}</button>' for w in D['waves'])}
    </div>
  </header>

  {''.join(render_wave(w['id']) for w in D['waves'])}

  <div class="pad">
    <section>
      <div class="sechead"><span class="n">6</span><h2>Who should look at this</h2>
        <small>and what each of them is accountable for</small></div>
      <p class="say">The usual failure of an engagement platform is that the report goes to HR, HR
        forwards it to everyone, nobody owns a decision, and next cycle's participation drops because
        staff saw nothing change. Access here is scoped to a decision each person can actually take.</p>
      {render_audiences()}
    </section>

    <section>
      <div class="sechead"><span class="n">7</span><h2>What this cannot tell you</h2>
        <small>stated, not buried</small></div>
      <p class="say">Every limit below is enforced in the pipeline, not promised in a policy document.
        Participants are shown the same list before they consent — which is a large part of why the
        answers are worth reading.</p>
      <ul class="limits">
        {''.join(f'<li><span>{e(l)}</span></li>' for l in D['profiles']['baseline']['perception']['limits'])}
        <li><span>Accent, grammar, fluency, appearance and connection quality are excluded from every
          score. A participant is never marked down for how they speak.</span></li>
      </ul>
    </section>
  </div>

  <div class="foot-note">
    <b>Prototype with synthetic data for a fictional client.</b> Every figure on this page is produced by
    the same scoring pipeline that runs in production — {D['profiles']['baseline']['participation']['completed']}
    synthetic transcripts through the Team Intelligence Framework — so the shape, the confidence bands and
    the suppression rules are real even though the organisation is not. The interviewer is a disclosed AI.
    No individual report is produced from any session, and no score on this page belongs to a named person.
    <br><br>
    <b>BYOND Asia</b> · MIROME Team Intelligence · Diagnose the team before designing the intervention.
  </div>
</div>

<script>
const waveBtns = document.querySelectorAll("#waves button");
waveBtns.forEach((b) =>
  b.addEventListener("click", () => {{
    waveBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    document.querySelectorAll(".wave").forEach((w) => {{
      w.hidden = w.dataset.wave !== b.dataset.w;
    }});
    window.scrollTo({{ top: 0, behavior: "smooth" }});
  }})
);
</script>
"""

DOC = (
    "<title>MIROME — Executive Brief</title>\n\n<style>"
    + STYLE
    + "</style>\n"
    + BODY
)
OUT.write_text(DOC)
print(f"{OUT.name} {round(len(DOC) / 1024)} kb")
