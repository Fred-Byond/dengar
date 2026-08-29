const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const results = [];
  for (const code of ['EN','ES','ZH','AR']) {
    const ctx = await b.newContext({ viewport:{width:430,height:860}, deviceScaleFactor:2, isMobile:true, hasTouch:true });
    const p = await ctx.newPage();
    const errs=[]; p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
    p.on('console',m=>{if(m.type()==='error'&&!/ERR_CONNECTION|fonts/.test(m.text()))errs.push('CONSOLE: '+m.text());});
    await p.goto('file:///home/user/dengar/public/prototypes/auren-rehearsal.html');
    await p.waitForTimeout(700);
    await p.click(`#langRow .langc[data-l="${code}"]`);
    await p.waitForTimeout(350);
    await p.screenshot({path:`lang-${code}-landing.png`});
    const dir = await p.evaluate(()=>document.getElementById('device').getAttribute('dir'));
    await p.click('#beginBtn'); await p.waitForTimeout(300);
    await p.click('#startBtn'); await p.waitForTimeout(1800);

    let shotStress=false, shotCoach=false;
    for(let i=0;i<40;i++){
      const st = await p.textContent('#pState');
      if(st==='S5'&&!shotStress){ await p.waitForTimeout(2500); await p.screenshot({path:`lang-${code}-stress.png`}); shotStress=true; }
      if(st==='S6'&&!shotCoach){ await p.waitForTimeout(2400); await p.screenshot({path:`lang-${code}-coach.png`}); shotCoach=true; }
      const sheet = await p.evaluate(()=>!document.getElementById('sheet').classList.contains('hidden'));
      if(sheet) break;
      const armed = await p.evaluate(()=>!document.getElementById('micBtn').disabled);
      if(armed){ await p.dispatchEvent('#micBtn','pointerdown'); await p.waitForTimeout(210); await p.dispatchEvent('#micBtn','pointerup'); }
      await p.waitForTimeout(760);
    }
    await p.waitForTimeout(600);
    await p.screenshot({path:`lang-${code}-evidence.png`});
    const state = await p.textContent('#pState');
    const sigs = await p.textContent('#pSigs');
    const budget = await p.textContent('#pBudget');
    const verdict = await p.evaluate(()=>{const v=document.querySelector('.verdict');return v?v.textContent.slice(0,60):'(none)'});
    // Any English left on screen after the language switch?
    const leak = await p.evaluate(()=>{
      const txt = document.getElementById('sheet').textContent || '';
      const hits = ['Evidence chain','Rehearse your next','Failure signatures','Investor Readiness Record · sealed'].filter(k=>txt.includes(k));
      return hits;
    });
    results.push({code, dir, state, sigs, budget, verdict, leak, errs});
    await ctx.close();
  }
  for (const r of results) {
    console.log(`\n[${r.code}] dir=${r.dir} state=${r.state} sigs=${r.sigs} budget=${r.budget}`);
    console.log(`  verdict: ${r.verdict}`);
    console.log(`  english-leak: ${r.leak.length ? r.leak.join(', ') : 'none'}`);
    console.log(`  errors: ${r.errs.length ? r.errs.join(' | ') : 'none'}`);
  }
  await b.close();
})();
