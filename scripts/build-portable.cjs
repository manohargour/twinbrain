// Generate a portable, progressively enhanced artifact from the authored simulator.
// No network or model calls. Essential programme and team detail render without JavaScript.
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'output/gtm-change-simulator.html'),'utf8');
const app={innerHTML:''};
const document={getElementById:id=>id==='app'?app:null,querySelectorAll:()=>[]};
const sandbox={window:{scrollTo:()=>{}},document,console};vm.createContext(sandbox);
for(const id of ['engine','ui']){const m=source.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)<\\/script>'));vm.runInContext(m[1],sandbox);}
const staticBody=vm.runInContext('gtmMotionPage()+programme()+work()',sandbox);
const banner='<section class="notice"><strong>Preview mode:</strong> the full GTM motion (Step 0), programme charter (Step 1), and team work (Step 2) are readable below. For the interactive change simulator, download this HTML file and open it in Chrome or Safari. Interactive controls require JavaScript; state resets on reload unless exported.</section>';
const target=source.replace('<main class="shell" id="app"></main>','<main class="shell" id="app">'+banner+staticBody+'</main>');
if(target===source)throw new Error('Source main placeholder not found');
fs.writeFileSync(path.join(root,'output/GTM-Change-Lab.html'),target);
console.log('Generated portable HTML with static GTM motion, programme and all team artifacts.');
