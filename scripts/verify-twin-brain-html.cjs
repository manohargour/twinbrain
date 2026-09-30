const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'output/Twin-Brain.html'), 'utf8');

// Mock DOM environment for Node.js
class MockElement {
  constructor(tag = 'div', id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = '';
    this.classList = {
      add: c => { if (!this.className.includes(c)) this.className += ' ' + c; },
      remove: c => { this.className = this.className.replace(c, '').trim(); },
      toggle: (c, force) => {
        if (force === undefined) {
          if (this.className.includes(c)) this.classList.remove(c);
          else this.classList.add(c);
        } else if (force) {
          this.classList.add(c);
        } else {
          this.classList.remove(c);
        }
      }
    };
    this.innerHTML = '';
    this.value = '';
    this.checked = false;
    this.dataset = {};
    this.onclick = null;
    this.onchange = null;
  }
  querySelector(sel) {
    return new MockElement('div');
  }
  querySelectorAll(sel) {
    return [new MockElement('button'), new MockElement('button')];
  }
}

const mockDoc = {
  getElementById: (id) => new MockElement('div', id),
  querySelector: (sel) => new MockElement('div'),
  querySelectorAll: (sel) => [new MockElement('button'), new MockElement('button')],
  addEventListener: (evt, fn) => { if (evt === 'DOMContentLoaded') fn(); },
  documentElement: { scrollWidth: 1000 }
};

const sandbox = {
  window: {
    addEventListener: (evt, fn) => { if (evt === 'DOMContentLoaded') fn(); },
    scrollTo: () => {},
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    }
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  document: mockDoc,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
};
sandbox.window.document = mockDoc;

vm.createContext(sandbox);

// Extract all scripts from html and execute
const scriptMatches = [...html.matchAll(/<script(?:\s+id="([^"]+)")?>([\s\S]*?)<\/script>/g)];
console.log(`Found ${scriptMatches.length} script tags in Twin-Brain.html`);

for (const match of scriptMatches) {
  const id = match[1] || 'anonymous';
  const code = match[2];
  try {
    vm.runInContext(code, sandbox);
    console.log(`Executed script: ${id}`);
  } catch (err) {
    console.error(`Error in script ${id}:`, err);
    throw err;
  }
}

assert(sandbox.window.GTM, 'GTM engine loaded');
assert(sandbox.window.TWIN_BRAIN, 'TWIN_BRAIN loaded');
assert(sandbox.window.TWIN_BRAIN_UI, 'TWIN_BRAIN_UI loaded');

console.log('--- TESTING TWIN BRAIN INTEGRATED HTML SIMULATION ---');

// 1. Verify Canonical Run
const parsed = sandbox.window.TWIN_BRAIN.interpretChange('We are narrowing the initial launch to low-adoption enterprise customers. Exclude accounts inactive for 90 days and remove France from the first rollout.');
assert.equal(parsed.changes.length, 3);
const config = sandbox.window.TWIN_BRAIN.mapToConfig(parsed, sandbox.window.GTM.BASE);
const analysis = sandbox.window.TWIN_BRAIN.analyzeImpact(sandbox.window.GTM.BASE, config, 'prelaunch');

assert.equal(analysis.summary.mustChangeCount, 7);
assert.equal(analysis.summary.ownerReviewCount, 4);
assert.equal(analysis.summary.unaffectedCount, 2);

console.log('PASS Canonical 13 impacts verified (7 must, 4 review, 2 unaffected)');

// 2. Verify Ambiguity Probing
const ambParsed = sandbox.window.TWIN_BRAIN.interpretChange('Only target low producers.');
assert(ambParsed.ambiguities.length > 0);
assert.match(ambParsed.ambiguities[0].issue, /“Low producers” is not defined/);
console.log('PASS Ambiguity handling verified');

// 3. Verify Plan-Reality Rendering
const pr = sandbox.window.TWIN_BRAIN_UI.renderPlanRealityMatrix(sandbox.window.GTM.BASE, config);
assert(pr.includes('96 accounts'));
assert(pr.includes('18 accounts'));
assert(pr.includes('US UK DE FR'));
assert(pr.includes('US UK DE'));
console.log('PASS Plan -> Reality view rendering verified');

// 4. Verify Explainability Modal
const whyModal = sandbox.window.TWIN_BRAIN_UI.renderExplainWhyModal('L-FR', analysis);
assert(whyModal.includes('Master Brief v1'));
assert(whyModal.includes('France Localized Pack'));
assert(whyModal.includes('8 assigned French agents'));
console.log('PASS Explainability causal chain modal verified');

// 5. Verify Presenter Tour Bar
const tourHtml = sandbox.window.TWIN_BRAIN_UI.renderTourBar(0, 5, {
  title: 'Step 1: The Business Problem',
  script: 'In enterprise GTM and product launches, a single scope change creates hidden downstream chaos.',
  nextLabel: 'Test Ambiguity Restraint'
});
assert(tourHtml.includes('Demo Step 1 of 5'));
assert(tourHtml.includes('In enterprise GTM'));
assert(tourHtml.includes('tbTourBar'));
console.log('PASS Presenter Tour Bar rendering verified');

// 6. Verify Graph Data and Blast Radius Ancestor/Descendant Traversal
const graphData = sandbox.window.TWIN_BRAIN.getGraphData(analysis);
assert(graphData.nodes.length >= 15, 'Graph contains all cascade nodes');
assert(graphData.edges.length >= 15, 'Graph contains all cascade edges');

const franceNode = graphData.nodes.find(n => n.id === 'L-FR');
assert(franceNode, 'France node exists');
const marketEdge = graphData.edges.find(e => e.to === 'L-FR' && e.from === 'MARKET_NODE');
assert(marketEdge, 'Market scope connects to France pack');
const readinessEdge = graphData.edges.find(e => e.from === 'L-FR' && e.to === 'P1');
assert(readinessEdge, 'France pack connects to P1 readiness gate');
console.log('PASS Graph Blast Radius topology verified');

console.log('\nALL TWIN-BRAIN HTML INTEGRATION TESTS PASSED!');
