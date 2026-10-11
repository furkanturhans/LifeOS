const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const test = require('node:test');
const catalog = JSON.parse(fs.readFileSync('src/lib/i18n/catalog.json', 'utf8'));
const overrides = JSON.parse(fs.readFileSync('src/lib/i18n/overrides.json', 'utf8'));
for (const [source, entries] of Object.entries(overrides)) Object.assign(catalog[source] ||= {}, entries);
const phrases = JSON.parse(fs.readFileSync('src/lib/i18n/source-phrases.json', 'utf8'));
const locales = ['tr', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ar', 'zh', 'ja', 'ko', 'nl', 'pl', 'sv', 'az', 'hi', 'id', 'uk', 'el'];
let activeLocale = 'tr';
let renderLocale = 'tr';
function loadRuntime() {
  const js = ts.transpileModule(fs.readFileSync('src/lib/i18n/runtime.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const store = selector => selector({ locale: renderLocale });
  store.getState = () => ({ locale: activeLocale });
  const exports = {};
  new Function('require', 'exports', js)(id => {
    if (id === 'react') return { useCallback: fn => fn };
    if (id.endsWith('useThemeStore')) return { useThemeStore: store };
    if (id === './catalog.json') return structuredClone(catalog);
    if (id === './overrides.json') return overrides;
    throw new Error(`Unexpected import: ${id}`);
  }, exports);
  return exports;
}
const { localizeText, useLocaleRender, getFormattingLocale } = loadRuntime();

test('every application phrase has a nonempty translation in all 20 languages', () => {
  const missing = [...new Set([...phrases, ...Object.keys(overrides)])].flatMap(source => locales.filter(l => l !== 'tr' && !catalog[source]?.[l]?.trim()).map(l => `${l}: ${source}`));
  assert.equal(missing.length, 0, `${missing.length} missing translations; first: ${missing.slice(0, 5).join(', ')}`);
});

test('translations contain no batch markers or neighboring paragraphs', () => {
  const errors = [];
  for (const [source, entries] of Object.entries(catalog)) {
    for (const [locale, target] of Object.entries(entries)) {
      if (/[⟦⟧]/.test(target) || (!source.includes('\n') && target.includes('\n'))) errors.push(`${locale}: ${source}`);
    }
  }
  assert.deepEqual(errors, []);
});

test('currency and identity abbreviations are invariant', () => {
  for (const locale of locales) for (const source of ['TL','TRY','USD','EUR','PIN','ID','LifeOS']) assert.equal(localizeText(source, locale), source);
});

test('every translated template preserves the complete interpolation token set', () => {
  const errors = [];
  for (const [source, entries] of Object.entries(catalog)) {
    const expected = (source.match(/\{\d+\}/g) || []).sort();
    if (!expected.length) continue;
    for (const [locale, target] of Object.entries(entries)) {
      if (JSON.stringify((target.match(/\{\d+\}/g) || []).sort()) !== JSON.stringify(expected)) errors.push(`${locale}: ${source}`);
    }
  }
  assert.deepEqual(errors, []);
});

test('switching between all locales uses canonical source copy', () => {
  for (const locale of [...locales, ...locales.toReversed()]) {
    activeLocale = renderLocale = locale;
    const translate = useLocaleRender();
    assert.equal(translate('LifeOS Akademi Merkezi'), locale === 'tr' ? 'LifeOS Akademi Merkezi' : catalog['LifeOS Akademi Merkezi'][locale]);
    assert.equal(translate('5 Bölüm'), locale === 'tr' ? '5 Bölüm' : catalog['5 Bölüm'][locale]);
    assert.equal(getFormattingLocale(), locale);
  }
});

test('render translations use the subscribed snapshot during hydration', () => {
  activeLocale = 'de';
  renderLocale = 'tr';
  const translate = useLocaleRender();
  assert.equal(translate('5 Bölüm'), '5 Bölüm');
  renderLocale = 'de';
  assert.equal(useLocaleRender()('5 Bölüm'), '5 Bereiche');
});

test('dynamic copy keeps inserted values and inline whitespace', () => {
  for (const locale of locales.filter(l => l !== 'tr')) {
    assert.equal(localizeText(' 5 Bölüm ', locale), ` ${catalog['5 Bölüm'][locale]} `);
    const source = Object.keys(catalog).find(s => s.includes('{0}') && !s.includes('{1}'));
    assert.ok(source);
    const value = source.replace('{0}', '8675309');
    const target = localizeText(value, locale);
    assert.ok(target.includes('8675309'));
    assert.ok(!target.includes('{0}'));
  }
});

test('unknown user content and non-string React children stay unchanged', () => {
  const content = 'My private note &amp; my untouched content 736251';
  const element = { type: 'span', props: { children: 'Custom note' } };
  for (const locale of locales) {
    assert.equal(localizeText(content, locale), content);
    assert.equal(localizeText(element, locale), element);
    assert.equal(localizeText(42, locale), 42);
    assert.equal(localizeText(null, locale), null);
  }
});

test('legacy English application names and canonical Turkish names share locale tables', () => {
  for (const locale of locales) {
    for (const source of ['Lifechat', 'LifeOS Connect', 'LifeOS İletişim']) assert.equal(localizeText(source, locale), 'Lifechat');
    for (const source of ['MedAI', 'Sağlık Asistanı']) assert.equal(localizeText(source, locale), 'MedAI');
  }
  const pairs = [['Kids Study','Çocuk Eğitimi'],['Kids Movie','Çocuk Filmleri'],['LifeOS Kids','LifeOS Çocuk Dünyası'],['Arcade','Oyun Merkezi'],['LifeOS Connect','LifeOS İletişim'],['MedAI','Sağlık Asistanı'],['LifeCloud','LifeOS Bulut']];
  for (const [legacy, canonical] of pairs) {
    assert.equal(localizeText(legacy, 'tr'), canonical === 'LifeOS İletişim' ? 'Lifechat' : canonical === 'Sağlık Asistanı' ? 'MedAI' : canonical);
    for (const locale of locales) assert.equal(localizeText(legacy, locale), localizeText(canonical, locale));
    assert.equal(localizeText(legacy, 'en'), legacy === 'LifeOS Connect' ? 'Lifechat' : legacy);
  }
});

test('Turkish application copy contains no legacy English application terms', () => {
  const legacy = /\b(Kids|Arcade|Connect|LifeCloud)\b|\bLifeOS AI\b/i;
  const errors = Object.keys(catalog).filter(source => legacy.test(source) && legacy.test(localizeText(source, 'tr')));
  assert.deepEqual(errors, []);
  assert.equal(localizeText("Kids Hub'a Dön", 'tr'), 'Çocuk Merkezine Dön');
  assert.equal(localizeText("Arcade'e Dön", 'tr'), 'Oyun Merkezine Dön');
  assert.equal(localizeText('Kids Movie Yaş Filtresi', 'tr'), 'Çocuk Filmleri Yaş Filtresi');
  assert.equal(localizeText('Kids Study Konu İzinleri', 'tr'), 'Çocuk Eğitimi Konu İzinleri');
  assert.equal(localizeText('İnteraktif Kart & Quiz', 'tr'), 'etkileşimli kart ve kısa test');
  assert.equal(localizeText('My note about Kids Study and Arcade', 'tr'), 'My note about Kids Study and Arcade');
});

test('typed module dictionaries match localized application names in every locale', () => {
  const js = ts.transpileModule(fs.readFileSync('src/lib/i18n/translations.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  new Function('exports', js)(exports);
  const terms = { ai:'LifeOS AI', medai:'MedAI', cloud:'LifeCloud', connect:'Connect', kids:'Kids', arcade:'Arcade' };
  for (const locale of locales) {
    for (const [module, source] of Object.entries(terms)) assert.equal(exports.translations[locale].modules[module].name, localizeText(source, locale));
  }
});
