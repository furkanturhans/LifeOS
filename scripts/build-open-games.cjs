const fs = require('node:fs');
const esbuild = require('esbuild');
const out='public/games/open';
fs.mkdirSync(out,{recursive:true});
esbuild.buildSync({absWorkingDir:process.cwd(),entryPoints:['./src/vendor/open-games/runtime.jsx'],outfile:`${out}/runtime.js`,tsconfigRaw:{},bundle:true,minify:true,format:'iife',jsx:'automatic',target:['es2020'],define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
for(const file of ['LICENSE','NOTICE'])fs.copyFileSync(`src/vendor/open-games/${file}`,`${out}/${file}.txt`);
for(const dependency of ['react','react-dom'])fs.copyFileSync(`node_modules/${dependency}/LICENSE`,`${out}/${dependency}-LICENSE.txt`);
fs.writeFileSync(`${out}/index.html`, `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; form-action 'none'; base-uri 'none'">
<style>html,body{margin:0;width:100%;height:100%;background:#0b1020;color:white;font-family:system-ui,sans-serif;overscroll-behavior:none}*{box-sizing:border-box}button{touch-action:manipulation;min-height:40px}#game{width:100%;min-height:100%;padding:12px 4px;display:grid;place-items:center}#game>div{width:100%;min-height:450px!important;touch-action:none}html[data-paused=true] *{animation-play-state:paused!important}html[data-paused=true] #game{pointer-events:none}button:focus-visible{outline:2px solid #64ffda}canvas{max-width:100%}</style>
</head><body><div id="game" tabindex="0"></div><script src="./runtime.js" defer></script></body></html>`,'utf8');
console.log('20 local games built; no external runtime dependencies.');
