// Run from the repository root. Imports public, licensed sources only.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const output = path.join(root, 'public/kids');
const data = path.join(root, 'src/components/kids/experience/catalog');
fs.mkdirSync(output, { recursive: true }); fs.mkdirSync(data, { recursive: true });
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, value) => fs.writeFileSync(p, value, 'utf8');
const json = (p, value) => write(p, JSON.stringify(value, null, 2) + '\n');
const cachePath = path.join(data, process.argv.includes('--stories') ? 'public-story-translations.json' : 'public-source-translations.json');
const translations = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};
async function translate(text, source = 'auto') {
  if (translations[text]) return translations[text];
  if (!text.trim()) return text;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const url = new URL('https://translate.googleapis.com/translate_a/single');
      for (const [key, value] of Object.entries({ client: 'gtx', sl: source, tl: 'tr', dt: 't', q: text })) url.searchParams.set(key, value);
      const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
      if (!response.ok) throw new Error('Translation HTTP ' + response.status);
      const result = await response.json();
      const translated = result[0].map(part => part[0] ?? '').join('');
      if (!translated.trim()) throw new Error('Empty translation');
      translations[text] = translated; json(cachePath, translations); return translated;
    } catch (error) { if (attempt === 3) throw error; await new Promise(resolve => setTimeout(resolve, 30000 * (attempt + 1))); }
  }
}
async function translateBatch(values, source = 'auto') {
  const missing = [...new Set(values)].filter(value => value.trim() && !translations[value]);
  while (missing.length) {
    const batch = []; let length = 0;
    while (missing.length && batch.length < 24 && length + missing[0].length < 3500) { const value = missing.shift(); batch.push(value); length += value.length + 30; }
    if (!batch.length) batch.push(missing.shift());
    const marked = batch.map((value, index) => `[[LIFEOS${index}]]\n${value}`).join('\n');
    const result = await translate(marked, source);
    const pieces = [...result.matchAll(/\[\[\s*LIFEOS\s*(\d+)\s*\]\]\s*([\s\S]*?)(?=\[\[\s*LIFEOS|$)/gi)];
    if (pieces.length !== batch.length || pieces.some((piece, index) => Number(piece[1]) !== index || !piece[2].trim())) throw new Error('Translation boundaries changed; review required.');
    pieces.forEach((piece, index) => { translations[batch[index]] = piece[2].trim(); });
    delete translations[marked]; json(cachePath, translations);
    console.log('Translated batch:', batch.length, 'remaining:', missing.length);
    await new Promise(resolve => setTimeout(resolve, 6000));
  }
}

const gameIds = `bowling mini-golf penalty-kick ring-toss ball-throw jump-rope-rhythm bicycle-balance stone-balance-walk kite-fly paper-airplane-fly paper-boat-sail train-track balance-tower tower-rings tangram-puzzle jigsaw-mini slide-puzzle rabbit-maze marble-roll domino-chain shadow-match spot-difference hidden-object-hunt sock-match fruit-pair memory-match color-memory memory-sequence fruit-match face-match star-connect constellation-draw shadow-puppet paper-fold-lab castle-builder build-snowman cake-decor pizza-maker ice-cream-scoop cotton-candy juice-pour-party pretended-placeholder pretend-play pet-feed dog-walk teddy-dress dinosaur-tap hatch-egg caterpillar-feed vegetable-garden watering-plant mushroom-pick carrot-pull butterfly-garden bee-pollen honey-drip acorn-squirrel frog-jump dolphin-jump penguin-slide snail-race cloud-jump bounce-ball balloon-pop bubble-wrap soap-bubble-catch firefly-catch clover-find dandelion magic-wand lantern-float fireworks-tap color-piano percussion-band drum-beat beat-animals rhythm-touch-beat piano-tiles rhythm-tap top-spin-duel ddakji-flip jegi-kick gonggi-nori sabangchigi-hop magnet-fish fish-catch ice-fishing squid-catch pearl-diver treasure-dive ocean-cleanup recycle-rescue space-garbage-collector laundry-sort fridge-sort sandwich-order burger-stack sushi-conveyor robot-pet-grooming panda-bamboo-wind-chime sea-turtle-coral-reef-swim otter-stream-pebble-skip lumi-dew-garden woodland-marble-slide train-ticket-stamp robot-game`.split(' ').filter(id => !['pretended-placeholder', 'rhythm-tap', 'color-memory', 'robot-game', 'lumi-dew-garden', 'woodland-marble-slide'].includes(id));
if (gameIds.length !== 100) throw new Error('Expected 100 curated games, received ' + gameIds.length);
async function importGames() {
  const source = JSON.parse(read('.tmp-kids-games/games.json'));
  const selected = gameIds.map(id => { const game = source.find(g => g.id === id); if (!game) throw new Error('Missing game ' + id); return game; });
  const folder = path.join(output, 'games'); fs.mkdirSync(folder, { recursive: true });
  const allStrings = new Set();
  const sources = [];
  for (const game of selected) {
    const html = read('.tmp-kids-games/' + game.path).replace(/\r\n/g, '\n');
    if (/<script[^>]+src=|<iframe|fetch\(|XMLHttpRequest|WebSocket|navigator\.geolocation|navigator\.mediaDevices/i.test(html)) throw new Error('External capability needs review: ' + game.id);
    const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
    for (const script of scripts) {
      const file = ts.createSourceFile('game.js', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
      const scan = node => { if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) && /[\uac00-\ud7af]/.test(node.text)) allStrings.add(node.text); ts.forEachChild(node, scan); };
      scan(file);
    }
    for (const match of html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '').matchAll(/>([^<>]+)</g)) if (/[\uac00-\ud7af]/.test(match[1])) allStrings.add(match[1].trim());
    allStrings.add(game.title); allStrings.add(game.description);
    sources.push({ game, html });
  }
  console.log('Public source game strings:', allStrings.size);
  if (process.argv.includes('--export-only')) json(path.join(data, 'game-missing.json'), [...allStrings].filter(text => !translations[text]));
  if (process.argv.includes('--export-only')) process.exit(0);
  // Concurrency is limited to avoid hammering the public service.
  await translateBatch([...allStrings]);
  const imported = [];
  const editorial = JSON.parse(fs.readFileSync(path.join(data, 'games-editorial.json'), 'utf8'));
  const calm = new Set('shadow-puppet castle-builder build-snowman cake-decor pizza-maker pretend-play pet-feed teddy-dress dinosaur-tap hatch-egg watering-plant balloon-pop bubble-wrap dandelion magic-wand lantern-float color-piano drum-beat piano-tiles robot-pet-grooming'.split(' '));
  for (const { game, html } of sources) {
    const edited = editorial[game.id];
    let converted = html.replace(/<html[^>]*>/i, '<html lang="tr">').replace(/<a\b[^>]*href=["'][^"']*["'][^>]*>[\s\S]*?<\/a>/gi, '');
    converted = converted.replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi, (_, attributes, script) => {
      const file = ts.createSourceFile('game.js', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
      const edits = [];
      const scan = node => {
        if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && translations[node.text]) edits.push({ start: node.getStart(file), end: node.getEnd(), value: JSON.stringify(translations[node.text]) });
        else if ((ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) && translations[node.text]) {
          const value = translations[node.text].replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
          edits.push({ start: node.getStart(file) + 1, end: node.getEnd() - (ts.isTemplateTail(node) ? 1 : 2), value });
        }
        ts.forEachChild(node, scan);
      }; scan(file);
      for (const edit of edits.sort((a, b) => b.start - a.start)) script = script.slice(0, edit.start) + edit.value + script.slice(edit.end);
      script = script.replace(/\blocalStorage\b/g, 'lifeosGameStorage');
      return `<script${attributes}>${script}</script>`;
    });
    converted = converted.replace(/>([^<>]+)</g, (match, value) => translations[value.trim()] ? '>' + translations[value.trim()].replace(/&/g, '&amp;').replace(/</g, '&lt;') + '<' : match);
    converted = converted.replace(/\b(aria-label|title|alt)=(['"])([^'"]*)\2/g, (match, name, quote, value) => translations[value] ? `${name}=${quote}${translations[value].replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')}${quote}` : match);
    converted = converted.replace(/<meta\b[^>]*(?:property=["']og:|name=["']description)[^>]*>/gi, '').replace(/<button\b[^>]*onclick=["'][^>]*location\.href[^>]*>[\s\S]*?<\/button>/gi, '').replaceAll('💣','🪨').replaceAll('💀','⭐');
    converted = converted.replace(/<h1([^>]*)>[^<]*<\/h1>/g, '<h1$1>' + edited.title + '</h1>');
    converted = converted.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + edited.title + ' · LifeOS</title>');
    if (game.id === 'bowling') converted = converted.replaceAll('Grev','Tek atış').replaceAll('Yedek','İkinci atış').replaceAll('10 pinin tamamı','10 lobutun tamamı').replaceAll('10 kare','10 tur').replaceAll('10 turden','10 turdan').replace(/>Gol</g,'>Puan<').replace(/>Çerçeve</gi,'>Tur<').replace('function init() {','function init() {\n    initFrames();');
    if (game.id === 'fireworks-tap') converted = converted.replace('  resize();\n','').replace('bestVal.textContent = state.best;\n\n})();','resize();\n  bestVal.textContent = state.best;\n\n})();');
    const csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob: data:; connect-src 'none'; base-uri 'none'; form-action 'none'";
    const shim = `const lifeosGameStorage=(()=>{const data=new Map();return{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k),clear:()=>data.clear()}})();`;
    converted = converted.replace(/<head>/i, `<head><meta http-equiv="Content-Security-Policy" content="${csp}"><script>${shim}</script>`);
    // Discard any stale analytics or external navigation by isolation and CSP.
    fs.mkdirSync(path.join(folder, game.id), { recursive: true });
    write(path.join(folder, game.id, 'index.html'), converted);
    const thumb = path.join(root, '.tmp-kids-games', game.id, 'thumb.svg');
    if (fs.existsSync(thumb)) write(path.join(folder, game.id, 'thumb.svg'), fs.readFileSync(thumb, 'utf8').replace(/<text\b[^>]*>[\s\S]*?<\/text>/g, ''));
    imported.push({ id: 'open-' + game.id, title: edited.title, description: edited.description, category: 'game', ageMin: calm.has(game.id) ? 3 : 5, ageMax: 7, locale: 'tr', status: 'published', reviewed: true, reviewNote: 'MIT kaynağı, yerel dosya, dokunmatik giriş ve dış bağlantı yetenekleri incelendi. Yaş uygunluğu için ebeveyn eşliği önerilir.', gameUrl: `/kids/games/${game.id}/index.html`, image: fs.existsSync(thumb) ? `/kids/games/${game.id}/thumb.svg` : null, license: 'MIT', author: 'Jaehyun Shin', source: `https://github.com/shinjaehyun20/jangyoon-s-game/tree/main/${game.id}`, sourceCommit: execFileSync('git', ['-C', '.tmp-kids-games', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() });
  }
  fs.copyFileSync(path.join(root, '.tmp-kids-games/LICENSE'), path.join(folder, 'LICENSE.txt'));
  json(path.join(data, 'games.json'), imported); console.log('Imported games:', imported.length);
}

function storyCandidates() {
  const sourceFolder = path.join(root, '.tmp-kids-story-source/en');
  const imageReadme = read('.tmp-kids-images/README.md');
  const imageIds = new Set([...imageReadme.matchAll(/^(\d{4})\s*\|.*\|\s*CC BY\s*$/gm)].map(m => m[1]));
  const originalIndex = fs.existsSync(path.join(data, 'story-master.html')) ? fs.readFileSync(path.join(data, 'story-master.html'), 'utf8') : read('.tmp-kids-stories/INDEX.md');
  const translated = new Map(fs.readdirSync(path.join(root, '.tmp-kids-stories/tr')).filter(f => f.endsWith('.md')).map(f => [f.slice(0, 4), read('.tmp-kids-stories/tr/' + f)]));
  const candidates = [];
  for (const file of fs.readdirSync(sourceFolder)) {
    const original = read('.tmp-kids-story-source/en/' + file); const id = file.slice(0, 4);
    if (!/License:\s*\[CC-BY\]/.test(original) || !imageIds.has(id)) continue;
    const sections = original.split(/^##\s*$/m).map(s => s.trim());
    const body = sections.slice(1, -1).join(' ');
    if (body.split(/\s+/).length > 650 || sections.length < 4 || /\b(kill|killed|die|died|death|dead|blood|beat him|beat her|beat the|beaten|swallow|gun|knife|war|rape|abuse|attack|punish|slap|prison|steal|stole|drunk|witch|devil|poison|married|marry|pregnant|hiv|aids|cut off|fool|stupid|drown|chop|hunger|starv|hungry lion|eat you|eaten)\b/i.test(body)) continue;
    const meta = sections.at(-1);
    const line = originalIndex.includes('<table') ? [...originalIndex.matchAll(/<tr[\s\S]*?<\/tr>/g)].map(m => m[0]).find(l => l.includes('>' + id + '<')) ?? '' : originalIndex.split('\n').find(l => l.startsWith(id + ' |')) ?? '';
    const licenseUrl = line.match(/https:\/\/creativecommons.org\/licenses\/by\/[\d.]+\//)?.[0];
    if (!licenseUrl) continue;
    const storyUrl = line.match(/https?:\/\/africanstorybook.org\/[^"')<\s]+/)?.[0] ?? 'https://www.africanstorybook.org/';
    candidates.push({ id, title: sections[0].replace(/^#\s*/, ''), pages: sections.slice(1, -1), metadata: meta, source: storyUrl, licenseUrl, turkish: translated.get(id) ?? null });
  }
  candidates.sort((a, b) => Number(Boolean(b.turkish)) - Number(Boolean(a.turkish)) || a.pages.join(' ').length - b.pages.join(' ').length);
  json(path.join(data, 'story-candidates.json'), candidates);
  console.log('Eligible illustrated CC BY story candidates:', candidates.length);
  for (const s of candidates.slice(0, 115)) console.log(s.id, s.title, s.pages.join(' ').split(/\s+/).length, s.turkish ? 'TR' : 'EN');
}

if (process.argv.includes('--games')) await importGames();
if (process.argv.includes('--master')) {
  const response = await fetch('https://global-asp.github.io/stories/master.html');
  if (!response.ok) throw new Error('Story index unavailable');
  write(path.join(data, 'story-master.html'), await response.text());
}
if (process.argv.includes('--stories-review')) storyCandidates();

if (process.argv.includes('--stories')) {
  const candidates = JSON.parse(fs.readFileSync(path.join(data, 'story-candidates.json'), 'utf8'));
  const exclude = new Set('0180 0028 0348 0038 0322 0161 0200 0155 0196 0059 0185 0133 0338 0195 0292 0056 0171 0334 0042 0311 0022 0205 0307 0140 0035 0197 0207 0011 0229 0159 0010 0117 0106 0121 0302 0156 0210 0337 0004 0027 0111 0141 0066 0158 0324 0291 0243 0320 0122 0258 0104 0096 0098 0116 0238 0287 0043 0285 0152 0235 0278 0280 0077 0300 0357 0142 0039 0085 0187 0326 0288 0080 0239 0170 0048 0204 0214 0189 0054 0115 0221 0139 0017 0103 0270 0329'.split(' '));
  const danger = /\b(soldiers?|melt(?:ed|ing)?|burn(?:ed|ing)?|fire|fires|furious|angry|threaten(?:ed)?|scream(?:ing)?|swallowed|cruel|hunter|hunters|bleeding|ogre|sick|accident|wedding|weak man|ugly)\b/i;
  const unique = new Set();
  const selected = candidates.filter(item => {
    const words = (item.pages.join(' ').match(/\S+/g) ?? []).length;
    const normalized = item.title.toLowerCase().replace(/[^a-z ]/g, '').trim();
    if (exclude.has(item.id) || danger.test(item.title + ' ' + item.pages.join(' ')) || words < 25 || unique.has(normalized)) return false;
    unique.add(normalized); return true;
  }).slice(0, 75).filter(item => !['0284','0277','0293','0175','0182','0026','0233','0153','0335','0269'].includes(item.id));
  if (selected.length !== 65) throw new Error('Not enough age-reviewed illustrated stories: ' + selected.length);
  json(path.join(data, 'story-selection.json'), selected);
  if (process.argv.includes('--selection-only')) process.exit(0);
  console.log('Selected illustrated stories:', selected.length);
  execFileSync('git', ['-C', '.tmp-kids-images', 'sparse-checkout', 'set', ...selected.map(item => 'medium/' + item.id)], { stdio: 'inherit' });
  const results = new Array(selected.length);
  const pending = selected.filter(item => { const parsed = item.turkish?.split(/^##\s*$/m).map(section => section.trim()); return !(parsed && /License:\s*\[CC-BY\]/.test(parsed.at(-1)) && parsed.length - 2 === item.pages.length); });
  await translateBatch(pending.flatMap(item => [item.title, ...item.pages.map(page => page.replace(/\s+/g, ' ').trim())]), 'en');
  let next = 0;
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (next < selected.length) {
      const index = next++; const item = selected[index];
      const originalFile = fs.readdirSync(path.join(root, '.tmp-kids-story-source/en')).find(file => file.startsWith(item.id + '_'));
      const parsed = item.turkish?.split(/^##\s*$/m).map(section => section.trim());
      const originalMeta = item.metadata;
      const turkishValid = !translations[item.title] && parsed && /License:\s*\[CC-BY\]/.test(parsed.at(-1)) && parsed.length - 2 === item.pages.length;
      const title = turkishValid ? parsed[0].replace(/^#\s*/, '') : await translate(item.title, 'en');
      const meta = turkishValid ? parsed.at(-1) : originalMeta;
      const text = turkishValid ? parsed.slice(1, -1) : await Promise.all(item.pages.map(page => translate(page.replace(/\s+/g, ' ').trim(), 'en')));
      if (item.id === '0356') text[text.length - 1] = 'Resme dikkatlice bakalım. Sopayı sen görebiliyor musun?';
      const sourceImages = path.join(root, '.tmp-kids-images/medium', item.id);
      const images = fs.readdirSync(sourceImages).filter(name => /^\d+\.jpg$/.test(name)).sort();
      if (images.length < text.length) throw new Error('Missing story pages: ' + item.id);
      const destination = path.join(output, 'stories', item.id); fs.mkdirSync(destination, { recursive: true });
      // The imagebank numbers include a cover first; the final N images illustrate N text pages.
      const pageImages = images.slice(-text.length);
      for (const name of images) fs.copyFileSync(path.join(sourceImages, name), path.join(destination, name));
      const metadataValue = (pattern, value = originalMeta) => value.match(pattern)?.[1]?.trim() ?? '';
      results[index] = { id: 'asb-' + item.id, title, description: 'Resimli kısa hikâye · Birlikte okuma', category: 'story', ageMin: text.join(' ').length > 1200 ? 5 : 3, ageMax: 7, locale: 'tr', status: 'published', reviewed: true, reviewNote: 'Kaynak metin ve eser lisansı incelendi; savaş, şiddet, tehdit ve ürkütücü olay içeren adaylar elendi. Birlikte okuma için seçildi. Türkçe uyarlamada bazı ifadeler sadeleştirildi ve değiştirildi; uzman gelişim değerlendirmesi değildir.',
        image: `/kids/stories/${item.id}/${images[0]}`, pages: text.map((page, i) => ({ text: page.replace(/\s+/g, ' ').trim(), image: `/kids/stories/${item.id}/${pageImages[i]}` })),
        license: item.licenseUrl.includes('/4.0/') ? 'CC BY 4.0' : 'CC BY 3.0', licenseUrl: item.licenseUrl, author: metadataValue(/\* Text:\s*(.+)/), illustrator: metadataValue(/\* Illustration:\s*(.+)/), translator: turkishValid ? metadataValue(/\* (?:Translation|Translated By):\s*(.+)/, meta) : 'LifeOS · Türkçe uyarlama (bazı ifadeler sadeleştirildi ve güvenli örneklere uyarlandı)', source: item.source.replace(/^http:/, 'https:'),
        sourceCommit: execFileSync('git', ['-C', '.tmp-kids-story-source', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      };
      fs.copyFileSync(path.join(root, '.tmp-kids-story-source/en', originalFile), path.join(destination, 'source.md'));
      console.log('Story ready:', index + 1, item.id, title);
    }
  }));
  json(path.join(data, 'stories-imported.json'), results);
  write(path.join(output, 'stories/NOTICE.txt'), 'African Storybook / Global ASP. Each book retains its author, illustrator, translator, exact CC BY license and source URL in the LifeOS story credit panel. English source.md is retained alongside each book. Machine-translated books are marked in their credits. Images: https://github.com/global-asp/asp-imagebank. Text: https://github.com/global-asp/asp-source. Turkish translations: https://github.com/global-asp/global-asp.\n');
}
