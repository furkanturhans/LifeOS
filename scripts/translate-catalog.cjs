// Build-time only: the application never sends text to a translation service.
const fs = require('node:fs');
const ts = require('typescript');
function readExport(file, name) {
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = { exports: {} };
  new Function('exports', 'module', js)(mod.exports, mod);
  return mod.exports[name];
}
const book = readExport('src/lib/i18n/phrasebook.ts', 'PHRASE_BOOK');
const dictionaries = readExport('src/lib/i18n/translations.ts', 'translations');
const languages = Object.keys(dictionaries).filter(l => l !== 'tr');
let sources = JSON.parse(fs.readFileSync('src/lib/i18n/source-phrases.json', 'utf8'));
const output = 'src/lib/i18n/catalog.json';
const catalog = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : {};
if (process.argv.includes('--existing-only')) sources = sources.filter(source => Object.hasOwn(catalog, source));
function flatten(base, target) {
  for (const key in base) {
    if (typeof base[key] === 'string') target.push([base[key], key]);
    else flatten(base[key], target);
  }
}
function merge(base, translated, lang) {
  for (const key in base) {
    if (typeof base[key] === 'string') {
      (catalog[base[key]] ||= {})[lang] = translated[key];
    } else merge(base[key], translated[key], lang);
  }
}
for (const lang of languages) merge(dictionaries.tr, dictionaries[lang], lang);
for (const [source, entries] of Object.entries(book)) Object.assign(catalog[source] ||= {}, entries);
const overrides = JSON.parse(fs.readFileSync('src/lib/i18n/overrides.json', 'utf8'));
for (const [source, entries] of Object.entries(overrides)) Object.assign(catalog[source] ||= {}, entries);
const tasks = [];
for (const lang of languages) {
  let batch = [], size = 0;
  for (const source of sources) {
    if (catalog[source]?.[lang]) continue;
    if (size + source.length > 3500 && batch.length) { tasks.push({ lang, batch }); batch = []; size = 0; }
    batch.push(source); size += source.length + 20;
  }
  if (batch.length) tasks.push({ lang, batch });
}
let next = 0, done = 0;
const save = () => {
  const temporary = output + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(catalog, null, 2) + '\n');
  fs.renameSync(temporary, output);
};
async function translate(lang, batch, attempt = 0) {
  const q = batch.length === 1 ? batch[0] : batch.map((s, i) => `⟦${i}⟧ ${s}`).join('\n');
  try {
    const url = 'https://translate.googleapis.com/translate_a/single?' + new URLSearchParams({ client: 'gtx', sl: 'tr', tl: lang, dt: 't', q });
    const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const result = data[0].map(s => s[0]).join('');
    const matches = batch.length === 1 ? [[result, '0', result]] : [...result.matchAll(/⟦\s*(\d+)\s*⟧\s*([\s\S]*?)(?=⟦\s*\d+\s*⟧|$)/g)];
    if (matches.length !== batch.length) throw new Error('Batch markers changed');
    for (const [, index, translation] of matches) {
      const source = batch[Number(index)];
      const translated = translation.trim();
      if (!translated) throw new Error('Empty translation');
      if (translated.includes('\n') || /[⟦⟧]/.test(translated)) throw new Error('Unexpected neighboring text');
      const tokens = source.match(/\{\d+\}/g) || [];
      if (tokens.some(t => !translated.includes(t))) throw new Error('Interpolation changed');
      (catalog[source] ||= {})[lang] = translated;
    }
  } catch (error) {
    if (batch.length > 1 && attempt >= 1) {
      const middle = Math.ceil(batch.length / 2);
      await translate(lang, batch.slice(0, middle));
      await translate(lang, batch.slice(middle));
    } else if (attempt < 4) {
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      return translate(lang, batch, attempt + 1);
    } else throw new Error(`${lang}: ${batch[0]}: ${error.message}`);
  }
}
async function worker() {
  while (next < tasks.length) {
    const task = tasks[next++];
    await translate(task.lang, task.batch);
    done++;
    if (done % 10 === 0) { save(); console.log(`${done}/${tasks.length} batches`); }
  }
}
console.log(`${tasks.length} batches across ${languages.length} languages`);
Promise.all(Array.from({ length: 8 }, worker)).then(() => {
  save();
  const missing = sources.flatMap(s => languages.filter(l => !catalog[s]?.[l]).map(l => `${l}: ${s}`));
  console.log(`Completed; ${missing.length} missing translations`);
  if (missing.length) process.exitCode = 1;
}).catch(e => { save(); console.error(e); process.exitCode = 1; });
