# AUREN prototype checks

Browser-driven checks for `public/prototypes/auren-rehearsal.html`. They need
Playwright and a Chromium binary; both are present in the Claude Code web
environment, so these run there without setup:

```bash
node tests/auren-cues.js          # satisfaction rules evaluate per language
node tests/auren-languages.js     # full loop to a sealed record in EN/ES/ZH/AR
node tests/auren-cancellation.js  # abandoning the loop cannot bleed into the next one
```

## What each one defends

**`auren-cues.js`** — asserts that a competent answer evaluates as
`demonstrated` and the scripted answer as `failed`, in every language. This is
the check that catches the worst localisation failure mode: ship English cues
only, and the UI looks perfectly translated while every non-English learner is
scored as failing. Exits non-zero on mismatch.

**`auren-languages.js`** — drives the loop end to end in each language, and
checks that Arabic gets `dir="rtl"` and that no English chrome survives a
language switch.

**`auren-cancellation.js`** — abandons the loop at DIAGNOSE, STRESS and COACH
via the PROTECT control, then starts a new session in a different language, and
asserts nothing from the abandoned run survives. Also asserts that Exit
Simulation mid-challenge still reaches COACH in the session language.

The loop is a chain of awaited turns, so leaving it mid-flight does not unwind
that chain. Without the generation token in the session model, the abandoned
run keeps resolving — writing captions, rendering coach beats and binding
signatures in the language it started in — while the new session paints the new
language. Exits non-zero if any case leaks.
