# مسموع · Masmou.ai — UAE

**Every voice heard · كل صوت مسموع**

The UAE deployment of BYOND Asia's national citizen-listening platform, customised for the
**Ministry of Communications, United Arab Emirates**. Same engine and concept as the Malaysian
deployment (`Fred-Byond/dengar`), reconfigured as a deployment profile:

| | Malaysia (DENGAR.ai) | UAE (Masmou.ai) |
|---|---|---|
| Client | Prime Minister's Office / KDN | Ministry of Communications |
| Geography | 16 states → districts | 7 emirates → districts |
| Languages | BM / EN (+3 session languages) | **Arabic-first with full RTL** / EN (+7 session languages) |
| Identity | MyKad / OTP | Emirates ID / UAE Pass (session OTP in demo) |
| Design system | MADANI navy & gold | **UAE flag palette** — red `#CE1126`, green `#007A3D`, white, black |
| Taxonomy | National / Home Affairs topics | MoC portfolio: telecom & internet quality, cybersecurity & fraud, pricing, digital government, digital inclusion, remote coverage, media, postal, AI |

## Prototypes

Both are single-file, dependency-free HTML — open directly in a browser.

- **`prototypes/masmou-dashboard.html`** — *Masmou Intelligence*: the Minister's national
  listening dashboard. Stylised UAE map coloured by sentiment per emirate with district
  drill-down, ministry-priority tracker, concern deep-dives, trending Arabic keywords,
  session-language mix (Arabic, English, Hindi, Urdu, Filipino, Mandarin, Russian),
  Minister ↔ Delivery Unit role views, directive issue/track/close, weekly Minister's brief.
- **`prototypes/masmou-citizen.html`** — *Speak to the Minister* (تحدث مع الوزير): the
  citizen/resident phone experience. Book → register (emirate/district/language/topic) →
  OTP → session with the Minister's digital human → reflected closing summary, `MSM-…`
  reference number and the "voice number N" counter.

**Localisation:** Arabic is the default UI (`dir="rtl"`); the EN toggle flips the full layout
to LTR. All data keys stay in English internally — language changes display only, never
routing. The map never mirrors (geography stays geographic inside an LTR island).

**Governance posture (inherited from the platform):** sessions anonymised in analytics,
no citizen data used to train any AI model, UAE data residency, final authority human.

Demo prototypes use synthetic data throughout.

---
BYOND Asia · Powered by HoloMe · masmou.ai
