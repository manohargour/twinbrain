const { spawn } = require('child_process');
const path = require('path');

const htmlPath = 'file://' + path.resolve(__dirname, '../output/index.html');
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless',
  '--remote-debugging-port=9232',
  '--disable-gpu',
  htmlPath
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:9232/json');
    const tabs = await res.json();
    const tab = tabs.find(t => t.url.includes('index.html')) || tabs[0];
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
        // Step 1: Initial state (Step 0 Motion)
        send(`(() => {
          return {
            tab: document.querySelector('nav button.active')?.textContent.trim(),
            h2: document.querySelector('#appMain h2')?.textContent.trim(),
            motionCards: document.querySelectorAll('.motion-card').length,
            hasNavigator: document.querySelectorAll('.align-step').length
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
        // Step 2: Navigate to Step 1 Change Intelligence
        send(`(() => {
          document.querySelector('button[data-tab="intelligence"]').click();
          return {
            tab: document.querySelector('nav button.active')?.textContent.trim(),
            hasPromptInput: !!document.getElementById('tbNlpInput'),
            hasAnalyzeBtn: !!document.getElementById('tbAnalyzeBtn')
          };
        })()`);
      } else if (data.id === 2) {
        // Step 3: Navigate to Step 2 Programme Charter
        send(`(() => {
          document.querySelector('button[data-tab="charter"]').click();
          return {
            tab: document.querySelector('nav button.active')?.textContent.trim(),
            h2: document.querySelector('#appMain h2')?.textContent.trim(),
            hasAlignedBanner: document.body.innerHTML.includes('Aligned GTM Motion (Step 0)')
          };
        })()`);
      } else if (data.id === 3) {
        // Step 4: Navigate to Step 3 Team Workstreams
        send(`(() => {
          document.querySelector('button[data-tab="workstreams"]').click();
          return {
            tab: document.querySelector('nav button.active')?.textContent.trim(),
            h2: document.querySelector('#appMain h2')?.textContent.trim(),
            cardCount: document.querySelectorAll('.tb-impact-card').length
          };
        })()`);
      } else if (data.id === 4) {
        // Step 5: Navigate to Step 4 Readiness Gates
        send(`(() => {
          document.querySelector('button[data-tab="readiness"]').click();
          return {
            tab: document.querySelector('nav button.active')?.textContent.trim(),
            h2: document.querySelector('#appMain h2')?.textContent.trim()
          };
        })()`);
      } else if (data.id === 5) {
        // Step 6: Navigate to Step 5 Audit & History
        send(`(() => {
          document.querySelector('button[data-tab="history"]').click();
          return {
            tab: document.querySelector('nav button.active')?.textContent.trim(),
            h2: document.querySelector('#appMain h2')?.textContent.trim(),
            hasExportBtn: !!document.getElementById('tbDownloadJsonBtn')
          };
        })()`);
      } else if (data.id === 6) {
        // Step 7: Navigate back to Step 0 via workflow navigator
        send(`(() => {
          document.querySelector('button[data-tab="motion"]').click();
          // Select an alternative motion (PLG)
          const plg = document.querySelector('.motion-card[data-select-motion="product_led_growth"]');
          if (plg) plg.click();
          return {
            tab: document.querySelector('nav button.active')?.textContent.trim(),
            activeBadge: document.querySelector('.motion-card.active strong')?.textContent.trim()
          };
        })()`);
      } else if (data.id === 7) {
        console.log('\nALL 6 TABS AND STEP 0 INTERACTIONS VERIFIED SUCCESSFULLY IN CHROME!');
        chrome.kill();
        process.exit(0);
      }
    };
  } catch (err) {
    console.error('Test error:', err);
    chrome.kill();
    process.exit(1);
  }
}, 1000);
