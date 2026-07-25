"""Split the combined prototype into two focused, mobile-first pages."""
import json
import re
import pathlib

SRC = pathlib.Path("/home/user/dengar/mirome/public/prototypes/mirome-demo.html")
OUT = SRC.parent
src = SRC.read_text()

# ---------------------------------------------------------------- slice HTML
style = src[src.index("<style>"): src.index("</style>") + len("</style>")]
dash_html = src[src.index("<!-- ============================================================ DASHBOARD -->"):
                src.index("<!-- ============================================================ EXPERIENCE -->")]
exp_html = src[src.index("<!-- ============================================================ EXPERIENCE -->"):
               src.index("<!-- ============================================================ PACK -->")]
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
exp_js = block("Participant experience", "Facilitator pack")
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

MOBILE_EXP = """
.pageframe { display: flex; flex-direction: column; min-height: 100dvh; }
#view-experience { flex: 1; display: flex; min-height: 0; }
/* The portal is already a phone UI — on a phone it should BE the page, not a
   mock of a phone inside a phone. The device frame is a desktop affordance. */
.stage { flex: 1; min-height: 0; padding: 22px 16px 34px; }
.phone { height: min(860px, calc(100dvh - 120px)); }
@media (max-width: 640px) {
  .stage { padding: 0; min-height: 0; }
  .phone { max-width: none; height: 100%; border-radius: 0; box-shadow: none; }
  .sheet h1 { font-size: 24px; }
  .formwrap { padding: 54px 16px 24px; }
  .pbrand { grid-template-columns: 1fr auto; }
  .pbrand .b { grid-column: 2; font-size: 9px; }
}
/* Keep the interviewer panel from competing with a screen that has its own
   content — it only carries meaning on the landing and session screens. */
.phone:not([data-screen="landing"]):not([data-screen="session"]) .avatarslot { opacity: 0.12; }
.pscreen[data-screen="lobby"] { background: rgba(12, 15, 26, 0.55); backdrop-filter: blur(4px); }
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

# ---------------------------------------------------------------- interview
exp_data = {
    "climateSpecs": DATA["climateSpecs"],
    "scenarios": DATA["scenarios"],
}
exp_bar = """
<div class="pagebar">
  <b>MIROME participant assessment</b>
  <span class="sep">·</span>
  <span class="long">Prototype of the confidential 15-minute session. Tap through it as an employee would; the digital-human video stream is the one thing a static page cannot carry.</span>
  <span class="short">Prototype · tap through it as an employee would</span>
</div>
"""
exp_html_solo = exp_html.replace(
    '<section class="view" id="view-experience">', '<section id="view-experience">'
)
# the "see where this data lands" jump belongs to the combined page only
exp_html_solo = re.sub(
    r'\s*<button class="pbtn" data-jump="dashboard">[^<]*</button>', "", exp_html_solo
)

exp_js_solo = exp_js.replace(
    'document.querySelectorAll(".pscreen").forEach((s) => s.classList.toggle("on", s.dataset.screen === id));',
    'document.querySelectorAll(".pscreen").forEach((s) => s.classList.toggle("on", s.dataset.screen === id));\n  $("phone").dataset.screen = id;',
)
exp_js_solo = exp_js_solo.replace(
    'const VEILED = new Set(["consent", "context", "pulse", "reflect", "confirm", "done"]);',
    'const VEILED = new Set(["consent", "context", "pulse", "lobby", "reflect", "confirm", "done"]);',
)

exp_doc = (
    "<title>MIROME — participant assessment session</title>\n\n"
    + style.replace("</style>", MOBILE_SHARED + MOBILE_EXP + "</style>")
    + "\n"
    + '<div class="pageframe">'
    + exp_bar
    + "\n"
    + exp_html_solo
    + "</div>"
    + '\n<div class="toast" id="toast"></div>\n'
    + "<script>\nconst DATA = "
    + json.dumps(exp_data)
    + ";\n"
    + helpers
    + exp_js_solo
    + "\n/* boot */\nrenderPulse();\n$(\"phone\").dataset.screen = \"landing\";\n</script>\n"
)
(OUT / "mirome-interview.html").write_text(exp_doc)

print("dashboard", round(len(dash_doc) / 1024), "kb")
print("interview", round(len(exp_doc) / 1024), "kb")
