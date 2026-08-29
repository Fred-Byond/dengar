const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext()).newPage();
  await p.goto('file:///home/user/dengar/public/prototypes/auren-rehearsal.html');
  await p.waitForTimeout(500);

  // A competent answer to Q-VER-002 in each language must evaluate as
  // demonstrated; the scripted failing answer must evaluate as failed.
  const cases = {
    EN: { pass: "I looked the firm up on the regulator's public register myself.",
          fail: "Their website says they're regulated, and it looks professional." },
    ES: { pass: "Busqué la empresa en el registro oficial del regulador por mi cuenta.",
          fail: "Su página web dice que están regulados, y parece profesional." },
    ZH: { pass: "我自己去监管机构的官方名录上查了这家公司。",
          fail: "他们网站上说自己受监管，看起来挺专业的。" },
    AR: { pass: "بحثت عن الشركة في السجل الرسمي للجهة الرقابية بنفسي.",
          fail: "موقعهم يقول إنهم مرخّصون، ويبدو احترافيًا." },
  };

  const out = await p.evaluate((cases) => {
    const q = L.questions[0];              // Q-VER-002
    const r = {};
    for (const code of Object.keys(cases)) {
      S.lang = code;
      r[code] = {
        pass: evaluate(q, cases[code].pass),
        fail: evaluate(q, cases[code].fail),
        resistPass: resisted(cases[code].pass),
      };
    }
    return r;
  }, cases);

  let ok = true;
  for (const [code, v] of Object.entries(out)) {
    const good = v.pass === 'demonstrated' && v.fail === 'failed' && v.resistPass === true;
    if (!good) ok = false;
    console.log(`${code}: competent="${v.pass}"  scripted="${v.fail}"  resistance=${v.resistPass}  ${good ? 'OK' : '*** FAIL ***'}`);
  }
  console.log(ok ? '\nAll four languages evaluate correctly.' : '\nCUE MISMATCH — a variant would silently fail every element.');
  await b.close();
  process.exit(ok ? 0 : 1);
})();
