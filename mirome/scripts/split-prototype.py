"""Generate the dashboard prototype from the combined source.

The participant interview page is NO LONGER generated here — it was rebuilt by
hand as a light-theme, six-language journey (public/prototypes/mirome-interview.html)
and this script must not overwrite it.
"""
import json
import pathlib

SRC = pathlib.Path("/home/user/dengar/mirome/public/prototypes/mirome-demo.html")
OUT = SRC.parent
src = SRC.read_text()

# ---------------------------------------------------------------- slice HTML
style = src[src.index("<style>"): src.index("</style>") + len("</style>")]
dash_html = src[src.index("<!-- ============================================================ DASHBOARD -->"):
                src.index("<!-- ============================================================ EXPERIENCE -->")]
pack_html = src[src.index("<!-- ============================================================ PACK -->"):
                src.index("<!-- modals -->")]
modals_html = src[src.index("<!-- modals -->"): src.index("<script>")]

script = src[src.index("<script>") + len("<script>"): src.rindex("</script>")]
data_line_end = script.index("\n", script.index("const DATA ="))
data_json = script[script.index("const DATA =") + len("const DATA ="): data_line_end].strip().rstrip(";")

def block(name, nxt):
    a = script.rindex("/* ====", 0, script.index("   " + name + "\n   ============"))
    if nxt:
        b = script.rindex("/* ====", 0, script.index("   " + nxt + "\n   ============"))
    else:
        b = script.index("/* boot */")
    assert b > a, name
    return script[a:b]

helpers = block("Shared helpers", "Shell navigation")
dash_js = block("Dashboard", "Participant experience")
pack_js = block("Facilitator pack", None)

DATA = json.loads(data_json)

# ---------------------------------------------------------------- shared css
MOBILE_SHARED = """
/* ---------- focused-page overrides ---------- */
.pagebar {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 14px;
  padding: 10px 22px;
  background: var(--shell-panel);
  border-bottom: 1px solid var(--shell-line);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--shell-grey);
  line-height: 1.45;
}
.pagebar b { color: var(--shell-ink); font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; font-size: 11px; }
.pagebar .sep { opacity: 0.4; }
.pagebar .short { display: none; }
@media (max-width: 640px) {
  .pagebar .long { display: none; }
  .pagebar .short { display: inline; }
}
"""

MOBILE_DASH = """
.apphead { top: 0; }
/* Grid/flex children default to min-width:auto, so the 860px-wide matrix table
   was widening its whole column instead of scrolling inside its own box. */
.grid-main > *, .grid-3 > *, .grid-2 > *, .col > * { min-width: 0; }
.matrixwrap { max-width: 100%; }
@media (max-width: 760px) {
  .pagebar { padding: 9px 14px; }
  .apphead { padding: 12px 14px; gap: 10px; }
  .apptitle { padding-left: 0; border-left: 0; }
  .apptitle h1 { font-size: 16px; }
  .appright { width: 100%; gap: 8px; }
  .seg { width: 100%; }
  .seg button { flex: 1; padding: 8px 6px; font-size: 11.5px; }
  .btn-track, .btn-pack { flex: 1; font-size: 11.5px; padding: 10px 8px; }
  .scopebar { padding: 10px 14px 0; }
  .viewnote { margin-left: 0; }
  .wrap { padding: 12px 14px 30px; gap: 14px; }
  .kpis { gap: 10px; }
  .kpi { padding: 13px 14px; }
  .kpi .val { font-size: 24px; }
  .card { padding: 15px 15px; }
  .cmd { grid-template-columns: 1fr 1fr; row-gap: 14px; }
  .cmd .acts { grid-column: 1 / -1; }
  .cmd .acts button { flex: 1; }
  .crow { gap: 8px; padding: 11px 0; }
  .crow .nm { width: 100%; }
  .crow .bar { min-width: 90px; }
  .crow .val, .crow .n { width: auto; }
  .prio .nm { font-size: 12.5px; }
  .mcard { padding: 20px 18px; }
  .mfoot button { min-width: 0; }
  .pack { padding: 26px 18px; }
  .pack h1 { font-size: 24px; }
  .stats { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 460px) {
  .kpis { grid-template-columns: 1fr; }
}
"""

# ---------------------------------------------------------------- dashboard
dash_bar = """
<div class="pagebar">
  <b>MIROME Team Intelligence</b>
  <span class="sep">·</span>
  <span class="long">Prototype. Every figure comes from the real scoring pipeline run over 82 synthetic participant transcripts — nothing here is hand-written.</span>
  <span class="short">Prototype · real pipeline output, 82 synthetic transcripts</span>
</div>
"""

pack_back = """<div class="packwrap"><div style="max-width:900px;margin:0 auto 14px">
  <button class="btn-pack" id="packBack" style="background:#fff;color:var(--indigo);border:1px solid var(--line)">← Back to the dashboard</button>
</div><article class="pack" id="packBody"></article></div>"""

pack_html_dash = pack_html.replace(
    '<div class="packwrap"><article class="pack" id="packBody"></article></div>', pack_back
)

dash_nav_js = """
/* ============================================================
   Dashboard ⇄ facilitator pack
   ============================================================ */
function showView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("on", v.id === "view-" + name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$("btnPack").addEventListener("click", () => showView("pack"));
$("packBack").addEventListener("click", () => showView("dashboard"));
"""

dash_doc = (
    "<title>MIROME Team Intelligence — dashboard</title>\n\n"
    + style.replace("</style>", MOBILE_SHARED + MOBILE_DASH + "</style>")
    + "\n"
    + dash_bar
    + "\n"
    + dash_html
    + pack_html_dash
    + "\n"
    + modals_html
    + "<script>\nconst DATA = "
    + json.dumps(DATA)
    + ";\n"
    + helpers
    + dash_nav_js
    + dash_js
    + pack_js
    + "\n/* boot */\nrenderDashboard();\nrenderPack();\n</script>\n"
)
(OUT / "mirome-dashboard.html").write_text(dash_doc)
print("dashboard", round(len(dash_doc) / 1024), "kb")
