const { chromium } = require('playwright');
const HAN = /[一-鿿]/;

async function drive(p, turns) {
  for (let i=0;i<turns;i++){
    const armed = await p.evaluate(()=>!document.getElementById('micBtn').disabled);
    if(armed){ await p.dispatchEvent('#micBtn','pointerdown'); await p.waitForTimeout(190); await p.dispatchEvent('#micBtn','pointerup'); }
    await p.waitForTimeout(700);
  }
}
async function snap(p){
  return p.evaluate(()=>({
    lang:S.lang, gen:S.gen,
    caption:(document.getElementById('capTxt').textContent||''),
    coach:(document.getElementById('slotCoach').textContent||''),
    prop:(document.getElementById('slotProp').textContent||''),
    mic:document.getElementById('micLbl').textContent,
    sigs:S.signatures.map(x=>x.quote),
  }));
}
function leaked(s){
  return HAN.test(s.coach) || HAN.test(s.prop) || HAN.test(s.caption) || s.sigs.some(q=>HAN.test(q));
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const url = 'file:///home/user/dengar/public/prototypes/auren-rehearsal.html';
  let fails = 0;

  const cases = [
    ['PROTECT mid-DIAGNOSE, then Arabic', 4, async (p)=>{ await p.click('#protBtn'); await p.waitForTimeout(500); await p.click('#pBack'); }],
    ['PROTECT mid-STRESS, then Arabic',   7, async (p)=>{ await p.click('#protBtn'); await p.waitForTimeout(500); await p.click('#pBack'); }],
    ['PROTECT mid-COACH, then Arabic',   11, async (p)=>{ await p.click('#protBtn'); await p.waitForTimeout(500); await p.click('#pBack'); }],
  ];

  for (const [name, turns, bail] of cases) {
    const p = await (await b.newContext({viewport:{width:430,height:860}})).newPage();
    const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto(url); await p.waitForTimeout(500);
    await p.click('#langRow .langc[data-l="ZH"]');
    await p.click('#beginBtn'); await p.waitForTimeout(200);
    await p.click('#startBtn'); await p.waitForTimeout(1400);
    await drive(p, turns);
    const stateAt = await p.textContent('#pState');
    await bail(p); await p.waitForTimeout(500);
    await p.click('#langRow .langc[data-l="AR"]'); await p.waitForTimeout(200);
    await p.click('#beginBtn'); await p.waitForTimeout(200);
    await p.click('#startBtn'); await p.waitForTimeout(3000);
    const s = await snap(p);
    const bad = leaked(s) || errs.length;
    if (bad) fails++;
    console.log(`${bad?'FAIL':'ok  '}  ${name}  (abandoned at ${stateAt}, gen=${s.gen})`);
    if (bad) console.log('       ', JSON.stringify({coach:s.coach.slice(0,50), sigs:s.sigs.slice(0,2), errs}));
    await p.context().close();
  }

  // Exit Simulation mid-challenge must still reach COACH, and stay in language.
  {
    const p = await (await b.newContext({viewport:{width:430,height:860}})).newPage();
    const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto(url); await p.waitForTimeout(500);
    await p.click('#langRow .langc[data-l="ES"]');
    await p.click('#beginBtn'); await p.waitForTimeout(200);
    await p.click('#startBtn'); await p.waitForTimeout(1400);
    await drive(p, 7);
    await p.click('#exitBtn'); await p.waitForTimeout(4500);
    const st = await p.textContent('#pState');
    const s = await snap(p);
    const bad = st !== 'S6' || HAN.test(s.coach+s.caption) || errs.length;
    if (bad) fails++;
    console.log(`${bad?'FAIL':'ok  '}  Exit Simulation mid-STRESS reaches COACH in Spanish (state=${st})`);
    if (bad) console.log('       ', JSON.stringify({caption:s.caption.slice(0,60), errs}));
    await p.context().close();
  }

  console.log(fails ? `\n${fails} case(s) failing` : '\nAll cancellation cases pass.');
  await b.close();
  process.exit(fails?1:0);
})();
