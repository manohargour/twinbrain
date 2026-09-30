const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const simPath = path.join(root, 'output/gtm-change-simulator.html');
let simHtml = fs.readFileSync(simPath, 'utf8');

const core = fs.readFileSync(path.join(root, 'src/twin-brain-core.js'), 'utf8');

const startMarker = '// --- TWIN BRAIN INTELLIGENCE MODULE ---';
const endMarker = '</script>';

if (simHtml.includes(startMarker)) {
  const before = simHtml.substring(0, simHtml.indexOf(startMarker));
  const after = simHtml.substring(simHtml.indexOf(endMarker, simHtml.indexOf(startMarker)));
  simHtml = `${before}${startMarker}\n${core}\n${after}`;
} else {
  const engineRegex = /(<script id="engine">[\s\S]*?window\.GTM=\{[\s\S]*?\};)([\s\S]*?)(<\/script>)/;
  simHtml = simHtml.replace(engineRegex, `$1\n\n${startMarker}\n${core}\n$3`);
}

fs.writeFileSync(simPath, simHtml, 'utf8');
console.log('Successfully refreshed TWIN_BRAIN in output/gtm-change-simulator.html');
