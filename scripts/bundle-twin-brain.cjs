const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'output/Twin-Brain.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const core = fs.readFileSync(path.join(root, 'src/twin-brain-core.js'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'src/twin-brain-ui.js'), 'utf8');

// Replace core script
const coreStart = '<!-- TWIN_BRAIN_CORE_START -->';
const coreEnd = '<!-- TWIN_BRAIN_CORE_END -->';
const uiStart = '<!-- TWIN_BRAIN_UI_START -->';
const uiEnd = '<!-- TWIN_BRAIN_UI_END -->';

if (html.includes(coreStart)) {
  const p1 = html.indexOf(coreStart) + coreStart.length;
  const p2 = html.indexOf(coreEnd);
  html = html.substring(0, p1) + `\n<script>\n${core}\n</script>\n` + html.substring(p2);
} else if (html.includes('<script src="../src/twin-brain-core.js"></script>')) {
  html = html.replace('<script src="../src/twin-brain-core.js"></script>', `${coreStart}\n<script>\n${core}\n</script>\n${coreEnd}`);
} else {
  // If already inlined without markers, replace by regex matching TWIN_BRAIN definition
  html = html.replace(/<script>\s*\/\/\s*Twin Brain — Organisational Change Intelligence[\s\S]*?<\/script>/, `${coreStart}\n<script>\n${core}\n</script>\n${coreEnd}`);
}

// Replace UI script
if (html.includes(uiStart)) {
  const p1 = html.indexOf(uiStart) + uiStart.length;
  const p2 = html.indexOf(uiEnd);
  html = html.substring(0, p1) + `\n<script>\n${ui}\n</script>\n` + html.substring(p2);
} else if (html.includes('<script src="../src/twin-brain-ui.js"></script>')) {
  html = html.replace('<script src="../src/twin-brain-ui.js"></script>', `${uiStart}\n<script>\n${ui}\n</script>\n${uiEnd}`);
} else {
  html = html.replace(/<script>\s*\/\/\s*Twin Brain — UI Components & Views[\s\S]*?<\/script>/, `${uiStart}\n<script>\n${ui}\n</script>\n${uiEnd}`);
}

fs.writeFileSync(htmlPath, html, 'utf8');
const indexPath = path.join(root, 'output/index.html');
fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully bundled standalone output/Twin-Brain.html and synced to output/index.html');
