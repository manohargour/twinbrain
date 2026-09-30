const http = require('http');
const assert = require('assert/strict');
const { spawn } = require('child_process');

async function testHeadless() {
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9333',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=/tmp/chrome-test-step0'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9333/json/list', res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });

  const pageWs = list[0].webSocketDebuggerUrl;
  const ws = new globalThis.WebSocket(pageWs);

  let id = 1;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
  };

  await new Promise(r => { ws.onopen = r; });

  function send(method, params = {}) {
    const curId = id++;
    return new Promise(resolve => {
      pending.set(curId, resolve);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:8080/' });
  await new Promise(r => setTimeout(r, 1000));

  // Check initial state
  const step0Check = await send('Runtime.evaluate', {
    expression: `(() => {
      const activeNav = document.querySelector('nav button.active')?.textContent.trim();
      const motions = document.querySelectorAll('.tb-impact-card');
      const activeMotion = document.querySelector('.tb-impact-card[data-switch-tab="intelligence"]');
      const stepsOverview = document.querySelectorAll('.tb-align-step');
      return {
        activeNav,
        motionCardsCount: motions.length,
        hasActiveMotion: !!activeMotion,
        stepsOverviewCount: stepsOverview.length
      };
    })()`,
    returnByValue: true
  });

  console.log('Initial Step 0 check:', step0Check.result.value);
  assert.equal(step0Check.result.value.motionCardsCount, 5, 'Must have exactly 5 GTM motions');
  assert(step0Check.result.value.hasActiveMotion, 'First motion must be active and have data-switch-tab');
  assert.equal(step0Check.result.value.stepsOverviewCount, 5, 'Must have exactly 5 steps in overview');

  // Test clicking Motion 1 -> should navigate to Step 1 (Change Intelligence)
  const clickMotion1 = await send('Runtime.evaluate', {
    expression: `(() => {
      const activeMotion = document.querySelector('.tb-impact-card[data-switch-tab="intelligence"]');
      activeMotion.click();
      return document.querySelector('nav button.active')?.textContent.trim();
    })()`,
    returnByValue: true
  });
  console.log('After clicking Motion 1, active nav:', clickMotion1.result.value);
  assert(clickMotion1.result.value.includes('Change Intelligence'), 'Should switch to Step 1');

  // Navigate back to Step 0
  await send('Runtime.evaluate', {
    expression: `document.querySelector('nav button[data-tab="motion"]').click();`
  });
  await new Promise(r => setTimeout(r, 300));

  // Test clicking Step 3 in the bottom overview -> should navigate to Step 3 (Team Workstreams)
  const clickStep3 = await send('Runtime.evaluate', {
    expression: `(() => {
      const step3 = document.querySelector('.tb-align-step[data-switch-tab="workstreams"]');
      step3.click();
      return document.querySelector('nav button.active')?.textContent.trim();
    })()`,
    returnByValue: true
  });
  console.log('After clicking Step 3 in overview, active nav:', clickStep3.result.value);
  assert(clickStep3.result.value.includes('Team Workstreams'), 'Should switch to Step 3');

  // Navigate back to Step 0 and test Step 4
  await send('Runtime.evaluate', {
    expression: `document.querySelector('nav button[data-tab="motion"]').click();`
  });
  await new Promise(r => setTimeout(r, 300));

  const clickStep4 = await send('Runtime.evaluate', {
    expression: `(() => {
      const step4 = document.querySelector('.tb-align-step[data-switch-tab="readiness"]');
      step4.click();
      return document.querySelector('nav button.active')?.textContent.trim();
    })()`,
    returnByValue: true
  });
  console.log('After clicking Step 4 in overview, active nav:', clickStep4.result.value);
  assert(clickStep4.result.value.includes('Readiness Gates'), 'Should switch to Step 4');

  console.log('\nALL SIMPLIFIED STEP 0 TESTS PASSED SUCCESSFULLY!');

  ws.close();
  chromeProc.kill();
  process.exit(0);
}

testHeadless().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
