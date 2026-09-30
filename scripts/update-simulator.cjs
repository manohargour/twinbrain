const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const simPath = path.join(root, 'output/gtm-change-simulator.html');
let simHtml = fs.readFileSync(simPath, 'utf8');

const core = fs.readFileSync(path.join(root, 'src/twin-brain-core.js'), 'utf8');

const startMarker = '<!-- TWIN_BRAIN_MODULE_START -->';
const endMarker = '<!-- TWIN_BRAIN_MODULE_END -->';

if (simHtml.includes(startMarker)) {
  const p1 = simHtml.indexOf(startMarker) + startMarker.length;
  const p2 = simHtml.indexOf(endMarker);
  simHtml = simHtml.substring(0, p1) + `\n<script>\n${core}\n</script>\n` + simHtml.substring(p2);
} else {
  // Append right before </body>
  const insertion = `\n${startMarker}\n<script id="twin-brain-core">\n${core}\n</script>\n${endMarker}\n</body>`;
  simHtml = simHtml.replace('</body>', insertion);
}

fs.writeFileSync(simPath, simHtml, 'utf8');
console.log('Successfully refreshed TWIN_BRAIN in output/gtm-change-simulator.html without modifying engine script');
