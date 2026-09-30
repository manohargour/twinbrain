const fs = require('fs'), vm = require('vm'), assert = require('assert/strict'), path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'output/Twin-Brain.html'), 'utf8');

// Extract engine
const engineMatch = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
assert(engineMatch, 'Engine script tag found in Twin-Brain.html');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(engineMatch[1], sandbox);

// Load Twin Brain Core
const coreCode = fs.readFileSync(path.join(root, 'src/twin-brain-core.js'), 'utf8');
vm.runInContext(coreCode, sandbox);

const g = sandbox.window.GTM;
const tb = sandbox.window.TWIN_BRAIN;

assert(g, 'GTM exists on window');
assert(tb, 'TWIN_BRAIN exists on window');

console.log('--- RUNNING TWIN BRAIN INTELLIGENCE TESTS ---');

let tests = 0;
function test(name, fn) {
  fn();
  tests++;
  console.log('PASS ' + name);
}

// 1. Natural Language Interpretation
test('Gemini interpreter parses canonical change prompt', () => {
  const prompt = "We are narrowing the initial launch to low-adoption enterprise customers. Exclude accounts inactive for 90 days and remove France from the first rollout.";
  const parsed = tb.interpretChange(prompt);
  
  assert.equal(parsed.requires_confirmation, true);
  assert.equal(parsed.ambiguities.length, 0);
  assert(parsed.changes.some(c => c.type === 'audience_filter' && c.field === 'adoption' && c.value === true));
  assert(parsed.changes.some(c => c.type === 'audience_filter' && c.field === 'inactive_days' && c.value === 90));
  assert(parsed.changes.some(c => c.type === 'market_scope' && c.operation === 'remove' && c.value === 'FR'));
  
  const mapped = tb.mapToConfig(parsed, g.BASE);
  assert.equal(mapped.audience, 'low');
  assert.equal(mapped.excludeChurn, true);
  assert.equal(mapped.markets.slice().sort().join(','), 'DE,UK,US');
});

// 2. Ambiguity Detection & Clarification
test('Gemini interpreter detects ambiguous "low producers" and requests clarification', () => {
  const prompt = "Only target low producers.";
  const parsed = tb.interpretChange(prompt);
  
  assert(parsed.ambiguities.length > 0);
  const amb = parsed.ambiguities[0];
  assert.match(amb.issue, /“Low producers” is not defined/i);
  assert.match(amb.potential_definition, /active seats \/ licensed seats < 20%/i);
  assert.equal(parsed.requires_confirmation, true);
});

// 3. Structured Proposed Change Format
test('Interpretation matches Section 4 schema exactly', () => {
  const prompt = "We are narrowing the initial launch to low-adoption enterprise customers. Exclude accounts inactive for 90 days and remove France from the first rollout.";
  const parsed = tb.interpretChange(prompt);
  
  assert(typeof parsed.change_summary === 'string');
  assert(Array.isArray(parsed.changes));
  assert(parsed.changes.every(c => c.type && c.operation && typeof c.confidence === 'number'));
});

// 4. Unified Project Context
test('Unified project context contains normalized structure (Section 7)', () => {
  const ctx = tb.getProgramContext();
  assert(ctx.program && ctx.program.id);
  assert(Array.isArray(ctx.artifacts) && ctx.artifacts.length >= 12);
  assert(Array.isArray(ctx.markets) && ctx.markets.length === 4);
  assert(Array.isArray(ctx.owners) && ctx.owners.length > 0);
  assert(Array.isArray(ctx.dependencies) && ctx.dependencies.length > 0);
  assert(Array.isArray(ctx.approvals));
  assert(Array.isArray(ctx.readiness));
  assert(Array.isArray(ctx.versions));
  
  // Check artifact schema
  const a1 = ctx.artifacts.find(a => a.id === 'A1');
  assert(a1.team && a1.owner && a1.version && a1.content);
  assert(a1.source && a1.source.type);
});

// 5. Impact Categorization (Section 8 & 9)
test('Impact classification correctly isolates Must Change, Owner Review, and Unaffected', () => {
  const prompt = "We are narrowing the initial launch to low-adoption enterprise customers. Exclude accounts inactive for 90 days and remove France from the first rollout.";
  const parsed = tb.interpretChange(prompt);
  const config = tb.mapToConfig(parsed, g.BASE);
  const analysis = tb.analyzeImpact(g.BASE, config, 'prelaunch');
  
  // Executive summary counts
  assert(analysis.summary.totalImpacts >= 10);
  assert(analysis.summary.mustChangeCount >= 5);
  assert(analysis.summary.ownerReviewCount >= 3);
  assert(analysis.summary.unaffectedCount >= 2);
  
  // Must change items
  const mustIds = analysis.items.filter(i => i.category === 'MUST_CHANGE').map(i => i.id);
  assert(mustIds.includes('A1'), 'A1 Audience Definition must change');
  assert(mustIds.includes('G3'), 'G3 Assignment & suppression must change');
  assert(mustIds.includes('L-FR'), 'France enablement pack must change (retire)');
  
  // Owner review items
  const reviewIds = analysis.items.filter(i => i.category === 'OWNER_REVIEW').map(i => i.id);
  assert(reviewIds.includes('A2'), 'A2 Measurement plan needs owner review');
  const a2 = analysis.items.find(i => i.id === 'A2');
  assert(!a2.reason.toLowerCase().includes('experiment is invalid'), 'Must not claim experiment is invalid');
  assert(a2.reason.toLowerCase().includes('review') || a2.action.toLowerCase().includes('review'), 'Must require review');
  
  // Unaffected items
  const unaffectedIds = analysis.items.filter(i => i.category === 'UNAFFECTED').map(i => i.id);
  assert(unaffectedIds.includes('P2'), 'P2 Product claims unaffected');
  assert(unaffectedIds.includes('A3'), 'A3 Event contract unaffected');
});

// 6. Plan -> Reality Comparison (Section 12)
test('Plan to Reality matrix accurately computes before/after state', () => {
  const prompt = "We are narrowing the initial launch to low-adoption enterprise customers. Exclude accounts inactive for 90 days and remove France from the first rollout.";
  const parsed = tb.interpretChange(prompt);
  const config = tb.mapToConfig(parsed, g.BASE);
  const matrix = tb.computePlanRealityMatrix(g.BASE, config);
  
  const audienceRow = matrix.find(r => r.metric.includes('Audience'));
  assert.equal(audienceRow.before, '96 accounts');
  assert.equal(audienceRow.after, '18 accounts'); // 24 total low-adoption, minus 6 from France = 18 in active markets
  
  const marketsRow = matrix.find(r => r.metric.includes('Markets'));
  assert.equal(marketsRow.before, 'US UK DE FR');
  assert.equal(marketsRow.after, 'US UK DE');
  
  const franceRow = matrix.find(r => r.metric.includes('France'));
  assert.equal(franceRow.before, 'Active');
  assert.match(franceRow.after, /Retire/i);
});

// 7. Explainability "Show Why" (Section 14)
test('Explainability generates causal chain for France, Measurement, and Product Claims', () => {
  const prompt = "We are narrowing the initial launch to low-adoption enterprise customers. Exclude accounts inactive for 90 days and remove France from the first rollout.";
  const parsed = tb.interpretChange(prompt);
  const config = tb.mapToConfig(parsed, g.BASE);
  const analysis = tb.analyzeImpact(g.BASE, config, 'prelaunch');
  
  // France enablement explanation
  const frExplanation = tb.explainWhy('L-FR', analysis);
  assert(frExplanation.chain.length >= 3);
  assert(frExplanation.chain.some(step => step.toLowerCase().includes('france') || step.toLowerCase().includes('market')));
  
  // Measurement explanation
  const a2Explanation = tb.explainWhy('A2', analysis);
  assert(a2Explanation.chain.length >= 3);
  assert(a2Explanation.chain.some(step => step.toLowerCase().includes('population') || step.toLowerCase().includes('sample') || step.toLowerCase().includes('power')));
  
  // Product claims explanation
  const p2Explanation = tb.explainWhy('P2', analysis);
  assert(p2Explanation.chain.some(step => step.toLowerCase().includes('independent') || step.toLowerCase().includes('unaffected') || step.toLowerCase().includes('prerequisite')));
});

console.log(`\nALL ${tests} TWIN BRAIN TESTS PASSED!`);
