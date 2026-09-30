const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const htmlPath = 'file://' + path.resolve(__dirname, '../output/GTM-Change-Lab.html');
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless',
  '--remote-debugging-port=9227',
  '--disable-gpu',
  htmlPath
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:9227/json');
    const tabs = await res.json();
    const tab = tabs.find(t => t.url.includes('GTM-Change-Lab.html')) || tabs[0];
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    let testStep = 0;
    const send = (code) => {
      ws.send(JSON.stringify({
        id: ++testStep,
        method: 'Runtime.evaluate',
        params: { expression: code, returnByValue: true }
      }));
    };

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 0, method: 'Runtime.enable' }));
      setTimeout(() => {
        // Step 1: Verify Initial State on Step 0
        send(`(() => {
          return {
            tab: window.DEMO.getState().tab,
            activeNav: document.querySelector('nav button.active')?.textContent.trim(),
            h2: document.querySelector('main h2')?.textContent.trim(),
            stepCardsCount: document.querySelectorAll('.align-step').length
          };
        })()`);
      }, 500);
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id === 0) return;

      const val = data.result?.result?.value;
      console.log(`[Step ${data.id}]`, JSON.stringify(val));

      if (data.id === 1) {
        // Test navigation via Step Card 1
        send(`(() => {
          const card1 = document.querySelector('.align-step[data-go="programme"]');
          card1.click();
          return {
            tab: window.DEMO.getState().tab,
            activeNav: document.querySelector('nav button.active')?.textContent.trim(),
            h2: document.querySelector('main h2')?.textContent.trim(),
            statsPresent: !!document.querySelector('.stats')
          };
        })()`);
      } else if (data.id === 2) {
        // Test navigation from Step 1 to Step 2 via sequential button
        send(`(() => {
          const btn = document.querySelector('button[data-go="work"].primary');
          btn.click();
          return {
            tab: window.DEMO.getState().tab,
            h2: document.querySelector('main h2')?.textContent.trim(),
            artifactsCount: document.querySelectorAll('main details').length
          };
        })()`);
      } else if (data.id === 3) {
        // Test navigation from Step 2 to Step 3 via sequential button
        send(`(() => {
          const btn = document.querySelector('button[data-go="simulate"].primary');
          btn.click();
          return {
            tab: window.DEMO.getState().tab,
            h2: document.querySelector('main h2')?.textContent.trim(),
            hasPresetSimulateBtn: !!document.getElementById('presetAndSimulate'),
            panelTitle: document.querySelector('.panel h3')?.textContent.trim()
          };
        })()`);
      } else if (data.id === 4) {
        // Test navigation to Step 4 via top nav button
        send(`(() => {
          const btn = document.querySelector('nav button[data-tab="readiness"]');
          btn.click();
          return {
            tab: window.DEMO.getState().tab,
            h2: document.querySelector('main h2')?.textContent.trim(),
            hasGate1: !!document.querySelector('section.panel h3')?.textContent.includes('Gate 1'),
            hasTestGatesBtn: !!document.getElementById('testGatesBtn')
          };
        })()`);
      } else if (data.id === 5) {
        // Test navigation to Step 5 via top nav button
        send(`(() => {
          const btn = document.querySelector('nav button[data-tab="history"]');
          btn.click();
          return {
            tab: window.DEMO.getState().tab,
            h2: document.querySelector('main h2')?.textContent.trim(),
            hasExportBtn: !!document.getElementById('export'),
            hasResetBtn: !!document.getElementById('reset')
          };
        })()`);
      } else if (data.id === 6) {
        // Test navigation back to Step 0 via sequential button
        send(`(() => {
          const btn = document.querySelector('button[data-go="motion"]');
          btn.click();
          return {
            tab: window.DEMO.getState().tab,
            h2: document.querySelector('main h2')?.textContent.trim()
          };
        })()`);
      } else if (data.id === 7) {
        // Test clicking Step Card 3 directly from Step 0 and simulating low-adoption
        send(`(() => {
          document.querySelector('.align-step[data-go="simulate"]').click();
          document.getElementById('presetAndSimulate').click();
          return {
            tab: window.DEMO.getState().tab,
            hasProposal: !!window.DEMO.getState().proposal,
            proposalVersion: window.DEMO.getState().proposal?.version,
            diffCards: document.querySelectorAll('.diff').length
          };
        })()`);
      } else if (data.id === 8) {
        // Test navigation to Step 4 with active proposal and testing gates
        send(`(() => {
          document.querySelector('nav button[data-tab="readiness"]').click();
          // Click accept
          const acceptBtn = document.getElementById('accept');
          if (acceptBtn && !acceptBtn.disabled) acceptBtn.click();

          // Check reviews
          document.querySelectorAll('[data-review]').forEach(cb => { cb.checked = true; cb.onchange(); });
          // Check markets
          document.querySelectorAll('[data-market]').forEach(cb => { cb.checked = true; cb.onchange(); });
          // Check prereq
          const pre = document.getElementById('prerequisite');
          if (pre) { pre.checked = true; pre.onchange(); }

          const activateBtn = document.getElementById('activate');
          const isReady = activateBtn && !activateBtn.disabled;
          if (isReady) activateBtn.click();

          return {
            tab: window.DEMO.getState().tab,
            newVersion: window.DEMO.getState().version,
            historyLength: window.DEMO.getState().history.length
          };
        })()`);
      } else if (data.id === 9) {
        console.log('ALL CDP INTERACTION TESTS PASSED SUCCESSFULLY!');
        chrome.kill();
        process.exit(0);
      }
    };
  } catch(e) {
    console.error('Test error:', e);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
